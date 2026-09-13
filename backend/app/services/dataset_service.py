from pathlib import Path
import json
import pandas as pd

from app.core.config import PROJECT_ROOT, DATASET_PATH


class DatasetService:
    """Servicio responsable de leer el dataset y los JSON de cuentas del repositorio."""

    @staticmethod
    def load_accounts(kind: str) -> list[str]:
        path = PROJECT_ROOT / ("cuentas_burnout.json" if kind == "burnout" else "cuentas_normales.json")
        if not path.exists():
            return []
        with path.open("r", encoding="utf-8") as handle:
            return json.load(handle)

    @staticmethod
    def load_dataset() -> pd.DataFrame:
        if DATASET_PATH.exists():
            return pd.read_csv(DATASET_PATH)
        return pd.DataFrame()

    @staticmethod
    def get_account_row(account_id: str) -> dict | None:
        """Devuelve la fila del dataset para un account_id, o None si no existe."""
        df = DatasetService.load_dataset()
        if df.empty or "account_id" not in df.columns:
            return None
        matching = df[df["account_id"].astype(str).str.strip() == str(account_id).strip()]
        if matching.empty:
            return None
        return matching.iloc[0].to_dict()

    @staticmethod
    def build_dataset_from_accounts() -> pd.DataFrame:
        """Genera un dataframe mínimo compatible con script.py y con la API del backend."""
        burnout_accounts = DatasetService.load_accounts("burnout")
        normal_accounts = DatasetService.load_accounts("normal")

        rows = []
        for account_id in burnout_accounts:
            rows.append({
                "account_id": account_id,
                "burnout": 1,
                "balance_actual": 5000,
                "gasto_total": 1000,
                "gasto_promedio_diario": 50,
                "ratio_deuda_balance": 0.45,
                "ratio_pago_balance": 0.2,
                "dias_hasta_agotar": 30,
            })

        for account_id in normal_accounts:
            rows.append({
                "account_id": account_id,
                "burnout": 0,
                "balance_actual": 5000,
                "gasto_total": 500,
                "gasto_promedio_diario": 25,
                "ratio_deuda_balance": 0.10,
                "ratio_pago_balance": 0.05,
                "dias_hasta_agotar": 60,
            })

        return pd.DataFrame(rows)
