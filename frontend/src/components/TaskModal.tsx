import React, { useState, useEffect } from 'react';
import { X, Loader } from 'lucide-react';
import { fetchApi } from '../api';

interface Member {
  id: string;
  name: string;
  email: string;
}

interface TaskModalProps {
  task: any | null;
  onClose: () => void;
  onSave: (taskData: any) => Promise<void>;
  projectId: string;
  canChangeStatus?: boolean;
}

export default function TaskModal({ task, onClose, onSave, projectId, canChangeStatus = true }: TaskModalProps) {
  const [formData, setFormData] = useState({
    title: task?.title || '',
    description: task?.description || '',
    status: task?.status || 'todo',
    priority: task?.priority || 'medium',
    due_date: task?.due_date || '',
    assignee_id: task?.assignee_id || '',
  });
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchApi(`/projects/${projectId}/members`)
      .then((data) => setMembers(data.members || []))
      .catch(() => setMembers([]));
  }, [projectId]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title) {
      setError('Title is required');
      return;
    }
    setLoading(true);
    try {
      const payload = {
        ...formData,
        due_date: formData.due_date || null,
        assignee_id: formData.assignee_id || null,
      };
      await onSave(payload);
      onClose();
    } catch (err: any) {
      setError(err.error || 'Failed to save task');
    } finally {
      setLoading(false);
    }
  };

  // Helper: get initials from a name
  const getInitials = (name: string) =>
    name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{task ? 'Edit Task' : 'New Task'}</h3>
          <button className="icon-btn" onClick={onClose}><X size={20} /></button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {error && <div className="form-error mb-4">{error}</div>}

            {/* Title */}
            <div className="form-group">
              <label className="form-label">Title <span className="text-danger">*</span></label>
              <input
                name="title"
                value={formData.title}
                onChange={handleChange}
                className="form-input"
                placeholder="What needs to be done?"
                required
              />
            </div>

            {/* Description */}
            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                className="form-input"
                rows={3}
                placeholder="Add a more detailed description..."
              />
            </div>

            {/* Status + Priority row */}
            <div className="flex gap-3 mb-4">
              <div className="form-group flex-1">
                <label className="form-label">
                  Status
                  {!canChangeStatus && <span className="text-xs font-normal text-txsecondary ml-2">(Owner/Assignee only)</span>}
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="form-select disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={!canChangeStatus}
                >
                  <option value="todo">To Do</option>
                  <option value="in_progress">In Progress</option>
                  <option value="done">Done</option>
                </select>
              </div>
              <div className="form-group flex-1">
                <label className="form-label">Priority</label>
                <select name="priority" value={formData.priority} onChange={handleChange} className="form-select">
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
            </div>

            {/* Assignee */}
            <div className="form-group">
              <label className="form-label">Assignee</label>
              <select name="assignee_id" value={formData.assignee_id} onChange={handleChange} className="form-select">
                <option value="">— Unassigned —</option>
                {members.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name} ({m.email})
                  </option>
                ))}
              </select>
              {formData.assignee_id && (
                <div className="flex items-center gap-2 mt-2">
                  <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary">
                    {getInitials(members.find((m) => m.id === formData.assignee_id)?.name || '?')}
                  </div>
                  <span className="text-sm text-txsecondary">
                    {members.find((m) => m.id === formData.assignee_id)?.name}
                  </span>
                </div>
              )}
            </div>

            {/* Due Date */}
            <div className="form-group">
              <label className="form-label">Due Date</label>
              <input
                type="date"
                name="due_date"
                value={formData.due_date}
                onChange={handleChange}
                className="form-input"
              />
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? <Loader className="loader" size={16} /> : 'Save Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
