import { AlertTriangle, CheckCircle2, Download, LockKeyhole, ShieldCheck, TriangleAlert } from "lucide-react";
import { ignitionMock } from "../data/ignitionMock";

let data = ignitionMock;
import CreditOfferAlert from "./CreditOfferAlert";

const Panel = ({ children, className = "" }) => <section className={`rounded-[28px] border border-[#B9B9B9] bg-white p-6 ${className}`}>{children}</section>;
const Heading = ({ eyebrow, title, description }) => <div><p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">{eyebrow}</p><h1 className="mt-3 font-jakarta text-3xl font-semibold leading-tight text-black">{title}</h1><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">{description}</p></div>;
const Kpi = ({ label, value, context }) => <article className="rounded-[24px] border border-[#B9B9B9] bg-white p-5"><p className="text-xs font-semibold uppercase tracking-[0.1em] text-slate-500">{label}</p><p className="mt-5 font-jakarta text-2xl font-semibold text-black">{value}</p><p className="mt-2 text-xs text-[#A94148]">{context}</p></article>;

function Trajectory({ data }) {
  const points = data.serie_saldo.length ? data.serie_saldo : [{ dia: 0, saldo: data.parametros.B0 }];
  const observed = points.filter((point) => point.dia <= data.dia_observado);
  const projected = points.filter((point) => point.dia >= data.dia_observado);
  const maxDay = Math.max(...points.map((point) => point.dia), 30);
  const maxValue = Math.max(...points.map((point) => point.saldo), data.parametros.B0, 0);
  const minValue = Math.min(...points.map((point) => point.saldo), 0);
  const valueRange = Math.max(maxValue - minValue, 1);
  const y = (value) => 64 - ((value - minValue) / valueRange) * 46;
  const x = (day) => 10 + (day / maxDay) * 140;
  const line = (series) => series.map((point) => `${x(point.dia)},${y(point.saldo)}`).join(" ");
  const band = projected.map((point) => {
    const spread = data.parametros.sigma * Math.sqrt(Math.max(point.dia - data.dia_observado, 0));
    return `${x(point.dia)},${y(point.saldo + spread)}`;
  }).concat([...projected].reverse().map((point) => {
    const spread = data.parametros.sigma * Math.sqrt(Math.max(point.dia - data.dia_observado, 0));
    return `${x(point.dia)},${y(point.saldo - spread)}`;
  })).join(" ");
  const observedEnd = observed[observed.length - 1];
  const ticks = [0, Math.round(data.dia_observado), Math.round(maxDay)];
  const expectedDay = Math.round(data.prediccion.dia_esperado_quiebra);
  return <div className="mt-6 rounded-[22px] bg-[#F5F5F7] p-4 sm:p-5"><div className="mb-3 flex flex-wrap items-center gap-x-5 gap-y-2 text-[11px] font-semibold text-slate-500"><span className="flex items-center gap-2"><i className="h-2 w-2 rounded-full bg-[#008C72]" />Saldo observado</span><span className="flex items-center gap-2"><i className="h-2 w-2 rounded-full bg-[#516174]" />Proyección</span><span className="flex items-center gap-2"><i className="h-2 w-2 rounded-full bg-[#E7B9AA]" />Intervalo de incertidumbre</span></div><svg aria-label="Gráfica de trayectoria del saldo con proyección e intervalo de incertidumbre" className="h-[300px] w-full" role="img" viewBox="0 0 160 80"><line stroke="#CBD5E1" strokeDasharray="1.5 2" strokeWidth="0.5" x1="10" x2="150" y1={y(0)} y2={y(0)} /><line stroke="#CBD5E1" strokeDasharray="1.5 2" strokeWidth="0.5" x1={x(data.dia_observado)} x2={x(data.dia_observado)} y1="8" y2="66" /><polygon fill="#E7B9AA" opacity="0.45" points={band} /><polyline className="chart-draw" fill="none" points={line(observed)} stroke="#008C72" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.25" /><polyline className="chart-draw" fill="none" points={line(projected)} stroke="#516174" strokeDasharray="2 1.5" strokeLinecap="round" strokeLinejoin="round" strokeWidth="0.95" /><circle cx={x(observedEnd.dia)} cy={y(observedEnd.saldo)} fill="#008C72" r="1.7"><title>Día {Math.round(observedEnd.dia)}: ${observedEnd.saldo.toFixed(0)}</title></circle>{projected.filter((_, index) => index === 0 || index === projected.length - 1).map((point) => <circle cx={x(point.dia)} cy={y(point.saldo)} fill="#516174" key={point.dia} r="1.3"><title>Proyección, día {Math.round(point.dia)}: ${point.saldo.toFixed(0)}</title></circle>)}<text fill="#64748B" fontSize="3.4" fontWeight="600" x={x(data.dia_observado) + 1} y="11">AHORA</text>{ticks.map((tick, index) => <text fill="#64748B" fontSize="3.2" key={tick} textAnchor={index === 0 ? "start" : index === ticks.length - 1 ? "end" : "middle"} x={x(tick)} y="73">Día {tick}</text>)}<text fill="#64748B" fontSize="3.2" textAnchor="end" x="9" y={y(maxValue) + 1}>${Math.round(maxValue)}</text><text fill="#64748B" fontSize="3.2" textAnchor="end" x="9" y={y(0) + 1}>$0</text></svg><div className="mt-2 flex flex-wrap justify-between gap-2 text-[11px] text-slate-500"><span>Inicio · ${points[0].saldo.toFixed(0)}</span><span>Saldo actual · ${observedEnd.saldo.toFixed(0)}</span><span className="font-semibold text-[#A94148]">Quiebre estimado · día {expectedDay}</span></div></div>;
}

