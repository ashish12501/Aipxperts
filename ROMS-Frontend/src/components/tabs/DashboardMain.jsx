import { CheckCircle2, CircleDollarSign, ClipboardList, Clock3 } from "lucide-react";
import { useEffect, useState } from "react";
import api from "../../api/axios.js";

const initialStats = {
  totalOrders: 0,
  pendingOrders: 0,
  deliveredOrders: 0,
  revenue: 0,
};

const statCards = [
  {
    key: "totalOrders",
    label: "Total Orders",
    accent: "from-orange-500 to-amber-500",
    icon: ClipboardList,
  },
  {
    key: "pendingOrders",
    label: "Pending Orders",
    accent: "from-blue-500 to-cyan-500",
    icon: Clock3,
  },
  {
    key: "deliveredOrders",
    label: "Delivered Orders",
    accent: "from-emerald-500 to-green-500",
    icon: CheckCircle2,
  },
  {
    key: "revenue",
    label: "Revenue",
    accent: "from-violet-500 to-fuchsia-500",
    icon: CircleDollarSign,
  },
];

function DashboardMain() {
  const [stats, setStats] = useState(initialStats);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    const fetchDashboardStats = async () => {
      try {
        setError("");
        const response = await api.get("api/dashboard/");

        if (!isMounted) {
          return;
        }

        setStats({
          totalOrders: Number(response?.data?.totalOrders || 0),
          pendingOrders: Number(response?.data?.pendingOrders || 0),
          deliveredOrders: Number(response?.data?.deliveredOrders || 0),
          revenue: Number(response?.data?.revenue || 0),
        });
      } catch (requestError) {
        if (isMounted) {
          setError(
            requestError?.response?.data?.message ||
              "Unable to load dashboard stats."
          );
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchDashboardStats();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <section className="space-y-6">
      <div className="rounded-2xl border border-orange-200 bg-white p-5 sm:p-6">
        <h1 className="text-3xl font-semibold tracking-tight text-zinc-900 sm:text-4xl">
          Dashboard
        </h1>
        <p className="mt-2 text-zinc-600">
          Real-time operational stats from your kitchen.
        </p>
      </div>

      {error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {statCards.map((card) => {
          const Icon = card.icon;
          const value =
            card.key === "revenue"
              ? `Rs. ${Number(stats[card.key]).toLocaleString()}`
              : Number(stats[card.key]).toLocaleString();

          return (
            <article
              key={card.key}
              className="relative overflow-hidden rounded-2xl border border-orange-200 bg-white p-5"
            >
              <div
                className={`pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-gradient-to-br ${card.accent} opacity-20 blur-lg`}
              />
              <div className="relative">
                <div className="mb-5 flex items-center justify-between">
                  <p className="text-sm font-medium text-zinc-500">{card.label}</p>
                  <span className="rounded-lg border border-orange-100 bg-orange-50 p-2 text-orange-600">
                    <Icon size={18} />
                  </span>
                </div>
                <p className="text-3xl font-semibold text-zinc-900">
                  {loading ? "..." : value}
                </p>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}

export default DashboardMain;
