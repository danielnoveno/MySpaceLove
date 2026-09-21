import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, Link } from "@inertiajs/react";
import { CalendarPlus, Disc3, Gift, Music2, Radio } from "lucide-react";

type Space = { id: number; slug: string; title: string };
type Props = { space: Space; counts: { capsules: number; listeningPlans: number; surpriseDrops: number }; companionRoute: string };

export default function SpotifyIndex({ space, counts, companionRoute }: Props) {
    const cards = [
        { title: "Memory Capsules", desc: "Simpan lagu dan cerita momen kalian.", count: counts.capsules, href: route("spotify.capsules.index", { space: space.slug }), icon: Disc3 },
        { title: "Listening Plans", desc: "Jadwalkan sesi dengerin playlist bareng.", count: counts.listeningPlans, href: route("spotify.listening-plans.index", { space: space.slug }), icon: CalendarPlus },
        { title: "Surprise Drops", desc: "Schedule lagu kejutan untuk pasangan.", count: counts.surpriseDrops, href: route("spotify.surprise-drops.index", { space: space.slug }), icon: Gift },
        { title: "Companion Hub", desc: "Buka Spotify hub lama dengan live mood/playback.", count: null, href: companionRoute, icon: Radio },
    ];

    return <AuthenticatedLayout><Head title={`Spotify - ${space.title}`} /><div className="w-full max-w-none px-0 sm:px-6 lg:px-8"><div className="mb-6"><Link href={route("spaces.show", { space: space.slug })} className="text-sm font-semibold text-pink-500 hover:text-pink-600">← Back to Space</Link><h1 className="mt-2 text-3xl font-semibold text-gray-900">Spotify</h1><p className="mt-1 text-sm text-gray-600">Music features for {space.title}.</p></div><div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">{cards.map((card) => { const Icon = card.icon; return <Link key={card.title} href={card.href} className="rounded-3xl border border-green-100 bg-white/90 p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md"><div className="inline-flex rounded-2xl bg-green-50 p-3 text-green-600"><Icon className="h-6 w-6" /></div><h2 className="mt-4 text-xl font-semibold text-gray-900">{card.title}</h2><p className="mt-2 text-sm text-gray-600">{card.desc}</p>{card.count !== null && <div className="mt-4 text-3xl font-bold text-green-600">{card.count}</div>}</Link>; })}</div><div className="mt-6 rounded-3xl border border-emerald-100 bg-emerald-50/70 p-5 text-sm text-emerald-800"><Music2 className="mr-2 inline h-4 w-4" /> Untuk auto-fetch track detail dari Spotify, connect akun lewat Companion Hub. Form manual tetap bisa dipakai tanpa koneksi Spotify.</div></div></AuthenticatedLayout>;
}