function Executive({ data }) {
  const lastPoint = data.serie_saldo[data.serie_saldo.length - 1];
  const probability = data.riesgo.prob_quiebra_antes_finiquito;
  return <div className="space-y-6"><Heading eyebrow="Vista ejecutiva" title="Centro de Mando" description="Dirección del saldo y nivel de intervención del motor de ignición financiera." /><div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"><Kpi label="Operating Balance" value={`$${lastPoint.saldo.toFixed(2)}`} context={`Saldo observado · día ${Math.round(lastPoint.dia)}`} /><Kpi label="Burn Rate" value={`$${Math.abs(data.parametros.mu).toFixed(2)}`} context="Drift μ del modelo" /><Kpi label="Runway" value={`Día ${Math.round(data.prediccion.dia_esperado_quiebra)}`} context="Quiebre esperado" /><Kpi label="Risk state" value={`${(probability * 100).toFixed(0)}%`} context="Probabilidad antes del finiquito" /></div><CreditOfferAlert data={data} /><div className="grid gap-6 xl:grid-cols-[minmax(0,3fr)_minmax(280px,2fr)]"><Panel><p className="text-xs font-semibold uppercase tracking-[0.1em] text-slate-500">Vista 1 · Trayectoria</p><h2 className="mt-2 font-jakarta text-xl font-semibold text-black">Liquidez observada</h2><Trajectory data={data} /></Panel><Panel className="flex flex-col justify-between"><div><p className="text-xs font-semibold uppercase tracking-[0.1em] text-slate-500">Vista 4 · Semáforo</p><h2 className="mt-2 font-jakarta text-xl font-semibold text-black">Intervención inmediata</h2><div className="mt-7 flex items-center gap-4"><div className="grid h-16 w-16 place-items-center rounded-full bg-[#FCE8E8] text-[#A94148]"><AlertTriangle size={30} /></div><div><p className="font-jakarta text-3xl font-semibold text-[#A94148]">{(probability * 100).toFixed(0)}%</p><p className="mt-1 text-xs text-slate-500">probabilidad antes del finiquito</p></div></div></div><div className="mt-8 border-t border-[#B9B9B9] pt-5 text-sm leading-6 text-slate-600">Estado: <strong>{data.riesgo.estado}</strong>. Umbral: {data.riesgo.umbral_alerta}.</div></Panel></div></div>;
}

function InverseGaussian({ data }) {
  const expected = data.prediccion.dia_esperado_quiebra;
  const low = data.prediccion.intervalo_confianza_90[0];
  const high = data.prediccion.intervalo_confianza_90[1];
  const spread = Math.max((high - low) / 3.29, 1);
  const maxDay = Math.max(40, Math.ceil(high + 5));
  const x = (day) => 12 + (day / maxDay) * 376;
  const density = (day) => Math.exp(-0.5 * ((day - expected) / spread) ** 2);
  const curve = Array.from({ length: 81 }, (_, index) => {
    const day = index / 2;
    return `${x(day)},${160 - density(day) * 132}`;
  }).join(" ");
  const bandX = Math.max(12, x(low));
  const bandWidth = Math.max(Math.min(x(high), 388) - bandX, 2);
  const expectedX = Math.min(Math.max(x(expected), 12), 388);
  const expectedDay = Math.round(expected);
  return <svg aria-label="Distribución gaussiana inversa con intervalo de confianza y día esperado de quiebre" className="h-[235px] w-full" role="img" viewBox="0 0 400 180"><rect fill="#DDE2E8" height="145" opacity="0.8" rx="3" width={bandWidth} x={bandX} y="15" /><polyline className="chart-draw" fill="none" points={curve} stroke="#1769D1" strokeLinecap="round" strokeWidth="2.5" /><line stroke="#A94148" strokeDasharray="5 5" strokeWidth="2" x1={expectedX} x2={expectedX} y1="15" y2="160" /><circle cx={expectedX} cy={160 - density(expected) * 132} fill="#A94148" r="3"><title>Día esperado: {expectedDay} días</title></circle><line stroke="#B9B9B9" x1="12" x2="388" y1="160" y2="160" /><text fill="#A94148" fontSize="11" fontWeight="600" x={Math.min(expectedX + 6, 330)} y="30">Día esperado: {expectedDay}</text><text fill="#64748B" fontSize="9" x="15" y="174">Días hasta el quiebre</text><text fill="#64748B" fontSize="8" textAnchor="middle" x={bandX + bandWidth / 2} y="12">IC 90%</text><text fill="#64748B" fontSize="8" textAnchor="middle" x={expectedX} y="174">Día {expectedDay}</text></svg>;
}

function Project({ data }) {
  const confidence90 = data.prediccion.intervalo_confianza_90.map((day) => Math.round(day));
  const confidence50 = data.prediccion.intervalo_confianza_50.map((day) => Math.round(day));
  return <div className="space-y-6"><Heading eyebrow="Diagnóstico operativo" title="Proyecto" description="Distribución de quiebra asociada a la fecha de finiquito definida por el motor." /><div className="grid gap-6 xl:grid-cols-[minmax(0,2fr)_minmax(280px,3fr)]"><Panel><p className="text-xs font-semibold uppercase tracking-[0.1em] text-slate-500">Finiquito del proyecto</p><p className="mt-5 font-jakarta text-3xl font-semibold text-black">{data.riesgo.fecha_finiquito}</p><div className="mt-8 h-1.5 overflow-hidden rounded-full bg-[#F5F5F7]"><div className="h-full rounded-full bg-[#A94148]" style={{ width: `${data.riesgo.prob_quiebra_antes_finiquito * 100}%` }} /></div><div className="mt-3 flex justify-between text-xs text-slate-500"><span>Umbral {data.riesgo.umbral_alerta}</span><span>Riesgo {data.riesgo.prob_quiebra_antes_finiquito}</span></div></Panel><Panel><p className="text-xs font-semibold uppercase tracking-[0.1em] text-slate-500">Vista 2 · Distribución</p><h2 className="mt-2 font-jakarta text-xl font-semibold text-black">Gaussiana inversa</h2><div className="mt-6 rounded-[22px] bg-[#F5F5F7] p-4"><InverseGaussian data={data} /></div><div className="mt-4 grid grid-cols-2 gap-3 text-sm"><div className="rounded-2xl bg-[#F5F5F7] p-3"><p className="text-xs text-slate-500">IC 90%</p><p className="mt-1 font-semibold text-black">{data.prediccion.intervalo_confianza_90.join(" - ")} días</p></div><div className="rounded-2xl bg-[#F5F5F7] p-3"><p className="text-xs text-slate-500">IC 50%</p><p className="mt-1 font-semibold text-black">{data.prediccion.intervalo_confianza_50.join(" - ")} días</p></div></div></Panel></div></div>;
  return <div className="space-y-6"><Heading eyebrow="Diagnóstico operativo" title="Proyecto" description="Distribución de quiebre asociada a la fecha de finiquito definida por el motor." /><div className="grid gap-6 xl:grid-cols-[minmax(0,2fr)_minmax(280px,3fr)]"><Panel><p className="text-xs font-semibold uppercase tracking-[0.1em] text-slate-500">Finiquito del proyecto</p><p className="mt-5 font-jakarta text-3xl font-semibold text-black">{data.riesgo.fecha_finiquito}</p><div className="mt-8 h-1.5 overflow-hidden rounded-full bg-[#F5F5F7]"><div className="h-full rounded-full bg-[#A94148]" style={{ width: `${data.riesgo.prob_quiebra_antes_finiquito * 100}%` }} /></div><div className="mt-3 flex justify-between text-xs text-slate-500"><span>Umbral {data.riesgo.umbral_alerta}</span><span>Riesgo {data.riesgo.prob_quiebra_antes_finiquito}</span></div></Panel><Panel><p className="text-xs font-semibold uppercase tracking-[0.1em] text-slate-500">Vista 2 · Distribución</p><h2 className="mt-2 font-jakarta text-xl font-semibold text-black">Gaussiana inversa</h2><div className="mt-6 rounded-[22px] bg-[#F5F5F7] p-4"><InverseGaussian data={data} /></div><div className="mt-4 grid grid-cols-2 gap-3 text-sm"><div className="rounded-2xl bg-[#F5F5F7] p-3"><p className="text-xs text-slate-500">IC 90%</p><p className="mt-1 font-semibold text-black">{confidence90.join(" - ")} días</p></div><div className="rounded-2xl bg-[#F5F5F7] p-3"><p className="text-xs text-slate-500">IC 50%</p><p className="mt-1 font-semibold text-black">{confidence50.join(" - ")} días</p></div></div></Panel></div></div>;
}

function Ledger({ data }) {
  const parameters = [["B₀", `$${data.parametros.B0.toFixed(2)}`], ["μ", data.parametros.mu], ["σ", data.parametros.sigma], ["Ventana", `${data.parametros.ventana_dias} días`]];
  return <div className="space-y-6"><Heading eyebrow="Registro contable / datos duros" title="Ledger" description="Valores emitidos por el motor, sin transformaciones matemáticas en el frontend." /><Panel><div className="grid gap-3 sm:grid-cols-4">{parameters.map(([label, value]) => <div className="rounded-2xl bg-[#F5F5F7] p-4" key={label}><p className="text-xs text-slate-500">{label}</p><p className="mt-2 font-jakarta text-lg font-semibold text-black">{value}</p></div>)}</div><div className="mt-8 overflow-x-auto"><table className="w-full min-w-[460px] text-left text-sm"><thead><tr className="border-b border-[#B9B9B9] text-xs uppercase tracking-[0.1em] text-slate-500"><th className="pb-3 font-semibold">Día</th><th className="pb-3 font-semibold">Serie saldo</th><th className="pb-3 text-right font-semibold">Valor</th></tr></thead><tbody>{data.serie_saldo.map((point) => <tr className="border-b border-[#E5E5E5]" key={point.dia}><td className="py-4 text-slate-500">{point.dia}</td><td className="py-4 font-semibold text-black">saldo</td><td className="py-4 text-right font-semibold text-black">${point.saldo.toFixed(2)}</td></tr>)}</tbody></table></div></Panel></div>;
}

function Vault({ data }) {
  const metadata = [["account_id", data.account_id], ["fecha_calculo", data.fecha_calculo], ["dia_observado", data.dia_observado], ["webhook_disparado", data.riesgo.webhook_disparado ? "Sí" : "No"]];
  return <div className="space-y-6"><Heading eyebrow="Seguridad y resguardo" title="Bóveda" description="Metadatos y estado de auditoría emitidos por el motor de ignición financiera." /><div className="grid gap-6 xl:grid-cols-2"><Panel><div className="flex items-center gap-3"><ShieldCheck size={22} /><h2 className="font-jakarta text-xl font-semibold text-black">Metadatos de cuenta</h2></div><dl className="mt-6 divide-y divide-[#E5E5E5]">{metadata.map(([label, value]) => <div className="flex justify-between gap-4 py-4 text-sm" key={label}><dt className="text-slate-500">{label}</dt><dd className="font-semibold text-black">{value}</dd></div>)}</dl></Panel><Panel><div className="flex items-center gap-3"><LockKeyhole size={22} /><h2 className="font-jakarta text-xl font-semibold text-black">Controles de resguardo</h2></div><div className="mt-6 space-y-4"><div className="flex items-start gap-3 rounded-2xl bg-[#F5F5F7] p-4"><CheckCircle2 className="mt-0.5 text-emerald-700" size={18} /><div><p className="text-sm font-semibold text-black">Webhook de riesgo disparado</p><p className="mt-1 text-xs text-slate-500">El contrato confirma una alerta automática.</p></div></div><button className="flex w-full items-center justify-center gap-2 rounded-full border border-black px-4 py-3 text-sm font-semibold text-black transition hover:bg-black hover:text-white" type="button"><Download size={16} />Exportar estado de cuenta</button><button className="flex w-full items-center justify-center gap-2 rounded-full border border-[#A94148] px-4 py-3 text-sm font-semibold text-[#A94148] transition hover:bg-[#A94148] hover:text-white" type="button"><TriangleAlert size={16} />Bloquear cuenta</button></div></Panel></div></div>;
}

export default function IgnitionViews({ activeItem, data: runtimeData = ignitionMock }) {
  data = runtimeData;
  if (activeItem === "Proyecto") return <Project data={data} />;
  if (activeItem === "Ledger") return <Ledger data={data} />;
  if (activeItem === "Bóveda") return <Vault data={data} />;
  return <Executive data={data} />;
}
