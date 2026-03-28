import { useState, useEffect } from "react";
import { signInWithEmailAndPassword, signOut, onAuthStateChanged, User } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { fetchReports, updateReport, deleteReport } from "@/lib/reports";
import { CORRUPTION_TYPES } from "@/lib/constants";
import { formatDate } from "@/lib/helpers";
import { Trash2, Edit, Save, X, LogOut, Plus, Minus } from "lucide-react";
import { toast } from "sonner";
import type { Report } from "@/lib/types";

const ADMIN_PAGE_SIZE = 15;

function AdminLogin({ onLogin }: { onLogin: () => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      toast.success("লগইন সফল");
      onLogin();
    } catch {
      toast.error("লগইন ব্যর্থ");
    }
  };

  return (
    <div className="max-w-sm mx-auto px-4 py-12">
      <h2 className="font-display font-bold text-xl mb-6 text-center">এডমিন লগইন</h2>
      <div className="space-y-3">
        <input type="email" placeholder="ইমেইল" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full border rounded-lg px-3 py-2.5 bg-card text-sm" />
        <input type="password" placeholder="পাসওয়ার্ড" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full border rounded-lg px-3 py-2.5 bg-card text-sm" onKeyDown={(e) => e.key === "Enter" && handleLogin()} />
        <button onClick={handleLogin} className="w-full py-2.5 bg-primary text-primary-foreground rounded-lg font-display font-semibold">লগইন</button>
      </div>
    </div>
  );
}

