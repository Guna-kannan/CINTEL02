import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabaseClient';
import { useAuth } from '../../../context/AuthContext';
import {
  Button,
  Loader,
  ErrorState,
  Modal,
} from '../../../components/index';

export default function ScheduleTab({ eventId }) {
  const { role } = useAuth();
  const isAdmin = role === 'admin' || role === 'moderator';

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Add/Edit modal
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null); // null = add, object = edit
  const [form, setForm] = useState({ time_slot: '', title: '', description: '' });
  const [saving, setSaving] = useState(false);

  // Delete confirmation
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchSchedule();

    const channel = supabase
      .channel(`schedule-${eventId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'event_schedules', filter: `event_id=eq.${eventId}` },
        () => fetchSchedule()
      )
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, [eventId]);

  async function fetchSchedule() {
    setLoading(true);
    setError(null);
    try {
      const { data, error: fetchError } = await supabase
        .from('event_schedules')
        .select('*')
        .eq('event_id', eventId)
        .order('sort_order', { ascending: true })
        .order('time_slot', { ascending: true });

      if (fetchError) throw fetchError;
      setItems(data || []);
    } catch (err) {
      console.error('Failed to fetch schedule:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function openAddModal() {
    setEditing(null);
    setForm({ time_slot: '', title: '', description: '' });
    setShowModal(true);
  }

  function openEditModal(item) {
    setEditing(item);
    setForm({
      time_slot: item.time_slot || '',
      title: item.title || '',
      description: item.description || '',
    });
    setShowModal(true);
  }

  async function handleSave() {
    if (!form.time_slot || !form.title) return;
    setSaving(true);
    try {
      if (editing) {
        // Update existing
        const { error: updateError } = await supabase
          .from('event_schedules')
          .update({
            time_slot: form.time_slot,
            title: form.title,
            description: form.description || null,
          })
          .eq('id', editing.id);
        if (updateError) throw updateError;
      } else {
        // Insert new
        const maxOrder = items.length > 0 ? Math.max(...items.map((i) => i.sort_order || 0)) + 1 : 0;
        const { error: insertError } = await supabase
          .from('event_schedules')
          .insert({
            event_id: parseInt(eventId),
            time_slot: form.time_slot,
            title: form.title,
            description: form.description || null,
            sort_order: maxOrder,
          });
        if (insertError) throw insertError;
      }
      setShowModal(false);
      setEditing(null);
    } catch (err) {
      alert('Failed to save: ' + err.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const { error: delError } = await supabase
        .from('event_schedules')
        .delete()
        .eq('id', deleteTarget.id);
      if (delError) throw delError;
      setDeleteTarget(null);
    } catch (err) {
      alert('Failed to delete: ' + err.message);
    } finally {
      setDeleting(false);
    }
  }

  if (loading) return <Loader text="Loading schedule..." />;
  if (error) return <ErrorState message={error} onRetry={fetchSchedule} />;

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-slate-800">Event Schedule</h3>
          <p className="text-sm text-slate-500 mt-0.5">{items.length} item{items.length !== 1 ? 's' : ''} in schedule</p>
        </div>
        {isAdmin && (
          <Button onClick={openAddModal}>
            <svg className="w-4 h-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Item
          </Button>
        )}
      </div>

      {/* Schedule Timeline */}
      {items.length === 0 ? (
        <div className="text-center py-16">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-50 mx-auto mb-4">
            <svg className="w-8 h-8 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-slate-500 text-sm">No schedule items yet.</p>
          {isAdmin && (
            <button onClick={openAddModal} className="mt-3 text-indigo-600 text-sm font-medium hover:text-indigo-700 transition-colors">
              + Add the first schedule item
            </button>
          )}
        </div>
      ) : (
        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-[23px] top-2 bottom-2 w-0.5 bg-gradient-to-b from-indigo-300 via-indigo-200 to-slate-200 rounded-full" />

          <div className="space-y-1">
            {items.map((item, index) => (
              <div key={item.id} className="relative flex items-start gap-4 group">
                {/* Timeline dot */}
                <div className="relative z-10 flex-shrink-0 mt-1.5">
                  <div className={`h-[14px] w-[14px] rounded-full border-[3px] transition-colors ${
                    index === 0 ? 'border-indigo-500 bg-indigo-100' : 'border-slate-300 bg-white group-hover:border-indigo-400'
                  }`} style={{ marginLeft: '10px' }} />
                </div>

                {/* Content card */}
                <div className="flex-1 rounded-xl border border-slate-100 bg-white p-4 shadow-sm hover:shadow-md transition-all duration-200 mb-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 text-xs font-semibold">
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          {item.time_slot}
                        </span>
                        <h4 className="text-sm font-semibold text-slate-800">{item.title}</h4>
                      </div>
                      {item.description && (
                        <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">{item.description}</p>
                      )}
                    </div>

                    {isAdmin && (
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => openEditModal(item)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                          title="Edit"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => setDeleteTarget(item)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                          title="Delete"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add/Edit Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => { setShowModal(false); setEditing(null); }}
        title={editing ? 'Edit Schedule Item' : 'Add Schedule Item'}
        size="sm"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Time *</label>
              <input
                type="text"
                value={form.time_slot}
                onChange={(e) => setForm((p) => ({ ...p, time_slot: e.target.value }))}
                placeholder="e.g. 09:00 AM"
                className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Title *</label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
                placeholder="e.g. Opening Ceremony"
                className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
              rows={2}
              placeholder="Details about this schedule item..."
              className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 resize-none"
            />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" onClick={() => { setShowModal(false); setEditing(null); }}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving || !form.time_slot || !form.title}>
              {saving ? 'Saving...' : editing ? 'Save Changes' : 'Add Item'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Delete Schedule Item" size="sm">
        <div className="text-center py-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-red-50 mx-auto mb-4">
            <svg className="w-7 h-7 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </div>
          <p className="text-sm text-slate-600 mb-6">
            Delete <strong>{deleteTarget?.title}</strong> ({deleteTarget?.time_slot})?
          </p>
          <div className="flex justify-center gap-3">
            <Button variant="secondary" onClick={() => setDeleteTarget(null)}>Cancel</Button>
            <Button variant="danger" onClick={handleDelete} disabled={deleting}>
              {deleting ? 'Deleting...' : 'Delete'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
