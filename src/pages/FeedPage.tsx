import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchReports } from "@/lib/reports";
import { ReportCard } from "@/components/ReportCard";
import { SkeletonReportCard } from "@/components/SkeletonCard";
import { CORRUPTION_TYPES } from "@/lib/constants";
import { getDominantVote } from "@/lib/helpers";
import type { Report } from "@/lib/types";
import { FileText, Calendar, MapPin, CheckCircle, Vote, TrendingUp } from "lucide-react";

const PAGE_SIZE = 10;

export default function FeedPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState("");
  const [sortBy, setSortBy] = useState<"recent" | "nearby" | "trending">("recent");
  const [userLoc, setUserLoc] = useState<{ lat: number; lng: number } | null>(null);
  const [page, setPage] = useState(1);
  const navigate = useNavigate();

  const load = () => {
    setLoading(true);
    fetchReports().then((r) => {
      setReports(r);
      setLoading(false);
    });
  };

  useEffect(() => { load(); }, []);

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayCount = reports.filter((r) => r.createdAt >= today).length;
  const verifiedCount = reports.filter((r) => getDominantVote(r.votes) === "truth").length;
  const totalVotes = reports.reduce((sum, r) => sum + r.votes.truth + r.votes.needProve + r.votes.fake, 0);

  let filtered = filterType ? reports.filter((r) => r.corruptionType === filterType) : [...reports];

  const handleNearby = () => {
    setSortBy("nearby");
    if (!userLoc) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setUserLoc({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => alert("লোকেশন পাওয়া যায়নি")
      );
    }
  };

  if (sortBy === "nearby" && userLoc) {
    filtered.sort((a, b) => {
      const distA = Math.sqrt(Math.pow(a.latitude - userLoc.lat, 2) + Math.pow(a.longitude - userLoc.lng, 2));
      const distB = Math.sqrt(Math.pow(b.latitude - userLoc.lat, 2) + Math.pow(b.longitude - userLoc.lng, 2));
      return distA - distB;
    });
  }

  if (sortBy === "trending") {
    filtered.sort((a, b) => {
      const totalA = a.votes.truth + a.votes.needProve + a.votes.fake;
      const totalB = b.votes.truth + b.votes.needProve + b.votes.fake;
      return totalB - totalA;
    });
  }

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  useEffect(() => { setPage(1); }, [filterType, sortBy]);

  return (
    <div className="max-w-3xl mx-auto px-3 py-3">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3">
        <div className="bg-card rounded-xl border p-3 flex items-center gap-2.5 shadow-sm">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
            <Calendar className="w-4 h-4 text-primary" />
          </div>
          <div className="min-w-0">
            <p className="text-base font-bold font-display leading-none">{todayCount}</p>
            <p className="text-[11px] text-muted-foreground">আজকের</p>
          </div>
        </div>
        <div className="bg-card rounded-xl border p-3 flex items-center gap-2.5 shadow-sm">
          <div className="w-8 h-8 rounded-lg bg-vote-truth/10 flex items-center justify-center shrink-0">
            <FileText className="w-4 h-4 text-vote-truth" />
          </div>
          <div className="min-w-0">
            <p className="text-base font-bold font-display leading-none">{reports.length}</p>
            <p className="text-[11px] text-muted-foreground">মোট</p>
          </div>
        </div>
        <div className="bg-card rounded-xl border p-3 flex items-center gap-2.5 shadow-sm">
          <div className="w-8 h-8 rounded-lg bg-vote-truth/10 flex items-center justify-center shrink-0">
            <CheckCircle className="w-4 h-4 text-vote-truth" />
          </div>
          <div className="min-w-0">
            <p className="text-base font-bold font-display leading-none">{verifiedCount}</p>
            <p className="text-[11px] text-muted-foreground">যাচাইকৃত</p>
          </div>
        </div>
        <div className="bg-card rounded-xl border p-3 flex items-center gap-2.5 shadow-sm">
          <div className="w-8 h-8 rounded-lg bg-vote-proof/10 flex items-center justify-center shrink-0">
            <Vote className="w-4 h-4 text-vote-proof" />
          </div>
          <div className="min-w-0">
            <p className="text-base font-bold font-display leading-none">{totalVotes}</p>
            <p className="text-[11px] text-muted-foreground">ভোট</p>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-2 mb-3">
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="w-full text-xs border rounded-lg px-2.5 py-2 bg-card"
        >
          <option value="">সব ধরন</option>
          {CORRUPTION_TYPES.map((t) => (
            <option key={t.value} value={t.value}>{t.icon} {t.label}</option>
          ))}
        </select>
        <div className="grid grid-cols-3 gap-1.5">
          <button
            onClick={() => setSortBy("recent")}
            className={`text-xs px-2 py-2 rounded-lg border transition-colors ${
              sortBy === "recent" ? "bg-primary text-primary-foreground" : "bg-card"
            }`}
          >
            সাম্প্রতিক
          </button>
          <button
            onClick={() => setSortBy("trending")}
            className={`text-xs px-2 py-2 rounded-lg border transition-colors flex items-center justify-center gap-1 ${
              sortBy === "trending" ? "bg-primary text-primary-foreground" : "bg-card"
            }`}
          >
            <TrendingUp className="w-3 h-3" /> ট্রেন্ডিং
          </button>
          <button
            onClick={handleNearby}
            className={`text-xs px-2 py-2 rounded-lg border transition-colors flex items-center justify-center gap-1 ${
              sortBy === "nearby" ? "bg-primary text-primary-foreground" : "bg-card"
            }`}
          >
            <MapPin className="w-3 h-3" /> নিকটবর্তী
          </button>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <SkeletonReportCard key={i} />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <p className="font-display text-lg">কোনো রিপোর্ট পাওয়া যায়নি</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {paginated.map((r) => (
              <div key={r.id} className="cursor-pointer" onClick={() => navigate(`/report/${r.id}`)}>
                <ReportCard report={r} />
              </div>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-4 pb-4">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1.5 text-xs rounded-lg border bg-card disabled:opacity-40"
              >
                পূর্ববর্তী
              </button>
              <div className="flex gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
                  .map((p, idx, arr) => (
                    <span key={p} className="flex items-center">
                      {idx > 0 && arr[idx - 1] !== p - 1 && (
                        <span className="text-xs text-muted-foreground px-1">...</span>
                      )}
                      <button
                        onClick={() => setPage(p)}
                        className={`w-8 h-8 text-xs rounded-lg border ${
                          p === page ? "bg-primary text-primary-foreground" : "bg-card"
                        }`}
                      >
                        {p}
                      </button>
                    </span>
                  ))}
              </div>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-3 py-1.5 text-xs rounded-lg border bg-card disabled:opacity-40"
              >
                পরবর্তী
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
