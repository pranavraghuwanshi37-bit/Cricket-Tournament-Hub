import React, { useState } from 'react';
import { useAdminRegistrations } from '@/hooks/useRegistrations';
import { Registration } from '@/types';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Trophy, LogOut, Search, Download, Eye, CheckCircle, XCircle } from 'lucide-react';
import { toast } from 'sonner';

function AdminAuth({ onAuth }: { onAuth: () => void }) {
  const [pwd, setPwd] = useState('');
  
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const correctPwd = import.meta.env.VITE_ADMIN_PASSWORD || 'admin123';
    if (pwd === correctPwd) {
      sessionStorage.setItem('admin_auth', 'true');
      onAuth();
    } else {
      toast.error('Invalid password');
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4 text-primary-foreground">
          <Trophy className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-bold uppercase tracking-widest">Admin Portal</h1>
      </div>
      <div className="w-full max-w-sm bg-card border border-border p-8 rounded-xl shadow-2xl">
        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium">Access Password</label>
            <Input 
              type="password" 
              value={pwd} 
              onChange={e => setPwd(e.target.value)} 
              className="h-12"
              placeholder="••••••••"
            />
          </div>
          <Button type="submit" className="w-full h-12">Login</Button>
        </form>
      </div>
    </div>
  );
}

