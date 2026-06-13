import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import AuthShell from "../components/auth/AuthShell.jsx";
import { useAuth } from "../context/AuthContext.jsx";

function RegisterPage() {
  const navigate = useNavigate();
  const { isAuthenticated, isAuthLoading, register } = useAuth();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleRegister = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      await register({ name: fullName, email, password });
      navigate("/login");
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
      title="Create account"
      subtitle="Set your kitchen credentials to get started."
      footer={
        <>
          Already registered?{" "}
          <Link to="/login" className="font-semibold text-orange-500">
            Sign in
          </Link>
        </>
      }
    >
      <form className="space-y-5" onSubmit={handleRegister}>
        {error ? (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        ) : null}

        <div>
          <label
            htmlFor="fullName"
            className="mb-2 block text-sm font-semibold text-zinc-700"
          >
            Full name
          </label>
          <input
            id="fullName"
            type="text"
            value={fullName}
            onChange={(event) => setFullName(event.target.value)}
            className="w-full rounded-xl border border-orange-200 bg-orange-50 px-4 py-3 text-zinc-700 outline-none transition focus:border-orange-400 focus:ring-4 focus:ring-orange-100"
            required
          />
        </div>

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
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="w-full rounded-xl border border-orange-200 bg-orange-50 px-4 py-3 text-zinc-700 outline-none transition focus:border-orange-400 focus:ring-4 focus:ring-orange-100"
            required
          />
        </div>

        <div>
          <label
            htmlFor="password"
            className="mb-2 block text-sm font-semibold text-zinc-700"
          >
            Password
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="w-full rounded-xl border border-orange-200 bg-orange-50 px-4 py-3 text-zinc-700 outline-none transition focus:border-orange-400 focus:ring-4 focus:ring-orange-100"
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-orange-500 py-3 text-lg font-semibold text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {loading ? "Creating Account..." : "Create Account"}
        </button>
      </form>
    </AuthShell>
  );
}

export default RegisterPage;
