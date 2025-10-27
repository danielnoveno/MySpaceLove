export type LoveStoryDecoration = "hearts" | "sparkles" | "stars" | "petals";

export type LoveStoryHighlight = {
    title: string;
    description: string;
};

export type LoveStoryChapter = {
    id: string;
    chapterLabel: string;
    title: string;
    dateLabel?: string;
    intro: string;
    story: string;
    highlights: LoveStoryHighlight[];
    quote?: {
        text: string;
        author?: string;
    };
    theme: {
        gradient: string;
        accent: string;
        text: string;
        soft: string;
    };
    decorations: LoveStoryDecoration[];
};

export type StoryBookContent = {
    headTitle: string;
    secretGate: {
        code: string;
        enabled?: boolean;
        accessLabel: string;
        title: string;
        description: string;
        placeholder: string;
        buttonLabel: string;
        errorMessage: string;
        hintLabel: string;
        hint?: string;
        inputLabel: string;
    };
    hero: {
        tagline: string;
        title: string;
        description: string;
    };
    flipbook: {
        empty: string;
        narratorLabel: string;
        progressSuffix: string;
        messageLabel: string;
        previous: string;
        next: string;
        finish: string;
    };
    footer: {
        reminder: string;
        finishMessage: string;
        nextButton: string;
    };
    chapters: LoveStoryChapter[];
};
