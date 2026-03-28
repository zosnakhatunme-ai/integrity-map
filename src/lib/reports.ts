import {
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  increment,
  Timestamp,
  getDoc,
  where,
} from "firebase/firestore";
import { db } from "./firebase";
import type { Report, VoteType, PendingEvidence } from "./types";

const REPORTS_COL = "reports";
const PENDING_EVIDENCE_COL = "pending_evidence";

function mapDocToReport(id: string, data: any): Report {
  return {
    id,
    title: data.title || "",
    corruptionType: data.corruptionType || "",
    area: data.area || data.locationName || "",
    description: data.description || "",
    latitude: data.latitude || 0,
    longitude: data.longitude || 0,
    evidenceLinks: data.evidenceLinks || [],
    votes: {
      truth: data.votes?.truth || 0,
      needProve: data.votes?.needProve || 0,
      fake: data.votes?.fake || 0,
    },
    createdAt: data.createdAt?.toDate?.() || new Date(),
  };
}

export async function fetchReports(): Promise<Report[]> {
  const q = query(collection(db, REPORTS_COL), orderBy("createdAt", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => mapDocToReport(d.id, d.data()));
}

export async function fetchReport(id: string): Promise<Report | null> {
  const snap = await getDoc(doc(db, REPORTS_COL, id));
  if (!snap.exists()) return null;
  return mapDocToReport(snap.id, snap.data());
}

export async function addReport(
  report: Omit<Report, "id" | "votes" | "createdAt">
) {
  return addDoc(collection(db, REPORTS_COL), {
    ...report,
    votes: { truth: 0, needProve: 0, fake: 0 },
    createdAt: Timestamp.now(),
  });
}

export async function voteReport(reportId: string, voteType: VoteType) {
  const ref = doc(db, REPORTS_COL, reportId);
  await updateDoc(ref, {
    [`votes.${voteType}`]: increment(1),
  });
}

/**
 * Update any fields of a report including createdAt.
 * If createdAt is a plain JS Date, it is converted to a Firestore Timestamp
 * so it saves and sorts correctly in Firestore.
 */
export async function updateReport(
  reportId: string,
  data: Partial<Report>
) {
  const ref = doc(db, REPORTS_COL, reportId);

  // Build the payload — convert Date → Timestamp so Firestore stores it correctly
  const payload: Record<string, unknown> = { ...data };
  if (payload.createdAt instanceof Date) {
    payload.createdAt = Timestamp.fromDate(payload.createdAt);
  }
  // Remove the id field if accidentally included
  delete payload.id;

  await updateDoc(ref, payload);
}

export async function deleteReport(reportId: string) {
  await deleteDoc(doc(db, REPORTS_COL, reportId));
}

export function getVotedReports(): Record<string, VoteType> {
  try {
    return JSON.parse(localStorage.getItem("chor_koi_votes") || "{}");
  } catch {
    return {};
  }
}

export function setVotedReport(reportId: string, voteType: VoteType) {
  const votes = getVotedReports();
  votes[reportId] = voteType;
  localStorage.setItem("chor_koi_votes", JSON.stringify(votes));
}

export async function uploadToImgBB(file: File): Promise<string> {
  const formData = new FormData();
  formData.append("image", file);
  const res = await fetch(
    `https://api.imgbb.com/1/upload?key=d685822691566e39accb630d6ef7a6d9`,
    { method: "POST", body: formData }
  );
  const json = await res.json();
  if (json.success) return json.data.url;
  throw new Error("Image upload failed");
}

// --- Pending Evidence ---

export async function submitPendingEvidence(
  reportId: string,
  reportTitle: string,
  url: string
) {
  return addDoc(collection(db, PENDING_EVIDENCE_COL), {
    reportId,
    reportTitle,
    url,
    status: "pending",
    createdAt: Timestamp.now(),
  });
}

export async function fetchPendingEvidence(): Promise<PendingEvidence[]> {
  const q = query(
    collection(db, PENDING_EVIDENCE_COL),
    where("status", "==", "pending"),
    orderBy("createdAt", "desc")
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => {
    const data = d.data();
    return {
      id: d.id,
      reportId: data.reportId || "",
      reportTitle: data.reportTitle || "",
      url: data.url || "",
      status: data.status || "pending",
      createdAt: data.createdAt?.toDate?.() || new Date(),
    } as PendingEvidence;
  });
}

export async function approvePendingEvidence(
  evidenceId: string,
  reportId: string,
  evidenceUrl: string
) {
  await updateDoc(doc(db, PENDING_EVIDENCE_COL, evidenceId), { status: "approved" });
  const report = await fetchReport(reportId);
  if (report) {
    const updated = [...report.evidenceLinks, evidenceUrl];
    await updateDoc(doc(db, REPORTS_COL, reportId), { evidenceLinks: updated });
  }
}

export async function rejectPendingEvidence(evidenceId: string) {
  await updateDoc(doc(db, PENDING_EVIDENCE_COL, evidenceId), { status: "rejected" });
}
