import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchApi } from '../api';
import TaskModal from '../components/TaskModal';
import ConfirmModal from '../components/ConfirmModal';
import ProjectModal from '../components/ProjectModal';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Plus, Trash2, Pencil } from 'lucide-react';

import {
  DndContext,
  type DragEndEvent,
  type DragOverEvent,
  DragOverlay,
  type DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
  useDroppable,
} from '@dnd-kit/core';
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

// Helper: get initials from a name
const getInitials = (name: string) =>
  name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);

// ─── Draggable Task Card ────────────────────────────────────────────────
function TaskCard({
  task,
  onEdit,
  onDelete,
  getPriorityClass,
  canDelete = false,
  canChangeStatus = false,
  isDragging = false,
}: {
  task: any;
  onEdit: (task: any) => void;
  onDelete: (id: string, e: React.MouseEvent) => void;
  getPriorityClass: (p: string) => string;
  canDelete?: boolean;
  canChangeStatus?: boolean;
  isDragging?: boolean;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging: sortableDragging } =
    useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: sortableDragging ? 0.4 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...(canChangeStatus ? listeners : {})}
      className={`task-card transition-all duration-200 select-none ${canChangeStatus ? 'cursor-grab active:cursor-grabbing hover:-translate-y-0.5 hover:border-primary' : 'cursor-default opacity-80'
        } ${isDragging ? 'rotate-2 scale-105 shadow-xl ring-2 ring-primary/50' : ''
        }`}
      onClick={() => onEdit(task)}
    >
      <div className="flex justify-between items-start">
        <div className="task-title flex-1 mr-2">{task.title}</div>
        {canDelete && (
          <button
            className="icon-btn hover:text-danger hover:bg-danger/10 transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(task.id, e);
            }}
            title="Delete Task"
          >
            <Trash2 size={14} />
          </button>
        )}
      </div>
      {task.description && (
        <p className="text-sm text-txsecondary mb-2 line-clamp-2">{task.description}</p>
      )}
      <div className="task-meta">
        <span className={getPriorityClass(task.priority)}>{task.priority}</span>
        {task.due_date && <span>Due: {task.due_date}</span>}
      </div>
      {task.assignee_name && (
        <div className="flex items-center gap-1.5 mt-2 pt-2 border-t border-border/40">
          <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center text-[10px] font-bold text-primary">
            {getInitials(task.assignee_name)}
          </div>
          <span className="text-xs text-txsecondary">{task.assignee_name}</span>
        </div>
      )}
    </div>
  );
}

// ─── Droppable Column ───────────────────────────────────────────────────
function KanbanColumn({
  status,
  title,
  tasks,
  onEdit,
  onDelete,
  getPriorityClass,
  canDelete,
  canChangeStatusLogic,
  isOver,
}: {
  status: string;
  title: string;
  tasks: any[];
  onEdit: (task: any) => void;
  onDelete: (id: string, e: React.MouseEvent) => void;
  getPriorityClass: (p: string) => string;
  canDelete: (task: any) => boolean;
  canChangeStatusLogic: (task: any) => boolean;
  isOver: boolean;
}) {
  const { setNodeRef } = useDroppable({ id: status });

  return (
    <div
      ref={setNodeRef}
      className={`board-column transition-all duration-200 ${isOver ? 'ring-2 ring-primary/60 bg-primary/5 scale-[1.01]' : ''
        }`}
    >
      <div className="column-title">
        {title} <span className="column-badge">{tasks.length}</span>
      </div>

      <SortableContext items={tasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
        {tasks.length === 0 ? (
          <div
            className={`text-center py-8 px-4 text-txsecondary text-sm rounded-xl border-2 border-dashed transition-all duration-200 ${isOver ? 'border-primary/60 text-primary' : 'border-transparent'
              }`}
          >
            {isOver ? 'Drop here' : 'No tasks here'}
          </div>
        ) : (
          tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onEdit={onEdit}
              onDelete={onDelete}
              getPriorityClass={getPriorityClass}
              canDelete={canDelete(task)}
              canChangeStatus={canChangeStatusLogic(task)}
            />
          ))
        )}
      </SortableContext>
    </div>
  );
}

