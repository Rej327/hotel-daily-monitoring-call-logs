"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShieldAlert,
  Check,
  AlertTriangle,
  Database,
  Info,
  Eye,
  Lock,
} from "lucide-react";

interface TermsModalProps {
  isOpen: boolean;
  onAccept: () => void;
}

export const TermsModal: React.FC<TermsModalProps> = ({ isOpen, onAccept }) => {
  const [hasRead, setHasRead] = useState(false);
  const [revealed, setRevealed] = useState({
    free: false,
    liability: false,
    privacy: false,
  });

  const allRevealed = revealed.free && revealed.liability && revealed.privacy;

  const toggleReveal = (key: keyof typeof revealed) => {
    setRevealed((prev) => ({ ...prev, [key]: true }));
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/90 backdrop-blur-xl">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-lg overflow-hidden border border-slate-200"
          >
            <div className="p-8 border-b border-slate-100 bg-slate-50/50 flex items-center gap-4">
              <div className="p-3 rounded-2xl bg-amber-100 text-amber-600">
                <ShieldAlert size={28} />
              </div>
              <div>
                <h3 className="text-2xl font-black text-slate-800 uppercase tracking-tighter">
                  Usage Agreement
                </h3>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                  Legal Notice & Disclosure
                </p>
              </div>
            </div>

            <div className="p-8 space-y-6">
              <div className="space-y-4">
                {/* Detail 1 */}
                <div className="relative group">
                  <div className={`flex gap-4 p-5 rounded-2xl bg-slate-50 border border-slate-100 transition-all ${!revealed.free ? 'blur-md grayscale' : 'hover:bg-white hover:shadow-md'}`}>
                    <div className="text-blue-500 shrink-0 mt-1">
                      <Info size={20} />
                    </div>
                    <div>
                      <p className="text-sm font-black text-slate-700">Open Source & Free</p>
                      <p className="text-xs text-slate-500 leading-relaxed">
                        This application is provided free of charge for operational efficiency purposes. No fees are required for usage.
                      </p>
                    </div>
                  </div>
                  {!revealed.free && (
                    <button 
                      onClick={() => toggleReveal('free')}
                      className="absolute inset-0 flex items-center justify-center bg-slate-900/5 hover:bg-slate-900/10 rounded-2xl transition-all group"
                    >
                      <div className="bg-white px-4 py-2 rounded-full shadow-lg flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-900 group-hover:scale-110 transition-transform">
                        <Eye size={12} /> View Details
                      </div>
                    </button>
                  )}
                </div>

                {/* Detail 2 */}
                <div className="relative group">
                  <div className={`flex gap-4 p-5 rounded-2xl bg-slate-50 border border-slate-100 transition-all ${!revealed.liability ? 'blur-md grayscale' : 'hover:bg-white hover:shadow-md'}`}>
                    <div className="text-red-500 shrink-0 mt-1">
                      <AlertTriangle size={20} />
                    </div>
                    <div>
                      <p className="text-sm font-black text-slate-700">Liability Disclaimer</p>
                      <p className="text-xs text-slate-500 leading-relaxed">
                        The developer is not responsible for any data loss, errors, or issues arising from the use of this tool. Use at your own risk.
                      </p>
                    </div>
                  </div>
                  {!revealed.liability && (
                    <button 
                      onClick={() => toggleReveal('liability')}
                      className="absolute inset-0 flex items-center justify-center bg-slate-900/5 hover:bg-slate-900/10 rounded-2xl transition-all group"
                    >
                      <div className="bg-white px-4 py-2 rounded-full shadow-lg flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-900 group-hover:scale-110 transition-transform">
                        <Eye size={12} /> View Details
                      </div>
                    </button>
                  )}
                </div>

                {/* Detail 3 */}
                <div className="relative group">
                  <div className={`flex gap-4 p-5 rounded-2xl bg-slate-50 border border-slate-100 transition-all ${!revealed.privacy ? 'blur-md grayscale' : 'hover:bg-white hover:shadow-md'}`}>
                    <div className="text-emerald-500 shrink-0 mt-1">
                      <Database size={20} />
                    </div>
                    <div>
                      <p className="text-sm font-black text-slate-700">Data Privacy & Storage</p>
                      <p className="text-xs text-slate-500 leading-relaxed">
                        This app has **NO DATABASE**. All information is stored locally in your browser memory. Data is only on YOUR computer.
                      </p>
                    </div>
                  </div>
                  {!revealed.privacy && (
                    <button 
                      onClick={() => toggleReveal('privacy')}
                      className="absolute inset-0 flex items-center justify-center bg-slate-900/5 hover:bg-slate-900/10 rounded-2xl transition-all group"
                    >
                      <div className="bg-white px-4 py-2 rounded-full shadow-lg flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-900 group-hover:scale-110 transition-transform">
                        <Eye size={12} /> View Details
                      </div>
                    </button>
                  )}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100">
                <label className={cn(
                  "flex items-center gap-3 cursor-pointer group transition-opacity",
                  !allRevealed ? "opacity-30 cursor-not-allowed" : "opacity-100"
                )}>
                  <div className="relative flex items-center justify-center">
                    <input
                      type="checkbox"
                      disabled={!allRevealed}
                      checked={hasRead}
                      onChange={(e) => setHasRead(e.target.checked)}
                      className="peer h-6 w-6 cursor-pointer appearance-none rounded-lg border-2 border-slate-200 transition-all checked:border-primary checked:bg-primary disabled:bg-slate-100"
                    />
                    <Check
                      size={14}
                      className="absolute text-white opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none"
                    />
                  </div>
                  <span className="text-sm font-bold text-slate-600 group-hover:text-slate-800 transition-colors">
                    I have read and understand the terms and conditions
                  </span>
                </label>
              </div>
            </div>

            <div className="p-8 pt-0 flex gap-3">
              <button
                onClick={onAccept}
                disabled={!hasRead || !allRevealed}
                className={`w-full py-5 rounded-2xl font-black transition-all shadow-xl uppercase tracking-widest ${
                  hasRead && allRevealed
                    ? "bg-slate-800 text-white hover:bg-slate-900 shadow-slate-200"
                    : "bg-slate-100 text-slate-400 cursor-not-allowed shadow-none"
                }`}
              >
                {!allRevealed ? "Please View All Details First" : "Accept & Proceed"}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

function cn(...classes: (string | undefined | false | null)[]) {
  return classes.filter(Boolean).join(' ');
}
