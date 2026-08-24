from fastapi import APIRouter, Depends, HTTPException, Query
from typing import Optional, List, Dict
from datetime import datetime, timedelta
from app.core.database import get_db
from app.api.deps import get_context_organization_id
import logging
import tempfile
import os
from fastapi.responses import FileResponse

logger = logging.getLogger(__name__)
router = APIRouter(tags=["Analytics"])

def get_date_range_filter(date_range: str, custom_start: Optional[str] = None, custom_end: Optional[str] = None):
    now = datetime.utcnow()
    query = {}
    
    if date_range == "today":
        start_date = now.replace(hour=0, minute=0, second=0, microsecond=0)
        query = {"$gte": start_date}
    elif date_range == "yesterday":
        start_date = (now - timedelta(days=1)).replace(hour=0, minute=0, second=0, microsecond=0)
        end_date = now.replace(hour=0, minute=0, second=0, microsecond=0)
        query = {"$gte": start_date, "$lt": end_date}
    elif date_range == "this_week":
        start_date = (now - timedelta(days=now.weekday())).replace(hour=0, minute=0, second=0, microsecond=0)
        query = {"$gte": start_date}
    elif date_range == "last_7_days":
        start_date = (now - timedelta(days=7)).replace(hour=0, minute=0, second=0, microsecond=0)
        query = {"$gte": start_date}
    elif date_range == "this_month":
        start_date = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        query = {"$gte": start_date}
    elif date_range == "last_month":
        last_day_last_month = now.replace(day=1) - timedelta(days=1)
        start_date = last_day_last_month.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        end_date = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        query = {"$gte": start_date, "$lt": end_date}
    elif date_range == "this_quarter":
        quarter = (now.month - 1) // 3 + 1
        start_month = 3 * quarter - 2
        start_date = now.replace(month=start_month, day=1, hour=0, minute=0, second=0, microsecond=0)
        query = {"$gte": start_date}
    elif date_range == "this_year":
        start_date = now.replace(month=1, day=1, hour=0, minute=0, second=0, microsecond=0)
        query = {"$gte": start_date}
    elif date_range == "custom" and custom_start and custom_end:
        try:
            start_date = datetime.strptime(custom_start, "%Y-%m-%d")
            end_date = datetime.strptime(custom_end, "%Y-%m-%d") + timedelta(days=1)
            query = {"$gte": start_date, "$lt": end_date}
        except ValueError:
            pass

    return query

@router.get("/dashboard")
async def get_dashboard_metrics(
    job_id: Optional[str] = None, 
    date_range: str = "all",
    custom_start: Optional[str] = None,
    custom_end: Optional[str] = None,
    org_id: str = Depends(get_context_organization_id)
):
    db = get_db()
    base_match = {"organization_id": org_id}
    if job_id:
        base_match["job_id"] = job_id
        
    date_query = get_date_range_filter(date_range, custom_start, custom_end)
    if date_query:
        base_match["created_at"] = date_query

    pipeline = [
        {"$match": base_match},
        {"$group": {
            "_id": None,
            "total_candidates": {"$sum": 1},
            "screened": {"$sum": {"$cond": [{"$gt": ["$resume_score", 0]}, 1, 0]}},
            "calls_completed": {"$sum": {"$cond": [{"$eq": ["$call_status", "completed"]}, 1, 0]}},
            "interested": {"$sum": {"$cond": [{"$in": ["$status", ["interested", "interview_scheduled", "selected", "hired"]]}, 1, 0]}},
            "callback_required": {"$sum": {"$cond": [{"$eq": ["$status", "callback_required"]}, 1, 0]}},
            "not_interested": {"$sum": {"$cond": [{"$eq": ["$status", "not_interested"]}, 1, 0]}},
            "interviews": {"$sum": {"$cond": [{"$in": ["$status", ["interview_scheduled", "selected", "hired"]]}, 1, 0]}},
            "selected": {"$sum": {"$cond": [{"$in": ["$status", ["selected", "hired"]]}, 1, 0]}},
            "hired": {"$sum": {"$cond": [{"$eq": ["$status", "hired"]}, 1, 0]}}
        }}
    ]
    
    result = await db.candidates.aggregate(pipeline).to_list(1)
    
    if result:
        metrics = result[0]
        metrics.pop("_id", None)
        return metrics
    else:
        return {
            "total_candidates": 0, "screened": 0, "calls_completed": 0, 
            "interested": 0, "callback_required": 0, "not_interested": 0,
            "interviews": 0, "selected": 0, "hired": 0
        }

