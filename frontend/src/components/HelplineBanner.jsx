import React from 'react';
import { Phone, AlertCircle, ExternalLink } from 'lucide-react';
import { motion } from 'framer-motion';

const HelplineBanner = () => {
  return (
    <motion.div
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: 'spring', stiffness: 100, damping: 20 }}
      className="relative z-[1000] w-full bg-[#0a192f] border-b border-[#f6c90e]/30 overflow-hidden"
    >
      {/* Animated Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#f6c90e]/5 to-transparent animate-shimmer" style={{ backgroundSize: '200% 100%' }} />
      
      <div className="max-w-7xl mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-4 relative z-10">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-[#f6c90e]/20 text-[#f6c90e] animate-pulse">
            <AlertCircle size={18} />
          </div>
          <div>
            <p className="text-white text-sm font-semibold tracking-wide">
              Immediate Legal Assistance Needed?
            </p>
            <p className="text-[#a8b2d8] text-xs">
              National Legal Helpline is available 24/7 for all citizens.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="hidden md:flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-[#10b981] animate-ping" />
            <span className="text-[#10b981] text-[10px] font-bold uppercase tracking-widest">Active Now</span>
          </div>

          <motion.a
            href="tel:15100"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-3 bg-gradient-to-r from-[#f6c90e] to-[#d4a017] hover:from-[#d4a017] hover:to-[#b8860b] text-[#0a192f] px-6 py-2 rounded-full font-black text-sm transition-all duration-300 shadow-[0_0_20px_rgba(246,201,14,0.3)] group"
          >
            <Phone size={16} className="group-hover:rotate-12 transition-transform" />
            <span className="flex flex-col leading-none">
              <span className="text-[10px] uppercase opacity-70">Call Helpline</span>
              <span>15100</span>
            </span>
            <ExternalLink size={14} className="opacity-50" />
          </motion.a>
        </div>
      </div>

      {/* Decorative pulse line */}
      <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[#f6c90e] to-transparent opacity-30" />
    </motion.div>
  );
};

export default HelplineBanner;
