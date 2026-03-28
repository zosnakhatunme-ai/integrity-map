import { useState, useEffect, useCallback } from "react";
import { signInWithEmailAndPassword, signOut, onAuthStateChanged, User } from "firebase/auth";
import { auth } from "@/lib/firebase";
import {
  fetchReports,
  updateReport,
  deleteReport,
  fetchPendingEvidence,
  approvePendingEvidence,
  rejectPendingEvidence,
} from "@/lib/reports";
import { CORRUPTION_TYPES } from "@/lib/constants";
import { formatDate } from "@/lib/helpers";
import {
  Trash2, Edit, Save, X, LogOut, Plus, Minus,
  CheckCircle, XCircle, Upload, ExternalLink, RefreshCw,
  Clock, Calendar, FileText, ShieldAlert, AlertCircle,
} from "lucide-react";
import { toast } from "sonner";
import type { Report, PendingEvidence } from "@/lib/types";

const ADMIN_PAGE_SIZE = 15;

// ─── Login ────────────────────────────────────────────────────────────────────

function AdminLogin({ onLogin }: { onLogin: () => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      toast.success("লগইন সফল");
      onLogin();
    } catch {
      toast.error("লগইন ব্যর্থ — ইমেইল বা পাসওয়ার্ড ভুল");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <ShieldAlert className="w-7 h-7 text-primary" />
          </div>
          <h2 className="font-display font-bold text-2xl">এডমিন লগইন</h2>
          <p className="text-sm text-muted-foreground mt-1">শুধুমাত্র অনুমোদিত ব্যক্তির জন্য</p>
        </div>
        <div className="bg-card rounded-2xl border shadow-sm p-6 space-y-4">
          <div>
            <label className="text-xs font-medium text-muted-foreground">ইমেইল</label>
            <input
              type="email"
              placeholder="admin@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border rounded-xl px-3 py-2.5 bg-background text-sm focus:border-primary outline-none transition-colors mt-1"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground">পাসওয়ার্ড</label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border rounded-xl px-3 py-2.5 bg-background text-sm focus:border-primary outline-none transition-colors mt-1"
              onKeyDown={(e) => e.key === "Enter" && handleLogin()}
            />
          </div>
          <button
            onClick={handleLogin}
            disabled={loading}
            className="w-full py-2.5 bg-primary text-primary-foreground rounded-xl font-display font-semibold text-sm disabled:opacity-60 flex items-center justify-center gap-2 mt-2"
          >
            {loading && (
              <div className="w-4 h-4 border-2 border-primary-foreground/40 border-t-primary-foreground rounded-full animate-spin" />
            )}
            লগইন করুন
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Edit Report Form ─────────────────────────────────────────────────────────

function EditReportForm({
  report,
  onSave,
  onCancel,
}: {
  report: Report;
  onSave: (data: Partial<Report>) => void;
  onCancel: () => void;
}) {
  const toDatetimeLocal = (d: Date | { toDate?: () => Date } | string | number): string => {
    try {
      let date: Date;
      if (d && typeof d === "object" && "toDate" in d && typeof d.toDate === "function") {
        date = d.toDate();
      } else {
        date = new Date(d as string | number | Date);
      }
      if (isNaN(date.getTime())) return "";
      const pad = (n: number) => String(n).padStart(2, "0");
      return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
    } catch {
      return "";
    }
  };

  const [data, setData] = useState({
    title: report.title,
    corruptionType: report.corruptionType,
    area: report.area,
    description: report.description,
    latitude: report.latitude,
    longitude: report.longitude,
    evidenceLinks: [...report.evidenceLinks],
    votes: { ...report.votes },
    createdAt: report.createdAt,
  });
  const [dateStr, setDateStr] = useState(toDatetimeLocal(report.createdAt as Date));
  const [newLink, setNewLink] = useState("");

  const addLink = () => {
    if (newLink.trim()) {
      setData({ ...data, evidenceLinks: [...data.evidenceLinks, newLink.trim()] });
      setNewLink("");
    }
  };
  const removeLink = (idx: number) =>
    setData({ ...data, evidenceLinks: data.evidenceLinks.filter((_, i) => i !== idx) });

  const handleSave = () => {
    const saveData: Partial<Report> = { ...data };
    if (dateStr) {
      const parsed = new Date(dateStr);
      if (!isNaN(parsed.getTime())) {
        (saveData as Record<string, unknown>).createdAt = parsed;
      }
    }
    onSave(saveData);
  };

  return (
    <div className="space-y-3 pt-1">
      {/* Title */}
      <div>
        <label className="text-xs font-medium text-muted-foreground">শিরোনাম</label>
        <input
          value={data.title}
          onChange={(e) => setData({ ...data, title: e.target.value })}
          className="w-full border rounded-lg px-3 py-2 text-sm bg-background mt-1 focus:border-primary outline-none"
        />
      </div>

      {/* Type + Area */}
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="text-xs font-medium text-muted-foreground">দুর্নীতির ধরন</label>
          <select
            value={data.corruptionType}
            onChange={(e) => setData({ ...data, corruptionType: e.target.value })}
            className="w-full border rounded-lg px-3 py-2 text-sm bg-background mt-1 focus:border-primary outline-none"
          >
            {CORRUPTION_TYPES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.icon} {t.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-xs font-medium text-muted-foreground">স্থান</label>
          <input
            value={data.area}
            onChange={(e) => setData({ ...data, area: e.target.value })}
            className="w-full border rounded-lg px-3 py-2 text-sm bg-background mt-1 focus:border-primary outline-none"
          />
        </div>
      </div>

      {/* Date + Time */}
      <div>
        <label className="text-xs font-medium text-muted-foreground flex items-center gap-1">
          <Calendar className="w-3.5 h-3.5" /> তারিখ ও সময়
        </label>
        <input
          type="datetime-local"
          value={dateStr}
          onChange={(e) => setDateStr(e.target.value)}
          className="w-full border rounded-lg px-3 py-2 text-sm bg-background mt-1 focus:border-primary outline-none"
        />
      </div>

      {/* Description */}
      <div>
        <label className="text-xs font-medium text-muted-foreground">বিবরণ</label>
        <textarea
          value={data.description}
          onChange={(e) => setData({ ...data, description: e.target.value })}
          rows={3}
          className="w-full border rounded-lg px-3 py-2 text-sm bg-background mt-1 focus:border-primary outline-none resize-none"
        />
      </div>

      {/* Coordinates */}
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="text-xs font-medium text-muted-foreground">অক্ষাংশ</label>
          <input
            type="number"
            step="any"
            value={data.latitude}
            onChange={(e) => setData({ ...data, latitude: parseFloat(e.target.value) || 0 })}
            className="w-full border rounded-lg px-3 py-2 text-sm bg-background mt-1 focus:border-primary outline-none"
          />
        </div>
        <div>
          <label className="text-xs font-medium text-muted-foreground">দ্রাঘিমাংশ</label>
          <input
            type="number"
            step="any"
            value={data.longitude}
            onChange={(e) => setData({ ...data, longitude: parseFloat(e.target.value) || 0 })}
            className="w-full border rounded-lg px-3 py-2 text-sm bg-background mt-1 focus:border-primary outline-none"
          />
        </div>
      </div>

      {/* Votes */}
      <div>
        <label className="text-xs font-medium text-muted-foreground">ভোট কাউন্ট</label>
        <div className="grid grid-cols-3 gap-2 mt-1">
          <div className="flex items-center gap-1 border rounded-lg px-2 py-1.5 focus-within:border-vote-truth">
            <span className="text-xs">✅</span>
            <input
              type="number"
              min={0}
              value={data.votes.truth}
              onChange={(e) =>
                setData({ ...data, votes: { ...data.votes, truth: parseInt(e.target.value) || 0 } })
              }
              className="w-full text-sm bg-transparent text-center outline-none"
            />
          </div>
          <div className="flex items-center gap-1 border rounded-lg px-2 py-1.5 focus-within:border-vote-proof">
            <span className="text-xs">❓</span>
            <input
              type="number"
              min={0}
              value={data.votes.needProve}
              onChange={(e) =>
                setData({ ...data, votes: { ...data.votes, needProve: parseInt(e.target.value) || 0 } })
              }
              className="w-full text-sm bg-transparent text-center outline-none"
            />
          </div>
          <div className="flex items-center gap-1 border rounded-lg px-2 py-1.5 focus-within:border-vote-fake">
            <span className="text-xs">❌</span>
            <input
              type="number"
              min={0}
              value={data.votes.fake}
              onChange={(e) =>
                setData({ ...data, votes: { ...data.votes, fake: parseInt(e.target.value) || 0 } })
              }
              className="w-full text-sm bg-transparent text-center outline-none"
            />
          </div>
        </div>
      </div>

      {/* Evidence Links */}
      <div>
        <label className="text-xs font-medium text-muted-foreground">প্রমাণ লিংক</label>
        <div className="space-y-1.5 mt-1">
          {data.evidenceLinks.map((link, idx) => (
            <div key={idx} className="flex items-center gap-1.5">
              <input
                value={link}
                onChange={(e) => {
                  const updated = [...data.evidenceLinks];
                  updated[idx] = e.target.value;
                  setData({ ...data, evidenceLinks: updated });
                }}
                className="flex-1 border rounded-lg px-2 py-1.5 text-xs bg-background truncate focus:border-primary outline-none"
              />
              <button
                onClick={() => removeLink(idx)}
                className="p-1 text-destructive hover:bg-destructive/10 rounded"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
          <div className="flex items-center gap-1.5">
            <input
              value={newLink}
              onChange={(e) => setNewLink(e.target.value)}
              placeholder="নতুন লিংক যোগ করুন..."
              className="flex-1 border rounded-lg px-2 py-1.5 text-xs bg-background focus:border-primary outline-none"
              onKeyDown={(e) => e.key === "Enter" && addLink()}
            />
            <button onClick={addLink} className="p-1 text-vote-truth hover:bg-vote-truth/10 rounded">
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2 pt-2">
        <button
          onClick={handleSave}
          className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-vote-truth text-white rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
        >
          <Save className="w-4 h-4" /> সেভ করুন
        </button>
        <button
          onClick={onCancel}
          className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 border rounded-lg text-sm font-medium hover:bg-muted transition-colors"
        >
          <X className="w-4 h-4" /> বাতিল
        </button>
      </div>
    </div>
  );
}

// ─── Pending Evidence Section ─────────────────────────────────────────────────

function PendingEvidenceSection({ refreshKey }: { refreshKey: number }) {
  const [evidence, setEvidence] = useState<PendingEvidence[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionId, setActionId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // fetchPendingEvidence uses where("status","==","pending") + orderBy("createdAt","desc")
      // If Firestore composite index is missing this will throw. We catch and fallback.
      const data = await fetchPendingEvidence();
      setEvidence(Array.isArray(data) ? data : []);
    } catch (err: unknown) {
      console.error("fetchPendingEvidence error:", err);
      // Provide a helpful error with a link if it's a missing-index Firestore error
      const msg = err instanceof Error ? err.message : String(err);
      if (msg.includes("index") || msg.includes("Index")) {
        setError(
          "Firestore composite index তৈরি হয়নি। Firebase Console → Firestore → Indexes-এ গিয়ে `pending_evidence` collection-এ `status ASC, createdAt DESC` index তৈরি করুন।"
        );
      } else {
        setError("পেন্ডিং প্রমাণ লোড করতে সমস্যা হয়েছে: " + msg);
      }
      setEvidence([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Reload whenever the tab becomes active (refreshKey changes)
  useEffect(() => {
    load();
  }, [load, refreshKey]);

  const handleApprove = async (item: PendingEvidence) => {
    setActionId(item.id);
    try {
      await approvePendingEvidence(item.id, item.reportId, item.url);
      toast.success("প্রমাণ অনুমোদিত হয়েছে ✅");
      setEvidence((prev) => prev.filter((e) => e.id !== item.id));
    } catch (err) {
      console.error("approvePendingEvidence error:", err);
      toast.error("অনুমোদন ব্যর্থ হয়েছে");
    } finally {
      setActionId(null);
    }
  };

  const handleReject = async (item: PendingEvidence) => {
    setActionId(item.id);
    try {
      await rejectPendingEvidence(item.id);
      toast.success("প্রমাণ প্রত্যাখ্যান হয়েছে");
      setEvidence((prev) => prev.filter((e) => e.id !== item.id));
    } catch (err) {
      console.error("rejectPendingEvidence error:", err);
      toast.error("প্রত্যাখ্যান ব্যর্থ হয়েছে");
    } finally {
      setActionId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-3">
        <div className="animate-spin rounded-full h-7 w-7 border-2 border-primary border-t-transparent" />
        <p className="text-xs text-muted-foreground">পেন্ডিং প্রমাণ লোড হচ্ছে...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-destructive/5 border border-destructive/20 rounded-xl p-4 space-y-3">
        <div className="flex items-start gap-2">
          <AlertCircle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-destructive font-display">লোড ব্যর্থ হয়েছে</p>
            <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{error}</p>
          </div>
        </div>
        <button
          onClick={load}
          className="flex items-center gap-1.5 text-xs text-primary hover:underline font-medium"
        >
          <RefreshCw className="w-3.5 h-3.5" /> আবার চেষ্টা করুন
        </button>
      </div>
    );
  }

  if (evidence.length === 0) {
    return (
      <div className="text-center py-16 space-y-3">
        <div className="w-14 h-14 rounded-2xl bg-vote-truth/10 flex items-center justify-center mx-auto">
          <CheckCircle className="w-7 h-7 text-vote-truth" />
        </div>
        <div>
          <p className="text-sm font-display font-semibold">কোনো পেন্ডিং প্রমাণ নেই</p>
          <p className="text-xs text-muted-foreground mt-1">সব প্রমাণ পর্যালোচনা করা হয়েছে</p>
        </div>
        <button
          onClick={load}
          className="text-xs text-primary flex items-center gap-1.5 mx-auto hover:underline font-medium"
        >
          <RefreshCw className="w-3.5 h-3.5" /> রিফ্রেশ করুন
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground">
          <span className="font-semibold text-foreground">{evidence.length}টি</span> প্রমাণ অনুমোদনের অপেক্ষায়
        </p>
        <button
          onClick={load}
          className="text-xs text-primary flex items-center gap-1 hover:underline"
        >
          <RefreshCw className="w-3 h-3" /> রিফ্রেশ
        </button>
      </div>

      {evidence.map((item) => {
        const isImage = /\.(jpg|jpeg|png|gif|webp)/i.test(item.url);
        const isBusy = actionId === item.id;

        return (
          <div key={item.id} className="bg-card rounded-xl border shadow-sm overflow-hidden">
            {/* Preview */}
            {isImage ? (
              <div className="relative bg-muted">
                <img
                  src={item.url}
                  alt="প্রমাণ"
                  className="w-full max-h-56 object-contain"
                  onError={(e) => {
                    (e.target as HTMLImageElement).parentElement!.style.display = "none";
                  }}
                />
                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="absolute top-2 right-2 p-1.5 bg-black/50 rounded-lg text-white hover:bg-black/70 transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            ) : (
              <a
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-xs text-primary hover:bg-primary/5 bg-primary/5 px-4 py-3 border-b break-all"
              >
                <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">{item.url}</span>
              </a>
            )}

            {/* Info + Actions */}
            <div className="p-3">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold font-display line-clamp-2 leading-snug">
                    {item.reportTitle}
                  </p>
                  <p className="text-[10px] text-muted-foreground flex items-center gap-1 mt-1">
                    <Clock className="w-3 h-3" />
                    {formatDate(item.createdAt)}
                  </p>
                </div>
                <div className="flex gap-1.5 shrink-0">
                  <button
                    onClick={() => handleApprove(item)}
                    disabled={isBusy}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-vote-truth/10 text-vote-truth hover:bg-vote-truth/20 text-xs font-medium transition-colors disabled:opacity-50"
                  >
                    {isBusy ? (
                      <div className="w-3.5 h-3.5 border-2 border-vote-truth/40 border-t-vote-truth rounded-full animate-spin" />
                    ) : (
                      <CheckCircle className="w-3.5 h-3.5" />
                    )}
                    অনুমোদন
                  </button>
                  <button
                    onClick={() => handleReject(item)}
                    disabled={isBusy}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-vote-fake/10 text-vote-fake hover:bg-vote-fake/20 text-xs font-medium transition-colors disabled:opacity-50"
                  >
                    {isBusy ? (
                      <div className="w-3.5 h-3.5 border-2 border-vote-fake/40 border-t-vote-fake rounded-full animate-spin" />
                    ) : (
                      <XCircle className="w-3.5 h-3.5" />
                    )}
                    বাতিল
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Main Admin Page ──────────────────────────────────────────────────────────

export default function AdminPage() {
  const [user, setUser] = useState<User | null>(null);
  const [reports, setReports] = useState<Report[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [activeTab, setActiveTab] = useState<"reports" | "evidence">("reports");
  const [pendingCount, setPendingCount] = useState<number | null>(null);
  // Increment this to force PendingEvidenceSection to reload when switching to the tab
  const [evidenceRefreshKey, setEvidenceRefreshKey] = useState(0);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => setUser(u));
    return unsub;
  }, []);

  useEffect(() => {
    if (user) {
      loadReports();
      loadPendingCount();
    }
  }, [user]);

  const loadReports = async () => {
    setLoading(true);
    const r = await fetchReports();
    setReports(r);
    setLoading(false);
  };

  const loadPendingCount = async () => {
    try {
      const data = await fetchPendingEvidence();
      setPendingCount((data ?? []).length);
    } catch {
      setPendingCount(0);
    }
  };

  const handleLogout = () => signOut(auth);

  const saveEdit = async (id: string, data: Partial<Report>) => {
    try {
      await updateReport(id, data);
      toast.success("আপডেট হয়েছে");
      setEditingId(null);
      loadReports();
    } catch {
      toast.error("আপডেট ব্যর্থ");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("এই রিপোর্ট মুছে ফেলতে চান?")) return;
    try {
      await deleteReport(id);
      toast.success("রিপোর্ট মুছে ফেলা হয়েছে");
      loadReports();
    } catch {
      toast.error("ডিলিট ব্যর্থ");
    }
  };

  const switchToEvidence = () => {
    setActiveTab("evidence");
    // Always trigger a fresh load when switching to evidence tab
    setEvidenceRefreshKey((k) => k + 1);
    loadPendingCount();
  };

  if (!user) return <AdminLogin onLogin={() => {}} />;

  const totalPages = Math.ceil(reports.length / ADMIN_PAGE_SIZE);
  const paginated = reports.slice((page - 1) * ADMIN_PAGE_SIZE, page * ADMIN_PAGE_SIZE);

  return (
    <div className="max-w-2xl mx-auto px-4 py-4 pb-10">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="font-display font-bold text-xl">এডমিন প্যানেল</h2>
          <p className="text-xs text-muted-foreground mt-0.5">{user.email}</p>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-destructive transition-colors px-3 py-2 rounded-lg hover:bg-destructive/5"
        >
          <LogOut className="w-4 h-4" /> লগআউট
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-5 bg-muted rounded-xl p-1">
        <button
          onClick={() => setActiveTab("reports")}
          className={`flex-1 flex items-center justify-center gap-1.5 text-sm py-2.5 rounded-lg font-medium transition-all ${
            activeTab === "reports"
              ? "bg-card shadow-sm text-foreground"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <FileText className="w-4 h-4" />
          রিপোর্ট
          <span className="bg-primary/10 text-primary rounded-full px-2 py-0.5 text-[11px] leading-none font-semibold">
            {reports.length}
          </span>
        </button>
        <button
          onClick={switchToEvidence}
          className={`flex-1 flex items-center justify-center gap-1.5 text-sm py-2.5 rounded-lg font-medium transition-all ${
            activeTab === "evidence"
              ? "bg-card shadow-sm text-foreground"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Upload className="w-4 h-4" />
          পেন্ডিং প্রমাণ
          {pendingCount !== null && pendingCount > 0 && (
            <span className="bg-destructive text-destructive-foreground rounded-full px-2 py-0.5 text-[11px] leading-none font-semibold animate-pulse">
              {pendingCount}
            </span>
          )}
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === "evidence" ? (
        <PendingEvidenceSection refreshKey={evidenceRefreshKey} />
      ) : (
        <>
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent" />
              <p className="text-xs text-muted-foreground">রিপোর্ট লোড হচ্ছে...</p>
            </div>
          ) : reports.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-sm font-display text-muted-foreground">কোনো রিপোর্ট নেই</p>
            </div>
          ) : (
            <>
              <div className="space-y-2">
                {paginated.map((r) => (
                  <div key={r.id} className="bg-card rounded-xl border shadow-sm p-3">
                    {editingId === r.id ? (
                      <EditReportForm
                        report={r}
                        onSave={(data) => saveEdit(r.id, data)}
                        onCancel={() => setEditingId(null)}
                      />
                    ) : (
                      <div>
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <h3 className="font-display font-semibold text-sm line-clamp-2 leading-snug">
                              {r.title}
                            </h3>
                            <p className="text-[11px] text-muted-foreground mt-1 flex flex-wrap items-center gap-x-1.5 gap-y-0.5">
                              <span>{r.area}</span>
                              <span>·</span>
                              <span>{r.corruptionType}</span>
                              <span>·</span>
                              <span className="flex items-center gap-0.5">
                                <Clock className="w-2.5 h-2.5" />
                                {formatDate(r.createdAt)}
                              </span>
                            </p>
                          </div>
                          <div className="flex gap-1 shrink-0">
                            <button
                              onClick={() => setEditingId(r.id)}
                              className="p-1.5 hover:bg-primary/10 rounded-lg transition-colors"
                              title="সম্পাদনা"
                            >
                              <Edit className="w-4 h-4 text-muted-foreground" />
                            </button>
                            <button
                              onClick={() => handleDelete(r.id)}
                              className="p-1.5 hover:bg-destructive/10 rounded-lg transition-colors"
                              title="ডিলিট"
                            >
                              <Trash2 className="w-4 h-4 text-destructive" />
                            </button>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 text-xs mt-2 pt-2 border-t border-border/50">
                          <span className="text-vote-truth">✅ {r.votes.truth}</span>
                          <span className="text-vote-proof">❓ {r.votes.needProve}</span>
                          <span className="text-vote-fake">❌ {r.votes.fake}</span>
                          {r.evidenceLinks.length > 0 && (
                            <span className="text-muted-foreground ml-auto">📎 {r.evidenceLinks.length}টি</span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-3 mt-6">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="px-4 py-2 text-xs rounded-xl border bg-card disabled:opacity-40 hover:bg-muted transition-colors"
                  >
                    পূর্ববর্তী
                  </button>
                  <span className="text-xs text-muted-foreground font-medium">
                    {page} / {totalPages}
                  </span>
                  <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="px-4 py-2 text-xs rounded-xl border bg-card disabled:opacity-40 hover:bg-muted transition-colors"
                  >
                    পরবর্তী
                  </button>
                </div>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
}
