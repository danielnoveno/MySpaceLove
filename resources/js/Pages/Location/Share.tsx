import { Head } from "@inertiajs/react";
import { useEffect, useMemo, useState } from "react";
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

type SharePageProps = {
    latitude?: string | number | null;
    longitude?: string | number | null;
};

const isBrowser = typeof window !== "undefined";

if (isBrowser) {
    L.Icon.Default.mergeOptions({
        iconRetinaUrl: markerIcon2x,
        iconUrl: markerIcon,
        shadowUrl: markerShadow,
    });
}

const Share = ({ latitude, longitude }: SharePageProps) => {
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
    }, []);

    const parseCoordinate = (value: string | number | null | undefined) => {
        if (value === null || value === undefined) {
            return null;
        }

        const numericValue =
            typeof value === "number" ? value : Number.parseFloat(value);

        return Number.isFinite(numericValue) ? numericValue : null;
    };

    const parsedLatitude = useMemo(() => {
        const directValue = parseCoordinate(latitude);
        if (directValue !== null) {
            return directValue;
        }

        if (isBrowser) {
            const fromQuery = new URLSearchParams(window.location.search).get(
                "lat",
            );

            return parseCoordinate(fromQuery);
        }

        return null;
    }, [latitude]);

    const parsedLongitude = useMemo(() => {
        const directValue = parseCoordinate(longitude);
        if (directValue !== null) {
            return directValue;
        }

        if (isBrowser) {
            const fromQuery = new URLSearchParams(window.location.search).get(
                "lng",
            );

            return parseCoordinate(fromQuery);
        }

        return null;
    }, [longitude]);

    const hasCoordinates =
        parsedLatitude !== null && parsedLongitude !== null;

    const center = hasCoordinates
        ? ([parsedLatitude, parsedLongitude] as [number, number])
        : ([-2.5489, 118.0149] as [number, number]);

    return (
        <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-indigo-50">
            <Head title="Share Location" />

            <div className="mx-auto flex max-w-4xl flex-col items-center gap-8 px-4 py-12 text-center">
                <div className="space-y-3">
                    <h1 className="text-3xl font-semibold text-rose-600">
                        Lokasi Spesial Dikirim Untukmu 💌
                    </h1>
                    <p className="text-sm text-gray-600">
                        {hasCoordinates
                            ? "Buka peta di bawah ini untuk melihat posisi terbaru pasanganmu."
                            : "Maaf, link ini tidak memiliki koordinat yang valid."}
                    </p>
                </div>

                <div className="w-full overflow-hidden rounded-3xl bg-white shadow-2xl">
                    {isClient && hasCoordinates ? (
                        <MapContainer
                            center={center}
                            zoom={15}
                            scrollWheelZoom
                            className="h-[520px] w-full"
                        >
                            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                            <Marker position={center}>
                                <Popup>
                                    <div className="space-y-1 text-sm">
                                        <p className="font-semibold text-rose-500">
                                            Pasanganmu ada di sini 💕
                                        </p>
                                        <p className="text-gray-600">
                                            Koordinat: {parsedLatitude?.toFixed(4)}°, {" "}
                                            {parsedLongitude?.toFixed(4)}°
                                        </p>
                                    </div>
                                </Popup>
                            </Marker>
                        </MapContainer>
                    ) : (
                        <div className="flex h-[520px] items-center justify-center bg-gradient-to-br from-rose-100 to-indigo-100">
                            <p className="max-w-sm text-base text-gray-600">
                                {hasCoordinates
                                    ? "Memuat peta..."
                                    : "Koordinat tidak ditemukan. Pastikan link yang dikirim lengkap."}
                            </p>
                        </div>
                    )}
                </div>

                <p className="text-xs text-gray-400">
                    Dibagikan otomatis melalui MySpaceLove — tetap terhubung walau berjauhan 💞
                </p>
            </div>
        </div>
    );
};

export default Share;
