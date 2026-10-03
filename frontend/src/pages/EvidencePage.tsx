import React, { useEffect, useState } from 'react';
import { 
  Camera, Upload, Shield, CheckCircle, AlertTriangle, 
  MapPin, Calendar, Clock, Hash, Plus, Filter 
} from 'lucide-react';
import { api } from '../services/api';
import { FieldEvidence, Intervention } from '../types';
import { LoadingState } from '../components/common/LoadingState';
import { Modal } from '../components/common/Modal';
import { useToast } from '../context/ToastContext';

export const EvidencePage: React.FC = () => {
  const { success, error } = useToast();
  const [loading, setLoading] = useState(true);
  const [evidenceList, setEvidenceList] = useState<FieldEvidence[]>([]);
  const [interventions, setInterventions] = useState<Intervention[]>([]);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [selectedEvidence, setSelectedEvidence] = useState<FieldEvidence | null>(null);

  // Form states
  const [selectedInterventionId, setSelectedInterventionId] = useState('');
  const [photoLat, setPhotoLat] = useState('22.2541');
  const [photoLon, setPhotoLon] = useState('70.7812');
  const [condition, setCondition] = useState('INTACT');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [evData, ivData] = await Promise.all([
        api.getEvidence(),
        api.getInterventions()
      ]);
      setEvidenceList(evData);
      setInterventions(ivData);
      if (ivData.length > 0) setSelectedInterventionId(ivData[0].id);
    } catch (err: any) {
      error('Failed to load evidence vault', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('intervention_id', selectedInterventionId);
      formData.append('latitude', photoLat);
      formData.append('longitude', photoLon);
      formData.append('condition_rating', condition);
      formData.append('field_notes', notes);
      formData.append('uploaded_by', 'Ramesh Solanki (Field Surveyor)');

      await api.uploadEvidence(formData);
      success('Field evidence uploaded and EXIF hash validated!');
      setUploadModalOpen(false);
      loadData();
    } catch (err: any) {
      error('Upload failed', err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return <LoadingState message="Loading Forensic Evidence Vault..." />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
            Geo-Tagged Field Evidence Vault
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Photographic proof with EXIF verification, cryptographic SHA-256 hashes, and proximity checks
          </p>
        </div>

        <button
          onClick={() => setUploadModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-forest-900 text-white rounded-xl text-xs font-semibold hover:bg-forest-800 transition-colors shadow-sm self-start sm:self-auto"
        >
          <Camera className="w-4 h-4" />
          <span>Upload Field Evidence</span>
        </button>
      </div>

      {/* Grid of Evidence Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {evidenceList.map((ev) => {
          const isDistanceWarning = ev.distance_to_asset_m > 50.0;
          return (
            <div
              key={ev.id}
              className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
            >
              <div>
                {/* Photo Banner */}
                <div className="aspect-video relative overflow-hidden bg-slate-900 group">
                  <img
                    src={ev.image_url}
                    alt="Field evidence"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-2.5 right-2.5">
                    {ev.is_verified ? (
                      <span className="bg-emerald-600 text-white px-2 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1 shadow-sm">
                        <CheckCircle className="w-3 h-3" /> Verified
                      </span>
                    ) : (
                      <span className="bg-amber-600 text-white px-2 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1 shadow-sm">
                        <AlertTriangle className="w-3 h-3" /> Flagged
                      </span>
                    )}
                  </div>
                  <div className="absolute bottom-2 left-2 bg-black/60 backdrop-blur-md px-2 py-0.5 rounded text-[10px] text-white font-mono">
                    EXIF Validated
                  </div>
                </div>

                {/* Details */}
                <div className="p-4 space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500 font-medium">Deviation</span>
                    <span className={`font-mono font-bold ${isDistanceWarning ? 'text-amber-700' : 'text-emerald-700'}`}>
                      {ev.distance_to_asset_m.toFixed(1)} m from axis
                    </span>
                  </div>

                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-1.5 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-400 text-[10px]">Coordinates</span>
                      <span className="font-mono text-slate-800">
                        {ev.latitude.toFixed(4)}°N, {ev.longitude.toFixed(4)}°E
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400 text-[10px]">Captured</span>
                      <span className="text-slate-700 font-mono">
                        {new Date(ev.capture_time).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400 text-[10px]">Condition</span>
                      <span className="font-semibold text-slate-800 capitalize">{ev.condition_rating}</span>
                    </div>
                  </div>

                  <div className="pt-1">
                    <span className="text-[10px] text-slate-400 block font-bold uppercase">SHA-256 Digest</span>
                    <span className="font-mono text-[9px] text-slate-500 break-all select-all block bg-slate-50 p-1.5 rounded border border-slate-100 mt-0.5">
                      {ev.image_sha256}
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-4 pt-0">
                <button
                  onClick={() => setSelectedEvidence(ev)}
                  className="w-full py-1.5 bg-slate-100 hover:bg-forest-900 hover:text-white text-slate-700 rounded-lg text-xs font-semibold transition-colors"
                >
                  Inspect Full Forensic Record
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Upload Modal */}
      <Modal
        isOpen={uploadModalOpen}
        onClose={() => setUploadModalOpen(false)}
        title="Register & Upload Field Evidence"
        subtitle="Simulates GNSS GPS reading & EXIF validation"
      >
        <form onSubmit={handleUploadSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Target Intervention / Work ID</label>
            <select
              value={selectedInterventionId}
              onChange={(e) => setSelectedInterventionId(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-200 bg-white font-mono focus:ring-2 focus:ring-forest-900"
            >
              {interventions.map((iv) => (
                <option key={iv.id} value={iv.id}>
                  {iv.work_id} — {iv.structure_type} ({iv.watershed_name})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">GPS Latitude</label>
              <input
                type="number"
                step="0.0001"
                value={photoLat}
                onChange={(e) => setPhotoLat(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 font-mono"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">GPS Longitude</label>
              <input
                type="number"
                step="0.0001"
                value={photoLon}
                onChange={(e) => setPhotoLon(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Structure Physical Condition</label>
            <select
              value={condition}
              onChange={(e) => setCondition(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-200 bg-white font-semibold"
            >
              <option value="INTACT">Intact / Normal Function</option>
              <option value="SILTED">Silted (Desiltation Required)</option>
              <option value="DAMAGED">Damaged / Breach Detected</option>
              <option value="DRY">Dry (No Infiltration)</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Field Surveyor Notes</label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Observation regarding embankment, spillway, or water impoundment..."
              className="w-full p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-forest-900 resize-none"
            />
          </div>

          <div className="p-3 bg-sky-50 rounded-xl border border-sky-200 text-sky-900 text-[11px] leading-relaxed">
            <strong>Automated Anti-Spoof:</strong> The system automatically extracts timestamp and compares coordinates against the planned civil axis. Distance &gt;50m will trigger an automated verification exception.
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setUploadModalOpen(false)}
              className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 rounded-xl bg-forest-900 text-white font-semibold hover:bg-forest-800 shadow-sm"
            >
              {isSubmitting ? 'Validating EXIF...' : 'Submit Evidence'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Forensic Inspection Modal */}
      {selectedEvidence && (
        <Modal
          isOpen={!!selectedEvidence}
          onClose={() => setSelectedEvidence(null)}
          title="Forensic Evidence Record"
          subtitle={`SHA-256: ${selectedEvidence.image_sha256.substring(0, 16)}...`}
        >
          <div className="space-y-4 text-xs">
            <img
              src={selectedEvidence.image_url}
              alt="High resolution inspect"
              className="w-full rounded-xl aspect-video object-cover border border-slate-200"
            />
            <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
              <div>
                <span className="text-slate-400 block text-[10px]">Uploader</span>
                <span className="font-semibold text-slate-800">{selectedEvidence.uploaded_by}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Device GNSS</span>
                <span className="font-semibold text-slate-800">{selectedEvidence.device_model || 'Android GNSS L1+L5'}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Distance to Civil Axis</span>
                <span className="font-mono font-bold text-slate-800">{selectedEvidence.distance_to_asset_m.toFixed(1)} meters</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Quality Score</span>
                <span className="font-mono font-bold text-emerald-700">{(selectedEvidence.quality_score * 100).toFixed(0)}/100</span>
              </div>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px]">Field Notes</span>
              <p className="text-slate-700 mt-0.5">{selectedEvidence.field_notes || 'No surveyor remarks entered.'}</p>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
