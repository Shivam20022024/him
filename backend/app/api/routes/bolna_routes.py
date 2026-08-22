from fastapi import APIRouter, HTTPException, Request
from app.services.bolna_service import BolnaService
from app.core.database import get_db
import logging
from datetime import datetime
from pydantic import BaseModel
from typing import Optional

class BolnaCallbackRequest(BaseModel):
    candidate_id: str
    callback_date: str
    callback_time: str
    callback_notes: Optional[str] = ""

router = APIRouter(prefix="/bolna", tags=["Bolna Integration"])
logger = logging.getLogger(__name__)

@router.post("/call-candidate/{candidate_id}")
async def call_candidate(candidate_id: str):
    """Initiates a Bolna.ai call for a specific candidate."""
    db = get_db()
    
    candidate = await db.candidates.find_one({"id": candidate_id})
    if not candidate:
        candidate = await db.candidates.find_one({"name": {"$regex": candidate_id.replace("-", " "), "$options": "i"}})

    if not candidate:
        raise HTTPException(status_code=404, detail="Candidate not found")

    phone_number = candidate.get("phone")
    if not phone_number:
        raise HTTPException(status_code=400, detail="Candidate missing phone number")

    try:
        call_result = await BolnaService.initiate_bolna_call(
            candidate_id=candidate_id, 
            phone_number=phone_number,
            candidate_name=candidate.get("name", ""),
            job_title=candidate.get("role", "Candidate")
        )
        
        if call_result["status"] != "success":
            raise Exception(call_result.get("message", "Bolna API failure"))

        data = call_result.get("data", {})
        bolna_call_id = data.get("call_id") or data.get("execution_id") or data.get("id") or data.get("executionId")
        
        await db.candidates.update_one(
            {"id": candidate_id},
            {"$set": {
                "status": "calling",
                "shortlisted": True,
                "bolna_call_id": bolna_call_id,
                "bolna_integrated": True,
                "call_started_at": datetime.utcnow(),
                "startedAt": datetime.utcnow().isoformat(),
                "last_interaction": datetime.utcnow(),
                "job_role": candidate.get("role") or "Candidate"
            }}
        )

        
        return {"status": "success", "call_id": bolna_call_id, "candidate": candidate["name"]}
    except Exception as e:
        logger.error(f"Failed to initiate Bolna call: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Bolna error: {str(e)}")

@router.post("/call-shortlisted")
async def call_shortlisted():
    """Initiates Bolna.ai calls for all shortlisted candidates."""
    db = get_db()
    shortlisted = await db.candidates.find({"resume_score": {"$gte": 70}, "status": {"$ne": "calling"}}).to_list(length=100)
    
    called_ids = []
    for candidate in shortlisted:
        try:
            phone = candidate.get("phone")
            if phone:
                res = await BolnaService.initiate_bolna_call(
                    candidate_id=candidate["id"], 
                    phone_number=phone,
                    candidate_name=candidate.get("name", ""),
                    job_title=candidate.get("role", "Candidate")
                )
                if res["status"] == "success":
                    called_ids.append(candidate["id"])
                    await db.candidates.update_one(
                        {"id": candidate["id"]},
                        {"$set": {
                            "status": "calling", 
                            "shortlisted": True,
                            "bolna_call_id": res["data"].get("call_id") or res["data"].get("execution_id") or res["data"].get("id"),
                            "call_started_at": datetime.utcnow(),
                            "startedAt": datetime.utcnow().isoformat(),
                            "last_interaction": datetime.utcnow(),
                            "job_role": candidate.get("role") or "Candidate"
                        }}
                    )

        except Exception as e:
            logger.error(f"Failed to call {candidate['id']}: {str(e)}")

    return {"status": "success", "called_count": len(called_ids), "called_ids": called_ids}

@router.post("/webhook")
async def bolna_webhook(request: Request):
    """Receives results from Bolna.ai."""
    try:
        payload = await request.json()
        logger.info("Received Bolna Webhook")
        result = await BolnaService.process_webhook_payload(payload)
        return result
    except Exception as e:
        logger.error(f"Bolna Webhook Error: {str(e)}")
        return {"status": "error", "message": str(e)}

@router.post("/callback")
async def bolna_callback_request(payload: BolnaCallbackRequest):
    """Handles mid-conversation callback requests from Bolna Custom Functions."""
    try:
        if not payload.candidate_id or not payload.callback_date or not payload.callback_time:
            raise HTTPException(status_code=400, detail="Missing required callback fields")
            
        result = await BolnaService.handle_callback_request(payload)
        if not result.get("success"):
            raise HTTPException(status_code=404, detail="Candidate not found")
            
        return {"success": True, "status": "callback_required"}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Bolna Callback Error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/sync-call/{candidate_id}")
async def sync_candidate_call(candidate_id: str):
    """Manually syncs call data for a specific candidate from Bolna API."""
    return await BolnaService.fetch_bolna_call_details(candidate_id)

@router.post("/save-call-result/{candidate_id}")
async def save_call_result(candidate_id: str):
    """Manually triggers Excel storage for a candidate's call results."""
    db = get_db()
    candidate = await db.candidates.find_one({"id": candidate_id})
    if not candidate:
        raise HTTPException(status_code=404, detail="Candidate not found")
    
    from app.services.excel_service import ExcelService
    success = ExcelService.save_call_result_to_excel(candidate)
    
    return {"status": "success" if success else "error", "message": "Result saved to Excel" if success else "Failed to save to Excel"}

