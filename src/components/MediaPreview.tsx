import { useState } from "react";
import { X, ExternalLink, Play, Image as ImageIcon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface MediaPreviewProps {
  url: string;
  onClose: () => void;
}

export function MediaPreview({ url, onClose }: MediaPreviewProps) {
  const isVideo = url.match(/\.(mp4|webm|ogg)/i) || url.includes("youtube") || url.includes("youtu.be");
  const isImage = url.match(/\.(jpg|jpeg|png|gif|webp|avif)/i);

  let embedUrl = url;
  if (url.includes("youtu.be/")) {
    const id = url.split("youtu.be/")[1]?.split("?")[0];
    embedUrl = `https://www.youtube.com/embed/${id}`;
  } else if (url.includes("youtube.com/watch")) {
    const id = new URL(url).searchParams.get("v");
    embedUrl = `https://www.youtube.com/embed/${id}`;
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[2000] bg-black/90 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/70 transition-colors"
        >
          <X className="w-6 h-6" />
        </button>
        <div onClick={(e) => e.stopPropagation()} className="max-w-4xl max-h-[90vh] w-full">
          {isImage ? (
            <img src={url} alt="প্রমাণ" className="w-full h-auto max-h-[85vh] object-contain rounded-lg" />
          ) : isVideo ? (
            url.includes("youtube") || url.includes("youtu.be") ? (
              <div className="relative w-full" style={{ paddingBottom: "56.25%" }}>
                <iframe
                  src={embedUrl}
                  className="absolute inset-0 w-full h-full rounded-lg"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            ) : (
              <video src={url} controls className="w-full max-h-[85vh] rounded-lg" />
            )
          ) : (
            <div className="bg-card rounded-lg p-6 text-center">
              <p className="text-sm text-muted-foreground mb-3">এই মিডিয়া প্রিভিউ করা যাচ্ছে না</p>
              <a href={url} target="_blank" rel="noopener noreferrer" className="text-primary underline text-sm">
                লিংক খুলুন ↗
              </a>
            </div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

interface EvidenceGridProps {
  links: string[];
}

export function EvidenceGrid({ links }: EvidenceGridProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  if (links.length === 0) return null;

  const isImage = (url: string) => url.match(/\.(jpg|jpeg|png|gif|webp|avif)/i);
  const isVideo = (url: string) => url.match(/\.(mp4|webm|ogg)/i) || url.includes("youtube") || url.includes("youtu.be");

  const getYouTubeThumbnail = (url: string) => {
    let id = "";
    if (url.includes("youtu.be/")) {
      id = url.split("youtu.be/")[1]?.split("?")[0] || "";
    } else if (url.includes("youtube.com/watch")) {
      id = new URL(url).searchParams.get("v") || "";
    }
    return id ? `https://img.youtube.com/vi/${id}/mqdefault.jpg` : null;
  };

  const gridCols = links.length === 1 ? "grid-cols-1" : links.length === 2 ? "grid-cols-2" : "grid-cols-2 sm:grid-cols-3";

  return (
    <>
      <div className={`grid ${gridCols} gap-2`}>
        {links.map((link, i) => (
          <button
            key={i}
            onClick={(e) => { e.stopPropagation(); setPreviewUrl(link); }}
            className="block rounded-xl overflow-hidden border-2 border-border hover:border-primary transition-all text-left relative group shadow-sm hover:shadow-md"
          >
            {isImage(link) ? (
              <div className="relative">
                <img src={link} alt={`প্রমাণ ${i + 1}`} className="w-full h-32 object-cover" loading="lazy" />
                <div className="absolute top-2 left-2 bg-black/50 text-white rounded-full px-2 py-0.5 text-[10px] flex items-center gap-1">
                  <ImageIcon className="w-3 h-3" /> ছবি
                </div>
              </div>
            ) : isVideo(link) ? (
              <div className="relative">
                {getYouTubeThumbnail(link) ? (
                  <img src={getYouTubeThumbnail(link)!} alt="ভিডিও" className="w-full h-32 object-cover" />
                ) : (
                  <div className="w-full h-32 bg-muted flex items-center justify-center">
                    <span className="text-2xl">🎬</span>
                  </div>
                )}
                <div className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/40 transition-colors">
                  <div className="w-10 h-10 rounded-full bg-white/90 flex items-center justify-center shadow-lg">
                    <Play className="w-5 h-5 text-primary ml-0.5" fill="currentColor" />
                  </div>
                </div>
                <div className="absolute top-2 left-2 bg-black/50 text-white rounded-full px-2 py-0.5 text-[10px] flex items-center gap-1">
                  <Play className="w-3 h-3" /> ভিডিও
                </div>
              </div>
            ) : (
              <div className="p-3 h-32 flex flex-col items-center justify-center gap-2 bg-muted/50">
                <ExternalLink className="w-6 h-6 text-primary" />
                <span className="text-xs text-primary text-center line-clamp-2">
                  {link.length > 40 ? link.slice(0, 40) + "..." : link}
                </span>
              </div>
            )}
          </button>
        ))}
      </div>

      {previewUrl && (
        <MediaPreview url={previewUrl} onClose={() => setPreviewUrl(null)} />
      )}
    </>
  );
}
