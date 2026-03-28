import { useEffect, useState, useRef, useMemo } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents, CircleMarker } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Plus, Navigation, Filter, X, FileText, CheckCircle, AlertTriangle, Info, MapPin, TrendingUp, Flame } from "lucide-react";
import { fetchReports } from "@/lib/reports";
import { BD_CENTER, BD_ZOOM, CORRUPTION_TYPES } from "@/lib/constants";
import { getDominantVote, formatDate, getCorruptionIcon, getAnonymousName } from "@/lib/helpers";
import { AnonAvatar } from "@/components/AnonAvatar";
import type { Report } from "@/lib/types";
import { useIsMobile } from "@/hooks/use-mobile";
import HeatmapLayer from "@/components/map/HeatmapLayer";
import PulseMarker from "@/components/map/PulseMarker";

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

function createDropPinIcon(dominant: string, icon: string) {
  const color = dominant === "truth" ? "#28A745" : dominant === "fake" ? "#DC3545" : dominant === "needProve" ? "#007BFF" : "#FF3B30";
  return L.divIcon({
    className: "",
    html: `<div style="position:relative;width:36px;height:48px;">
      <svg width="36" height="48" viewBox="0 0 36 48" fill="none">
        <path d="M18 0C8.06 0 0 8.06 0 18c0 13.5 18 30 18 30s18-16.5 18-30C36 8.06 27.94 0 18 0z" fill="${color}"/>
        <circle cx="18" cy="18" r="12" fill="white" fill-opacity="0.95"/>
      </svg>
      <span style="position:absolute;top:7px;left:50%;transform:translateX(-50%);font-size:16px;line-height:1;">${icon}</span>
    </div>`,
    iconSize: [36, 48],
    iconAnchor: [18, 48],
    popupAnchor: [0, -48],
  });
}

function MapClickHandler({ onMapClick }: { onMapClick: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onMapClick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

function FlyToLocation({ lat, lng, zoom }: { lat: number; lng: number; zoom: number }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo([lat, lng], zoom, { duration: 1 });
  }, [lat, lng, zoom, map]);
  return null;
}

function AutoOpenPopup({ reportId, markerRefs }: { reportId: string; markerRefs: React.MutableRefObject<Record<string, L.Marker>> }) {
  const map = useMap();
  useEffect(() => {
    if (reportId && markerRefs.current[reportId]) {
      setTimeout(() => {
        markerRefs.current[reportId]?.openPopup();
      }, 1200);
    }
  }, [reportId, map]);
  return null;
}

function UserLocationMarker() {
  const [pos, setPos] = useState<[number, number] | null>(null);

  useEffect(() => {
    const watchId = navigator.geolocation.watchPosition(
      (p) => setPos([p.coords.latitude, p.coords.longitude]),
      () => {},
      { enableHighAccuracy: true }
    );
    return () => navigator.geolocation.clearWatch(watchId);
  }, []);

  if (!pos) return null;

  return (
    <>
      <CircleMarker center={pos} radius={24} pathOptions={{ color: "#4285F4", fillColor: "#4285F4", fillOpacity: 0.08, weight: 1.5, dashArray: "4" }} />
      <CircleMarker center={pos} radius={8} pathOptions={{ color: "white", fillColor: "#4285F4", fillOpacity: 1, weight: 3 }} />
    </>
  );
}