export function Admin() {
  const [isAuthenticated, setIsAuthenticated] = useState(
    sessionStorage.getItem('admin_auth') === 'true'
  );

  const { registrations, loading, approveRegistration, rejectRegistration } = useAdminRegistrations();
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [search, setSearch] = useState('');
  const [selectedReg, setSelectedReg] = useState<Registration | null>(null);

  if (!isAuthenticated) {
    return <AdminAuth onAuth={() => setIsAuthenticated(true)} />;
  }

  const handleLogout = () => {
    sessionStorage.removeItem('admin_auth');
    setIsAuthenticated(false);
  };

  const filteredRegistrations = registrations.filter(r => {
    const matchesFilter = filter === 'all' || r.status === filter;
    const matchesSearch = r.teamName.toLowerCase().includes(search.toLowerCase()) || 
                          r.id.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const stats = {
    total: registrations.length,
    pending: registrations.filter(r => r.status === 'pending').length,
    approved: registrations.filter(r => r.status === 'approved').length,
    rejected: registrations.filter(r => r.status === 'rejected').length,
  };

  const handleApprove = async (id: string) => {
    if (confirm("Are you sure you want to approve this team?")) {
      await approveRegistration(id);
      toast.success("Team approved!");
      if (selectedReg?.id === id) setSelectedReg(null);
    }
  };

  const handleReject = async (id: string) => {
    const reason = prompt("Enter rejection reason:");
    if (reason !== null) {
      await rejectRegistration(id, reason || "Payment not verified");
      toast.error("Team rejected.");
      if (selectedReg?.id === id) setSelectedReg(null);
    }
  };

  const exportCSV = () => {
    const headers = ["ID", "Team Name", "Captain", "Phone", "Email", "City", "Category", "Players", "Transaction ID", "Status", "Date"];
    const rows = filteredRegistrations.map(r => [
      r.id,
      r.teamName,
      r.captainName,
      r.captainPhone,
      r.captainEmail,
      r.city,
      r.category,
      r.players.length.toString(),
      r.transactionId,
      r.status,
      new Date(r.createdAt?.toDate?.() || Date.now()).toLocaleDateString()
    ]);
    
    const csvContent = [headers.join(','), ...rows.map(r => r.map(c => `"\${c}"`).join(','))].join('\\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mpcl-registrations-\${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Topbar */}
      <header className="bg-card border-b border-border px-6 py-4 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <Trophy className="w-6 h-6 text-primary" />
          <h1 className="font-bold text-lg uppercase tracking-wider">MPCL Admin</h1>
        </div>
        <Button variant="ghost" onClick={handleLogout} className="text-muted-foreground hover:text-destructive">
          <LogOut className="w-4 h-4 mr-2" /> Logout
        </Button>
      </header>

      <main className="p-6 max-w-7xl mx-auto space-y-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-card border border-border p-6 rounded-xl">
            <p className="text-sm text-muted-foreground font-bold uppercase tracking-wider mb-2">Total</p>
            <p className="text-4xl font-black">{stats.total}</p>
          </div>
          <div className="bg-card border border-primary/30 p-6 rounded-xl">
            <p className="text-sm text-primary font-bold uppercase tracking-wider mb-2">Pending</p>
            <p className="text-4xl font-black text-primary">{stats.pending}</p>
          </div>
          <div className="bg-card border border-secondary/30 p-6 rounded-xl">
            <p className="text-sm text-secondary font-bold uppercase tracking-wider mb-2">Approved</p>
            <p className="text-4xl font-black text-secondary">{stats.approved}</p>
          </div>
          <div className="bg-card border border-destructive/30 p-6 rounded-xl">
            <p className="text-sm text-destructive font-bold uppercase tracking-wider mb-2">Rejected</p>
            <p className="text-4xl font-black text-destructive">{stats.rejected}</p>
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-card p-4 rounded-xl border border-border">
          <div className="flex bg-background rounded-lg p-1 border border-border">
            {['all', 'pending', 'approved', 'rejected'].map(f => (
              <button 
                key={f} 
                onClick={() => setFilter(f as any)}
                className={`px-4 py-2 text-sm font-bold uppercase tracking-wider rounded-md transition-colors \${filter === f ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-white'}`}
              >
                {f}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-4 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
              <Input 
                placeholder="Search teams or ID..." 
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="pl-9 h-10"
              />
            </div>
            <Button onClick={exportCSV} variant="outline" className="h-10">
              <Download className="w-4 h-4 mr-2" /> Export
            </Button>
          </div>
        </div>

        {/* Table */}
        <div className="bg-card border border-border rounded-xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-muted/50 text-muted-foreground text-xs uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-4 font-semibold">Registration ID</th>
                  <th className="px-6 py-4 font-semibold">Team Info</th>
                  <th className="px-6 py-4 font-semibold">Category</th>
                  <th className="px-6 py-4 font-semibold">Date</th>
                  <th className="px-6 py-4 font-semibold">Status</th>
                  <th className="px-6 py-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {loading ? (
                  <tr><td colSpan={6} className="px-6 py-8 text-center text-muted-foreground">Loading registrations...</td></tr>
                ) : filteredRegistrations.length === 0 ? (
                  <tr><td colSpan={6} className="px-6 py-8 text-center text-muted-foreground">No registrations found.</td></tr>
                ) : (
                  filteredRegistrations.map(reg => (
                    <tr key={reg.id} className="hover:bg-muted/20 transition-colors">
                      <td className="px-6 py-4 font-mono text-sm">{reg.id}</td>
                      <td className="px-6 py-4">
                        <p className="font-bold text-white">{reg.teamName}</p>
                        <p className="text-xs text-muted-foreground">{reg.captainName} • {reg.city}</p>
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant="outline">{reg.category}</Badge>
                      </td>
                      <td className="px-6 py-4 text-sm text-muted-foreground">
                        {reg.createdAt?.toDate?.() ? new Date(reg.createdAt.toDate()).toLocaleDateString() : 'N/A'}
                      </td>
                      <td className="px-6 py-4">
                        <Badge className={
                          reg.status === 'approved' ? 'bg-secondary text-white' :
                          reg.status === 'rejected' ? 'bg-destructive text-white' :
                          'bg-primary text-black'
                        }>
                          {reg.status}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Button size="sm" variant="ghost" onClick={() => setSelectedReg(reg)}>
                          <Eye className="w-4 h-4 mr-2" /> View
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Modal Overlay */}
      {selectedReg && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl relative">
            <button 
              onClick={() => setSelectedReg(null)}
              className="absolute top-6 right-6 text-muted-foreground hover:text-white"
            >
              <XCircle className="w-6 h-6" />
            </button>
            
            <div className="p-8">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center text-primary">
                  <Trophy className="w-8 h-8" />
                </div>
                <div>
                  <h2 className="text-3xl font-bold uppercase tracking-tight">{selectedReg.teamName}</h2>
                  <p className="text-muted-foreground font-mono">{selectedReg.id}</p>
                </div>
                <div className="ml-auto">
                  <Badge className={
                    selectedReg.status === 'approved' ? 'bg-secondary' :
                    selectedReg.status === 'rejected' ? 'bg-destructive' : 'bg-primary'
                  }>{selectedReg.status.toUpperCase()}</Badge>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                  <section>
                    <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-4 border-b border-border pb-2">Captain Details</h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div><span className="text-muted-foreground block mb-1">Name</span><span className="font-bold">{selectedReg.captainName}</span></div>
                      <div><span className="text-muted-foreground block mb-1">Phone</span><span className="font-bold">{selectedReg.captainPhone}</span></div>
                      <div><span className="text-muted-foreground block mb-1">Email</span><span className="font-bold">{selectedReg.captainEmail}</span></div>
                      <div><span className="text-muted-foreground block mb-1">Location</span><span className="font-bold">{selectedReg.city}, {selectedReg.state}</span></div>
                    </div>
                  </section>

                  <section>
                    <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-4 border-b border-border pb-2">Player Roster ({selectedReg.players.length})</h3>
                    <div className="bg-background rounded-lg border border-border overflow-hidden">
                      <table className="w-full text-sm text-left">
                        <thead className="bg-muted">
                          <tr>
                            <th className="px-4 py-2">Name</th>
                            <th className="px-4 py-2">Age</th>
                            <th className="px-4 py-2">Role</th>
                            <th className="px-4 py-2">Phone</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                          {selectedReg.players.map((p, i) => (
                            <tr key={i}>
                              <td className="px-4 py-2 font-medium">{p.name}</td>
                              <td className="px-4 py-2">{p.age}</td>
                              <td className="px-4 py-2"><Badge variant="outline" className="text-[10px]">{p.role}</Badge></td>
                              <td className="px-4 py-2 text-muted-foreground">{p.phone || '-'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </section>
                </div>

                <div className="space-y-8">
                  <section>
                    <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-4 border-b border-border pb-2">Payment Info</h3>
                    <div className="space-y-4">
                      <div>
                        <span className="text-muted-foreground text-sm block mb-1">Transaction ID</span>
                        <span className="font-mono bg-background px-3 py-1.5 rounded border border-border inline-block">{selectedReg.transactionId}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground text-sm block mb-2">Proof Screenshot</span>
                        <a href={selectedReg.paymentProofUrl} target="_blank" rel="noreferrer" className="block relative group overflow-hidden rounded-lg border border-border">
                          <img src={selectedReg.paymentProofUrl} alt="Payment Proof" className="w-full h-auto object-cover group-hover:scale-105 transition-transform" />
                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <span className="text-white font-bold text-sm bg-black/50 px-3 py-1 rounded-full backdrop-blur-sm">View Full Image</span>
                          </div>
                        </a>
                      </div>
                    </div>
                  </section>

                  {selectedReg.status === 'pending' && (
                    <section className="bg-muted p-4 rounded-xl border border-border">
                      <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Admin Actions</h3>
                      <div className="flex flex-col gap-3">
                        <Button onClick={() => handleApprove(selectedReg.id)} className="w-full bg-secondary hover:bg-secondary/90 text-white">
                          <CheckCircle className="w-4 h-4 mr-2" /> Approve Registration
                        </Button>
                        <Button onClick={() => handleReject(selectedReg.id)} variant="destructive" className="w-full">
                          <XCircle className="w-4 h-4 mr-2" /> Reject Registration
                        </Button>
                      </div>
                    </section>
                  )}
                  {selectedReg.status === 'rejected' && selectedReg.rejectionReason && (
                    <section className="bg-destructive/10 p-4 rounded-xl border border-destructive/30">
                      <h3 className="text-sm font-bold text-destructive uppercase tracking-wider mb-2">Rejection Reason</h3>
                      <p className="text-sm">{selectedReg.rejectionReason}</p>
                    </section>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}