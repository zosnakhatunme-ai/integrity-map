import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { MapContainer, TileLayer, Marker } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { ArrowLeft, MapPin, Share2, Upload, Link2, Camera, X, ShieldCheck, ShieldAlert, HelpCircle, Shield } from "lucide-react";
import { fetchReport, uploadToImgBB, submitPendingEvidence } from "@/lib/reports";
import { VoteButtons } from "@/components/VoteButtons";
import { EvidenceGrid } from "@/components/MediaPreview";
import { SkeletonDetailPage } from "@/components/SkeletonCard";
import { AnonAvatar } from "@/components/AnonAvatar";
import { getAnonymousName, formatDate, getShareText, getDominantVote } from "@/lib/helpers";
import { toast } from "sonner";
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
  if (total === 0) {
    return (
      <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-muted border border-border">
        <Shield className="w-5 h-5 text-muted-foreground" />
        <div>
          <p className="text-sm font-semibold text-muted-foreground font-display">যাচাই হয়নি</p>
          <p className="text-xs text-muted-foreground">এখনো কেউ ভোট দেয়নি</p>
        </div>
      </div>
    );
  }

  const dominant = getDominantVote(votes);
  const truthPct = Math.round((votes.truth / total) * 100);
  const fakePct = Math.round((votes.fake / total) * 100);
  const proofPct = Math.round((votes.needProve / total) * 100);

  if (dominant === "truth") {
    return (
      <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-vote-truth/10 border border-vote-truth/30">
        <ShieldCheck className="w-5 h-5 text-vote-truth" />
        <div>
          <p className="text-sm font-semibold text-vote-truth font-display">সত্য বলে যাচাইকৃত</p>
          <p className="text-xs text-muted-foreground">{truthPct}% মানুষ সত্য বলেছেন · {total} ভোট</p>
        </div>
      </div>
    );
  }

  if (dominant === "fake") {
    return (
      <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-vote-fake/10 border border-vote-fake/30">
        <ShieldAlert className="w-5 h-5 text-vote-fake" />
        <div>
          <p className="text-sm font-semibold text-vote-fake font-display">মিথ্যা বলে চিহ্নিত</p>
          <p className="text-xs text-muted-foreground">{fakePct}% মানুষ মিথ্যা বলেছেন · {total} ভোট</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-vote-proof/10 border border-vote-proof/30">
      <HelpCircle className="w-5 h-5 text-vote-proof" />
      <div>
        <p className="text-sm font-semibold text-vote-proof font-display">আরো প্রমাণ প্রয়োজন</p>
        <p className="text-xs text-muted-foreground">{proofPct}% মানুষ প্রমাণ চেয়েছেন · {total} ভোট</p>
      </div>
    </div>
  );
}

function PublicEvidenceUpload({ reportId, reportTitle }: { reportId: string; reportTitle: string }) {
  const [uploading, setUploading] = useState(false);
  const [newLink, setNewLink] = useState("");

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setUploading(true);
    try {
      for (const file of Array.from(files)) {
        const url = await uploadToImgBB(file);
        await submitPendingEvidence(reportId, reportTitle, url);
      }
      toast.success("প্রমাণ সাবমিট হয়েছে! এডমিন অনুমোদনের পর এটি দেখা যাবে।");
    } catch {
      toast.error("আপলোড ব্যর্থ হয়েছে");
    }
    setUploading(false);
  };

  const handleLinkSubmit = async () => {
    if (!newLink.trim()) return;
    try {
      await submitPendingEvidence(reportId, reportTitle, newLink.trim());
      setNewLink("");
      toast.success("লিংক সাবমিট হয়েছে! এডমিন অনুমোদনের পর এটি দেখা যাবে।");
    } catch {
      toast.error("সাবমিট ব্যর্থ হয়েছে");
    }
  };

  return (
    <div className="bg-card rounded-xl border shadow-sm p-4">
      <h3 className="font-display font-semibold text-sm mb-3 flex items-center gap-2">
        <Upload className="w-4 h-4 text-primary" />
        প্রমাণ জমা দিন
      </h3>
      <p className="text-xs text-muted-foreground mb-3">
        আপনার কাছে এই রিপোর্টের প্রমাণ থাকলে জমা দিন। এডমিন অনুমোদনের পর এটি সবাই দেখতে পাবে।
      </p>

      <div className="grid grid-cols-2 gap-2 mb-3">
        <label className="flex flex-col items-center justify-center gap-1.5 px-3 py-4 border-2 border-dashed rounded-xl cursor-pointer hover:bg-muted hover:border-primary/30 transition-all">
          <Camera className="w-5 h-5 text-primary" />
          <span className="text-xs font-medium font-display">ছবি আপলোড</span>
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleImageUpload}
            className="hidden"
          />
        </label>
        <div
          onClick={() => document.getElementById("public-evidence-link")?.focus()}
          className="flex flex-col items-center justify-center gap-1.5 px-3 py-4 border-2 border-dashed rounded-xl cursor-pointer hover:bg-muted hover:border-primary/30 transition-all"
        >
          <Link2 className="w-5 h-5 text-primary" />
          <span className="text-xs font-medium font-display">লিংক যুক্ত</span>
        </div>
      </div>

      <div className="flex gap-2">
        <input
          id="public-evidence-link"
          type="text"
          value={newLink}
          onChange={(e) => setNewLink(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleLinkSubmit()}
          placeholder="প্রমাণের লিংক পেস্ট করুন"
          className="flex-1 border-2 rounded-xl px-3 py-2.5 bg-card text-sm focus:border-primary outline-none transition-all"
        />
        <button
          onClick={handleLinkSubmit}
          className="px-4 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-medium hover:opacity-90 transition-opacity"
        >
          জমা দিন
        </button>
      </div>

      {uploading && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground mt-2">
          <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary border-t-transparent" />
          আপলোড হচ্ছে...
        </div>
      )}
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
    <div className="max-w-2xl mx-auto px-4 py-4 space-y-4">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> ফিরে যান
      </button>

      {/* Vote Verdict */}
      <VoteVerdict votes={report.votes} />

      <div className="bg-card rounded-xl border shadow-sm overflow-hidden">
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

      {/* Map Preview */}
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

      {/* Public Evidence Upload */}
      <PublicEvidenceUpload reportId={report.id} reportTitle={report.title} />
    </div>
  );
}
