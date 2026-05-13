"use client";

import React from 'react';
import { BarChart3, Check, Copy, MessageCircle, FileText } from 'lucide-react';

interface RequestCounterProps {
  countsByType: Record<string, Record<string, number>>;
  onCopyTotals: () => void;
  copyState: boolean;
}

export const RequestCounter: React.FC<RequestCounterProps> = ({ 
  countsByType, 
  onCopyTotals, 
  copyState
}) => {
  const typeLabels: Record<string, string> = {
    guest: "Guest Requests",
    res_in: "Transfers (In)",
    res_out: "Transfers (Out)",
    inq_in: "Inquiries (In)",
    inq_out: "Inquiries (Out)",
    booking_confirmation: "Booking Confirmations"
  };

  const hasAnyCounts = Object.values(countsByType).some(c => Object.keys(c).length > 0);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-black text-slate-800">Request Item Counter</h1>
        <p className="text-muted-foreground font-medium">Categorized breakdown of all guest items and service requests.</p>
      </header>

      <div className="p-8 rounded-[2rem] glass border border-border/50 luxury-shadow space-y-10">
        {!hasAnyCounts ? (
          <div className="py-20 text-center space-y-4">
            <div className="inline-flex p-4 rounded-full bg-slate-50 text-slate-300">
              <BarChart3 size={40} />
            </div>
            <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">No item requests detected yet</p>
          </div>
        ) : (
          <>
            <div className="space-y-12">
              {Object.entries(countsByType).map(([type, counts]) => {
                if (Object.keys(counts).length === 0) return null;
                return (
                  <div key={type} className="space-y-6">
                    <div className="flex items-center gap-4">
                      <h2 className="text-xs font-black text-primary uppercase tracking-[0.2em] whitespace-nowrap">
                        {typeLabels[type] || type}
                      </h2>
                      <div className="h-px w-full bg-slate-100"></div>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
                      {Object.entries(counts).map(([item, count]) => (
                        <div key={item} className="group relative flex flex-col items-center justify-center p-6 rounded-3xl bg-white border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                          <span className="text-4xl font-black text-slate-800 group-hover:text-primary transition-colors">{count}</span>
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2 group-hover:text-slate-600 transition-colors">{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="pt-8 border-t border-slate-100 flex items-center justify-end">
              <button
                onClick={onCopyTotals}
                className="group flex items-center gap-3 px-8 py-4 bg-slate-900 text-white rounded-2xl hover:bg-primary transition-all shadow-lg shadow-slate-200 font-black text-sm uppercase tracking-widest"
              >
                {copyState ? <Check size={18} /> : <Copy size={18} />}
                {copyState ? "Totals Copied!" : "Copy Totals Report"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

