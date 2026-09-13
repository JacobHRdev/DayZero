import { AlertTriangle, ArrowDownRight, ArrowUpRight, CheckCircle2, Download, LockKeyhole, ShieldCheck, TriangleAlert } from "lucide-react";

const account = {
  account_id: "acc_burnout_01",
  fecha_calculo: "2026-02-15T09:30:00Z",
  balance_actual: 1840,
  deuda_total: 1320,
  gasto_promedio_diario: 51.11,
  dias_hasta_agotar: 18,
  prob_quiebra: 0.72,
  B_0: 5200,
  mu: -0.041,
  sigma: 0.18,
  intervalo_confianza: "95%",
  webhook_disparado: true,
  webhook_ejecutado_por: "risk-engine",
  serie_saldo: [5200, 4930, 4725, 4410, 4175, 3980, 3710, 3480, 3240, 3015, 2740, 2510, 2290, 2075, 1840]
};

const transactions = [
  { date: "15 Feb 2026", description: "Pago proveedor operativo", type: "Egreso", amount: "-$420.00", status: "Confirmado" },
  { date: "14 Feb 2026", description: "Nómina quincenal", type: "Egreso", amount: "-$1,280.00", status: "Confirmado" },
  { date: "13 Feb 2026", description: "Cobro cliente C-104", type: "Ingreso", amount: "+$2,450.00", status: "Liquidado" },
  { date: "12 Feb 2026", description: "Servicio cloud mensual", type: "Egreso", amount: "-$185.00", status: "Confirmado" }
];

const projects = [
  { name: "Operación corriente", progress: 76, status: "Atención requerida" },
  { name: "Finiquito de obligaciones", progress: 48, status: "En análisis" },
  { name: "Reserva de continuidad", progress: 24, status: "Proyección" }
];

function Panel({ children, className = "" }) {
  return <section className={`rounded-[28px] border border-[#B9B9B9] bg-white p-6 ${className}`}>{children}</section>;
}

function SectionHeading({ eyebrow, title, description }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">{eyebrow}</p>
      <h1 className="mt-3 font-jakarta text-3xl font-semibold leading-tight text-black">{title}</h1>
      {description && <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">{description}</p>}
    </div>
  );
}

function KpiCard({ label, value, context, tone = "neutral" }) {
  return (
    <article className="rounded-[24px] border border-[#B9B9B9] bg-white p-5">
      <p className="text-xs font-semibold uppercase tracking-[0.1em] text-slate-500">{label}</p>
      <p className="mt-5 font-jakarta text-2xl font-semibold text-black">{value}</p>
      <p className={`mt-2 flex items-center gap-1 text-xs ${tone === "danger" ? "text-[#A94148]" : "text-slate-500"}`}>{tone === "danger" ? <ArrowDownRight size={14} /> : <ArrowUpRight size={14} />}{context}</p>
    </article>
  );
}

function TrajectoryChart() {
  const points = account.serie_saldo.map((value, index) => `${index * 6.85 + 3},${128 - (value / account.B_0) * 100}`).join(" ");
  return (
    <div className="mt-6 rounded-[22px] bg-[#F5F5F7] p-4">
      <svg aria-label="Gráfica de trayectoria del saldo" className="h-[250px] w-full" preserveAspectRatio="none" role="img" viewBox="0 0 100 140">
        {[25, 55, 85, 115].map((line) => <line key={line} stroke="#D4D4D8" strokeDasharray="1 2" strokeWidth="0.6" x1="3" x2="97" y1={line} y2={line} />)}
        <polyline className="chart-draw" fill="none" points={points} stroke="#111111" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.7" />
        <polyline fill="none" points={`3,128 ${points}`} stroke="#A94148" strokeDasharray="2 2" strokeWidth="0.8" />
        <circle cx="96" cy={128 - (account.serie_saldo.at(-1) / account.B_0) * 100} fill="#A94148" r="2.5" />
      </svg>
      <div className="flex justify-between text-[11px] text-slate-500"><span>Inicio · $5,200</span><span>Saldo actual · $1,840</span><span>Día 30</span></div>
    </div>
  );
}

