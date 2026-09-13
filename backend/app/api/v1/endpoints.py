from fastapi import APIRouter, HTTPException, Query
from fastapi.responses import JSONResponse

from app.services.dataset_service import DatasetService
from app.services.model_service import ModelService
from app.services.generator_service import GeneratorService
from app.schemas.ignition import CustomCompany

router = APIRouter()


@router.get("/api/health")
def health_check():
    return {
        "status": "ok",
        "service": "ignition-backend",
        "dataset_rows": len(DatasetService.load_dataset()),
    }


@router.get("/api/accounts")
def get_accounts():
    return {"accounts": DatasetService.get_account_ids()}


@router.get("/api/ignition")
def get_ignition(account_id: str = Query("acc_burnout_001")):
    if DatasetService.get_account_row(account_id) is None:
        raise HTTPException(status_code=404, detail=f"Cuenta no encontrada: {account_id}")
    payload = ModelService().forecast(account_id)
    return JSONResponse(content=payload)


@router.get("/api/generate")
def generate_payload(account_id: str = Query("acc_burnout_001")):
    if DatasetService.get_account_row(account_id) is None:
        raise HTTPException(status_code=404, detail=f"Cuenta no encontrada: {account_id}")
    payload = GeneratorService().generate(account_id)
    return JSONResponse(content=payload)


@router.post("/api/generate/custom")
def generate_custom_payload(company: CustomCompany):
    payload = ModelService().forecast_custom(company.model_dump())
    return JSONResponse(content=payload)


@router.post("/api/generate/random")
def generate_random_payload():
    return JSONResponse(content=GeneratorService().generate_random_company())
