import { useState, type FormEvent } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { loginRequest } from "../../api/auth";
import { getToken, setStoredUser, setToken } from "../../lib/authStorage";

const Login = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const fromPath = (location.state as { from?: { pathname?: string } } | null)?.from?.pathname;

    const [identifier, setIdentifier] = useState("admin@example.com");
    const [password, setPassword] = useState("admin12345");
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    if (getToken()) {
        return <Navigate to="/home" replace />;
    }

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setError(null);
        setLoading(true);
        try {
            const { token, user } = await loginRequest({
                identifier: identifier.trim(),
                password,
            });
            setToken(token);
            setStoredUser({
                ...user,
                identifier: identifier.trim(),
                email: user.email ?? (identifier.trim().includes("@") ? identifier.trim() : undefined),
            });
            navigate(fromPath && fromPath !== "/login" ? fromPath : "/home", { replace: true });
        } catch (err) {
            setError(err instanceof Error ? err.message : "Login failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-100 to-slate-200 px-4">
            <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-6 shadow-md">
                <div className="mb-6 text-center">
                    <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-lg bg-blue-600 text-sm font-bold text-white">
                        EO
                    </div>
                    <h1 className="text-lg font-semibold text-slate-900">Sign in</h1>
                    <p className="mt-1 text-[11px] text-slate-500">Engage Outdoor Media — Admin</p>
                </div>

                <form className="space-y-4" onSubmit={handleSubmit}>
                    <div>
                        <label htmlFor="login-identifier" className="mb-1 block text-[11px] font-medium text-slate-700">
                            Identifier
                        </label>
                        <input
                            id="login-identifier"
                            type="text"
                            autoComplete="username"
                            className="w-full rounded-md border border-slate-300 px-3 py-2 text-[13px] outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                            placeholder="e.g. admin@example.com"
                            value={identifier}
                            onChange={(e) => setIdentifier(e.target.value)}
                            required
                        />
                        <p className="mt-1 text-[10px] text-slate-500">Usually your work email.</p>
                    </div>
                    <div>
                        <label htmlFor="login-password" className="mb-1 block text-[11px] font-medium text-slate-700">
                            Password
                        </label>
                        <input
                            id="login-password"
                            type="password"
                            autoComplete="current-password"
                            className="w-full rounded-md border border-slate-300 px-3 py-2 text-[13px] outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    {error ? <p className="text-[11px] text-red-600">{error}</p> : null}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full rounded-md bg-slate-900 py-2.5 text-[13px] font-medium text-white transition hover:bg-slate-800 disabled:opacity-60"
                    >
                        {loading ? "Signing in…" : "Sign in"}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Login;
