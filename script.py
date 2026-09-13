import os
import json
import pandas as pd
import requests
from pathlib import Path
from datetime import datetime

API_KEY = os.environ.get("NESSIE_API_KEY", "")
BASE_URL = os.environ.get("NESSIE_BASE_URL", "https://api.nessieisreal.com")
ROOT = Path(__file__).resolve().parent

# Datos de referencia locales, usados cuando la API de Nessie no está disponible.
# Se generan con el archivo generar_dataset_burnout.py y se mantienen en disco.
FALLBACK_DATA = {
    "acc_burnout_001": {
        "balance": 4200,
        "purchases": [{"purchase_date": "2026-01-01", "amount": 120.5}, {"purchase_date": "2026-01-03", "amount": 183.2}, {"purchase_date": "2026-01-10", "amount": 230.7}],
        "withdrawals": [{"transaction_date": "2026-01-02", "amount": 85.0}],
        "loans": [{"amount": 7000, "monthly_payment": 220.0}],
    },
    "acc_burnout_002": {
        "balance": 3600,
        "purchases": [{"purchase_date": "2026-01-01", "amount": 110.0}, {"purchase_date": "2026-01-05", "amount": 240.0}],
        "withdrawals": [{"transaction_date": "2026-01-02", "amount": 120.0}, {"transaction_date": "2026-01-08", "amount": 214.0}],
        "loans": [{"amount": 8200, "monthly_payment": 260.0}],
    },
    "acc_burnout_003": {
        "balance": 2800,
        "purchases": [{"purchase_date": "2026-01-01", "amount": 90.0}, {"purchase_date": "2026-01-04", "amount": 150.0}, {"purchase_date": "2026-01-08", "amount": 260.0}],
        "withdrawals": [{"transaction_date": "2026-01-02", "amount": 100.0}],
        "loans": [{"amount": 5000, "monthly_payment": 180.0}],
    },
    "acc_burnout_004": {
        "balance": 2400,
        "purchases": [{"purchase_date": "2026-01-02", "amount": 91.0}, {"purchase_date": "2026-01-04", "amount": 125.0}, {"purchase_date": "2026-01-06", "amount": 160.0}],
        "withdrawals": [{"transaction_date": "2026-01-03", "amount": 180.0}],
        "loans": [{"amount": 4500, "monthly_payment": 140.0}],
    },
    "acc_burnout_005": {
        "balance": 1950,
        "purchases": [{"purchase_date": "2026-01-02", "amount": 100.0}, {"purchase_date": "2026-01-06", "amount": 170.0}],
        "withdrawals": [{"transaction_date": "2026-01-03", "amount": 160.0}, {"transaction_date": "2026-01-10", "amount": 280.0}],
        "loans": [{"amount": 3800, "monthly_payment": 140.0}],
    },
    "acc_normal_001": {
        "balance": 5600,
        "purchases": [{"purchase_date": "2026-01-01", "amount": 120.0}, {"purchase_date": "2026-01-04", "amount": 110.0}],
        "withdrawals": [{"transaction_date": "2026-01-02", "amount": 100.0}],
        "loans": [{"amount": 1500, "monthly_payment": 60.0}],
    },
    "acc_normal_002": {
        "balance": 6800,
        "purchases": [{"purchase_date": "2026-01-01", "amount": 100.0}],
        "withdrawals": [{"transaction_date": "2026-01-03", "amount": 80.0}],
        "loans": [{"amount": 1200, "monthly_payment": 35.0}],
    },
    "acc_normal_003": {
        "balance": 6900,
        "purchases": [{"purchase_date": "2026-01-02", "amount": 100.0}, {"purchase_date": "2026-01-04", "amount": 95.0}],
        "withdrawals": [{"transaction_date": "2026-01-03", "amount": 105.0}],
        "loans": [{"amount": 1000, "monthly_payment": 50.0}],
    },
    "acc_normal_004": {
        "balance": 7100,
        "purchases": [{"purchase_date": "2026-01-01", "amount": 120.0}],
        "withdrawals": [{"transaction_date": "2026-01-07", "amount": 80.0}],
        "loans": [{"amount": 1500, "monthly_payment": 45.0}],
    },
    "acc_normal_005": {
        "balance": 7400,
        "purchases": [{"purchase_date": "2026-01-02", "amount": 80.0}, {"purchase_date": "2026-01-06", "amount": 110.0}],
        "withdrawals": [{"transaction_date": "2026-01-04", "amount": 70.0}],
        "loans": [{"amount": 1000, "monthly_payment": 40.0}],
    },
}


def obtener_purchases(account_id):
    fallback = FALLBACK_DATA.get(account_id, {}).get("purchases", [])
    if not API_KEY:
        return fallback
    url = f"{BASE_URL}/accounts/{account_id}/purchases?key={API_KEY}"
    try:
        r = requests.get(url, timeout=5)
        if r.ok:
            data = r.json()
            return data if data else fallback
    except Exception:
        pass
    return fallback


