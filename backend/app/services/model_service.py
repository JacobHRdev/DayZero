from dataclasses import dataclass
from typing import Dict, Any, List
import math
from datetime import date

from app.services.dataset_service import DatasetService
from app.services.visualization_service import VisualizationService


@dataclass
class ModelPrediction:
    dia_esperado_quiebra: float
    intervalo_confianza_90: list[float]
    intervalo_confianza_50: list[float]
    prob_quiebra_antes_finiquito: float
    serie_saldo: list[dict]
    parametros: dict
    riesgo: dict


class ModelService:
    """Motor matemático de ignición con salida de payload compatible con la vista.

    El servicio mantiene un comportamiento determinista y utiliza el dataset si
    está disponible para adaptar el saldo, la probabilidad de riesgo y el finiquito
    al account_id solicitado.
    """

    def __init__(self, base_balance: float = 5000.0, mu: float = -266.52, sigma: float = 237.30):
        self.base_balance = base_balance
        self.mu = mu
        self.sigma = sigma

    def _fallback_forecast(self, account_id: str) -> Dict[str, Any]:
        balance = self.base_balance
        sigma = max(self.sigma, 1.0)
        trend = self.mu
        days_to_failure = 18.76
        probability = 0.46

        trajectory = VisualizationService.brownian_path(
            balance=balance,
            drift=trend,
            sigma=sigma,
            days=30,
            seed=42,
        )

        return {
            "account_id": account_id,
            "fecha_calculo": date.today().isoformat(),
            "dia_observado": 15,
            "parametros": {
                "B0": round(balance, 2),
                "mu": round(trend, 2),
                "sigma": round(sigma, 2),
                "ventana_dias": 7,
            },
            "prediccion": {
                "dia_esperado_quiebra": round(days_to_failure, 2),
                "intervalo_confianza_90": [13.15, 25.69],
                "intervalo_confianza_50": [16.01, 21.09],
            },
            "riesgo": {
                "fecha_finiquito": "2026-01-18",
                "prob_quiebra_antes_finiquito": probability,
                "umbral_alerta": 0.35,
                "estado": "riesgo_alto",
                "webhook_disparado": True,
            },
            "serie_saldo": trajectory,
            "gaussiana": VisualizationService.gaussian_density(days=30, expected=days_to_failure, spread=5.0),
        }

    def forecast(self, account_id: str = "acc_burnout_001") -> Dict[str, Any]:
        DatasetService.load_dataset()
        row = DatasetService.get_account_row(account_id)
        if row:
            balance = float(row.get("balance_actual", self.base_balance))
            avg_daily_spend = float(row.get("gasto_promedio_diario", 25.0))
            ratio_debt_balance = float(row.get("ratio_deuda_balance", 0.10))
            ratio_payment_balance = float(row.get("ratio_pago_balance", 0.05))
            burnout = int(row.get("burnout", 0))

            # El modelo usa un patrón simple pero legible para convertir la
            # fila del dataset en un payload del mismo contrato del frontend.
            trend = -max(avg_daily_spend, 1.0) * (1.0 + ratio_debt_balance)
            sigma = max(150.0, avg_daily_spend * (1.9 + ratio_payment_balance * 10))
            days_until_empty = float(row.get("dias_hasta_agotar", 30.0) or 30.0)
            if not math.isfinite(days_until_empty):
                days_until_empty = 30.0
            days_to_failure = max(5.0, days_until_empty * 0.62)
            probability = min(
                0.9,
                max(
                    0.10,
                    0.15 + (ratio_debt_balance * 0.22) + (0.18 if burnout else 0.0),
                ),
            )

            trajectory = VisualizationService.brownian_path(
                balance=balance,
                drift=trend,
                sigma=sigma,
                days=30,
                seed=42,
            )

            return {
                "account_id": account_id,
                "fecha_calculo": date.today().isoformat(),
                "dia_observado": 15,
                "parametros": {
                    "B0": round(balance, 2),
                    "mu": round(trend, 2),
                    "sigma": round(sigma, 2),
                    "ventana_dias": 7,
                },
                "prediccion": {
                    "dia_esperado_quiebra": round(days_to_failure, 2),
                    "intervalo_confianza_90": [round(days_to_failure - 2.5, 2), round(days_to_failure + 7.8, 2)],
                    "intervalo_confianza_50": [round(days_to_failure - 0.8, 2), round(days_to_failure + 2.3, 2)],
                },
                "riesgo": {
                    "fecha_finiquito": date.today().isoformat(),
                    "prob_quiebra_antes_finiquito": round(probability, 4),
                    "umbral_alerta": 0.35,
                    "estado": "riesgo_alto" if burnout else "riesgo_medio",
                    "webhook_disparado": True,
                },
                "serie_saldo": trajectory,
                "gaussiana": VisualizationService.gaussian_density(days=30, expected=days_to_failure, spread=5.0),
            }

        return self._fallback_forecast(account_id)
