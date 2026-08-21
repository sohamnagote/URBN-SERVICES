import React, { useState } from 'react';
import {
  Search,
  MessageSquare,
  Phone,
  ShieldCheck,
  CreditCard,
  Calendar,
  Star,
  UserCheck,
  AlertCircle,
  HelpCircle,
  ChevronRight,
  Send,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';
import { Booking } from '../types';
import { apiClient } from '../services/apiClient';

interface SupportScreenProps {
  recentBookings: Booking[];
  onSelectBookingHelp: (booking: Booking) => void;
  preselectedBookingId?: string;
}

export const SupportScreen: React.FC<SupportScreenProps> = ({
  recentBookings,
  onSelectBookingHelp,
  preselectedBookingId,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeChatTopic, setActiveChatTopic] = useState<string | null>(
    preselectedBookingId ? `Booking #${preselectedBookingId}` : null
  );
  const [chatMessages, setChatMessages] = useState<{ sender: 'agent' | 'user'; text: string }[]>([
    {
      sender: 'agent',
      text: 'Namaskar! Welcome to URBN SERVICES Nashik Support. How can we assist you with your plumbing, AC, or cleaning service today?',
    },
  ]);
  const [userInput, setUserInput] = useState('');
  const [ticketCreated, setTicketCreated] = useState(false);

  const commonTopics = [
    {
      id: 'topic-payment',
      title: 'Payment & Refunds',
      desc: 'UPI failed, invoice requests, refund timelines',
      icon: <CreditCard className="w-5 h-5" />,
    },
    {
      id: 'topic-status',
      title: 'Booking Status',
      desc: 'Rescheduling, technician arrival delays',
      icon: <Calendar className="w-5 h-5" />,
    },
    {
      id: 'topic-quality',
      title: 'Service Quality',
      desc: '30-day warranty claims, re-work requests',
      icon: <Star className="w-5 h-5" />,
    },
    {
      id: 'topic-conduct',
      title: 'Professional Conduct',
      desc: 'Feedback on technician behavior & KYC',
      icon: <UserCheck className="w-5 h-5" />,
    },
    {
      id: 'topic-promise',
      title: '1-Day Promise Claim',
      desc: 'Claim compensation if service delayed past 24h',
      icon: <ShieldCheck className="w-5 h-5" />,
    },
    {
      id: 'topic-app',
      title: 'App & Account Issues',
      desc: 'Nashik address changes, coupon codes',
      icon: <AlertCircle className="w-5 h-5" />,
    },
  ];

  const handleSendQuery = () => {
    if (!userInput.trim()) return;
    const userText = userInput.trim();
    setChatMessages((prev) => [...prev, { sender: 'user', text: userText }]);
    setUserInput('');

    // Persist ticket to Backend API
    apiClient.createSupportTicket({
      subject: activeChatTopic || 'General Query',
      category: activeChatTopic || 'General',
      messageText: userText,
      userName: 'Resident',
    }).catch((e) => console.warn('Support ticket API fallback:', e));

    setTimeout(() => {
      let botResponse = `Thank you for reaching out. We have logged your request under Nashik Hub priority queue #TK-${Math.floor(1000 + Math.random() * 9000)}.`;

      if (userText.toLowerCase().includes('refund') || userText.toLowerCase().includes('money')) {
        botResponse = 'Refunds initiated to UPI/Bank accounts in Nashik are processed automatically within 2 hours. Your transaction reference is verified.';
      } else if (userText.toLowerCase().includes('delay') || userText.toLowerCase().includes('promise')) {
        botResponse = 'Under URBN 1-Day Promise in Nashik, if your assigned technician does not resolve the issue within 24 hours of your chosen slot, your next service is 100% free.';
      } else if (userText.toLowerCase().includes('plumber') || userText.toLowerCase().includes('technician')) {
        botResponse = 'All URBN technicians in Nashik are background verified with local police clearance and carry certified ID badges.';
      }

      setChatMessages((prev) => [...prev, { sender: 'agent', text: botResponse }]);
    }, 800);
  };

  return (
    <div id="support-screen" className="max-w-[768px] mx-auto px-4 md:px-8 py-5 pb-28 animate-in fade-in duration-200">
      {/* Page Title */}
      <div className="mb-4">
        <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Support & Help Center</h1>
        <p className="text-xs text-gray-500">Fast assistance for all Nashik household services</p>
      </div>

      {/* Search Input (Matching Screenshot) */}
      <div className="relative mb-6">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
          <Search className="w-5 h-5" />
        </div>
        <input
          id="support-search-input"
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="How can we help you today?"
          className="w-full bg-white border border-[#c3c6d6] text-gray-900 placeholder:text-gray-400 rounded-2xl py-3.5 pl-12 pr-4 text-sm focus:outline-none focus:border-[#003d9b] focus:ring-2 focus:ring-blue-100 shadow-2xs"
        />
      </div>

      {/* Recent Bookings Help Card (Matching Screenshot) */}
      {recentBookings.length > 0 && (
        <section className="mb-6">
          <h2 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2.5">
            Recent Bookings
          </h2>
          <div className="space-y-2.5">
            {recentBookings.slice(0, 2).map((b) => (
              <div
                key={b.id}
                onClick={() => {
                  onSelectBookingHelp(b);
                  setActiveChatTopic(`Help with ${b.primaryServiceTitle} (#${b.id})`);
                }}
                className="bg-white border border-[#c3c6d6]/80 rounded-2xl p-4 flex items-center justify-between hover:border-[#003d9b] transition-all cursor-pointer shadow-2xs group"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={b.primaryServiceImage}
                    alt={b.primaryServiceTitle}
                    className="w-11 h-11 rounded-xl object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <div>
                    <h3 className="font-bold text-sm text-gray-900 group-hover:text-[#003d9b] transition-colors">
                      {b.primaryServiceTitle}
                    </h3>
                    <p className="text-xs text-gray-500">
                      {b.status} • {b.date}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1 text-xs font-bold text-[#003d9b]">
                  <span className="hidden sm:inline">Get help with this booking</span>
                  <span className="sm:hidden">Help</span>
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Common Topics Grid (Matching Screenshot) */}
      <section className="mb-6">
        <h2 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2.5">
          Common Topics
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {commonTopics.map((topic) => (
            <button
              key={topic.id}
              onClick={() => setActiveChatTopic(topic.title)}
              className="bg-white border border-[#c3c6d6]/80 rounded-2xl p-4 text-left hover:border-[#003d9b] hover:shadow-xs transition-all flex items-start gap-3.5 group"
            >
              <div className="p-2.5 rounded-xl bg-blue-50 text-[#003d9b] group-hover:bg-[#003d9b] group-hover:text-white transition-colors shrink-0">
                {topic.icon}
              </div>
              <div>
                <h3 className="font-bold text-sm text-gray-900 group-hover:text-[#003d9b] transition-colors">
                  {topic.title}
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">{topic.desc}</p>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* Direct Contact Channels */}
      <section className="bg-gradient-to-br from-blue-900 to-indigo-950 text-white rounded-2xl p-5 shadow-md">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-500 text-white px-2 py-0.5 rounded-md">
              Nashik Central Desk
            </span>
            <h3 className="text-lg font-bold text-white mt-1">Speak to a Nashik Support Executive</h3>
            <p className="text-xs text-blue-100/80 mt-0.5">
              Available 7 days a week: 8:00 AM to 9:00 PM IST
            </p>
          </div>
          <div className="flex gap-2">
            <a
              href="tel:18008726675"
              className="bg-white text-[#003d9b] font-bold text-xs px-4 py-2.5 rounded-xl flex items-center gap-1.5 hover:bg-blue-50 transition-colors shadow-xs"
            >
              <Phone className="w-3.5 h-3.5" /> Call 1800-URBN-NSK
            </a>
          </div>
        </div>
      </section>

      {/* Interactive Support Chat Drawer/Modal */}
      {activeChatTopic && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl w-full max-w-lg h-[500px] shadow-2xl border border-gray-100 flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Chat Header */}
            <div className="bg-[#003d9b] text-white p-4 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm">{activeChatTopic}</h3>
                <span className="text-[11px] text-blue-100 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  URBN Nashik Support Online
                </span>
              </div>
              <button
                onClick={() => setActiveChatTopic(null)}
                className="text-white/80 hover:text-white text-sm font-bold p-1"
              >
                ✕
              </button>
            </div>

            {/* Chat Body */}
            <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-gray-50 text-xs">
              {chatMessages.map((m, i) => (
                <div
                  key={i}
                  className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`p-3 rounded-2xl max-w-[85%] ${
                      m.sender === 'user'
                        ? 'bg-[#003d9b] text-white rounded-br-none'
                        : 'bg-white text-gray-800 border border-gray-200 rounded-bl-none shadow-2xs'
                    }`}
                  >
                    {m.text}
                  </div>
                </div>
              ))}
            </div>

            {/* Chat Input */}
            <div className="p-3 border-t border-gray-200 bg-white flex gap-2">
              <input
                type="text"
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendQuery()}
                placeholder="Type your question or issue description..."
                className="flex-1 text-xs border border-gray-300 rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-[#003d9b]"
              />
              <button
                onClick={handleSendQuery}
                className="bg-[#003d9b] text-white px-4 py-2.5 rounded-xl hover:bg-blue-800 active:scale-95 font-bold flex items-center gap-1"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
