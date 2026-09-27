import React, { useState, useEffect } from 'react';
import { adminService } from '../services/adminService';
import { AnalyticsCharts } from '../components/admin/AnalyticsCharts';
import { UserManagementTable } from '../components/admin/UserManagementTable';
import { OrgVerificationTable } from '../components/admin/OrgVerificationTable';
import { ContentModerationTable } from '../components/admin/ContentModerationTable';
import {
  Shield,
  Users,
  Award,
  Calendar,
  CheckCircle,
  Flag,
  BarChart3,
  Building2,
  Clock,
  RefreshCw,
} from 'lucide-react';
import toast from 'react-hot-toast';

export const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('analytics');
  const [analytics, setAnalytics] = useState(null);
  const [users, setUsers] = useState([]);
  const [organizations, setOrganizations] = useState([]);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const [analyticsRes, usersRes, orgsRes, reportsRes] = await Promise.all([
        adminService.getAnalytics(),
        adminService.getAllUsers({ limit: 50 }),
        adminService.getOrganizations(),
        adminService.getModerationQueue(),
      ]);

      if (analyticsRes.success) setAnalytics(analyticsRes.data);
      if (usersRes.success) setUsers(usersRes.data?.users || []);
      if (orgsRes.success) setOrganizations(orgsRes.data?.organizations || []);
      if (reportsRes.success) setReports(reportsRes.data?.reports || []);
    } catch (err) {
      toast.error('Failed to load admin analytics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const overview = analytics?.overview || {};

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-purple-600 dark:text-purple-400 flex items-center gap-1">
            <Shield className="w-4 h-4" /> Platform Administration
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
            ConnectServe Admin Center
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Platform governance, NGO verification, user moderation, and analytics.
          </p>
        </div>

        <button
          onClick={fetchAdminData}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-xs font-bold text-slate-700 dark:text-slate-200 self-start sm:self-auto transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Refresh Data</span>
        </button>
      </div>

      {/* Analytics Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-card space-y-1">
          <span className="text-[11px] font-bold text-slate-400 uppercase">Total Volunteers</span>
          <p className="text-2xl font-black text-slate-900 dark:text-white">
            {overview.totalVolunteers || 0}
          </p>
          <p className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1">
            <Users className="w-3 h-3" /> Active changemakers
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-card space-y-1">
          <span className="text-[11px] font-bold text-slate-400 uppercase">Organizations</span>
          <p className="text-2xl font-black text-slate-900 dark:text-white">
            {overview.totalOrganizations || 0}
          </p>
          <p className="text-[10px] text-blue-600 font-semibold flex items-center gap-1">
            <Building2 className="w-3 h-3" /> {overview.verifiedOrganizations || 0} verified
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-card space-y-1">
          <span className="text-[11px] font-bold text-slate-400 uppercase">Volunteer Hours</span>
          <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
            {overview.totalVolunteerHours || 0} hrs
          </p>
          <p className="text-[10px] text-slate-400 flex items-center gap-1">
            <Clock className="w-3 h-3" /> Verified service logged
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-card space-y-1">
          <span className="text-[11px] font-bold text-slate-400 uppercase">Drives & Events</span>
          <p className="text-2xl font-black text-slate-900 dark:text-white">
            {overview.totalEvents || 0}
          </p>
          <p className="text-[10px] text-amber-500 font-semibold flex items-center gap-1">
            <Award className="w-3 h-3" /> {overview.totalCertificates || 0} certificates
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2 overflow-x-auto no-scrollbar">
        {[
          { id: 'analytics', label: 'Analytics & Growth', icon: BarChart3 },
          { id: 'users', label: `Users (${users.length})`, icon: Users },
          { id: 'orgs', label: `NGO Verifications (${organizations.length})`, icon: Building2 },
          { id: 'moderation', label: `Moderation (${reports.length})`, icon: Flag },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap min-h-[44px] ${
              activeTab === tab.id
                ? 'bg-purple-600 text-white shadow-md shadow-purple-600/25'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab Panels */}
      {activeTab === 'analytics' && (
        <AnalyticsCharts
          monthlyTrend={analytics?.monthlyTrend}
          categoryStats={analytics?.categoryStats}
        />
      )}

      {activeTab === 'users' && (
        <UserManagementTable users={users} onUserUpdated={fetchAdminData} />
      )}

      {activeTab === 'orgs' && (
        <OrgVerificationTable organizations={organizations} onOrgUpdated={fetchAdminData} />
      )}

      {activeTab === 'moderation' && (
        <ContentModerationTable reports={reports} onReportResolved={fetchAdminData} />
      )}
    </div>
  );
};