function ReportPopupContent({ report, navigate }: { report: Report; navigate: (path: string) => void }) {
  const anonName = getAnonymousName(report.id);
  const dominant = getDominantVote(report.votes);
  const total = report.votes.truth + report.votes.needProve + report.votes.fake;

  const truthPct  = total ? Math.round((report.votes.truth    / total) * 100) : 0;
  const proofPct  = total ? Math.round((report.votes.needProve / total) * 100) : 0;
  const fakePct   = total ? Math.round((report.votes.fake      / total) * 100) : 0;

  const dominantLabel =
    dominant === "truth"     ? { text: "সত্য হওয়ার সম্ভাবনা বেশি",  bg: "#EDFBF1", color: "#1a7f3c" } :
    dominant === "fake"      ? { text: "মিথ্যা হওয়ার সম্ভাবনা বেশি", bg: "#FFF0F0", color: "#c0392b" } :
    dominant === "needProve" ? { text: "প্রমাণ প্রয়োজন",              bg: "#EEF4FF", color: "#1a56db" } :
                               { text: "এখনো ভোট হয়নি",               bg: "#F5F5F5", color: "#888"    };

  return (
    <div style={{ width: 272, fontFamily: "inherit", boxSizing: "border-box", overflow: "hidden", padding: "12px 14px 14px 14px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
        <AnonAvatar id={report.id} size={32} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontWeight: 600, fontSize: 12, color: "#FF3B30", margin: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            {anonName}
          </p>
          <p style={{ fontSize: 10, color: "#999", margin: 0 }}>{formatDate(report.createdAt)}</p>
        </div>
        <span style={{ fontSize: 9, fontWeight: 600, padding: "2px 7px", borderRadius: 20, background: dominantLabel.bg, color: dominantLabel.color, whiteSpace: "nowrap", flexShrink: 0 }}>
          {dominantLabel.text}
        </span>
      </div>

      <div style={{ display: "flex", gap: 5, marginBottom: 8, flexWrap: "wrap" }}>
        <span style={{ background: "#FF3B3012", color: "#FF3B30", padding: "3px 8px", borderRadius: 20, fontSize: 10, fontWeight: 600 }}>
          {getCorruptionIcon(report.corruptionType)} {report.corruptionType}
        </span>
        <span style={{ display: "flex", alignItems: "center", gap: 3, fontSize: 10, color: "#777", background: "#F5F5F5", padding: "3px 8px", borderRadius: 20 }}>
          <MapPin style={{ width: 9, height: 9 }} /> {report.area}
        </span>
      </div>

      <h3 style={{ fontWeight: 700, fontSize: 13, margin: "0 0 10px 0", lineHeight: 1.4, color: "#1a1a1a" }}>
        {report.title}
      </h3>

      <div style={{ background: "#FAFAFA", border: "1px solid #EFEFEF", borderRadius: 10, padding: "8px 10px", marginBottom: 10 }}>
        <div style={{ display: "flex", gap: 5, marginBottom: 7 }}>
          <div style={{ flex: 1, background: "#EDFBF1", borderRadius: 8, padding: "5px 4px", textAlign: "center" }}>
            <p style={{ margin: 0, fontSize: 14, lineHeight: 1 }}>✅</p>
            <p style={{ margin: "3px 0 0", fontSize: 13, fontWeight: 700, color: "#1a7f3c", lineHeight: 1 }}>{report.votes.truth}</p>
            <p style={{ margin: "2px 0 0", fontSize: 9, color: "#1a7f3c", opacity: 0.8 }}>সত্য</p>
          </div>
          <div style={{ flex: 1, background: "#EEF4FF", borderRadius: 8, padding: "5px 4px", textAlign: "center" }}>
            <p style={{ margin: 0, fontSize: 14, lineHeight: 1 }}>🔍</p>
            <p style={{ margin: "3px 0 0", fontSize: 13, fontWeight: 700, color: "#1a56db", lineHeight: 1 }}>{report.votes.needProve}</p>
            <p style={{ margin: "2px 0 0", fontSize: 9, color: "#1a56db", opacity: 0.8 }}>প্রমাণ চাই</p>
          </div>
          <div style={{ flex: 1, background: "#FFF0F0", borderRadius: 8, padding: "5px 4px", textAlign: "center" }}>
            <p style={{ margin: 0, fontSize: 14, lineHeight: 1 }}>❌</p>
            <p style={{ margin: "3px 0 0", fontSize: 13, fontWeight: 700, color: "#c0392b", lineHeight: 1 }}>{report.votes.fake}</p>
            <p style={{ margin: "2px 0 0", fontSize: 9, color: "#c0392b", opacity: 0.8 }}>মিথ্যা</p>
          </div>
        </div>

        {total > 0 ? (
          <>
            <div style={{ height: 5, borderRadius: 99, overflow: "hidden", display: "flex", background: "#E5E5E5" }}>
              {truthPct > 0 && <div style={{ width: `${truthPct}%`,  background: "#28A745", transition: "width .4s" }} />}
              {proofPct > 0 && <div style={{ width: `${proofPct}%`,  background: "#007BFF", transition: "width .4s" }} />}
              {fakePct  > 0 && <div style={{ width: `${fakePct}%`,   background: "#DC3545", transition: "width .4s" }} />}
            </div>
            <p style={{ margin: "5px 0 0", fontSize: 9, color: "#999", textAlign: "right" }}>মোট {total}টি ভোট</p>
          </>
        ) : (
          <p style={{ margin: "4px 0 0", fontSize: 10, color: "#bbb", textAlign: "center" }}>এখনো কোনো ভোট নেই</p>
        )}
      </div>

      <div style={{ display: "flex", gap: 6 }}>
        <button
          onClick={() => navigate(`/report/${report.id}`)}
          style={{ flex: 1, background: "#FF3B30", color: "white", padding: "7px 10px", borderRadius: 9, fontSize: 12, fontWeight: 700, border: "none", cursor: "pointer", letterSpacing: "0.01em" }}
        >
          বিস্তারিত →
        </button>
        <a
          href={`https://www.google.com/maps/dir/?api=1&destination=${report.latitude},${report.longitude}`}
          target="_blank"
          rel="noopener noreferrer"
          style={{ flex: 1, background: "#F0F4FF", color: "#1a56db", padding: "7px 10px", borderRadius: 9, fontSize: 12, fontWeight: 700, textDecoration: "none", textAlign: "center", border: "1px solid #C7D9FF", display: "flex", alignItems: "center", justifyContent: "center", gap: 4 }}
        >
          <Navigation style={{ width: 11, height: 11 }} /> ডিরেকশন
        </a>
      </div>
    </div>
  );
}

export default function MapPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [filterType, setFilterType] = useState("");
  const [showFilter, setShowFilter] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);
  const [showHeatmap, setShowHeatmap] = useState(false);
  const [flyTo, setFlyTo] = useState<{ lat: number; lng: number; zoom: number } | null>(null);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const markerRefs = useRef<Record<string, L.Marker>>({});
  const isMobile = useIsMobile();

  const heatmapPoints = useMemo<[number, number, number][]>(() => {
    return reports.map((r) => {
      const intensity = r.votes.truth + r.votes.needProve + r.votes.fake + 1;
      return [r.latitude, r.longitude, Math.min(intensity / 10, 1)];
    });
  }, [reports]);

  const recentReports = useMemo(() => {
    const now = Date.now();
    const oneDay = 24 * 60 * 60 * 1000;
    return reports.filter((r) => {
      const created = r.createdAt instanceof Date ? r.createdAt.getTime() : new Date(r.createdAt).getTime();
      return now - created < oneDay;
    });
  }, [reports]);

  useEffect(() => {
    const styleId = "custom-popup-style";
    if (!document.getElementById(styleId)) {
      const style = document.createElement("style");
      style.id = styleId;
      style.textContent = `
        .custom-popup .leaflet-popup-content-wrapper {
          padding: 0 !important;
          border-radius: 14px !important;
          overflow: hidden !important;
          box-shadow: 0 4px 20px rgba(0,0,0,0.15) !important;
        }
        .custom-popup .leaflet-popup-content {
          margin: 0 !important;
          width: auto !important;
          overflow: hidden !important;
        }
        .custom-popup .leaflet-popup-tip-container {
          margin-top: -1px;
        }
      `;
      document.head.appendChild(style);
    }
  }, []);

  const targetReportId = searchParams.get("id") || "";

  useEffect(() => {
    fetchReports().then(setReports).catch(console.error);
  }, []);

  useEffect(() => {
    const lat = searchParams.get("lat");
    const lng = searchParams.get("lng");
    if (lat && lng) {
      setFlyTo({ lat: parseFloat(lat), lng: parseFloat(lng), zoom: 15 });
    }
  }, [searchParams]);

  const filtered = filterType ? reports.filter((r) => r.corruptionType === filterType) : reports;

  const totalVotes = reports.reduce((sum, r) => sum + r.votes.truth + r.votes.needProve + r.votes.fake, 0);
  const verifiedCount = reports.filter((r) => getDominantVote(r.votes) === "truth").length;

  const handleMapClick = (lat: number, lng: number) => {
    navigate(`/add-report?lat=${lat}&lng=${lng}`);
  };

  const handleNearby = () => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setFlyTo({ lat: pos.coords.latitude, lng: pos.coords.longitude, zoom: 13 });
      },
      () => alert("লোকেশন পাওয়া যায়নি"),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  return (
    <div className="relative h-[calc(100vh-3rem-4rem)] md:h-[calc(100vh-3rem)]">
      <MapContainer
        center={[BD_CENTER.lat, BD_CENTER.lng]}
        zoom={BD_ZOOM}
        className="w-full h-full"
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapClickHandler onMapClick={handleMapClick} />
        <UserLocationMarker />
        {flyTo && <FlyToLocation lat={flyTo.lat} lng={flyTo.lng} zoom={flyTo.zoom} />}
        {targetReportId && <AutoOpenPopup reportId={targetReportId} markerRefs={markerRefs} />}

        <HeatmapLayer points={heatmapPoints} enabled={showHeatmap} />

        {recentReports.map((r) => (
          <PulseMarker
            key={`pulse-${r.id}`}
            position={[r.latitude, r.longitude]}
            color={getDominantVote(r.votes) === "truth" ? "#28A745" : getDominantVote(r.votes) === "fake" ? "#DC3545" : "#007BFF"}
          />
        ))}

        {filtered.map((r) => (
          <Marker
            key={r.id}
            position={[r.latitude, r.longitude]}
            icon={createDropPinIcon(getDominantVote(r.votes), getCorruptionIcon(r.corruptionType))}
            ref={(ref) => { if (ref) markerRefs.current[r.id] = ref; }}
          >
            <Popup maxWidth={290} minWidth={272} className="custom-popup">
              <ReportPopupContent report={r} navigate={navigate} />
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      <div className="absolute top-2 left-2 right-14 z-[1000] flex gap-2 overflow-x-auto no-scrollbar">
        <div className="bg-card/95 backdrop-blur-sm shadow-md rounded-lg border px-3 py-2 flex items-center gap-2 shrink-0">
          <FileText className="w-4 h-4 text-primary" />
          <div>
            <p className="text-xs font-bold font-display leading-none">{reports.length}</p>
            <p className="text-[10px] text-muted-foreground">রিপোর্ট</p>
          </div>
        </div>
        <div className="bg-card/95 backdrop-blur-sm shadow-md rounded-lg border px-3 py-2 flex items-center gap-2 shrink-0">
          <CheckCircle className="w-4 h-4 text-vote-truth" />
          <div>
            <p className="text-xs font-bold font-display leading-none">{verifiedCount}</p>
            <p className="text-[10px] text-muted-foreground">যাচাইকৃত</p>
          </div>
        </div>
        <div className="bg-card/95 backdrop-blur-sm shadow-md rounded-lg border px-3 py-2 flex items-center gap-2 shrink-0">
          <AlertTriangle className="w-4 h-4 text-vote-fake" />
          <div>
            <p className="text-xs font-bold font-display leading-none">{totalVotes}</p>
            <p className="text-[10px] text-muted-foreground">মোট ভোট</p>
          </div>
        </div>
      </div>

      {showInstructions && (
        <div className="absolute inset-0 z-[1001] flex items-center justify-center bg-black/30" onClick={() => setShowInstructions(false)}>
          <div className="bg-card rounded-xl shadow-2xl border p-5 mx-4 max-w-sm w-full" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-bold font-display text-foreground">📌 কিভাবে ব্যবহার করবেন</p>
              <button onClick={() => setShowInstructions(false)} className="text-muted-foreground hover:text-foreground">
                <X className="w-4 h-4" />
              </button>
            </div>
            <ul className="text-xs text-muted-foreground space-y-2 mb-4">
              <li>📍 <b>পিনে ক্লিক</b> করে রিপোর্ট দেখুন</li>
              <li>👆 <b>ম্যাপে ক্লিক</b> করে সেখানে রিপোর্ট করুন</li>
              <li>🔍 ডানদিকে <b>ফিল্টার</b> বাটন ব্যবহার করুন</li>
              <li>📍 <b>নিকটবর্তী</b> বাটনে ক্লিক করে আপনার কাছের রিপোর্ট দেখুন</li>
              <li>🔵 নীল বিন্দু আপনার <b>বর্তমান অবস্থান</b></li>
            </ul>
            <div className="border-t pt-3">
              <p className="text-xs font-bold font-display text-foreground mb-2">🎨 ইমোজি লেজেন্ড</p>
              <div className="grid grid-cols-2 gap-1.5">
                {CORRUPTION_TYPES.map((t) => (
                  <div key={t.value} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <span className="text-sm">{t.icon}</span>
                    <span>{t.label}</span>
                  </div>
                ))}
              </div>
              <div className="border-t mt-3 pt-3">
                <p className="text-xs font-bold font-display text-foreground mb-2">🗺️ পিন রঙের অর্থ</p>
                <div className="flex flex-wrap gap-2 text-xs">
                  <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-vote-truth inline-block"></span> সত্য</span>
                  <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-vote-proof inline-block"></span> প্রমাণ চাই</span>
                  <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-vote-fake inline-block"></span> মিথ্যা</span>
                  <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-primary inline-block"></span> নতুন</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {isMobile ? (
        <div className="absolute top-3 right-3 z-[1000] flex flex-col gap-2">
          <button
            onClick={() => setShowFilter(!showFilter)}
            className="bg-card shadow-lg rounded-full w-10 h-10 flex items-center justify-center border"
          >
            <Filter className="w-5 h-5 text-foreground" />
          </button>
          <button
            onClick={() => setShowHeatmap(!showHeatmap)}
            className={`shadow-lg rounded-full w-10 h-10 flex items-center justify-center border ${showHeatmap ? "bg-primary text-primary-foreground" : "bg-card"}`}
          >
            <Flame className="w-5 h-5" />
          </button>
          <button
            onClick={handleNearby}
            className="bg-card shadow-lg rounded-full w-10 h-10 flex items-center justify-center border"
          >
            <Navigation className="w-5 h-5 text-foreground" />
          </button>
          <button
            onClick={() => setShowInstructions(true)}
            className="bg-card shadow-lg rounded-full w-10 h-10 flex items-center justify-center border"
          >
            <Info className="w-5 h-5 text-foreground" />
          </button>
        </div>
      ) : (
        <div className="absolute top-2 right-3 z-[1000] flex items-center gap-2">
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="text-xs border rounded-lg px-2 py-1.5 bg-card/95 backdrop-blur-sm shadow-md"
          >
            <option value="">সব ধরন</option>
            {CORRUPTION_TYPES.map((t) => (
              <option key={t.value} value={t.value}>{t.icon} {t.label}</option>
            ))}
          </select>
          <button
            onClick={() => setShowHeatmap(!showHeatmap)}
            className={`backdrop-blur-sm shadow-md rounded-lg border px-3 py-1.5 flex items-center gap-1 text-xs transition-colors ${showHeatmap ? "bg-primary text-primary-foreground" : "bg-card/95 hover:bg-muted"}`}
          >
            <Flame className="w-3.5 h-3.5" /> হিটম্যাপ
          </button>
          <button
            onClick={handleNearby}
            className="bg-card/95 backdrop-blur-sm shadow-md rounded-lg border px-3 py-1.5 flex items-center gap-1 text-xs hover:bg-muted transition-colors"
          >
            <Navigation className="w-3.5 h-3.5" /> নিকটবর্তী
          </button>
          <button
            onClick={() => setShowInstructions(true)}
            className="bg-card/95 backdrop-blur-sm shadow-md rounded-lg border w-8 h-8 flex items-center justify-center"
          >
            <Info className="w-4 h-4 text-foreground" />
          </button>
        </div>
      )}

      {showFilter && isMobile && (
        <div className="absolute top-16 right-3 z-[1000] bg-card rounded-lg shadow-lg border p-3 w-56">
          <p className="text-xs font-medium text-muted-foreground mb-2 font-display">দুর্নীতির ধরন</p>
          <select
            value={filterType}
            onChange={(e) => { setFilterType(e.target.value); setShowFilter(false); }}
            className="w-full text-sm border rounded-lg px-2 py-1.5 bg-background"
          >
            <option value="">সব দেখুন</option>
            {CORRUPTION_TYPES.map((t) => (
              <option key={t.value} value={t.value}>{t.icon} {t.label}</option>
            ))}
          </select>
        </div>
      )}

      <button
        onClick={() => navigate("/add-report")}
        className="fixed bottom-20 left-4 md:bottom-6 md:left-4 z-[1001] bg-primary text-primary-foreground w-12 h-12 rounded-full shadow-xl flex items-center justify-center hover:opacity-90 transition-opacity"
      >
        <Plus className="w-6 h-6" />
      </button>
    </div>
  );
}
