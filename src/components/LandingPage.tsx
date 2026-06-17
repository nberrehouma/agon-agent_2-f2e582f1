import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Shield, Lock, CreditCard, Sparkles, Star, Send, 
  Menu, X, Check, ArrowRight, User, KeyRound, Upload, Layers
} from 'lucide-react';
import { useVault } from '../context/VaultContext';

interface CarouselSlide {
  title: string;
  subtitle: string;
  badge: string;
  gradient: string;
  highlight: string;
}

const CAROUSEL_SLIDES: CarouselSlide[] = [
  {
    badge: "Next-Gen Cryptography",
    title: "Zero-Knowledge Password Security",
    highlight: "Military-Grade",
    subtitle: "Your credentials are secured with state-of-the-art hashing algorithms. All data is kept local and completely zero-knowledge — we never see your master password.",
    gradient: "from-cyan-500 via-teal-500 to-emerald-500"
  },
  {
    badge: "Flexible Workspaces",
    title: "Multi-Vault Ready Architecture",
    highlight: "Scalable Organization",
    subtitle: "Engineered from the ground up to support multiple isolated vaults. Seamlessly partition your personal life, freelance projects, and business credentials.",
    gradient: "from-indigo-500 via-purple-500 to-pink-500"
  },
  {
    badge: "Instant Migrations",
    title: "Import Your Data from Google Chrome",
    highlight: "One-Click CSV",
    subtitle: "Say goodbye to manual inputs. Export your passwords from Google Chrome as a CSV file and drop it into SecureVault to migrate instantly.",
    gradient: "from-amber-500 via-orange-500 to-rose-500"
  }
];

