import React from 'react';
import { Link } from 'wouter';
import { Trophy } from 'lucide-react';

export function Navbar() {
  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/80 backdrop-blur-md">
      <div className="container mx-auto px-4 h-20 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground group-hover:scale-105 transition-transform">
            <Trophy className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-bold text-lg leading-tight uppercase tracking-wider text-foreground">MPCL<span className="text-primary">2025</span></h1>
            <p className="text-[10px] text-muted-foreground uppercase tracking-[0.2em]">Madhya Pradesh</p>
          </div>
        </Link>
        <div className="flex items-center gap-6">
          <Link href="/track" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
            Track Status
          </Link>
          <Link href="/register" className="text-sm font-bold bg-primary text-primary-foreground px-5 py-2.5 rounded-md hover:bg-primary/90 transition-all shadow-[0_0_15px_rgba(212,175,55,0.3)] hover:shadow-[0_0_25px_rgba(212,175,55,0.5)]">
            Register Team
          </Link>
        </div>
      </div>
    </nav>
  );
}