// ─── Main Component ─────────────────────────────────────────────────────
export default function ProjectDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [project, setProject] = useState<any>(null);
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showEditProject, setShowEditProject] = useState(false);
  const [editingTask, setEditingTask] = useState<any>(null);
  const [activeTask, setActiveTask] = useState<any>(null);
  const [overColumn, setOverColumn] = useState<string | null>(null);

  // ── Filters (Issue 3: wired to API) ──────────────────────────────────
  const [filterAssignee, setFilterAssignee] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [members, setMembers] = useState<any[]>([]);

  const [confirmAction, setConfirmAction] = useState<{ type: 'project' } | { type: 'task', id: string } | null>(null);
  const { toast } = useToast();

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );

  // Load project details and members
  const loadProject = useCallback(async () => {
    try {
      const data = await fetchApi(`/projects/${id}`);
      setProject(data);
      const membersData = await fetchApi(`/projects/${id}/members`);
      setMembers(membersData.members || []);
    } catch (err: any) {
      toast(err.error || 'Failed to load project details', 'error');
    } finally {
      setLoading(false);
    }
  }, [id]);

  // Issue 3: Load tasks from the API with server-side filters applied
  const loadTasks = useCallback(async () => {
    const params = new URLSearchParams();
    if (filterStatus !== 'all') params.set('status', filterStatus);
    if (filterAssignee !== 'all' && filterAssignee !== 'unassigned')
      params.set('assignee', filterAssignee);

    const query = params.toString();
    try {
      const data = await fetchApi(`/projects/${id}/tasks${query ? `?${query}` : ''}`);
      let fetched: any[] = data.tasks || [];
      // "unassigned" cannot be sent as a server param, filter client-side only for that case
      if (filterAssignee === 'unassigned') {
        fetched = fetched.filter((t: any) => !t.assignee_id);
      }
      setTasks(fetched);
    } catch (err: any) {
      toast(err.error || 'Failed to load tasks', 'error');
    }
  }, [id, filterStatus, filterAssignee]);

  useEffect(() => {
    loadProject();
  }, [loadProject]);

  // Re-fetch tasks whenever filters change
  useEffect(() => {
    if (project) loadTasks();
  }, [loadTasks, project]);

  const handleSaveTask = async (taskData: any) => {
    if (editingTask) {
      await fetchApi(`/tasks/${editingTask.id}`, {
        method: 'PATCH',
        body: JSON.stringify(taskData),
      });
    } else {
      await fetchApi(`/projects/${id}/tasks`, {
        method: 'POST',
        body: JSON.stringify({ ...taskData, project_id: id }),
      });
      toast('Task created successfully');
    }
    loadTasks();
  };

  // Issue 2: handle project edit saved
  const handleProjectEdited = (updatedProject: any) => {
    setProject((prev: any) => ({ ...prev, ...updatedProject }));
    setShowEditProject(false);
    toast('Project updated successfully');
  };

  const handleDeleteTask = async (taskId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    try {
      setTasks((prev) => prev.filter((t) => t.id !== taskId));
      await fetchApi(`/tasks/${taskId}`, { method: 'DELETE' });
      toast('Task deleted successfully');
    } catch (err: any) {
      toast(err.error || 'Failed to delete task', 'error');
      loadTasks();
    }
  };

  const handleDeleteProject = async () => {
    try {
      await fetchApi(`/projects/${id}`, { method: 'DELETE' });
      toast('Project deleted safely');
      navigate('/projects');
    } catch (err: any) {
      toast(err.error || 'Failed to delete project', 'error');
    }
  };

  // ── DnD handlers ──────────────────────────────────────────────────────
  const COLUMNS = ['todo', 'in_progress', 'done'];

  const getTaskById = (taskId: string) => tasks.find((t) => t.id === taskId);

  const getColumnOfTask = (taskId: string) => {
    const task = getTaskById(taskId);
    return task?.status ?? null;
  };

  const handleDragStart = (event: DragStartEvent) => {
    const task = getTaskById(event.active.id as string);
    setActiveTask(task ?? null);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const overId = event.over?.id as string | undefined;
    if (!overId) { setOverColumn(null); return; }
    if (COLUMNS.includes(overId)) {
      setOverColumn(overId);
    } else {
      const col = getColumnOfTask(overId);
      setOverColumn(col);
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    setActiveTask(null);
    setOverColumn(null);
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    let targetStatus: string;
    if (COLUMNS.includes(overId)) {
      targetStatus = overId;
    } else {
      const targetTask = getTaskById(overId);
      if (!targetTask) return;
      targetStatus = targetTask.status;
    }

    const sourceTask = getTaskById(activeId);
    if (!sourceTask || sourceTask.status === targetStatus) return;

    // Optimistic update
    setTasks((prev) =>
      prev.map((t) => (t.id === activeId ? { ...t, status: targetStatus } : t))
    );

    try {
      await fetchApi(`/tasks/${activeId}`, {
        method: 'PATCH',
        body: JSON.stringify({ status: targetStatus }),
      });
    } catch (err: any) {
      toast(err.error || 'Failed to update task status', 'error');
      loadTasks();
    }
  };

  const getPriorityClass = (priority: string) => {
    switch (priority) {
      case 'high': return 'badge badge-high';
      case 'medium': return 'badge badge-medium';
      case 'low': return 'badge badge-low';
      default: return 'badge';
    }
  };

  if (loading) {
    return (
      <div className="main-content max-w-7xl">
        <div className="flex items-center gap-4 mb-8">
          <div className="skeleton w-8 h-8 rounded-md"></div>
          <div className="skeleton w-48 h-8 rounded-md"></div>
        </div>
        <div className="board-columns">
          {[1, 2, 3].map(col => (
            <div key={col} className="board-column">
              <div className="skeleton w-24 h-6 mb-4 rounded"></div>
              {[1, 2].map(task => (
                <div key={task} className="card p-4 mb-4">
                  <div className="skeleton-text w-3/4"></div>
                  <div className="skeleton-text w-1/2"></div>
                  <div className="mt-4 skeleton w-16 h-4 rounded"></div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!project) return null;

  const isOwner = project.owner_id === user?.id;

  const columnDefs = [
    { status: 'todo', title: 'To Do' },
    { status: 'in_progress', title: 'In Progress' },
    { status: 'done', title: 'Done' },
  ];

  return (
    <div className="main-content max-w-7xl">
      {showModal && (
        <TaskModal
          task={editingTask}
          projectId={id!}
          canChangeStatus={!editingTask || editingTask.assignee_id === user?.id || isOwner}
          onClose={() => { setShowModal(false); setEditingTask(null); }}
          onSave={handleSaveTask}
        />
      )}

      {/* Issue 2: Edit project modal */}
      {showEditProject && (
        <ProjectModal
          project={{ id: project.id, name: project.name, description: project.description }}
          onClose={() => setShowEditProject(false)}
          onSaved={handleProjectEdited}
        />
      )}

      {/* Breadcrumb Navigation */}
      <nav className="flex items-center gap-2 text-sm font-medium text-txsecondary mb-2">
        <button onClick={() => navigate('/projects')} className="hover:text-primary transition-colors cursor-pointer bg-transparent border-none p-0">Projects</button>
        <span>/</span>
        <span className="text-txprimary">{project.name}</span>
      </nav>

      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mt-1 mb-6">
          <h1 className="text-3xl font-bold text-white tracking-tight m-0">{project.name}</h1>
          {/* Issue 2: Edit button visible only to owner */}
          {isOwner && (
            <button
              className="icon-btn text-txsecondary hover:text-primary transition-colors"
              onClick={() => setShowEditProject(true)}
              title="Edit Project"
            >
              <Pencil size={18} />
            </button>
          )}
        </div>

        {project.description && (
          <div className="bg-slate-800/40 rounded-xl p-5 border border-slate-700/50 shadow-sm max-w-3xl">
            <h3 className="text-xs uppercase tracking-wider text-txsecondary mb-2 font-semibold">About Project</h3>
            <p className="text-sm text-txprimary/90 leading-relaxed m-0">
              {project.description}
            </p>
          </div>
        )}
      </div>

      <div className="board-header">
        {/* Issue 3: Status + Assignee filters wired to API */}
        <div className="flex items-center gap-2 flex-wrap">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="form-select py-1.5 px-3 text-sm"
          >
            <option value="all">All Statuses</option>
            <option value="todo">To Do</option>
            <option value="in_progress">In Progress</option>
            <option value="done">Done</option>
          </select>

          <select
            value={filterAssignee}
            onChange={(e) => setFilterAssignee(e.target.value)}
            className="form-select py-1.5 px-3 text-sm"
          >
            <option value="all">All Assignees</option>
            <option value="unassigned">Unassigned</option>
            {members.map((m: any) => (
              <option key={m.id} value={m.id}>{m.name}</option>
            ))}
          </select>

          {(filterStatus !== 'all' || filterAssignee !== 'all') && (
            <button
              className="text-xs text-txsecondary hover:text-primary transition-colors"
              onClick={() => { setFilterStatus('all'); setFilterAssignee('all'); }}
            >
              Clear filters
            </button>
          )}
        </div>

        <div className="flex items-center gap-3">
          {isOwner && (
            <button
              className="text-sm font-semibold text-danger flex items-center gap-1.5 px-3 py-2 rounded-md hover:bg-danger/10 transition-colors"
              onClick={() => setConfirmAction({ type: 'project' })}
            >
              <Trash2 size={16} /> Delete Project
            </button>
          )}
          <button className="btn btn-primary cursor-pointer" onClick={() => { setEditingTask(null); setShowModal(true); }}>
            <Plus size={18} /> Add Task
          </button>
        </div>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <div className="board-columns">
          {columnDefs.map(({ status, title }) => {
            const filteredTasks = tasks.filter((t) => t.status === status);

            return (
              <KanbanColumn
                key={status}
                status={status}
                title={title}
                tasks={filteredTasks}
                onEdit={(task) => { setEditingTask(task); setShowModal(true); }}
                onDelete={(taskId, e) => {
                  e.stopPropagation();
                  setConfirmAction({ type: 'task', id: taskId });
                }}
                getPriorityClass={getPriorityClass}
                // Issue 1: owner OR creator can delete
                canDelete={(task) => isOwner || task.creator_id === user?.id}
                canChangeStatusLogic={(task) => task.assignee_id === user?.id || isOwner}
                isOver={overColumn === status}
              />
            );
          })}
        </div>

        {/* Floating drag preview */}
        <DragOverlay>
          {activeTask && (
            <div className="task-card rotate-2 scale-105 shadow-2xl ring-2 ring-primary/50 opacity-95 cursor-grabbing">
              <div className="task-title">{activeTask.title}</div>
              {activeTask.description && (
                <p className="text-sm text-txsecondary mb-2 line-clamp-2">{activeTask.description}</p>
              )}
              <div className="task-meta">
                <span className={getPriorityClass(activeTask.priority)}>{activeTask.priority}</span>
                {activeTask.due_date && <span>Due: {activeTask.due_date}</span>}
              </div>
            </div>
          )}
        </DragOverlay>
      </DndContext>

      {confirmAction && (
        <ConfirmModal
          title={confirmAction.type === 'project' ? 'Delete Project' : 'Delete Task'}
          message={confirmAction.type === 'project'
            ? 'Are you sure you want to completely delete this project? All associated tasks will be permanently removed. This cannot be undone.'
            : 'Are you sure you want to delete this task? It will be removed permanently.'}
          confirmText="Yes, delete it"
          onConfirm={() => {
            if (confirmAction.type === 'project') handleDeleteProject();
            else handleDeleteTask(confirmAction.id);
            setConfirmAction(null);
          }}
          onCancel={() => setConfirmAction(null)}
        />
      )}
    </div>
  );
}
