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

function App() {
  const [activeItem, setActiveItem] = useState("Centro de Mando");
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [ignitionData, setIgnitionData] = useState(ignitionMock);
  const [accountId, setAccountId] = useState("acc_burnout_001");
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
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
        if (!response.ok) throw new Error("Ignition API unavailable");
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
                onChange={(event) => setAccountId(event.target.value)}
                value={accountId}
              >
                <option value="acc_burnout_001">acc_burnout_001</option>
                <option value="acc_burnout_002">acc_burnout_002</option>
                <option value="acc_normal_001">acc_normal_001</option>
                <option value="acc_normal_002">acc_normal_002</option>
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
