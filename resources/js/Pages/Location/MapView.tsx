import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import type { PageProps as AppPageProps } from "@/types";
import { Head, usePage } from "@inertiajs/react";
import axios from "axios";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
    MapContainer,
    Marker,
    Popup,
    TileLayer,
    useMap,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

type LocationPayload = {
    latitude: number;
    longitude: number;
    updated_at?: string | null;
};

type Partner = {
    id: number;
    name: string;
    email: string;
};

type LocationPageProps = AppPageProps & {
    partner?: Partner | null;
    initialLocation?: LocationPayload | null;
};

const isBrowser = typeof window !== "undefined";

if (isBrowser) {
    L.Icon.Default.mergeOptions({
        iconRetinaUrl: markerIcon2x,
        iconUrl: markerIcon,
        shadowUrl: markerShadow,
    });
}

type MapUpdaterProps = {
    position: [number, number] | null;
};

const MapUpdater = ({ position }: MapUpdaterProps) => {
    const map = useMap();

    useEffect(() => {
        if (position) {
            map.setView(position, map.getZoom());
        }
    }, [map, position]);

    return null;
};

const formatDate = (value?: string | null) => {
    if (!value) return "Belum pernah";

    try {
        return new Intl.DateTimeFormat("id-ID", {
            dateStyle: "medium",
            timeStyle: "short",
        }).format(new Date(value));
    } catch (error) {
        return value;
    }
};

const distanceInKm = (origin: LocationPayload, target: LocationPayload) => {
    const earthRadiusKm = 6371;

    const deg2rad = (deg: number) => (deg * Math.PI) / 180;

    const dLat = deg2rad(target.latitude - origin.latitude);
    const dLon = deg2rad(target.longitude - origin.longitude);

    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(deg2rad(origin.latitude)) *
            Math.cos(deg2rad(target.latitude)) *
            Math.sin(dLon / 2) *
            Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return earthRadiusKm * c;
};

