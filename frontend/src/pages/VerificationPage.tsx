import React, { useEffect, useState } from 'react';
import { 
  CheckSquare, AlertTriangle, CheckCircle2, XCircle, 
  HelpCircle, User, Filter, RefreshCw, Eye 
} from 'lucide-react';
import { api } from '../services/api';
import { VerificationTask } from '../types';
import { LoadingState } from '../components/common/LoadingState';
import { Modal } from '../components/common/Modal';
import { useToast } from '../context/ToastContext';

export const VerificationPage: React.FC = () => {
  const { success, error } = useToast();
  const [loading, setLoading] = useState(true);
  const [tasks, setTasks] = useState<VerificationTask[]>([]);
  const [selectedTask, setSelectedTask] = useState<VerificationTask | null>(null);
  const [adjudicateModalOpen, setAdjudicateModalOpen] = useState(false);
  const [actionType, setActionType] = useState('VERIFIED');
  const [reviewerNotes, setReviewerNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadTasks = async () => {
    setLoading(true);
    try {
      const data = await api.getVerificationQueue();
      setTasks(data);
    } catch (err: any) {
      error('Failed to load verification tasks', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTasks();
  }, []);

  const handleOpenAdjudicate = (task: VerificationTask) => {
    setSelectedTask(task);
    setReviewerNotes(task.reviewer_notes || '');
    setAdjudicateModalOpen(true);
  };

  const handleAdjudicateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTask) return;
    setIsSubmitting(true);
    try {
      await api.adjudicateTask(selectedTask.id, actionType, reviewerNotes);
      success(`Task marked as ${actionType} and logged in audit ledger!`);
      setAdjudicateModalOpen(false);
      loadTasks();
    } catch (err: any) {
      error('Adjudication failed', err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return <LoadingState message="Loading Verification Queue..." />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
            Verification Queue & Triage Desk
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Prioritized exception workflow for assets with geofence discrepancies or contradictory satellite signals
          </p>
        </div>

        <button
          onClick={loadTasks}
          className="p-2 rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 self-start sm:self-auto"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Task Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-x-auto shadow-sm">
        <table className="w-full text-left text-xs min-w-[700px]">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider">
            <tr>
              <th className="p-4">Priority</th>
              <th className="p-4">Intervention</th>
              <th className="p-4">Trigger Exception</th>
              <th className="p-4">Assigned To</th>
              <th className="p-4">Status</th>
              <th className="p-4 text-right">Adjudication</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {tasks.map((task) => (
              <tr key={task.id} className="hover:bg-slate-50/70 transition-colors">
                <td className="p-4">
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                    task.priority === 'CRITICAL' || task.priority === 'HIGH'
                      ? 'bg-red-50 text-red-700 border border-red-200'
                      : 'bg-amber-50 text-amber-700 border border-amber-200'
                  }`}>
                    {task.priority}
                  </span>
                </td>
                <td className="p-4">
                  <span className="font-mono font-bold text-slate-900 block">{task.intervention_work_id || 'Intervention'}</span>
                  <span className="text-[11px] text-slate-500">{task.intervention_type}</span>
                </td>
                <td className="p-4">
                  <span className="font-semibold text-slate-800 block">
                    {task.failure_reason.replace('_', ' ')}
                  </span>
                  <span className="text-[11px] text-slate-500 line-clamp-1">{task.reviewer_notes}</span>
                </td>
                <td className="p-4 text-slate-600 font-medium">
                  {task.assigned_officer || 'District Officer'}
                </td>
                <td className="p-4">
                  <span className={`text-[10px] px-2 py-0.5 rounded-md font-bold uppercase ${
                    task.status === 'VERIFIED' ? 'bg-emerald-50 text-emerald-800' :
                    task.status === 'REJECTED' ? 'bg-red-50 text-red-800' : 'bg-slate-100 text-slate-700'
                  }`}>
                    {task.status}
                  </span>
                </td>
                <td className="p-4 text-right">
                  <button
                    onClick={() => handleOpenAdjudicate(task)}
                    className="px-3 py-1.5 rounded-lg bg-forest-900 text-white font-semibold hover:bg-forest-800 transition-colors shadow-sm"
                  >
                    Adjudicate
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Adjudication Modal */}
      {selectedTask && (
        <Modal
          isOpen={adjudicateModalOpen}
          onClose={() => setAdjudicateModalOpen(false)}
          title={`Adjudicate Task: ${selectedTask.intervention_work_id}`}
          subtitle={`Trigger Reason: ${selectedTask.failure_reason.replace('_', ' ')}`}
        >
          <form onSubmit={handleAdjudicateSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Decision Action</label>
              <select
                value={actionType}
                onChange={(e) => setActionType(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 bg-white font-semibold focus:ring-2 focus:ring-forest-900"
              >
                <option value="VERIFIED">Approve & Mark Verified (Accept deviation)</option>
                <option value="RE_INSPECT">Request Field Re-visit (Schedule Surveyor)</option>
                <option value="REJECTED">Reject Evidence (Reject work claim)</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Reviewer Compliance Notes</label>
              <textarea
                rows={3}
                value={reviewerNotes}
                onChange={(e) => setReviewerNotes(e.target.value)}
                placeholder="Enter justification for audit log..."
                className="w-full p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-forest-900 resize-none"
              />
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-600 text-[11px]">
              This adjudication will be recorded with actor identity and timestamp in the immutable Audit Ledger.
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setAdjudicateModalOpen(false)}
                className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2 rounded-xl bg-forest-900 text-white font-semibold hover:bg-forest-800 shadow-sm"
              >
                {isSubmitting ? 'Recording...' : 'Commit Adjudication'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
