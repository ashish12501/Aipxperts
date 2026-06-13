function Header({ user, onLogout }) {
  return (
    <header className="sticky top-0 z-10 border-b border-orange-200 bg-[#fff8f3]/95 px-4 py-4 backdrop-blur md:px-6">
      <div className="flex items-center justify-between gap-4">
        <div className="w-full max-w-3xl">
          <input
            type="text"
            placeholder="Search menu items... (⌘K)"
            className="w-full rounded-xl border border-orange-200 bg-white px-4 py-2.5 text-sm text-zinc-700 outline-none transition focus:border-orange-400 focus:ring-4 focus:ring-orange-100"
          />
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            className="rounded-xl border border-orange-200 bg-white px-3 py-2 text-sm text-zinc-700 hover:bg-orange-50"
          >
            Alerts
          </button>
          <button
            type="button"
            onClick={onLogout}
            className="rounded-xl border border-orange-200 bg-white px-3 py-2 text-sm text-zinc-700 hover:bg-orange-50"
          >
            Logout
          </button>
          <div
            title={user?.name || "Admin"}
            className="grid h-9 w-9 place-items-center rounded-full border border-orange-300 bg-orange-500 text-sm font-bold text-white"
          >
            {(user?.name || "A").slice(0, 1).toUpperCase()}
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;
