export interface Report {
  id: string;
  title: string;
  corruptionType: string;
  area: string;
  description: string;
  latitude: number;
  longitude: number;
  evidenceLinks: string[];
  votes: {
    truth: number;
    needProve: number;
    fake: number;
  };
  createdAt: Date;
}

export type VoteType = "truth" | "needProve" | "fake";

export interface PendingEvidence {
  id: string;
  reportId: string;
  reportTitle: string;
  url: string;
  status: "pending" | "approved" | "rejected";
  createdAt: Date;
}
