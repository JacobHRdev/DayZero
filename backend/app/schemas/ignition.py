from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional


class Transaction(BaseModel):
    dia: int
    saldo: float


class Parameters(BaseModel):
    B0: float
    mu: float
    sigma: float
    ventana_dias: int


class CustomCompany(BaseModel):
    company_name: str = Field(min_length=2, max_length=80)
    initial_balance: float = Field(gt=0)
    average_daily_spend: float = Field(gt=0)
    debt_balance_ratio: float = Field(ge=0, le=1)
    payment_balance_ratio: float = Field(ge=0, le=1)
    days_until_empty: int = Field(gt=0, le=3650)
    burnout: bool = False


class Prediction(BaseModel):
    dia_esperado_quiebra: float
    intervalo_confianza_90: List[float]
    intervalo_confianza_50: List[float]


class Risk(BaseModel):
    fecha_finiquito: str
    prob_quiebra_antes_finiquito: float
    umbral_alerta: float
    estado: str
    webhook_disparado: bool


class IgnitionPayload(BaseModel):
    account_id: str
    fecha_calculo: str
    dia_observado: int
    parametros: Parameters
    prediccion: Prediction
    riesgo: Risk
    serie_saldo: List[Transaction]
