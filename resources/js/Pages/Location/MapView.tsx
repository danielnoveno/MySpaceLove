import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head } from "@inertiajs/react";
import axios from "axios";
import L, {
    type LatLngExpression,
    type Marker as LeafletMarker,
} from "leaflet";
import "leaflet/dist/leaflet.css";
import {
    MapContainer,
    Marker,
    Polyline,
    Popup,
    Tooltip,
    TileLayer,
    useMap,
} from "react-leaflet";
import {
    FormEvent,
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react";

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
    space: {
        id: number;
        slug: string;
        title: string;
    };
};

const indonesiaCenter: LatLngExpression = [-2.5489, 118.0149];

const createMarkerIcon = ({
    primaryColor,
    iconColor,
}: {
    primaryColor: string;
    iconColor: string;
}) =>
    L.divIcon({
        className: "custom-leaflet-marker",
        html: `
            <div style="
                display: flex;
                flex-direction: column;
                align-items: center;
                gap: 6px;
            ">
                <span style="
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    width: 44px;
                    height: 44px;
                    border-radius: 9999px;
                    background: #ffffff;
                    border: 4px solid ${primaryColor};
                    box-shadow: 0 12px 28px rgba(15, 23, 42, 0.18);
                ">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        width="22"
                        height="22"
                        fill="none"
                        stroke="${iconColor}"
                        stroke-width="1.8"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                    >
                        <path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"/>
                        <circle cx="12" cy="10" r="3"/>
                    </svg>
                </span>
                <span style="
                    width: 10px;
                    height: 10px;
                    border-radius: 9999px;
                    background: ${primaryColor};
                    opacity: 0.85;
                    box-shadow: 0 3px 10px rgba(15, 23, 42, 0.25);
                "></span>
            </div>
        `,
        iconSize: [46, 60],
        iconAnchor: [23, 56],
        tooltipAnchor: [0, -48],
        popupAnchor: [0, -48],
    });

const userMarkerIcon = createMarkerIcon({
    primaryColor: "#ec4899",
    iconColor: "#db2777",
});

const partnerMarkerIcon = createMarkerIcon({
    primaryColor: "#8b5cf6",
    iconColor: "#7c3aed",
});

function MapCenterUpdater({ center }: { center: LatLngExpression }) {
    const map = useMap();

    useEffect(() => {
        map.setView(center);
    }, [center, map]);

    return null;
}

function calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
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
    space,
}: Props) {
    const [userLocation, setUserLocation] = useState<LocationPoint | null>(
        initialUserLocation
    );
    const [partnerLocation, setPartnerLocation] =
        useState<LocationPoint | null>(initialPartnerLocation);
    const [lastUpdated, setLastUpdated] = useState<string | null>(
        initialUserLocation?.updated_at ?? null
    );
    const [partnerUpdatedAt, setPartnerUpdatedAt] = useState<string | null>(
        initialPartnerLocation?.updated_at ?? null
    );
    const [isClient, setIsClient] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);
    const [isSharing, setIsSharing] = useState(false);
    const [isStopping, setIsStopping] = useState(false);
    const [notification, setNotification] = useState<NotificationState | null>(
        null
    );
    const [partner, setPartner] = useState<Partner | null>(initialPartner);
    const [isConnectingPartner, setIsConnectingPartner] = useState(false);
    const [showPartnerForm, setShowPartnerForm] = useState(false);
    const [partnerNameInput, setPartnerNameInput] = useState("");
    const [partnerEmailInput, setPartnerEmailInput] = useState("");
    const [generatedPassword, setGeneratedPassword] = useState<string | null>(
        null
    );
    const [routeCoordinates, setRouteCoordinates] = useState<
        LatLngExpression[] | null
    >(null);
    const [isRouteLoading, setIsRouteLoading] = useState(false);
    const [routeFetchError, setRouteFetchError] = useState<string | null>(null);
    const [routeDistanceKm, setRouteDistanceKm] = useState<number | null>(null);

    const notificationTimeout = useRef<number>();
    const userMarkerRef = useRef<LeafletMarker | null>(null);
    const partnerMarkerRef = useRef<LeafletMarker | null>(null);

    useEffect(() => {
        setIsClient(true);

        return () => {
            if (notificationTimeout.current) {
                window.clearTimeout(notificationTimeout.current);
            }
        };
    }, []);

    useEffect(() => {
        if (isClient && userLocation && userMarkerRef.current) {
            userMarkerRef.current.openPopup();
        }
    }, [isClient, userLocation]);

    useEffect(() => {
        if (
            isClient &&
            partner &&
            partnerLocation &&
            partnerMarkerRef.current
        ) {
            partnerMarkerRef.current.openPopup();
        }
    }, [isClient, partner, partnerLocation]);

    const showNotification = useCallback(
        (message: string, type: NotificationType) => {
            setNotification({ message, type });
            if (notificationTimeout.current) {
                window.clearTimeout(notificationTimeout.current);
            }
            notificationTimeout.current = window.setTimeout(() => {
                setNotification(null);
            }, 4000);
        },
        []
    );

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
                        "success"
                    );
                }
            } catch (error) {
                console.error("Failed to fetch partner location", error);
                if (!silent) {
                    showNotification(
                        "Gagal mengambil lokasi pasangan.",
                        "error"
                    );
                }
            }
        },
        [partner, showNotification]
    );

    const handleConnectPartner = useCallback(
        async (event: FormEvent<HTMLFormElement>) => {
            event.preventDefault();
            setGeneratedPassword(null);
            setIsConnectingPartner(true);

            try {
                const partnerName = partnerNameInput.trim();
                const partnerEmail = partnerEmailInput.trim();

                if (!partnerName || !partnerEmail) {
                    showNotification(
                        "Nama dan email pasangan wajib diisi.",
                        "error"
                    );
                    return;
                }

                const response = await axios.post(
                    `/api/spaces/${space.slug}/connect-partner`,
                    {
                        partner_name: partnerName,
                        partner_email: partnerEmail,
                    }
                );

                const responsePartner = response.data.partner as Partner;
                setPartner(responsePartner);
                setGeneratedPassword(response.data.temporary_password ?? null);
                showNotification("Pasangan berhasil terhubung ??", "success");
                setShowPartnerForm(false);
                setPartnerNameInput("");
                setPartnerEmailInput("");
                await fetchPartnerLocation(true);
            } catch (error) {
                console.error("Failed to connect partner", error);
                let message = "Gagal menghubungkan pasangan.";
                if (axios.isAxiosError(error)) {
                    const errorData = error.response?.data as {
                        message?: unknown;
                        errors?: Record<string, string[]>;
                    };

                    const firstValidationError = errorData?.errors
                        ? (Object.values(errorData.errors)
                              .flat()
                              .find((item) => typeof item === "string") as
                              | string
                              | undefined)
                        : undefined;

                    if (firstValidationError) {
                        message = firstValidationError;
                    } else if (
                        typeof errorData?.message === "string" &&
                        errorData.message.trim() !== ""
                    ) {
                        message = errorData.message;
                    }
                }

                showNotification(message, "error");
            } finally {
                setIsConnectingPartner(false);
            }
        },
        [
            fetchPartnerLocation,
            partnerEmailInput,
            partnerNameInput,
            showNotification,
            space.slug,
        ]
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
                    showNotification(
                        "Lokasimu berhasil diperbarui 💖",
                        "success"
                    );
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
        [fetchPartnerLocation, showNotification]
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
                        silent
                    );
                    if (!silent) {
                        showNotification(
                            "Menggunakan lokasi berdasarkan alamat IP.",
                            "warning"
                        );
                    }
                } else {
                    throw new Error(
                        "IP geolocation did not return coordinates"
                    );
                }
            } catch (error) {
                console.error("IP geolocation fallback failed", error);
                if (!silent) {
                    showNotification(
                        "Tidak dapat mengambil lokasi otomatis.",
                        "error"
                    );
                }
                if (!silent) {
                    setIsUpdating(false);
                }
            }
        },
        [persistLocation, showNotification]
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
                            silent
                        );
                    },
                    () => {
                        void fallbackToIp(silent);
                    },
                    {
                        enableHighAccuracy: true,
                        maximumAge: 10000,
                        timeout: 10000,
                    }
                );
            } else {
                void fallbackToIp(silent);
            }
        },
        [fallbackToIp, persistLocation]
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
            return [partnerLocation.latitude, partnerLocation.longitude];
        }
        return indonesiaCenter;
    }, [partnerLocation, userLocation]);

    const straightDistanceKm = useMemo(() => {
        if (!userLocation || !partnerLocation) {
            return null;
        }
        return calculateDistance(
            userLocation.latitude,
            userLocation.longitude,
            partnerLocation.latitude,
            partnerLocation.longitude
        );
    }, [partnerLocation, userLocation]);

    const displayDistanceKm = useMemo(() => {
        if (routeDistanceKm !== null) {
            return routeDistanceKm;
        }
        return straightDistanceKm;
    }, [routeDistanceKm, straightDistanceKm]);

    const formattedUserUpdated = useMemo(
        () => formatTimestamp(lastUpdated),
        [lastUpdated]
    );
    const formattedPartnerUpdated = useMemo(
        () => formatTimestamp(partnerUpdatedAt),
        [partnerUpdatedAt]
    );

    const fetchRouteBetweenLocations = useCallback(
        async (origin: LocationPoint, destination: LocationPoint) => {
            setIsRouteLoading(true);
            setRouteFetchError(null);
            try {
                const response = await fetch(
                    `https://router.project-osrm.org/route/v1/driving/${origin.longitude},${origin.latitude};${destination.longitude},${destination.latitude}?overview=full&geometries=geojson`
                );

                if (!response.ok) {
                    throw new Error(
                        `OSRM request failed with status ${response.status}`
                    );
                }

                const data: {
                    routes?: Array<{
                        geometry?: { coordinates?: Array<[number, number]> };
                        distance?: number;
                    }>;
                } = await response.json();

                const firstRoute = data.routes?.[0];
                const coordinates = firstRoute?.geometry?.coordinates;

                if (
                    coordinates &&
                    Array.isArray(coordinates) &&
                    coordinates.length > 0
                ) {
                    const convertedCoordinates = coordinates.map(
                        ([longitude, latitude]) =>
                            [latitude, longitude] as LatLngExpression
                    );
                    setRouteCoordinates(convertedCoordinates);
                    if (typeof firstRoute?.distance === "number") {
                        setRouteDistanceKm(firstRoute.distance / 1000);
                    } else {
                        setRouteDistanceKm(
                            calculateDistance(
                                origin.latitude,
                                origin.longitude,
                                destination.latitude,
                                destination.longitude
                            )
                        );
                    }
                } else {
                    setRouteCoordinates([
                        [origin.latitude, origin.longitude],
                        [destination.latitude, destination.longitude],
                    ]);
                    setRouteDistanceKm(
                        calculateDistance(
                            origin.latitude,
                            origin.longitude,
                            destination.latitude,
                            destination.longitude
                        )
                    );
                    setRouteFetchError(
                        "Rute jalan tidak tersedia, menampilkan garis lurus."
                    );
                }
            } catch (error) {
                console.error("Failed to fetch route", error);
                setRouteCoordinates([
                    [origin.latitude, origin.longitude],
                    [destination.latitude, destination.longitude],
                ]);
                setRouteDistanceKm(
                    calculateDistance(
                        origin.latitude,
                        origin.longitude,
                        destination.latitude,
                        destination.longitude
                    )
                );
                setRouteFetchError(
                    "Gagal memuat rute jalan, menampilkan garis lurus."
                );
            } finally {
                setIsRouteLoading(false);
            }
        },
        []
    );

    useEffect(() => {
        if (!isClient) {
            return;
        }

        if (!userLocation || !partnerLocation) {
            setRouteCoordinates(null);
            setRouteDistanceKm(null);
            setRouteFetchError(null);
            return;
        }

        void fetchRouteBetweenLocations(userLocation, partnerLocation);
    }, [fetchRouteBetweenLocations, isClient, partnerLocation, userLocation]);

    const handleShareLocation = useCallback(async () => {
        if (!userLocation) {
            showNotification(
                "Lokasi belum tersedia. Tekan update lokasi terlebih dahulu.",
                "warning"
            );
            return;
        }
        if (!partner) {
            showNotification(
                "Pasangan belum terhubung di MySpaceLove.",
                "warning"
            );
            return;
        }

        setIsSharing(true);
        const shareUrl = `${shareBaseUrl}?lat=${userLocation.latitude}&lng=${userLocation.longitude}`;

        try {
            await axios.post(`/api/spaces/${space.slug}/location/share`, {
                latitude: userLocation.latitude,
                longitude: userLocation.longitude,
                url: shareUrl,
            });

            if (navigator.clipboard?.writeText) {
                await navigator.clipboard.writeText(shareUrl);
            }

            showNotification(
                "Link lokasi berhasil dikirim dan disalin! 💞",
                "success"
            );
        } catch (error) {
            console.error("Failed to share location", error);
            showNotification("Gagal membagikan lokasi.", "error");
        } finally {
            setIsSharing(false);
        }
    }, [partner, shareBaseUrl, showNotification, space.slug, userLocation]);

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
                                ? `${userLocation.latitude.toFixed(
                                      5
                                  )}, ${userLocation.longitude.toFixed(5)}`
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
                                        ? `${partnerLocation.latitude.toFixed(
                                              5
                                          )}, ${partnerLocation.longitude.toFixed(
                                              5
                                          )}`
                                        : "Belum ada lokasi"}
                                </p>
                                <p className="text-xs text-gray-400 mt-2">
                                    {formattedPartnerUpdated
                                        ? `Terakhir diperbarui: ${formattedPartnerUpdated}`
                                        : "Menunggu pasangan update lokasi"}
                                </p>
                            </>
                        ) : (
                            <div className="space-y-3">
                                <p className="text-sm text-gray-600">
                                    Hubungkan pasanganmu untuk mulai berbagi.
                                </p>
                                {showPartnerForm ? (
                                    <form
                                        className="space-y-3 rounded-xl border border-violet-100 bg-violet-50 p-3"
                                        onSubmit={handleConnectPartner}
                                    >
                                        <div className="space-y-1">
                                            <label className="text-xs font-semibold uppercase tracking-wide text-gray-600">
                                                Nama Pasangan
                                            </label>
                                            <input
                                                value={partnerNameInput}
                                                onChange={(event) =>
                                                    setPartnerNameInput(
                                                        event.target.value
                                                    )
                                                }
                                                required
                                                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-purple-500 focus:ring-purple-500"
                                                placeholder="Misal: Hana"
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-xs font-semibold uppercase tracking-wide text-gray-600">
                                                Email Pasangan
                                            </label>
                                            <input
                                                type="email"
                                                value={partnerEmailInput}
                                                onChange={(event) =>
                                                    setPartnerEmailInput(
                                                        event.target.value
                                                    )
                                                }
                                                required
                                                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-purple-500 focus:ring-purple-500"
                                                placeholder="pasangan@email.com"
                                            />
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <button
                                                type="submit"
                                                disabled={isConnectingPartner}
                                                className="inline-flex items-center justify-center rounded-full bg-purple-500 px-4 py-2 text-sm font-medium text-white shadow transition hover:bg-purple-600 disabled:cursor-not-allowed disabled:bg-purple-300"
                                            >
                                                {isConnectingPartner
                                                    ? "Menghubungkan..."
                                                    : "Simpan Pasangan"}
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setShowPartnerForm(false);
                                                    setPartnerNameInput("");
                                                    setPartnerEmailInput("");
                                                }}
                                                className="inline-flex items-center justify-center rounded-full bg-white px-4 py-2 text-sm font-medium text-gray-600 shadow-sm transition hover:bg-gray-50"
                                            >
                                                Batal
                                            </button>
                                        </div>
                                    </form>
                                ) : (
                                    <button
                                        type="button"
                                        onClick={() => setShowPartnerForm(true)}
                                        className="inline-flex items-center gap-2 rounded-full bg-purple-100 px-4 py-2 text-sm font-medium text-purple-600 transition hover:bg-purple-200"
                                    >
                                        Hubungkan Pasangan
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {generatedPassword && partner && (
                    <div className="rounded-2xl border border-yellow-200 bg-yellow-50 px-4 py-3 text-sm text-yellow-800 shadow-sm">
                        <p className="font-semibold">
                            Akun pasangan berhasil dibuat.
                        </p>
                        <p className="mt-1">
                            Bagikan kredensial ini ke pasanganmu untuk login:
                            <br />
                            <span className="font-semibold">Email:</span>{" "}
                            {partner.email}{" "}
                            <span className="font-semibold">Password:</span>{" "}
                            <span className="font-mono tracking-wide">
                                {generatedPassword}
                            </span>
                        </p>
                    </div>
                )}

                {displayDistanceKm !== null && (
                    <div className="rounded-2xl bg-gradient-to-r from-pink-500 to-purple-500 px-6 py-4 text-white shadow-lg">
                        <p className="text-sm font-semibold">
                            {routeDistanceKm !== null
                                ? `Jarak estimasi via jalan sekitar ${displayDistanceKm.toFixed(
                                      2
                                  )} km 🚗`
                                : `Jarak garis lurus kalian sekitar ${displayDistanceKm.toFixed(
                                      2
                                  )} km 🌍`}
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
                                <MapCenterUpdater center={mapCenter} />
                                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                                {userLocation && (
                                    <Marker
                                        ref={userMarkerRef}
                                        position={[
                                            userLocation.latitude,
                                            userLocation.longitude,
                                        ]}
                                        icon={userMarkerIcon}
                                    >
                                        <Popup
                                            autoClose={false}
                                            closeButton={false}
                                            closeOnClick={false}
                                            autoPan={false}
                                        >
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
                                        ref={partnerMarkerRef}
                                        position={[
                                            partnerLocation.latitude,
                                            partnerLocation.longitude,
                                        ]}
                                        icon={partnerMarkerIcon}
                                    >
                                        <Popup
                                            autoClose={false}
                                            closeButton={false}
                                            closeOnClick={false}
                                            autoPan={false}
                                        >
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
                                {routeCoordinates && (
                                    <Polyline
                                        positions={routeCoordinates}
                                        pathOptions={{
                                            color: "#ec4899",
                                            weight: 5,
                                            opacity: 0.75,
                                            lineCap: "round",
                                            lineJoin: "round",
                                        }}
                                    />
                                )}
                            </MapContainer>
                        ) : (
                            <div className="flex h-full items-center justify-center text-sm text-gray-500">
                                Memuat peta...
                            </div>
                        )}
                    </div>
                    {(isRouteLoading || routeFetchError) && (
                        <div className="mt-3 px-1 space-y-1">
                            {isRouteLoading && (
                                <p className="text-xs text-gray-500">
                                    Menentukan jalur terbaik...
                                </p>
                            )}
                            {routeFetchError && (
                                <p className="text-xs text-yellow-600">
                                    {routeFetchError}
                                </p>
                            )}
                        </div>
                    )}
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
                        disabled={isSharing}
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
