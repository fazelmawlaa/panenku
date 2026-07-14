import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useEffect, useRef, useMemo } from "react";
import { CustomerLayout } from "@/components/layout/CustomerLayout";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  MessageSquare, Send, ArrowLeft, Loader2, X, Search, Phone, ShieldCheck, User, Calendar
} from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/chat")({
  validateSearch: (search: Record<string, unknown>): { mentorId?: string } => {
    return {
      mentorId: search.mentorId ? String(search.mentorId) : undefined,
    };
  },
  head: () => ({ meta: [{ title: "Ruang Sesi Chat — PANENKU" }] }),
  component: ChatPage,
});

interface ChatSession {
  otherId: string;
  otherName: string;
  otherAvatar: string;
  specialtyOrRole: string;
  lastMessageText: string;
  lastMessageTime: string;
  lastMessageTimestamp: number;
  topic?: string;
  date?: string;
}

interface Message {
  id: string;
  senderId: string;
  senderName: string;
  text: string;
  time: string;
  timestamp: number;
}

function ChatPage() {
  const { session, loading, user, role, profile } = useAuth();
  const navigate = useNavigate();
  const { mentorId: urlMentorId } = Route.useSearch();

  const [activeChat, setActiveChat] = useState<ChatSession | null>(null);
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [isLoadingSessions, setIsLoadingSessions] = useState(true);

  // Messages state
  const [messages, setMessages] = useState<Message[]>([]);
  const [typedMessage, setTypedMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Search contacts
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (!loading && !session) {
      toast.info("Silakan masuk untuk mengakses obrolan");
      navigate({ to: "/login", replace: true });
    }
  }, [loading, session, navigate]);

  // Load chat sessions from Supabase orders
  useEffect(() => {
    if (!user) return;

    const fetchSessions = async () => {
      setIsLoadingSessions(true);
      try {
        let query = supabase.from("orders").select("*").eq("status", "Paid");

        if (role === "petani") {
          // If logged in as a farmer, load orders booked with me
          query = query.eq("farmer_id", user.id);
        } else {
          // If logged in as a buyer, load orders booked by me
          query = query.eq("user_id", user.id);
        }

        const { data, error } = await query;

        if (error) throw error;

        // Filter product_name starting with "Konsultasi: "
        const consultOrders = (data || []).filter(o => o.product_name && o.product_name.startsWith("Konsultasi: "));

        if (consultOrders.length === 0) {
          setSessions([]);
          setIsLoadingSessions(false);
          return;
        }

        // Map orders into chat sessions
        const chatMap = new Map<string, ChatSession>();

        // If I am a buyer, I need to fetch the farmer profile details
        if (role !== "petani") {
          const farmerIds = Array.from(new Set(consultOrders.map(o => o.farmer_id).filter(Boolean))) as string[];

          let profilesMap = new Map<string, any>();
          if (farmerIds.length > 0) {
            const { data: farmerProfiles } = await supabase
              .from("profiles")
              .select("id, full_name, avatar_url, focus_area, bio")
              .in("id", farmerIds);
            
            if (farmerProfiles) {
              farmerProfiles.forEach(p => profilesMap.set(p.id, p));
            }
          }

          consultOrders.forEach(o => {
            const fId = o.farmer_id || "fallback";
            const farmerProfile = profilesMap.get(fId);

            // Fetch last message from localStorage
            const storageKey = `panenku_chat_${user.id}_${fId}`;
            let lastMsgText = "Mulai obrolan...";
            let lastMsgTime = "";
            let lastMsgTimestamp = new Date(o.created_at).getTime();

            try {
              const localMsg = localStorage.getItem(storageKey);
              if (localMsg) {
                const parsed = JSON.parse(localMsg) as Message[];
                if (parsed.length > 0) {
                  const last = parsed[parsed.length - 1];
                  lastMsgText = last.text;
                  lastMsgTime = last.time;
                  lastMsgTimestamp = last.timestamp;
                }
              }
            } catch (e) {
              console.warn(e);
            }

            // Extract topic
            let topicText = "Materi Konsultasi";
            if (o.shipping_address && o.shipping_address.includes(" - ")) {
              topicText = o.shipping_address.split(" - ")[1] || topicText;
            }

            chatMap.set(fId, {
              otherId: fId,
              otherName: farmerProfile?.full_name || o.product_name.replace("Konsultasi: ", ""),
              otherAvatar: farmerProfile?.avatar_url || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80",
              specialtyOrRole: farmerProfile?.focus_area || "Petani Mentor",
              lastMessageText: lastMsgText,
              lastMessageTime: lastMsgTime,
              lastMessageTimestamp,
              topic: topicText,
              date: o.date
            });
          });
        } else {
          // If I am a farmer, each order represents a student (buyer)
          consultOrders.forEach(o => {
            const bId = o.user_id;

            // Fetch last message from localStorage
            const storageKey = `panenku_chat_${user.id}_${bId}`;
            let lastMsgText = "Halo, silakan tanyakan keluhan bertani Anda...";
            let lastMsgTime = "";
            let lastMsgTimestamp = new Date(o.created_at).getTime();

            try {
              const localMsg = localStorage.getItem(storageKey);
              if (localMsg) {
                const parsed = JSON.parse(localMsg) as Message[];
                if (parsed.length > 0) {
                  const last = parsed[parsed.length - 1];
                  lastMsgText = last.text;
                  lastMsgTime = last.time;
                  lastMsgTimestamp = last.timestamp;
                }
              }
            } catch (e) {
              console.warn(e);
            }

            // Extract topic
            let topicText = "Materi Konsultasi";
            if (o.shipping_address && o.shipping_address.includes(" - ")) {
              topicText = o.shipping_address.split(" - ")[1] || topicText;
            }

            chatMap.set(bId, {
              otherId: bId,
              otherName: o.buyer_name || "Calon Petani",
              otherAvatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80",
              specialtyOrRole: "Buyer / Calon Petani",
              lastMessageText: lastMsgText,
              lastMessageTime: lastMsgTime,
              lastMessageTimestamp,
              topic: topicText,
              date: o.date
            });
          });
        }

        // Sort by last message timestamp descending
        const sorted = Array.from(chatMap.values()).sort((a, b) => b.lastMessageTimestamp - a.lastMessageTimestamp);
        setSessions(sorted);

        // Auto-select active chat based on URL parameter
        if (urlMentorId) {
          const match = sorted.find(s => s.otherId === urlMentorId);
          if (match) {
            setActiveChat(match);
          } else if (sorted.length > 0) {
            setActiveChat(sorted[0]);
          }
        } else if (sorted.length > 0) {
          setActiveChat(sorted[0]);
        }
      } catch (err) {
        console.error("Failed to load chat sessions:", err);
      } finally {
        setIsLoadingSessions(false);
      }
    };

    fetchSessions();
  }, [user, role, urlMentorId]);

  // Load messages whenever active chat changes
  useEffect(() => {
    if (!user || !activeChat) {
      setMessages([]);
      return;
    }

    const storageKey = `panenku_chat_${user.id}_${activeChat.otherId}`;
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        setMessages(JSON.parse(saved));
      } else {
        // Preload fallback welcome messages securely
        const initialMessages: Message[] = [
          {
            id: "msg-init-1",
            senderId: activeChat.otherId,
            senderName: activeChat.otherName,
            text: role === "petani"
              ? `Halo! Saya siap membantu konsultasi topik "${activeChat.topic}" Anda.`
              : `Halo! Saya ${activeChat.otherName}. Terima kasih sudah memesan sesi konsultasi dengan topik "${activeChat.topic}". Ada yang bisa saya bantu hari ini?`,
            time: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }),
            timestamp: Date.now() - 5000
          }
        ];
        setMessages(initialMessages);
        localStorage.setItem(storageKey, JSON.stringify(initialMessages));
      }
    } catch (e) {
      console.warn(e);
    }
  }, [activeChat, user, role]);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Filter sessions by search term
  const filteredSessions = useMemo(() => {
    return sessions.filter(s =>
      s.otherName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (s.topic && s.topic.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [sessions, searchTerm]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!typedMessage.trim() || !user || !activeChat) return;

    const storageKey = `panenku_chat_${user.id}_${activeChat.otherId}`;
    const newMsg: Message = {
      id: "msg-" + Math.floor(Math.random() * 100000) + "-" + Date.now(),
      senderId: user.id,
      senderName: profile?.full_name || user.email?.split("@")[0] || "Saya",
      text: typedMessage,
      time: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }),
      timestamp: Date.now()
    };

    const updated = [...messages, newMsg];
    setMessages(updated);
    setTypedMessage("");

    try {
      localStorage.setItem(storageKey, JSON.stringify(updated));
    } catch (e) {
      console.warn(e);
    }

    // Update active chat item's snippet in sidebar list
    setSessions(prev =>
      prev.map(s =>
        s.otherId === activeChat.otherId
          ? {
              ...s,
              lastMessageText: newMsg.text,
              lastMessageTime: newMsg.time,
              lastMessageTimestamp: newMsg.timestamp
            }
          : s
      ).sort((a, b) => b.lastMessageTimestamp - a.lastMessageTimestamp)
    );

    // AI Simulation Response for a truly interactive experience (Only for buyer chatting with farmer mentor)
    if (role !== "petani") {
      setTimeout(() => {
        const responseMsg: Message = {
          id: "msg-sim-" + Math.floor(Math.random() * 100000) + "-" + Date.now(),
          senderId: activeChat.otherId,
          senderName: activeChat.otherName,
          text: `Terima kasih atas pertanyaannya. Mengenai topik "${activeChat.topic}" tersebut, langkah awal terbaik adalah memastikan drainase tanah berjalan lancar dan memberikan pupuk kompos sirkular. Apakah Anda sudah menerapkan metode ini di lahan Anda?`,
          time: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }),
          timestamp: Date.now()
        };

        setMessages(prev => {
          const next = [...prev, responseMsg];
          try {
            localStorage.setItem(storageKey, JSON.stringify(next));
          } catch (e) {
            console.warn(e);
          }
          return next;
        });

        setSessions(prev =>
          prev.map(s =>
            s.otherId === activeChat.otherId
              ? {
                  ...s,
                  lastMessageText: responseMsg.text,
                  lastMessageTime: responseMsg.time,
                  lastMessageTimestamp: responseMsg.timestamp
                }
              : s
          ).sort((a, b) => b.lastMessageTimestamp - a.lastMessageTimestamp)
        );
      }, 1500);
    }
  };

  return (
    <CustomerLayout>
      <div className="mx-auto max-w-full px-4 sm:px-8 md:px-12 py-6 text-left">
        
        {/* Navigation Breadcrumb */}
        <div className="flex items-center gap-2 mb-6">
          <Link
            to={role === "petani" ? "/farmer/consultations" : "/consultations"}
            className="flex items-center gap-1 text-xs font-bold text-muted-foreground hover:text-foreground transition duration-200"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Kembali ke Konsultasi</span>
          </Link>
        </div>

        {/* Dynamic Chats Room Container */}
        <div className="bg-white border border-border/40 rounded-[2.2rem] shadow-xl overflow-hidden flex h-[620px] relative">
          
          {/* LEFT SIDEBAR: Active Chat Sessions list */}
          <div className={`w-full md:w-[320px] lg:w-[360px] border-r border-border/20 flex flex-col shrink-0 ${activeChat ? "hidden md:flex" : "flex"}`}>
            {/* Sidebar Header */}
            <div className="p-5 border-b border-border/20 space-y-4">
              <div>
                <h3 className="font-['Plus_Jakarta_Sans',sans-serif] font-black text-lg text-foreground flex items-center gap-2">
                  💬 Sesi Obrolan Aktif
                </h3>
                <p className="text-[10px] text-muted-foreground font-light">Sesi konsultasi Anda yang telah terverifikasi lunas.</p>
              </div>

              {/* Contacts Search bar */}
              <div className="flex items-center w-full bg-secondary/50 rounded-xl px-3 border border-transparent focus-within:border-primary/20 h-9 transition-all duration-200">
                <Search className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Cari obrolan..."
                  className="w-full h-full border-none focus:outline-none bg-transparent text-xs text-foreground px-2 font-light"
                />
                {searchTerm && (
                  <button onClick={() => setSearchTerm("")} className="text-muted-foreground hover:text-foreground shrink-0">
                    <X className="h-3 w-3" />
                  </button>
                )}
              </div>
            </div>

            {/* Sidebar Active List */}
            <div className="flex-1 overflow-y-auto p-3 space-y-2">
              {isLoadingSessions ? (
                <div className="flex flex-col items-center justify-center py-20 gap-2 text-muted-foreground">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  <span className="text-xs font-light">Memuat sesi chat...</span>
                </div>
              ) : sessions.length === 0 ? (
                <div className="text-center py-16 px-4 space-y-2">
                  <MessageSquare className="h-8 w-8 text-muted-foreground mx-auto opacity-40" />
                  <p className="text-xs font-light text-muted-foreground leading-normal">
                    {role === "petani"
                      ? "Belum ada sesi konsultasi berbayar yang masuk."
                      : "Belum ada sesi chat aktif. Silakan sewa sesi konsultasi dengan Petani Mentor terlebih dahulu."}
                  </p>
                  {role !== "petani" && (
                    <Button asChild size="sm" className="rounded-full text-[10px] font-bold px-4 mt-2">
                      <Link to="/consultations">Cari Petani Mentor</Link>
                    </Button>
                  )}
                </div>
              ) : filteredSessions.length === 0 ? (
                <div className="text-xs text-muted-foreground text-center py-8 font-light">Obrolan tidak ditemukan.</div>
              ) : (
                filteredSessions.map((s) => {
                  const isActive = activeChat?.otherId === s.otherId;
                  return (
                    <button
                      key={s.otherId}
                      onClick={() => setActiveChat(s)}
                      className={`w-full text-left border rounded-2xl p-3 flex items-center gap-3 transition-all duration-200 group relative overflow-hidden ${
                        isActive
                          ? "border-primary bg-primary/5 text-foreground shadow-sm"
                          : "border-border/10 hover:border-primary/20 hover:bg-secondary/40 text-muted-foreground"
                      }`}
                    >
                      <img
                        src={s.otherAvatar}
                        className="h-11 w-11 rounded-xl object-cover border border-border/20 shrink-0"
                        alt=""
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-center">
                          <span className={`font-bold text-xs truncate transition ${isActive ? "text-primary" : "text-foreground"}`}>
                            {s.otherName}
                          </span>
                          <span className="text-[8px] text-muted-foreground shrink-0 ml-1">{s.lastMessageTime}</span>
                        </div>
                        <div className="text-[9px] text-muted-foreground truncate font-light mt-0.5">
                          Topik: <span className="font-bold text-foreground/80">{s.topic}</span>
                        </div>
                        <p className="text-[10px] text-muted-foreground truncate font-light mt-1">
                          {s.lastMessageText}
                        </p>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* RIGHT CHAT CONTAINER: Active messages stream */}
          <div className={`flex-1 flex flex-col h-full bg-[#fcfdfa] relative ${!activeChat ? "hidden md:flex" : "flex"}`}>
            {activeChat ? (
              <>
                {/* Chat Top Header */}
                <div className="p-4 bg-white border-b border-border/20 flex items-center justify-between gap-3 shrink-0">
                  <div className="flex items-center gap-3">
                    {/* Back button on mobile */}
                    <button
                      onClick={() => setActiveChat(null)}
                      className="md:hidden p-1.5 rounded-full hover:bg-secondary text-muted-foreground shrink-0"
                    >
                      <ArrowLeft className="h-4.5 w-4.5" />
                    </button>
                    <img src={activeChat.otherAvatar} className="h-10 w-10 rounded-xl object-cover border border-border/20" alt="" />
                    <div className="text-left">
                      <div className="font-bold text-sm text-foreground flex items-center gap-1.5">
                        {activeChat.otherName}
                        <span className="h-2 w-2 rounded-full bg-emerald-500 inline-block animate-pulse" />
                      </div>
                      <div className="text-[10px] text-muted-foreground font-light leading-none mt-0.5">
                        {activeChat.specialtyOrRole}
                      </div>
                    </div>
                  </div>

                  {/* Topic badge details */}
                  <div className="hidden sm:flex flex-col items-end text-right">
                    <span className="text-[8px] text-muted-foreground uppercase font-black tracking-wider">Topik Konsultasi</span>
                    <span className="text-[10px] font-bold text-foreground max-w-[200px] truncate">{activeChat.topic}</span>
                  </div>
                </div>

                {/* Messages Log Body */}
                <div className="flex-grow overflow-y-auto p-5 space-y-4 bg-[#f6f8f3]/50">
                  <div className="mx-auto max-w-xs text-center pb-2">
                    <span className="text-[9px] text-muted-foreground bg-white border border-border/40 rounded-full px-3 py-1 font-medium shadow-sm">
                      Sesi: {activeChat.date || "Konsultasi Terjadwal"}
                    </span>
                  </div>

                  {messages.map((msg) => {
                    const isMe = msg.senderId === user.id;
                    return (
                      <div key={msg.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                        <div className={`max-w-[75%] rounded-2xl p-3 text-xs text-left shadow-sm ${
                          isMe
                            ? "bg-primary text-white rounded-tr-none"
                            : "bg-white text-foreground rounded-tl-none border border-border/20"
                        }`}>
                          <div className="leading-relaxed font-light">{msg.text}</div>
                          <div className={`text-[8px] mt-1 text-right opacity-70 ${isMe ? "text-white" : "text-muted-foreground"}`}>
                            {msg.time}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>

                {/* Messages Input footer */}
                <form onSubmit={handleSendMessage} className="p-4 border-t border-border/20 flex gap-2 shrink-0 bg-white items-center">
                  <Input
                    value={typedMessage}
                    onChange={(e) => setTypedMessage(e.target.value)}
                    placeholder={`Ketik pesan obrolan...`}
                    className="rounded-full flex-1 bg-secondary/50 font-light text-xs h-10 px-4 border-transparent focus-visible:ring-primary/20"
                  />
                  <Button type="submit" size="icon" className="rounded-full h-10 w-10 shrink-0 shadow-soft">
                    <Send className="h-4 w-4" />
                  </Button>
                </form>
              </>
            ) : (
              /* No Active Chat Room placeholder */
              <div className="flex-grow flex flex-col items-center justify-center p-8 text-center text-muted-foreground gap-4 bg-[#f8f9f6]">
                <div className="h-16 w-16 rounded-full bg-primary/5 text-primary grid place-items-center animate-pulse">
                  <MessageSquare className="h-8 w-8" />
                </div>
                <div>
                  <h4 className="font-['Plus_Jakarta_Sans',sans-serif] font-bold text-sm text-foreground">Pilih Obrolan Konsultasi</h4>
                  <p className="text-xs text-muted-foreground font-light max-w-xs leading-normal mt-1">
                    Silakan pilih salah satu mitra obrolan di daftar sebelah kiri untuk memulai koordinasi sesi tanya jawab Anda.
                  </p>
                </div>
              </div>
            )}
          </div>

        </div>

      </div>
    </CustomerLayout>
  );
}
