import { ClipboardList, LayoutDashboard, UtensilsCrossed } from "lucide-react";

const navItems = [
  { key: "dashboard", label: "Dashboard", Icon: LayoutDashboard },
  { key: "menu", label: "Menu", Icon: UtensilsCrossed },
  { key: "orders", label: "Orders", Icon: ClipboardList },
];

function Sidebar({ activeTab, onTabChange }) {
  return (
    <aside className="w-full border-b border-orange-200 bg-white md:w-[260px] md:border-b-0 md:border-r">
      <div className="px-5 py-6">
        <p className="text-3xl font-bold leading-none text-orange-600">ROMS Admin</p>
        <p className="mt-1 text-sm text-zinc-500">Kitchen Central</p>
      </div>

      <nav className="px-3 pb-5 md:pb-8">
        <ul className="flex gap-2 overflow-x-auto md:block md:space-y-2">
          {navItems.map((item) => {
            const isActive = item.key === activeTab;
            const Icon = item.Icon;

            return (
              <li key={item.key}>
                <button
                  type="button"
                  onClick={() => onTabChange(item.key)}
                  className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition ${
                    isActive
                      ? "bg-orange-100 font-semibold text-orange-700"
                      : "text-zinc-700 hover:bg-orange-50"
                  }`}
                >
                  <span className="grid h-7 w-7 place-items-center rounded-md border border-orange-200 bg-white text-orange-600">
                    <Icon size={15} strokeWidth={2.25} />
                  </span>
                  <span className="whitespace-nowrap text-sm">{item.label}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}

export default Sidebar;
