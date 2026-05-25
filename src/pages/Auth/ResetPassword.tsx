import { useMemo, useState, type FormEvent } from "react";
import { Link, Navigate, useNavigate, useSearchParams } from "react-router-dom";
import { resetPasswordRequest } from "../../api/auth";
import { clearCredentials } from "../../store/authSlice";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { selectIsAuthenticated } from "../../store/permissionSelectors";

const MIN_PASSWORD_LENGTH = 8;

const ResetPassword = () => {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const isAuthenticated = useAppSelector(selectIsAuthenticated);
    const token = useMemo(() => searchParams.get("token")?.trim() ?? "", [searchParams]);

    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    // Email reset links must work even if another user is logged in (e.g. admin who created the account).
    if (isAuthenticated && !token) {
        return <Navigate to="/home" replace />;
    }

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setError(null);
        setSuccessMessage(null);

        if (!token) {
            setError("Reset link is invalid or missing. Request a new link from forgot password.");
            return;
        }
        if (password.length < MIN_PASSWORD_LENGTH) {
            setError(`Password must be at least ${MIN_PASSWORD_LENGTH} characters.`);
            return;
        }
        if (password !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }

        setLoading(true);
        try {
            const message = await resetPasswordRequest({ token, password });
            dispatch(clearCredentials());
            setSuccessMessage(message);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to reset password");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-slate-100 to-slate-200 px-4">
            <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-6 shadow-md">
                <div className="mb-6 text-center">
                    <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-lg bg-blue-600 text-sm font-bold text-white">
                        EO
                    </div>
                    <h1 className="text-lg font-semibold text-slate-900">Set new password</h1>
                    <p className="mt-1 text-[11px] text-slate-500">
                        Choose a password for your account (minimum {MIN_PASSWORD_LENGTH} characters).
                    </p>
                </div>

                {!token ? (
                    <div className="space-y-4">
                        <p className="text-[12px] text-red-600">
                            This reset link is invalid or has expired. Use forgot password to request a
                            new link.
                        </p>
                        <Link
                            to="/forgot-password"
                            className="block w-full rounded-md bg-slate-900 py-2.5 text-center text-[13px] font-medium text-white hover:bg-slate-800"
                        >
                            Request new link
                        </Link>
                        <p className="text-center text-[11px] text-slate-500">
                            <Link to="/login" className="font-medium text-blue-700 hover:underline">
                                Back to sign in
                            </Link>
                        </p>
                    </div>
                ) : successMessage ? (
                    <div className="space-y-4">
                        <p className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-[12px] text-emerald-800">
                            {successMessage}
                        </p>
                        <button
                            type="button"
                            className="w-full rounded-md bg-slate-900 py-2.5 text-[13px] font-medium text-white hover:bg-slate-800"
                            onClick={() => navigate("/login", { replace: true })}
                        >
                            Sign in
                        </button>
                    </div>
                ) : (
                    <form className="space-y-4" onSubmit={handleSubmit}>
                        {isAuthenticated ? (
                            <p className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-[11px] text-amber-900">
                                You are signed in as another user. Set the password below for the account
                                from this email link, then sign in with that account.
                            </p>
                        ) : null}
                        <div>
                            <label
                                htmlFor="reset-password"
                                className="mb-1 block text-[11px] font-medium text-slate-700"
                            >
                                New password
                            </label>
                            <input
                                id="reset-password"
                                type="password"
                                autoComplete="new-password"
                                className="w-full rounded-md border border-slate-300 px-3 py-2 text-[13px] outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                minLength={MIN_PASSWORD_LENGTH}
                                required
                            />
                        </div>
                        <div>
                            <label
                                htmlFor="reset-confirm-password"
                                className="mb-1 block text-[11px] font-medium text-slate-700"
                            >
                                Confirm password
                            </label>
                            <input
                                id="reset-confirm-password"
                                type="password"
                                autoComplete="new-password"
                                className="w-full rounded-md border border-slate-300 px-3 py-2 text-[13px] outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                minLength={MIN_PASSWORD_LENGTH}
                                required
                            />
                        </div>

                        {error ? <p className="text-[11px] text-red-600">{error}</p> : null}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full rounded-md bg-slate-900 py-2.5 text-[13px] font-medium text-white transition hover:bg-slate-800 disabled:opacity-60"
                        >
                            {loading ? "Updating…" : "Update password"}
                        </button>

                        <p className="text-center text-[11px] text-slate-500">
                            <Link to="/login" className="font-medium text-blue-700 hover:underline">
                                Back to sign in
                            </Link>
                        </p>
                    </form>
                )}
            </div>
        </div>
    );
};

export default ResetPassword;
