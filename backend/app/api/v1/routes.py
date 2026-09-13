from fastapi import APIRouter
from fastapi.responses import JSONResponse

from app.services.dataset_service import DatasetService
from app.services.model_service import ModelService
from app.services.generator_service import GeneratorService

router = APIRouter(prefix="/api")


@router.get("/health")
def health_check():
    return {
        "status": "ok",
        "service": "ignition-backend",
        "dataset_rows": len(DatasetService.load_dataset()),
    }


@router.get("/ignition")
def get_ignition():
    payload = ModelService().forecast()
    return JSONResponse(content=payload)


@router.get("/generate")
def generate_payload(account_id: str = "5a1b0e4e4f523604900000002"):
    payload = GeneratorService().generate(account_id)
    return JSONResponse(content=payload)
