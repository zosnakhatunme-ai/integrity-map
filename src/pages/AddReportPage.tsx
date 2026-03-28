import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { Upload, MapPin, Navigation, Send, X, Plus, AlertTriangle, FileText, MapPinned, Camera, Link2 } from "lucide-react";
import { addReport, uploadToImgBB } from "@/lib/reports";
import { CORRUPTION_TYPES } from "@/lib/constants";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

function LocationPicker({ position, setPosition }: { position: [number, number] | null; setPosition: (p: [number, number]) => void }) {
  useMapEvents({
    click(e) {
      setPosition([e.latlng.lat, e.latlng.lng]);
    },
  });
  return position ? <Marker position={position} /> : null;
}

function StepIndicator({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex items-center gap-1.5 mb-6">
      {Array.from({ length: total }, (_, i) => (
        <div key={i} className="flex items-center gap-1.5">
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
              i < current
                ? "bg-primary text-primary-foreground"
                : i === current
                ? "bg-primary text-primary-foreground ring-4 ring-primary/20"
                : "bg-muted text-muted-foreground"
            }`}
          >
            {i < current ? "✓" : i + 1}
          </div>
          {i < total - 1 && (
            <div className={`h-0.5 w-6 sm:w-10 rounded-full transition-colors duration-300 ${i < current ? "bg-primary" : "bg-muted"}`} />
          )}
        </div>
      ))}
    </div>
  );
}

export default function AddReportPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initLat = searchParams.get("lat");
  const initLng = searchParams.get("lng");

  const [step, setStep] = useState(0);
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
    if (!isNaN(lat)) setPosition((prev) => [lat, prev ? prev[1] : 90.3563]);
  };

  const handleLngChange = (val: string) => {
    const lng = parseFloat(val);
    if (!isNaN(lng)) setPosition((prev) => [prev ? prev[0] : 23.685, lng]);
  };

  const validateStep = () => {
    if (step === 0 && !corruptionType) { toast.error("দুর্নীতির ধরন নির্বাচন করুন"); return false; }
    if (step === 1 && (!title || !area)) { toast.error("শিরোনাম ও স্থান পূরণ করুন"); return false; }
    if (step === 2 && !description) { toast.error("বিবরণ পূরণ করুন"); return false; }
    if (step === 3 && !position) { toast.error("লোকেশন নির্বাচন করুন"); return false; }
    return true;
  };

  const nextStep = () => {
    if (validateStep()) setStep((s) => Math.min(s + 1, 4));
  };

  const prevStep = () => setStep((s) => Math.max(s - 1, 0));

  const handleSubmit = async () => {
    if (!corruptionType || !area || !title || !description || !position) {
      toast.error("সব তথ্য পূরণ করুন");
      return;
    }
    setSubmitting(true);
    try {
      await addReport({
        title, corruptionType, area, description,
        latitude: position[0], longitude: position[1], evidenceLinks,
      });
      toast.success("রিপোর্ট সফলভাবে পোস্ট হয়েছে! 🎉");
      navigate("/feed");
    } catch {
      toast.error("রিপোর্ট পোস্ট ব্যর্থ হয়েছে");
    }
    setSubmitting(false);
  };

  const stepLabels = ["ধরন", "তথ্য", "বিবরণ", "লোকেশন", "প্রমাণ"];
  const stepIcons = [AlertTriangle, FileText, FileText, MapPinned, Camera];

  return (
    <div className="max-w-lg mx-auto px-4 py-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-6"
      >
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-semibold mb-3">
          <AlertTriangle className="w-4 h-4" />
          দুর্নীতি রিপোর্ট
        </div>
        <h2 className="font-display font-bold text-xl">দুর্নীতি রিপোর্ট করুন</h2>
        <p className="text-sm text-muted-foreground mt-1">আপনার পরিচয় সম্পূর্ণ গোপন থাকবে</p>
      </motion.div>

      {/* Step indicator */}
      <div className="flex justify-center">
        <StepIndicator current={step} total={5} />
      </div>

      {/* Step title */}
      <div className="flex items-center gap-2 mb-4">
        {(() => { const Icon = stepIcons[step]; return <Icon className="w-5 h-5 text-primary" />; })()}
        <h3 className="font-display font-semibold text-base">{stepLabels[step]}</h3>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.2 }}
        >
          {/* Step 0: Corruption Type */}
          {step === 0 && (
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground mb-3">কোন ধরনের দুর্নীতি দেখেছেন?</p>
              <div className="grid grid-cols-2 gap-2">
                {CORRUPTION_TYPES.map((t) => (
                  <button
                    key={t.value}
                    onClick={() => setCorruptionType(t.value)}
                    className={`flex items-center gap-2 px-3 py-3 rounded-xl border-2 text-sm font-medium transition-all text-left ${
                      corruptionType === t.value
                        ? "border-primary bg-primary/10 text-primary shadow-sm"
                        : "border-border bg-card hover:border-primary/30 hover:bg-muted"
                    }`}
                  >
                    <span className="text-lg">{t.icon}</span>
                    <span className="font-display leading-tight">{t.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 1: Title & Area */}
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1.5 font-display">শিরোনাম *</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="রিপোর্টের শিরোনাম লিখুন"
                  className="w-full border-2 rounded-xl px-4 py-3 bg-card text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5 font-display">স্থান *</label>
                <input
                  type="text"
                  value={area}
                  onChange={(e) => setArea(e.target.value)}
                  placeholder="যেমন: ঢাকা, মিরপুর-১০"
                  className="w-full border-2 rounded-xl px-4 py-3 bg-card text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                />
              </div>
            </div>
          )}

          {/* Step 2: Description */}
          {step === 2 && (
            <div>
              <label className="block text-sm font-medium mb-1.5 font-display">বিস্তারিত বিবরণ *</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="দুর্নীতির বিস্তারিত বর্ণনা করুন... কী ঘটেছে, কোথায়, কে জড়িত ইত্যাদি"
                rows={6}
                className="w-full border-2 rounded-xl px-4 py-3 bg-card text-sm resize-none focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
              />
              <p className="text-xs text-muted-foreground mt-2">
                💡 যত বিস্তারিত লিখবেন, রিপোর্ট তত শক্তিশালী হবে
              </p>
            </div>
          )}

          {/* Step 3: Location */}
          {step === 3 && (
            <div className="space-y-3">
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleGPS}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 border-2 rounded-xl text-sm font-medium hover:bg-muted transition-all hover:border-primary/30"
                >
                  <Navigation className="w-4 h-4 text-primary" /> GPS লোকেশন
                </button>
                <button
                  type="button"
                  onClick={() => setShowMap(!showMap)}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 border-2 rounded-xl text-sm font-medium hover:bg-muted transition-all hover:border-primary/30"
                >
                  <MapPin className="w-4 h-4 text-primary" /> ম্যাপ থেকে
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs text-muted-foreground mb-1">অক্ষাংশ</label>
                  <input
                    type="number"
                    step="any"
                    value={position ? position[0] : ""}
                    onChange={(e) => handleLatChange(e.target.value)}
                    placeholder="23.6850"
                    className="w-full border-2 rounded-xl px-3 py-2.5 bg-card text-sm focus:border-primary outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs text-muted-foreground mb-1">দ্রাঘিমাংশ</label>
                  <input
                    type="number"
                    step="any"
                    value={position ? position[1] : ""}
                    onChange={(e) => handleLngChange(e.target.value)}
                    placeholder="90.3563"
                    className="w-full border-2 rounded-xl px-3 py-2.5 bg-card text-sm focus:border-primary outline-none transition-all"
                  />
                </div>
              </div>

              {position && (
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-primary/5 border border-primary/20">
                  <MapPin className="w-4 h-4 text-primary" />
                  <span className="text-xs font-medium text-primary">
                    {position[0].toFixed(6)}, {position[1].toFixed(6)}
                  </span>
                </div>
              )}

              {showMap && (
                <div className="h-52 rounded-xl overflow-hidden border-2">
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
          )}

          {/* Step 4: Evidence */}
          {step === 4 && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">প্রমাণ যুক্ত করুন (ঐচ্ছিক কিন্তু গুরুত্বপূর্ণ)</p>

              <div className="grid grid-cols-2 gap-2">
                <label className="flex flex-col items-center justify-center gap-2 px-4 py-6 border-2 border-dashed rounded-xl cursor-pointer hover:bg-muted hover:border-primary/30 transition-all">
                  <Camera className="w-6 h-6 text-primary" />
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
                  onClick={() => document.getElementById("link-input")?.focus()}
                  className="flex flex-col items-center justify-center gap-2 px-4 py-6 border-2 border-dashed rounded-xl cursor-pointer hover:bg-muted hover:border-primary/30 transition-all"
                >
                  <Link2 className="w-6 h-6 text-primary" />
                  <span className="text-xs font-medium font-display">লিংক যুক্ত</span>
                </div>
              </div>

              <div className="flex gap-2">
                <input
                  id="link-input"
                  type="text"
                  value={newLink}
                  onChange={(e) => setNewLink(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addLink()}
                  placeholder="মিডিয়া লিংক পেস্ট করুন"
                  className="flex-1 border-2 rounded-xl px-4 py-2.5 bg-card text-sm focus:border-primary outline-none transition-all"
                />
                <button
                  type="button"
                  onClick={addLink}
                  className="px-3 py-2.5 bg-primary text-primary-foreground rounded-xl hover:opacity-90 transition-opacity"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              {uploading && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary border-t-transparent" />
                  আপলোড হচ্ছে...
                </div>
              )}

              {evidenceLinks.length > 0 && (
                <div className="grid grid-cols-3 gap-2">
                  {evidenceLinks.map((link, i) => (
                    <div key={i} className="relative group aspect-square">
                      {link.match(/\.(jpg|jpeg|png|gif|webp)/i) ? (
                        <img src={link} alt="" className="w-full h-full object-cover rounded-xl border-2" />
                      ) : (
                        <div className="w-full h-full rounded-xl border-2 flex flex-col items-center justify-center text-xs p-2 bg-muted">
                          <Link2 className="w-5 h-5 text-primary mb-1" />
                          <span className="truncate w-full text-center text-muted-foreground">লিংক</span>
                        </div>
                      )}
                      <button
                        onClick={() => removeEvidence(i)}
                        className="absolute -top-1.5 -right-1.5 bg-destructive text-destructive-foreground rounded-full w-6 h-6 flex items-center justify-center text-xs shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Submit */}
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={handleSubmit}
                disabled={submitting}
                className="w-full py-3.5 bg-primary text-primary-foreground rounded-xl font-display font-bold text-base flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50 shadow-lg shadow-primary/25"
              >
                {submitting ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-primary-foreground border-t-transparent" />
                ) : (
                  <>
                    <Send className="w-5 h-5" /> রিপোর্ট পোস্ট করুন
                  </>
                )}
              </motion.button>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Navigation buttons */}
      <div className="flex gap-3 mt-6">
        {step > 0 && (
          <button
            onClick={prevStep}
            className="flex-1 py-3 border-2 rounded-xl font-display font-semibold text-sm hover:bg-muted transition-all"
          >
            ← পূর্ববর্তী
          </button>
        )}
        {step < 4 && (
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={nextStep}
            className="flex-1 py-3 bg-primary text-primary-foreground rounded-xl font-display font-semibold text-sm hover:opacity-90 transition-opacity shadow-md shadow-primary/20"
          >
            পরবর্তী →
          </motion.button>
        )}
      </div>
    </div>
  );
}
