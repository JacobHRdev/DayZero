import math
import random
from typing import List, Dict, Any


class VisualizationService:
    """Servicio visual compartido por el backend para generar una trayectoria
    browniana determinista y una curva de densidad gaussiana normalizada,
    evitando el cálculo temporal de visual_demo.py y dejando esa lógica
    dentro del contrato de salida principal del backend.
    """

    @staticmethod
    def brownian_path(balance: float, drift: float, sigma: float, days: int = 31, seed: int = 42) -> List[Dict[str, float]]:
        """Genera una trayectoria determinista de saldos para el payload de ignición.
        La serie mantiene un punto base al día 0 y aplica un Drift + ruido gaussiano
        controlado por una semilla fija.
        """
        rng = random.Random(seed)
        points: List[Dict[str, float]] = [{"dia": 0, "saldo": round(balance, 2)}]
        current = balance
        for day in range(1, days + 1):
            # Drift financiero: tendencia del saldo y ruido de volatilidad.
            # Reproducible porque la semilla es fija.
            brownian_noise = rng.gauss(0.0, max(sigma, 1.0) / 16.0)
            current = max(0.0, balance + drift * day + brownian_noise)
            points.append({"dia": day, "saldo": round(current, 2)})
        return points

    @staticmethod
    def gaussian_density(days: int = 30, expected: float = 15.0, spread: float = 5.0) -> List[Dict[str, float]]:
        """Devuelve una curva normalizada de densidad gaussiana para la vista del backend.
        La salida es serializable y sirve como apoyo para la visualización de riesgo.
        """
        spread = max(float(spread), 1.0)
        curve = []
        for day in range(days):
            z = (day - expected) / spread
            density = math.exp(-0.5 * z * z) / (spread * math.sqrt(2 * math.pi))
            curve.append({"dia": day, "densidad": round(max(0.0, density), 8)})
        return curve
