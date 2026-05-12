"use client";

import React from 'react';
import { TrendingUp, Users, Clock } from 'lucide-react';

interface DashboardStatsProps {
  stats: {
    totalLogs: number;
    uniqueRooms: number;
    avgRequests: string;
  };
}

export const DashboardStats: React.FC<DashboardStatsProps> = ({ stats }) => {
  return (
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
  );
};
