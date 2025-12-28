// Memory Lane Reward Types
export interface Reward {
    id: number;
    category: "emotional" | "action" | "privilege";
    title: string;
    description: string;
    icon: string;
    color: string;
    enabled?: boolean;
}

// Flipbook Page Types
export interface FlipbookPage {
    id: string | number;
    title: string;
    body: string;
    image?: string | null;
    image_file?: File | null;
}

// Memory Lane Level Types
export interface MemoryLaneLevel {
    id: string;
    label: string;
    image?: string | null;
    summaryTitle?: string;
    summaryBody?: string;
    rewards?: Reward[];
    flipbook?: FlipbookPage[];
}

// Memory Lane Content Types
export interface MemoryLaneContent {
    headTitle: string;
    intro: {
        tagline: string;
        title: string;
        description: string;
        stepsHeading: string;
        tokensHeading: string;
        challengeLabel: string;
        closing: {
            description: string;
            story: {
                title: string;
                description: string;
                button: string;
            };
            footnote: string;
        };
    };
    steps: Array<{
        id: string;
        title: string;
        prompt: string;
        action: string;
    }>;
    tokens: Array<{
        label: string;
        detail: string;
        accent: string;
    }>;
    secretGate: {
        code: string;
        title: string;
        description: string;
        placeholder: string;
        buttonLabel: string;
        errorMessage: string;
        hint?: string;
        hintLabel: string;
        accessLabel: string;
        inputLabel: string;
    };
    puzzle: {
        title: string;
        description: string;
        pretitle: string;
        dragLabel: string;
        movesLabel: string;
        resetLabel: string;
        grid: {
            rows: number;
            cols: number;
        };
        levels: MemoryLaneLevel[];
    };
    rewards: Reward[];
    flipbook: FlipbookPage[];
}
