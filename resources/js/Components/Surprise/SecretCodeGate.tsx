import {
    type FormEvent,
    type ReactNode,
    useCallback,
    useMemo,
    useState,
} from "react";

type SecretCodeGateProps = {
    code: string;
    children: ReactNode | ((args: { unlockCode: string }) => ReactNode);
    title?: string;
    description?: string;
    placeholder?: string;
    buttonLabel?: string;
    errorMessage?: string;
    hint?: string;
};

export function SecretCodeGate({
    code,
    children,
    title = "Masukkan Kode Rahasia",
    description = "Butuh kode manis buat buka halaman ini.",
    placeholder = "Contoh: 160825",
    buttonLabel = "Buka Halaman",
    errorMessage = "Kode salah. Coba ingat lagi tanggal spesial kalian.",
    hint,
}: SecretCodeGateProps): JSX.Element {
    const normalizedCode = useMemo(
        () => code.replace(/\s+/g, "").toLowerCase(),
        [code],
    );

    const [input, setInput] = useState("");
    const [isUnlocked, setIsUnlocked] = useState(false);
    const [hasError, setHasError] = useState(false);

    const handleSubmit = useCallback(
        (event: FormEvent<HTMLFormElement>) => {
            event.preventDefault();
            const normalizedInput = input.replace(/\s+/g, "").toLowerCase();
            if (normalizedInput === normalizedCode) {
                setIsUnlocked(true);
                setHasError(false);
                return;
            }
            setHasError(true);
        },
        [input, normalizedCode],
    );

    if (isUnlocked) {
        if (typeof children === "function") {
            return <>{children({ unlockCode: normalizedCode })}</>;
        }

        return <>{children}</>;
    }

    return (
        <div className="flex min-h-screen w-full items-center justify-center px-4 py-24">
            <div className="w-full max-w-md rounded-3xl border border-white/30 bg-white/15 p-8 text-white backdrop-blur-xl shadow-2xl">
                <div className="space-y-3 text-center">
                    <p className="text-xs font-semibold uppercase tracking-[0.32em] text-white/60">
                        Akses Terbatas
                    </p>
                    <h2 className="text-2xl font-bold">{title}</h2>
                    <p className="text-sm text-white/70">{description}</p>
                    {hint && (
                        <p className="text-xs font-medium uppercase tracking-[0.24em] text-white/50">
                            Hint: {hint}
                        </p>
                    )}
                </div>

                <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
                    <div>
                        <label
                            htmlFor="secret-code"
                            className="text-xs font-semibold uppercase tracking-[0.28em] text-white/60"
                        >
                            Secret Code
                        </label>
                        <input
                            id="secret-code"
                            type="password"
                            value={input}
                            onChange={(event) => setInput(event.target.value)}
                            className="mt-2 w-full rounded-2xl border border-white/30 bg-black/20 px-4 py-3 text-center text-lg tracking-[0.5em] text-white placeholder:text-white/40 focus:border-white focus:outline-none focus:ring-2 focus:ring-white/30"
                            placeholder={placeholder}
                            autoFocus
                            autoComplete="off"
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-full rounded-2xl bg-white/90 px-4 py-3 text-sm font-semibold uppercase tracking-[0.3em] text-slate-900 transition hover:bg-white"
                    >
                        {buttonLabel}
                    </button>
                </form>

                <div className="mt-4 h-4 text-center text-xs text-red-200">
                    {hasError ? errorMessage : "\u00a0"}
                </div>
            </div>
        </div>
    );
}

export default SecretCodeGate;