export function LandingPage() {
  const { user, setShowLanding, showLanding } = useVault();
  const [activeSlide, setActiveSlide] = useState(0);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // Contact form state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Auto-slide carousel
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % CAROUSEL_SLIDES.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const handleCTA = () => {
    // Navigate to dashboard/vault if logged in, or AuthScreen if not
    setShowLanding(false);
  };

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !message) return;
    
    setIsSubmitting(true);
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitSuccess(true);
      setName('');
      setEmail('');
      setMessage('');
      setTimeout(() => setSubmitSuccess(false), 5000);
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans overflow-x-hidden scroll-smooth">
      {/* Background glowing gradients */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-40 -right-40 h-[600px] w-[600px] rounded-full bg-cyan-500/10 blur-3xl" />
        <div className="absolute top-1/3 -left-40 h-[600px] w-[600px] rounded-full bg-emerald-500/5 blur-3xl" />
        <div className="absolute -bottom-40 right-1/4 h-[600px] w-[600px] rounded-full bg-purple-500/10 blur-3xl" />
      </div>

      {/* 1. Sticky Navigation Bar */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-slate-800/60 bg-slate-950/80 backdrop-blur-xl transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500 to-emerald-500 shadow-lg shadow-cyan-500/20">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-black text-white tracking-tight">SecureVault</h1>
                <p className="text-[10px] text-slate-500 font-semibold tracking-widest uppercase">Southern Horizon</p>
              </div>
            </div>

            {/* Desktop Navigation links */}
            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-sm font-medium text-slate-400 hover:text-white transition-colors">Features</a>
              <a href="#testimonials" className="text-sm font-medium text-slate-400 hover:text-white transition-colors">Reviews</a>
              <a href="#pricing" className="text-sm font-medium text-slate-400 hover:text-white transition-colors">Pricing</a>
              <a href="#contact" className="text-sm font-medium text-slate-400 hover:text-white transition-colors">Contact</a>
            </div>

            {/* Desktop CTA & Login / Avatar */}
            <div className="hidden md:flex items-center gap-4">
              {user ? (
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-semibold text-slate-300">
                    <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span>Hello, {user.username}</span>
                  </div>
                  <button
                    onClick={handleCTA}
                    className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-500 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/40 hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer"
                  >
                    Go to Vault
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <>
                  <button
                    onClick={handleCTA}
                    className="text-sm font-semibold text-slate-300 hover:text-white transition-colors cursor-pointer"
                  >
                    Sign In
                  </button>
                  <button
                    onClick={handleCTA}
                    className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-500 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/40 hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer"
                  >
                    Get Started
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </>
              )}
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-900 hover:text-white focus:outline-none cursor-pointer"
              >
                {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden border-t border-slate-900 bg-slate-950 px-4 py-6 space-y-4 shadow-2xl"
            >
              <div className="flex flex-col gap-4">
                <a 
                  href="#features" 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-base font-semibold text-slate-300 hover:text-white"
                >
                  Features
                </a>
                <a 
                  href="#testimonials" 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-base font-semibold text-slate-300 hover:text-white"
                >
                  Reviews
                </a>
                <a 
                  href="#pricing" 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-base font-semibold text-slate-300 hover:text-white"
                >
                  Pricing
                </a>
                <a 
                  href="#contact" 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-base font-semibold text-slate-300 hover:text-white"
                >
                  Contact
                </a>
              </div>
              <div className="border-t border-slate-900 pt-4 flex flex-col gap-3">
                {user ? (
                  <>
                    <div className="text-sm font-semibold text-slate-400 text-center">Logged in as {user.username}</div>
                    <button
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        handleCTA();
                      }}
                      className="w-full rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-500 py-3 text-sm font-bold text-white shadow-lg text-center"
                    >
                      Go to Vault
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        handleCTA();
                      }}
                      className="w-full rounded-xl border border-slate-800 bg-slate-900/60 py-3 text-sm font-bold text-slate-300 text-center"
                    >
                      Sign In
                    </button>
                    <button
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        handleCTA();
                      }}
                      className="w-full rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-500 py-3 text-sm font-bold text-white shadow-lg text-center"
                    >
                      Get Started
                    </button>
                  </>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* 2. Hero Banner with Carousel */}
      <section className="relative pt-36 pb-24 md:pt-48 md:pb-36 flex flex-col items-center z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative w-full overflow-hidden rounded-3xl border border-slate-800/80 bg-slate-900/20 backdrop-blur-xl p-8 md:p-16 shadow-2xl">
          {/* Glass layout decorative glow */}
          <div className="absolute -top-32 -left-32 h-64 w-64 rounded-full bg-cyan-500/20 blur-3xl" />
          <div className="absolute -bottom-32 -right-32 h-64 w-64 rounded-full bg-emerald-500/20 blur-3xl" />

          {/* Carousel Slide container */}
          <div className="min-h-[300px] md:min-h-[380px] flex flex-col justify-center relative">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeSlide}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.5 }}
                className="max-w-3xl"
              >
                {/* Badge */}
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900/80 border border-slate-800 text-xs font-semibold text-slate-400 mb-6">
                  <Sparkles className="h-3.5 w-3.5 text-cyan-400" />
                  <span>{CAROUSEL_SLIDES[activeSlide].badge}</span>
                </div>

                {/* Title */}
                <h2 className="text-4xl md:text-6xl font-black text-white tracking-tight leading-tight">
                  {CAROUSEL_SLIDES[activeSlide].title} <br />
                  <span className={`bg-gradient-to-r ${CAROUSEL_SLIDES[activeSlide].gradient} bg-clip-text text-transparent`}>
                    {CAROUSEL_SLIDES[activeSlide].highlight}
                  </span>
                </h2>

                {/* Subtitle */}
                <p className="text-slate-400 text-base md:text-lg mt-6 leading-relaxed max-w-2xl">
                  {CAROUSEL_SLIDES[activeSlide].subtitle}
                </p>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Carousel Buttons and Dots indicators */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 border-t border-slate-800/80 mt-12 pt-8 relative z-20">
            {/* CTA Buttons */}
            <div className="flex items-center gap-4 w-full sm:w-auto">
              <button
                onClick={handleCTA}
                className="flex-1 sm:flex-initial flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-500 px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/40 hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer"
              >
                Get Started
                <ArrowRight className="h-4 w-4" />
              </button>
              <a
                href="#features"
                className="flex-1 sm:flex-initial flex items-center justify-center gap-2 rounded-xl border border-slate-800 bg-slate-900/50 hover:bg-slate-900/80 px-6 py-3.5 text-sm font-bold text-slate-300 hover:text-white transition-all duration-200 text-center"
              >
                Explore
              </a>
            </div>

            {/* Dots */}
            <div className="flex items-center gap-2.5">
              {CAROUSEL_SLIDES.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveSlide(idx)}
                  className={`h-2.5 rounded-full transition-all duration-300 cursor-pointer ${
                    activeSlide === idx ? 'w-8 bg-cyan-500' : 'w-2.5 bg-slate-800 hover:bg-slate-700'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 3. Application Main Options (Feature Cards) */}
      <section id="features" className="py-24 relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 scroll-mt-20">
        {/* Title */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-black tracking-tight text-white">
            High Security. <span className="bg-gradient-to-r from-cyan-400 to-emerald-400 bg-clip-text text-transparent">No Compromises.</span>
          </h2>
          <p className="text-slate-400 text-base max-w-xl mx-auto mt-4 leading-relaxed">
            SecureVault offers a premium digital vault configured with modern, state-of-the-art cryptographic safeguards.
          </p>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              icon: Lock,
              title: "Military-Grade Encryption",
              desc: "Credential storage remains completely zero-knowledge, hashed securely using advanced server-side bcrypt algorithms.",
              color: "text-cyan-400 bg-cyan-500/10 border-cyan-500/10"
            },
            {
              icon: Layers,
              title: "Multi-Vault Ready",
              desc: "Decoupled database designs separate credentials into isolated vaults, ready for multi-tenant accounts in the future.",
              color: "text-purple-400 bg-purple-500/10 border-purple-500/10"
            },
            {
              icon: Upload,
              title: "Chrome Import Support",
              desc: "Export your passwords from Google Chrome as a CSV file and upload them into your vault in a single action.",
              color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/10"
            },
            {
              icon: KeyRound,
              title: "Premium User Dashboard",
              desc: "Directly manage your profile credentials, change your username, and update your master passwords in settings.",
              color: "text-amber-400 bg-amber-500/10 border-amber-500/10"
            }
          ].map((item, idx) => (
            <motion.div
              key={idx}
              whileHover={{ y: -6, scale: 1.02 }}
              className="rounded-2xl border border-slate-800 bg-slate-900/30 p-6 backdrop-blur-sm hover:border-slate-700/60 transition-all duration-300"
            >
              <div className={`inline-flex h-12 w-12 items-center justify-center rounded-xl border ${item.color} mb-6`}>
                <item.icon className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">{item.title}</h3>
              <p className="text-slate-400 text-sm leading-relaxed">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* 4. User Experiences & Known Users (Testimonials) */}
      <section id="testimonials" className="py-24 border-y border-slate-900 relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 scroll-mt-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-black tracking-tight text-white">
            Trusted by <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">Digital Creators</span>
          </h2>
          <p className="text-slate-400 text-base max-w-xl mx-auto mt-4">
            Hear from security experts and developers who rely on our platform to secure their vault operations.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              name: "Marcus Vance",
              role: "CTO, Horizon Tech",
              text: "SecureVault completely changed how our agency manages credentials. The multi-vault ready architecture is a game-changer for scaling!",
              rating: 5,
              avatar: "MV"
            },
            {
              name: "Clara Sterling",
              role: "Lead Security Architect",
              text: "Fast, beautiful, and extremely secure. Client-side hashing and zero knowledge practices make it the clear choice for credential privacy.",
              rating: 5,
              avatar: "CS"
            },
            {
              name: "Jin Woo",
              role: "Indie Hacker",
              text: "The interface is gorgeous, and import utilities work like magic. It is a breath of fresh air in the crowded space of password managers.",
              rating: 5,
              avatar: "JW"
            }
          ].map((testi, idx) => (
            <div key={idx} className="rounded-2xl border border-slate-800/80 bg-slate-900/10 p-6 backdrop-blur-sm flex flex-col justify-between">
              <div>
                {/* Rating */}
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(testi.rating)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                {/* Quote */}
                <p className="text-slate-300 text-sm leading-relaxed italic mb-6">
                  "{testi.text}"
                </p>
              </div>
              {/* User profile */}
              <div className="flex items-center gap-3 border-t border-slate-900 pt-4">
                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-cyan-500 to-emerald-500 flex items-center justify-center font-bold text-sm text-white shadow-md">
                  {testi.avatar}
                </div>
                <div>
                  <h4 className="font-bold text-white text-sm">{testi.name}</h4>
                  <p className="text-slate-500 text-xs">{testi.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 5. Pricing Table */}
      <section id="pricing" className="py-24 relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 scroll-mt-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-black tracking-tight text-white">
            Transparent, <span className="bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">Simple Pricing</span>
          </h2>
          <p className="text-slate-400 text-base max-w-xl mx-auto mt-4">
            Configure the package that best fits your security and vault organization requirements.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Free Tier */}
          <div className="rounded-3xl border border-slate-800 bg-slate-900/20 p-8 backdrop-blur-sm flex flex-col justify-between hover:border-slate-700/60 transition-all duration-300 relative">
            <div>
              <span className="text-xs font-semibold tracking-wider text-slate-400 uppercase">Standard Account</span>
              <h3 className="text-2xl font-bold text-white mt-2">Free Starter</h3>
              <p className="text-slate-400 text-sm mt-2">Perfect for individual users to secure standard personal credentials.</p>
              
              {/* Price */}
              <div className="my-8">
                <span className="text-5xl font-black text-white">$0</span>
                <span className="text-slate-500 text-sm ml-2">/ forever</span>
              </div>

              {/* Features */}
              <ul className="space-y-4 border-t border-slate-800 pt-6">
                {[
                  "1 Primary Secure Vault",
                  "Up to 50 Credentials Saved",
                  "AES-256 equivalent server-side Hashing",
                  "Chrome CSV Import utilities",
                  "Secure Encryption",
                ].map((f, i) => (
                  <li key={i} className="flex items-center gap-3 text-sm text-slate-300">
                    <Check className="h-4.5 w-4.5 text-cyan-400 shrink-0" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
            </div>

            <button
              onClick={handleCTA}
              className="mt-8 w-full rounded-xl border border-slate-700 bg-slate-800/40 hover:bg-slate-800 text-white py-3 font-bold text-sm transition-all duration-200 cursor-pointer"
            >
              Get Started Free
            </button>
          </div>

          {/* Premium Tier */}
          <div className="rounded-3xl border border-cyan-500/30 bg-slate-900/40 p-8 backdrop-blur-sm flex flex-col justify-between hover:border-cyan-500/50 transition-all duration-300 relative overflow-hidden shadow-2xl shadow-cyan-500/5">
            {/* Premium badge */}
            <div className="absolute top-0 right-0 bg-gradient-to-l from-cyan-500 to-emerald-500 text-white font-bold text-[10px] tracking-wider uppercase py-1 px-4 rounded-bl-xl">
              Popular Choice
            </div>

            <div>
              <span className="text-xs font-semibold tracking-wider text-cyan-400 uppercase">Power Users</span>
              <h3 className="text-2xl font-bold text-white mt-2">Premium Pro</h3>
              <p className="text-slate-400 text-sm mt-2">Designed for developers, freelancers, and privacy enthusiasts.</p>
              
              {/* Price */}
              <div className="my-8">
                <span className="text-5xl font-black text-white">$4.99</span>
                <span className="text-slate-500 text-sm ml-2">/ month</span>
              </div>

              {/* Features */}
              <ul className="space-y-4 border-t border-slate-800 pt-6">
                {[
                  "Unlimited Isolated Vaults (Multi-Vault)",
                  "Infinite Credentials Storage",
                  "Secure Multi-Device Sync",
                  "Advanced Profile Statistics Dashboard",
                  "Priority Southern Horizon Support",
                  "Zero-Knowledge Vault Partitioning",
                ].map((f, i) => (
                  <li key={i} className="flex items-center gap-3 text-sm text-slate-300">
                    <Check className="h-4.5 w-4.5 text-emerald-400 shrink-0" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
            </div>

            <button
              onClick={handleCTA}
              className="mt-8 w-full rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-500 py-3 font-bold text-sm text-white shadow-lg shadow-cyan-500/20 hover:scale-[1.02] active:scale-98 transition-all duration-200 cursor-pointer"
            >
              Unlock Premium Pro
            </button>
          </div>
        </div>
      </section>

      {/* 6. Contact Us Form */}
      <section id="contact" className="py-24 border-t border-slate-900 relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 scroll-mt-20">
        <div className="rounded-3xl border border-slate-800 bg-slate-900/30 p-8 md:p-12 backdrop-blur-sm relative overflow-hidden">
          {/* Decorative glow */}
          <div className="absolute -bottom-20 -left-20 h-40 w-40 rounded-full bg-emerald-500/10 blur-3xl" />

          <div className="relative text-center mb-8">
            <h2 className="text-2xl md:text-4xl font-black text-white">Have Questions? Reach Out!</h2>
            <p className="text-slate-400 text-sm mt-2">Our team at Southern Horizon is here to help you secure your vault systems.</p>
          </div>

          <form onSubmit={handleContactSubmit} className="relative space-y-4 max-w-xl mx-auto">
            {submitSuccess && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm text-center font-semibold"
              >
                ✓ Thank you for reaching out! Southern Horizon team will contact you shortly.
              </motion.div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-800/20 py-3 px-4 text-white focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 transition-all text-sm"
                  placeholder="Your Name"
                  disabled={isSubmitting}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Email Address</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-800/20 py-3 px-4 text-white focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 transition-all text-sm"
                  placeholder="name@company.com"
                  disabled={isSubmitting}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Message</label>
              <textarea
                required
                rows={4}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full rounded-xl border border-slate-700 bg-slate-800/20 py-3 px-4 text-white focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 transition-all text-sm resize-none"
                placeholder="How can Southern Horizon help you?"
                disabled={isSubmitting}
              />
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full sm:w-auto rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-500 py-3 px-8 text-sm font-bold text-white shadow-lg shadow-cyan-500/20 hover:scale-105 active:scale-98 transition-all duration-200 cursor-pointer flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    Send Message
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </section>

      {/* 7. Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/60 py-12 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Logo Branding */}
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-500 to-emerald-500 shadow-md">
              <Shield className="h-5 w-5 text-white" />
            </div>
            <div>
              <h4 className="font-extrabold text-white text-sm">SecureVault</h4>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Southern Horizon</p>
            </div>
          </div>

          {/* Quick links */}
          <div className="flex flex-wrap items-center justify-center gap-6 text-xs font-semibold text-slate-500">
            <a href="#features" className="hover:text-slate-300 transition-colors">Features</a>
            <a href="#testimonials" className="hover:text-slate-300 transition-colors">Reviews</a>
            <a href="#pricing" className="hover:text-slate-300 transition-colors">Pricing</a>
            <a href="#contact" className="hover:text-slate-300 transition-colors">Contact</a>
          </div>

          {/* Copyright Mentions */}
          <div className="text-xs font-medium text-slate-500 text-center md:text-right">
            <p>© 2026 SecureVault. All rights reserved.</p>
            <p className="mt-1 text-slate-600 font-semibold">
              SecureVault is an application by <span className="text-slate-400">Southern Horizon</span>.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
