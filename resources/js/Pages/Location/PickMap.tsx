import L, { LatLngExpression } from "leaflet";
import "leaflet/dist/leaflet.css";
import { MapContainer, Marker, TileLayer, useMapEvents } from "react-leaflet";

type Props = {
    latitude?: number | null;
    longitude?: number | null;
    onPick: (latitude: number, longitude: number) => void;
};

const markerIcon = L.divIcon({
    className: "shared-location-picker-marker",
    html: '<div style="width:34px;height:34px;border-radius:9999px;background:#ec4899;border:4px solid white;box-shadow:0 10px 25px rgba(15,23,42,.25)"></div>',
    iconSize: [34, 34],
    iconAnchor: [17, 17],
});

function Picker({ onPick }: { onPick: Props["onPick"] }) {
    useMapEvents({
        click(event) {
            onPick(event.latlng.lat, event.latlng.lng);
        },
    });

    return null;
}

export default function PickMap({ latitude, longitude, onPick }: Props) {
    const hasPoint = typeof latitude === "number" && typeof longitude === "number";
    const center: LatLngExpression = hasPoint ? [latitude, longitude] : [-2.5489, 118.0149];

    return (
        <div className="overflow-hidden rounded-3xl border border-pink-100 shadow-sm">
            <MapContainer center={center} zoom={hasPoint ? 14 : 5} className="h-80 w-full">
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <Picker onPick={onPick} />
                {hasPoint && <Marker position={[latitude, longitude]} icon={markerIcon} />}
            </MapContainer>
        </div>
    );
}
