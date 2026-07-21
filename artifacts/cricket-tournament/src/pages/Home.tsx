import React, { useState, useEffect } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Link } from 'wouter';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Trophy, Users, ShieldCheck, MapPin, IndianRupee, Timer } from 'lucide-react';
import heroImg from '@assets/generated_images/hero-stadium.jpg';
import trophyImg from '@assets/generated_images/gold-trophy.jpg';
import actionImg from '@assets/generated_images/cricket-action.jpg';

const IMAGES = {
  hero: heroImg,
  trophy: trophyImg,
  action: actionImg,
};

function CountdownTimer() {
  const calcTime = () => {
    const target = new Date('2026-07-31T00:00:00').getTime();
    const distance = target - new Date().getTime();
    return {
      days: Math.max(0, Math.floor(distance / (1000 * 60 * 60 * 24))),
      hours: Math.max(0, Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))),
      minutes: Math.max(0, Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60))),
      seconds: Math.max(0, Math.floor((distance % (1000 * 60)) / 1000))
    };
  };

  const [timeLeft, setTimeLeft] = useState(calcTime);

  useEffect(() => {
    const target = new Date('2026-07-31T00:00:00').getTime();
    
    const interval = setInterval(() => {
      const now = new Date().getTime();
      const distance = target - now;

      setTimeLeft({
        days: Math.floor(distance / (1000 * 60 * 60 * 24)),
        hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((distance % (1000 * 60)) / 1000)
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex gap-4 sm:gap-8 justify-center mt-12">
      {Object.entries(timeLeft).map(([unit, value]) => (
        <div key={unit} className="flex flex-col items-center">
          <div className="w-16 h-16 sm:w-24 sm:h-24 bg-card/80 backdrop-blur border border-border flex items-center justify-center rounded-lg shadow-xl shadow-primary/5">
            <span className="text-3xl sm:text-5xl font-mono text-primary font-bold">{value.toString().padStart(2, '0')}</span>
          </div>
          <span className="mt-2 text-xs sm:text-sm text-muted-foreground uppercase tracking-widest">{unit}</span>
        </div>
      ))}
    </div>
  );
}

export function Home() {
  const { scrollYProgress } = useScroll();
  const y1 = useTransform(scrollYProgress, [0, 1], [0, 300]);
  const opacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);

  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative h-[90vh] flex items-center justify-center overflow-hidden">
        <motion.div style={{ y: y1, opacity }} className="absolute inset-0 z-0">
          <img src={IMAGES.hero} alt="Cricket Stadium" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-background/80 to-background" />
        </motion.div>
        
        <div className="container relative z-10 mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-card/50 border border-primary/20 backdrop-blur-md text-primary text-sm font-medium mb-8">
              <MapPin className="w-4 h-4" /> Madhya Pradesh
            </div>
            <h1 className="text-5xl sm:text-7xl md:text-8xl font-black uppercase tracking-tighter text-white mb-6 drop-shadow-2xl">
              MP Premier<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-yellow-200 to-primary">Cricket 2026</span>
            </h1>
            <p className="text-lg sm:text-2xl text-gray-300 max-w-3xl mx-auto mb-10 font-light">
              The ultimate battleground for cricketing supremacy. Assemble your squad. Claim the glory.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
              <Link href="/register">
                <Button size="lg" className="w-full sm:w-auto h-14 px-8 text-lg font-bold bg-primary text-primary-foreground hover:bg-primary/90 shadow-[0_0_30px_rgba(212,175,55,0.4)] hover:shadow-[0_0_50px_rgba(212,175,55,0.6)] transition-all uppercase tracking-wide">
                  Register Your Team
                </Button>
              </Link>
              <div className="text-left hidden sm:block">
                <p className="text-sm text-muted-foreground uppercase tracking-wider">Registration Fee</p>
                <p className="text-2xl font-bold text-white">₹3,500 <span className="text-sm font-normal text-muted-foreground">/ team</span></p>
              </div>
            </div>

            <CountdownTimer />
          </motion.div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-24 bg-card relative z-20 border-y border-border">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-5xl font-bold uppercase tracking-tight mb-4">Categories</h2>
            <div className="w-24 h-1 bg-primary mx-auto" />
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              { name: 'Under-19', desc: 'Rising stars born after March 2006.' },
              { name: 'Under-23', desc: 'The next generation of professional talent.' },
              { name: 'Open', desc: 'No age limit. Pure competitive cricket.' }
            ].map((cat, i) => (
              <motion.div 
                key={cat.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-background border border-border p-8 rounded-xl text-center group hover:border-primary/50 transition-colors"
              >
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6 text-primary group-hover:scale-110 transition-transform">
                  <Users className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-bold mb-3">{cat.name}</h3>
                <p className="text-muted-foreground">{cat.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features/Details */}
      <section className="py-24 relative overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row items-center gap-16">
            <div className="lg:w-1/2">
              <motion.img 
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                src={IMAGES.action} 
                alt="Action" 
                className="rounded-2xl shadow-2xl shadow-black/50 border border-white/10"
              />
            </div>
            <div className="lg:w-1/2 space-y-8">
              <h2 className="text-4xl sm:text-5xl font-bold uppercase tracking-tight">The Stage is Set</h2>
              <p className="text-lg text-muted-foreground">
                Experience cricket like never before. Professional umpiring, live scoring, high-quality turf wickets, and extensive media coverage.
              </p>
              <ul className="space-y-6">
                {[
                  { icon: ShieldCheck, title: "Professional Standards", desc: "BCCI certified umpires and match referees." },
                  { icon: Trophy, title: "Massive Prize Pool", desc: "Cash prizes, trophies, and individual awards for top performers." },
                  { icon: Timer, title: "T20 Format", desc: "Fast-paced 20-over matches played with white balls." }
                ].map((item, i) => (
                  <li key={i} className="flex gap-4">
                    <div className="w-12 h-12 rounded-lg bg-secondary flex items-center justify-center shrink-0">
                      <item.icon className="w-6 h-6 text-secondary-foreground" />
                    </div>
                    <div>
                      <h4 className="text-xl font-bold">{item.title}</h4>
                      <p className="text-muted-foreground">{item.desc}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Payment Section */}
      <section className="py-24 bg-card border-t border-border">
        <div className="container mx-auto px-4 max-w-4xl text-center">
          <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-8 text-primary">
            <IndianRupee className="w-10 h-10" />
          </div>
          <h2 className="text-4xl font-bold uppercase tracking-tight mb-6">Registration Fee</h2>
          <div className="bg-background border border-primary/30 p-8 rounded-2xl max-w-lg mx-auto shadow-2xl">
            <p className="text-5xl font-black text-primary mb-2">₹3,500</p>
            <p className="text-muted-foreground uppercase tracking-widest text-sm mb-8">Per Team</p>
            
            <div className="bg-card p-6 rounded-xl text-left border border-border mb-8">
              <p className="text-sm text-muted-foreground mb-1">UPI ID</p>
              <p className="text-lg font-mono font-bold text-white break-all bg-background px-3 py-2 rounded border border-border select-all">8269818508@axl</p>
              <p className="text-sm text-muted-foreground mt-4 mb-1">Account Holder</p>
              <p className="text-md font-bold text-white">ADITYA PRATAP SINGH RAGHUWANSHI</p>
            </div>
            
            <Link href="/register">
              <Button size="lg" className="w-full h-12 text-lg uppercase tracking-wider font-bold">Proceed to Register</Button>
            </Link>
          </div>
        </div>
      </section>
    </Layout>
  );
}