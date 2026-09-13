import { useEffect, useState } from "react";
import {
  Archive,
  BriefcaseBusiness,
  LayoutDashboard,
  Menu,
  PanelLeftClose,
  WalletCards
} from "lucide-react";
import DashboardViews from "./components/IgnitionViews";
import { ignitionMock } from "./data/ignitionMock";

const navigationItems = [
  { label: "Centro de Mando", icon: LayoutDashboard },
  { label: "Proyecto", icon: BriefcaseBusiness },
  { label: "Ledger", icon: WalletCards },
  { label: "Bóveda", icon: Archive }
];

const CUSTOM_ACCOUNT = "__custom_company__";
const initialCompany = {
  company_name: "Mi PYME",
  initial_balance: 5000,
  average_daily_spend: 50,
  debt_balance_ratio: 0.25,
  payment_balance_ratio: 0.1,
  days_until_empty: 60,
  burnout: false
};

function Sidebar({ activeItem, onSelect, isOpen, onClose }) {
  return (
    <>
      {isOpen && (
        <button
          aria-label="Cerrar menú"
          className="fixed inset-0 z-20 bg-slate-950/20 lg:hidden"
          onClick={onClose}
          type="button"
        />
      )}
      <aside
        className={`fixed inset-y-0 left-0 z-30 flex h-screen w-[313px] flex-col rounded-[37px] border border-[#B9B9B9] bg-white px-[27px] py-8 transition-transform duration-300 ease-out lg:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between">
          <div className="flex h-[58px] w-full items-center justify-center rounded-[18px] border border-[#003B63] bg-[#004977] px-4 font-jakarta text-[23px] font-extrabold leading-7 tracking-[-0.02em] text-white shadow-[0_6px_14px_rgba(0,73,119,0.22)]">
            DayZero
          </div>
          <button
            aria-label="Cerrar menú"
            className="rounded-lg p-2 text-slate-400 transition hover:bg-white hover:text-slate-700 lg:hidden"
            onClick={onClose}
            type="button"
          >
            <PanelLeftClose size={18} />
          </button>
        </div>

        <nav aria-label="Navegación principal" className="mt-[95px] space-y-[42px]">
          {navigationItems.map(({ label, icon: Icon }) => {
            const isActive = activeItem === label;
            return (
              <button
                aria-current={isActive ? "page" : undefined}
                className={`group flex h-[58px] w-[260px] items-center gap-[10px] rounded-[100px] px-2.5 text-left font-jakarta text-[24px] font-semibold leading-[33.6px] transition-all duration-300 ease-out ${
                  isActive
                    ? "bg-white text-black shadow-[0_3px_10px_2px_rgba(0,0,0,0.15)]"
                    : "text-black hover:bg-[#F5F5F7]"
                }`}
                key={label}
                onClick={() => {
                  onSelect(label);
                  onClose();
                }}
                type="button"
              >
                <Icon className={isActive ? "text-black" : "text-black"} size={30} strokeWidth={1.8} />
                <span>{label}</span>
              </button>
            );
          })}
        </nav>

      </aside>
    </>
  );
}

function CustomCompanyForm({ values, onChange, onSubmit, isLoading }) {
  const update = (field) => (event) => onChange({
    ...values,
    [field]: event.target.type === "checkbox" ? event.target.checked : event.target.value
  });
  const inputClass = "mt-2 w-full rounded-2xl border border-[#B9B9B9] px-4 py-3 font-normal text-black outline-none focus:border-[#004977]";
  return <form className="mt-8 max-w-4xl rounded-[28px] border border-[#B9B9B9] bg-white p-6 sm:p-8" onSubmit={onSubmit}>
    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Nueva PYME</p>
    <h1 className="mt-3 font-jakarta text-3xl font-semibold text-black">Configura tu escenario</h1>
    <p className="mt-2 text-sm leading-6 text-slate-500">Introduce los datos principales para generar una trayectoria personalizada.</p>
    <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <label className="text-sm font-semibold text-slate-700 lg:col-span-2">Nombre de la PYME<input required value={values.company_name} onChange={update("company_name")} className={inputClass} /></label>
      <label className="text-sm font-semibold text-slate-700">Saldo inicial<input required min="1" step="0.01" type="number" value={values.initial_balance} onChange={update("initial_balance")} className={inputClass} /></label>
      <label className="text-sm font-semibold text-slate-700">Gasto diario promedio<input required min="1" step="0.01" type="number" value={values.average_daily_spend} onChange={update("average_daily_spend")} className={inputClass} /></label>
      <label className="text-sm font-semibold text-slate-700">Deuda / saldo<input required min="0" max="1" step="0.01" type="number" value={values.debt_balance_ratio} onChange={update("debt_balance_ratio")} className={inputClass} /></label>
      <label className="text-sm font-semibold text-slate-700">Pagos / saldo<input required min="0" max="1" step="0.01" type="number" value={values.payment_balance_ratio} onChange={update("payment_balance_ratio")} className={inputClass} /></label>
      <label className="text-sm font-semibold text-slate-700">Días hasta agotar saldo<input required min="1" max="3650" step="1" type="number" value={values.days_until_empty} onChange={update("days_until_empty")} className={inputClass} /></label>
    </div>
    <label className="mt-5 flex items-center gap-3 text-sm font-semibold text-slate-700"><input checked={values.burnout} onChange={update("burnout")} className="h-4 w-4 accent-[#A94148]" type="checkbox" />La PYME presenta señales de burnout financiero</label>
    <button className="mt-7 rounded-full bg-[#004977] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#003B63] disabled:opacity-60" disabled={isLoading} type="submit">{isLoading ? "Generando escenario..." : "Generar escenario"}</button>
  </form>;
}

function App() {
  const [activeItem, setActiveItem] = useState("Centro de Mando");
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [ignitionData, setIgnitionData] = useState(ignitionMock);
  const [accountId, setAccountId] = useState("acc_burnout_001");
  const [accountIds, setAccountIds] = useState(["acc_burnout_001"]);
  const [company, setCompany] = useState(initialCompany);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    const apiBaseUrl = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";
    fetch(`${apiBaseUrl}/api/accounts`)
      .then((response) => {
        if (!response.ok) throw new Error("No se pudieron obtener las cuentas");
        return response.json();
      })
      .then(({ accounts }) => {
        if (Array.isArray(accounts) && accounts.length > 0) {
          setAccountIds(accounts);
          setAccountId((currentAccountId) =>
            accounts.includes(currentAccountId) ? currentAccountId : accounts[0]
          );
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (accountId === CUSTOM_ACCOUNT) return undefined;
    const controller = new AbortController();
    let isMounted = true;
    setIsLoading(true);
    setIgnitionData(null);
    setLoadError("");
    const apiBaseUrl = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";
    fetch(`${apiBaseUrl}/api/generate?account_id=${encodeURIComponent(accountId)}`, {
      signal: controller.signal
    })
      .then((response) => {
        if (!response.ok) {
          return response.json().then(({ detail }) => {
            throw new Error(detail || "Ignition API unavailable");
          });
        }
        return response.json();
      })
      .then((payload) => {
        if (isMounted) setIgnitionData(payload);
      })
      .catch((error) => {
        if (isMounted && error.name !== "AbortError") {
          setLoadError(`No se pudo cargar ${accountId}: ${error.message}`);
        }
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
      controller.abort();
    };
  }, [accountId]);

  const generateCustomCompany = (event) => {
    event.preventDefault();
    setIsLoading(true);
    setIgnitionData(null);
    setLoadError("");
    const apiBaseUrl = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";
    fetch(`${apiBaseUrl}/api/generate/custom`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...company,
        initial_balance: Number(company.initial_balance),
        average_daily_spend: Number(company.average_daily_spend),
        debt_balance_ratio: Number(company.debt_balance_ratio),
        payment_balance_ratio: Number(company.payment_balance_ratio),
        days_until_empty: Number(company.days_until_empty)
      })
    })
      .then(async (response) => {
        const payload = await response.json();
        if (!response.ok) throw new Error(payload.detail || "No se pudo generar la PYME");
        return payload;
      })
      .then(setIgnitionData)
      .catch((error) => setLoadError(`No se pudo generar ${company.company_name}: ${error.message}`))
      .finally(() => setIsLoading(false));
  };

  const generateAutomaticCompany = () => {
    setAccountId(CUSTOM_ACCOUNT);
    setIsLoading(true);
    setIgnitionData(null);
    setLoadError("");
    const apiBaseUrl = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";
    fetch(`${apiBaseUrl}/api/generate/random`, { method: "POST" })
      .then(async (response) => {
        const payload = await response.json();
        if (!response.ok) throw new Error(payload.detail || "No se pudo generar la PYME");
        return payload;
      })
      .then(setIgnitionData)
      .catch((error) => setLoadError(`No se pudo generar una PYME: ${error.message}`))
      .finally(() => setIsLoading(false));
  };

  const handleAccountChange = (event) => {
    if (event.target.value === CUSTOM_ACCOUNT) {
      generateAutomaticCompany();
      return;
    }
    setAccountId(event.target.value);
  };

  return (
    <div className="min-h-screen bg-[#F5F5F7] text-slate-900">
      <div className="flex min-h-screen">
        <Sidebar
          activeItem={activeItem}
          isOpen={isSidebarOpen}
          onClose={() => setSidebarOpen(false)}
          onSelect={setActiveItem}
        />
        <main className="min-w-0 flex-1 lg:ml-[313px]">
          <header className="flex h-[112px] items-center border-b border-black bg-[#F5F5F7] px-5 sm:px-8 lg:px-[21px]">
            <button
              aria-label="Abrir menú"
              className="rounded-xl p-2 text-slate-500 transition hover:bg-white hover:text-slate-900 lg:hidden"
              onClick={() => setSidebarOpen(true)}
              type="button"
            >
              <Menu size={20} />
            </button>
            <label className="ml-auto flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.1em] text-slate-500">
              Cuenta
              <select
                aria-label="Seleccionar cuenta"
                className="rounded-full border border-[#B9B9B9] bg-white px-4 py-2 text-sm font-normal normal-case tracking-normal text-black"
                disabled={isLoading}
                onChange={handleAccountChange}
                value={accountId}
              >
                {accountIds.map((availableAccountId) => (
                  <option key={availableAccountId} value={availableAccountId}>
                    {availableAccountId}
                  </option>
                ))}
                <option value={CUSTOM_ACCOUNT}>+ Agregar nueva PYME</option>
              </select>
            </label>
            {loadError && <span className="ml-4 text-xs font-semibold text-[#A94148]">{loadError}</span>}
          </header>
          <section className="px-5 py-10 sm:px-8 lg:px-12 lg:py-14">
            {ignitionData ? (
              <DashboardViews activeItem={activeItem} data={ignitionData} />
            ) : (
              <div className="rounded-[28px] border border-[#B9B9B9] bg-white p-8 text-sm text-slate-500">
                {isLoading ? "Cargando la cuenta seleccionada..." : loadError}
              </div>
            )}
          </section>
        </main>
      </div>
    </div>
  );
}

export default App;
