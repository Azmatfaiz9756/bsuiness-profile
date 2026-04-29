import React, { useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import { Plus, Edit2, Trash2, Tag, LayoutDashboard } from 'lucide-react';
import { motion } from 'motion/react';

export default function AdminJobs() {
  const { jobOpenings, setJobOpenings, user } = useAppContext();
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<any>({});
  const [isAdding, setIsAdding] = useState(false);

  const handleEdit = (job: any) => {
    setEditingId(job.id);
    setEditForm({ ...job });
  };

  const handleSave = () => {
    if (editingId) {
      setJobOpenings(jobOpenings.map((j: any) => j.id === editingId ? { ...editForm, id: editingId } : j));
      setEditingId(null);
    } else {
      const newJob = { ...editForm, id: Date.now(), profileId: 'DBC000000042' }; // Using mock ID for now
      setJobOpenings([...jobOpenings, newJob]);
      setIsAdding(false);
    }
  };

  const handleDelete = (id: number) => {
    if(confirm('Delete job opening?')) {
      setJobOpenings(jobOpenings.filter((j: any) => j.id !== id));
    }
  };

  const startAdd = () => {
    setIsAdding(true);
    setEditingId(null);
    setEditForm({
      title: 'New Position',
      description: 'Job description goes here.',
      requirements: 'Requirements...',
      salary: 'Negotiable',
      type: 'Full-time',
      status: 'Open'
    });
  };

  return (
    <div className="p-6 max-w-5xl mx-auto font-sans">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Job Openings (Hiring)</h1>
          <p className="text-sm text-slate-500">Manage job postings on your business profile</p>
        </div>
        <button onClick={startAdd} className="bg-blue-600 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 hover:bg-blue-700 transition">
          <Plus size={18} /> Post Job
        </button>
      </div>

      <div className="space-y-6">
        {isAdding && (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h3 className="font-bold text-lg mb-4">Post New Job</h3>
            <JobForm editForm={editForm} setEditForm={setEditForm} />
            <div className="mt-6 flex justify-end gap-3">
              <button onClick={() => setIsAdding(false)} className="px-4 py-2 font-bold text-slate-600 hover:bg-slate-100 rounded-lg">Cancel</button>
              <button onClick={handleSave} className="bg-green-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-green-700">Publish</button>
            </div>
          </div>
        )}

        {jobOpenings.map((job: any) => (
          <div key={job.id} className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            {editingId === job.id ? (
              <div>
                <h3 className="font-bold text-lg mb-4">Edit Job Post</h3>
                <JobForm editForm={editForm} setEditForm={setEditForm} />
                <div className="mt-6 flex justify-end gap-3">
                  <button onClick={() => setEditingId(null)} className="px-4 py-2 font-bold text-slate-600 hover:bg-slate-100 rounded-lg">Cancel</button>
                  <button onClick={handleSave} className="bg-blue-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-blue-700">Save Changes</button>
                </div>
              </div>
            ) : (
              <div>
                <div className="flex justify-between mb-2">
                  <h3 className="font-black text-xl text-slate-900">{job.title}</h3>
                  <div className="flex gap-2">
                    <button onClick={() => handleEdit(job)} className="p-2 text-blue-600 hover:bg-blue-50 rounded"><Edit2 size={18} /></button>
                    <button onClick={() => handleDelete(job.id)} className="p-2 text-red-600 hover:bg-red-50 rounded"><Trash2 size={18} /></button>
                  </div>
                </div>
                <div className="flex gap-4 mb-4">
                  <span className="text-xs font-bold bg-slate-100 text-slate-600 px-2 py-1 rounded">{job.type}</span>
                  <span className="text-xs font-bold bg-blue-50 text-blue-600 px-2 py-1 rounded">{job.salary}</span>
                  <span className={`text-xs font-bold px-2 py-1 rounded ${job.status === 'Open' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>{job.status}</span>
                </div>
                <p className="text-slate-600 text-sm mb-4">{job.description}</p>
                <div className="text-sm">
                  <strong className="text-slate-900">Requirements:</strong>
                  <p className="text-slate-600 mt-1">{job.requirements}</p>
                </div>
              </div>
            )}
          </div>
        ))}
        
        {jobOpenings.length === 0 && !isAdding && (
          <div className="text-center py-12 text-slate-500">No job openings found. Click "Post Job" to create one.</div>
        )}
      </div>
    </div>
  );
}

function JobForm({ editForm, setEditForm }: { editForm: any, setEditForm: any }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="md:col-span-2">
        <label className="block text-sm font-bold text-slate-700 mb-2">Job Title</label>
        <input type="text" className="w-full border border-slate-300 rounded-lg p-2" value={editForm.title || ''} onChange={e => setEditForm({...editForm, title: e.target.value})} />
      </div>
      <div className="md:col-span-2">
        <label className="block text-sm font-bold text-slate-700 mb-2">Description</label>
        <textarea className="w-full border border-slate-300 rounded-lg p-2 h-24" value={editForm.description || ''} onChange={e => setEditForm({...editForm, description: e.target.value})}></textarea>
      </div>
      <div className="md:col-span-2">
        <label className="block text-sm font-bold text-slate-700 mb-2">Requirements</label>
        <textarea className="w-full border border-slate-300 rounded-lg p-2 h-20" value={editForm.requirements || ''} onChange={e => setEditForm({...editForm, requirements: e.target.value})}></textarea>
      </div>
      <div>
        <label className="block text-sm font-bold text-slate-700 mb-2">Salary Range</label>
        <input type="text" className="w-full border border-slate-300 rounded-lg p-2" value={editForm.salary || ''} onChange={e => setEditForm({...editForm, salary: e.target.value})} />
      </div>
      <div>
        <label className="block text-sm font-bold text-slate-700 mb-2">Type</label>
        <select className="w-full border border-slate-300 rounded-lg p-2" value={editForm.type || 'Full-time'} onChange={e => setEditForm({...editForm, type: e.target.value})}>
          <option>Full-time</option>
          <option>Part-time</option>
          <option>Contract</option>
          <option>Freelance</option>
        </select>
      </div>
      <div>
        <label className="block text-sm font-bold text-slate-700 mb-2">Status</label>
        <select className="w-full border border-slate-300 rounded-lg p-2" value={editForm.status || 'Open'} onChange={e => setEditForm({...editForm, status: e.target.value})}>
          <option>Open</option>
          <option>Closed</option>
        </select>
      </div>
    </div>
  );
}
