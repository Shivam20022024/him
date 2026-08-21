from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.routes import resume_routes, voice_routes, demo_voice_routes, simulation_routes, email_routes, job_board_routes, bolna_routes, auth_routes, superadmin_routes
from app.core.database import connect_to_mongo, close_mongo_connection
from app.core.config import settings

app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="Production-ready AI Hiring Automation Pipeline"
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Lifecycle events
@app.on_event("startup")
async def startup_db_client():
    print(f"Starting {settings.APP_NAME} v{settings.APP_VERSION}...")
    print(f"DEBUG: Connecting to database defined in .env.local...")
    await connect_to_mongo()
    print(f"API is ready on port 8001")


@app.on_event("shutdown")
async def shutdown_db_client():
    await close_mongo_connection()

# Routes
app.include_router(auth_routes.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(superadmin_routes.router, prefix="/api/superadmin", tags=["Super Admin"])
app.include_router(resume_routes.router, tags=["Resume Analysis"])
# app.include_router(demo_voice_routes.router, tags=["Demo Voice Interaction"])
app.include_router(bolna_routes.router, tags=["Bolna Integration"])
# app.include_router(simulation_routes.router, tags=["System Simulation"])
app.include_router(email_routes.router, tags=["Email Interaction"])
app.include_router(job_board_routes.router, tags=["Job Board Interaction"])


@app.get("/")
async def root():
    return {
        "message": "Welcome to the AI Hiring Automation Pipeline API",
        "api_docs": "/docs"
    }

@app.get("/health")
async def health_check():
    return {
        "status": "ok"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8001, reload=True)