@router.get("/roles")
async def get_role_metrics(
    date_range: str = "all",
    custom_start: Optional[str] = None,
    custom_end: Optional[str] = None,
    org_id: str = Depends(get_context_organization_id)
):
    db = get_db()
    base_match = {"organization_id": org_id, "job_id": {"$ne": None}}
    
    date_query = get_date_range_filter(date_range, custom_start, custom_end)
    if date_query:
        base_match["created_at"] = date_query

    pipeline = [
        {"$match": base_match},
        {"$group": {
            "_id": "$job_id",
            "candidates": {"$sum": 1},
            "screened": {"$sum": {"$cond": [{"$gt": ["$resume_score", 0]}, 1, 0]}},
            "calls_completed": {"$sum": {"$cond": [{"$eq": ["$call_status", "completed"]}, 1, 0]}},
            "interested": {"$sum": {"$cond": [{"$in": ["$status", ["interested", "interview_scheduled", "selected", "hired"]]}, 1, 0]}},
            "callbacks": {"$sum": {"$cond": [{"$eq": ["$status", "callback_required"]}, 1, 0]}},
            "interviews": {"$sum": {"$cond": [{"$in": ["$status", ["interview_scheduled", "selected", "hired"]]}, 1, 0]}},
            "selected": {"$sum": {"$cond": [{"$in": ["$status", ["selected", "hired"]]}, 1, 0]}},
            "hired": {"$sum": {"$cond": [{"$eq": ["$status", "hired"]}, 1, 0]}}
        }}
    ]
    
    results = await db.candidates.aggregate(pipeline).to_list(100)
    
    # Enrich with job titles
    job_ids = [r["_id"] for r in results if r["_id"]]
    jobs_cursor = db.jobs_board.find({"id": {"$in": job_ids}})
    jobs_map = {job["id"]: job["title"] for job in await jobs_cursor.to_list(None)}
    
    enriched_results = []
    for r in results:
        if not r["_id"]: continue
        enriched_results.append({
            "job_id": r["_id"],
            "role": jobs_map.get(r["_id"], "Unknown Role"),
            "candidates": r["candidates"],
            "screened": r["screened"],
            "calls_completed": r["calls_completed"],
            "interested": r["interested"],
            "callbacks": r["callbacks"],
            "interviews": r["interviews"],
            "selected": r["selected"],
            "hired": r["hired"]
        })
        
    return enriched_results

@router.get("/trend")
async def get_trend_data(
    metric: str = "candidates", # candidates, screened, interested, interviews, hired
    job_id: Optional[str] = None, 
    date_range: str = "last_7_days",
    custom_start: Optional[str] = None,
    custom_end: Optional[str] = None,
    org_id: str = Depends(get_context_organization_id)
):
    db = get_db()
    base_match = {"organization_id": org_id}
    if job_id:
        base_match["job_id"] = job_id
        
    date_query = get_date_range_filter(date_range, custom_start, custom_end)
    if date_query:
        base_match["created_at"] = date_query
        
    pipeline = [
        {"$match": base_match},
        {
            "$project": {
                "date": {"$dateToString": {"format": "%Y-%m-%d", "date": "$created_at"}},
                "is_match": {
                    "$cond": [
                        {"$eq": [metric, "candidates"]}, 1,
                        {"$cond": [
                            {"$eq": [metric, "screened"]}, {"$cond": [{"$gt": ["$resume_score", 0]}, 1, 0]},
                            {"$cond": [
                                {"$eq": [metric, "interested"]}, {"$cond": [{"$in": ["$status", ["interested", "interview_scheduled", "selected", "hired"]]}, 1, 0]},
                                {"$cond": [
                                    {"$eq": [metric, "interviews"]}, {"$cond": [{"$in": ["$status", ["interview_scheduled", "selected", "hired"]]}, 1, 0]},
                                    {"$cond": [
                                        {"$eq": [metric, "hired"]}, {"$cond": [{"$eq": ["$status", "hired"]}, 1, 0]},
                                        0
                                    ]}
                                ]}
                            ]}
                        ]}
                    ]
                }
            }
        },
        {"$group": {
            "_id": "$date",
            "count": {"$sum": "$is_match"}
        }},
        {"$sort": {"_id": 1}}
    ]
    
    results = await db.candidates.aggregate(pipeline).to_list(100)
    
    formatted = [{"date": r["_id"], "count": r["count"]} for r in results]
    return formatted

