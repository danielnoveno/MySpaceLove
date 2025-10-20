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

export const memoryLaneSteps: MemoryStep[] = [
    {
        id: "reminisce",
        title: "Flashback Hangat",
        prompt:
            "Buka galeri dan pilih tiga foto favorit kita. Ceritain kenapa foto-foto itu paling berkesan.",
        action: "Siapkan satu kalimat penutup napas untuk tiap foto.",
    },
    {
        id: "gratitude",
        title: "List Terima Kasih",
        prompt:
            "Tulis lima hal yang membuatmu bersyukur tentang hubungan ini minggu ini.",
        action: "Selipkan sticky note ke dompet/ tas pasanganmu besok.",
    },
    {
        id: "future",
        title: "Dream Date",
        prompt:
            "Bayangin satu aktivitas impian bareng. Nggak harus mewah—yang penting versi kita.",
        action: "Kirim voice note lucu malam nanti berisi undangan date itu.",
    },
];

export const memoryLaneTokens: LoveToken[] = [
    {
        label: "Mini Puzzle",
        detail: "Sembunyikan petunjuk kecil di tiga tempat rumah.",
        accent: "bg-pink-200/60 text-pink-700",
    },
    {
        label: "Playlist Rahasia",
        detail: "Buat 4 lagu dengan catatan kenapa kamu pilih lagu itu.",
        accent: "bg-purple-200/60 text-purple-700",
    },
    {
        label: "Comfort Food",
        detail: "Pesan makanan favoritnya dan tempelkan pesan singkat.",
        accent: "bg-emerald-200/60 text-emerald-700",
    },
];