function ExecutiveView() {
  return (
    <div className="space-y-6">
      <SectionHeading eyebrow="Vista ejecutiva" title="Centro de Mando" description="Dirección del saldo y nivel de intervención requerido para la cuenta observada." />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard label="Operating Balance" value="$1,840" context="-64.6% desde B₀" tone="danger" />
        <KpiCard label="Burn Rate" value="$51.11 / día" context="gasto promedio diario" tone="danger" />
        <KpiCard label="Runway" value="18 días" context="hasta agotar el saldo" tone="danger" />
        <KpiCard label="Today's Transactions" value="4" context="actividad registrada" />
      </div>
      <div className="grid gap-6 xl:grid-cols-[minmax(0,3fr)_minmax(280px,2fr)]">
        <Panel>
          <div className="flex flex-wrap items-start justify-between gap-4"><div><p className="text-xs font-semibold uppercase tracking-[0.1em] text-slate-500">Vista 1 · Trayectoria</p><h2 className="mt-2 font-jakarta text-xl font-semibold text-black">Liquidez proyectada</h2></div><span className="rounded-full bg-[#F5F5F7] px-3 py-1 text-xs font-semibold text-slate-600">30 días</span></div>
          <TrajectoryChart />
        </Panel>
        <Panel className="flex flex-col justify-between"><div><p className="text-xs font-semibold uppercase tracking-[0.1em] text-slate-500">Vista 4 · Semáforo</p><h2 className="mt-2 font-jakarta text-xl font-semibold text-black">Intervención inmediata</h2><div className="mt-7 flex items-center gap-4"><div className="grid h-16 w-16 place-items-center rounded-full bg-[#FCE8E8] text-[#A94148]"><AlertTriangle size={30} /></div><div><p className="font-jakarta text-3xl font-semibold text-[#A94148]">72%</p><p className="mt-1 text-xs text-slate-500">probabilidad de quiebra</p></div></div></div><div className="mt-8 border-t border-[#B9B9B9] pt-5 text-sm leading-6 text-slate-600">El saldo estimado alcanza el umbral crítico antes del cierre del periodo.</div></Panel>
      </div>
    </div>
  );
}

function ProjectView() {
  return <div className="space-y-6"><SectionHeading eyebrow="Gestión operativa" title="Proyecto" description="Diagnóstico de continuidad y distribución de resultados para el proyecto seleccionado." /><div className="grid gap-6 xl:grid-cols-[minmax(0,2fr)_minmax(280px,3fr)]"><Panel><p className="text-xs font-semibold uppercase tracking-[0.1em] text-slate-500">Proyectos activos</p><div className="mt-5 space-y-6">{projects.map((project) => <div key={project.name}><div className="flex justify-between gap-4 text-sm"><span className="font-semibold text-black">{project.name}</span><span className="text-slate-500">{project.progress}%</span></div><div className="mt-3 h-1.5 overflow-hidden rounded-full bg-[#F5F5F7]"><div className="h-full rounded-full bg-black" style={{ width: `${project.progress}%` }} /></div><p className="mt-2 text-xs text-slate-500">{project.status}</p></div>)}</div></Panel><Panel><p className="text-xs font-semibold uppercase tracking-[0.1em] text-slate-500">Vista 2 · Distribución</p><h2 className="mt-2 font-jakarta text-xl font-semibold text-black">Gaussiana inversa</h2><div className="mt-6 rounded-[22px] bg-[#F5F5F7] p-4"><svg aria-label="Distribución gaussiana inversa" className="h-[220px] w-full" role="img" viewBox="0 0 400 180"><path d="M12 160 C 80 160, 105 154, 135 120 C 170 79, 188 28, 216 22 C 244 28, 270 82, 300 123 C 330 154, 360 160, 388 160" fill="none" stroke="#111" strokeWidth="3" /><line stroke="#A94148" strokeDasharray="5 5" strokeWidth="2" x1="216" x2="216" y1="20" y2="160" /><text fill="#A94148" fontSize="12" x="226" y="35">P(quiebra) = 72%</text><line stroke="#B9B9B9" x1="12" x2="388" y1="160" y2="160" /></svg></div><p className="mt-4 text-sm leading-6 text-slate-500">Área bajo la curva estimada para el finiquito del proyecto.</p></Panel></div></div>;
}

