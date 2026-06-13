import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import AuthShell from "../components/auth/AuthShell.jsx";
import { useAuth } from "../context/AuthContext.jsx";

function LoginPage() {
  const navigate = useNavigate();
  const { isAuthenticated, isAuthLoading, login } = useAuth();
  const [email, setEmail] = useState("admin@restaurant.com");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      await login({ email, password });
      navigate("/dashboard");
    } catch (apiError) {
      setError(apiError.message);
    } finally {
      setLoading(false);
    }
  };

  if (isAuthLoading) {
    return (
      <main className="grid min-h-screen place-items-center bg-[#fff9f4]">
        <p className="text-sm font-medium tracking-[0.15em] text-zinc-500">
          CHECKING SESSION...
        </p>
      </main>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <AuthShell
      title="Welcome back"
      subtitle="Please enter your kitchen credentials to continue."
      footer={
        <>
          Need an account?{" "}
          <Link to="/register" className="font-semibold text-orange-500">
            Create one
          </Link>
        </>
      }
    >
      <form className="space-y-5" onSubmit={handleLogin}>
        {error ? (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        ) : null}

        <div>
          <label
            htmlFor="email"
            className="mb-2 block text-sm font-semibold text-zinc-700"
          >
            Email address
          </label>
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="w-full rounded-xl border border-orange-200 bg-orange-50 px-4 py-3 text-zinc-700 outline-none transition focus:border-orange-400 focus:ring-4 focus:ring-orange-100"
          />
        </div>

        <div>
          <div className="mb-2 flex items-center justify-between">
            <label
              htmlFor="password"
              className="text-sm font-semibold text-zinc-700"
            >
              Password
            </label>
          </div>
          <input
            id="password"
            type="password"
            required
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="w-full rounded-xl border border-orange-200 bg-orange-50 px-4 py-3 text-zinc-700 outline-none transition focus:border-orange-400 focus:ring-4 focus:ring-orange-100"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-orange-500 py-3 text-lg font-semibold text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {loading ? "Signing In..." : "Sign In"}
        </button>
      </form>
    </AuthShell>
  );
}

export default LoginPage;
