import { ShieldAlert } from "lucide-react";

export default function CreditOfferAlert({ data }) {
  if (!data.riesgo.webhook_disparado) return null;

  return (
    <section aria-labelledby="credit-offer-title" className="rounded-xl bg-gradient-to-br from-slate-800 to-slate-950 p-6 text-white shadow-[0_18px_38px_rgba(15,23,42,0.22)]">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-start gap-4">
          <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-white/15 bg-white/10 text-white">
            <ShieldAlert size={22} strokeWidth={1.8} />
          </div>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-300">Acción requerida · Intervención bancaria</p>
            <h2 id="credit-offer-title" className="mt-2 font-jakarta text-xl font-semibold">Intervención de Liquidez Recomendada</h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-300">Basado en la proyección de quiebra para el día {data.prediccion.dia_esperado_quiebra}, el banco ha pre-aprobado una línea de crédito comercial para mitigar el riesgo antes del finiquito.</p>
          </div>
        </div>
        <div className="flex shrink-0 flex-col gap-3 sm:flex-row lg:flex-col xl:flex-row">
          <button className="rounded-lg bg-white px-5 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-100" type="button">Aceptar Crédito</button>
          <button className="rounded-lg border border-white/35 px-5 py-3 text-sm font-semibold text-white transition hover:border-white hover:bg-white/10" type="button">Revisar Términos</button>
        </div>
      </div>
    </section>
  );
}
