import React, { useEffect, useState } from 'react';
import { ClipboardCheck, Plus, Calendar, User, FileText, CheckCircle2 } from 'lucide-react';
import { api } from '../services/api';
import { FieldVisit, Intervention } from '../types';
import { LoadingState } from '../components/common/LoadingState';
import { Modal } from '../components/common/Modal';
import { useToast } from '../context/ToastContext';

export const FieldVisitsPage: React.FC = () => {
  const { success, error } = useToast();
  const [loading, setLoading] = useState(true);
  const [visits, setVisits] = useState<FieldVisit[]>([]);
  const [interventions, setInterventions] = useState<Intervention[]>([]);
  const [modalOpen, setModalOpen] = useState(false);

  // Form states
  const [selectedInterventionId, setSelectedInterventionId] = useState('');
  const [inspectorName, setInspectorName] = useState('Ramesh Solanki (Assistant Engineer)');
  const [visitDate, setVisitDate] = useState(new Date().toISOString().split('T')[0]);
  const [condition, setCondition] = useState('FUNCTIONAL');
  const [siltation, setSiltation] = useState('LOW');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [vData, ivData] = await Promise.all([
        api.getFieldVisits(),
        api.getInterventions()
      ]);
      setVisits(vData);
      setInterventions(ivData);
      if (ivData.length > 0) setSelectedInterventionId(ivData[0].id);
    } catch (err: any) {
      error('Failed to load inspection records', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await api.createFieldVisit({
        intervention_id: selectedInterventionId,
        inspector_name: inspectorName,
        visit_date: visitDate,
        structure_condition: condition,
        siltation_level: siltation,
        inspection_notes: notes,
        recommended_action: siltation === 'HIGH' ? 'Desiltation required before monsoon' : 'Routine monitoring'
      });
      success('Field inspection report logged!');
      setModalOpen(false);
      loadData();
    } catch (err: any) {
      error('Failed to log visit', err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return <LoadingState message="Loading Field Inspection Logs..." />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
            Field Inspection & Ground Survey Logs
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Physical ground measurements, structural condition assessments, and siltation monitoring
          </p>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-forest-900 text-white rounded-xl text-xs font-semibold hover:bg-forest-800 transition-colors shadow-sm self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Log Field Inspection</span>
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider">
            <tr>
              <th className="p-4">Visit Date</th>
              <th className="p-4">Inspector</th>
              <th className="p-4">Condition</th>
              <th className="p-4">Siltation</th>
              <th className="p-4">Inspection Notes</th>
              <th className="p-4">Recommended Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {visits.map((v) => (
              <tr key={v.id} className="hover:bg-slate-50/70 transition-colors">
                <td className="p-4 font-mono font-bold text-slate-900">{new Date(v.visit_date).toLocaleDateString()}</td>
                <td className="p-4 text-slate-800 font-medium">{v.inspector_name}</td>
                <td className="p-4">
                  <span className="text-[10px] px-2 py-0.5 rounded-full font-bold uppercase bg-emerald-50 text-emerald-800 border border-emerald-200">
                    {v.structure_condition}
                  </span>
                </td>
                <td className="p-4">
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                    v.siltation_level === 'HIGH' ? 'bg-red-50 text-red-700 border border-red-200' :
                    v.siltation_level === 'MODERATE' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                    'bg-slate-100 text-slate-700'
                  }`}>
                    {v.siltation_level}
                  </span>
                </td>
                <td className="p-4 text-slate-600 max-w-xs">{v.inspection_notes || 'Physical measurements completed.'}</td>
                <td className="p-4 text-slate-700 font-medium">{v.recommended_action || 'Routine monitoring'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Log Visit Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Log Physical Field Inspection"
        subtitle="Records structure integrity and maintenance requirements"
      >
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Target Asset</label>
            <select
              value={selectedInterventionId}
              onChange={(e) => setSelectedInterventionId(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-200 bg-white font-mono focus:ring-2 focus:ring-forest-900"
            >
              {interventions.map((iv) => (
                <option key={iv.id} value={iv.id}>
                  {iv.work_id} ({iv.structure_type})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Inspector Name</label>
              <input
                type="text"
                value={inspectorName}
                onChange={(e) => setInspectorName(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Date of Visit</label>
              <input
                type="date"
                value={visitDate}
                onChange={(e) => setVisitDate(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Structure Condition</label>
              <select
                value={condition}
                onChange={(e) => setCondition(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 bg-white font-semibold"
              >
                <option value="FUNCTIONAL">Functional / Intact</option>
                <option value="SILTED">Silted Basin</option>
                <option value="DAMAGED">Damaged Apron / Breach</option>
                <option value="DRY">Dry (No Storage)</option>
              </select>
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Siltation Level</label>
              <select
                value={siltation}
                onChange={(e) => setSiltation(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 bg-white font-semibold"
              >
                <option value="LOW">Low (&lt; 20%)</option>
                <option value="MODERATE">Moderate (20% - 50%)</option>
                <option value="HIGH">High (&gt; 50% - Urgent)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Inspection Remarks</label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="State observations on masonry weir, apron scour, or embankment stability..."
              className="w-full p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-forest-900 resize-none"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 rounded-xl bg-forest-900 text-white font-semibold hover:bg-forest-800 shadow-sm"
            >
              {isSubmitting ? 'Submitting...' : 'Save Inspection Record'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
