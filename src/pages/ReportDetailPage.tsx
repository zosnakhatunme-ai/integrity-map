import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { MapContainer, TileLayer, Marker } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { ArrowLeft, MapPin, Share2, CheckCircle, AlertTriangle, XCircle, HelpCircle } from "lucide-react";
import { fetchReport } from "@/lib/reports";
import { VoteButtons } from "@/components/VoteButtons";
import { EvidenceGrid } from "@/components/MediaPreview";
import { SkeletonDetailPage } from "@/components/SkeletonCard";
import { AnonAvatar } from "@/components/AnonAvatar";
import { getAnonymousName, formatDate, getShareText, getDominantVote } from "@/lib/helpers";
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

function VoteVerdict({ votes }: { votes: Report["votes"] }) {
  const total = votes.truth + votes.needProve + votes.fake;
  const dominant = getDominantVote(votes);

  if (total === 0) {
    return (
      <div className="mt-4 flex items-center gap-3 p-4 rounded-xl bg-muted/50 border border-border">
        <HelpCircle className="w-8 h-8 text-muted-foreground shrink-0" />
        <div>
          <p className="font-display font-bold text-sm text-foreground">যাচাই হয়নি</p>
          <p className="text-xs text-muted-foreground mt-0.5">এখনো কোনো ভোট পড়েনি। ভোট দিয়ে রিপোর্ট যাচাই করুন।</p>
        </div>
      </div>
    );
  }

  const truthPct = Math.round((votes.truth / total) * 100);
  const fakePct = Math.round((votes.fake / total) * 100);
  const proofPct = Math.round((votes.needProve / total) * 100);

  const verdictConfig = {
    truth: {
      icon: <CheckCircle className="w-8 h-8 text-vote-truth shrink-0" />,
      title: "সম্ভবত সত্য",
      desc: `${truthPct}% ভোটদাতা মনে করেন এই রিপোর্টটি সত্য (মোট ${total}টি ভোট)`,
      bg: "bg-green-50 dark:bg-green-950/30",
      border: "border-green-200 dark:border-green-800",
    },
    fake: {
      icon: <XCircle className="w-8 h-8 text-vote-fake shrink-0" />,
      title: "সম্ভবত মিথ্যা",
      desc: `${fakePct}% ভোটদাতা মনে করেন এই রিপোর্টটি মিথ্যা (মোট ${total}টি ভোট)`,
      bg: "bg-red-50 dark:bg-red-950/30",
      border: "border-red-200 dark:border-red-800",
    },
    needProve: {
      icon: <AlertTriangle className="w-8 h-8 text-vote-proof shrink-0" />,
      title: "প্রমাণ প্রয়োজন",
      desc: `${proofPct}% ভোটদাতা মনে করেন এই রিপোর্টের প্রমাণ দরকার (মোট ${total}টি ভোট)`,
      bg: "bg-blue-50 dark:bg-blue-950/30",
      border: "border-blue-200 dark:border-blue-800",
    },
    neutral: {
      icon: <HelpCircle className="w-8 h-8 text-muted-foreground shrink-0" />,
      title: "মতামত বিভক্ত",
      desc: `ভোটদাতাদের মতামত সমানভাবে বিভক্ত (মোট ${total}টি ভোট)`,
      bg: "bg-muted/50",
      border: "border-border",
    },
  };

  const v = verdictConfig[dominant];

  return (
    <div className={`mt-4 flex items-center gap-3 p-4 rounded-xl ${v.bg} border ${v.border}`}>
      {v.icon}
      <div>
        <p className="font-display font-bold text-sm text-foreground">{v.title}</p>
        <p className="text-xs text-muted-foreground mt-0.5">{v.desc}</p>
      </div>
    </div>
  );
}

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

          <VoteVerdict votes={report.votes} />

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
