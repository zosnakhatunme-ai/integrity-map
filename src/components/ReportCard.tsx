import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronDown, ChevronUp, MapPin, Share2, Eye } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { VoteButtons } from "./VoteButtons";
import { EvidenceGrid } from "./MediaPreview";
import { AnonAvatar } from "./AnonAvatar";
import type { Report } from "@/lib/types";
import { getAnonymousName, formatDate, getShareText } from "@/lib/helpers";

interface ReportCardProps {
  report: Report;
}

export function ReportCard({ report }: ReportCardProps) {
  const [expanded, setExpanded] = useState(false);
  const navigate = useNavigate();
  const anonName = getAnonymousName(report.id);

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    const text = getShareText(report.title);
    const url = `${window.location.origin}/report/${report.id}`;
    if (navigator.share) {
      navigator.share({ title: "চোর কই", text, url });
    } else {
      navigator.clipboard.writeText(`${text}\n${url}`);
    }
  };

  const handleMap = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/?lat=${report.latitude}&lng=${report.longitude}&id=${report.id}`);
  };

  return (
    <div className="bg-card rounded-xl border shadow-sm overflow-hidden hover:shadow-md transition-shadow">
      <div className="p-4">
        <div className="flex items-center gap-2.5 mb-2.5">
          <AnonAvatar id={report.id} size={36} />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold truncate font-display text-primary">
              {anonName}
            </p>
            <p className="text-xs text-muted-foreground">
              {formatDate(report.createdAt)}
            </p>
          </div>
          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-primary/10 text-primary rounded-full text-xs font-medium shrink-0">
            {report.corruptionType}
          </span>
        </div>

        <div className="flex items-center gap-1 text-xs text-muted-foreground mb-2">
          <MapPin className="w-3 h-3 shrink-0" />
          <span className="truncate">{report.area}</span>
        </div>

        <h3 className="font-display font-semibold text-base mb-3">
          {report.title}
        </h3>

        <div className="mb-3">
          <VoteButtons reportId={report.id} votes={report.votes} />
        </div>

        <div className="flex items-center gap-1 pt-2 border-t">
          <button
            onClick={handleShare}
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors px-2 py-1.5 rounded"
          >
            <Share2 className="w-3.5 h-3.5" /> শেয়ার
          </button>
          <button
            onClick={handleMap}
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors px-2 py-1.5 rounded"
          >
            <MapPin className="w-3.5 h-3.5" /> ম্যাপ
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); navigate(`/report/${report.id}`); }}
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors px-2 py-1.5 rounded"
          >
            <Eye className="w-3.5 h-3.5" /> বিস্তারিত
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); setExpanded(!expanded); }}
            className="ml-auto flex items-center gap-1 text-xs text-primary font-medium px-2 py-1.5 rounded hover:bg-primary/5 transition-colors"
          >
            {expanded ? (
              <>সংক্ষেপ <ChevronUp className="w-3.5 h-3.5" /></>
            ) : (
              <>আরো <ChevronDown className="w-3.5 h-3.5" /></>
            )}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 border-t pt-3">
              <p className="text-sm text-foreground mb-3">{report.description}</p>
              {report.evidenceLinks.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-2 font-display">প্রমাণসমূহ:</p>
                  <EvidenceGrid links={report.evidenceLinks} />
                </div>
              )}
              <button
                onClick={() => navigate(`/report/${report.id}`)}
                className="mt-3 w-full py-2 text-sm font-medium text-primary-foreground bg-primary rounded-lg hover:opacity-90 transition-opacity"
              >
                বিস্তারিত দেখুন
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
