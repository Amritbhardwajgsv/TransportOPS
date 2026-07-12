import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Truck, Route, ShieldCheck, Wallet } from "lucide-react";
import Button from "../components/Button";

const ROLES = [
  {
    icon: Truck,
    title: "Fleet Manager",
    description:
      "Oversees fleet assets, maintenance, vehicle lifecycle, and operational efficiency.",
    capabilities: [
      "Full CRUD on vehicles and drivers",
      "Dispatch and oversee every trip",
      "Log and close maintenance records",
      "All reports and cost breakdowns",
    ],
  },
  {
    icon: Route,
    title: "Driver",
    description:
      "Creates trips, assigns vehicles and drivers, and monitors active deliveries.",
    capabilities: [
      "Create and dispatch trips",
      "Pick from available vehicles and drivers only",
      "Complete and close out deliveries",
    ],
  },
  {
    icon: ShieldCheck,
    title: "Safety Officer",
    description:
      "Ensures driver compliance, tracks license validity, and monitors safety scores.",
    capabilities: [
      "License radar sorted by expiry",
      "Suspend and reinstate drivers",
      "Track safety scores fleet-wide",
    ],
  },
  {
    icon: Wallet,
    title: "Financial Analyst",
    description:
      "Reviews operational expenses, fuel consumption, maintenance costs, and profitability.",
    capabilities: [
      "Fuel and expense logging",
      "Cost-per-vehicle breakdowns",
      "Fuel efficiency reports with CSV export",
    ],
  },
];

export default function Register() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const roleFromQuery = searchParams.get("role");
  const initialRole = ROLES.find((r) => r.title === roleFromQuery) || ROLES[0];

  const [selectedRole] = useState(initialRole.title);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    // role is locked to whichever card the user clicked on the Landing page
  }, [roleFromQuery]);

  const activeRole = ROLES.find((r) => r.title === selectedRole) ?? ROLES[0];
  const Icon = activeRole.icon;

  function handleChange(e) {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (!form.name || !form.email || !form.password || !form.confirmPassword) {
      setError("Please fill in every field.");
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (form.password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    setSubmitting(true);
    try {
      // TODO: replace with actual API call
      // await api.register({ ...form, role: selectedRole });
      setSuccess(true);
    } catch (err) {
      setError("Registration failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="hazard-stripe flex min-h-screen items-center justify-center bg-coal-950 px-6 py-16">
      <div className="mx-auto flex w-full max-w-5xl flex-col items-center gap-12 md:flex-row">
        {/* Left: role info + capabilities (already present, unchanged) */}
        <div className="flex-1 text-center md:text-left">
          <Icon
            size={64}
            strokeWidth={1.5}
            className="mx-auto text-volt-400 md:mx-0"
          />
          <h2 className="mt-4 font-display text-3xl font-semibold text-smoke-100 md:text-4xl">
            {activeRole.title}
          </h2>
          <p className="mt-3 max-w-md text-smoke-400">
            {activeRole.description}
          </p>

          <ul className="mt-6 space-y-3">
            {activeRole.capabilities.map((c) => (
              <li
                key={c}
                className="flex items-center gap-3 rounded-lg border border-coal-600 bg-coal-900 px-4 py-3 text-sm text-smoke-100"
              >
                <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-volt-400" />
                {c}
              </li>
            ))}
          </ul>
        </div>

        {/* Right: register form */}
        <div className="flex-1 w-full">
          {success ? (
            <div className="rounded-lg border border-coal-600 bg-coal-900 p-6 text-center">
              <p className="text-sm text-smoke-100">
                Account created for{" "}
                <span className="text-volt-400">{activeRole.title}</span>. You
                can sign in now.
              </p>
              <a
                href="https://oddohack.site/login"
                className="mt-4 inline-flex items-center justify-center rounded-lg border border-volt-400 px-4 py-2 text-sm font-semibold text-volt-400 transition-colors hover:bg-volt-400 hover:text-coal-950"
              >
                Go to sign in
              </a>
            </div>
          ) : (
            <form
              onSubmit={handleSubmit}
              className="flex flex-col gap-4 rounded-lg border border-coal-600 bg-coal-900 p-6"
            >
              <h3 className="font-display text-xl font-semibold text-smoke-100">
                Create your account
              </h3>

              <div>
                <label
                  htmlFor="role"
                  className="mb-1 block text-xs uppercase tracking-wider text-smoke-400"
                >
                  Role
                </label>
                <input
                  id="role"
                  type="text"
                  value={activeRole.title}
                  readOnly
                  disabled
                  className="w-full cursor-not-allowed rounded-lg border border-coal-600 bg-coal-950 px-4 py-3 text-sm text-volt-400 opacity-80"
                />
              </div>

              <div>
                <label
                  htmlFor="name"
                  className="mb-1 block text-xs uppercase tracking-wider text-smoke-400"
                >
                  Full name
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Alex Morgan"
                  className="w-full rounded-lg border border-coal-600 bg-coal-950 px-4 py-3 text-sm text-smoke-100 placeholder:text-smoke-400 focus:border-volt-400 focus:outline-none"
                />
              </div>

              <div>
                <label
                  htmlFor="email"
                  className="mb-1 block text-xs uppercase tracking-wider text-smoke-400"
                >
                  Email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="you@company.com"
                  className="w-full rounded-lg border border-coal-600 bg-coal-950 px-4 py-3 text-sm text-smoke-100 placeholder:text-smoke-400 focus:border-volt-400 focus:outline-none"
                />
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="mb-1 block text-xs uppercase tracking-wider text-smoke-400"
                >
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="w-full rounded-lg border border-coal-600 bg-coal-950 px-4 py-3 text-sm text-smoke-100 placeholder:text-smoke-400 focus:border-volt-400 focus:outline-none"
                />
              </div>

              <div>
                <label
                  htmlFor="confirmPassword"
                  className="mb-1 block text-xs uppercase tracking-wider text-smoke-400"
                >
                  Confirm password
                </label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="w-full rounded-lg border border-coal-600 bg-coal-950 px-4 py-3 text-sm text-smoke-100 placeholder:text-smoke-400 focus:border-volt-400 focus:outline-none"
                />
              </div>

              {error && <p className="text-sm text-red-400">{error}</p>}

              <Button
                type="submit"
                disabled={submitting}
                className="mt-2 w-full"
              >
                {submitting
                  ? "Creating account…"
                  : `Register as ${activeRole.title}`}
              </Button>

              <p className="text-center text-sm text-smoke-400">
                Already registered?{" "}
                <a
                  href="https://oddohack.site/login"
                  className="text-volt-400 hover:underline"
                >
                  Sign in
                </a>
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
