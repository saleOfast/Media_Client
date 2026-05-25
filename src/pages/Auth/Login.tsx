import { useEffect, useRef, useState, type FormEvent } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { loginRequest } from "../../api/auth";
import { getDefaultNavPath } from "../../lib/navConfig";
import { setCredentials } from "../../store/authSlice";
import { store } from "../../store";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { selectIsAuthenticated } from "../../store/permissionSelectors";

const Login = () => {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const location = useLocation();
    const fromPath = (location.state as { from?: { pathname?: string } } | null)?.from?.pathname;

    const [identifier, setIdentifier] = useState("admin@example.com");
    const [password, setPassword] = useState("admin12345");
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const isAuthenticated = useAppSelector(selectIsAuthenticated);
    const hasRedirectedRef = useRef(false);

    useEffect(() => {
        if (!isAuthenticated) {
            hasRedirectedRef.current = false;
            return;
        }

        const { permissions } = store.getState().auth;
        const target = getDefaultNavPath(permissions?.tabs ?? []);
        const destination =
            fromPath &&
            fromPath !== "/login" &&
            fromPath !== "/forgot-password" &&
            fromPath !== "/reset-password"
                ? fromPath
                : target;

        if (location.pathname === destination) {
            hasRedirectedRef.current = true;
            return;
        }

        if (hasRedirectedRef.current) {
            return;
        }
        hasRedirectedRef.current = true;
        navigate(destination, { replace: true });
    }, [isAuthenticated, fromPath, location.pathname, navigate]);

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setError(null);
        setLoading(true);
        try {
            const { token, user, permissions, canSetup } = await loginRequest({
                identifier: identifier.trim(),
                password,
            });
            dispatch(
                setCredentials({
                    token,
                    permissions,
                    canSetup,
                    user: {
                        ...user,
                        identifier: identifier.trim(),
                        email:
                            user.email ??
                            (identifier.trim().includes("@") ? identifier.trim() : undefined),
                    },
                })
            );
            const defaultPath = getDefaultNavPath(permissions?.tabs ?? []);
            navigate(
                fromPath && fromPath !== "/login" ? fromPath : defaultPath,
                { replace: true }
            );
        } catch (err) {
            setError(err instanceof Error ? err.message : "Login failed");
        } finally {
            setLoading(false);
        }
    };

    if (isAuthenticated) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-slate-100 to-slate-200 px-4">
                <p className="text-[13px] text-slate-600">Redirecting…</p>
            </div>
        );
    }

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
                        <div className="mb-1 flex items-center justify-between">
                            <label htmlFor="login-password" className="text-[11px] font-medium text-slate-700">
                                Password
                            </label>
                            <Link
                                to="/forgot-password"
                                className="text-[10px] font-medium text-blue-700 hover:underline"
                            >
                                Forgot password?
                            </Link>
                        </div>
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
