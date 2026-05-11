"use client";

import React, { useState, useEffect, useSyncExternalStore, startTransition, useMemo, useCallback } from 'react';
import { MonitoringTable } from '@/components/MonitoringTable';
import { AddEntry } from '@/components/AddEntry';
import { Modal } from '@/components/Modal';
import { SecurityPortal } from '@/components/Login';
import { NavShell } from '@/components/NavShell';
import { CallLog } from '@/types';
import { formatTimeHHMMH, parseGuestRequests } from '@/lib/utils';
import { Download, Hotel, Trash2, Plus, RefreshCcw, Copy, Check, LogOut, MessageCircle, BarChart3, TrendingUp, Users, Clock } from 'lucide-react';
import * as XLSX from 'xlsx';
import { Toaster, toast } from 'sonner';

const subscribe = () => () => {};
const getSnapshot = () => true;
const getServerSnapshot = () => false;

export default function Home() {
  const isClient = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeTab, setActiveTab] = useState<'monitoring' | 'dashboard'>('monitoring');
  const [logs, setLogs] = useState<CallLog[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [copySuccess, setCopySuccess] = useState(false);
  const [viberCopySuccess, setViberCopySuccess] = useState(false);
  const [countsCopySuccess, setCountsCopySuccess] = useState(false);

  // Initial Load
  useEffect(() => {
    if (!isClient) return;
    const saved = localStorage.getItem('call-logs');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.length > 0) {
          startTransition(() => {
            setLogs(parsed);
          });
        }
      } catch (e) {
        console.error("Failed to load logs", e);
      }
    }
    
    // Check if previously authenticated in this session
    const auth = sessionStorage.getItem('telex-auth');
    if (auth === 'true') {
      startTransition(() => {
        setIsAuthenticated(true);
      });
    }
  }, [isClient]);

  // Sync to LocalStorage
  useEffect(() => {
    if (isClient) {
      localStorage.setItem('call-logs', JSON.stringify(logs));
    }
  }, [logs, isClient]);

  // Memoized Calculations
  const guestRequestCounts = useMemo(() => parseGuestRequests(logs), [logs]);
  
  const stats = useMemo(() => {
    const uniqueRooms = new Set(logs.map(l => l.roomNo)).size;
    return {
      totalLogs: logs.length,
      uniqueRooms,
      avgRequests: uniqueRooms > 0 ? (logs.length / uniqueRooms).toFixed(1) : "0"
    };
  }, [logs]);

  const handleLogin = useCallback(() => {
    setIsAuthenticated(true);
    sessionStorage.setItem('telex-auth', 'true');
    toast.success("Welcome back!", {
      description: "Successfully authenticated to Telex Monitoring."
    });
  }, []);

  const handleAdd = useCallback((newEntry: Omit<CallLog, 'id' | 'followUp' | 'timeOfRequest' | 'acknowledgedBy'>) => {
    const id = crypto.randomUUID();
    const { remarks, timeOfDelivered } = newEntry;

    const log: CallLog = {
      ...newEntry,
      id,
      timeOfRequest: formatTimeHHMMH(),
      timeOfDelivered,
      remarks: remarks || "",
      followUp: 0,
      acknowledgedBy: ""
    };

    setLogs(prev => [...prev, log]);
    toast.success(`Entry added for RM ${log.roomNo}`, {
      description: `${log.lastName} - ${log.guestReq}`
    });
  }, []);

  const handleUpdate = useCallback((id: string, field: keyof CallLog, value: string | number) => {
    setLogs(prev => prev.map(log => {
      if (log.id === id) {
        if (log[field] === value) return log;

        const updated = { ...log, [field]: value };
        if (field === 'remarks' && !updated.timeOfDelivered) {
          updated.timeOfDelivered = formatTimeHHMMH();
        }
        
        toast.success("Updated", {
          description: `Field '${field}' updated successfully.`,
          duration: 2000
        });
        return updated;
      }
      return log;
    }));
  }, []);

  const handleConfirmClear = useCallback(() => {
    setLogs([]);
    setIsModalOpen(false);
    toast.error("All data cleared", {
      description: "Successfully reset today's call logs."
    });
  }, []);

  const handleConfirmDelete = useCallback(() => {
    if (deleteId) {
      setLogs(prev => prev.filter(l => l.id !== deleteId));
      setDeleteId(null);
      toast.info("Entry deleted");
    }
  }, [deleteId]);

  const exportToExcel = useCallback(() => {
    const data = logs.map((log) => ({
      'Requested By': log.requestedBy,
      'Last Name': log.lastName,
      'Room No.': log.roomNo,
      'Guest Req': log.guestReq,
      'Time of Request': log.timeOfRequest,
      'Time of Delivered': log.timeOfDelivered,
      'Remarks': log.remarks,
      'Follow up': log.followUp,
      'Ack By': log.acknowledgedBy
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Call Logs");
    XLSX.writeFile(wb, `Telex_Logs_${new Date().toISOString().split('T')[0]}.xlsx`);
  }, [logs]);

  const copyTableToClipboard = useCallback(() => {
    const rows = logs.map(log => [
      log.requestedBy,
      log.lastName,
      log.roomNo,
      log.guestReq,
      log.timeOfRequest,
      log.timeOfDelivered,
      log.remarks,
      log.followUp,
      log.acknowledgedBy
    ]);

    const text = rows.map(row => row.join("\t")).join("\n");

    navigator.clipboard.writeText(text).then(() => {
      setCopySuccess(true);
      toast.success("Data Copied", {
        description: "Raw data copied to clipboard."
      });
      setTimeout(() => setCopySuccess(false), 2000);
    });
  }, [logs]);

  const copyForViber = useCallback(() => {
    const text = logs.map(log => 
      `hi ${log.roomNo} ${log.lastName} ${log.guestReq}`
    ).join("\n");

    navigator.clipboard.writeText(text).then(() => {
      setViberCopySuccess(true);
      toast.success("Viber Format Copied", {
        description: `${logs.length} entries formatted for Viber.`
      });
      setTimeout(() => setViberCopySuccess(false), 2000);
    });
  }, [logs]);

  const copyCounts = useCallback(() => {
    const text = Object.entries(guestRequestCounts)
      .map(([item, count]) => `${count}${item.toUpperCase()}`)
      .join(",");

    navigator.clipboard.writeText(text).then(() => {
      setCountsCopySuccess(true);
      toast.success("Totals Copied", {
        description: text || "No items to copy."
      });
      setTimeout(() => setCountsCopySuccess(false), 2000);
    });
  }, [guestRequestCounts]);

  const handleLogout = useCallback(() => {
    setIsAuthenticated(false);
    sessionStorage.removeItem('telex-auth');
    toast.info("Logged out", {
      description: "You have been securely logged out."
    });
  }, []);

  if (!isClient) return null;

  if (!isAuthenticated) {
    return <SecurityPortal onLogin={handleLogin} />;
  }

  return (
    <NavShell 
      activeTab={activeTab} 
      setActiveTab={setActiveTab}
      onLogout={handleLogout}
      onReset={() => setIsModalOpen(true)}
    >
      <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
        <Toaster position="top-right" richColors />

        {activeTab === 'dashboard' ? (
          <div className="space-y-8">
            <header>
              <h1 className="text-3xl font-black text-slate-800">Operational Overview</h1>
              <p className="text-muted-foreground font-medium">Daily performance metrics and request analytics.</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-6 rounded-2xl bg-white border border-slate-200 luxury-shadow flex items-center gap-4">
                <div className="p-3 rounded-xl bg-blue-50 text-blue-600">
                  <TrendingUp size={24} />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Total Logs</p>
                  <p className="text-2xl font-black text-slate-800">{stats.totalLogs}</p>
                </div>
              </div>
              <div className="p-6 rounded-2xl bg-white border border-slate-200 luxury-shadow flex items-center gap-4">
                <div className="p-3 rounded-xl bg-green-50 text-green-600">
                  <Users size={24} />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Unique Rooms</p>
                  <p className="text-2xl font-black text-slate-800">{stats.uniqueRooms}</p>
                </div>
              </div>
              <div className="p-6 rounded-2xl bg-white border border-slate-200 luxury-shadow flex items-center gap-4">
                <div className="p-3 rounded-xl bg-amber-50 text-amber-600">
                  <Clock size={24} />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Avg Requests</p>
                  <p className="text-2xl font-black text-slate-800">{stats.avgRequests}</p>
                </div>
              </div>
            </div>

            <section>
              <div className="mb-4 flex items-center gap-2 text-sm font-black text-primary uppercase tracking-widest">
                <BarChart3 size={16} strokeWidth={3} />
                Item Distribution
              </div>
              <div className="p-6 rounded-2xl glass border border-border/50 luxury-shadow">
                <div className="flex flex-wrap gap-4">
                  {Object.entries(guestRequestCounts).length > 0 ? (
                    Object.entries(guestRequestCounts).map(([item, count]) => (
                      <div key={item} className="flex flex-col items-center justify-center min-w-[100px] p-4 rounded-xl bg-white border border-border shadow-sm transition-all hover:scale-105">
                        <span className="text-3xl font-black text-primary">{count}</span>
                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{item}</span>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground italic">No data to visualize yet.</p>
                  )}
                </div>
              </div>
            </section>
          </div>
        ) : (
          <>
            {/* Entry Section */}
            <section>
              <div className="mb-4 flex items-center gap-2 text-sm font-black text-primary uppercase tracking-widest">
                <Plus size={16} strokeWidth={3} />
                Quick Add Log
              </div>
              <AddEntry onAdd={handleAdd} />
            </section>

            {/* Guest Request Summary */}
            {logs.length > 0 && (
              <section className="animate-in slide-in-from-bottom-2 duration-500">
                <div className="mb-4 flex items-center gap-2 text-sm font-black text-primary uppercase tracking-widest">
                  <BarChart3 size={16} strokeWidth={3} />
                  Guest Request Counter
                </div>
                <div className="p-6 rounded-2xl glass border border-border/50 luxury-shadow">
                  <div className="flex flex-wrap gap-4">
                    {Object.entries(guestRequestCounts).length > 0 ? (
                      Object.entries(guestRequestCounts).map(([item, count]) => (
                        <div key={item} className="flex flex-col items-center justify-center min-w-[80px] p-3 rounded-xl bg-white border border-border shadow-sm">
                          <span className="text-2xl font-black text-primary">{count}</span>
                          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{item}</span>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground italic">No specific item requests detected.</p>
                    )}
                  </div>
                  
                  <div className="mt-6 pt-6 border-t border-border/50 flex items-center justify-between">
                    <div className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">
                      Quick Action
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={copyCounts}
                        className="flex items-center gap-2 px-6 py-3 bg-slate-800 text-white rounded-xl hover:bg-slate-700 transition-all shadow-lg shadow-slate-200 font-bold text-sm"
                      >
                        {countsCopySuccess ? <Check size={18} /> : <Copy size={18} />}
                        {countsCopySuccess ? "Counts Copied!" : "Copy Totals Only"}
                      </button>
                      <button
                        onClick={copyForViber}
                        className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 font-bold text-sm"
                      >
                        {viberCopySuccess ? <Check size={18} /> : <MessageCircle size={18} />}
                        {viberCopySuccess ? "Viber Format Copied!" : "Copy for Viber"}
                      </button>
                    </div>
                  </div>
                </div>
              </section>
            )}

            {/* Table Section */}
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <h2 className="text-xl font-black text-slate-800">Active Logs</h2>
                  <span className="text-xs font-black px-3 py-1 bg-primary/10 rounded-full text-primary uppercase tracking-wider">
                    {logs.length} Total Records
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={copyTableToClipboard}
                    className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition-all shadow-md shadow-slate-200 font-bold text-xs"
                  >
                    {copySuccess ? <Check size={14} /> : <Copy size={14} />}
                    {copySuccess ? "Copied!" : "Copy Data Only"}
                  </button>
                  <button
                    onClick={exportToExcel}
                    className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-all shadow-md shadow-primary/20 font-bold text-xs"
                  >
                    <Download size={14} />
                    Export Excel
                  </button>
                </div>
              </div>
              <MonitoringTable 
                data={logs} 
                onUpdate={handleUpdate} 
                onDelete={(id) => setDeleteId(id)} 
              />
            </section>
          </>
        )}

        {/* Modals */}
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onConfirm={handleConfirmClear}
          title="Reset All Monitoring Data?"
          message="This will permanently delete all call logs for today. This action cannot be undone."
          confirmText="Yes, Reset Everything"
          requirePassword={true}
        />

        <Modal
          isOpen={!!deleteId}
          onClose={() => setDeleteId(null)}
          onConfirm={handleConfirmDelete}
          title="Delete This Entry?"
          message="Are you sure you want to remove this specific call log?"
          confirmText="Delete"
          requirePassword={true}
        />

        {/* Footer */}
        <footer className="pt-12 text-center text-[10px] text-slate-400 font-bold uppercase tracking-[0.3em]">
          © 2026 Telex Management Systems • Efficiency & Hospitality
        </footer>
      </div>
    </NavShell>
  );
}
