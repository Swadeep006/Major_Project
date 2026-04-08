import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { 
  ShieldCheck, 
  Users, 
  Clock, 
  Zap, 
  ArrowRight, 
  Mail, 
  Globe,
  GraduationCap,
  HardHat,
  Heart,
  Moon,
  Sun
} from 'lucide-react';
import { useTheme } from '@/components/theme-provider';

export default function LandingPage() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/favicon_ace.png" alt="ACE Logo" className="h-10 w-10 md:h-12 md:w-12 rounded-full object-cover" />
            <span className="text-lg sm:text-xl font-black text-primary tracking-tighter">UniACE</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-bold text-muted-foreground uppercase tracking-widest">
            <a href="#about" className="hover:text-primary transition-colors">About</a>
            <a href="#features" className="hover:text-primary transition-colors">Features</a>
            <a href="#department" className="hover:text-primary transition-colors">Department</a>
          </div>
          <div className="flex items-center gap-2 sm:gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="text-muted-foreground mr-1 h-9 w-9"
            >
              <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              <span className="sr-only">Toggle theme</span>
            </Button>
            <Link to="/login">
              <Button variant="ghost" className="font-bold text-foreground px-3 sm:px-4">Login</Button>
            </Link>
            <Link to="/register">
              <Button className="btn-3d-purple rounded-full px-4 sm:px-6 h-9 sm:h-10 text-xs sm:text-sm hidden md:flex">Get Started</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-20 pb-20 sm:pb-32 overflow-hidden hero-gradient">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-full text-primary font-bold text-xs sm:text-sm mb-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <Zap className="h-4 w-4 fill-primary" />
            <span>MAJOR PROJECT BY CSM BATCH 21</span>
          </div>
          <h1 className="mobile-title-lg mb-6 leading-tight  mx-auto text-foreground animate-in fade-in slide-in-from-bottom-8 duration-700">
            Unified Gateway Management System for <span className="text-primary">ACE Engineering College</span>
          </h1>
          <p className="text-muted-foreground text-base sm:text-lg max-w-2xl mx-auto mb-10 animate-in fade-in slide-in-from-bottom-12 duration-1000">
            A seamless digital solution for student leave requests, automated approvals, and secure campus exit verification.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-in fade-in slide-in-from-bottom-16 duration-1000">
            <Link to="/register" >
              <Button size="lg" className="btn-3d-purple rounded-full px-8 h-10 sm:h-14 text-base sm:text-sm w-full">Register</Button>
            </Link>
          </div>

          {/* Interactive Card Preview */}
          <div className="mt-20 relative p-4 lg:p-0 animate-in zoom-in duration-1000">
             <div className="absolute inset-0 bg-primary/5 blur-3xl rounded-full -z-10 transform scale-75"></div>
             <Card className="card-premium max-w-md mx-auto p-6 overflow-hidden bg-card text-card-foreground">
                <CardContent className="p-0">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="bg-student-green/10 dark:bg-student-green/20 h-16 w-16 rounded-2xl flex items-center justify-center border-2 border-student-green/10">
                      <GraduationCap className="h-8 w-8 text-student-green" />
                    </div>
                    <div className="text-left">
                      <p className="text-[10px] sm:text-xs font-black text-muted-foreground uppercase tracking-[0.2em] mb-1">PERMISSION GRANTED</p>
                      <h3 className="text-base sm:text-lg font-black tracking-tight leading-none">Emergency Leave</h3>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                         <div className="h-3 w-3 rounded-full bg-student-green animate-pulse"></div>
                         <span className="text-sm font-bold text-muted-foreground">Verification Active</span>
                      </div>
                      <span className="text-sm font-black text-primary">ID: #ACE-7721</span>
                    </div>
                    <div className="progress-premium">
                       <div className="progress-fill-green" style={{ width: '75%' }}></div>
                    </div>
                    <Button className="btn-3d-purple w-full py-5 sm:py-6 h-12 sm:h-14 text-sm sm:text-base rounded-2xl flex items-center justify-between px-6">
                      <span>Continue to Gateway</span>
                      <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5" />
                    </Button>
                  </div>
                </CardContent>
             </Card>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-24 bg-background border-t border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="order-2 lg:order-1">
               <span className="text-primary font-black uppercase tracking-[0.3em] text-[10px] sm:text-xs mb-4 block">THE PROJECT</span>
               <h2 className="mobile-title-lg mb-6 text-foreground">Our Mission & Dedication</h2>
               <p className="text-muted-foreground text-sm sm:text-base mb-6 leading-relaxed">
                 UniACE is developed as a <strong>Major Project</strong> by the students of <strong>CSM Batch 21 (2022-2026)</strong>. This digital transformation project aims to modernize the campus permissions workflow at ACE Engineering College.
               </p>
               <p className="text-muted-foreground text-sm sm:text-base mb-8 leading-relaxed">
                 We dedicate this platform to our college and the <strong>AI & Machine Learning (CSM)</strong> department, which has provided us with the foundation to build impactful digital solutions.
               </p>
               <div className="flex items-center gap-3 text-red-500 font-bold italic border-l-4 border-red-500 pl-4 py-2 bg-red-50/50 dark:bg-red-950/20 rounded-r">
                 <Heart className="h-5 w-5 fill-red-500" />
                 <span>Crafted with passion for ACE Engineering College</span>
               </div>
            </div>
            <div className="order-1 lg:order-2 grid grid-cols-2 gap-4">
               <div className="space-y-4 mt-8">
                  <div className="bg-student-green/10 dark:bg-student-green/20 p-6 rounded-3xl border-2 border-student-green/10 aspect-square flex flex-col items-center justify-center text-center">
                      <ShieldCheck className="h-10 w-10 text-student-green mb-3" />
                      <h4 className="font-black text-foreground text-xs sm:text-sm">Secure Entry</h4>
                  </div>
                  <div className="bg-primary/10 dark:bg-primary/20 p-6 rounded-3xl border-2 border-primary/10 aspect-square flex flex-col items-center justify-center text-center">
                      <Users className="h-10 w-10 text-primary mb-3" />
                      <h4 className="font-black text-foreground text-xs sm:text-sm">Role Based</h4>
                  </div>
               </div>
               <div className="space-y-4">
                  <div className="bg-orange-500/10 dark:bg-orange-500/20 p-6 rounded-3xl border-2 border-orange-500/10 aspect-square flex flex-col items-center justify-center text-center">
                      <Clock className="h-10 w-10 text-orange-500 mb-3" />
                      <h4 className="font-black text-foreground text-xs sm:text-sm">Real-time</h4>
                  </div>
                  <div className="bg-blue-500/10 dark:bg-blue-500/20 p-6 rounded-3xl border-2 border-blue-500/10 aspect-square flex flex-col items-center justify-center text-center">
                      <HardHat className="h-10 w-10 text-blue-500 mb-3" />
                      <h4 className="font-black text-foreground text-xs sm:text-sm">Reliable</h4>
                  </div>
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-24 bg-muted/30 border-y border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
           <span className="text-student-green font-black uppercase tracking-[0.3em] text-[10px] sm:text-xs mb-4 block">ECOSYSTEM</span>
           <h2 className="mobile-title-lg mb-16 text-foreground">Three Roles. One Platform.</h2>
           
           <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { 
                  title: 'Students', 
                  desc: 'Apply for gateway permissions with real-time tracking.', 
                  icon: GraduationCap, 
                  color: 'text-student-green',
                  bg: 'bg-student-green-soft'
                },
                { 
                  title: 'Administrators', 
                  desc: 'HODs and Incharges manage approvals with a click.', 
                  icon: ShieldCheck, 
                  color: 'text-primary',
                  bg: 'bg-primary/10'
                },
                { 
                  title: 'Security', 
                  desc: 'Instantly verify students with unique gateway codes.', 
                  icon: HardHat, 
                  color: 'text-indigo-600',
                  bg: 'bg-indigo-50'
                }
              ].map((f, i) => (
                <Card key={i} className="card-premium border-none shadow-sm h-full group">
                   <CardContent className="p-8 text-left">
                     <div className={`${f.bg} h-14 w-14 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                        <f.icon className={`h-7 w-7 ${f.color}`} />
                     </div>
                     <h3 className="text-lg sm:text-xl font-black text-foreground mb-2">{f.title}</h3>
                     <p className="text-muted-foreground leading-relaxed text-xs sm:text-sm">
                       {f.desc}
                     </p>
                   </CardContent>
                </Card>
              ))}
           </div>
        </div>
      </section>

      {/* Department Section */}
      <section id="department" className="py-24 bg-background relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
           <img src="/favicon_ace.png" alt="ACE Logo" className="h-16 w-16 sm:h-20 sm:w-20 rounded-full mx-auto mb-8 opacity-90 drop-shadow-lg object-cover" />
           <h2 className="mobile-title-lg mb-6 text-foreground">Department of CSE (AI&ML)</h2>
           <p className="text-muted-foreground text-sm sm:text-lg max-w-3xl mx-auto mb-10">
             Our department is dedicated to fostering innovation and excellence in the field of Artificial Intelligence. Part of ACE Engineering College, we strive to produce world-class engineers.
           </p>
           <a 
            href="https://www.aceec.ac.in/ai-ml/" 
            target="_blank" 
            rel="noopener noreferrer"
           >
             <Button variant="outline" size="lg" className="rounded-full px-8 sm:px-12 h-12 sm:h-14 text-sm sm:text-base font-bold border-2 hover:bg-accent dark:hover:bg-slate-800 transition-all">
                <Globe className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                Visit Official Website
             </Button>
           </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
           <div className="flex flex-col md:flex-row items-center justify-between gap-10 border-b border-white/10 pb-12 mb-12">
              <div className="text-center md:text-left">
                <div className="flex items-center justify-center md:justify-start gap-3 mb-4">
                   <img src="/favicon_ace.png" alt="ACE Logo" className="h-8 w-8 sm:h-10 sm:w-10 rounded-full object-cover" />
                   <span className="text-xl sm:text-2xl font-black tracking-tighter">UniACE</span>
                </div>
                <p className="text-slate-400 text-sm max-w-sm">
                  Official Gateway Management System for ACE Engineering College. Built for the students, by the students.
                </p>
              </div>
              <div className="flex items-center gap-6">
                <a href="#" className="h-10 w-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors">
                  <Mail className="h-5 w-5" />
                </a>
              </div>
           </div>
           
           <div className="flex flex-col md:flex-row items-center justify-between gap-6 text-xs sm:text-sm text-slate-500 font-bold uppercase tracking-widest text-center">
              <p>&copy; {new Date().getFullYear()} CSM BATCH 21 - ACE ENGINEERING COLLEGE</p>
              <div className="flex items-center gap-8">
                 <Link to="/login" className="hover:text-white transition-colors">Login</Link>
                 <Link to="/register" className="hover:text-white transition-colors">Register</Link>
                 <a href="#about" className="hover:text-white transition-colors">About Project</a>
              </div>
           </div>
        </div>
      </footer>
    </div>
  );
}
