import { Head } from "@inertiajs/react";
import L, { type LatLngExpression, type DivIcon } from "leaflet";
import "leaflet/dist/leaflet.css";
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import { useEffect, useMemo, useState } from "react";

type Props = {
    latitude?: string | number | null;
    longitude?: string | number | null;
};

const createMarkerIcon = (): DivIcon =>
    L.divIcon({
        className: "custom-leaflet-marker-share",
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
                    width: 46px;
                    height: 46px;
                    border-radius: 9999px;
                    background: #ffffff;
                    border: 4px solid #ec4899;
                    box-shadow: 0 12px 28px rgba(15, 23, 42, 0.18);
                ">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        width="22"
                        height="22"
                        fill="none"
                        stroke="#db2777"
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
                    background: #ec4899;
                    opacity: 0.85;
                    box-shadow: 0 3px 10px rgba(15, 23, 42, 0.25);
                "></span>
            </div>
        `,
        iconSize: [46, 60],
        iconAnchor: [23, 56],
        popupAnchor: [0, -50],
    });

export default function Share({ latitude, longitude }: Props) {
    const [isClient, setIsClient] = useState(false);
    const [markerIcon, setMarkerIcon] = useState<DivIcon | null>(null);

    useEffect(() => {
        setIsClient(true);
        setMarkerIcon(createMarkerIcon());
    }, []);

    const parsedLatitude = useMemo(() => {
        if (latitude === null || latitude === undefined) {
            return null;
        }
        const value = Number(latitude);
        return Number.isFinite(value) ? value : null;
    }, [latitude]);

    const parsedLongitude = useMemo(() => {
        if (longitude === null || longitude === undefined) {
            return null;
        }
        const value = Number(longitude);
        return Number.isFinite(value) ? value : null;
    }, [longitude]);

    const hasValidLocation =
        parsedLatitude !== null && parsedLongitude !== null;

    const mapCenter = useMemo<LatLngExpression>(() => {
        if (!hasValidLocation) {
            return [-2.5489, 118.0149];
        }
        return [parsedLatitude!, parsedLongitude!];
    }, [hasValidLocation, parsedLatitude, parsedLongitude]);

    return (
        <div className="min-h-screen bg-gradient-to-br from-pink-100 via-white to-purple-100 flex flex-col items-center justify-center px-4 py-12">
            <Head title="Lokasi Cinta" />
            <div className="w-full max-w-3xl rounded-3xl bg-white/80 backdrop-blur p-8 shadow-xl border border-pink-100">
                <div className="text-center mb-6">
                    <h1 className="text-3xl font-bold text-pink-600">
                        Lokasi Spesial ??
                    </h1>
                    <p className="mt-2 text-sm text-gray-500">
                        {hasValidLocation
                            ? "Kami menandai titik cintamu di peta."
                            : "Lokasi tidak ditemukan. Pastikan link yang kamu buka lengkap."}
                    </p>
                </div>

                <div className="rounded-2xl border border-pink-100 bg-white shadow-inner">
                    <div className="h-[420px] overflow-hidden rounded-2xl">
                        {isClient ? (
                            hasValidLocation ? (
                                <MapContainer
                                    center={mapCenter}
                                    zoom={14}
                                    className="h-full w-full"
                                    scrollWheelZoom
                                >
                                    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                                    <Marker
                                        position={[
                                            parsedLatitude!,
                                            parsedLongitude!,
                                        ]}
                                        icon={markerIcon ?? undefined}
                                    >
                                        <Popup
                                            autoClose={false}
                                            closeButton={false}
                                            closeOnClick={false}
                                            autoPan={false}
                                        >
                                            <span className="font-semibold text-pink-500">
                                                Di sinilah cintamu berada !!
                                            </span>
                                        </Popup>
                                    </Marker>
                                </MapContainer>
                            ) : (
                                <div className="flex h-full items-center justify-center text-sm text-gray-500">
                                    Lokasi tidak valid.
                                </div>
                            )
                        ) : (
                            <div className="flex h-full items-center justify-center text-sm text-gray-500">
                                Memuat peta...
                            </div>
                        )}
                    </div>
                </div>

                {hasValidLocation && (
                    <div className="mt-6 rounded-2xl bg-pink-50 px-6 py-4 text-center text-sm text-pink-600">
                        <p>
                            Koordinat dibagikan untukmu:{" "}
                            {parsedLatitude?.toFixed(5)},{" "}
                            {parsedLongitude?.toFixed(5)}
                        </p>
                        <p className="mt-1 text-xs text-pink-400">
                            Link ini dapat diakses tanpa login selama kamu
                            membagikannya.
                        </p>
                    </div>
                )}

                {!hasValidLocation && (
                    <div className="mt-6 rounded-2xl bg-yellow-50 px-6 py-4 text-center text-sm text-yellow-700">
                        <p>
                            Tidak ada titik yang dapat ditampilkan. Hubungi
                            pasanganmu untuk meminta link terbaru.
                        </p>
                    </div>
                )}
            </div>

            <p className="mt-8 text-xs text-gray-400">
                Dibuat dengan penuh cinta oleh MySpaceLove
            </p>
        </div>
    );
}
