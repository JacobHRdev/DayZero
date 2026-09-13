"""
Generador de dataset simulado en la API Nessie (Capital One) para
entrenar un motor de predicción de "burnout" de cuenta.

Factores de riesgo simulados:
  - Aceleración del gasto (purchases + withdrawals) vs balance
  - Deuda activa (loans) como carga adicional sobre la cuenta

Flujo de creación (respeta las dependencias de la API):
  Customer -> Account -> Merchant (independiente) -> Purchases/Withdrawals -> Loans
"""

import os
import requests
import random
import time
import json
from pathlib import Path
from datetime import datetime, timedelta

API_KEY = os.environ.get("NESSIE_API_KEY", "TU_API_KEY")
BASE_URL = os.environ.get("NESSIE_BASE_URL", "https://api.nessieisreal.com")
SLEEP = 0.15  # pausa entre requests para no saturar la API
ROOT = Path(__file__).resolve().parent

# Modo offline por defecto para que el dataset y los JSON de cuentas queden
# definidos en el repositorio y no dependan de la compilación ni del tiempo
# de creación de la API.
OFFLINE = API_KEY == "TU_API_KEY" or not API_KEY

# ---------- Helpers de creación ----------

def crear_cliente(first_name, last_name):
    url = f"{BASE_URL}/customers?key={API_KEY}"
    data = {
        "first_name": first_name,
        "last_name": last_name,
        "address": {
            "street_number": "1",
            "street_name": "Main St",
            "city": "Arlington",
            "state": "VA",
            "zip": "22201",
        },
    }
    r = requests.post(url, json=data)
    r.raise_for_status()
    time.sleep(SLEEP)
    return r.json()["objectCreated"]["_id"]


def crear_cuenta(customer_id, balance_inicial):
    url = f"{BASE_URL}/customers/{customer_id}/accounts?key={API_KEY}"
    data = {
        "type": "Checking",
        "nickname": "Cuenta Principal",
        "rewards": 0,
        "balance": balance_inicial,
    }
    r = requests.post(url, json=data)
    r.raise_for_status()
    time.sleep(SLEEP)
    return r.json()["objectCreated"]["_id"]


def crear_merchant(nombre="Merchant Generico"):
    url = f"{BASE_URL}/merchants?key={API_KEY}"
    data = {
        "name": nombre,
        "category": ["food", "retail"],
        "address": {
            "street_number": "10",
            "street_name": "Market St",
            "city": "Arlington",
            "state": "VA",
            "zip": "22201",
        },
        "geocode": {"lat": 38.8816, "lng": -77.0910},
    }
    r = requests.post(url, json=data)
    r.raise_for_status()
    time.sleep(SLEEP)
    return r.json()["objectCreated"]["_id"]


def crear_purchase(account_id, merchant_id, amount, fecha):
    url = f"{BASE_URL}/accounts/{account_id}/purchases?key={API_KEY}"
    data = {
        "merchant_id": merchant_id,
        "medium": "balance",
        "purchase_date": fecha.strftime("%Y-%m-%d"),
        "amount": round(amount, 2),
        "status": "completed",
    }
    r = requests.post(url, json=data)
    time.sleep(SLEEP)
    return r.status_code


def crear_withdrawal(account_id, amount, fecha):
    url = f"{BASE_URL}/accounts/{account_id}/withdrawals?key={API_KEY}"
    data = {
        "medium": "balance",
        "transaction_date": fecha.strftime("%Y-%m-%d"),
        "amount": round(amount, 2),
        "status": "completed",
    }
    r = requests.post(url, json=data)
    time.sleep(SLEEP)
    return r.status_code


def crear_loan(account_id, tipo, amount, monthly_payment, status="approved"):
    url = f"{BASE_URL}/accounts/{account_id}/loans?key={API_KEY}"
    data = {
        "type": tipo,               # ej: "student", "auto", "home", "business"
        "status": status,           # "pending" | "approved" | "denied" | "paid"
        "credit_score": random.randint(550, 750),
        "monthly_payment": round(monthly_payment, 2),
        "amount": round(amount, 2),
        "description": f"Loan simulado tipo {tipo}",
    }
    r = requests.post(url, json=data)
    time.sleep(SLEEP)
    return r.status_code, (r.json().get("objectCreated", {}) if r.ok else {})


# ---------- Simulación de perfiles ----------

