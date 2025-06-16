from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.endpoints import game
from app.core.config import settings

app = FastAPI(
    title="ConvinceAI Game Backend",
    # Disable FastAPI's default docs in production
    docs_url=None if settings.ENVIRONMENT == "prod" else "/docs",
    redoc_url=None if settings.ENVIRONMENT == "prod" else "/redoc"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(game.router, prefix="/api/v1", tags=["game"])

@app.get("/")
def read_root():
    return {"status": "ok", "environment": settings.ENVIRONMENT}
