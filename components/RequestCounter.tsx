"use client";

import React from 'react';
import { BarChart3, Check, Copy, MessageCircle, FileText } from 'lucide-react';

interface RequestCounterProps {
  counts: Record<string, number>;
  onCopyTotals: () => void;
  onCopyViber: () => void;
  onCopyNotepad: () => void;
  copyStates: {
    totals: boolean;
    viber: boolean;
    notepad: boolean;
  };
}

export const RequestCounter: React.FC<RequestCounterProps> = ({ 
  counts, 
  onCopyTotals, 
  onCopyViber, 
  onCopyNotepad,
  copyStates 
}) => {
  const hasCounts = Object.entries(counts).length > 0;

  return (
    <section className="animate-in slide-in-from-bottom-2 duration-500">
      <div className="mb-4 flex items-center gap-2 text-sm font-black text-primary uppercase tracking-widest">
        <BarChart3 size={16} strokeWidth={3} />
        Guest Request Counter
      </div>
      <div className="p-6 rounded-2xl glass border border-border/50 luxury-shadow">
        <div className="flex flex-wrap gap-4">
          {hasCounts ? (
            Object.entries(counts).map(([item, count]) => (
              <div key={item} className="flex flex-col items-center justify-center min-w-[80px] p-3 rounded-xl bg-white border border-border shadow-sm hover:scale-105 transition-transform">
                <span className="text-2xl font-black text-primary">{count}</span>
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{item}</span>
              </div>
            ))
          ) : (
            <p className="text-sm text-muted-foreground italic">No specific item requests detected.</p>
          )}
        </div>
        
        {hasCounts && (
          <div className="mt-6 pt-6 border-t border-border/50 flex items-center justify-between">
            <div className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">
              Quick Actions
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={onCopyTotals}
                className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-white rounded-xl hover:bg-slate-700 transition-all shadow-lg shadow-slate-200 font-bold text-xs"
              >
                {copyStates.totals ? <Check size={14} /> : <Copy size={14} />}
                {copyStates.totals ? "Totals Copied!" : "Copy Totals"}
              </button>
              <button
                onClick={onCopyNotepad}
                className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-200 font-bold text-xs"
              >
                {copyStates.notepad ? <Check size={14} /> : <FileText size={14} />}
                {copyStates.notepad ? "Logs Copied!" : "Copy Notepad"}
              </button>
              <button
                onClick={onCopyViber}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 font-bold text-xs"
              >
                {copyStates.viber ? <Check size={14} /> : <MessageCircle size={14} />}
                {copyStates.viber ? "Viber Copied!" : "Copy Viber"}
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