function EditReportForm({ report, onSave, onCancel }: { report: Report; onSave: (data: Partial<Report>) => void; onCancel: () => void }) {
  const [data, setData] = useState({
    title: report.title,
    corruptionType: report.corruptionType,
    area: report.area,
    description: report.description,
    latitude: report.latitude,
    longitude: report.longitude,
    evidenceLinks: [...report.evidenceLinks],
    votes: { ...report.votes },
  });
  const [newLink, setNewLink] = useState("");

  const addLink = () => {
    if (newLink.trim()) {
      setData({ ...data, evidenceLinks: [...data.evidenceLinks, newLink.trim()] });
      setNewLink("");
    }
  };

  const removeLink = (idx: number) => {
    setData({ ...data, evidenceLinks: data.evidenceLinks.filter((_, i) => i !== idx) });
  };

  return (
    <div className="space-y-3">
      <div>
        <label className="text-xs font-medium text-muted-foreground">শিরোনাম</label>
        <input value={data.title} onChange={(e) => setData({ ...data, title: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm bg-background mt-1" />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="text-xs font-medium text-muted-foreground">দুর্নীতির ধরন</label>
          <select value={data.corruptionType} onChange={(e) => setData({ ...data, corruptionType: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm bg-background mt-1">
            {CORRUPTION_TYPES.map((t) => (
              <option key={t.value} value={t.value}>{t.icon} {t.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-xs font-medium text-muted-foreground">স্থান</label>
          <input value={data.area} onChange={(e) => setData({ ...data, area: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm bg-background mt-1" />
        </div>
      </div>
      <div>
        <label className="text-xs font-medium text-muted-foreground">বিবরণ</label>
        <textarea value={data.description} onChange={(e) => setData({ ...data, description: e.target.value })} rows={3} className="w-full border rounded-lg px-3 py-2 text-sm bg-background mt-1" />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="text-xs font-medium text-muted-foreground">অক্ষাংশ</label>
          <input type="number" step="any" value={data.latitude} onChange={(e) => setData({ ...data, latitude: parseFloat(e.target.value) || 0 })} className="w-full border rounded-lg px-3 py-2 text-sm bg-background mt-1" />
        </div>
        <div>
          <label className="text-xs font-medium text-muted-foreground">দ্রাঘিমাংশ</label>
          <input type="number" step="any" value={data.longitude} onChange={(e) => setData({ ...data, longitude: parseFloat(e.target.value) || 0 })} className="w-full border rounded-lg px-3 py-2 text-sm bg-background mt-1" />
        </div>
      </div>
      <div>
        <label className="text-xs font-medium text-muted-foreground">ভোট কাউন্ট</label>
        <div className="grid grid-cols-3 gap-2 mt-1">
          <div className="flex items-center gap-1 border rounded-lg px-2 py-1.5">
            <span className="text-xs text-vote-truth">✅</span>
            <input type="number" min={0} value={data.votes.truth} onChange={(e) => setData({ ...data, votes: { ...data.votes, truth: parseInt(e.target.value) || 0 } })} className="w-full text-sm bg-transparent text-center" />
          </div>
          <div className="flex items-center gap-1 border rounded-lg px-2 py-1.5">
            <span className="text-xs text-vote-proof">❓</span>
            <input type="number" min={0} value={data.votes.needProve} onChange={(e) => setData({ ...data, votes: { ...data.votes, needProve: parseInt(e.target.value) || 0 } })} className="w-full text-sm bg-transparent text-center" />
          </div>
          <div className="flex items-center gap-1 border rounded-lg px-2 py-1.5">
            <span className="text-xs text-vote-fake">❌</span>
            <input type="number" min={0} value={data.votes.fake} onChange={(e) => setData({ ...data, votes: { ...data.votes, fake: parseInt(e.target.value) || 0 } })} className="w-full text-sm bg-transparent text-center" />
          </div>
        </div>
      </div>
      <div>
        <label className="text-xs font-medium text-muted-foreground">প্রমাণ লিংক</label>
        <div className="space-y-1.5 mt-1">
          {data.evidenceLinks.map((link, idx) => (
            <div key={idx} className="flex items-center gap-1.5">
              <input value={link} onChange={(e) => {
                const updated = [...data.evidenceLinks];
                updated[idx] = e.target.value;
                setData({ ...data, evidenceLinks: updated });
              }} className="flex-1 border rounded-lg px-2 py-1.5 text-xs bg-background truncate" />
              <button onClick={() => removeLink(idx)} className="p-1 text-destructive hover:bg-destructive/10 rounded">
                <Minus className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
          <div className="flex items-center gap-1.5">
            <input value={newLink} onChange={(e) => setNewLink(e.target.value)} placeholder="নতুন লিংক যোগ করুন..." className="flex-1 border rounded-lg px-2 py-1.5 text-xs bg-background" onKeyDown={(e) => e.key === "Enter" && addLink()} />
            <button onClick={addLink} className="p-1 text-vote-truth hover:bg-vote-truth/10 rounded">
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
      <div className="flex gap-2 pt-2">
        <button onClick={() => onSave(data)} className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-vote-truth text-vote-truth-foreground rounded-lg text-sm font-medium">
          <Save className="w-4 h-4" /> সেভ করুন
        </button>
        <button onClick={onCancel} className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 border rounded-lg text-sm font-medium">
          <X className="w-4 h-4" /> বাতিল
        </button>
      </div>
    </div>
  );
}

export default function AdminPage() {
  const [user, setUser] = useState<User | null>(null);
  const [reports, setReports] = useState<Report[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => setUser(u));
    return unsub;
  }, []);

  useEffect(() => {
    if (user) loadReports();
  }, [user]);

  const loadReports = async () => {
    setLoading(true);
    const r = await fetchReports();
    setReports(r);
    setLoading(false);
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

  if (!user) {
    return <AdminLogin onLogin={() => {}} />;
  }

  const totalPages = Math.ceil(reports.length / ADMIN_PAGE_SIZE);
  const paginated = reports.slice((page - 1) * ADMIN_PAGE_SIZE, page * ADMIN_PAGE_SIZE);

  return (
    <div className="max-w-2xl mx-auto px-3 py-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-display font-bold text-lg">এডমিন প্যানেল</h2>
        <button onClick={handleLogout} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-destructive transition-colors">
          <LogOut className="w-4 h-4" /> লগআউট
        </button>
      </div>

      <p className="text-xs text-muted-foreground mb-3">মোট রিপোর্ট: {reports.length}</p>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent" />
        </div>
      ) : (
        <>
          <div className="space-y-3">
            {paginated.map((r) => (
              <div key={r.id} className="bg-card rounded-lg border p-3">
                {editingId === r.id ? (
                  <EditReportForm report={r} onSave={(data) => saveEdit(r.id, data)} onCancel={() => setEditingId(null)} />
                ) : (
                  <div>
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-display font-semibold text-sm truncate">{r.title}</h3>
                        <p className="text-xs text-muted-foreground mt-0.5">{r.area} · {r.corruptionType} · {formatDate(r.createdAt)}</p>
                      </div>
                      <div className="flex gap-1 shrink-0 ml-2">
                        <button onClick={() => setEditingId(r.id)} className="p-1.5 hover:bg-muted rounded transition-colors">
                          <Edit className="w-4 h-4 text-muted-foreground" />
                        </button>
                        <button onClick={() => handleDelete(r.id)} className="p-1.5 hover:bg-destructive/10 rounded transition-colors">
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </button>
                      </div>
                    </div>
                    <div className="flex gap-3 text-xs mt-1.5">
                      <span className="text-vote-truth">✅ {r.votes.truth}</span>
                      <span className="text-vote-proof">❓ {r.votes.needProve}</span>
                      <span className="text-vote-fake">❌ {r.votes.fake}</span>
                    </div>
                    {r.evidenceLinks.length > 0 && (
                      <p className="text-[10px] text-muted-foreground mt-1">📎 {r.evidenceLinks.length}টি প্রমাণ</p>
                    )}
                  </div>
                )}
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
              <span className="text-xs text-muted-foreground">
                {page} / {totalPages}
              </span>
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
