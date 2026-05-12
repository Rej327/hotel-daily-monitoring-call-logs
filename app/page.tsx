"use client";

import React, {
  useState,
  useEffect,
  useSyncExternalStore,
  startTransition,
  useMemo,
  useCallback,
} from "react";
import { MonitoringTable } from "@/components/MonitoringTable";
import { AddEntry } from "@/components/AddEntry";
import { Modal } from "@/components/Modal";
import { SecurityPortal } from "@/components/Login";
import { NavShell } from "@/components/NavShell";
import { DashboardStats } from "@/components/DashboardStats";
import { RequestCounter } from "@/components/RequestCounter";
import { LogoutConfirmModal } from "@/components/LogoutConfirmModal";
import { CallLog } from "@/types";
import {
  formatTimeHHMMH,
  parseGuestRequests,
  formatFullTimestamp,
  cn,
} from "@/lib/utils";
import {
  Download,
  Hotel,
  Trash2,
  Plus,
  RefreshCcw,
  Copy,
  Check,
  LogOut,
  MessageCircle,
  BarChart3,
  TrendingUp,
  Users,
  Clock,
  FileText,
} from "lucide-react";
import * as XLSX from "xlsx";
import { Toaster, toast } from "sonner";

const subscribe = () => () => {};
const getSnapshot = () => true;
const getServerSnapshot = () => false;

