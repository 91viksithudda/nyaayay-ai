import React from 'react';
import { Phone, ShieldAlert, X, ExternalLink, Headset } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const LegalHelpline = () => {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <>
      {/* Floating Side Tab */}
      <div className="fixed right-0 top-1/2 -translate-y-1/2 z-[1000] flex items-center">
        <motion.button
          initial={{ x: 100 }}
          animate={{ x: isOpen ? 100 : 0 }}
          whileHover={{ x: -5 }}
          onClick={() => setIsOpen(true)}
          className="bg-gradient-to-l from-[#f6c90e] to-[#d4a017] text-[#0a192f] py-4 px-2 rounded-l-2xl shadow-[-5px_0_20px_rgba(246,201,14,0.3)] flex flex-col items-center gap-3 group transition-all duration-300"
        >
          <div className="flex flex-col items-center gap-1">
            <ShieldAlert size={20} className="animate-pulse" />
            <span className="[writing-mode:vertical-lr] font-black text-[10px] uppercase tracking-[0.2em] py-2">Legal SOS</span>
          </div>
          <div className="w-1 h-8 bg-[#0a192f]/20 rounded-full" />
          <Phone size={16} className="group-hover:rotate-12 transition-transform" />
        </motion.button>
      </div>

      {/* Modern Modal/Drawer for the Helpline */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-[1100] flex items-center justify-end p-4 md:p-8">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="absolute inset-0 bg-[#020c1b]/80 backdrop-blur-sm"
            />
            
            <motion.div
              initial={{ x: 300, opacity: 0, scale: 0.9 }}
              animate={{ x: 0, opacity: 1, scale: 1 }}
              exit={{ x: 300, opacity: 0, scale: 0.9 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="relative w-full max-w-sm bg-[#0a192f] border border-[#f6c90e]/30 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden"
            >
              {/* Header Decoration */}
              <div className="h-32 bg-gradient-to-br from-[#f6c90e] to-[#d4a017] flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />
                <div className="w-20 h-20 bg-[#0a192f] rounded-full flex items-center justify-center shadow-2xl relative z-10">
                  <Headset size={32} className="text-[#f6c90e]" />
                </div>
                <button 
                  onClick={() => setIsOpen(false)}
                  className="absolute top-4 right-4 p-2 bg-[#0a192f]/20 hover:bg-[#0a192f]/40 rounded-full text-[#0a192f] transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="p-8 text-center">
                <h3 className="text-2xl font-black text-white mb-2 tracking-tight">National Legal Helpline</h3>
                <p className="text-[#a8b2d8] text-sm leading-relaxed mb-8">
                  Get immediate assistance from recognized legal experts. Available 24/7 for all citizens of India.
                </p>

                <div className="space-y-4">
                  <motion.a
                    href="tel:15100"
                    whileHover={{ scale: 1.02, translateY: -2 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex items-center justify-between w-full bg-[#f6c90e] hover:bg-[#d4a017] text-[#0a192f] p-5 rounded-2xl font-black transition-all duration-300 shadow-[0_10px_20px_rgba(246,201,14,0.2)] group"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-[#0a192f]/10 rounded-xl flex items-center justify-center group-hover:bg-[#0a192f]/20 transition-colors">
                        <Phone size={20} />
                      </div>
                      <div className="text-left">
                        <span className="block text-[10px] uppercase opacity-70 leading-none mb-1">Emergency Call</span>
                        <span className="text-xl leading-none">15100</span>
                      </div>
                    </div>
                    <ExternalLink size={20} className="opacity-40" />
                  </motion.a>

                  <div className="pt-6 border-t border-white/5 flex items-center justify-center gap-6">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-[#10b981] animate-ping" />
                      <span className="text-[10px] font-bold text-[#10b981] uppercase tracking-widest">Active Now</span>
                    </div>
                    <div className="w-[1px] h-4 bg-white/10" />
                    <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest">24/7 Support</span>
                  </div>
                </div>
              </div>

              {/* Decorative line */}
              <div className="h-1 w-full bg-gradient-to-r from-transparent via-[#f6c90e] to-transparent opacity-20" />
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

export default LegalHelpline;
