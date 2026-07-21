import React, { useState } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useRegistration } from '@/hooks/useRegistrations';
import { Search, MapPin, Phone, Mail, Trophy, ShieldCheck, Clock, XCircle } from 'lucide-react';
import { useLocation } from 'wouter';

export function Track() {
  const [location] = useLocation();
  const searchParams = new URLSearchParams(window.location.search);
  const initialId = searchParams.get('id') || '';
  
  const [searchId, setSearchId] = useState(initialId);
  const [queryId, setQueryId] = useState(initialId);
  const { data, loading, error } = useRegistration(queryId || null);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchId.trim()) {
      setQueryId(searchId.trim());
      // Update URL without reload
      window.history.pushState({}, '', `/track?id=${searchId.trim()}`);
    }
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-12 max-w-3xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold uppercase tracking-tight mb-4">Track Registration</h1>
          <p className="text-muted-foreground">Enter your Registration ID to check the status of your team.</p>
        </div>

        <Card className="mb-8 border-primary/20 shadow-lg shadow-primary/5">
          <CardContent className="p-6">
            <form onSubmit={handleSearch} className="flex gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
                <Input 
                  value={searchId}
                  onChange={(e) => setSearchId(e.target.value)}
                  placeholder="e.g. MPCL-20250101-A1B2C" 
                  className="pl-10 h-12 text-lg uppercase font-mono"
                />
              </div>
              <Button type="submit" size="lg" className="h-12 px-8">Track</Button>
            </form>
          </CardContent>
        </Card>

        {queryId && loading && (
          <div className="text-center py-12 text-muted-foreground">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            Loading status...
          </div>
        )}

        {queryId && !loading && !data && (
          <div className="text-center py-12 bg-card rounded-xl border border-destructive/30 text-destructive">
            <XCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-bold mb-2">Registration Not Found</h3>
            <p className="text-sm opacity-80">Please check the ID and try again.</p>
          </div>
        )}

        {data && (
          <div className="space-y-6">
            <Card className="border-border overflow-hidden">
              <div className={`p-6 text-center border-b ${
                data.status === 'approved' ? 'bg-secondary/20 border-secondary/50' : 
                data.status === 'rejected' ? 'bg-destructive/20 border-destructive/50' : 
                'bg-primary/10 border-primary/30'
              }`}>
                <div className="inline-flex items-center justify-center p-3 rounded-full bg-background mb-4">
                  {data.status === 'approved' ? <ShieldCheck className="w-8 h-8 text-secondary" /> :
                   data.status === 'rejected' ? <XCircle className="w-8 h-8 text-destructive" /> :
                   <Clock className="w-8 h-8 text-primary" />}
                </div>
                <h2 className="text-2xl font-bold uppercase tracking-wider mb-2">
                  Status: <span className={
                    data.status === 'approved' ? 'text-secondary' : 
                    data.status === 'rejected' ? 'text-destructive' : 
                    'text-primary'
                  }>{data.status}</span>
                </h2>
                {data.status === 'pending' && (
                  <p className="text-sm text-muted-foreground max-w-md mx-auto">
                    Your registration is under review. Our team will verify your payment and update the status within 24-48 hours.
                  </p>
                )}
                {data.status === 'approved' && (
                  <p className="text-sm text-secondary max-w-md mx-auto">
                    Congratulations! Your team has been approved. You will receive further instructions via email soon.
                  </p>
                )}
                {data.status === 'rejected' && data.rejectionReason && (
                  <p className="text-sm text-destructive font-medium max-w-md mx-auto mt-2 bg-destructive/10 p-3 rounded">
                    Reason: {data.rejectionReason}
                  </p>
                )}
              </div>
              <CardContent className="p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <h3 className="text-sm text-muted-foreground uppercase tracking-wider mb-1">Team Name</h3>
                    <p className="text-2xl font-bold text-white mb-6">{data.teamName}</p>
                    
                    <h3 className="text-sm text-muted-foreground uppercase tracking-wider mb-1">Registration ID</h3>
                    <p className="text-lg font-mono text-white mb-6">{data.id}</p>
                    
                    <h3 className="text-sm text-muted-foreground uppercase tracking-wider mb-1">Category</h3>
                    <Badge variant="outline" className="text-sm">{data.category}</Badge>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-sm text-muted-foreground uppercase tracking-wider mb-1">Captain</h3>
                      <div className="flex items-center gap-2 text-white">
                        <Trophy className="w-4 h-4 text-primary" /> {data.captainName}
                      </div>
                    </div>
                    <div>
                      <h3 className="text-sm text-muted-foreground uppercase tracking-wider mb-1">Contact</h3>
                      <div className="flex items-center gap-2 text-white text-sm mb-1">
                        <Phone className="w-4 h-4 text-muted-foreground" /> {data.captainPhone}
                      </div>
                      <div className="flex items-center gap-2 text-white text-sm">
                        <Mail className="w-4 h-4 text-muted-foreground" /> {data.captainEmail}
                      </div>
                    </div>
                    <div>
                      <h3 className="text-sm text-muted-foreground uppercase tracking-wider mb-1">Location</h3>
                      <div className="flex items-center gap-2 text-white text-sm">
                        <MapPin className="w-4 h-4 text-muted-foreground" /> {data.city}, {data.state}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </Layout>
  );
}