export default function Home() {
  const isClient = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  );
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeTab, setActiveTab] = useState<"monitoring" | "dashboard">(
    "monitoring",
  );
  const [logs, setLogs] = useState<CallLog[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [copySuccess, setCopySuccess] = useState(false);
  const [viberCopySuccess, setViberCopySuccess] = useState(false);
  const [countsCopySuccess, setCountsCopySuccess] = useState(false);
  const [notepadCopySuccess, setNotepadCopySuccess] = useState(false);
  const [filterType, setFilterType] = useState<"all" | "pending">("all");

  // Initial Load
  useEffect(() => {
    if (!isClient) return;
    const saved = localStorage.getItem("call-logs") || localStorage.getItem("telex-logs") || localStorage.getItem("monitoring-logs");
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
    const auth = sessionStorage.getItem("telex-auth");
    if (auth === "true") {
      startTransition(() => {
        setIsAuthenticated(true);
      });
    }
  }, [isClient]);

  // Sync to LocalStorage
  useEffect(() => {
    if (isClient) {
      localStorage.setItem("call-logs", JSON.stringify(logs));
    }
  }, [logs, isClient]);

  const filteredLogs = useMemo(() => {
    if (filterType === "pending") {
      return logs.filter((log) => log.callType === 'guest' && !log.remarks);
    }
    return logs;
  }, [logs, filterType]);

  const guestRequestCounts = useMemo(
    () => parseGuestRequests(filteredLogs),
    [filteredLogs],
  );

  const stats = useMemo(() => {
    const uniqueRooms = new Set(logs.map((l) => l.roomNo)).size;
    const undeliveredCount = logs.filter((l) => l.callType === 'guest' && !l.remarks).length;
    return {
      totalLogs: logs.length,
      uniqueRooms,
      undeliveredCount,
      avgRequests:
        uniqueRooms > 0 ? (logs.length / uniqueRooms).toFixed(1) : "0",
    };
  }, [logs]);

  const handleLogin = useCallback(() => {
    setIsAuthenticated(true);
    sessionStorage.setItem("telex-auth", "true");
    toast.success("Welcome back!", {
      description: "Successfully authenticated to Telex Monitoring.",
    });
  }, []);

  const handleAdd = useCallback(
    (
      newEntry: Omit<
        CallLog,
        "id" | "followUp" | "timeOfRequest" | "acknowledgedBy" | "createdAt"
      >,
    ) => {
      const id = crypto.randomUUID();
      const { remarks, timeOfDelivered } = newEntry;

      const log: CallLog = {
        ...newEntry,
        id,
        timeOfRequest: formatTimeHHMMH(),
        timeOfDelivered,
        remarks: remarks || "",
        followUp: 0,
        acknowledgedBy: "",
        createdAt: Date.now(),
        callType: newEntry.callType || "guest",
      };

      setLogs((prev) => [...prev, log]);
      toast.success(`Entry added for RM ${log.roomNo}`, {
        description: `${log.lastName} - ${log.guestReq}`,
      });
    },
    [],
  );

  const handleUpdate = useCallback(
    (id: string, field: keyof CallLog, value: string | number) => {
      setLogs((prev) =>
        prev.map((log) => {
          if (log.id === id) {
            if (log[field] === value) return log;

            const updated = { ...log, [field]: value };
            if (field === "remarks" && !updated.timeOfDelivered) {
              updated.timeOfDelivered = formatTimeHHMMH();
            }

            toast.success("Updated", {
              description: `Field '${field}' updated successfully.`,
              duration: 2000,
            });
            return updated;
          }
          return log;
        }),
      );
    },
    [],
  );

  const handleConfirmClear = useCallback(() => {
    setLogs([]);
    setIsModalOpen(false);
    toast.error("All data cleared", {
      description: "Successfully reset today's call logs.",
    });
  }, []);

  const handleConfirmDelete = useCallback(() => {
    if (deleteId) {
      setLogs((prev) => prev.filter((l) => l.id !== deleteId));
      setDeleteId(null);
      toast.info("Entry deleted");
    }
  }, [deleteId]);

  const exportToExcel = useCallback(() => {
    if (logs.length === 0) {
      toast.error("No data to export", { description: "Please add some entries first." });
      return;
    }

    const data = logs.map((log) => ({
      "Requested By": log.requestedBy,
      "Last Name": log.lastName,
      "Room No.": log.roomNo,
      "Guest Req": log.guestReq,
      "Time of Request": log.timeOfRequest,
      "Time of Delivered": log.timeOfDelivered,
      Remarks: log.remarks,
      "Follow up": log.followUp,
      "Ack By": log.acknowledgedBy,
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Call Logs");
    XLSX.writeFile(
      wb,
      `Telex_Logs_${new Date().toISOString().split("T")[0]}.xlsx`,
    );
    toast.success("Excel Downloaded", { description: `${logs.length} entries exported.` });
  }, [logs]);

  const copyTableToClipboard = useCallback(() => {
    const rows = logs.map((log) => [
      log.requestedBy,
      log.lastName,
      log.roomNo,
      log.guestReq,
      log.timeOfRequest,
      log.timeOfDelivered,
      log.remarks,
      log.followUp,
      log.acknowledgedBy,
    ]);

    const text = rows.map((row) => row.join("\t")).join("\n");

    navigator.clipboard.writeText(text).then(() => {
      setCopySuccess(true);
      toast.success("Data Copied", {
        description: "Raw data copied to clipboard.",
      });
      setTimeout(() => setCopySuccess(false), 2000);
    });
  }, [logs]);

  const copyForViber = useCallback(() => {
    const text = logs
      .map((log) => {
        const prefix =
          log.callType === "res_out" || log.callType === "inq_out"
            ? "out"
            : "hi";
        return `${prefix} ${log.roomNo} ${log.lastName} ${log.guestReq}`;
      })
      .join("\n");

    navigator.clipboard.writeText(text).then(() => {
      setViberCopySuccess(true);
      toast.success("Viber Format Copied", {
        description: `${logs.length} entries formatted for Viber.`,
      });
      setTimeout(() => setViberCopySuccess(false), 2000);
    });
  }, [logs]);

  const copyAllForNotepad = useCallback(() => {
    if (logs.length === 0) {
      toast.error("No data to copy", { description: "Please add some entries first." });
      return;
    }

    const text = logs
      .map((log) => {
        const timestamp = formatFullTimestamp(new Date(log.createdAt || Date.now()));
        const prefix =
          log.callType === "res_out" || log.callType === "inq_out"
            ? "out"
            : "hi";
        return `${timestamp} ${prefix} ${log.roomNo} ${log.lastName} ${log.guestReq}`;
      })
      .join("\n");

    navigator.clipboard.writeText(text).then(() => {
      setNotepadCopySuccess(true);
      toast.success("Notepad Format Copied", {
        description: `All ${logs.length} entries formatted with timestamps.`,
      });
      setTimeout(() => setNotepadCopySuccess(false), 2000);
    });
  }, [logs]);

  const copyCounts = useCallback(() => {
    const text = Object.entries(guestRequestCounts)
      .map(([item, count]) => `${count}${item.toUpperCase()}`)
      .join(",");

    navigator.clipboard.writeText(text).then(() => {
      setCountsCopySuccess(true);
      toast.success("Totals Copied", {
        description: text || "No items to copy.",
      });
      setTimeout(() => setCountsCopySuccess(false), 2000);
    });
  }, [guestRequestCounts]);

  const handleLogout = useCallback(() => {
    setIsAuthenticated(false);
    sessionStorage.removeItem("telex-auth");
    toast.info("Logged out", {
      description: "You have been securely logged out.",
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
      onLogout={() => setIsLogoutModalOpen(true)}
      onReset={() => setIsModalOpen(true)}
    >
      <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
        <Toaster position="top-right" richColors />

        {activeTab === "dashboard" ? (
          <div className="space-y-8">
            <header>
              <h1 className="text-3xl font-black text-slate-800">
                Operational Overview
              </h1>
              <p className="text-muted-foreground font-medium">
                Daily performance metrics and request analytics.
              </p>
            </header>

            <DashboardStats stats={stats} />

            <section>
              <div className="mb-4 flex items-center gap-2 text-sm font-black text-primary uppercase tracking-widest">
                <BarChart3 size={16} strokeWidth={3} />
                Item Distribution
              </div>
              <div className="p-6 rounded-2xl glass border border-border/50 luxury-shadow">
                <div className="flex flex-wrap gap-4">
                  {Object.entries(guestRequestCounts).length > 0 ? (
                    Object.entries(guestRequestCounts).map(([item, count]) => (
                      <div
                        key={item}
                        className="flex flex-col items-center justify-center min-w-[100px] p-4 rounded-xl bg-white border border-border shadow-sm transition-all hover:scale-105"
                      >
                        <span className="text-3xl font-black text-primary">
                          {count}
                        </span>
                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                          {item}
                        </span>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground italic">
                      No data to visualize yet.
                    </p>
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
              <RequestCounter
                counts={guestRequestCounts}
                onCopyTotals={copyCounts}
                onCopyViber={copyForViber}
                onCopyNotepad={copyAllForNotepad}
                copyStates={{
                  totals: countsCopySuccess,
                  viber: viberCopySuccess,
                  notepad: notepadCopySuccess,
                }}
              />
            )}

            {/* Table Section */}
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <h2 className="text-xl font-black text-slate-800">
                    Active Logs
                  </h2>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setFilterType("all")}
                      className={cn(
                        "text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider transition-all",
                        filterType === "all"
                          ? "bg-primary text-white shadow-sm"
                          : "bg-primary/5 text-primary hover:bg-primary/10",
                      )}
                    >
                      All ({logs.length})
                    </button>
                    <button
                      onClick={() => setFilterType("pending")}
                      className={cn(
                        "text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider transition-all",
                        filterType === "pending"
                          ? "bg-red-500 text-white shadow-sm"
                          : "bg-red-50 text-red-500 hover:bg-red-100",
                      )}
                    >
                      Undelivered ({stats.undeliveredCount})
                    </button>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={copyTableToClipboard}
                    className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition-all shadow-md shadow-slate-200 font-bold text-xs"
                  >
                    {copySuccess ? <Check size={14} /> : <Copy size={14} />}
                    {copySuccess ? "Copied!" : "Copy Excel"}
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
                data={filteredLogs}
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
        <LogoutConfirmModal
          isOpen={isLogoutModalOpen}
          onClose={() => setIsLogoutModalOpen(false)}
          onLogout={handleLogout}
          onDownload={exportToExcel}
          onCopyAll={copyAllForNotepad}
          copySuccess={notepadCopySuccess}
        />
      </div>
    </NavShell>
  );
}
