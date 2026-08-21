from fastapi import APIRouter, Depends, HTTPException, status
from typing import List, Dict
from app.core.database import get_db
from app.models.user import UserInDB, Organization, OrganizationCreate, UserCreate
from app.api.deps import require_super_admin
from app.core.auth import get_password_hash
from pydantic import BaseModel
from bson import ObjectId

class CreateCompanyRequest(BaseModel):
    company_name: str
    admin_name: str
    admin_email: str
    admin_password: str

router = APIRouter()

@router.get("/stats")
async def get_global_stats(current_user: UserInDB = Depends(require_super_admin)):
    db = get_db()
    
    total_companies = await db["organizations"].count_documents({})
    active_companies = await db["organizations"].count_documents({"status": "active"})
    suspended_companies = await db["organizations"].count_documents({"status": "suspended"})
    
    total_users = await db["users"].count_documents({})
    total_jobs = await db["jobs_board"].count_documents({})
    total_candidates = await db["candidates"].count_documents({})
    total_calls = await db["calls"].count_documents({})
    
    # Calculate call minutes (if duration_seconds exists)
    pipeline = [
        {"$group": {"_id": None, "total_seconds": {"$sum": "$duration_seconds"}}}
    ]
    cursor = db["calls"].aggregate(pipeline)
    call_duration_result = await cursor.to_list(length=1)
    
    total_call_minutes = 0
    if call_duration_result and call_duration_result[0].get("total_seconds"):
        total_call_minutes = round(call_duration_result[0]["total_seconds"] / 60)
        
    return {
        "total_companies": total_companies,
        "active_companies": active_companies,
        "suspended_companies": suspended_companies,
        "total_users": total_users,
        "total_jobs": total_jobs,
        "total_candidates": total_candidates,
        "total_calls": total_calls,
        "total_call_minutes": total_call_minutes
    }

@router.get("/companies")
async def get_all_companies(current_user: UserInDB = Depends(require_super_admin)):
    db = get_db()
    companies = []
    
    # Find all organizations
    cursor = db["organizations"].find().sort("created_at", -1)
    async for org in cursor:
        org_id = org["id"]
        
        # Get usage stats for this organization
        users_count = await db["users"].count_documents({"organization_id": org_id})
        jobs_count = await db["jobs_board"].count_documents({"organization_id": org_id})
        candidates_count = await db["candidates"].count_documents({"organization_id": org_id})
        
        companies.append({
            "id": org_id,
            "name": org.get("name"),
            "status": org.get("status"),
            "created_at": org.get("created_at"),
            "stats": {
                "users": users_count,
                "jobs": jobs_count,
                "candidates": candidates_count
            }
        })
        
    return companies

@router.post("/companies")
async def create_company(request: CreateCompanyRequest, current_user: UserInDB = Depends(require_super_admin)):
    db = get_db()
    
    # Check if user already exists
    existing_user = await db["users"].find_one({"email": request.admin_email})
    if existing_user:
        raise HTTPException(status_code=400, detail="User with this email already exists")
        
    # Create Organization
    org_data = Organization(name=request.company_name, status="active").dict()
    await db["organizations"].insert_one(org_data)
    org_id = org_data["id"]
    
    # Create Admin User
    hashed_password = get_password_hash(request.admin_password)
    user_data = UserInDB(
        name=request.admin_name,
        email=request.admin_email,
        role="ORGANIZATION_ADMIN",
        organization_id=org_id,
        hashed_password=hashed_password
    ).dict()
    
    await db["users"].insert_one(user_data)
    
    # Remove ObjectId for JSON serialization
    org_data.pop("_id", None)
    
    return {
        "success": True,
        "organization": org_data,
        "admin_user": {
            "email": request.admin_email,
            "name": request.admin_name
        }
    }
