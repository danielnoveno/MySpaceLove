import { Head } from "@inertiajs/react";
import L, { type LatLngExpression } from "leaflet";
import "leaflet/dist/leaflet.css";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import { useEffect, useMemo, useState } from "react";

type Props = {
    latitude?: string | number | null;
    longitude?: string | number | null;
};

L.Icon.Default.mergeOptions({
    iconRetinaUrl: markerIcon2x,
    iconUrl: markerIcon,
    shadowUrl: markerShadow,
});

export default function Share({ latitude, longitude }: Props) {
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
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
                        Lokasi Spesial 💞
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
                                    <Marker position={[parsedLatitude!, parsedLongitude!]}>
                                        <Popup>
                                            <span className="font-semibold text-pink-500">
                                                Di sinilah cintamu berada 💖
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
                            Koordinat dibagikan untukmu: {parsedLatitude?.toFixed(5)},
                            {" "}
                            {parsedLongitude?.toFixed(5)}
                        </p>
                        <p className="mt-1 text-xs text-pink-400">
                            Link ini dapat diakses tanpa login selama kamu membagikannya.
                        </p>
                    </div>
                )}

                {!hasValidLocation && (
                    <div className="mt-6 rounded-2xl bg-yellow-50 px-6 py-4 text-center text-sm text-yellow-700">
                        <p>
                            Tidak ada titik yang dapat ditampilkan. Hubungi pasanganmu untuk
                            meminta link terbaru.
                        </p>
                    </div>
                )}
            </div>

            <p className="mt-8 text-xs text-gray-400">
                Dibuat dengan penuh cinta oleh MySpaceLove 💘
            </p>
        </div>
    );
}
