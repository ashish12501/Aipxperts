import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/layout/Header.jsx";
import Sidebar from "../components/layout/Sidebar.jsx";
import DashboardMain from "../components/tabs/DashboardMain.jsx";
import Menu from "../components/tabs/Menu.jsx";
import Orders from "../components/tabs/Orders.jsx";
import { useAuth } from "../context/AuthContext.jsx";

function DashboardPage() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState("menu");

  const ActiveComponent = useMemo(() => {
    if (activeTab === "dashboard") return DashboardMain;
    if (activeTab === "orders") return Orders;
    return Menu;
  }, [activeTab]);

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <main className="min-h-screen bg-[#fff8f3]">
      <div className="mx-auto flex min-h-screen max-w-[1600px] flex-col md:flex-row">
        <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />

        <div className="flex min-w-0 flex-1 flex-col">
          <Header user={user} onLogout={handleLogout} />
          <section className="p-4 md:p-6">
            <ActiveComponent />
          </section>
        </div>
      </div>
    </main>
  );
}

export default DashboardPage;
