from fastapi import APIRouter, HTTPException

from app.core.config import settings
from app.core.database import get_db
from app.services.email_service import EmailService

from app.api.deps import get_context_organization_id
from fastapi import Depends

router = APIRouter(prefix="/email")

@router.post("/send-shortlisted")
async def send_shortlisted_emails(org_id: str = Depends(get_context_organization_id)):
    if not EmailService.is_configured():
        raise HTTPException(
            status_code=500,
            detail=(
                "SMTP is not configured. Please set SMTP_HOST, SMTP_PORT, SMTP_USER, "
                "SMTP_PASSWORD, and SMTP_FROM_EMAIL in backend/.env.local."
            ),
        )

    db = get_db()
    
    # Fetch actual company name
    org = await db.organizations.find_one({"id": org_id})
    company_name = org.get("name") if org else "Our Company"
    
    cursor = db.candidates.find(
        {"resume_score": {"$gte": settings.SHORTLIST_THRESHOLD}, "organization_id": org_id},
        {"_id": 0},
    ).sort("created_at", -1)
    candidates = await cursor.to_list(length=500)

    if not candidates:
        return {
            "status": "success",
            "message": "No shortlisted candidates found.",
            "sent": 0,
            "skipped": 0,
            "failed": 0,
            "errors": [],
        }

    result = EmailService.send_bulk_shortlist_emails(candidates, company_name)

    # Update email_sent flag in DB for successful candidates
    if result.get("sent_ids"):
        await db.candidates.update_many(
            {"id": {"$in": result["sent_ids"]}},
            {"$set": {"email_sent": True}}
        )

    return {
        "status": "success",
        "message": (
            f"Email processing finished. Sent: {result['sent']}, "
            f"Skipped: {result['skipped']}, Failed: {result['failed']}."
        ),
        **result,
    }
