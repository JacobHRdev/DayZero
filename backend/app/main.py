from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import CORS_ORIGINS
from app.api.v1.endpoints import router as v1_router

app = FastAPI(
    title="Ignition Model Backend",
    version="0.1.0",
    description="Backend para exponer el payload del motor matemático y servir la API de front-end.",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(v1_router)


@app.get("/")
def root():
    return {"message": "Ignition backend is running"}
