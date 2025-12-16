export type MemoryStep = {
    id: string;
    title: string;
    prompt: string;
    action: string;
};

export type LoveToken = {
    label: string;
    detail: string;
    accent: string;
};

export type MemoryLaneLevel = {
    id: string;
    label: string;
    image: string;
    summaryTitle: string;
    summaryBody: string;
};

export type MemoryLaneContent = {
    headTitle: string;
    secretGate: {
        code: string;
        accessLabel: string;
        title: string;
        description: string;
        placeholder: string;
        buttonLabel: string;
        errorMessage: string;
        hintLabel?: string;
        hint?: string;
        inputLabel: string;
    };
    puzzle: {
        grid: {
            rows: number;
            cols: number;
        };
        pretitle: string;
        title: string;
        description: string;
        solvedTitle: string;
        solvedDescription: string;
        dragLabel: string;
        movesLabel: string;
        resetLabel: string;
        levels: MemoryLaneLevel[];
    };
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
    steps: MemoryStep[];
    tokens: LoveToken[];
};
