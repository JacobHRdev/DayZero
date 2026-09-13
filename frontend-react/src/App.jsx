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

  useEffect(() => {
    let isMounted = true;
    fetch("http://127.0.0.1:8000/api/ignition")
      .then((response) => {
        if (!response.ok) throw new Error("Ignition API unavailable");
        return response.json();
      })
      .then((payload) => {
        if (isMounted) setIgnitionData(payload);
      })
      .catch(() => {
        if (isMounted) setIgnitionData(ignitionMock);
      });

    return () => {
      isMounted = false;
    };
  }, []);

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
          </header>
          <section className="px-5 py-10 sm:px-8 lg:px-12 lg:py-14">
            <DashboardViews activeItem={activeItem} data={ignitionData} />
          </section>
        </main>
      </div>
    </div>
  );
}

export default App;
