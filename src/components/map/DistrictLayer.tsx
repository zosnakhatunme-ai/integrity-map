import { useEffect } from "react";
import { useMap } from "react-leaflet";
import L from "leaflet";
import type { Report } from "@/lib/types";

// Major Bangladesh districts with approximate center coordinates
const BD_DISTRICTS: { name: string; lat: number; lng: number }[] = [
  { name: "ঢাকা", lat: 23.8103, lng: 90.4125 },
  { name: "চট্টগ্রাম", lat: 22.3569, lng: 91.7832 },
  { name: "রাজশাহী", lat: 24.3636, lng: 88.6241 },
  { name: "খুলনা", lat: 22.8456, lng: 89.5403 },
  { name: "বরিশাল", lat: 22.701, lng: 90.3535 },
  { name: "সিলেট", lat: 24.8949, lng: 91.8687 },
  { name: "রংপুর", lat: 25.7439, lng: 89.2752 },
  { name: "ময়মনসিংহ", lat: 24.7471, lng: 90.4203 },
  { name: "কুমিল্লা", lat: 23.4607, lng: 91.1809 },
  { name: "গাজীপুর", lat: 24.0023, lng: 90.4264 },
  { name: "নারায়ণগঞ্জ", lat: 23.6238, lng: 90.5000 },
  { name: "টাঙ্গাইল", lat: 24.2513, lng: 89.9164 },
  { name: "ফরিদপুর", lat: 23.6070, lng: 89.8429 },
  { name: "যশোর", lat: 23.1667, lng: 89.2167 },
  { name: "কক্সবাজার", lat: 21.4272, lng: 92.0058 },
  { name: "বগুড়া", lat: 24.8465, lng: 89.3773 },
  { name: "পাবনা", lat: 24.0064, lng: 89.2372 },
  { name: "দিনাজপুর", lat: 25.6279, lng: 88.6332 },
  { name: "নোয়াখালী", lat: 22.8696, lng: 91.0996 },
  { name: "কিশোরগঞ্জ", lat: 24.4449, lng: 90.7766 },
];

interface DistrictLayerProps {
  reports: Report[];
  enabled: boolean;
}

function getDistrictForReport(report: Report): string | null {
  let closest: string | null = null;
  let minDist = Infinity;
  for (const d of BD_DISTRICTS) {
    const dist = Math.sqrt(
      Math.pow(report.latitude - d.lat, 2) + Math.pow(report.longitude - d.lng, 2)
    );
    if (dist < minDist && dist < 0.5) {
      minDist = dist;
      closest = d.name;
    }
  }
  return closest;
}

export default function DistrictLayer({ reports, enabled }: DistrictLayerProps) {
  const map = useMap();

  useEffect(() => {
    if (!enabled) return;

    const districtCounts: Record<string, number> = {};
    reports.forEach((r) => {
      const district = getDistrictForReport(r);
      if (district) {
        districtCounts[district] = (districtCounts[district] || 0) + 1;
      }
    });

    const markers: L.CircleMarker[] = [];

    BD_DISTRICTS.forEach((d) => {
      const count = districtCounts[d.name] || 0;
      if (count === 0) return;

      const radius = Math.min(12 + count * 3, 35);
      const marker = L.circleMarker([d.lat, d.lng], {
        radius,
        fillColor: count >= 10 ? "#DC3545" : count >= 5 ? "#FF8C00" : "#007BFF",
        fillOpacity: 0.6,
        color: "white",
        weight: 2,
      }).addTo(map);

      marker.bindTooltip(
        `<div style="text-align:center;font-family:inherit;padding:2px 4px;">
          <b style="font-size:13px;">${d.name}</b><br/>
          <span style="font-size:18px;font-weight:700;color:#DC3545;">${count}</span>
          <span style="font-size:10px;color:#888;">টি রিপোর্ট</span>
        </div>`,
        { permanent: false, direction: "top", className: "district-tooltip" }
      );

      markers.push(marker);
    });

    return () => {
      markers.forEach((m) => m.remove());
    };
  }, [map, reports, enabled]);

  return null;
}
