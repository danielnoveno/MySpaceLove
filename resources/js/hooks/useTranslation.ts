import { useMemo, useCallback } from "react";
import { usePage } from "@inertiajs/react";
import { PageProps } from "@/types";

type TranslationTree = Record<string, unknown>;

const getValue = (source: TranslationTree | undefined, path: string): unknown => {
    if (!source) {
        return undefined;
    }

    if (!path) {
        return source;
    }

    const segments = path.split(".");

    let current: unknown = source;

    for (const segment of segments) {
        if (
            current &&
            typeof current === "object" &&
            segment in (current as Record<string, unknown>)
        ) {
            current = (current as Record<string, unknown>)[segment];
        } else {
            return undefined;
        }
    }

    return current;
};

export const useTranslation = <T extends TranslationTree = TranslationTree>(
    namespace?: string,
) => {
    const { props } = usePage<PageProps & { translations?: TranslationTree }>();
    const translations = (props.translations ?? {}) as TranslationTree;

    const scopedTranslations = useMemo(() => {
        if (!namespace) {
            return translations as T;
        }

        const value = getValue(translations, namespace);

        if (value && typeof value === "object") {
            return value as T;
        }

        return ({} as T);
    }, [namespace, translations]);

    const t = useCallback(
        (key: string, fallback?: string): string => {
            const value = getValue(scopedTranslations, key);

            if (typeof value === "string") {
                return value;
            }

            if (fallback !== undefined) {
                return fallback;
            }

            const globalValue = namespace
                ? getValue(translations, `${namespace}.${key}`)
                : getValue(translations, key);

            if (typeof globalValue === "string") {
                return globalValue;
            }

            return key;
        },
        [namespace, scopedTranslations, translations],
    );

    return {
        t,
        translations: scopedTranslations,
        raw: translations,
    };
};
