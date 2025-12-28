import { usePage } from "@inertiajs/react";
import { PageProps } from "@/types";

type CurrentSpace = {
    id: number;
    slug: string;
    title: string;
} | null;

export function useCurrentSpace(): CurrentSpace {
    const { props } = usePage<
        PageProps & {
            currentSpace?:
                | {
                      id: number;
                      slug: string;
                      title: string;
                  }
                | null;
        }
    >();

    return props.currentSpace ?? null;
}
