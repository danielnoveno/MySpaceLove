// ==== User & Auth ====
export interface User {
    id: number;
    name: string;
    email: string;
}

// ==== Space ====
export interface Space {
    id: number;
    slug: string;
    name: string;
    theme_id: number;
    user_id: number;
}

// ==== Timeline ====
export interface Timeline {
    id: number;
    space_id: number;
    title: string;
    event_date: string; // ISO Date
    description: string;
}

// ==== DailyMessage ====
export interface DailyMessage {
    id: number;
    space_id: number;
    message: string;
    date: string;
}

// ==== Countdown ====
export interface Countdown {
    id: number;
    space_id: number;
    title: string;
    target_date: string; // ISO Date
}

// ==== Journal ====
export interface Journal {
    id: number;
    space_id: number;
    title: string;
    content: string;
    created_at: string;
}

// ==== SurpriseNote ====
export interface SurpriseNote {
    id: number;
    space_id: number;
    title: string;
    content: string;
    is_opened: boolean;
}

// ==== MediaGallery ====
export interface MediaGallery {
    id: number;
    space_id: number;
    type: "image" | "video";
    url: string;
}

// ==== Wishlist ====
export interface Wishlist {
    id: number;
    space_id: number;
    title: string;
    description?: string;
    is_done: boolean;
}

// ==== Docs ====
export interface Doc {
    id: number;
    space_id: number;
    title: string;
    file_url: string;
}

// ==== Theme ====
export interface Theme {
    id: number;
    name: string;
    preview_url: string;
}

// ==== PageProps (global untuk Inertia) ====
export interface PageProps {
    auth: {
        user: User;
    };
    [key: string]: any;
    space?: Space;
    timelines?: Timeline[];
    dailyMessages?: DailyMessage[];
    countdowns?: Countdown[];
    journals?: Journal[];
    surpriseNotes?: SurpriseNote[];
    galleries?: MediaGallery[];
    wishlists?: Wishlist[];
    docs?: Doc[];
    themes?: Theme[];
}
