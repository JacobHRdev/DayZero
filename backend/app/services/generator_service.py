from pathlib import Path
import json
import random
from datetime import datetime
import numpy as np
import pandas as pd

from app.core.config import PROJECT_ROOT
from app.services.model_service import ModelService


class GeneratorService:
    """Servicio que genera y serializa el payload de ignición desde el modelo matemático."""

    def __init__(self, output_path: Path = PROJECT_ROOT / "ignition_payload.json"):
        self.output_path = output_path

    def generate(self, account_id: str = "acc_burnout_001") -> dict:
        model = ModelService()
        payload = model.forecast(account_id)

        self.output_path.parent.mkdir(parents=True, exist_ok=True)
        with self.output_path.open("w", encoding="utf-8") as handle:
            json.dump(payload, handle, indent=2)

        return payload

    def generate_random_company(self) -> dict:
        """Crea un escenario local nuevo con el mismo perfil del script generador."""
        burnout = random.choice([True, False])
        initial_balance = random.randint(3500, 18000)
        average_daily_spend = round(random.uniform(35, 280), 2)
        company = {
            "company_name": f"PYME generada {datetime.now().strftime('%H%M%S')}",
            "initial_balance": initial_balance,
            "average_daily_spend": average_daily_spend,
            "debt_balance_ratio": round(random.uniform(0.18, 0.72) if burnout else random.uniform(0.04, 0.28), 2),
            "payment_balance_ratio": round(random.uniform(0.08, 0.24) if burnout else random.uniform(0.02, 0.10), 2),
            "days_until_empty": random.randint(35, 150),
            "burnout": burnout,
        }
        return ModelService().forecast_custom(company)
