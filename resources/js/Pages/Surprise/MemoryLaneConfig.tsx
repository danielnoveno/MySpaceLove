import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, useForm, usePage } from "@inertiajs/react";
import { ChangeEvent, FormEvent, useEffect, useRef, useState } from "react";
import { Loader2, Upload, Image as ImageIcon, RotateCcw } from "lucide-react";
import { convertImageToWebP } from "@/utils/imageConverter";
import { useTranslation } from "@/hooks/useTranslation";

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
}

const MAX_FILE_SIZE = 10 * 1024 * 1024;

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
    pin: string;
}

const levelKeys: LevelKey[] = ["level_one", "level_two", "level_three"];

const createFormState = (source: LevelConfig[], initialPin: string | null): FormData => ({
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
    pin: initialPin ?? "",
});

const formatString = (template: string, replacements: Record<string, string | number>): string => {
    return Object.entries(replacements).reduce((carry, [search, value]) => {
        return carry.replace(new RegExp(`:${search}`, "g"), String(value));
    }, template);
};

export default function MemoryLaneConfig({ space, levels, pin, contentSet }: Props) {
    const page = usePage();
    const flash = page.props.flash as { success?: string; error?: string } | undefined;
    const { t } = useTranslation("app");

    const translate = (key: string, fallback?: string): string =>
        t(`memory_lane.editor.${key}`, fallback ?? key);

    const translateWith = (
        key: string,
        replacements?: Record<string, string | number>,
        fallback?: string,
    ): string => {
        const base = translate(key, fallback);

        if (!replacements) {
            return base;
        }

        return formatString(base, replacements);
    };

    const [formState] = useState(() => createFormState(levels, pin));
    const { data, setData, post, processing, errors } = useForm<FormData>(formState);

    const [previews, setPreviews] = useState<Record<LevelKey, string | null>>({
        level_one: levels[0]?.image ?? levels[0]?.default_image ?? null,
        level_two: levels[1]?.image ?? levels[1]?.default_image ?? null,
        level_three: levels[2]?.image ?? levels[2]?.default_image ?? null,
    });

    const [uploadErrors, setUploadErrors] = useState<Record<LevelKey, string | null>>({
        level_one: null,
        level_two: null,
        level_three: null,
    });

    const objectUrlsRef = useRef<Record<string, string>>({});

    useEffect(() => {
        return () => {
            Object.values(objectUrlsRef.current).forEach((url) => URL.revokeObjectURL(url));
            objectUrlsRef.current = {};
        };
    }, []);

    useEffect(() => {
        Object.values(objectUrlsRef.current).forEach((url) => URL.revokeObjectURL(url));
        objectUrlsRef.current = {};

        setPreviews({
            level_one: levels[0]?.image ?? levels[0]?.default_image ?? null,
            level_two: levels[1]?.image ?? levels[1]?.default_image ?? null,
            level_three: levels[2]?.image ?? levels[2]?.default_image ?? null,
        });

        setUploadErrors({
            level_one: null,
            level_two: null,
            level_three: null,
        });

        setData((current) => ({
            ...current,
            ...createFormState(levels, pin),
        }));
    }, [levels, pin, setData]);

    const handleFileChange = async (event: ChangeEvent<HTMLInputElement>, key: LevelKey) => {
        const file = event.target.files?.[0] ?? null;
        const imageField = `${key}_image` as const;
        const resetField = `${key}_reset` as const;

        if (!file) {
            setData(imageField, null);
            setData(resetField, false);
            return;
        }

        if (file.size > MAX_FILE_SIZE) {
            setUploadErrors((prev) => ({
                ...prev,
                [key]: t("uploads.errors.memory_lane_image_too_large"),
            }));
            event.target.value = "";
            return;
        }

        try {
            const converted = await convertImageToWebP(file);

            setUploadErrors((prev) => ({ ...prev, [key]: null }));
            setData(imageField, converted);
            setData(resetField, false);

            if (objectUrlsRef.current[key]) {
                URL.revokeObjectURL(objectUrlsRef.current[key]);
            }

            const url = URL.createObjectURL(converted);
            objectUrlsRef.current[key] = url;
            setPreviews((prev) => ({ ...prev, [key]: url }));
        } catch (error) {
            console.error("Failed to convert Memory Lane image", error);
            setUploadErrors((prev) => ({
                ...prev,
                [key]: t("uploads.errors.image_conversion_failed"),
            }));
            event.target.value = "";
        }
    };

    const handleResetImage = (key: LevelKey, defaultImage?: string | null) => {
        const imageField = `${key}_image` as const;
        const resetField = `${key}_reset` as const;

        setData(imageField, null);
        setData(resetField, true);

        setUploadErrors((prev) => ({ ...prev, [key]: null }));

        if (objectUrlsRef.current[key]) {
            URL.revokeObjectURL(objectUrlsRef.current[key]);
            delete objectUrlsRef.current[key];
        }

        setPreviews((prev) => ({ ...prev, [key]: defaultImage ?? null }));
    };

    const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        post(route("memory-lane.update", { space: space.slug }), {
            forceFormData: true,
            preserveScroll: true,
        });
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="space-y-1">
                    <h2 className="text-2xl font-semibold text-slate-900">
                        {translate("title")}
                    </h2>
                    <p className="text-sm text-slate-500">
                        {translateWith("description", { spaceTitle: space.title })}
                    </p>
                </div>
            }
        >
            <Head title={translate("meta_title", "Memory Lane Config")} />

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
                            <h3 className="text-xl font-semibold text-slate-900">
                                {translate("access.title")}
                            </h3>
                            <p className="text-sm text-slate-500">
                                {translate("access.description")}
                            </p>
                        </header>
                        <div>
                            <label htmlFor="pin" className="block text-sm font-medium text-slate-700">
                                {translate("access.pin_label")}
                            </label>
                            <input
                                id="pin"
                                type="text"
                                value={data.pin}
                                onChange={(event) => setData("pin", event.target.value)}
                                className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-2 text-slate-800 shadow-sm focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-300"
                                placeholder={translate("access.pin_placeholder")}
                                maxLength={10}
                            />
                            {errors.pin && <p className="mt-1 text-sm text-rose-500">{errors.pin}</p>}
                        </div>
                        {!contentSet && (
                            <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700 shadow">
                                {translate("access.empty_notice")}
                            </div>
                        )}
                    </section>

                    {levels.map((level, index) => {
                        const key = levelKeys[index];
                        const imageField = `${key}_image` as const;
                        const titleField = `${key}_title` as const;
                        const bodyField = `${key}_body` as const;
                        const resetField = `${key}_reset` as const;
                        const preview = previews[key];

                        return (
                            <section key={level.key} className="space-y-4">
                                <header className="space-y-2">
                                    <p className="text-xs uppercase tracking-[0.32em] text-slate-400">
                                        {translateWith("level.badge", { number: index + 1 })}
                                    </p>
                                    <h3 className="text-xl font-semibold text-slate-900">
                                        {level.label}
                                    </h3>
                                </header>
                                <div className="grid gap-6 md:grid-cols-[minmax(0,320px)_minmax(0,1fr)]">
                                    <div className="space-y-3">
                                        <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-slate-50">
                                            {preview ? (
                                                <img
                                                    src={preview}
                                                    alt={translateWith("level.preview_alt", { number: index + 1 })}
                                                    className="h-56 w-full object-cover"
                                                />
                                            ) : (
                                                <div className="flex h-56 flex-col items-center justify-center gap-2 text-sm text-slate-400">
                                                    <ImageIcon className="h-8 w-8" />
                                                    <span>{translate("level.empty_image")}</span>
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex flex-col gap-2">
                                            <label className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-full bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700">
                                                <Upload className="h-4 w-4" />
                                                {translate("level.upload")}
                                                <input
                                                    type="file"
                                                    className="hidden"
                                                    accept="image/*"
                                                    onChange={(event) => void handleFileChange(event, key)}
                                                />
                                            </label>
                                            {(level.image || level.default_image) && (
                                                <button
                                                    type="button"
                                                    onClick={() => handleResetImage(key, level.default_image)}
                                                    className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition hover:border-slate-300 hover:bg-slate-50"
                                                >
                                                    <RotateCcw className="h-4 w-4" />
                                                    {translate("level.reset")}
                                                </button>
                                            )}
                                            {errors[imageField] && (
                                                <p className="text-sm text-rose-500">{errors[imageField]}</p>
                                            )}
                                            {uploadErrors[key] && (
                                                <p className="text-sm text-rose-500">{uploadErrors[key]}</p>
                                            )}
                                        </div>
                                    </div>
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700">
                                                {translate("level.title_label")}
                                            </label>
                                            <input
                                                type="text"
                                                value={data[titleField] as string}
                                                onChange={(event) => setData(titleField, event.target.value)}
                                                className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-2 text-slate-800 shadow-sm focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-300"
                                                placeholder={translate("level.title_placeholder")}
                                            />
                                            {errors[titleField] && (
                                                <p className="mt-1 text-sm text-rose-500">{errors[titleField]}</p>
                                            )}
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700">
                                                {translate("level.body_label")}
                                            </label>
                                            <textarea
                                                value={data[bodyField] as string}
                                                onChange={(event) => setData(bodyField, event.target.value)}
                                                className="mt-1 min-h-[120px] w-full rounded-xl border border-slate-200 px-4 py-2 text-slate-800 shadow-sm focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-300"
                                                placeholder={translate("level.body_placeholder")}
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

                    <div className="flex justify-end">
                        <button
                            type="submit"
                            disabled={processing}
                            className="inline-flex items-center justify-center gap-2 rounded-full bg-slate-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-70"
                        >
                            {processing && <Loader2 className="h-4 w-4 animate-spin" />}
                            {processing ? translate("actions.saving") : translate("actions.submit")}
                        </button>
                    </div>
                </form>
            </div>
        </AuthenticatedLayout>
    );
}
