import { usePage } from "@inertiajs/react";

type CurrentSpace = {
    id: number;
    slug: string;
    title: string;
} | null;

export function useCurrentSpace(): CurrentSpace {
    const { props } = usePage<{
        currentSpace?:
            | {
                  id: number;
                  slug: string;
                  title: string;
              }
            | null;
    }>();

    return props.currentSpace ?? null;
}
