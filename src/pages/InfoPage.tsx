import { Mail, ExternalLink, Shield, Users, MapPin, Share2, CheckCircle, HelpCircle, XCircle, Megaphone, Eye, Newspaper } from "lucide-react";

export default function InfoPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-8">

      {/* What is it */}
      <Section icon={<Megaphone className="w-5 h-5 text-red-600" />} title="'চোর কই' কী?">
        <p className="text-sm text-foreground leading-relaxed">
          <span className="font-semibold text-red-600">'চোর কই'</span> হলো একটি crowd-powered দুর্নীতি রিপোর্টিং প্ল্যাটফর্ম — যেখানে যেকেউ বেনামে দুর্নীতির ঘটনা পোস্ট করতে পারেন, এবং সাধারণ মানুষ ভোট দিয়ে সেই রিপোর্ট যাচাই করতে পারেন। কোনো অ্যাকাউন্ট লাগে না, কোনো পরিচয় লুকানো দরকার নেই।
        </p>
      </Section>

      {/* Goals */}
      <Section icon={<Eye className="w-5 h-5 text-red-600" />} title="আমাদের লক্ষ্য">
        <ul className="space-y-2">
          {[
            "দুর্নীতির রিপোর্ট crowd verify করা",
            "সোশ্যাল মিডিয়ায় দুর্নীতিবিরোধী আলোচনা ছড়িয়ে দেওয়া",
            "সাংবাদিক ও নিউজ মিডিয়ার দৃষ্টি আকর্ষণ করা",
            "জনসচেতনতা ও জবাবদিহিতা তৈরি করা",
          ].map((item, i) => (
            <li key={i} className="flex items-start gap-2.5 text-sm text-foreground">
              <span className="mt-0.5 flex-shrink-0 w-5 h-5 rounded-full bg-red-100 text-red-600 flex items-center justify-center text-xs font-bold">{i + 1}</span>
              {item}
            </li>
          ))}
        </ul>
      </Section>

      {/* How it works */}
      <Section icon={<Share2 className="w-5 h-5 text-red-600" />} title="এটি কীভাবে কাজ করে">
        <div className="space-y-3">
          {[
            { step: "রিপোর্ট করুন", desc: "যেকোনো দুর্নীতির ঘটনা দেখলে বেনামে রিপোর্ট পোস্ট করুন।" },
            { step: "সবাই ভোট দেয়", desc: "অন্য ব্যবহারকারীরা রিপোর্টের সত্যতা নিয়ে মতামত দেন।" },
            { step: "ভেরিফাই হয়", desc: "যথেষ্ট ভোটের ভিত্তিতে রিপোর্ট ভেরিফাইড হিসেবে চিহ্নিত হয়।" },
            { step: "ম্যাপে দেখুন ও শেয়ার করুন", desc: "সব রিপোর্ট ম্যাপে দেখুন, সোশ্যাল মিডিয়ায় শেয়ার করুন।" },
          ].map((item, i) => (
            <div key={i} className="flex gap-3 items-start">
              <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-red-600 text-white flex items-center justify-center text-sm font-bold shadow-sm">{i + 1}</div>
              <div>
                <p className="text-sm font-semibold text-foreground">{item.step}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* Voting */}
      <Section icon={<CheckCircle className="w-5 h-5 text-red-600" />} title="ভোটিং সিস্টেম">
        <div className="space-y-2">
          <VoteOption
            icon={<CheckCircle className="w-4 h-4" />}
            color="text-green-600"
            bg="bg-green-50 border-green-200"
            label="✅ সত্য"
            desc="রিপোর্টটি সত্য বলে বিশ্বাস করলে এই ভোট দিন।"
          />
          <VoteOption
            icon={<HelpCircle className="w-4 h-4" />}
            color="text-yellow-600"
            bg="bg-yellow-50 border-yellow-200"
            label="❓ আরো প্রমাণ চাই"
            desc="নিশ্চিত নন — আরো তথ্য বা প্রমাণ দরকার মনে হলে।"
          />
          <VoteOption
            icon={<XCircle className="w-4 h-4" />}
            color="text-red-600"
            bg="bg-red-50 border-red-200"
            label="❌ মিথ্যা"
            desc="রিপোর্টটি মিথ্যা বা বানোয়াট মনে হলে।"
          />
        </div>
        <p className="mt-3 text-xs text-muted-foreground bg-muted rounded-lg px-3 py-2">
          প্রতিটি রিপোর্টে একজন ব্যবহারকারী একটিমাত্র ভোট দিতে পারবেন।
        </p>
      </Section>

      {/* Privacy & Security */}
      <Section icon={<Shield className="w-5 h-5 text-red-600" />} title="গোপনীয়তা ও নিরাপত্তা">
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {[
            { title: "সম্পূর্ণ বেনামে", desc: "কোনো ব্যক্তিগত তথ্য সংগ্রহ করা হয় না।" },
            { title: "মজার ছদ্মনাম", desc: "প্রতিটি রিপোর্টারকে স্বয়ংক্রিয়ভাবে বাংলা ছদ্মনাম দেওয়া হয়।" },
            { title: "কোনো অ্যাকাউন্ট নেই", desc: "সাইন আপ বা লগইন ছাড়াই রিপোর্ট করা যায়।" },
            { title: "নিরাপদ প্ল্যাটফর্ম", desc: "আপনার পরিচয় কখনো প্রকাশ পাবে না।" },
          ].map((item, i) => (
            <div key={i} className="bg-muted/60 rounded-lg p-3 border border-border/50">
              <p className="text-xs font-semibold text-foreground">{item.title}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{item.desc}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* For Journalists */}
      <Section icon={<Newspaper className="w-5 h-5 text-red-600" />} title="সাংবাদিক ও মিডিয়ার জন্য">
        <p className="text-sm text-foreground leading-relaxed">
          আপনি যদি সাংবাদিক হন, এই প্ল্যাটফর্মের ভেরিফাইড রিপোর্টগুলো অনুসন্ধানী সাংবাদিকতার জন্য লিড হিসেবে ব্যবহার করতে পারেন। সোর্স হিসেবে <span className="font-semibold">'চোর কই'</span>-এর রেফারেন্স দিন।
        </p>
      </Section>

      {/* Disclaimer & Policy */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <SmallSection title="⚠️ দায় অস্বীকার">
          <p className="text-xs text-muted-foreground leading-relaxed">
            এখানে পোস্ট করা রিপোর্টগুলো ব্যবহারকারীদের দ্বারা তৈরি। 'চোর কই' কোনো রিপোর্টের সত্যতা নিশ্চিত করে না। তথ্য যাচাইয়ের দায়িত্ব পাঠকের।
          </p>
        </SmallSection>
        <SmallSection title="🚫 কনটেন্ট নীতি">
          <p className="text-xs text-muted-foreground leading-relaxed">
            ব্যক্তিগত আক্রমণ, ঘৃণাবাক্য, ধর্মীয় উসকানি বা মিথ্যা তথ্য ছড়ানো নিষিদ্ধ। এডমিন যেকোনো রিপোর্ট মুছে দেওয়ার অধিকার রাখেন।
          </p>
        </SmallSection>
      </div>

      {/* Why use */}
      <Section icon={<CheckCircle className="w-5 h-5 text-red-600" />} title="কেন 'চোর কই' ব্যবহার করবেন?">
        <div className="flex flex-wrap gap-2">
          {["সম্পূর্ণ বিনামূল্যে", "বেনামে রিপোর্ট", "Crowd Verification", "ম্যাপভিত্তিক রিপোর্টিং", "সোশ্যাল শেয়ারিং", "মিডিয়ার নজরে আনুন"].map((tag) => (
            <span key={tag} className="text-xs font-medium px-3 py-1.5 rounded-full bg-red-50 text-red-700 border border-red-200">
              {tag}
            </span>
          ))}
        </div>
      </Section>

      {/* Contact */}
      <div className="rounded-xl border bg-card p-5">
        <h2 className="font-display font-bold text-base mb-3 flex items-center gap-2">
          <Mail className="w-4 h-4 text-red-600" />
          যোগাযোগ করুন
        </h2>
        <div className="space-y-2.5">
          <a href="mailto:ridoan.zisan@gmail.com" className="flex items-center gap-2.5 text-sm text-primary hover:underline">
            <Mail className="w-4 h-4 text-muted-foreground" />
            ridoan.zisan@gmail.com
          </a>
          <a href="https://www.facebook.com/ridoan.zisan" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2.5 text-sm text-primary hover:underline">
            <ExternalLink className="w-4 h-4 text-muted-foreground" />
            Facebook
          </a>
        </div>
      </div>

      <div className="border-t pt-5 text-center text-xs text-muted-foreground">
        <p>
          Developed by{" "}
          <a href="https://ridoan-zisan.netlify.app" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline font-semibold">
            Md Ridoan Mahmud Zisan
          </a>
        </p>
        <p className="mt-1 text-muted-foreground/60">দুর্নীতিমুক্ত বাংলাদেশের স্বপ্নে</p>
      </div>
    </div>
  );
}

function Stat({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex items-center gap-1.5 text-red-200">
      {icon}
      <span className="text-xs font-medium">{label}</span>
    </div>
  );
}

function Section({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <div className="bg-card rounded-xl border p-5 shadow-sm">
      <h2 className="font-display font-bold text-base mb-3 flex items-center gap-2">
        {icon}
        {title}
      </h2>
      {children}
    </div>
  );
}

function SmallSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-card rounded-xl border p-4 shadow-sm">
      <h3 className="font-semibold text-sm mb-2">{title}</h3>
      {children}
    </div>
  );
}

function VoteOption({
  icon, color, bg, label, desc,
}: {
  icon: React.ReactNode; color: string; bg: string; label: string; desc: string;
}) {
  return (
    <div className={`flex items-start gap-2.5 rounded-lg border px-3 py-2.5 ${bg}`}>
      <span className={`mt-0.5 ${color}`}>{icon}</span>
      <div>
        <p className={`text-sm font-semibold ${color}`}>{label}</p>
        <p className="text-xs text-muted-foreground mt-0.5">{desc}</p>
      </div>
    </div>
  );
}
