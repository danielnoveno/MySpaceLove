import React from "react";
import { Head } from "@inertiajs/react";

const features = [
    {
        title: "Memory Lane",
        description:
            "Abadikan momen penting melalui timeline interaktif yang menyimpan foto, cerita, dan milestone hubungan kalian.",
    },
    {
        title: "Love Letters",
        description:
            "Kirim pesan harian yang hangat dan penuh perhatian sehingga pasanganmu selalu merasa dekat meski terpisah jarak.",
    },
    {
        title: "Promise Tracker",
        description:
            "Buat daftar janji dan impian masa depan yang bisa dicapai bersama sebagai pengingat komitmen kalian berdua.",
    },
    {
        title: "Secret Vault",
        description:
            "Simpan kata sandi spesial, kode rahasia, atau hal-hal kecil lainnya yang hanya dimengerti kalian berdua.",
    },
];

export default function About() {
    return (
        <>
            <Head title="About LoveSpace" />
            <div className="min-h-screen bg-gradient-to-b from-rose-100 via-white to-rose-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                    <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm border border-rose-100/60 dark:border-gray-700 rounded-3xl shadow-xl overflow-hidden">
                        <div className="grid grid-cols-1 lg:grid-cols-5">
                            <div className="lg:col-span-3 p-8 sm:p-12 space-y-6">
                                <p className="inline-flex items-center rounded-full bg-rose-100 dark:bg-rose-500/10 text-rose-500 dark:text-rose-300 px-4 py-1 text-sm font-semibold tracking-wide uppercase">
                                    Kisah di Balik LoveSpace
                                </p>
                                <h1 className="text-3xl sm:text-4xl font-extrabold text-rose-600 dark:text-rose-400 leading-tight drop-shadow-sm">
                                    Hadiah dari rindu, ruang untuk menumbuhkan cinta
                                </h1>
                                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                                    LoveSpace tercipta dari kerinduan mendalam seorang Peng untuk Winnie, sebagai kado ulang tahun yang berbeda dari biasanya.
                                    Di tengah jarak yang memisahkan, ia membangun ruang digital yang membuat kisah mereka tetap hangat, dekat, dan terus bertumbuh.
                                </p>
                                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                                    Setiap sudut LoveSpace dirancang agar pasangan LDR dapat merasakan kehadiran satu sama lain kapan pun dibutuhkan. Cerita, foto, janji, hingga rencana masa depan dijalin rapi agar selalu siap menyapa ketika rindu menyeruak.
                                </p>
                                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                                    Kini LoveSpace berkembang menjadi ruang hangat bagi siapa saja yang ingin merawat hubungan secara kreatif. Kami percaya, cinta pantas dirayakan setiap hari—dan LoveSpace ada untuk membantu mewujudkannya.
                                </p>
                                <div className="pt-4">
                                    <a
                                        href="/register"
                                        className="inline-flex items-center justify-center rounded-full bg-rose-500 hover:bg-rose-600 dark:bg-rose-600 dark:hover:bg-rose-500 px-6 py-3 text-base font-semibold text-white shadow-lg shadow-rose-200/80 dark:shadow-rose-900/40 transition-transform duration-200 hover:-translate-y-0.5"
                                    >
                                        Coba LoveSpace Sekarang
                                    </a>
                                </div>
                            </div>
                            <div className="lg:col-span-2 bg-gradient-to-br from-rose-200/80 via-rose-100 to-pink-200/80 dark:from-rose-900/30 dark:via-rose-800/20 dark:to-pink-900/30 flex items-center">
                                <div className="w-full h-full p-8 sm:p-10 flex flex-col justify-center space-y-6">
                                    <div className="space-y-2">
                                        <p className="text-sm uppercase tracking-widest text-rose-500 dark:text-rose-300 font-semibold">
                                            Fitur yang Membuatnya Spesial
                                        </p>
                                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                                            Setiap detail disiapkan untuk menguatkan hubunganmu
                                        </h2>
                                    </div>
                                    <ul className="space-y-4">
                                        {features.map((feature) => (
                                            <li
                                                key={feature.title}
                                                className="bg-white/80 dark:bg-gray-900/60 border border-white/70 dark:border-gray-700 rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow duration-200"
                                            >
                                                <h3 className="text-lg font-semibold text-rose-500 dark:text-rose-300">
                                                    {feature.title}
                                                </h3>
                                                <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                                                    {feature.description}
                                                </p>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
