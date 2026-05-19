import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState,
    type ReactNode,
} from "react";

type ToastVariant = "success" | "error" | "info";

type ToastInput =
    | string
    | {
        message: string;
        variant?: ToastVariant;
        durationMs?: number;
    };

type ToastItem = {
    id: number;
    message: string;
    variant: ToastVariant;
    durationMs: number;
};

type ToastContextValue = {
    showToast: (toast: ToastInput) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

const variantClasses: Record<ToastVariant, string> = {
    success: "border-emerald-200 bg-emerald-50 text-emerald-800",
    error: "border-red-200 bg-red-50 text-red-800",
    info: "border-slate-200 bg-white text-slate-800",
};

const variantLabel: Record<ToastVariant, string> = {
    success: "Success",
    error: "Error",
    info: "Info",
};

function ToastCard({
    toast,
    onDismiss,
}: {
    toast: ToastItem;
    onDismiss: (id: number) => void;
}) {
    useEffect(() => {
        if (toast.durationMs <= 0) {
            return;
        }

        const timerId = window.setTimeout(() => onDismiss(toast.id), toast.durationMs);
        return () => window.clearTimeout(timerId);
    }, [onDismiss, toast.durationMs, toast.id]);

    return (
        <div
            className={`pointer-events-auto w-80 rounded-lg border px-3 py-2 shadow-md ${variantClasses[toast.variant]}`}
            role="status"
        >
            <div className="flex items-start justify-between gap-3">
                <div>
                    <p className="text-[11px] font-semibold">{variantLabel[toast.variant]}</p>
                    <p className="mt-0.5 text-[12px] leading-snug">{toast.message}</p>
                </div>
                <button
                    type="button"
                    className="text-[13px] leading-none opacity-70 hover:opacity-100"
                    onClick={() => onDismiss(toast.id)}
                    aria-label="Dismiss notification"
                >
                    x
                </button>
            </div>
        </div>
    );
}

export function ToastProvider({ children }: { children: ReactNode }) {
    const [toasts, setToasts] = useState<ToastItem[]>([]);

    const dismissToast = useCallback((id: number) => {
        setToasts((current) => current.filter((toast) => toast.id !== id));
    }, []);

    const showToast = useCallback((input: ToastInput) => {
        const normalized =
            typeof input === "string"
                ? { message: input, variant: "success" as ToastVariant, durationMs: 3000 }
                : {
                    message: input.message,
                    variant: input.variant ?? "success",
                    durationMs: input.durationMs ?? 3000,
                };

        const toast: ToastItem = {
            id: Date.now() + Math.random(),
            message: normalized.message,
            variant: normalized.variant,
            durationMs: normalized.durationMs,
        };

        setToasts((current) => [...current, toast].slice(-4));
    }, []);

    const value = useMemo(() => ({ showToast }), [showToast]);

    return (
        <ToastContext.Provider value={value}>
            {children}
            <div className="pointer-events-none fixed right-4 top-4 z-[9999] flex flex-col gap-2">
                {toasts.map((toast) => (
                    <ToastCard key={toast.id} toast={toast} onDismiss={dismissToast} />
                ))}
            </div>
        </ToastContext.Provider>
    );
}

export function useToast() {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error("useToast must be used inside ToastProvider");
    }
    return context;
}
