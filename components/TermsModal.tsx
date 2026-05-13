"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShieldAlert,
  Check,
  AlertTriangle,
  Database,
  Info,
} from "lucide-react";

interface TermsModalProps {
  isOpen: boolean;
  onAccept: () => void;
}

export const TermsModal: React.FC<TermsModalProps> = ({ isOpen, onAccept }) => {
  const [hasRead, setHasRead] = useState(false);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="bg-white rounded-[2rem] shadow-2xl w-full max-w-lg overflow-hidden border border-slate-200"
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
                <div className="flex gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100 transition-all hover:bg-white hover:shadow-sm">
                  <div className="text-blue-500 shrink-0 mt-1">
                    <Info size={20} />
                  </div>
                  <div>
                    <p className="text-sm font-black text-slate-700">
                      Open Source & Free
                    </p>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      This application is provided free of charge for
                      operational efficiency purposes. No fees are required for
                      usage.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100 transition-all hover:bg-white hover:shadow-sm">
                  <div className="text-red-500 shrink-0 mt-1">
                    <AlertTriangle size={20} />
                  </div>
                  <div>
                    <p className="text-sm font-black text-slate-700">
                      Liability Disclaimer
                    </p>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      The developer is not responsible for any data loss,
                      errors, or issues arising from the use of this tool. Use
                      at your own risk.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100 transition-all hover:bg-white hover:shadow-sm">
                  <div className="text-emerald-500 shrink-0 mt-1">
                    <Database size={20} />
                  </div>
                  <div>
                    <p className="text-sm font-black text-slate-700">
                      Data Privacy & Storage
                    </p>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      This app has **NO DATABASE**. All information is stored
                      locally in your browser memory. Clearing your browser data
                      will delete your logs.
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100">
                <label className="flex items-center gap-3 cursor-pointer group">
                  <div className="relative flex items-center justify-center">
                    <input
                      type="checkbox"
                      checked={hasRead}
                      onChange={(e) => setHasRead(e.target.checked)}
                      className="peer h-6 w-6 cursor-pointer appearance-none rounded-lg border-2 border-slate-200 transition-all checked:border-primary checked:bg-primary"
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
                disabled={!hasRead}
                className={`w-full py-5 rounded-2xl font-black transition-all shadow-xl uppercase tracking-widest ${
                  hasRead
                    ? "bg-slate-800 text-white hover:bg-slate-900 shadow-slate-200"
                    : "bg-slate-100 text-slate-400 cursor-not-allowed shadow-none"
                }`}
              >
                Accept & Proceed
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
