from pathlib import Path
import json
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
