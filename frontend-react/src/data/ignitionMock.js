export const ignitionMock = {
  account_id: "5a1b0e4e4f523604900000002",
  fecha_calculo: "2026-01-15",
  dia_observado: 15,
  parametros: {
    B0: 5000.00,
    mu: -266.52,
    sigma: 237.30,
    ventana_dias: 7
  },
  prediccion: {
    dia_esperado_quiebra: 18.76,
    intervalo_confianza_90: [13.15, 25.69],
    intervalo_confianza_50: [16.01, 21.09]
  },
  riesgo: {
    fecha_finiquito: "2026-01-18",
    prob_quiebra_antes_finiquito: 0.46,
    umbral_alerta: 0.35,
    estado: "riesgo_alto",
    webhook_disparado: true
  },
  serie_saldo: [
    { dia: 0, saldo: 5000.00 },
    { dia: 1, saldo: 4508.36 },
    { dia: 15, saldo: 1002.20 }
  ]
};
