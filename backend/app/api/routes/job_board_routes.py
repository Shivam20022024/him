from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List
import uuid
from datetime import datetime
from app.core.database import get_db
from app.api.deps import get_context_organization_id
from app.services.prompt_engine import PromptEngine
from app.models.job_ai_config import JobAIConfig, ScreeningQuestion
from fastapi import Depends
import asyncio

router = APIRouter(tags=["Jobs"])

class JobCreateRequest(BaseModel):
    title: str
    description: str
    skills: List[str]
    experience: str = ""
    location: str = ""
    jobType: str = ""

@router.post("/job")
async def create_job(request: JobCreateRequest, org_id: str = Depends(get_context_organization_id)):
    db = get_db()
    job_id = str(uuid.uuid4())
    job_doc = {
        "id": job_id,
        "organization_id": org_id,
        "title": request.title,
        "description": request.description,
        "skills": request.skills,
        "experience": request.experience,
        "location": request.location,
        "jobType": request.jobType,
        "createdAt": datetime.utcnow().isoformat()
    }
    await db.jobs_board.insert_one(job_doc)
    job_doc.pop('_id', None)
    
    # Generate default AI Recruiter Config in background
    async def create_default_ai_config():
        try:
            questions = await PromptEngine.generate_screening_questions(
                request.title, request.description, request.skills, request.experience
            )
            config = JobAIConfig(
                job_id=job_id,
                organization_id=org_id,
                screening_questions=[ScreeningQuestion(**q) for q in questions]
            )
            await db.job_ai_config.insert_one(config.model_dump())
        except Exception as e:
            print(f"Failed to create AI config: {e}")
            
    asyncio.create_task(create_default_ai_config())
    
    return job_doc

@router.get("/jobs")
async def list_jobs(org_id: str = Depends(get_context_organization_id)):
    db = get_db()
    jobs_cursor = db.jobs_board.find({"organization_id": org_id}).sort("createdAt", -1)
    jobs = []
    async for doc in jobs_cursor:
        doc.pop('_id', None)
        jobs.append(doc)
    return jobs

@router.get("/job/{job_id}")
async def get_job(job_id: str, org_id: str = Depends(get_context_organization_id)):
    db = get_db()
    job = await db.jobs_board.find_one({"id": job_id, "organization_id": org_id})
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    job.pop('_id', None)
    return job

@router.delete("/job/{job_id}")
async def delete_job(job_id: str, org_id: str = Depends(get_context_organization_id)):
    db = get_db()
    result = await db.jobs_board.delete_one({"id": job_id, "organization_id": org_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Job not found")
    return {"status": "success", "message": "Job deleted successfully"}
