import { ArrowDownRight, ArrowUpRight, Clock3, CreditCard, Wallet } from "lucide-react";

const kpis = [
  {
    label: "Operating Balance",
    value: "$24,680.00",
    change: "+8.4%",
    context: "vs. last month",
    icon: Wallet,
    trend: "positive"
  },
  {
    label: "Burn Rate",
    value: "$3,240.00",
    change: "-4.2%",
    context: "vs. last month",
    icon: ArrowDownRight,
    trend: "positive"
  },
  {
    label: "Runway",
    value: "7.6 months",
    change: "+0.8 mo",
    context: "at current burn",
    icon: Clock3,
    trend: "positive"
  },
  {
    label: "Today's Transactions",
    value: "128",
    change: "+12.5%",
    context: "vs. daily average",
    icon: CreditCard,
    trend: "neutral"
  }
];

function Trend({ value, trend }) {
  const isPositive = trend === "positive";
  const TrendIcon = isPositive ? ArrowUpRight : ArrowDownRight;
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-semibold ${isPositive ? "text-emerald-600" : "text-slate-500"}`}>
      <TrendIcon size={14} strokeWidth={2} />
      {value}
    </span>
  );
}

function KpiCard({ kpi }) {
  const Icon = kpi.icon;
  return (
    <article className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-float transition-all duration-300 ease-out hover:-translate-y-0.5 hover:shadow-lg">
      <div className="flex items-start justify-between gap-4">
        <p className="text-xs font-medium text-slate-500">{kpi.label}</p>
        <div className="grid h-8 w-8 place-items-center rounded-xl bg-slate-50 text-slate-500">
          <Icon size={16} strokeWidth={1.8} />
        </div>
      </div>
      <p className="mt-5 text-2xl font-semibold tracking-[-0.03em] text-slate-950">{kpi.value}</p>
      <div className="mt-3 flex items-center gap-2">
        <Trend value={kpi.change} trend={kpi.trend} />
        <span className="text-xs text-slate-400">{kpi.context}</span>
      </div>
    </article>
  );
}

export default function KpiGrid() {
  return (
    <section aria-labelledby="kpi-grid-title">
      <h2 id="kpi-grid-title" className="sr-only">Key performance indicators</h2>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {kpis.map((kpi) => <KpiCard key={kpi.label} kpi={kpi} />)}
      </div>
    </section>
  );
}
