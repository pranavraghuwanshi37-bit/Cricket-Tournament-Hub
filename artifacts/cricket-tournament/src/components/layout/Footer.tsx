import React from 'react';
import { Trophy } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t border-border bg-card">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <Trophy className="w-6 h-6 text-primary" />
              <h2 className="font-bold text-xl uppercase tracking-wider">YCC<span className="text-primary">CUP</span></h2>
            </div>
            <p className="text-muted-foreground text-sm max-w-sm">
              The premier cricket tournament of the Gwalior &amp; Sagar divisions. Showcasing elite talent and delivering high-octane cricketing action. Organised by Ravindra Yadav &amp; Aditya Raghuwanshi.
            </p>
          </div>
          <div>
            <h4 className="font-bold text-sm uppercase tracking-wider mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="/register" className="hover:text-primary transition-colors">Register Team</a></li>
              <li><a href="/track" className="hover:text-primary transition-colors">Track Status</a></li>
              <li><a href="/admin" className="hover:text-primary transition-colors">Admin Portal</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-sm uppercase tracking-wider mb-4">Contact</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>Ravindra Yadav: <a href="tel:+919131030155" className="hover:text-primary transition-colors">9131030155</a></li>
              <li>Aditya Raghuwanshi: <a href="tel:+918223822228" className="hover:text-primary transition-colors">8223822228</a></li>
              <li>Gwalior &amp; Sagar Divisions, MP</li>
            </ul>
          </div>
        </div>
        <div className="mt-12 pt-8 border-t border-border flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
          <p>&copy; 2026 YCC CUP. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <a href="#" className="hover:text-primary">Terms</a>
            <a href="#" className="hover:text-primary">Privacy</a>
            <a href="#" className="hover:text-primary">Rules</a>
          </div>
        </div>
      </div>
    </footer>
  );
}