const MapView = () => {
    const { props } = usePage<LocationPageProps>();
    const partner = props.partner ?? null;

    const [userLocation, setUserLocation] = useState<LocationPayload | null>(
        props.initialLocation ?? null
    );
    const [partnerLocation, setPartnerLocation] =
        useState<LocationPayload | null>(null);
    const [toast, setToast] = useState<{
        message: string;
        type: "success" | "error";
    } | null>(null);
    const [isUpdating, setIsUpdating] = useState(false);
    const [isSharing, setIsSharing] = useState(false);
    const [isStopping, setIsStopping] = useState(false);

    const showToast = useCallback((message: string, type: "success" | "error") => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3200);
    }, []);

    const fetchPartnerLocation = useCallback(async () => {
        if (!partner) return;

        try {
            const { data } = await axios.get(`/api/location/${partner.id}`);
            setPartnerLocation(data.location ?? null);
            if (data.self_location) {
                setUserLocation(data.self_location);
            }
        } catch (error) {
            console.error(error);
            showToast("Gagal memuat lokasi pasangan.", "error");
        }
    }, [partner, showToast]);

    const updateLocation = useCallback(
        async (latitude: number, longitude: number) => {
            try {
                const { data } = await axios.post("/api/location/update", {
                    latitude,
                    longitude,
                });

                setUserLocation({
                    latitude: data.latitude,
                    longitude: data.longitude,
                    updated_at: data.updated_at,
                });

                if (data.partner_location) {
                    setPartnerLocation(data.partner_location);
                } else if (partner) {
                    await fetchPartnerLocation();
                }

                showToast("Lokasi berhasil diperbarui!", "success");
            } catch (error) {
                console.error(error);
                showToast("Gagal memperbarui lokasi.", "error");
            }
        },
        [fetchPartnerLocation, partner, showToast]
    );

    const fallbackToIp = useCallback(async () => {
        try {
            const response = await fetch("https://ipapi.co/json/");
            const location = await response.json();

            if (location?.latitude && location?.longitude) {
                await updateLocation(location.latitude, location.longitude);
            } else {
                showToast("Tidak dapat menentukan lokasi dari IP.", "error");
            }
        } catch (error) {
            console.error(error);
            showToast("Gagal mengambil lokasi cadangan.", "error");
        }
    }, [showToast, updateLocation]);

    const requestCurrentPosition = useCallback(() => {
        if (!isBrowser || !navigator.geolocation) {
            fallbackToIp();
            return;
        }

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords;
                await updateLocation(latitude, longitude);
            },
            async () => {
                await fallbackToIp();
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 0,
            }
        );
    }, [fallbackToIp, updateLocation]);

    useEffect(() => {
        requestCurrentPosition();
        if (partner) {
            fetchPartnerLocation();
        }

        const interval = setInterval(() => {
            requestCurrentPosition();
            if (partner) {
                fetchPartnerLocation();
            }
        }, 30000);

        return () => clearInterval(interval);
    }, [fetchPartnerLocation, partner, requestCurrentPosition]);

    const handleUpdateClick = async () => {
        setIsUpdating(true);
        try {
            await requestCurrentPosition();
        } finally {
            setIsUpdating(false);
        }
    };

    const handleShare = async () => {
        if (!userLocation) {
            showToast("Perbarui lokasimu terlebih dahulu.", "error");
            return;
        }

        setIsSharing(true);
        try {
            const { data } = await axios.post("/api/location/share", {
                latitude: userLocation.latitude,
                longitude: userLocation.longitude,
            });

            if (isBrowser && navigator.clipboard) {
                await navigator.clipboard.writeText(data.share_url);
            }

            showToast("Link lokasi dikirim & disalin!", "success");
        } catch (error) {
            console.error(error);
            showToast("Gagal berbagi lokasi.", "error");
        } finally {
            setIsSharing(false);
        }
    };

    const handleStopSharing = async () => {
        setIsStopping(true);
        try {
            await axios.delete("/api/location");
            setUserLocation(null);
            showToast("Berbagi lokasi dihentikan.", "success");
        } catch (error) {
            console.error(error);
            showToast("Gagal menghentikan berbagi lokasi.", "error");
        } finally {
            setIsStopping(false);
        }
    };

    const mapCenter = useMemo<[number, number]>(() => {
        if (userLocation) {
            return [userLocation.latitude, userLocation.longitude];
        }
        return [-2.5489, 118.0149];
    }, [userLocation]);

    const partnerDistance = useMemo(() => {
        if (userLocation && partnerLocation) {
            return distanceInKm(userLocation, partnerLocation);
        }
        return null;
    }, [partnerLocation, userLocation]);

    const hasPartner = Boolean(partner);
    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col gap-1">
                    <h2 className="text-xl font-semibold text-gray-800">
                        Berbagi Lokasi Pasangan
                    </h2>
                    <p className="text-sm text-gray-500">
                        Pantau lokasi kamu dan pasangan dengan update otomatis
                        setiap 30 detik.
                    </p>
                </div>
            }
        >
            <Head title="Berbagi Lokasi" />

            <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4">
                {toast && (
                    <div
                        className={`fixed right-6 top-24 z-50 rounded-xl px-4 py-3 shadow-lg transition ${
                            toast.type === "success"
                                ? "bg-emerald-500 text-white"
                                : "bg-rose-500 text-white"
                        }`}
                    >
                        {toast.message}
                    </div>
                )}

                <div className="grid gap-6 lg:grid-cols-[2fr,1fr]">
                    <div className="rounded-2xl bg-white p-4 shadow-lg">
                        {isBrowser ? (
                            <MapContainer
                                center={mapCenter}
                                zoom={14}
                                scrollWheelZoom
                                className="h-[500px] w-full rounded-xl"
                            >
                                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                                <MapUpdater position={mapCenter} />
                                {userLocation && (
                                    <Marker
                                        position={[
                                            userLocation.latitude,
                                            userLocation.longitude,
                                        ]}
                                    >
                                        <Popup>
                                            <div className="space-y-1 text-sm">
                                                <p className="font-semibold">
                                                    Kamu di sini 💖
                                                </p>
                                                <p className="text-gray-600">
                                                    Terakhir diperbarui:
                                                    <br />
                                                    {formatDate(
                                                        userLocation.updated_at
                                                    )}
                                                </p>
                                            </div>
                                        </Popup>
                                    </Marker>
                                )}
                                {partnerLocation && (
                                    <Marker
                                        position={[
                                            partnerLocation.latitude,
                                            partnerLocation.longitude,
                                        ]}
                                        icon={L.icon({
                                            iconUrl: markerIcon,
                                            iconRetinaUrl: markerIcon2x,
                                            shadowUrl: markerShadow,
                                        })}
                                    >
                                        <Popup>
                                            <div className="space-y-1 text-sm">
                                                <p className="font-semibold">
                                                    Pasanganmu 💕
                                                </p>
                                                <p className="text-gray-600">
                                                    Terakhir diperbarui:
                                                    <br />
                                                    {formatDate(
                                                        partnerLocation.updated_at
                                                    )}
                                                </p>
                                                {partnerDistance && (
                                                    <p className="text-gray-600">
                                                        Jarak ± {partnerDistance
                                                            .toFixed(2)
                                                            .toString()} km
                                                    </p>
                                                )}
                                            </div>
                                        </Popup>
                                    </Marker>
                                )}
                            </MapContainer>
                        ) : (
                            <div className="flex h-[500px] items-center justify-center rounded-xl bg-gray-100">
                                <p className="text-gray-500">
                                    Memuat peta...
                                </p>
                            </div>
                        )}
                    </div>

                    <div className="flex flex-col gap-4 rounded-2xl bg-white p-6 shadow-lg">
                        <div className="space-y-2">
                            <h3 className="text-lg font-semibold text-gray-800">
                                Status Lokasi
                            </h3>
                            <p className="text-sm text-gray-500">
                                Pembaruan otomatis berjalan setiap 30 detik.
                                Kamu juga bisa memperbarui secara manual atau
                                berbagi ke pasanganmu.
                            </p>
                        </div>

                        <div className="rounded-xl bg-rose-50 p-4 text-sm text-rose-600">
                            {userLocation ? (
                                <div className="space-y-1">
                                    <p className="font-semibold">
                                        Lokasi kamu aktif 💞
                                    </p>
                                    <p>
                                        Terakhir diperbarui:
                                        <br />
                                        {formatDate(userLocation.updated_at)}
                                    </p>
                                </div>
                            ) : (
                                <p>
                                    Lokasi kamu belum dibagikan. Tekan
                                    “Update Lokasi” untuk mulai membagikan.
                                </p>
                            )}
                        </div>

                        <div className="flex flex-col gap-3">
                            <button
                                onClick={handleUpdateClick}
                                className="flex items-center justify-center gap-2 rounded-xl bg-rose-500 px-4 py-3 text-sm font-semibold text-white shadow hover:bg-rose-600 focus:outline-none focus:ring-2 focus:ring-rose-300 disabled:cursor-not-allowed disabled:opacity-70"
                                disabled={isUpdating}
                            >
                                {isUpdating ? "Memperbarui..." : "📍 Update Lokasi"}
                            </button>
                            <button
                                onClick={handleShare}
                                className="flex items-center justify-center gap-2 rounded-xl bg-indigo-500 px-4 py-3 text-sm font-semibold text-white shadow hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-300 disabled:cursor-not-allowed disabled:opacity-70"
                                disabled={isSharing || !userLocation || !hasPartner}
                            >
                                {isSharing ? "Mengirim..." : "🔗 Share Lokasi"}
                            </button>
                            <button
                                onClick={handleStopSharing}
                                className="flex items-center justify-center gap-2 rounded-xl border border-rose-200 px-4 py-3 text-sm font-semibold text-rose-500 hover:bg-rose-50 focus:outline-none focus:ring-2 focus:ring-rose-200 disabled:cursor-not-allowed disabled:opacity-70"
                                disabled={isStopping || !userLocation}
                            >
                                {isStopping ? "Menghentikan..." : "⛔ Stop Sharing"}
                            </button>
                        </div>

                        <div className="rounded-xl border border-dashed border-rose-200 p-4 text-sm text-gray-600">
                            {hasPartner ? (
                                partnerLocation ? (
                                    <div className="space-y-1">
                                        <p className="font-semibold text-gray-800">
                                            {partner?.name} aktif berbagi lokasi 💗
                                        </p>
                                        <p>
                                            Terakhir diperbarui:
                                            <br />
                                            {formatDate(partnerLocation.updated_at)}
                                        </p>
                                        {partnerDistance && (
                                            <p>
                                                Perkiraan jarak kalian: {partnerDistance.toFixed(2)} km
                                            </p>
                                        )}
                                    </div>
                                ) : (
                                    <p>
                                        Pasanganmu belum membagikan lokasi atau
                                        datanya belum tersedia.
                                    </p>
                                )
                            ) : (
                                <p>
                                    Hubungkan pasanganmu di salah satu Space
                                    untuk mulai berbagi lokasi.
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
};

export default MapView;
