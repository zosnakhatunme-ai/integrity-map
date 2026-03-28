import { useEffect } from "react";
import { useMap } from "react-leaflet";
import L from "leaflet";

interface PulseMarkerProps {
  position: [number, number];
  color: string;
}

export default function PulseMarker({ position, color }: PulseMarkerProps) {
  const map = useMap();

  useEffect(() => {
    const pulseIcon = L.divIcon({
      className: "",
      html: `<div class="pulse-marker-ring" style="--pulse-color: ${color};">
        <div class="pulse-marker-ring-inner"></div>
        <div class="pulse-marker-ring-outer"></div>
        <div class="pulse-marker-ring-outer2"></div>
      </div>`,
      iconSize: [24, 24],
      iconAnchor: [12, 12],
    });

    const marker = L.marker(position, { icon: pulseIcon, interactive: false });
    marker.addTo(map);

    return () => {
      map.removeLayer(marker);
    };
  }, [map, position, color]);

  return null;
}
