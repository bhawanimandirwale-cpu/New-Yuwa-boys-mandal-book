'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '@/lib/context/AppContext';
import { formatCurrencyINR, toDevanagariDigits } from '@/lib/formatters';
import { 
  Users, 
  UserPlus, 
  ShieldAlert, 
  Wallet, 
  Flame, 
  Share2, 
  Copy, 
  Check, 
  Search, 
  Phone, 
  Mail, 
  CheckCircle2, 
  XCircle, 
  Loader2, 
  MoreVertical,
  X,
  MessageCircle,
  Award
} from 'lucide-react';

interface MemberItem {
  id: string;
  userId: string | null;
  name: string;
  email: string;
  phone: string;
  avatarUrl: string;
  role: 'ADMIN' | 'TREASURER' | 'VOLUNTEER' | 'MEMBER';
  status: 'ACTIVE' | 'INVITED' | 'SUSPENDED';
  joinedAt: string;
  totalCollected: number;
  receiptCount: number;
}

const ROLE_CONFIG: Record<string, { label: string; icon: any; badgeClass: string }> = {
  ADMIN: {
    label: 'अध्यक्ष',
    icon: ShieldAlert,
    badgeClass: 'bg-red-50 text-red-700 border-red-200',
  },
  TREASURER: {
    label: 'खजिनदार',
    icon: Wallet,
    badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  },
  VOLUNTEER: {
    label: 'कार्यकर्ता (Collector)',
    icon: Flame,
    badgeClass: 'bg-amber-50 text-amber-700 border-amber-200',
  },
  MEMBER: {
    label: 'सदस्य',
    icon: Users,
    badgeClass: 'bg-blue-50 text-blue-700 border-blue-200',
  },
};

