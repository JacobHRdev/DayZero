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
