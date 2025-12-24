import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, useForm, usePage } from "@inertiajs/react";
import { ChangeEvent, FormEvent, useEffect, useRef, useState } from "react";
import { Loader2, Upload, Image as ImageIcon, RotateCcw } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";
import { convertImageToWebP } from "@/utils/imageConverter";

interface LevelConfig {
    key: string;
    label: string;
    image: string | null;
    image_path?: string | null;
    default_image?: string | null;
    title: string | null;
    body: string | null;
}

interface SpaceSummary {
    id: number;
    slug: string;
    title: string;
}

interface Props {
    space: SpaceSummary;
    levels: LevelConfig[];
    pin: string | null;
    contentSet: boolean;
    activeLevels: number;
}

type LevelKey = "level_one" | "level_two" | "level_three";

interface FormData {
    level_one_title: string;
    level_one_body: string;
    level_one_image: File | null;
    level_one_reset: boolean;
    level_two_title: string;
    level_two_body: string;
    level_two_image: File | null;
    level_two_reset: boolean;
    level_three_title: string;
    level_three_body: string;
    level_three_image: File | null;
    level_three_reset: boolean;
    active_levels: number;
    pin: string;
}

const LEVEL_KEYS: LevelKey[] = ["level_one", "level_two", "level_three"];
const MAX_IMAGE_SIZE = 10 * 1024 * 1024;