def simular_perfil(nombre_base, dias=30, balance_inicial=5000,
                    con_burnout=True, con_deuda=True, merchant_id=None):
    """
    Genera un cliente + cuenta con historial de transacciones.
    Si con_burnout=True, el gasto se acelera con el tiempo (riesgo alto).
    Si con_deuda=True, se agrega un loan activo como carga adicional.
    """
    apellido = "Burnout" if con_burnout else "Normal"
    customer_id = crear_cliente(nombre_base, apellido)
    account_id = crear_cuenta(customer_id, balance_inicial)

    fecha_actual = datetime.now() - timedelta(days=dias)
    balance_restante = balance_inicial

    for dia in range(dias):
        if con_burnout:
            # El gasto crece con el tiempo: patrón de aceleración (riesgo)
            factor_aceleracion = 1 + (dia / dias) * 3  # hasta 4x al final
        else:
            factor_aceleracion = 1.0  # gasto estable

        gasto_base = balance_inicial * 0.02
        gasto_dia = gasto_base * factor_aceleracion * random.uniform(0.7, 1.3)
        gasto_dia = min(gasto_dia, max(balance_restante * 0.9, 0))

        # Alternamos entre purchase y withdrawal para variar el dataset
        if random.random() < 0.6 and merchant_id:
            crear_purchase(account_id, merchant_id, gasto_dia, fecha_actual)
        else:
            crear_withdrawal(account_id, gasto_dia, fecha_actual)

        balance_restante -= gasto_dia
        fecha_actual += timedelta(days=1)
        if balance_restante <= 0:
            break

    loan_info = None
    if con_deuda:
        # Perfiles con burnout tienden a tener deuda más alta y pago mensual
        # más agresivo relativo a su balance (mayor carga = mayor riesgo)
        if con_burnout:
            monto_deuda = balance_inicial * random.uniform(1.5, 3.0)
            pago_mensual = monto_deuda * random.uniform(0.08, 0.15)
        else:
            monto_deuda = balance_inicial * random.uniform(0.3, 0.8)
            pago_mensual = monto_deuda * random.uniform(0.02, 0.05)

        tipo_loan = random.choice(["auto", "student", "business"])
        status_code, loan_obj = crear_loan(
            account_id, tipo_loan, monto_deuda, pago_mensual
        )
        loan_info = {
            "status_code": status_code,
            "tipo": tipo_loan,
            "monto": round(monto_deuda, 2),
            "pago_mensual": round(pago_mensual, 2),
        }

    return {
        "customer_id": customer_id,
        "account_id": account_id,
        "balance_final_estimado": round(balance_restante, 2),
        "con_burnout": con_burnout,
        "loan": loan_info,
    }


# ---------- Orquestación ----------

def generar_dataset(n_burnout=5, n_normales=5, dias=30):
    print("Creando merchant compartido para las compras simuladas...")
    merchant_id = crear_merchant("Tienda Simulada Hackathon")

    resultados = []

    for i in range(n_burnout):
        print(f"Generando perfil BURNOUT #{i}...")
        resultado = simular_perfil(
            f"ClienteBurnout{i}", dias=dias,
            con_burnout=True, con_deuda=True, merchant_id=merchant_id,
        )
        resultados.append(resultado)

    for i in range(n_normales):
        print(f"Generando perfil NORMAL #{i}...")
        resultado = simular_perfil(
            f"ClienteNormal{i}", dias=dias,
            con_burnout=False, con_deuda=True, merchant_id=merchant_id,
        )
        resultados.append(resultado)

    return resultados


def generar_dataset_local(n_burnout=5, n_normales=5, dias=30):
    """
    Genera un dataset local determinista de ejemplo para conectar el modelo con
    el script de extracción de features y con el JSON de cuentas ya definido.
    """
    # ids normalizados y deterministas, compatibles con script.py
    dataset = []
    base_burnout = [
        "acc_burnout_001", "acc_burnout_002", "acc_burnout_003",
        "acc_burnout_004", "acc_burnout_005",
    ]
    base_normales = [
        "acc_normal_001", "acc_normal_002", "acc_normal_003",
        "acc_normal_004", "acc_normal_005",
    ]

    # construir registros de salida con formato compatible
    for idx, account_id in enumerate(base_burnout):
        dataset.append({
            "customer_id": f"customer_burnout_{idx + 1:03d}",
            "account_id": account_id,
            "balance_final_estimado": 1200.0 + idx * 100,
            "con_burnout": True,
            "loan": {
                "status_code": 200,
                "tipo": "business",
                "monto": 1800.0 + idx * 250,
                "pago_mensual": 90.0 + idx * 20,
            },
        })

    for idx, account_id in enumerate(base_normales):
        dataset.append({
            "customer_id": f"customer_normal_{idx + 1:03d}",
            "account_id": account_id,
            "balance_final_estimado": 2800.0 + idx * 100,
            "con_burnout": False,
            "loan": {
                "status_code": 200,
                "tipo": "student",
                "monto": 900.0 + idx * 100,
                "pago_mensual": 40.0 + idx * 6,
            },
        })

    return dataset


if __name__ == "__main__":
    if OFFLINE:
        dataset = generar_dataset_local(n_burnout=5, n_normales=5, dias=30)
    else:
        dataset = generar_dataset(n_burnout=5, n_normales=5, dias=30)

    print("\n--- Resumen del dataset generado ---")
    for r in dataset:
        etiqueta = "BURNOUT" if r["con_burnout"] else "NORMAL"
        deuda = r["loan"]["monto"] if r["loan"] else 0
        print(
            f"[{etiqueta}] account_id={r['account_id']} "
            f"balance_final~{r['balance_final_estimado']} "
            f"deuda~{deuda}"
        )

    with open(ROOT / "ids_generados.json", "w", encoding="utf-8") as f:
        json.dump(dataset, f, indent=2)

    cuentas_burnout = [r["account_id"] for r in dataset if r["con_burnout"]]
    cuentas_normales = [r["account_id"] for r in dataset if not r["con_burnout"]]

    with open(ROOT / "cuentas_burnout.json", "w", encoding="utf-8") as f:
        json.dump(cuentas_burnout, f, indent=2)

    with open(ROOT / "cuentas_normales.json", "w", encoding="utf-8") as f:
        json.dump(cuentas_normales, f, indent=2)

    print("\nGuardado: ids_generados.json, cuentas_burnout.json, cuentas_normales.json")
    print("\nGuardado: ids_generados.json, cuentas_burnout.json, cuentas_normales.json")
