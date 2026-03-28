import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { MapContainer, TileLayer, Marker } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { ArrowLeft, MapPin, Share2 } from "lucide-react";
import { fetchReport } from "@/lib/reports";
import { VoteButtons } from "@/components/VoteButtons";
import { EvidenceGrid } from "@/components/MediaPreview";
import { SkeletonDetailPage } from "@/components/SkeletonCard";
import { AnonAvatar } from "@/components/AnonAvatar";
import { getAnonymousName, formatDate, getShareText } from "@/lib/helpers";
import type { Report } from "@/lib/types";

const defaultIcon = L.icon({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

export default function ReportDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchReport(id).then((r) => {
        setReport(r);
        setLoading(false);
      });
    }
  }, [id]);

  if (loading) return <SkeletonDetailPage />;

  if (!report) {
    return (
      <div className="text-center py-12">
        <p className="font-display text-lg text-muted-foreground">রিপোর্ট পাওয়া যায়নি</p>
      </div>
    );
  }

  const handleShare = () => {
    const text = getShareText(report.title);
    const url = window.location.href;
    if (navigator.share) {
      navigator.share({ title: "চোর কই", text, url });
    } else {
      navigator.clipboard.writeText(`${text}\n${url}`);
    }
  };

  const handleMap = () => {
    navigate(`/?lat=${report.latitude}&lng=${report.longitude}&id=${report.id}`);
  };

  const anonName = getAnonymousName(report.id);
  const totalVotes = report.votes.truth + report.votes.needProve + report.votes.fake;
  const truthPct = totalVotes ? Math.round((report.votes.truth / totalVotes) * 100) : 0;
  const proofPct = totalVotes ? Math.round((report.votes.needProve / totalVotes) * 100) : 0;
  const fakePct = totalVotes ? Math.round((report.votes.fake / totalVotes) * 100) : 0;

  return (
    <div className="max-w-2xl mx-auto px-4 py-4">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-1 text-sm text-muted-foreground mb-4 hover:text-foreground transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> ফিরে যান
      </button>

      <div className="bg-card rounded-xl border shadow-sm overflow-hidden mb-4">
        <div className="p-4">
          <div className="flex items-center gap-2.5 mb-3">
            <AnonAvatar id={report.id} size={40} />
            <div className="flex-1 min-w-0">
              <p className="font-display font-semibold text-primary">{anonName}</p>
              <p className="text-xs text-muted-foreground">{formatDate(report.createdAt)}</p>
            </div>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-primary/10 text-primary rounded-full text-xs font-medium shrink-0">
              {report.corruptionType}
            </span>
          </div>

          <div className="flex items-center gap-1 text-xs text-muted-foreground mb-3">
            <MapPin className="w-3 h-3" /> {report.area}
          </div>

          <h1 className="font-display font-bold text-xl mb-3">{report.title}</h1>
          <p className="text-sm text-foreground leading-relaxed mb-4">{report.description}</p>

          {report.evidenceLinks.length > 0 && (
            <div className="mb-4">
              <p className="text-sm font-medium text-muted-foreground mb-2 font-display">প্রমাণসমূহ</p>
              <EvidenceGrid links={report.evidenceLinks} />
            </div>
          )}

          <VoteButtons reportId={report.id} votes={report.votes} />

          {totalVotes > 0 && (
            <div className="mt-4 space-y-2">
              <p className="text-xs font-medium text-muted-foreground">ভোট সামারি ({totalVotes} ভোট)</p>
              <div className="flex h-3 rounded-full overflow-hidden">
                {truthPct > 0 && <div className="bg-vote-truth" style={{ width: `${truthPct}%` }} />}
                {proofPct > 0 && <div className="bg-vote-proof" style={{ width: `${proofPct}%` }} />}
                {fakePct > 0 && <div className="bg-vote-fake" style={{ width: `${fakePct}%` }} />}
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-vote-truth">সত্য {truthPct}%</span>
                <span className="text-vote-proof">প্রমাণ চাই {proofPct}%</span>
                <span className="text-vote-fake">মিথ্যা {fakePct}%</span>
              </div>
            </div>
          )}

          <div className="flex gap-2 mt-4 pt-4 border-t">
            <button
              onClick={handleShare}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg border text-sm font-medium hover:bg-muted transition-colors"
            >
              <Share2 className="w-4 h-4" /> শেয়ার
            </button>
            <button
              onClick={handleMap}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity"
            >
              <MapPin className="w-4 h-4" /> ম্যাপে দেখুন
            </button>
          </div>
        </div>
      </div>

      <div className="bg-card rounded-xl border shadow-sm overflow-hidden h-48">
        <MapContainer
          center={[report.latitude, report.longitude]}
          zoom={14}
          className="w-full h-full"
          zoomControl={false}
          dragging={false}
          scrollWheelZoom={false}
        >
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          <Marker position={[report.latitude, report.longitude]} icon={defaultIcon} />
        </MapContainer>
      </div>
    </div>
  );
}
