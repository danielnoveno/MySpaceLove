import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head } from "@inertiajs/react";
import axios from "axios";
import L, { type LatLngExpression } from "leaflet";
import "leaflet/dist/leaflet.css";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

type LocationPoint = {
    latitude: number;
    longitude: number;
    updated_at?: string | null;
};

type Partner = {
    id: number;
    name: string;
    email: string;
};

type NotificationType = "success" | "error" | "warning";

type NotificationState = {
    message: string;
    type: NotificationType;
};

type Props = {
    auth: {
        user: {
            id: number;
            name: string;
            email: string;
        };
    };
    partner: Partner | null;
    userLocation: LocationPoint | null;
    partnerLocation: LocationPoint | null;
    shareBaseUrl: string;
};

const indonesiaCenter: LatLngExpression = [-2.5489, 118.0149];

L.Icon.Default.mergeOptions({
    iconRetinaUrl: markerIcon2x,
    iconUrl: markerIcon,
    shadowUrl: markerShadow,
});

function calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number,
): number {
    const toRad = (value: number) => (value * Math.PI) / 180;
    const R = 6371;
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRad(lat1)) *
            Math.cos(toRad(lat2)) *
            Math.sin(dLon / 2) *
            Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
}

function formatTimestamp(value: string | null | undefined): string | null {
    if (!value) {
        return null;
    }

    try {
        return new Intl.DateTimeFormat("id-ID", {
            dateStyle: "medium",
            timeStyle: "short",
        }).format(new Date(value));
    } catch (error) {
        console.error("Failed to format timestamp", error);
        return null;
    }
}

