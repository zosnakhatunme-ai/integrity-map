import { useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle, HelpCircle, XCircle } from "lucide-react";
import type { VoteType } from "@/lib/types";
import { voteReport, getVotedReports, setVotedReport } from "@/lib/reports";

interface VoteButtonsProps {
  reportId: string;
  votes: { truth: number; needProve: number; fake: number };
}

export function VoteButtons({ reportId, votes }: VoteButtonsProps) {
  const [voted, setVoted] = useState<VoteType | null>(
    getVotedReports()[reportId] || null
  );
  const [localVotes, setLocalVotes] = useState(votes);

  const handleVote = async (type: VoteType, e: React.MouseEvent) => {
    e.stopPropagation();
    if (voted) return;
    setVoted(type);
    setLocalVotes((v) => ({ ...v, [type]: v[type] + 1 }));
    setVotedReport(reportId, type);
    try {
      await voteReport(reportId, type);
    } catch (err) {
      console.error("Vote failed", err);
    }
  };

  const buttons: { type: VoteType; label: string; icon: typeof CheckCircle; colorClass: string; activeClass: string }[] = [
    {
      type: "truth",
      label: "সত্য",
      icon: CheckCircle,
      colorClass: "border-vote-truth text-vote-truth hover:bg-vote-truth hover:text-vote-truth-foreground",
      activeClass: "bg-vote-truth text-vote-truth-foreground",
    },
    {
      type: "needProve",
      label: "প্রমাণ চাই",
      icon: HelpCircle,
      colorClass: "border-vote-proof text-vote-proof hover:bg-vote-proof hover:text-vote-proof-foreground",
      activeClass: "bg-vote-proof text-vote-proof-foreground",
    },
    {
      type: "fake",
      label: "মিথ্যা",
      icon: XCircle,
      colorClass: "border-vote-fake text-vote-fake hover:bg-vote-fake hover:text-vote-fake-foreground",
      activeClass: "bg-vote-fake text-vote-fake-foreground",
    },
  ];

  return (
    <div className="flex gap-1.5 w-full">
      {buttons.map((b) => {
        const isActive = voted === b.type;
        const Icon = b.icon;
        return (
          <motion.button
            key={b.type}
            whileTap={{ scale: 0.93 }}
            onClick={(e) => handleVote(b.type, e)}
            disabled={!!voted}
            className={`flex-1 flex items-center justify-center gap-1 px-1.5 py-1.5 rounded-full border text-xs font-medium transition-colors whitespace-nowrap ${
              isActive ? b.activeClass : voted ? "opacity-50 border-border text-muted-foreground cursor-default" : b.colorClass
            }`}
          >
            <Icon className="w-3.5 h-3.5 shrink-0" />
            <span className="font-display">{b.label}</span>
            <span className="text-[10px] opacity-80">({localVotes[b.type]})</span>
          </motion.button>
        );
      })}
    </div>
  );
}
