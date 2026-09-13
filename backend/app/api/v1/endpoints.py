from fastapi import APIRouter, Query
from fastapi.responses import JSONResponse

from app.services.dataset_service import DatasetService
from app.services.model_service import ModelService
from app.services.generator_service import GeneratorService

router = APIRouter()


@router.get("/api/health")
def health_check():
    return {
        "status": "ok",
        "service": "ignition-backend",
        "dataset_rows": len(DatasetService.load_dataset()),
    }


@router.get("/api/ignition")
def get_ignition(account_id: str = Query("acc_burnout_001")):
    payload = ModelService().forecast(account_id)
    return JSONResponse(content=payload)


@router.get("/api/generate")
def generate_payload(account_id: str = Query("acc_burnout_001")):
    payload = GeneratorService().generate(account_id)
    return JSONResponse(content=payload)