export default function MapView({
    auth,
    partner: initialPartner,
    userLocation: initialUserLocation,
    partnerLocation: initialPartnerLocation,
    shareBaseUrl,
}: Props) {
    const [userLocation, setUserLocation] = useState<LocationPoint | null>(
        initialUserLocation,
    );
    const [partnerLocation, setPartnerLocation] = useState<LocationPoint | null>(
        initialPartnerLocation,
    );
    const [lastUpdated, setLastUpdated] = useState<string | null>(
        initialUserLocation?.updated_at ?? null,
    );
    const [partnerUpdatedAt, setPartnerUpdatedAt] = useState<string | null>(
        initialPartnerLocation?.updated_at ?? null,
    );
    const [isClient, setIsClient] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);
    const [isSharing, setIsSharing] = useState(false);
    const [isStopping, setIsStopping] = useState(false);
    const [notification, setNotification] = useState<NotificationState | null>(
        null,
    );

    const notificationTimeout = useRef<number>();

    useEffect(() => {
        setIsClient(true);

        return () => {
            if (notificationTimeout.current) {
                window.clearTimeout(notificationTimeout.current);
            }
        };
    }, []);

    const showNotification = useCallback((message: string, type: NotificationType) => {
        setNotification({ message, type });
        if (notificationTimeout.current) {
            window.clearTimeout(notificationTimeout.current);
        }
        notificationTimeout.current = window.setTimeout(() => {
            setNotification(null);
        }, 4000);
    }, []);

    const partner = initialPartner;

    const fetchPartnerLocation = useCallback(
        async (silent = false) => {
            if (!partner) {
                return;
            }
            try {
                const response = await axios.get(`/api/location/${partner.id}`);
                const location: LocationPoint | null = response.data.location
                    ? {
                          latitude: response.data.location.latitude,
                          longitude: response.data.location.longitude,
                          updated_at: response.data.location.updated_at,
                      }
                    : null;
                setPartnerLocation(location);
                setPartnerUpdatedAt(location?.updated_at ?? null);
                if (!silent && location) {
                    showNotification(
                        "Lokasi pasangan diperbarui 💕",
                        "success",
                    );
                }
            } catch (error) {
                console.error("Failed to fetch partner location", error);
                if (!silent) {
                    showNotification("Gagal mengambil lokasi pasangan.", "error");
                }
            }
        },
        [partner, showNotification],
    );

    const persistLocation = useCallback(
        async (latitude: number, longitude: number, silent: boolean) => {
            try {
                const response = await axios.post("/api/location/update", {
                    latitude,
                    longitude,
                });
                const location = response.data.location as LocationPoint;
                setUserLocation(location);
                setLastUpdated(location.updated_at ?? null);
                if (!silent) {
                    showNotification("Lokasimu berhasil diperbarui 💖", "success");
                }
                await fetchPartnerLocation(true);
            } catch (error) {
                console.error("Failed to update location", error);
                if (!silent) {
                    showNotification("Gagal memperbarui lokasi.", "error");
                }
            } finally {
                if (!silent) {
                    setIsUpdating(false);
                }
            }
        },
        [fetchPartnerLocation, showNotification],
    );

    const fallbackToIp = useCallback(
        async (silent: boolean) => {
            try {
                const response = await fetch("https://ipapi.co/json/");
                const data = await response.json();
                if (data?.latitude && data?.longitude) {
                    await persistLocation(
                        Number(data.latitude),
                        Number(data.longitude),
                        silent,
                    );
                    if (!silent) {
                        showNotification(
                            "Menggunakan lokasi berdasarkan alamat IP.",
                            "warning",
                        );
                    }
                } else {
                    throw new Error("IP geolocation did not return coordinates");
                }
            } catch (error) {
                console.error("IP geolocation fallback failed", error);
                if (!silent) {
                    showNotification("Tidak dapat mengambil lokasi otomatis.", "error");
                }
                if (!silent) {
                    setIsUpdating(false);
                }
            }
        },
        [persistLocation, showNotification],
    );

    const requestLocation = useCallback(
        (options: { silent?: boolean } = {}) => {
            const silent = options.silent ?? false;
            if (!silent) {
                setIsUpdating(true);
            }

            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                    (position) => {
                        void persistLocation(
                            position.coords.latitude,
                            position.coords.longitude,
                            silent,
                        );
                    },
                    () => {
                        void fallbackToIp(silent);
                    },
                    {
                        enableHighAccuracy: true,
                        maximumAge: 10000,
                        timeout: 10000,
                    },
                );
            } else {
                void fallbackToIp(silent);
            }
        },
        [fallbackToIp, persistLocation],
    );

    useEffect(() => {
        if (!isClient) {
            return;
        }
        requestLocation({ silent: true });
        void fetchPartnerLocation(true);
        const interval = window.setInterval(() => {
            requestLocation({ silent: true });
            void fetchPartnerLocation(true);
        }, 30000);

        return () => {
            window.clearInterval(interval);
        };
    }, [fetchPartnerLocation, isClient, requestLocation]);

    const mapCenter = useMemo<LatLngExpression>(() => {
        if (userLocation) {
            return [userLocation.latitude, userLocation.longitude];
        }
        if (partnerLocation) {
            return [
                partnerLocation.latitude,
                partnerLocation.longitude,
            ];
        }
        return indonesiaCenter;
    }, [partnerLocation, userLocation]);

    const distanceKm = useMemo(() => {
        if (!userLocation || !partnerLocation) {
            return null;
        }
        return calculateDistance(
            userLocation.latitude,
            userLocation.longitude,
            partnerLocation.latitude,
            partnerLocation.longitude,
        );
    }, [partnerLocation, userLocation]);

    const formattedUserUpdated = useMemo(
        () => formatTimestamp(lastUpdated),
        [lastUpdated],
    );
    const formattedPartnerUpdated = useMemo(
        () => formatTimestamp(partnerUpdatedAt),
        [partnerUpdatedAt],
    );

    const handleShareLocation = useCallback(async () => {
        if (!userLocation) {
            showNotification(
                "Lokasi belum tersedia. Tekan update lokasi terlebih dahulu.",
                "warning",
            );
            return;
        }
        if (!partner) {
            showNotification(
                "Pasangan belum terhubung di MySpaceLove.",
                "warning",
            );
            return;
        }

        setIsSharing(true);
        const shareUrl = `${shareBaseUrl}?lat=${userLocation.latitude}&lng=${userLocation.longitude}`;

        try {
            await axios.post("/api/location/share", {
                latitude: userLocation.latitude,
                longitude: userLocation.longitude,
                url: shareUrl,
            });

            if (navigator.clipboard?.writeText) {
                await navigator.clipboard.writeText(shareUrl);
            }

            showNotification(
                "Link lokasi berhasil dikirim dan disalin! 💞",
                "success",
            );
        } catch (error) {
            console.error("Failed to share location", error);
            showNotification("Gagal membagikan lokasi.", "error");
        } finally {
            setIsSharing(false);
        }
    }, [partner, shareBaseUrl, showNotification, userLocation]);

    const handleStopSharing = useCallback(async () => {
        setIsStopping(true);
        try {
            await axios.delete("/api/location");
            setUserLocation(null);
            setLastUpdated(null);
            showNotification("Berhenti membagikan lokasi.", "warning");
        } catch (error) {
            console.error("Failed to stop sharing", error);
            showNotification("Gagal menghentikan berbagi lokasi.", "error");
        } finally {
            setIsStopping(false);
        }
    }, [showNotification]);

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col gap-1">
                    <h2 className="text-2xl font-semibold text-gray-900">
                        Berbagi Lokasi Pasangan 💞
                    </h2>
                    <p className="text-sm text-gray-500">
                        Lihat posisi kalian berdua secara real-time.
                    </p>
                </div>
            }
        >
            <Head title="Berbagi Lokasi" />

            <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                    <div className="rounded-2xl bg-white p-4 shadow-sm border border-pink-100">
                        <h3 className="font-semibold text-gray-800 mb-1">
                            Kamu di sini 💖
                        </h3>
                        <p className="text-sm text-gray-600">
                            {userLocation
                                ? `${userLocation.latitude.toFixed(5)}, ${userLocation.longitude.toFixed(5)}`
                                : "Belum ada lokasi"}
                        </p>
                        <p className="text-xs text-gray-400 mt-2">
                            {formattedUserUpdated
                                ? `Terakhir diperbarui: ${formattedUserUpdated}`
                                : "Belum pernah diperbarui"}
                        </p>
                    </div>
                    <div className="rounded-2xl bg-white p-4 shadow-sm border border-violet-100">
                        <h3 className="font-semibold text-gray-800 mb-1">
                            Pasanganmu 💕
                        </h3>
                        {partner ? (
                            <>
                                <p className="text-sm text-gray-600">
                                    {partnerLocation
                                        ? `${partnerLocation.latitude.toFixed(5)}, ${partnerLocation.longitude.toFixed(5)}`
                                        : "Belum ada lokasi"}
                                </p>
                                <p className="text-xs text-gray-400 mt-2">
                                    {formattedPartnerUpdated
                                        ? `Terakhir diperbarui: ${formattedPartnerUpdated}`
                                        : "Menunggu pasangan update lokasi"}
                                </p>
                            </>
                        ) : (
                            <p className="text-sm text-gray-600">
                                Hubungkan pasanganmu untuk mulai berbagi.
                            </p>
                        )}
                    </div>
                </div>

                {distanceKm !== null && (
                    <div className="rounded-2xl bg-gradient-to-r from-pink-500 to-purple-500 px-6 py-4 text-white shadow-lg">
                        <p className="text-sm font-semibold">
                            Jarak kalian saat ini sekitar {distanceKm.toFixed(2)} km 🌍
                        </p>
                    </div>
                )}

                <div className="bg-white rounded-3xl shadow-lg border border-pink-100 p-4">
                    <div className="h-[420px] w-full overflow-hidden rounded-2xl">
                        {isClient ? (
                            <MapContainer
                                center={mapCenter}
                                zoom={13}
                                className="h-full w-full"
                                scrollWheelZoom
                            >
                                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                                {userLocation && (
                                    <Marker
                                        position={[
                                            userLocation.latitude,
                                            userLocation.longitude,
                                        ]}
                                    >
                                        <Popup>
                                            <span className="font-semibold text-pink-500">
                                                Kamu di sini 💖
                                            </span>
                                            <br />
                                            {formattedUserUpdated
                                                ? `Terakhir update: ${formattedUserUpdated}`
                                                : "Belum ada data"}
                                        </Popup>
                                    </Marker>
                                )}
                                {partner && partnerLocation && (
                                    <Marker
                                        position={[
                                            partnerLocation.latitude,
                                            partnerLocation.longitude,
                                        ]}
                                    >
                                        <Popup>
                                            <span className="font-semibold text-purple-500">
                                                Pasanganmu 💕
                                            </span>
                                            <br />
                                            {formattedPartnerUpdated
                                                ? `Terakhir update: ${formattedPartnerUpdated}`
                                                : "Belum ada data"}
                                        </Popup>
                                    </Marker>
                                )}
                            </MapContainer>
                        ) : (
                            <div className="flex h-full items-center justify-center text-sm text-gray-500">
                                Memuat peta...
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex flex-wrap gap-3">
                    <button
                        onClick={() => requestLocation({ silent: false })}
                        disabled={isUpdating}
                        className="inline-flex items-center gap-2 rounded-full bg-pink-500 px-5 py-2 text-white shadow transition hover:bg-pink-600 disabled:cursor-not-allowed disabled:bg-pink-300"
                    >
                        {isUpdating ? "Memperbarui..." : "📍 Update Lokasi"}
                    </button>
                    <button
                        onClick={handleShareLocation}
                        disabled={isSharing || !partner}
                        className="inline-flex items-center gap-2 rounded-full bg-purple-500 px-5 py-2 text-white shadow transition hover:bg-purple-600 disabled:cursor-not-allowed disabled:bg-purple-300"
                    >
                        {isSharing ? "Mengirim..." : "🔗 Share Lokasi"}
                    </button>
                    <button
                        onClick={handleStopSharing}
                        disabled={isStopping}
                        className="inline-flex items-center gap-2 rounded-full bg-gray-200 px-5 py-2 text-gray-700 shadow transition hover:bg-gray-300 disabled:cursor-not-allowed disabled:opacity-70"
                    >
                        {isStopping ? "Memproses..." : "⛔ Stop Sharing"}
                    </button>
                </div>

                {notification && (
                    <div
                        className={`fixed bottom-6 right-6 z-50 rounded-2xl px-4 py-3 text-sm shadow-lg transition ${
                            notification.type === "success"
                                ? "bg-white border border-green-200 text-green-600"
                                : notification.type === "error"
                                ? "bg-white border border-red-200 text-red-600"
                                : "bg-white border border-yellow-200 text-yellow-600"
                        }`}
                    >
                        {notification.message}
                    </div>
                )}
            </div>
        </AuthenticatedLayout>
    );
}