export default function MemoryLaneConfig({ space, levels, pin, contentSet, activeLevels }: Props) {
    const page = usePage();
    const flash = page.props.flash as { success?: string; error?: string } | undefined;
    const { translations: memoryLaneStrings } = useTranslation<Record<string, any>>("memory_lane");
    const { t: errorsTranslator } = useTranslation("errors");

    const configStrings = memoryLaneStrings?.config ?? {};
    const headingStrings = configStrings.heading ?? {};
    const accessStrings = configStrings.access ?? {};
    const levelsStrings = configStrings.levels ?? {};
    const actionStrings = configStrings.actions ?? {};

    const pageTitle = memoryLaneStrings?.meta?.config ?? "Memory Lane Kit";
    const headingTitle = headingStrings.title ?? "Memory Lane Kit";
    const headingSubtitle = headingStrings.subtitle ?? "Curate sweet reveals, art, and notes for your shared puzzle adventure.";
    const accessTitle = accessStrings.title ?? "Access PIN";
    const accessDescription = accessStrings.description ?? "Protect the Memory Lane surprise with an optional PIN.";
    const pinLabel = accessStrings.pin_label ?? "Access PIN (leave empty to disable)";
    const pinPlaceholder = accessStrings.pin_placeholder ?? "Example: 1234";
    const pinHelper = accessStrings.pin_helper ?? "4-10 digits or characters.";
    const emptyNotice = accessStrings.empty_notice ?? "Memory Lane Kit content has not been configured yet.";
    const levelsTitle = levelsStrings.title ?? "Reveal levels";
    const levelsDescription = levelsStrings.description ?? "Update imagery and heartfelt copy for every reveal stage.";
    const imageHelper = levelsStrings.image_helper ?? "Drag & drop or choose an image (max. 10 MB, JPG/PNG converted to .webp).";
    const resetImageLabel = levelsStrings.reset ?? "Use default image";
    const changeImageLabel = levelsStrings.change ?? "Change image";
    const levelFieldTitle = levelsStrings.fields?.title ?? "Headline";
    const levelFieldBody = levelsStrings.fields?.body ?? "Story snippet";
    const saveLabel = actionStrings.save ?? "Save changes";
    const savingLabel = actionStrings.saving ?? "Saving…";

    const createFormState = (source: LevelConfig[], initialPin: string | null, initialActiveLevels: number): FormData => ({
        level_one_title: source[0]?.title ?? "",
        level_one_body: source[0]?.body ?? "",
        level_one_image: null,
        level_one_reset: false,
        level_two_title: source[1]?.title ?? "",
        level_two_body: source[1]?.body ?? "",
        level_two_image: null,
        level_two_reset: false,
        level_three_title: source[2]?.title ?? "",
        level_three_body: source[2]?.body ?? "",
        level_three_image: null,
        level_three_reset: false,
        active_levels: initialActiveLevels,
        pin: initialPin ?? "",
    });

    const { data, setData, post, processing, errors } = useForm<FormData>(createFormState(levels, pin, activeLevels));

    const [previews, setPreviews] = useState<Record<LevelKey, string | null>>({
        level_one: levels[0]?.image ?? levels[0]?.default_image ?? null,
        level_two: levels[1]?.image ?? levels[1]?.default_image ?? null,
        level_three: levels[2]?.image ?? levels[2]?.default_image ?? null,
    });
    const [localErrors, setLocalErrors] = useState<Record<LevelKey, string | null>>({
        level_one: null,
        level_two: null,
        level_three: null,
    });
    const sizeErrorMessage = errorsTranslator(
        "memory_lane.kit_image_too_large",
        "Each Memory Lane Kit image must be a maximum of 10 MB."
    );
    const conversionErrorMessage = errorsTranslator(
        "upload.image_not_convertible",
        "The image could not be processed into .webp format."
    );

    const objectUrlsRef = useRef<Record<string, string>>({});

    const fallbackImageFor = (key: LevelKey): string | null => {
        const index = LEVEL_KEYS.indexOf(key);
        if (index === -1) {
            return null;
        }

        return levels[index]?.image ?? levels[index]?.default_image ?? null;
    };

    useEffect(() => {
        return () => {
            Object.values(objectUrlsRef.current).forEach((url) => {
                URL.revokeObjectURL(url);
            });
            objectUrlsRef.current = {};
        };
    }, []);

    useEffect(() => {
        Object.values(objectUrlsRef.current).forEach((url) => {
            URL.revokeObjectURL(url);
        });
        objectUrlsRef.current = {};

        setPreviews({
            level_one: levels[0]?.image ?? levels[0]?.default_image ?? null,
            level_two: levels[1]?.image ?? levels[1]?.default_image ?? null,
            level_three: levels[2]?.image ?? levels[2]?.default_image ?? null,
        });
        setLocalErrors({
            level_one: null,
            level_two: null,
            level_three: null,
        });

        setData((current) => ({
            ...current,
            ...createFormState(levels, pin, activeLevels),
        }));
    }, [levels, pin, setData]);

    const handleFileChange = async (
        event: ChangeEvent<HTMLInputElement>,
        key: LevelKey,
    ) => {
        const file = event.target.files?.[0] ?? null;
        const imageField = `${key}_image` as const;
        const resetField = `${key}_reset` as const;

        if (objectUrlsRef.current[key]) {
            URL.revokeObjectURL(objectUrlsRef.current[key]);
            delete objectUrlsRef.current[key];
        }

        if (!file) {
            setData(imageField, null);
            setData(resetField, false);
            setPreviews((prev) => ({
                ...prev,
                [key]: fallbackImageFor(key),
            }));
            setLocalErrors((prev) => ({ ...prev, [key]: null }));
            return;
        }

        if (file.size > MAX_IMAGE_SIZE) {
            setLocalErrors((prev) => ({ ...prev, [key]: sizeErrorMessage }));
            setData(imageField, null);
            return;
        }

        try {
            const webpFile = await convertImageToWebP(file);

            if (webpFile.size > MAX_IMAGE_SIZE) {
                setLocalErrors((prev) => ({ ...prev, [key]: sizeErrorMessage }));
                setData(imageField, null);
                return;
            }

            setData(imageField, webpFile);
            setData(resetField, false);

            const url = URL.createObjectURL(webpFile);
            objectUrlsRef.current[key] = url;
            setPreviews((prev) => ({ ...prev, [key]: url }));
            setLocalErrors((prev) => ({ ...prev, [key]: null }));
        } catch (error) {
            console.error("Failed to convert image to WebP", error);
            setLocalErrors((prev) => ({ ...prev, [key]: conversionErrorMessage }));
            setData(imageField, null);
        }
    };

    const handleResetImage = (key: LevelKey, defaultImage?: string | null) => {
        const imageField = `${key}_image` as const;
        const resetField = `${key}_reset` as const;

        setData(imageField, null);
        setData(resetField, true);

        if (objectUrlsRef.current[key]) {
            URL.revokeObjectURL(objectUrlsRef.current[key]);
            delete objectUrlsRef.current[key];
        }

        setPreviews((prev) => ({ ...prev, [key]: defaultImage ?? null }));
        setLocalErrors((prev) => ({ ...prev, [key]: null }));
    };

    const handleSubmit = (event: FormEvent) => {
        event.preventDefault();
        if (Object.values(localErrors).some(Boolean)) {
            return;
        }
        post(route("memory-lane.update", { space: space.slug }), {
            forceFormData: true,
            preserveScroll: true,
        });
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="space-y-1">
                    <h2 className="text-2xl font-semibold text-slate-900">{headingTitle}</h2>
                    <p className="text-sm text-slate-500">{headingSubtitle}</p>
                </div>
            }
        >
            <Head title={`${pageTitle} - ${space.title}`} />

            <div className="relative mx-auto max-w-5xl space-y-8 px-4 pb-16 sm:px-6 lg:px-8">
                {flash?.success && (
                    <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 shadow">
                        {flash.success}
                    </div>
                )}
                {flash?.error && (
                    <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 shadow">
                        {flash.error}
                    </div>
                )}

                <form
                    onSubmit={handleSubmit}
                    className="space-y-10 rounded-3xl border border-slate-100 bg-white/90 p-6 shadow-lg backdrop-blur"
                >
                    <section className="space-y-4">
                        <header className="space-y-2">
                            <h3 className="text-xl font-semibold text-slate-900">{accessTitle}</h3>
                            <p className="text-sm text-slate-500">{accessDescription}</p>
                        </header>
                        <div>
                            <label htmlFor="pin" className="block text-sm font-medium text-slate-700">
                                {pinLabel}
                            </label>
                            <input
                                id="pin"
                                type="text"
                                value={data.pin}
                                onChange={(e) => setData("pin", e.target.value)}
                                className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-2 text-slate-800 shadow-sm focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-300"
                                placeholder={pinPlaceholder}
                                maxLength={10}
                            />
                            <p className="mt-1 text-xs text-slate-500">{pinHelper}</p>
                            <div className="mt-2 rounded-xl border border-blue-200 bg-blue-50 px-3 py-2 text-xs text-blue-700">
                                <strong>Default PIN:</strong> 00000 (five zeros). Change this to secure your Memory Lane.
                            </div>
                            {errors.pin && <p className="mt-1 text-sm text-rose-500">{errors.pin}</p>}
                        </div>
                        {!contentSet && (
                            <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700 shadow">
                                {emptyNotice}
                            </div>
                        )}
                    </section>

                    <section className="space-y-4">
                        <header className="space-y-2">
                            <h3 className="text-xl font-semibold text-slate-900">Number of Puzzle Levels</h3>
                            <p className="text-sm text-slate-500">Choose how many puzzle levels users must complete (0 = skip puzzles entirely)</p>
                        </header>
                        <div>
                            <label htmlFor="active_levels" className="block text-sm font-medium text-slate-700">
                                Active Levels
                            </label>
                            <select
                                id="active_levels"
                                value={data.active_levels}
                                onChange={(e) => setData("active_levels", parseInt(e.target.value))}
                                className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-2 text-slate-800 shadow-sm focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-300"
                            >
                                <option value={0}>0 - Skip puzzles (no levels)</option>
                                <option value={1}>1 - One puzzle level</option>
                                <option value={2}>2 - Two puzzle levels</option>
                                <option value={3}>3 - Three puzzle levels (default)</option>
                            </select>
                            <p className="mt-1 text-xs text-slate-500">
                                Users will need to complete {data.active_levels} puzzle{data.active_levels !== 1 ? 's' : ''} before accessing the Memory Lane content.
                            </p>
                            {errors.active_levels && <p className="mt-1 text-sm text-rose-500">{errors.active_levels}</p>}
                        </div>
                    </section>

                    <section className="space-y-6">
                        <header className="space-y-2">
                            <h3 className="text-xl font-semibold text-slate-900">{levelsTitle}</h3>
                            <p className="text-sm text-slate-500">{levelsDescription}</p>
                        </header>

                        {data.active_levels === 0 && (
                            <div className="rounded-2xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700 shadow">
                                Puzzles are disabled. Users will skip directly to Memory Lane content.
                            </div>
                        )}

                        {levels.slice(0, data.active_levels).map((level, index) => {
                            const key = level.key as LevelKey;
                            const imageField = `${key}_image` as const;
                            const titleField = `${key}_title` as const;
                            const bodyField = `${key}_body` as const;
                            const resetField = `${key}_reset` as const;
                            const preview = previews[key];

                            return (
                                <section key={level.key} className="space-y-4 rounded-3xl border border-slate-100 bg-white/95 p-6 shadow-sm">
                                    <header className="space-y-1">
                                        <span className="text-xs uppercase tracking-[0.28em] text-slate-400">Level {index + 1}</span>
                                        <h4 className="text-xl font-semibold text-slate-900">{level.label}</h4>
                                    </header>
                                    <div className="grid gap-6 md:grid-cols-[minmax(0,320px)_minmax(0,1fr)]">
                                        <div className="space-y-3">
                                            <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-slate-50">
                                                {preview ? (
                                                    <img
                                                        src={preview}
                                                        alt={`preview-level-${index + 1}`}
                                                        className="h-56 w-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="flex h-56 flex-col items-center justify-center gap-2 text-sm text-slate-400">
                                                        <ImageIcon className="h-8 w-8" />
                                                        <span>{levelsStrings.empty_image ?? "No image"}</span>
                                                    </div>
                                                )}
                                            </div>
                                            <p className="text-xs text-slate-500">{imageHelper}</p>
                                            <div className="flex flex-wrap items-center gap-3">
                                                <label
                                                    htmlFor={`${imageField}-input`}
                                                    className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-slate-700"
                                                >
                                                    <Upload className="h-4 w-4" />
                                                    {changeImageLabel}
                                                    <input
                                                        id={`${imageField}-input`}
                                                        type="file"
                                                        accept="image/*"
                                                        className="hidden"
                                                        onChange={(event) => {
                                                            void handleFileChange(event, key);
                                                        }}
                                                    />
                                                </label>
                                                {(level.image || level.default_image) && (
                                                    <button
                                                        type="button"
                                                        onClick={() => handleResetImage(key, level.default_image)}
                                                        className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
                                                    >
                                                        <RotateCcw className="h-4 w-4" />
                                                        {resetImageLabel}
                                                    </button>
                                                )}
                                            </div>
                                            {localErrors[key] && (
                                                <p className="text-sm text-rose-600">{localErrors[key]}</p>
                                            )}
                                            {errors[imageField] && (
                                                <p className="text-sm text-rose-600">{errors[imageField]}</p>
                                            )}
                                        </div>
                                        <div className="space-y-4">
                                            <div>
                                                <label className="block text-sm font-medium text-slate-700">{levelFieldTitle}</label>
                                                <input
                                                    type="text"
                                                    value={data[titleField] as string}
                                                    onChange={(event) => setData(titleField, event.target.value)}
                                                    className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-2 text-slate-800 shadow-sm focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-300"
                                                />
                                                {errors[titleField] && (
                                                    <p className="mt-1 text-sm text-rose-500">{errors[titleField]}</p>
                                                )}
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-slate-700">{levelFieldBody}</label>
                                                <textarea
                                                    value={data[bodyField] as string}
                                                    onChange={(event) => setData(bodyField, event.target.value)}
                                                    className="mt-1 min-h-[120px] w-full rounded-xl border border-slate-200 px-4 py-2 text-slate-800 shadow-sm focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-300"
                                                />
                                                {errors[bodyField] && (
                                                    <p className="mt-1 text-sm text-rose-500">{errors[bodyField]}</p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </section>
                            );
                        })}
                    </section>

                    <div className="flex justify-end">
                        <button
                            type="submit"
                            disabled={processing || Object.values(localErrors).some(Boolean)}
                            className="inline-flex items-center justify-center gap-2 rounded-full bg-slate-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-70"
                        >
                            {processing && <Loader2 className="h-4 w-4 animate-spin" />}
                            {processing ? savingLabel : saveLabel}
                        </button>
                    </div>
                </form>
            </div>
        </AuthenticatedLayout>
    );
}
