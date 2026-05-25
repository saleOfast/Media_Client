import { useState, type FormEvent } from "react";
import { Link, Navigate } from "react-router-dom";
import { forgotPasswordRequest } from "../../api/auth";
import { useAppSelector } from "../../store/hooks";
import { selectIsAuthenticated } from "../../store/permissionSelectors";

const ForgotPassword = () => {
    const [email, setEmail] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const isAuthenticated = useAppSelector(selectIsAuthenticated);

    if (isAuthenticated) {
        return <Navigate to="/home" replace />;
    }

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setError(null);
        setSuccessMessage(null);

        const trimmed = email.trim();
        if (!trimmed) {
            setError("Email is required.");
            return;
        }

        setLoading(true);
        try {
            const message = await forgotPasswordRequest({ email: trimmed });
            setSuccessMessage(message);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Request failed");
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
                    <h1 className="text-lg font-semibold text-slate-900">Forgot password</h1>
                    <p className="mt-1 text-[11px] text-slate-500">
                        Enter your email and we&apos;ll send a reset link if an account exists.
                    </p>
                </div>

                {successMessage ? (
                    <div className="space-y-4">
                        <p className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-[12px] text-emerald-800">
                            {successMessage}
                        </p>
                        <Link
                            to="/login"
                            className="block w-full rounded-md border border-slate-300 py-2.5 text-center text-[13px] font-medium text-slate-700 hover:bg-slate-50"
                        >
                            Back to sign in
                        </Link>
                    </div>
                ) : (
                    <form className="space-y-4" onSubmit={handleSubmit}>
                        <div>
                            <label
                                htmlFor="forgot-email"
                                className="mb-1 block text-[11px] font-medium text-slate-700"
                            >
                                Email
                            </label>
                            <input
                                id="forgot-email"
                                type="email"
                                autoComplete="email"
                                className="w-full rounded-md border border-slate-300 px-3 py-2 text-[13px] outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                placeholder="you@company.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>

                        {error ? <p className="text-[11px] text-red-600">{error}</p> : null}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full rounded-md bg-slate-900 py-2.5 text-[13px] font-medium text-white transition hover:bg-slate-800 disabled:opacity-60"
                        >
                            {loading ? "Sending…" : "Send reset link"}
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

export default ForgotPassword;