export default function MembersPage() {
  const { mandal, currentRole } = useApp();
  const isAdmin = currentRole === 'ADMIN';

  const [members, setMembers] = useState<MemberItem[]>([]);
  const [inviteCode, setInviteCode] = useState('NYB026');
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [copied, setCopied] = useState(false);

  // Add Member Modal State
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [addName, setAddName] = useState('');
  const [addPhone, setAddPhone] = useState('');
  const [addEmail, setAddEmail] = useState('');
  const [addRole, setAddRole] = useState<'ADMIN' | 'TREASURER' | 'VOLUNTEER' | 'MEMBER'>('VOLUNTEER');
  const [submitting, setSubmitting] = useState(false);

  const fetchMembers = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/members');
      const data = await res.json();
      if (res.ok) {
        setMembers(data.members || []);
        if (data.inviteCode) setInviteCode(data.inviteCode);
      }
    } catch (err) {
      console.error('Error fetching members:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, []);

  const appUrl = typeof window !== 'undefined' ? window.location.origin : 'https://new-yuwa-boys-mandal-book.vercel.app';
  const inviteLink = `${appUrl}/join/${inviteCode}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(inviteLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleShareWhatsApp = () => {
    const text = `॥ श्री गणेश प्रसन्न ॥\n\n*न्यू युवा गणेश मंडळ, केऱ्हाळे बु.*\nसर्व कार्यकर्त्यांनी डिजिटल जमा-खर्च बहीखाता व पावती तयार करण्यासाठी या अधिकृत लिंकवर क्लिक करून जॉइन व्हा:\n\n👉 ${inviteLink}\n\nमंडळ आमंत्रण कोड: *${inviteCode}*`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addName.trim()) return;

    try {
      setSubmitting(true);
      const res = await fetch('/api/members', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: addName.trim(),
          phone: addPhone.trim(),
          email: addEmail.trim(),
          role: addRole,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'कार्यकर्ता जोडताना त्रुटी आली.');
      }

      setIsAddOpen(false);
      setAddName('');
      setAddPhone('');
      setAddEmail('');
      setAddRole('VOLUNTEER');
      await fetchMembers();
    } catch (err: any) {
      alert(err.message || 'त्रुटी आली.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async (member: MemberItem) => {
    if (!isAdmin) {
      alert('फक्त ॲडमिनला स्थिती बदलण्याचा अधिकार आहे.');
      return;
    }
    const newStatus = member.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    try {
      const res = await fetch(`/api/members/${member.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.ok) {
        setMembers((prev) =>
          prev.map((m) => (m.id === member.id ? { ...m, status: newStatus } : m))
        );
      }
    } catch (err) {
      console.error('Error updating status:', err);
    }
  };

  const handleRoleChange = async (memberId: string, newRole: string) => {
    if (!isAdmin) {
      alert('फक्त ॲडमिनला भूमिका बदलण्याचा अधिकार आहे.');
      return;
    }
    try {
      const res = await fetch(`/api/members/${memberId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole }),
      });

      if (res.ok) {
        setMembers((prev) =>
          prev.map((m) => (m.id === memberId ? { ...m, role: newRole as any } : m))
        );
      }
    } catch (err) {
      console.error('Error updating role:', err);
    }
  };

  // Filtered members
  const filtered = members.filter((m) => {
    const matchesSearch =
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.phone.includes(search) ||
      m.email.toLowerCase().includes(search.toLowerCase());
    const matchesRole = roleFilter === 'ALL' || m.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const totalMembers = members.length;
  const activeVolunteers = members.filter((m) => m.status === 'ACTIVE').length;
  const totalCollectedByTeam = members.reduce((sum, m) => sum + (m.totalCollected || 0), 0);
  const totalReceiptsIssued = members.reduce((sum, m) => sum + (m.receiptCount || 0), 0);

  return (
    <div className="space-y-4 sm:space-y-6 notranslate">
      {/* 1. Header Banner */}
      <div className="bg-gradient-to-r from-saffron-600 via-amber-500 to-saffron-700 rounded-3xl p-4 sm:p-6 text-white shadow-lg shadow-saffron-500/20 relative overflow-hidden">
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="text-xs font-bold tracking-widest text-amber-100 font-heading">
              ॥ श्री गणेश प्रसन्न ॥
            </div>
            <h1 className="text-xl sm:text-2xl font-black font-heading mt-0.5">
              कार्यकर्ता व सदस्य व्यवस्थापन
            </h1>
            <p className="text-xs text-amber-50 mt-1">
              {mandal?.name || 'न्यू युवा गणेश मंडळ, केऱ्हाळे बु.'} — अधिकृत डिजिटल टीम
            </p>
          </div>

          {isAdmin && (
            <button
              onClick={() => setIsAddOpen(true)}
              className="self-start sm:self-auto px-4 py-2.5 rounded-2xl bg-white text-saffron-700 font-extrabold text-xs sm:text-sm shadow-md hover:bg-amber-50 active:scale-95 transition-all flex items-center gap-2"
            >
              <UserPlus className="w-4 h-4 text-saffron-600" />
              <span>＋ नवीन कार्यकर्ता जोडा</span>
            </button>
          )}
        </div>
      </div>

      {/* 2. Top Summary KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-gray-200 shadow-sm">
          <div className="text-[11px] font-bold text-gray-500">एकूण टीम (Total)</div>
          <div className="text-lg sm:text-2xl font-extrabold text-gray-900 mt-1">
            {toDevanagariDigits(totalMembers)}
          </div>
          <div className="text-[10px] text-gray-400 mt-0.5">नोंदणीकृत सदस्य</div>
        </div>

        <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-emerald-200 bg-emerald-50/20 shadow-sm">
          <div className="text-[11px] font-bold text-emerald-800">सक्रिय कार्यकर्ते</div>
          <div className="text-lg sm:text-2xl font-extrabold text-emerald-700 mt-1">
            {toDevanagariDigits(activeVolunteers)}
          </div>
          <div className="text-[10px] text-emerald-600 mt-0.5">पावती बनवण्यास पात्र</div>
        </div>

        <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-saffron-200 bg-saffron-50/20 shadow-sm">
          <div className="text-[11px] font-bold text-saffron-800">टीमने गोळा केलेली रक्कम</div>
          <div className="text-lg sm:text-2xl font-extrabold text-saffron-700 mt-1">
            {formatCurrencyINR(totalCollectedByTeam)}
          </div>
          <div className="text-[10px] text-saffron-600 mt-0.5">एकूण वर्गणी जमा</div>
        </div>

        <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-blue-200 bg-blue-50/20 shadow-sm">
          <div className="text-[11px] font-bold text-blue-800">कापलेल्या एकूण पावत्या</div>
          <div className="text-lg sm:text-2xl font-extrabold text-blue-700 mt-1">
            {toDevanagariDigits(totalReceiptsIssued)}
          </div>
          <div className="text-[10px] text-blue-600 mt-0.5">डिजिटल WhatsApp पावत्या</div>
        </div>
      </div>

      {/* 3. 1-Click WhatsApp Invite System Card */}
      <div className="bg-gradient-to-br from-emerald-500/10 via-teal-500/10 to-green-500/10 border border-emerald-200 rounded-3xl p-4 sm:p-5">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-lg bg-emerald-600 text-white font-extrabold text-xs">
                १-क्लिक WhatsApp आमंत्रण
              </span>
              <span className="text-xs font-bold text-gray-500">
                मंडळ कोड: <b className="text-emerald-800 font-mono tracking-wider">{inviteCode}</b>
              </span>
            </div>
            <p className="text-xs text-gray-700 max-w-xl">
              कार्यकर्त्यांना व्हॉट्सॲपवर आमंत्रण पाठवा. ते या लिंकवर क्लिक करून थेट मंडळाच्या बहीखात्यात जॉइन होऊ शकतात आणि वर्गणी गोळा करू शकतात.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            <button
              onClick={handleCopyLink}
              className="flex-1 md:flex-initial px-3.5 py-2.5 rounded-xl border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm active:scale-95 transition-all"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span className="text-emerald-700">कॉपी झाली!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 text-gray-500" />
                  <span>लिंक कॉपी करा</span>
                </>
              )}
            </button>

            <button
              onClick={handleShareWhatsApp}
              className="flex-1 md:flex-initial px-4 py-2.5 rounded-xl bg-[#25D366] hover:bg-[#20bd5a] text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-sm active:scale-95 transition-all"
            >
              <Share2 className="w-4 h-4" />
              <span>WhatsApp वर पाठवा</span>
            </button>
          </div>
        </div>
      </div>

      {/* 4. Filter & Search Bar */}
      <div className="bg-white p-3 sm:p-4 rounded-2xl border border-gray-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="कार्यकर्ता नाव किंवा फोन शोधा..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-gray-300 text-xs focus:outline-none focus:ring-2 focus:ring-saffron-500/30 focus:border-saffron-500 font-medium"
          />
        </div>

        {/* Role Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          {[
            { key: 'ALL', label: 'सर्व (All)' },
            { key: 'ADMIN', label: 'अध्यक्ष' },
            { key: 'TREASURER', label: 'खजिनदार' },
            { key: 'VOLUNTEER', label: 'कार्यकर्ते' },
            { key: 'MEMBER', label: 'सदस्य' },
          ].map((r) => (
            <button
              key={r.key}
              onClick={() => setRoleFilter(r.key)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                roleFilter === r.key
                  ? 'bg-saffron-600 text-white shadow-sm'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {/* 5. Members / Karyakarta List */}
      {loading ? (
        <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
          <Loader2 className="w-8 h-8 text-saffron-600 animate-spin mx-auto mb-2" />
          <p className="text-xs text-gray-500">कार्यकर्त्यांची माहिती लोड होत आहे...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center space-y-3">
          <Users className="w-12 h-12 text-gray-300 mx-auto" />
          <p className="text-sm font-bold text-gray-700">कोणताही कार्यकर्ता आढळला नाही.</p>
          <button
            onClick={() => setIsAddOpen(true)}
            className="px-4 py-2 rounded-xl bg-saffron-600 text-white font-bold text-xs"
          >
            ＋ नवीन कार्यकर्ता जोडा
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
          {filtered.map((m, idx) => {
            const roleInfo = ROLE_CONFIG[m.role] || ROLE_CONFIG.VOLUNTEER;
            const RoleIcon = roleInfo.icon;
            const isSuspended = m.status === 'SUSPENDED';

            return (
              <div
                key={m.id}
                className={`bg-white rounded-2xl border p-4 shadow-sm transition-all relative ${
                  isSuspended ? 'border-gray-300 opacity-60 bg-gray-50/50' : 'border-gray-200 hover:shadow-md'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    {/* Avatar */}
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-saffron-500 to-amber-400 text-white flex items-center justify-center font-black text-base shadow-sm shrink-0">
                      {m.name.substring(0, 1).toUpperCase()}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <h3 className="font-bold text-sm text-gray-900 truncate font-heading">
                          {m.name}
                        </h3>
                        {idx === 0 && m.totalCollected > 0 && (
                          <span className="px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-extrabold flex items-center gap-0.5">
                            <Award className="w-3 h-3 text-amber-600" />
                            <span>टॉप वसुली</span>
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2 text-xs text-gray-500 mt-0.5 flex-wrap">
                        {m.phone && (
                          <span className="flex items-center gap-1">
                            <Phone className="w-3 h-3 text-gray-400" />
                            <span>{m.phone}</span>
                          </span>
                        )}
                        {m.email && !m.email.includes('@mandalbook.local') && (
                          <span className="flex items-center gap-1 truncate max-w-[140px]">
                            <Mail className="w-3 h-3 text-gray-400" />
                            <span className="truncate">{m.email}</span>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Role Selector / Badge - Only Admin can change role */}
                  <div className="shrink-0">
                    {isAdmin ? (
                      <select
                        value={m.role}
                        onChange={(e) => handleRoleChange(m.id, e.target.value)}
                        className="px-2.5 py-1 text-xs font-bold rounded-lg border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-saffron-500/30 cursor-pointer"
                        title="भूमिका बदला (केवळ ॲडमिन)"
                      >
                        <option value="ADMIN">अध्यक्ष (Adhyaksh - सर्व अधिकार)</option>
                        <option value="TREASURER">खजिनदार</option>
                        <option value="VOLUNTEER">कार्यकर्ता</option>
                        <option value="MEMBER">सदस्य</option>
                      </select>
                    ) : (
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold rounded-lg border ${roleInfo.badgeClass}`}
                        title={`भूमिका: ${roleInfo.label}`}
                      >
                        <RoleIcon className="w-3.5 h-3.5" />
                        <span>{roleInfo.label}</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Collection Performance Stats */}
                <div className="mt-3.5 pt-3 border-t border-gray-100 grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-orange-50/60 p-2 rounded-xl border border-orange-100">
                    <div className="text-[10px] text-gray-500 font-medium">जमा केलेली रक्कम</div>
                    <div className="font-extrabold text-saffron-700 text-sm mt-0.5">
                      {formatCurrencyINR(m.totalCollected || 0)}
                    </div>
                  </div>

                  <div className="bg-blue-50/60 p-2 rounded-xl border border-blue-100">
                    <div className="text-[10px] text-gray-500 font-medium">कापलेल्या पावत्या</div>
                    <div className="font-extrabold text-blue-700 text-sm mt-0.5">
                      {toDevanagariDigits(m.receiptCount || 0)} पावत्या
                    </div>
                  </div>
                </div>

                {/* Footer Controls: WhatsApp Chat & Status Toggle */}
                <div className="mt-3 flex items-center justify-between gap-2 pt-2 text-xs">
                  <span
                    className={`inline-flex items-center gap-1 font-bold text-[11px] ${
                      isSuspended ? 'text-gray-400' : 'text-emerald-700'
                    }`}
                  >
                    {isSuspended ? (
                      <>
                        <XCircle className="w-3.5 h-3.5 text-gray-400" />
                        <span>निलंबित</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>सक्रिय कार्यकर्ता</span>
                      </>
                    )}
                  </span>

                  <div className="flex items-center gap-2">
                    {m.phone && (
                      <a
                        href={`https://wa.me/91${m.phone.replace(/\D/g, '')}`}
                        target="_blank"
                        rel="noreferrer"
                        className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold text-[11px] flex items-center gap-1"
                      >
                        <MessageCircle className="w-3 h-3" />
                        <span>WhatsApp</span>
                      </a>
                    )}

                    {isAdmin && (
                      <button
                        type="button"
                        onClick={() => handleToggleStatus(m)}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border ${
                          isSuspended
                            ? 'border-emerald-300 text-emerald-700 hover:bg-emerald-50'
                            : 'border-red-200 text-red-600 hover:bg-red-50'
                        }`}
                      >
                        {isSuspended ? 'सक्रिय करा' : 'निलंबित करा'}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 6. "＋ नवीन कार्यकर्ता जोडा" Modal */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm">
          <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100">
            {/* Modal Header */}
            <div className="p-4 sm:p-5 bg-gradient-to-r from-saffron-500 to-saffron-600 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <UserPlus className="w-5 h-5" />
                <h2 className="font-black text-base font-heading">नवीन कार्यकर्ता / सदस्य जोडा</h2>
              </div>
              <button
                onClick={() => setIsAddOpen(false)}
                className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body Form */}
            <form onSubmit={handleAddMember} className="p-5 space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  पूर्ण नाव (Full Name) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="उदा. राहुल दीपक शिंदे"
                  value={addName}
                  onChange={(e) => setAddName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-xs focus:outline-none focus:ring-2 focus:ring-saffron-500/30 focus:border-saffron-500 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  मोबाईल नंबर (WhatsApp Mobile) *
                </label>
                <input
                  type="tel"
                  required
                  placeholder="उदा. 9876543210"
                  value={addPhone}
                  onChange={(e) => setAddPhone(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-xs focus:outline-none focus:ring-2 focus:ring-saffron-500/30 focus:border-saffron-500 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  ईमेल (पर्यायी - Gmail)
                </label>
                <input
                  type="email"
                  placeholder="उदा. name@gmail.com"
                  value={addEmail}
                  onChange={(e) => setAddEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-xs focus:outline-none focus:ring-2 focus:ring-saffron-500/30 focus:border-saffron-500 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  पद / भूमिका (Role) *
                </label>
                <select
                  value={addRole}
                  onChange={(e) => setAddRole(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-saffron-500/30 focus:border-saffron-500 bg-white"
                >
                  <option value="VOLUNTEER">कार्यकर्ता (Field Collector - वर्गणी पावती अधिकार)</option>
                  <option value="TREASURER">खजिनदार (Treasurer - खर्च मंजूरी व संपूर्ण ताळेबंद)</option>
                  <option value="ADMIN">अध्यक्ष (Adhyaksh - मंडळ प्रमुख व सर्व अधिकार)</option>
                  <option value="MEMBER">सदस्य (General Member - फक्त पाहण्याचा अधिकार)</option>
                </select>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-saffron-500 to-saffron-600 hover:from-saffron-600 hover:to-saffron-700 text-white font-extrabold text-xs sm:text-sm shadow-md shadow-saffron-500/25 flex items-center justify-center gap-2 active:scale-95 transition-all"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>जतन होत आहे...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>कार्यकर्ता जतन करा</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
