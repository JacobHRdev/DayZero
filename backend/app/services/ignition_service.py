from pathlib import Path
import json
from datetime import datetime
from typing import Any, Dict, List, Optional

from app.core.config import PROJECT_ROOT


class IgnitionService:
    """Servicio de dominio para evolucionar el payload de ignición."""

    def __init__(self, payload_path: Path = PROJECT_ROOT / "ignition_payload.json"):
        self.payload_path = payload_path

    def load_payload(self) -> Dict[str, Any]:
        if self.payload_path.exists():
            with self.payload_path.open("r", encoding="utf-8") as handle:
                return json.load(handle)

        return self.default_payload()

    def default_payload(self) -> Dict[str, Any]:
        return {
            "account_id": "5a1b0e4e4f523604900000002",
            "fecha_calculo": datetime.today().isoformat(),
            "dia_observado": 15,
            "parametros": {
                "B0": 5000.0,
                "mu": -266.52,
                "sigma": 237.30,
                "ventana_dias": 7,
            },
            "prediccion": {
                "dia_esperado_quiebra": 18.76,
                "intervalo_confianza_90": [13.15, 25.69],
                "intervalo_confianza_50": [16.01, 21.09],
            },
            "riesgo": {
                "fecha_finiquito": "2026-01-18",
                "prob_quiebra_antes_finiquito": 0.46,
                "umbral_alerta": 0.35,
                "estado": "riesgo_alto",
                "webhook_disparado": True,
            },
            "serie_saldo": [
                {"dia": 0, "saldo": 5000.0},
                {"dia": 1, "saldo": 4508.36},
                {"dia": 15, "saldo": 1002.20},
            ],
        }

    def write_payload(self, payload: Dict[str, Any]) -> Dict[str, Any]:
        self.payload_path.parent.mkdir(parents=True, exist_ok=True)
        with self.payload_path.open("w", encoding="utf-8") as handle:
            json.dump(payload, handle, indent=2)
        return payload
