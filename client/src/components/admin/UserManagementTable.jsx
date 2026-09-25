import React, { useState } from 'react';
import { Avatar } from '../common/Avatar';
import { RoleBadge } from '../common/Badge';
import { Button } from '../common/Button';
import { formatDate } from '../../utils/dateUtils';
import { adminService } from '../../services/adminService';
import { Shield, Ban, CheckCircle, Search, UserCheck, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

export const UserManagementTable = ({ users, onUserUpdated }) => {
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [updatingId, setUpdatingId] = useState(null);

  const filtered = users.filter((u) => {
    const matchSearch =
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      (u.username && u.username.toLowerCase().includes(search.toLowerCase()));
    const matchRole = roleFilter === 'all' || u.role === roleFilter;
    return matchSearch && matchRole;
  });

  const handleToggleBan = async (user) => {
    const willBan = !user.isBanned;
    let reasonText = '';
    if (willBan) {
      reasonText = window.prompt(`Please provide a reason for suspending/banning ${user.name}:`);
      if (reasonText === null) return; // User cancelled
    } else {
      if (!window.confirm(`Are you sure you want to unban ${user.name}?`)) return;
    }

    setUpdatingId(user._id || user.id);
    try {
      const res = await adminService.updateUserStatus(user._id || user.id, { isBanned: willBan, reason: reasonText });
      if (res.success) {
        toast.success(`User ${willBan ? 'banned' : 'unbanned'} successfully.`);
        if (onUserUpdated) onUserUpdated();
      }
    } catch (err) {
      toast.error('Failed to update user status.');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleChangeRole = async (user, newRole) => {
    setUpdatingId(user._id);
    try {
      const res = await adminService.updateUserStatus(user._id, { role: newRole });
      if (res.success) {
        toast.success(`Role updated to ${newRole}`);
        if (onUserUpdated) onUserUpdated();
      }
    } catch (err) {
      toast.error('Failed to change role.');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDeleteUser = async (user) => {
    const reasonText = window.prompt(
      `Permanently delete "${user.name}"?\n\nThis will remove the user and ALL their associated data (posts, comments, registrations, certificates, messages). This action CANNOT be undone.\n\nPlease provide a reason for deletion:`
    );
    if (reasonText === null) return;

    setUpdatingId(user._id || user.id);
    try {
      const res = await adminService.deleteUser(user._id || user.id, reasonText);
      if (res.success) {
        toast.success(`"${user.name}" permanently deleted.`);
        if (onUserUpdated) onUserUpdated();
      }
    } catch (err) {
      toast.error('Failed to delete user.');
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-card space-y-4">
      {/* Header & Filter Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h3 className="font-bold text-base text-slate-900 dark:text-white">
            User Accounts & Permissions
          </h3>
          <p className="text-xs text-slate-500">
            Total active & registered community members
          </p>
        </div>

        <div className="flex flex-wrap gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-60">
            <input
              type="text"
              placeholder="Search users..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
          </div>

          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="text-xs px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
          >
            <option value="all">All Roles</option>
            <option value="user">Volunteers</option>
            <option value="organization">Organizations</option>
            <option value="admin">Admins</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 uppercase tracking-wider font-semibold">
            <tr>
              <th className="px-4 py-3 rounded-l-xl">User</th>
              <th className="px-4 py-3">Role</th>
              <th className="px-4 py-3">Vol. Hours</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Joined</th>
              <th className="px-4 py-3 rounded-r-xl text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {filtered.map((u) => (
              <tr key={u._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                <td className="px-4 py-3.5">
                  <div className="flex items-center gap-3">
                    <Avatar src={u.avatar} size="sm" isOrg={u.role === 'organization'} />
                    <div>
                      <span className="font-bold text-slate-900 dark:text-white block">
                        {u.name}
                      </span>
                      <span className="text-slate-400 text-[11px]">{u.email}</span>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3.5">
                  <RoleBadge role={u.role} />
                </td>
                <td className="px-4 py-3.5 font-bold text-emerald-600 dark:text-emerald-400">
                  {u.role === 'user' ? `${u.volunteerHours || 0} hrs` : '—'}
                </td>
                <td className="px-4 py-3.5">
                  {u.isBanned ? (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300">
                      Suspended
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                      Active
                    </span>
                  )}
                </td>
                <td className="px-4 py-3.5 text-slate-400">
                  {formatDate(u.createdAt)}
                </td>
                <td className="px-4 py-3.5 text-right">
                  <div className="flex items-center justify-end gap-1.5">
                    {u.role !== 'admin' && (
                      <button
                        onClick={() => handleToggleBan(u)}
                        disabled={updatingId === (u._id || u.id)}
                        className={`p-1.5 rounded-lg text-xs font-semibold transition-colors ${
                          u.isBanned
                            ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                            : 'bg-rose-100 text-rose-800 hover:bg-rose-200'
                        }`}
                        title={u.isBanned ? 'Unban user' : 'Ban user'}
                      >
                        {u.isBanned ? <CheckCircle className="w-3.5 h-3.5" /> : <Ban className="w-3.5 h-3.5" />}
                      </button>
                    )}
                    {u.role !== 'admin' && (
                      <button
                        onClick={() => handleDeleteUser(u)}
                        disabled={updatingId === (u._id || u.id)}
                        className="p-1.5 rounded-lg text-xs font-semibold transition-colors bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-950/50 dark:text-red-400 dark:hover:bg-red-900/60 disabled:opacity-40"
                        title="Permanently delete user"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
