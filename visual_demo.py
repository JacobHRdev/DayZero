import os
import random
import math
import tkinter as tk
from pathlib import Path
from tkinter import ttk
import pandas as pd

ROOT = Path(__file__).resolve().parent
DATASET_CSV = ROOT / "dataset_burnout.csv"

def load_dataset_values():
    values = {
        "balance_inicial": "5000",
        "mu": "15",
        "sigma": "5",
        "fecha_inicio": "2026-01-15",
        "fecha_fin": "2026-02-15",
        "prob_quiebra": "0.46",
    }

    if DATASET_CSV.exists():
        try:
            df = pd.read_csv(DATASET_CSV)
            if not df.empty:
                first = df.iloc[0]
                values["balance_inicial"] = str(int(first.get("balance_actual", 5000)))
                values["prob_quiebra"] = str(round(float(first.get("ratio_deuda_balance", 0.46)), 4))
        except Exception:
            pass

    return values


def brownian_path(steps=30):
    path = [0.0]
    for _ in range(steps):
        path.append(path[-1] + random.gauss(0, 1))
    return path


def inverse_gaussian_curve(days=30, mu=15, sigma=5):
    x = list(range(days))
    y = []
    for day in x:
        # Simulación simple de estructura gaussiana inversa con tail larga
        z = (day - mu) / sigma
        density = math.exp(-0.5 * z * z) / (sigma * math.sqrt(2 * math.pi))
        y.append(max(0.0, density * 100.0))
    return x, y


def draw_visual(root):
    frame = ttk.Frame(root, padding=12)
    frame.pack(fill="both", expand=True)

    ttk.Label(frame, text="Movimiento Browniano y Distribución Gaussiana Inversa", font=("Segoe UI", 16, "bold")).pack(anchor="w")

    # Panel de datos
    pane = ttk.Frame(frame)
    pane.pack(fill="x", pady=(12, 8))

    values = load_dataset_values()

    for key, value in values.items():
        row = ttk.Frame(pane)
        row.pack(fill="x", pady=3)
        ttk.Label(row, text=f"{key}:", width=16, anchor="w").pack(side="left")
        ttk.Label(row, text=value, foreground="#0f766e", font=("Segoe UI", 10, "bold")).pack(side="left")

    # Dibujo canvas
    canvas = tk.Canvas(frame, width=860, height=420, bg="#ffffff")
    canvas.pack(fill="both", expand=True)

    # Brownian trajectory
    path = brownian_path(steps=30)
    min_y = min(path)
    max_y = max(path)
    x0, y0 = 40, 50
    w, h = 760, 250
    plot_right = x0 + w
    plot_bottom = y0 + h

    # Axes grid
    for x in range(0, 31, 5):
        xs = x0 + int((x / 30) * w)
        canvas.create_line(xs, y0, xs, y0 + h, fill="#e0e7ff", dash=(2, 2))

    # Brownian curve
    pts = []
    for i, val in enumerate(path):
        x = x0 + int((i / 30) * w)
        yy = y0 + h - int(((val - min_y) / max(max_y - min_y, 1)) * h)
        pts.append((x, yy))
        if i > 0:
            px, py = pts[-2]
            canvas.create_line(px, py, x, yy, fill="#0ea5e9", width=2)

    # Gaussian inverse-style density
    days, density = inverse_gaussian_curve(days=30, mu=15, sigma=5)
    max_density = max(density)
    density_bar_y = y0 + h + 30
    density_bar_h = 80

    # total area baseline
    for idx, d in enumerate(density):
        x = x0 + int((idx / (len(density)-1)) * w)
        y = density_bar_y - int((d / max_density) * density_bar_h)
        canvas.create_line(x, density_bar_y, x, y, fill="#8b5cf6", width=2)

    # Points for density
    canvas.create_text(x0 + w // 2, y0 + h + 10, text="Tiempo / días", fill="#475569", font=("Segoe UI", 10, "bold"))

    # Report caption
    canvas.create_text(x0 + 10, y0 + h + 70, text="Movimiento Browniano", fill="#0284c7", font=("Segoe UI", 10, "bold"))
    canvas.create_text(x0 + 420, y0 + h + 70, text="Distribución Gaussiana Inversa", fill="#7c3aed", font=("Segoe UI", 10, "bold"))

    # Footer
    ttk.Button(frame, text="Cerrar", command=root.destroy).pack(anchor="e", pady=(10, 0))


def main():
    root = tk.Tk()
    root.title("Resultado Browniano / Gaussiana Inversa")
    root.geometry("940x620")
    draw_visual(root)
    root.mainloop()


if __name__ == "__main__":
    main()
