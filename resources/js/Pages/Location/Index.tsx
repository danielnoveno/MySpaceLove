import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, Link, router, usePage } from "@inertiajs/react";
import { Coffee, Edit3, Filter, MapPin, Plane, Plus, Star, StickyNote, Ticket, Trash2, TreePine, Utensils } from "lucide-react";
import { useMemo, useState } from "react";

type Space = { id: number; slug: string; title: string };
type SharedLocation = {
    id: number;
    user_id: number;
    name: string;
    address: string | null;
    city: string | null;
    category: string;
    notes: string | null;
    rating: number | null;
    saved_at: string | null;
    latitude: number | null;
    longitude: number | null;
    created_at: string | null;
    user?: { id: number; name: string } | null;
};

type Props = { space: Space; locations: SharedLocation[]; categories: string[] };

const meta: Record<string, { label: string; icon: any; className: string }> = {
    restaurant: { label: "Restaurant", icon: Utensils, className: "bg-orange-50 text-orange-600" },
    cafe: { label: "Cafe", icon: Coffee, className: "bg-amber-50 text-amber-600" },
    park: { label: "Park", icon: TreePine, className: "bg-green-50 text-green-600" },
    activity: { label: "Activity", icon: Ticket, className: "bg-purple-50 text-purple-600" },
    travel: { label: "Travel", icon: Plane, className: "bg-blue-50 text-blue-600" },
    other: { label: "Other", icon: StickyNote, className: "bg-gray-50 text-gray-600" },
};

export default function LocationsIndex({ space, locations, categories }: Props) {
    const { props } = usePage<any>();
    const currentUserId = props.auth?.user?.id;
    const [filter, setFilter] = useState("all");
    const [deleting, setDeleting] = useState<number | null>(null);

    const filtered = useMemo(
        () => (filter === "all" ? locations : locations.filter((location) => location.category === filter)),
        [filter, locations]
    );

    const destroy = (location: SharedLocation) => {
        if (!confirm(`Delete ${location.name}?`)) return;
        setDeleting(location.id);
        router.delete(route("locations.destroy", { space: space.slug, location: location.id }), {
            preserveScroll: true,
            onFinish: () => setDeleting(null),
        });
    };

    return (
        <AuthenticatedLayout>
            <Head title={`Locations - ${space.title}`} />
            <div className="w-full max-w-none px-0 sm:px-6 lg:px-8">
                <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
                    <div>
                        <Link href={route("spaces.show", { space: space.slug })} className="text-sm font-semibold text-pink-500 hover:text-pink-600">← Back to Space</Link>
                        <h1 className="mt-2 text-3xl font-semibold text-gray-900">Shared Locations</h1>
                        <p className="mt-1 text-sm text-gray-600">Wishlist tempat, cafe, taman, atau destinasi untuk dikunjungi bersama.</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <Link href={route("location.map", { space: space.slug })} className="inline-flex items-center gap-2 rounded-full border border-purple-200 px-4 py-2 text-sm font-semibold text-purple-600 hover:bg-purple-50"><MapPin className="h-4 w-4" /> Live map</Link>
                        <Link href={route("locations.create", { space: space.slug })} className="inline-flex items-center gap-2 rounded-full bg-pink-500 px-4 py-2 text-sm font-semibold text-white hover:bg-pink-600"><Plus className="h-4 w-4" /> Add location</Link>
                    </div>
                </div>

                <div className="mb-5 flex flex-wrap items-center gap-2 rounded-3xl border border-pink-100 bg-white/90 p-3 shadow-sm">
                    <span className="inline-flex items-center gap-1 px-2 text-sm font-semibold text-gray-600"><Filter className="h-4 w-4" /> Filter</span>
                    {[
                        "all",
                        ...categories,
                    ].map((category) => (
                        <button key={category} onClick={() => setFilter(category)} className={`rounded-full px-4 py-2 text-sm font-semibold transition ${filter === category ? "bg-pink-500 text-white" : "bg-pink-50 text-pink-600 hover:bg-pink-100"}`}>
                            {category === "all" ? "All" : meta[category]?.label ?? category}
                        </button>
                    ))}
                </div>

                {filtered.length === 0 ? (
                    <div className="rounded-3xl border border-dashed border-pink-200 bg-pink-50/70 p-10 text-center">
                        <MapPin className="mx-auto h-10 w-10 text-pink-400" />
                        <h2 className="mt-3 text-xl font-semibold text-gray-900">No locations yet</h2>
                        <p className="mt-1 text-sm text-gray-600">Add your first shared place.</p>
                    </div>
                ) : (
                    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                        {filtered.map((location) => {
                            const item = meta[location.category] ?? meta.other;
                            const Icon = item.icon;
                            const canManage = location.user_id === currentUserId;
                            return (
                                <article key={location.id} className="rounded-3xl border border-pink-100 bg-white/90 p-5 shadow-sm">
                                    <div className="flex items-start justify-between gap-3">
                                        <div className={`rounded-2xl p-3 ${item.className}`}><Icon className="h-5 w-5" /></div>
                                        {canManage && <div className="flex gap-2"><Link href={route("locations.edit", { space: space.slug, location: location.id })} className="rounded-full p-2 text-purple-500 hover:bg-purple-50"><Edit3 className="h-4 w-4" /></Link><button type="button" onClick={() => destroy(location)} disabled={deleting === location.id} className="rounded-full p-2 text-rose-500 hover:bg-rose-50 disabled:opacity-50"><Trash2 className="h-4 w-4" /></button></div>}
                                    </div>
                                    <h2 className="mt-4 text-xl font-semibold text-gray-900">{location.name}</h2>
                                    <div className="mt-1 text-sm text-gray-500">{[location.city, location.address].filter(Boolean).join(" • ") || item.label}</div>
                                    {location.rating && <div className="mt-3 flex gap-1">{[1, 2, 3, 4, 5].map((value) => <Star key={value} className={`h-4 w-4 ${value <= (location.rating ?? 0) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`} />)}</div>}
                                    {location.notes && <p className="mt-3 line-clamp-3 text-sm text-gray-600">{location.notes}</p>}
                                    <div className="mt-4 flex flex-wrap gap-2 text-xs text-gray-500">
                                        {location.saved_at && <span className="rounded-full bg-gray-50 px-3 py-1">Saved {location.saved_at}</span>}
                                        {location.latitude && location.longitude && <a href={`https://www.google.com/maps?q=${location.latitude},${location.longitude}`} target="_blank" rel="noreferrer" className="rounded-full bg-purple-50 px-3 py-1 text-purple-600 hover:bg-purple-100">Open map</a>}
                                    </div>
                                </article>
                            );
                        })}
                    </div>
                )}
            </div>
        </AuthenticatedLayout>
    );
}
