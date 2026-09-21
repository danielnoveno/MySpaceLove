import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import PickMap from "@/Pages/Location/PickMap";
import { Head, Link, useForm } from "@inertiajs/react";
import { FormEvent } from "react";
import type { ReactNode } from "react";
import { Coffee, MapPin, Plane, Save, Star, StickyNote, Ticket, TreePine, Utensils } from "lucide-react";

type Space = { id: number; slug: string; title: string };
type Props = { space: Space; categories: string[] };

const icons: Record<string, any> = { restaurant: Utensils, cafe: Coffee, park: TreePine, activity: Ticket, travel: Plane, other: StickyNote };
const labels: Record<string, string> = { restaurant: "Restaurant", cafe: "Cafe", park: "Park", activity: "Activity", travel: "Travel", other: "Other" };
const inputClass = "w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm focus:border-pink-400 focus:ring-pink-400";

export default function CreateLocation({ space, categories }: Props) {
    const { data, setData, post, processing, errors } = useForm({
        name: "",
        address: "",
        city: "",
        category: "other",
        notes: "",
        rating: "",
        saved_at: "",
        latitude: "",
        longitude: "",
    });

    const submit = (event: FormEvent) => {
        event.preventDefault();
        post(route("locations.store", { space: space.slug }));
    };

    return (
        <AuthenticatedLayout>
            <Head title={`Add Location - ${space.title}`} />
            <div className="w-full max-w-none px-0 sm:px-6 lg:px-8">
                <div className="mb-6">
                    <Link href={route("locations.index", { space: space.slug })} className="text-sm font-semibold text-pink-500 hover:text-pink-600">← Back to Locations</Link>
                    <h1 className="mt-2 text-3xl font-semibold text-gray-900">Add Location</h1>
                    <p className="mt-1 text-sm text-gray-600">Save a place to visit together in {space.title}.</p>
                </div>
                <form onSubmit={submit} className="grid gap-6 lg:grid-cols-[1fr,1fr]">
                    <div className="space-y-5 rounded-3xl border border-pink-100 bg-white/90 p-6 shadow-sm">
                        <Field label="Location name" error={errors.name}><input value={data.name} onChange={(e) => setData("name", e.target.value)} className={inputClass} placeholder="Cute cafe downtown" /></Field>
                        <Field label="Address" error={errors.address}><input value={data.address} onChange={(e) => setData("address", e.target.value)} className={inputClass} placeholder="Street, building, area" /></Field>
                        <Field label="City" error={errors.city}><input value={data.city} onChange={(e) => setData("city", e.target.value)} className={inputClass} placeholder="Jakarta, Bandung..." /></Field>
                        <div>
                            <label className="mb-2 block text-sm font-semibold text-gray-700">Category</label>
                            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                                {categories.map((category) => {
                                    const Icon = icons[category] ?? StickyNote;
                                    return <button key={category} type="button" onClick={() => setData("category", category)} className={`rounded-2xl border p-3 text-sm font-semibold transition ${data.category === category ? "border-pink-400 bg-pink-50 text-pink-600" : "border-gray-100 bg-gray-50 text-gray-600 hover:bg-pink-50"}`}><Icon className="mx-auto mb-1 h-5 w-5" />{labels[category] ?? category}</button>;
                                })}
                            </div>
                            {errors.category && <p className="mt-1 text-sm text-rose-600">{errors.category}</p>}
                        </div>
                        <Field label="Notes" error={errors.notes}><textarea value={data.notes} onChange={(e) => setData("notes", e.target.value)} className={`${inputClass} min-h-28`} placeholder="Why do you want to go here?" /></Field>
                    </div>
                    <div className="space-y-5 rounded-3xl border border-purple-100 bg-white/90 p-6 shadow-sm">
                        <div>
                            <label className="mb-2 block text-sm font-semibold text-gray-700">Rating</label>
                            <div className="flex gap-1">
                                {[1, 2, 3, 4, 5].map((value) => <button key={value} type="button" onClick={() => setData("rating", data.rating === String(value) ? "" : String(value))}><Star className={`h-8 w-8 ${Number(data.rating) >= value ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`} /></button>)}
                            </div>
                        </div>
                        <Field label="Saved date" error={errors.saved_at}><input type="date" value={data.saved_at} onChange={(e) => setData("saved_at", e.target.value)} className={inputClass} /></Field>
                        <PickMap latitude={data.latitude ? Number(data.latitude) : null} longitude={data.longitude ? Number(data.longitude) : null} onPick={(lat, lng) => { setData("latitude", lat.toFixed(7)); setData("longitude", lng.toFixed(7)); }} />
                        <div className="grid grid-cols-2 gap-3">
                            <Field label="Latitude" error={errors.latitude}><input value={data.latitude} onChange={(e) => setData("latitude", e.target.value)} className={inputClass} /></Field>
                            <Field label="Longitude" error={errors.longitude}><input value={data.longitude} onChange={(e) => setData("longitude", e.target.value)} className={inputClass} /></Field>
                        </div>
                        <button disabled={processing} className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-pink-500 px-5 py-3 text-sm font-semibold text-white hover:bg-pink-600 disabled:opacity-60"><Save className="h-4 w-4" />{processing ? "Saving..." : "Save location"}</button>
                    </div>
                </form>
            </div>
        </AuthenticatedLayout>
    );
}

function Field({ label, error, children }: { label: string; error?: string; children: ReactNode }) {
    return <div><label className="mb-2 block text-sm font-semibold text-gray-700">{label}</label>{children}{error && <p className="mt-1 text-sm text-rose-600">{error}</p>}</div>;
}