@router.get("/export")
async def export_analytics(
    report_type: str = Query(..., description="daily, weekly, monthly, roles"),
    format: str = Query("excel", description="excel or csv"),
    date_range: str = "all",
    custom_start: Optional[str] = None,
    custom_end: Optional[str] = None,
    org_id: str = Depends(get_context_organization_id)
):
    import pandas as pd
    
    db = get_db()
    base_match = {"organization_id": org_id}
    date_query = get_date_range_filter(date_range, custom_start, custom_end)
    if date_query:
        base_match["created_at"] = date_query

    if report_type == "roles":
        base_match["job_id"] = {"$ne": None}
        pipeline = [
            {"$match": base_match},
            {"$group": {
                "_id": "$job_id",
                "Candidates": {"$sum": 1},
                "Screened": {"$sum": {"$cond": [{"$gt": ["$resume_score", 0]}, 1, 0]}},
                "Interviews": {"$sum": {"$cond": [{"$in": ["$status", ["interview_scheduled", "selected", "hired"]]}, 1, 0]}},
                "Hired": {"$sum": {"$cond": [{"$eq": ["$status", "hired"]}, 1, 0]}}
            }}
        ]
        results = await db.candidates.aggregate(pipeline).to_list(100)
        
        # Get Job Titles
        job_ids = [r["_id"] for r in results if r["_id"]]
        jobs_cursor = db.jobs_board.find({"id": {"$in": job_ids}})
        jobs_map = {job["id"]: job["title"] for job in await jobs_cursor.to_list(None)}
        
        data = []
        for r in results:
            if not r["_id"]: continue
            data.append({
                "Role": jobs_map.get(r["_id"], "Unknown Role"),
                "Candidates": r["Candidates"],
                "Screened": r["Screened"],
                "Interviews": r["Interviews"],
                "Hired": r["Hired"]
            })
    else:
        # Time-based grouping (daily, weekly, monthly)
        if report_type == "monthly":
            date_format = "%Y-%m"
        elif report_type == "weekly":
            date_format = "%Y-%U" # Year and Week number
        else:
            date_format = "%Y-%m-%d" # Daily
            
        pipeline = [
            {"$match": base_match},
            {"$group": {
                "_id": {"$dateToString": {"format": date_format, "date": "$created_at"}},
                "Candidates": {"$sum": 1},
                "Screened": {"$sum": {"$cond": [{"$gt": ["$resume_score", 0]}, 1, 0]}},
                "Interviews": {"$sum": {"$cond": [{"$in": ["$status", ["interview_scheduled", "selected", "hired"]]}, 1, 0]}},
                "Hired": {"$sum": {"$cond": [{"$eq": ["$status", "hired"]}, 1, 0]}}
            }},
            {"$sort": {"_id": 1}}
        ]
        results = await db.candidates.aggregate(pipeline).to_list(1000)
        data = [{"Period": r["_id"], "Candidates": r["Candidates"], "Screened": r["Screened"], "Interviews": r["Interviews"], "Hired": r["Hired"]} for r in results]

    df = pd.DataFrame(data) if data else pd.DataFrame(columns=["Period" if report_type != "roles" else "Role", "Candidates", "Screened", "Interviews", "Hired"])
    
    fd, temp_path = tempfile.mkstemp(suffix=f".{format}")
    os.close(fd)
    
    if format == "csv":
        df.to_csv(temp_path, index=False)
        media_type = "text/csv"
    else:
        df.to_excel(temp_path, index=False)
        media_type = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        format = "xlsx"
        
    filename = f"hireonomous_report_{report_type}.{format}"
    return FileResponse(path=temp_path, filename=filename, media_type=media_type)
