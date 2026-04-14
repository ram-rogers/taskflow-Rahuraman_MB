import { useState, useEffect } from 'react';
import { fetchApi } from '../api';
import { Link } from 'react-router-dom';
import { Plus, Folder, UserCircle2 } from 'lucide-react';
import ProjectModal from '../components/ProjectModal';
import { useToast } from '../context/ToastContext';

export default function Projects() {
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNew, setShowNew] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      const data = await fetchApi('/projects');
      setProjects(data.projects || []);
    } catch (err: any) {
      toast(err.error || 'Failed to load projects', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSaved = (newProj: any) => {
    setProjects([...projects, newProj]);
    setShowNew(false);
    toast('Project created successfully');
  };

  if (loading) {
    return (
      <div className="main-content">
        <div className="flex justify-between items-center mb-8">
          <div className="skeleton h-8 w-32 rounded-lg"></div>
          <div className="skeleton h-10 w-32 rounded-lg"></div>
        </div>
        <div className="grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-6">
          {[1, 2, 3, 4].map(n => (
            <div key={n} className="card h-48 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <div className="skeleton h-6 w-6 rounded-md"></div>
                  <div className="skeleton h-6 w-1/2 rounded-md"></div>
                </div>
                <div className="skeleton-text"></div>
                <div className="skeleton-text w-2/3"></div>
              </div>
              <div className="skeleton h-4 w-1/3 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="main-content">
      <div className="flex justify-between items-center mb-4">
        <h2>Projects</h2>
        <button className="btn btn-primary" onClick={() => setShowNew(true)}>
          <Plus size={18} /> New Project
        </button>
      </div>

      {showNew && (
        <ProjectModal
          onClose={() => setShowNew(false)}
          onSaved={handleSaved}
        />
      )}

      {projects.length === 0 && !showNew ? (
        <div className="empty-state card">
          <Folder size={48} className="opacity-50 mx-auto mb-4" />
          <h3>No projects yet</h3>
          <p className="text-secondary mt-2">Create your first project to get started.</p>
        </div>
      ) : (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-6">
          {projects.map((p) => (
            <Link key={p.id} to={`/projects/${p.id}`}>
              <div className="card interactive h-full flex flex-col">
                <div className="flex items-center gap-2 mb-4">
                  <Folder className="text-secondary" />
                  <h3 className="m-0 text-xl">{p.name}</h3>
                </div>
                <p className="text-secondary text-sm flex-1">
                  {p.description || 'No description provided.'}
                </p>
                <div className="mt-6 text-xs text-txsecondary flex justify-between items-center">
                  <span>Created {new Date(p.created_at).toLocaleDateString()}</span>
                  {p.owner_name && (
                    <span className="flex items-center gap-1 bg-bgsecondary px-2 py-1 rounded-md">
                      <UserCircle2 size={14} />
                      {p.owner_name}
                    </span>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
