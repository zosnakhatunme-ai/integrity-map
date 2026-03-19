import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { Upload, MapPin, Navigation, Send, X, Plus } from "lucide-react";
import { addReport, uploadToImgBB } from "@/lib/reports";
import { CORRUPTION_TYPES } from "@/lib/constants";
import { toast } from "sonner";

function LocationPicker({ position, setPosition }: { position: [number, number] | null; setPosition: (p: [number, number]) => void }) {
  useMapEvents({
    click(e) {
      setPosition([e.latlng.lat, e.latlng.lng]);
    },
  });
  return position ? <Marker position={position} /> : null;
}

export default function AddReportPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initLat = searchParams.get("lat");
  const initLng = searchParams.get("lng");

  const [corruptionType, setCorruptionType] = useState("");
  const [area, setArea] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [position, setPosition] = useState<[number, number] | null>(
    initLat && initLng ? [parseFloat(initLat), parseFloat(initLng)] : null
  );
  const [showMap, setShowMap] = useState(false);
  const [evidenceLinks, setEvidenceLinks] = useState<string[]>([]);
  const [newLink, setNewLink] = useState("");
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleGPS = () => {
    navigator.geolocation.getCurrentPosition(
      (pos) => setPosition([pos.coords.latitude, pos.coords.longitude]),
      () => toast.error("লোকেশন পাওয়া যায়নি")
    );
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    setUploading(true);
    try {
      for (const file of Array.from(files)) {
        const url = await uploadToImgBB(file);
        setEvidenceLinks((prev) => [...prev, url]);
      }
      toast.success("ছবি আপলোড হয়েছে");
    } catch {
      toast.error("ছবি আপলোড ব্যর্থ হয়েছে");
    }
    setUploading(false);
  };

  const addLink = () => {
    if (newLink.trim()) {
      setEvidenceLinks((prev) => [...prev, newLink.trim()]);
      setNewLink("");
    }
  };

  const removeEvidence = (index: number) => {
    setEvidenceLinks((prev) => prev.filter((_, i) => i !== index));
  };

  const handleLatChange = (val: string) => {
    const lat = parseFloat(val);
    if (!isNaN(lat)) {
      setPosition((prev) => [lat, prev ? prev[1] : 90.3563]);
    }
  };

  const handleLngChange = (val: string) => {
    const lng = parseFloat(val);
    if (!isNaN(lng)) {
      setPosition((prev) => [prev ? prev[0] : 23.685, lng]);
    }
  };

  const handleSubmit = async () => {
    if (!corruptionType || !area || !title || !description || !position) {
      toast.error("সব তথ্য পূরণ করুন");
      return;
    }
    setSubmitting(true);
    try {
      await addReport({
        title,
        corruptionType,
        area,
        description,
        latitude: position[0],
        longitude: position[1],
        evidenceLinks,
      });
      toast.success("রিপোর্ট সফলভাবে পোস্ট হয়েছে! 🎉");
      navigate("/feed");
    } catch (e) {
      toast.error("রিপোর্ট পোস্ট ব্যর্থ হয়েছে");
    }
    setSubmitting(false);
  };

  return (
    <div className="max-w-lg mx-auto px-4 py-4">
      <h2 className="font-display font-bold text-xl mb-4">দুর্নীতি রিপোর্ট করুন</h2>

      <div className="space-y-4">
        {/* Corruption Type */}
        <div>
          <label className="block text-sm font-medium mb-1 font-display">দুর্নীতির ধরন *</label>
          <select
            value={corruptionType}
            onChange={(e) => setCorruptionType(e.target.value)}
            className="w-full border rounded-lg px-3 py-2.5 bg-card text-sm"
          >
            <option value="">নির্বাচন করুন</option>
            {CORRUPTION_TYPES.map((t) => (
              <option key={t.value} value={t.value}>{t.icon} {t.label}</option>
            ))}
          </select>
        </div>

        {/* Area */}
        <div>
          <label className="block text-sm font-medium mb-1 font-display">স্থান *</label>
          <input
            type="text"
            value={area}
            onChange={(e) => setArea(e.target.value)}
            placeholder="যেমন: ঢাকা, মিরপুর-১০"
            className="w-full border rounded-lg px-3 py-2.5 bg-card text-sm"
          />
        </div>

        {/* Title */}
        <div>
          <label className="block text-sm font-medium mb-1 font-display">শিরোনাম *</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="রিপোর্টের শিরোনাম লিখুন"
            className="w-full border rounded-lg px-3 py-2.5 bg-card text-sm"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium mb-1 font-display">বিবরণ *</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="দুর্নীতির বিস্তারিত বর্ণনা করুন..."
            rows={4}
            className="w-full border rounded-lg px-3 py-2.5 bg-card text-sm resize-none"
          />
        </div>

        {/* Location */}
        <div>
          <label className="block text-sm font-medium mb-1 font-display">লোকেশন *</label>
          <div className="flex gap-2 mb-2">
            <button
              type="button"
              onClick={handleGPS}
              className="flex items-center gap-1 px-3 py-2 border rounded-lg text-sm hover:bg-muted transition-colors"
            >
              <Navigation className="w-4 h-4" /> GPS লোকেশন
            </button>
            <button
              type="button"
              onClick={() => setShowMap(!showMap)}
              className="flex items-center gap-1 px-3 py-2 border rounded-lg text-sm hover:bg-muted transition-colors"
            >
              <MapPin className="w-4 h-4" /> ম্যাপ থেকে দিন
            </button>
          </div>

          {/* Lat/Lng fields */}
          <div className="grid grid-cols-2 gap-2 mb-2">
            <div>
              <label className="block text-xs text-muted-foreground mb-1">অক্ষাংশ (Latitude)</label>
              <input
                type="number"
                step="any"
                value={position ? position[0] : ""}
                onChange={(e) => handleLatChange(e.target.value)}
                placeholder="23.6850"
                className="w-full border rounded-lg px-3 py-2 bg-card text-sm"
              />
            </div>
            <div>
              <label className="block text-xs text-muted-foreground mb-1">দ্রাঘিমাংশ (Longitude)</label>
              <input
                type="number"
                step="any"
                value={position ? position[1] : ""}
                onChange={(e) => handleLngChange(e.target.value)}
                placeholder="90.3563"
                className="w-full border rounded-lg px-3 py-2 bg-card text-sm"
              />
            </div>
          </div>

          {position && (
            <p className="text-xs text-muted-foreground mb-2">
              📍 {position[0].toFixed(6)}, {position[1].toFixed(6)}
            </p>
          )}
          {showMap && (
            <div className="h-48 rounded-lg overflow-hidden border mb-2">
              <MapContainer
                center={position || [23.685, 90.3563]}
                zoom={position ? 14 : 7}
                className="w-full h-full"
                zoomControl={false}
              >
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                <LocationPicker position={position} setPosition={setPosition} />
              </MapContainer>
            </div>
          )}
        </div>

        {/* Evidence */}
        <div>
          <label className="block text-sm font-medium mb-1 font-display">প্রমাণ</label>
          <div className="flex gap-2 mb-2">
            <label className="flex items-center gap-1 px-3 py-2 border rounded-lg text-sm cursor-pointer hover:bg-muted transition-colors">
              <Upload className="w-4 h-4" /> ছবি আপলোড
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageUpload}
                className="hidden"
              />
            </label>
          </div>
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              value={newLink}
              onChange={(e) => setNewLink(e.target.value)}
              placeholder="মিডিয়া লিংক পেস্ট করুন"
              className="flex-1 border rounded-lg px-3 py-2 bg-card text-sm"
            />
            <button
              type="button"
              onClick={addLink}
              className="px-3 py-2 border rounded-lg hover:bg-muted transition-colors"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
          {uploading && <p className="text-xs text-muted-foreground">আপলোড হচ্ছে...</p>}
          {evidenceLinks.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {evidenceLinks.map((link, i) => (
                <div key={i} className="relative group">
                  {link.match(/\.(jpg|jpeg|png|gif|webp)/i) ? (
                    <img src={link} alt="" className="w-16 h-16 object-cover rounded-md border" />
                  ) : (
                    <div className="w-16 h-16 rounded-md border flex items-center justify-center text-xs p-1 text-primary truncate">
                      🔗
                    </div>
                  )}
                  <button
                    onClick={() => removeEvidence(i)}
                    className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground rounded-full w-5 h-5 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Submit */}
        <button
          onClick={handleSubmit}
          disabled={submitting}
          className="w-full py-3 bg-primary text-primary-foreground rounded-lg font-display font-semibold text-base flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {submitting ? (
            <div className="animate-spin rounded-full h-5 w-5 border-2 border-primary-foreground border-t-transparent" />
          ) : (
            <>
              <Send className="w-5 h-5" /> রিপোর্ট পোস্ট করুন
            </>
          )}
        </button>
      </div>
    </div>
  );
}
