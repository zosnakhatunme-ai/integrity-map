import { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";

interface Message {
  id: string;
  role: "user" | "bot";
  content: string;
  quickReplies?: string[];
}

const KNOWLEDGE_BASE: { keywords: string[]; response: string; quickReplies?: string[] }[] = [
  {
    keywords: ["হ্যালো", "হাই", "hello", "hi", "hey", "আসসালামু"],
    response: "আসসালামু আলাইকুম! 👋 আমি **চোর কই** এর সহায়ক বট। আপনাকে কীভাবে সাহায্য করতে পারি?",
    quickReplies: ["চোর কই কি?", "রিপোর্ট কিভাবে করবো?", "ভোট কিভাবে দিবো?", "ম্যাপ কিভাবে ব্যবহার করবো?"],
  },
  {
    keywords: ["চোর কই কি", "কি এটা", "what is", "এটা কি", "অ্যাপ কি"],
    response: "**চোর কই** একটি crowd-powered দুর্নীতি রিপোর্টিং প্ল্যাটফর্ম। এখানে যে কেউ **বেনামে** দুর্নীতির রিপোর্ট পোস্ট করতে পারে এবং অন্যরা ভোট দিয়ে যাচাই করতে পারে। \n\n🎯 **লক্ষ্য:** দুর্নীতিকে জনসমক্ষে আনা এবং জবাবদিহিতা নিশ্চিত করা।",
    quickReplies: ["রিপোর্ট কিভাবে করবো?", "ভোট কিভাবে দিবো?", "গোপনীয়তা কেমন?"],
  },
  {
    keywords: ["রিপোর্ট", "কিভাবে করবো", "report", "পোস্ট", "দুর্নীতি রিপোর্ট"],
    response: "রিপোর্ট করা খুবই সহজ! 📝\n\n1️⃣ নিচের **রিপোর্ট** বাটনে ক্লিক করুন\n2️⃣ দুর্নীতির **ধরন** নির্বাচন করুন\n3️⃣ **স্থান** ও **শিরোনাম** লিখুন\n4️⃣ বিস্তারিত **বিবরণ** দিন\n5️⃣ GPS বা ম্যাপ থেকে **লোকেশন** দিন\n6️⃣ প্রমাণের **ছবি/লিংক** যোগ করুন\n7️⃣ **সাবমিট** করুন!\n\n💡 কোনো ব্যক্তিগত তথ্য লাগবে না — সম্পূর্ণ বেনামে!",
    quickReplies: ["ভোট কিভাবে দিবো?", "প্রমাণ কিভাবে যোগ করবো?", "ম্যাপে রিপোর্ট দেখবো কিভাবে?"],
  },
  {
    keywords: ["ভোট", "vote", "সত্য", "মিথ্যা", "প্রমাণ চাই"],
    response: "ভোটিং সিস্টেম: ✅❓❌\n\n- ✅ **সত্য** — রিপোর্ট সত্য মনে হলে\n- ❓ **প্রমাণ চাই** — আরো তথ্য দরকার মনে হলে\n- ❌ **মিথ্যা** — রিপোর্ট ভুল মনে হলে\n\n⚠️ প্রতিটি রিপোর্টে **একটি মাত্র ভোট** দেওয়া যায়।\n\nভোটের ভিত্তিতে ম্যাপে মার্কারের রঙ পরিবর্তন হয়:\n- 🟢 সবুজ = সত্য\n- 🔵 নীল = প্রমাণ চাই\n- 🔴 লাল = মিথ্যা",
    quickReplies: ["ম্যাপ কিভাবে ব্যবহার করবো?", "শেয়ার কিভাবে করবো?", "রিপোর্ট কিভাবে করবো?"],
  },
  {
    keywords: ["ম্যাপ", "map", "লোকেশন", "location", "নকশা"],
    response: "🗺️ **ম্যাপ ব্যবহার:**\n\n- ম্যাপে **পিন** গুলো দুর্নীতির রিপোর্ট নির্দেশ করে\n- পিনে **ক্লিক** করলে রিপোর্টের সারাংশ দেখাবে\n- 🔍 ফিল্টার বাটনে ক্লিক করে **ধরন অনুযায়ী** ফিল্টার করুন\n- 📍 নিকটবর্তী বাটনে ক্লিক করে **আপনার কাছের** রিপোর্ট দেখুন\n- ম্যাপে **যেকোনো জায়গায় ক্লিক** করে সেখানে রিপোর্ট অ্যাড করুন\n- ➕ **প্লাস বাটনে** ক্লিক করেও রিপোর্ট করতে পারবেন",
    quickReplies: ["ফিড পেজ কি?", "রিপোর্ট কিভাবে করবো?", "শেয়ার কিভাবে করবো?"],
  },
  {
    keywords: ["শেয়ার", "share", "ভাইরাল", "সোশ্যাল"],
    response: "📢 **শেয়ার করুন সহজে!**\n\nপ্রতিটি রিপোর্টে **শেয়ার বাটন** আছে। ক্লিক করলে মজার/সাহসী বাংলা মেসেজসহ লিংক কপি হবে বা শেয়ার অপশন দেখাবে।\n\n💡 যত বেশি শেয়ার হবে, তত বেশি মানুষ জানবে এবং দুর্নীতিবাজরা চাপে থাকবে!",
    quickReplies: ["চোর কই কি?", "গোপনীয়তা কেমন?"],
  },
  {
    keywords: ["গোপনীয়তা", "privacy", "সুরক্ষা", "নিরাপত্তা", "বেনাম"],
    response: "🔒 **সম্পূর্ণ নিরাপদ ও বেনামে!**\n\n- কোনো ব্যক্তিগত তথ্য সংগ্রহ করা হয় **না**\n- প্রতিটি রিপোর্টারকে স্বয়ংক্রিয়ভাবে একটি **মজার বাংলা ছদ্মনাম** দেওয়া হয়\n- আপনার পরিচয় **কখনোই প্রকাশ হবে না**",
    quickReplies: ["রিপোর্ট কিভাবে করবো?", "চোর কই কি?"],
  },
  {
    keywords: ["ফিড", "feed", "তালিকা", "লিস্ট"],
    response: "📋 **ফিড পেজ:**\n\n- সব রিপোর্ট কার্ড আকারে দেখায়\n- **ফিল্টার** করুন দুর্নীতির ধরন অনুযায়ী\n- **সাম্প্রতিক** বা **নিকটবর্তী** অনুযায়ী সাজান\n- কার্ডে ক্লিক করে **বিস্তারিত** দেখুন\n- প্রতিটি কার্ডে ভোট, শেয়ার, ম্যাপ বাটন আছে",
    quickReplies: ["ম্যাপ কিভাবে ব্যবহার করবো?", "ভোট কিভাবে দিবো?"],
  },
  {
    keywords: ["প্রমাণ", "ছবি", "evidence", "আপলোড", "ভিডিও", "image"],
    response: "📸 **প্রমাণ যোগ করুন:**\n\n- **ছবি আপলোড** বাটনে ক্লিক করে একাধিক ছবি দিন\n- **লিংক** পেস্ট করে ভিডিও/অডিও/মিডিয়া যোগ করুন\n- ছবি ImgBB তে আপলোড হয় — ফ্রি ও নিরাপদ\n- প্রমাণ যত বেশি হবে, রিপোর্ট তত বিশ্বাসযোগ্য হবে!",
    quickReplies: ["রিপোর্ট কিভাবে করবো?", "ভোট কিভাবে দিবো?"],
  },
  {
    keywords: ["সাংবাদিক", "মিডিয়া", "journalist", "নিউজ"],
    response: "📰 **সাংবাদিক ও মিডিয়ার জন্য:**\n\nএই প্ল্যাটফর্মের ভেরিফাইড রিপোর্টগুলো অনুসন্ধানী সাংবাদিকতার জন্য ব্যবহার করতে পারেন। সোর্স হিসেবে **'চোর কই'** এর রেফারেন্স দিন।",
    quickReplies: ["চোর কই কি?", "যোগাযোগ"],
  },
  {
    keywords: ["যোগাযোগ", "contact", "ডেভেলপার", "developer"],
    response: "📬 **যোগাযোগ:**\n\n- 👤 Developer: **Md Ridoan Mahmud Zisan**\n- 🌐 Portfolio: [ridoan-zisan.netlify.app](https://ridoan-zisan.netlify.app)\n- 📘 Facebook: [facebook.com/ridoan.zisan](https://www.facebook.com/ridoan.zisan)\n- 📧 Email: ridoan.zisan@gmail.com",
    quickReplies: ["চোর কই কি?", "রিপোর্ট কিভাবে করবো?"],
  },
];

const DEFAULT_RESPONSE: Message = {
  id: "",
  role: "bot",
  content: "দুঃখিত, আমি আপনার প্রশ্নটি বুঝতে পারিনি। 😅 নিচের অপশনগুলো থেকে বেছে নিন:",
  quickReplies: ["চোর কই কি?", "রিপোর্ট কিভাবে করবো?", "ভোট কিভাবে দিবো?", "ম্যাপ কিভাবে ব্যবহার করবো?", "গোপনীয়তা কেমন?", "যোগাযোগ"],
};

function findResponse(input: string): { content: string; quickReplies?: string[] } {
  const lower = input.toLowerCase();
  for (const item of KNOWLEDGE_BASE) {
    if (item.keywords.some((kw) => lower.includes(kw.toLowerCase()))) {
      return { content: item.response, quickReplies: item.quickReplies };
    }
  }
  return { content: DEFAULT_RESPONSE.content, quickReplies: DEFAULT_RESPONSE.quickReplies };
}

export function Chatbot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "bot",
      content: "আসসালামু আলাইকুম! 👋 আমি **চোর কই** সহায়ক বট। আপনাকে কীভাবে সাহায্য করতে পারি?",
      quickReplies: ["চোর কই কি?", "রিপোর্ট কিভাবে করবো?", "ভোট কিভাবে দিবো?", "ম্যাপ কিভাবে ব্যবহার করবো?"],
    },
  ]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing]);

  const sendMessage = (text: string) => {
    if (!text.trim()) return;
    const userMsg: Message = { id: Date.now().toString(), role: "user", content: text.trim() };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setTyping(true);

    setTimeout(() => {
      const resp = findResponse(text);
      const botMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "bot",
        content: resp.content,
        quickReplies: resp.quickReplies,
      };
      setMessages((prev) => [...prev, botMsg]);
      setTyping(false);
    }, 800 + Math.random() * 700);
  };

  return (
    <>
      {/* Chat toggle button */}
      <AnimatePresence>
        {!open && (
          <motion.button
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            onClick={() => setOpen(true)}
            className="fixed bottom-20 right-4 md:bottom-6 md:right-4 z-[1001] bg-primary text-primary-foreground w-12 h-12 rounded-full shadow-xl flex items-center justify-center hover:opacity-90 transition-opacity"
          >
            <MessageCircle className="w-6 h-6" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat window */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-20 right-3 md:bottom-6 md:right-6 z-[1001] w-[calc(100vw-24px)] max-w-sm bg-card rounded-2xl shadow-2xl border overflow-hidden flex flex-col"
            style={{ maxHeight: "70vh" }}
          >
            {/* Header */}
            <div className="bg-primary text-primary-foreground px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MessageCircle className="w-5 h-5" />
                <span className="font-display font-semibold text-sm">চোর কই সহায়ক</span>
              </div>
              <button onClick={() => setOpen(false)} className="hover:opacity-70 transition-opacity">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-3 space-y-3" style={{ minHeight: "200px", maxHeight: "50vh" }}>
              {messages.map((msg) => (
                <div key={msg.id}>
                  <div className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                    <div
                      className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm ${
                        msg.role === "user"
                          ? "bg-primary text-primary-foreground rounded-br-md"
                          : "bg-muted text-foreground rounded-bl-md"
                      }`}
                    >
                      {msg.role === "bot" ? (
                        <div className="prose prose-sm max-w-none [&_a]:text-primary [&_a]:underline [&_a]:font-medium [&_p]:my-1 [&_li]:my-0.5 [&_ol]:my-1 [&_ul]:my-1">
                          <ReactMarkdown
                            components={{
                              a: ({ href, children }) => (
                                <a href={href} target="_blank" rel="noopener noreferrer" className="text-primary underline font-medium">
                                  {children}
                                </a>
                              ),
                            }}
                          >
                            {msg.content}
                          </ReactMarkdown>
                        </div>
                      ) : (
                        msg.content
                      )}
                    </div>
                  </div>
                  {/* Quick replies */}
                  {msg.role === "bot" && msg.quickReplies && (
                    <div className="flex flex-wrap gap-1.5 mt-2 ml-1">
                      {msg.quickReplies.map((qr) => (
                        <button
                          key={qr}
                          onClick={() => sendMessage(qr)}
                          className="flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-full border border-primary/30 text-primary bg-primary/5 hover:bg-primary/10 transition-colors font-medium"
                        >
                          <ChevronRight className="w-3 h-3" />
                          {qr}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}

              {/* Typing indicator */}
              {typing && (
                <div className="flex justify-start">
                  <div className="bg-muted rounded-2xl rounded-bl-md px-4 py-3 flex gap-1">
                    <span className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                    <span className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="border-t p-2 flex gap-2">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendMessage(input)}
                placeholder="আপনার প্রশ্ন লিখুন..."
                className="flex-1 text-sm border rounded-full px-3 py-2 bg-background focus:outline-none focus:ring-1 focus:ring-primary"
              />
              <button
                onClick={() => sendMessage(input)}
                disabled={!input.trim()}
                className="w-9 h-9 rounded-full bg-primary text-primary-foreground flex items-center justify-center hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
