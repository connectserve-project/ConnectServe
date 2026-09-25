import React, { useState } from 'react';
import { Avatar } from '../common/Avatar';
import { Button } from '../common/Button';
import { adminService } from '../../services/adminService';
import { CheckCircle2, XCircle, ShieldCheck, ExternalLink } from 'lucide-react';
import toast from 'react-hot-toast';

export const OrgVerificationTable = ({ organizations = [], onOrgUpdated }) => {
  const [updatingId, setUpdatingId] = useState(null);

  const handleVerify = async (orgId, willVerify) => {
    setUpdatingId(orgId);
    try {
      const res = await adminService.verifyOrganization(orgId, willVerify);
      if (res.success) {
        toast.success(`Organization ${willVerify ? 'verified' : 'unverified'}`);
        if (onOrgUpdated) onOrgUpdated();
      }
    } catch (err) {
      toast.error('Failed to update verification status.');
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-card space-y-4">
      <div>
        <h3 className="font-bold text-base text-slate-900 dark:text-white">
          NGO & Organization Verifications
        </h3>
        <p className="text-xs text-slate-500">
          Review credentials, registration IDs, and issue verified trust badges
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 uppercase tracking-wider font-semibold">
            <tr>
              <th className="px-4 py-3 rounded-l-xl">Organization</th>
              <th className="px-4 py-3">Reg. Number</th>
              <th className="px-4 py-3">Document</th>
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 rounded-r-xl text-right">Verification Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {organizations.length === 0 ? (
              <tr>
                <td colSpan="6" className="py-6 text-center text-slate-400 italic">
                  No organizations to verify.
                </td>
              </tr>
            ) : (
              organizations.map((org) => {
                const isVerified = org.orgDetails?.isVerified;
                const isUpdating = updatingId === org._id;

                return (
                  <tr key={org._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-3">
                        <Avatar src={org.avatar} size="sm" isOrg={true} />
                        <div>
                          <span className="font-bold text-slate-900 dark:text-white block">
                            {org.name}
                          </span>
                          <span className="text-slate-400 text-[11px]">{org.email}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 font-mono text-slate-600 dark:text-slate-300">
                      {org.orgDetails?.registrationNumber || 'Not specified'}
                    </td>
                    <td className="px-4 py-3.5 text-slate-600 dark:text-slate-300">
                      {org.orgDetails?.verificationDocument?.url ? (
                        <a 
                          href={org.orgDetails.verificationDocument.url} 
                          target="_blank" 
                          rel="noreferrer" 
                          className="flex items-center gap-1 text-emerald-600 hover:underline"
                        >
                          <ExternalLink className="w-3.5 h-3.5" /> View
                        </a>
                      ) : (
                        <span className="text-slate-400 text-xs italic">None uploaded</span>
                      )}
                    </td>
                    <td className="px-4 py-3.5 text-slate-600 dark:text-slate-300">
                      {org.orgDetails?.category || 'General'}
                    </td>
                    <td className="px-4 py-3.5">
                      {isVerified ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                          <CheckCircle2 className="w-3 h-3" /> Verified Org
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300">
                          Pending Verification
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      {isVerified ? (
                        <Button
                          size="sm"
                          variant="ghost"
                          disabled={isUpdating}
                          onClick={() => handleVerify(org._id, false)}
                          className="text-slate-500 hover:text-rose-600 text-xs"
                        >
                          Revoke Badge
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          variant="primary"
                          disabled={isUpdating}
                          onClick={() => handleVerify(org._id, true)}
                          icon={ShieldCheck}
                        >
                          Verify Org
                        </Button>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
