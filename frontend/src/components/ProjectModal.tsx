import { useState } from 'react';
import { X, Loader } from 'lucide-react';
import { fetchApi } from '../api';

interface ProjectModalProps {
  onClose: () => void;
  onSaved: (project: any) => void;
  /** When provided, the modal operates in edit mode (PATCH /projects/:id) */
  project?: { id: string; name: string; description?: string } | null;
}

export default function ProjectModal({ onClose, onSaved, project }: ProjectModalProps) {
  const isEdit = !!project;
  const [name, setName] = useState(project?.name ?? '');
  const [description, setDescription] = useState(project?.description ?? '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;

    setSaving(true);
    setError('');

    try {
      const data = isEdit
        ? await fetchApi(`/projects/${project!.id}`, {
            method: 'PATCH',
            body: JSON.stringify({ name, description }),
          })
        : await fetchApi('/projects', {
            method: 'POST',
            body: JSON.stringify({ name, description }),
          });
      onSaved(data);
    } catch (err: any) {
      setError(err.error || `Failed to ${isEdit ? 'update' : 'create'} project`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>

        <div className="modal-header">
          <h3>{isEdit ? 'Edit Project' : 'New Project'}</h3>
          <button className="icon-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <form id="project-form" onSubmit={handleSubmit}>
          <div className="modal-body">
            {error && <div className="form-error mb-4">{error}</div>}

            <div className="form-group">
              <label className="form-label">Project Name <span className="text-danger">*</span></label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Website Redesign"
                value={name}
                onChange={e => setName(e.target.value)}
                autoFocus
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea
                className="form-input"
                placeholder="What is this project about?"
                value={description}
                onChange={e => setDescription(e.target.value)}
                rows={4}
              />
            </div>
          </div>

          <div className="modal-footer">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-secondary"
              disabled={saving}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary min-w-[120px]"
              disabled={saving || !name}
            >
              {saving
                ? <Loader className="loader" size={16} />
                : isEdit ? 'Save Changes' : 'Create Project'}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
