'use client';

import { useEffect, useState } from 'react';
import {
  Shield, Building2, Calendar, Clock, CheckCircle, XCircle,
  Loader2, Ticket, User, ChevronRight, BarChart3, AlertCircle
} from 'lucide-react';
import {
  updateOwnerApproval,
  subscribeAllUsers,
  subscribeAllVenues,
  subscribeAllBookings
} from '@/backend/firebase/firestore';
import { UserProfile, Venue, Booking } from '@/shared/types';
import { formatCurrency, formatDate, getSportEmoji, cn } from '@/shared/helpers/utils';

type AdminTab = 'overview' | 'approvals' | 'players' | 'owners' | 'venues' | 'bookings';

export default function AdminDashboardPage() {
  const [tab, setTab] = useState<AdminTab>('overview');
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [venues, setVenues] = useState<Venue[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [approvingId, setApprovingId] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState('');

  const showSuccess = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  useEffect(() => {
    let usersLoaded = false;
    let venuesLoaded = false;
    let bookingsLoaded = false;

    const checkLoading = () => {
      if (usersLoaded && venuesLoaded && bookingsLoaded) {
        setLoading(false);
      }
    };

    const unsubUsers = subscribeAllUsers((u) => {
      setUsers(u);
      usersLoaded = true;
      checkLoading();
    });

    const unsubVenues = subscribeAllVenues((v) => {
      setVenues(v);
      venuesLoaded = true;
      checkLoading();
    });

    const unsubBookings = subscribeAllBookings((b) => {
      setBookings(b);
      bookingsLoaded = true;
      checkLoading();
    });

    return () => {
      unsubUsers();
      unsubVenues();
      unsubBookings();
    };
  }, []);

  const handleApprove = async (uid: string) => {
    setApprovingId(uid);
    try {
      await updateOwnerApproval(uid, 'approved');
      showSuccess('✅ Owner approved!');
    } catch (err) {
      console.error('Error approving owner:', err);
    } finally {
      setApprovingId(null);
    }
  };

  const handleReject = async (uid: string) => {
    setApprovingId(uid);
    try {
      await updateOwnerApproval(uid, 'rejected');
      showSuccess('🚫 Owner rejected.');
    } catch (err) {
      console.error('Error rejecting owner:', err);
    } finally {
      setApprovingId(null);
    }
  };

  // Derived lists
  const players = users.filter((u) => u.role === 'player');
  const owners = users.filter((u) => u.role === 'owner');
  const pendingOwners = owners.filter((u) => u.approvalStatus === 'pending');
  const approvedOwners = owners.filter((u) => u.approvalStatus === 'approved');

  const TABS: { id: AdminTab; label: string; icon: React.ReactNode; badge?: number }[] = [
    { id: 'overview', label: 'Overview', icon: <BarChart3 className="w-4 h-4" /> },
    { id: 'approvals', label: 'Approvals', icon: <Clock className="w-4 h-4" />, badge: pendingOwners.length },
    { id: 'players', label: 'Players', icon: <User className="w-4 h-4" /> },
    { id: 'owners', label: 'Owners', icon: <Building2 className="w-4 h-4" /> },
    { id: 'venues', label: 'Venues', icon: <Building2 className="w-4 h-4" /> },
    { id: 'bookings', label: 'Bookings', icon: <Calendar className="w-4 h-4" /> },
  ];

  if (loading) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-10 h-10 text-purple-400 animate-spin mx-auto mb-4" />
          <p className="text-slate-400 font-medium">Loading platform data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-16 px-4 bg-gradient-to-br from-[#0a0512] to-[#0a0a1a]">
      <div className="max-w-6xl mx-auto">
        {/* ── Header ──────────────────────────────────────────────────── */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-8 h-8 rounded-md bg-purple-500 border-2 border-black flex items-center justify-center shadow-[2px_2px_0px_#000]">
                <Shield className="w-4 h-4 text-white" />
              </div>
              <h1 className="font-display text-3xl font-bold text-white">
                Admin <span className="text-[#a855f7]">Dashboard</span>
              </h1>
            </div>
            <p className="text-slate-400 text-sm">PlaySphere AI — Super Admin Control Panel</p>
          </div>
          <div className="flex items-center gap-3">
            {successMsg && (
              <div className="bg-purple-500 border-2 border-black rounded-md px-4 py-2 text-white text-sm font-bold shadow-[3px_3px_0px_#000]">
                {successMsg}
              </div>
            )}
            {pendingOwners.length > 0 && (
              <button
                onClick={() => setTab('approvals')}
                className="flex items-center gap-2 bg-amber-400 border-2 border-black rounded-md px-4 py-2 text-black text-sm font-bold shadow-[3px_3px_0px_#000] hover:-translate-y-0.5 hover:shadow-[4px_4px_0px_#000] transition-all"
              >
                <AlertCircle className="w-4 h-4" />
                {pendingOwners.length} Pending Approval{pendingOwners.length !== 1 ? 's' : ''}
              </button>
            )}
          </div>
        </div>

        {/* ── Tabs ────────────────────────────────────────────────────── */}
        <div className="flex gap-2 mb-6 overflow-x-auto scrollbar-hide p-1">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={cn(
                'relative flex items-center gap-2 px-4 py-2.5 rounded-md text-sm font-bold whitespace-nowrap transition-all border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]',
                tab === t.id
                  ? 'bg-purple-500 text-white shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] translate-x-0.5 translate-y-0.5'
                  : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800 hover:-translate-y-0.5 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]'
              )}
            >
              {t.icon} {t.label}
              {t.badge && t.badge > 0 && (
                <span className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 border-2 border-black rounded-full text-white text-[10px] font-black flex items-center justify-center shadow-[1px_1px_0px_#000]">
                  {t.badge}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* ── TAB: OVERVIEW ─────────────────────────────────────────── */}
        {tab === 'overview' && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {[
                { label: 'Total Users', value: users.length, color: 'text-purple-400', icon: '👥' },
                { label: 'Players', value: players.length, color: 'text-cyan-400', icon: '🏃' },
                { label: 'Total Owners', value: owners.length, color: 'text-amber-400', icon: '🏢' },
                { label: 'Approved Owners', value: approvedOwners.length, color: 'text-emerald-400', icon: '✅' },
                { label: 'Total Venues', value: venues.length, color: 'text-indigo-400', icon: '📍' },
                { label: 'Total Bookings', value: bookings.length, color: 'text-rose-400', icon: '📅' },
              ].map((stat) => (
                <div key={stat.label} className="bg-slate-900/80 backdrop-blur rounded-lg p-5 border-2 border-black shadow-[4px_4px_0px_0px_#000] text-center">
                  <div className="text-3xl mb-2">{stat.icon}</div>
                  <div className={`font-display text-2xl font-bold ${stat.color}`}>{stat.value}</div>
                  <div className="text-slate-400 text-xs mt-1">{stat.label}</div>
                </div>
              ))}
            </div>

            {pendingOwners.length > 0 && (
              <div className="bg-amber-400/10 border-2 border-amber-400/40 rounded-lg p-5 shadow-[3px_3px_0px_rgba(245,158,11,0.3)]">
                <div className="flex items-center gap-3 mb-3">
                  <AlertCircle className="w-5 h-5 text-amber-400" />
                  <h3 className="font-display font-bold text-amber-300">Approval Queue</h3>
                </div>
                <p className="text-amber-200 text-sm mb-4">
                  {pendingOwners.length} owner{pendingOwners.length !== 1 ? 's' : ''} waiting for approval.
                </p>
                <button onClick={() => setTab('approvals')} className="flex items-center gap-2 bg-amber-400 border-2 border-black px-4 py-2 rounded-md text-black text-sm font-bold shadow-[3px_3px_0px_#000] hover:-translate-y-0.5 transition-all">
                  Review Approvals <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        )}

        {/* ── TAB: APPROVALS ────────────────────────────────────────── */}
        {tab === 'approvals' && (
          <div className="space-y-4">
            <h2 className="font-display text-xl font-bold text-white flex items-center gap-2">
              <Clock className="w-5 h-5 text-amber-400" /> Owner Approval Queue ({pendingOwners.length} pending)
            </h2>
            {pendingOwners.length === 0 ? (
              <div className="glass rounded-lg p-12 text-center border-2 border-black">
                <CheckCircle className="w-12 h-12 text-emerald-400 mx-auto mb-4" />
                <h3 className="font-display text-xl font-bold text-white mb-2">All clear!</h3>
                <p className="text-slate-400">No pending owner approvals.</p>
              </div>
            ) : (
              pendingOwners.map((owner) => (
                <div key={owner.uid} className="glass rounded-lg p-5 border-2 border-black shadow-[4px_4px_0px_0px_#000] flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-md bg-gradient-to-br from-purple-500 to-indigo-600 border-2 border-black flex items-center justify-center text-white text-xl font-bold shadow-[2px_2px_0px_#000]">
                      {owner.displayName?.[0]?.toUpperCase() || 'O'}
                    </div>
                    <div>
                      <div className="font-display font-bold text-white">{owner.displayName}</div>
                      <div className="text-slate-400 text-sm">{owner.email}</div>
                      <div className="text-slate-500 text-xs mt-1">
                        {venues.filter((v) => v.ownerId === owner.uid).length} venues listed
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 ml-auto">
                    <span className="bg-amber-400/20 border-2 border-amber-400/40 text-amber-300 text-xs font-bold px-3 py-1.5 rounded-md">
                      Pending
                    </span>
                    <button
                      onClick={() => handleApprove(owner.uid)}
                      disabled={approvingId === owner.uid}
                      className="flex items-center gap-1.5 bg-emerald-400 border-2 border-black text-black text-sm font-bold px-4 py-2 rounded-md shadow-[3px_3px_0px_#000] hover:-translate-y-0.5 hover:shadow-[4px_4px_0px_#000] transition-all disabled:opacity-50"
                    >
                      {approvingId === owner.uid ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                      Approve
                    </button>
                    <button
                      onClick={() => handleReject(owner.uid)}
                      disabled={approvingId === owner.uid}
                      className="flex items-center gap-1.5 bg-rose-500 border-2 border-black text-white text-sm font-bold px-4 py-2 rounded-md shadow-[3px_3px_0px_#000] hover:-translate-y-0.5 hover:shadow-[4px_4px_0px_#000] transition-all disabled:opacity-50"
                    >
                      <XCircle className="w-4 h-4" /> Reject
                    </button>
                  </div>
                </div>
              ))
            )}

            {/* Approved owners list below */}
            {approvedOwners.length > 0 && (
              <div className="mt-8">
                <h3 className="font-display font-bold text-slate-400 text-sm uppercase tracking-wider mb-3">Approved Owners ({approvedOwners.length})</h3>
                {approvedOwners.map((owner) => (
                  <div key={owner.uid} className="glass rounded-lg p-4 border-2 border-black mb-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-md bg-emerald-900/40 border-2 border-black flex items-center justify-center text-emerald-400 font-bold shadow-[2px_2px_0px_#000]">
                        {owner.displayName?.[0]?.toUpperCase() || 'O'}
                      </div>
                      <div>
                        <div className="font-bold text-white text-sm">{owner.displayName}</div>
                        <div className="text-slate-400 text-xs">{owner.email}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-slate-400">{venues.filter((v) => v.ownerId === owner.uid).length} venues</span>
                      <span className="bg-emerald-400/20 border-2 border-emerald-400/40 text-emerald-400 text-xs font-bold px-2.5 py-1 rounded-md">Approved</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── TAB: PLAYERS ──────────────────────────────────────────── */}
        {tab === 'players' && (
          <div className="space-y-3">
            <h2 className="font-display text-xl font-bold text-white mb-4 flex items-center gap-2">
              <User className="w-5 h-5 text-cyan-400" /> Players ({players.length})
            </h2>
            {players.length === 0 ? (
              <div className="glass rounded-lg p-12 text-center border-2 border-black">
                <div className="text-4xl mb-3">👥</div>
                <h3 className="font-display text-lg font-bold text-white mb-1">No Players Registered</h3>
                <p className="text-slate-400 text-sm">When users sign up as players, they will appear here.</p>
              </div>
            ) : (
              players.map((p) => (
                <div key={p.uid} className="glass rounded-lg p-4 border-2 border-black flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-md bg-cyan-900/30 border-2 border-black flex items-center justify-center text-cyan-400 font-bold shadow-[2px_2px_0px_#000]">
                      {p.displayName?.[0]?.toUpperCase() || 'P'}
                    </div>
                    <div>
                      <div className="font-bold text-white text-sm">{p.displayName}</div>
                      <div className="text-slate-400 text-xs">{p.email}</div>
                    </div>
                  </div>
                  <div className="text-slate-400 text-xs">
                    {bookings.filter((b) => b.userId === p.uid).length} bookings
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* ── TAB: OWNERS ───────────────────────────────────────────── */}
        {tab === 'owners' && (
          <div className="space-y-3">
            <h2 className="font-display text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-amber-400" /> Venue Owners ({owners.length})
            </h2>
            {owners.length === 0 ? (
              <div className="glass rounded-lg p-12 text-center border-2 border-black">
                <div className="text-4xl mb-3">🏢</div>
                <h3 className="font-display text-lg font-bold text-white mb-1">No Venue Owners Registered</h3>
                <p className="text-slate-400 text-sm">When users sign up as owners, they will appear here.</p>
              </div>
            ) : (
              owners.map((o) => {
                const ownerVenues = venues.filter((v) => v.ownerId === o.uid);
                const ownerBookings = bookings.filter((b) => ownerVenues.some((v) => v.id === b.venueId));
                return (
                  <div key={o.uid} className="glass rounded-lg p-4 border-2 border-black">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-md bg-amber-900/30 border-2 border-black flex items-center justify-center text-amber-400 font-bold shadow-[2px_2px_0px_#000]">
                          {o.displayName?.[0]?.toUpperCase() || 'O'}
                        </div>
                        <div>
                          <div className="font-bold text-white text-sm">{o.displayName}</div>
                          <div className="text-slate-400 text-xs">{o.email}</div>
                        </div>
                      </div>
                      <span className={cn(
                        'text-xs font-bold px-2.5 py-1 rounded-md border-2 border-black shadow-[2px_2px_0px_#000]',
                        o.approvalStatus === 'approved' ? 'bg-emerald-400 text-black' :
                        o.approvalStatus === 'pending' ? 'bg-amber-400 text-black' : 'bg-rose-400 text-black'
                      )}>
                        {o.approvalStatus || 'pending'}
                      </span>
                    </div>
                    <div className="flex gap-4 mt-3 text-xs text-slate-400">
                      <span>{ownerVenues.length} venues</span>
                      <span>•</span>
                      <span>{ownerBookings.length} total bookings</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* ── TAB: VENUES ───────────────────────────────────────────── */}
        {tab === 'venues' && (
          <div className="space-y-3">
            <h2 className="font-display text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-indigo-400" /> All Venues ({venues.length})
            </h2>
            {venues.length === 0 ? (
              <div className="glass rounded-lg p-12 text-center border-2 border-black">
                <div className="text-4xl mb-3">📍</div>
                <h3 className="font-display text-lg font-bold text-white mb-1">No Venues Registered</h3>
                <p className="text-slate-400 text-sm">When owners list venues on the platform, they will appear here.</p>
              </div>
            ) : (
              venues.map((v) => {
                const owner = users.find((u) => u.uid === v.ownerId);
                return (
                  <div key={v.id} className="glass rounded-lg p-4 border-2 border-black flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="text-2xl bg-slate-900 w-11 h-11 flex items-center justify-center rounded-md border border-black shadow-[2px_2px_0px_#000]">
                        {getSportEmoji(v.sport)}
                      </div>
                      <div>
                        <div className="font-bold text-white text-sm">{v.name}</div>
                        <div className="text-slate-400 text-xs">
                          {v.area} • {owner ? owner.displayName : 'System'} • {formatCurrency(v.price)}/hr
                        </div>
                      </div>
                    </div>
                    <span className={cn(
                      'text-xs font-bold px-2.5 py-1 rounded-md border-2 border-black',
                      v.available ? 'bg-emerald-400 text-black' : 'bg-rose-400 text-black'
                    )}>
                      {v.available ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* ── TAB: BOOKINGS ─────────────────────────────────────────── */}
        {tab === 'bookings' && (
          <div className="space-y-3">
            <h2 className="font-display text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-rose-400" /> All Bookings ({bookings.length})
            </h2>
            {bookings.length === 0 ? (
              <div className="glass rounded-lg p-12 text-center border-2 border-black">
                <div className="text-4xl mb-3">📅</div>
                <h3 className="font-display text-lg font-bold text-white mb-1">No Bookings Made</h3>
                <p className="text-slate-400 text-sm">When players make court or turf bookings, they will show up here.</p>
              </div>
            ) : (
              bookings.map((b) => {
                const bStatus = b.bookingStatus || b.status || 'pending';
                const pStatus = b.paymentStatus || 'paid';
                const ticketId = b.ticketId || b.ticketNumber;
                const amount = b.amount !== undefined ? b.amount : (b.price || 0);

                const statusText = bStatus.charAt(0).toUpperCase() + bStatus.slice(1);
                let statusClass = 'bg-cyan-400 text-black';
                if (bStatus === 'cancelled') statusClass = 'bg-rose-400 text-black';
                if (bStatus === 'completed') statusClass = 'bg-emerald-400 text-black';

                const paymentText = pStatus.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase());
                let paymentClass = 'text-amber-400 border-amber-400/40 bg-amber-400/10';
                if (pStatus === 'paid') paymentClass = 'text-emerald-400 border-emerald-400/40 bg-emerald-400/10';
                if (pStatus === 'rejected') paymentClass = 'text-rose-400 border-rose-400/40 bg-rose-400/10';
                if (pStatus === 'verification_pending') paymentClass = 'text-cyan-400 border-cyan-400/40 bg-cyan-400/10';

                return (
                  <div key={b.id} className="glass rounded-lg p-4 border-2 border-black flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div className="flex items-start gap-3 flex-grow">
                      <div className="text-2xl bg-slate-900 w-11 h-11 flex items-center justify-center rounded-md border border-black shadow-[2px_2px_0px_#000] flex-shrink-0">
                        {getSportEmoji(b.sport)}
                      </div>
                      <div className="space-y-1">
                        <div className="font-bold text-white text-sm">{b.venueName}</div>
                        <div className="text-slate-400 text-xs flex flex-wrap gap-x-2 gap-y-0.5">
                          <span>{b.playerName || 'Player'}</span>
                          <span>•</span>
                          <span>{formatDate(b.date)}</span>
                          <span>•</span>
                          <span>{b.slot}</span>
                        </div>
                        {ticketId && (
                          <div className="flex items-center gap-1.5 mt-1">
                            <Ticket className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0" />
                            <span className="font-mono text-xs text-cyan-400 font-bold">{ticketId}</span>
                          </div>
                        )}
                        {b.utrNumber && (
                          <div className="text-[10px] text-slate-500 font-mono flex flex-wrap gap-2 mt-1">
                            <span>UTR: <strong className="text-slate-300 select-all">{b.utrNumber}</strong></span>
                            {b.screenshotUrl && (
                              <a 
                                href={b.screenshotUrl} 
                                target="_blank" 
                                rel="noreferrer" 
                                className="text-cyan-400 hover:underline"
                              >
                                View Proof Screenshot
                              </a>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 md:gap-3 ml-auto border-t md:border-t-0 border-black/20 pt-2.5 md:pt-0 w-full md:w-auto justify-between md:justify-end">
                      <div className="flex items-center gap-2">
                        <span className={cn('text-xs font-bold px-2 py-1 rounded border-2 border-black', statusClass)}>
                          {statusText}
                        </span>
                        <span className={cn('text-xs font-bold px-2 py-0.5 rounded border border-current', paymentClass)}>
                          {paymentText}
                        </span>
                      </div>
                      <span className="font-bold text-white">{formatCurrency(amount)}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>
    </div>
  );
}