def obtener_withdrawals(account_id):
    fallback = FALLBACK_DATA.get(account_id, {}).get("withdrawals", [])
    if not API_KEY:
        return fallback
    url = f"{BASE_URL}/accounts/{account_id}/withdrawals?key={API_KEY}"
    try:
        r = requests.get(url, timeout=5)
        if r.ok:
            data = r.json()
            return data if data else fallback
    except Exception:
        pass
    return fallback


def obtener_loans(account_id):
    fallback = FALLBACK_DATA.get(account_id, {}).get("loans", [])
    if not API_KEY:
        return fallback
    url = f"{BASE_URL}/accounts/{account_id}/loans?key={API_KEY}"
    try:
        r = requests.get(url, timeout=5)
        if r.ok:
            data = r.json()
            return data if data else fallback
    except Exception:
        pass
    return fallback


def obtener_cuenta(account_id):
    fallback = FALLBACK_DATA.get(account_id, {})
    if not API_KEY:
        return {"balance": fallback.get("balance", 0)}
    url = f"{BASE_URL}/accounts/{account_id}?key={API_KEY}"
    try:
        r = requests.get(url, timeout=5)
        if r.ok:
            data = r.json()
            if isinstance(data, dict) and "balance" in data:
                return data
    except Exception:
        pass
    return {"balance": fallback.get("balance", 0)}


def calcular_features(account_id, etiqueta_burnout):
    cuenta = obtener_cuenta(account_id)
    balance_actual = cuenta.get("balance", 0)

    purchases = obtener_purchases(account_id)
    withdrawals = obtener_withdrawals(account_id)
    loans = obtener_loans(account_id)

    transacciones = []
    for p in purchases:
        transacciones.append({
            "fecha": p.get("purchase_date") or p.get("transaction_date"),
            "monto": float(p.get("amount", 0)),
        })
    for w in withdrawals:
        transacciones.append({
            "fecha": w.get("transaction_date") or w.get("purchase_date"),
            "monto": float(w.get("amount", 0)),
        })

    transacciones = [t for t in transacciones if t["fecha"]]
    transacciones.sort(key=lambda t: t["fecha"])

    gasto_total = sum(t["monto"] for t in transacciones)
    num_transacciones = len(transacciones)

    if num_transacciones >= 2:
        mitad = num_transacciones // 2
        gasto_primera_mitad = sum(t["monto"] for t in transacciones[:mitad])
        gasto_segunda_mitad = sum(t["monto"] for t in transacciones[mitad:])
        aceleracion_gasto = (
            (gasto_segunda_mitad - gasto_primera_mitad) / gasto_primera_mitad
            if gasto_primera_mitad > 0 else 0
        )
    else:
        aceleracion_gasto = 0

    gasto_promedio_diario = gasto_total / num_transacciones if num_transacciones else 0

    deuda_total = sum(float(l.get("amount", 0)) for l in loans)
    pago_mensual_total = sum(float(l.get("monthly_payment", 0)) for l in loans)

    ratio_deuda_balance = deuda_total / balance_actual if balance_actual else 0
    ratio_pago_balance = pago_mensual_total / balance_actual if balance_actual else 0

    dias_hasta_agotar = (
        balance_actual / gasto_promedio_diario
        if gasto_promedio_diario > 0 else None
    )

    return {
        "account_id": account_id,
        "balance_actual": balance_actual,
        "num_transacciones": num_transacciones,
        "gasto_total": gasto_total,
        "gasto_promedio_diario": gasto_promedio_diario,
        "aceleracion_gasto": aceleracion_gasto,
        "deuda_total": deuda_total,
        "pago_mensual_total": pago_mensual_total,
        "ratio_deuda_balance": ratio_deuda_balance,
        "ratio_pago_balance": ratio_pago_balance,
        "dias_hasta_agotar": dias_hasta_agotar,
        "burnout": etiqueta_burnout,
    }


def construir_dataframe(cuentas_burnout, cuentas_normales):
    filas = []

    for account_id in cuentas_burnout:
        filas.append(calcular_features(account_id, 1))

    for account_id in cuentas_normales:
        filas.append(calcular_features(account_id, 0))

    return pd.DataFrame(filas)


if __name__ == "__main__":
    cuentas_burnout_path = ROOT / "cuentas_burnout.json"
    cuentas_normales_path = ROOT / "cuentas_normales.json"
    dataset_path = ROOT / "dataset_burnout.csv"

    if not cuentas_burnout_path.exists() or not cuentas_normales_path.exists():
        raise FileNotFoundError("Falta generar los JSON de cuentas: cuentas_burnout.json y cuentas_normales.json")

    with open(cuentas_burnout_path, encoding="utf-8") as f:
        cuentas_burnout = json.load(f)

    with open(cuentas_normales_path, encoding="utf-8") as f:
        cuentas_normales = json.load(f)

    df = construir_dataframe(cuentas_burnout, cuentas_normales)
    df.to_csv(dataset_path, index=False)
    print(df.head())
    print(f"\nGuardado: {dataset_path}")