function LedgerView() {
  return <div className="space-y-6"><SectionHeading eyebrow="Registro contable / datos duros" title="Ledger" description="Serie completa del saldo y parámetros matemáticos utilizados por el modelo." /><Panel><div className="grid gap-3 sm:grid-cols-4">{[["B₀", "$5,200"], ["μ", "-0.041"], ["σ", "0.18"], ["Intervalo", "95%"]].map(([label, value]) => <div className="rounded-2xl bg-[#F5F5F7] p-4" key={label}><p className="text-xs text-slate-500">{label}</p><p className="mt-2 font-jakarta text-lg font-semibold text-black">{value}</p></div>)}</div><div className="mt-8 overflow-x-auto"><table className="w-full min-w-[680px] text-left text-sm"><thead><tr className="border-b border-[#B9B9B9] text-xs uppercase tracking-[0.1em] text-slate-500"><th className="pb-3 font-semibold">Fecha</th><th className="pb-3 font-semibold">Descripción</th><th className="pb-3 font-semibold">Tipo</th><th className="pb-3 text-right font-semibold">Importe</th><th className="pb-3 text-right font-semibold">Estado</th></tr></thead><tbody>{transactions.map((transaction) => <tr className="border-b border-[#E5E5E5]" key={`${transaction.date}-${transaction.description}`}><td className="py-4 text-slate-500">{transaction.date}</td><td className="py-4 font-semibold text-black">{transaction.description}</td><td className="py-4 text-slate-500">{transaction.type}</td><td className={`py-4 text-right font-semibold ${transaction.amount.startsWith("+") ? "text-emerald-700" : "text-[#A94148]"}`}>{transaction.amount}</td><td className="py-4 text-right text-slate-500">{transaction.status}</td></tr>)}</tbody></table></div><div className="mt-6 flex flex-wrap gap-2 text-xs text-slate-500"><span>serie_saldo:</span>{account.serie_saldo.map((value) => <span className="rounded-full bg-[#F5F5F7] px-2 py-1" key={value}>{value}</span>)}</div></Panel></div>;
}

function VaultView() {
  return <div className="space-y-6"><SectionHeading eyebrow="Seguridad y resguardo" title="Bóveda" description="Metadatos, auditoría de automatizaciones y controles de bloqueo de la cuenta." /><div className="grid gap-6 xl:grid-cols-2"><Panel><div className="flex items-center gap-3"><ShieldCheck className="text-black" size={22} /><h2 className="font-jakarta text-xl font-semibold text-black">Metadatos de cuenta</h2></div><dl className="mt-6 divide-y divide-[#E5E5E5]">{[["account_id", account.account_id], ["fecha_calculo", account.fecha_calculo], ["webhook_disparado", "Sí"], ["ejecutado_por", account.webhook_ejecutado_por]].map(([label, value]) => <div className="flex justify-between gap-4 py-4 text-sm" key={label}><dt className="text-slate-500">{label}</dt><dd className="font-semibold text-black">{value}</dd></div>)}</dl></Panel><Panel><div className="flex items-center gap-3"><LockKeyhole className="text-black" size={22} /><h2 className="font-jakarta text-xl font-semibold text-black">Controles de resguardo</h2></div><div className="mt-6 space-y-4"><div className="flex items-start gap-3 rounded-2xl bg-[#F5F5F7] p-4"><CheckCircle2 className="mt-0.5 text-emerald-700" size={18} /><div><p className="text-sm font-semibold text-black">Auditoría registrada</p><p className="mt-1 text-xs text-slate-500">El webhook de riesgo dejó un registro verificable.</p></div></div><button className="flex w-full items-center justify-center gap-2 rounded-full border border-black px-4 py-3 text-sm font-semibold text-black transition hover:bg-black hover:text-white" type="button"><Download size={16} />Exportar estado de cuenta</button><button className="flex w-full items-center justify-center gap-2 rounded-full border border-[#A94148] px-4 py-3 text-sm font-semibold text-[#A94148] transition hover:bg-[#A94148] hover:text-white" type="button"><TriangleAlert size={16} />Bloquear cuenta</button></div></Panel></div></div>;
}

export default function DashboardViews({ activeItem }) {
  if (activeItem === "Proyecto") return <ProjectView />;
  if (activeItem === "Ledger") return <LedgerView />;
  if (activeItem === "Bóveda") return <VaultView />;
  return <ExecutiveView />;
}
