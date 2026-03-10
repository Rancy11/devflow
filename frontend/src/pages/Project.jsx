import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/api";
import { Btn, Modal, Field, Input, Textarea, Select, StatusBadge, Spinner } from "../components/UI";
import "../components/styles.css";

const STATUSES = ["TODO", "IN_PROGRESS", "DONE"];
const STATUS_LABELS = { TODO: "Todo", IN_PROGRESS: "In Progress", DONE: "Done" };
const STATUS_DOTS   = { TODO: "var(--accent)", IN_PROGRESS: "var(--amber)", DONE: "var(--emerald)" };

function InviteMemberModal({ open, onClose, projectId }) {
  const [email, setEmail]     = useState("");
  const [err, setErr]         = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (!email.trim()) { setErr("Email is required"); return; }
    setLoading(true);
    setErr(""); setSuccess("");
    try {
      await api.post(`/projects/${projectId}/members`, { email });
      setSuccess(`${email} has been added to the project!`);
      setEmail("");
    } catch (e) {
      setErr(e.response?.data?.message || "Failed to add member");
    } finally { setLoading(false); }
  };

  const handleClose = () => { setEmail(""); setErr(""); setSuccess(""); onClose(); };

  return (
    <Modal open={open} onClose={handleClose} title="Invite Member">
      <p style={{ fontSize:13, color:"var(--text-secondary)", marginBottom:16, lineHeight:1.6 }}>
        Enter the email address of the person you want to invite. They must already have a DevFlow account.
      </p>

      {success && (
        <div style={{
          background:"rgba(16,185,129,0.1)", border:"1px solid rgba(16,185,129,0.25)",
          borderRadius:"var(--r-md)", padding:"10px 14px",
          fontSize:13, color:"var(--emerald)", marginBottom:14,
          display:"flex", alignItems:"center", gap:8,
        }}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><circle cx="7" cy="7" r="6" stroke="currentColor" strokeWidth="1.3"/><path d="M4.5 7l2 2 3-3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>
          {success}
        </div>
      )}

      <Field label="Email Address" error={err}>
        <Input
          type="email"
          placeholder="teammate@example.com"
          value={email}
          onChange={e => { setEmail(e.target.value); setErr(""); setSuccess(""); }}
          onKeyDown={e => e.key === "Enter" && submit()}
        />
      </Field>

      <div className="df-form-actions">
        <Btn variant="secondary" onClick={handleClose}>Close</Btn>
        <Btn loading={loading} onClick={submit}>
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M6 1v10M1 6h10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>
          Add Member
        </Btn>
      </div>
    </Modal>
  );
}

function AddTaskModal({ open, onClose, projectId, onAdded }) {
  const [title, setTitle]       = useState("");
  const [desc, setDesc]         = useState("");
  const [status, setStatus]     = useState("TODO");
  const [err, setErr]           = useState("");
  const [loading, setLoading]   = useState(false);

  const submit = async () => {
    if (!title.trim()) { setErr("Title is required"); return; }
    setLoading(true);
    try {
      const res = await api.post("/tasks", { title, description: desc, projectId, status });
      onAdded(res.data);
      setTitle(""); setDesc(""); setStatus("TODO"); setErr(""); onClose();
    } catch (e) { setErr(e.response?.data?.message || "Failed to create task"); }
    finally { setLoading(false); }
  };

  return (
    <Modal open={open} onClose={onClose} title="Add Task">
      <Field label="Title" error={err}>
        <Input placeholder="Task title" value={title} onChange={e => { setTitle(e.target.value); setErr(""); }} />
      </Field>
      <Field label="Description">
        <Textarea placeholder="What needs to be done?" value={desc} onChange={e => setDesc(e.target.value)} />
      </Field>
      <Field label="Status">
        <Select value={status} onChange={e => setStatus(e.target.value)}>
          {STATUSES.map(s => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
        </Select>
      </Field>
      <div className="df-form-actions">
        <Btn variant="secondary" onClick={onClose}>Cancel</Btn>
        <Btn loading={loading} onClick={submit}>Add Task</Btn>
      </div>
    </Modal>
  );
}

function EditTaskModal({ open, onClose, task, onUpdated }) {
  const [title, setTitle]   = useState(task?.title || "");
  const [desc, setDesc]     = useState(task?.description || "");
  const [status, setStatus] = useState(task?.status || "TODO");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (task) { setTitle(task.title); setDesc(task.description || ""); setStatus(task.status); }
  }, [task]);

  const submit = async () => {
    setLoading(true);
    try {
      const res = await api.patch(`/tasks/${task._id}`, { status });
      onUpdated({ ...task, title, description: desc, status: res.data.status });
      onClose();
    } catch {}
    finally { setLoading(false); }
  };

  return (
    <Modal open={open} onClose={onClose} title="Edit Task">
      <Field label="Title">
        <Input value={title} disabled style={{ opacity: 0.6 }} />
      </Field>
      <Field label="Status">
        <Select value={status} onChange={e => setStatus(e.target.value)}>
          {STATUSES.map(s => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
        </Select>
      </Field>
      <div className="df-form-actions">
        <Btn variant="secondary" onClick={onClose}>Cancel</Btn>
        <Btn loading={loading} onClick={submit}>Save</Btn>
      </div>
    </Modal>
  );
}

export default function Project() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject]   = useState(null);
  const [tasks, setTasks]       = useState([]);
  const [loading, setLoading]   = useState(true);
  const [addOpen, setAddOpen]     = useState(false);
  const [editTask, setEditTask]   = useState(null);
  const [inviteOpen, setInviteOpen] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const [projRes, taskRes] = await Promise.all([
          api.get("/projects"),
          api.get(`/tasks?projectId=${id}`)
        ]);
        const proj = projRes.data.find(p => p._id === id);
        setProject(proj);
        setTasks(taskRes.data);
      } catch {}
      finally { setLoading(false); }
    };
    load();
  }, [id]);

  const moveTask = async (task, toStatus) => {
    try {
      const res = await api.patch(`/tasks/${task._id}`, { status: toStatus });
      setTasks(prev => prev.map(t => t._id === task._id ? { ...t, status: res.data.status } : t));
    } catch {}
  };

  const deleteTask = async (taskId) => {
    try {
      await api.delete(`/tasks/${taskId}`);
      setTasks(prev => prev.filter(t => t._id !== taskId));
    } catch {}
  };

  const cols = [
    { status: "TODO",        prev: null,          next: "IN_PROGRESS", moveLabel: "→ In Progress" },
    { status: "IN_PROGRESS", prev: "TODO",         next: "DONE",        moveLabel: "→ Done" },
    { status: "DONE",        prev: "IN_PROGRESS",  next: null,          moveLabel: null },
  ];

  if (loading) return <div className="df-loading"><Spinner size="lg" /></div>;
  if (!project) return (
    <div className="df-page-anim">
      <p style={{ color:"var(--text-muted)" }}>Project not found. <button className="df-view-all" onClick={() => navigate("/projects")}>Back to projects</button></p>
    </div>
  );

  return (
    <div className="df-page-anim">
      <div className="df-page-head df-page-head-row">
        <div>
          <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:4 }}>
            <button className="df-view-all" style={{ fontSize:12 }} onClick={() => navigate("/projects")}>← Projects</button>
          </div>
          <h1 className="df-page-title">{project.name}</h1>
          <p className="df-page-sub">{tasks.length} task{tasks.length !== 1 ? "s" : ""} total</p>
        </div>
        <Btn onClick={() => setAddOpen(true)} icon={
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M6 1v10M1 6h10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>
        }>Add Task</Btn>
        <Btn variant="secondary" onClick={() => setInviteOpen(true)}>
          <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><circle cx="5" cy="4" r="2.5" stroke="currentColor" strokeWidth="1.3"/><path d="M1 11c0-2.2 1.8-4 4-4M10 8v4M8 10h4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>
          Invite
        </Btn>
      </div>

      <div className="df-kanban">
        {cols.map(col => {
          const colTasks = tasks.filter(t => t.status === col.status);
          return (
            <div key={col.status} className="df-kanban-col">
              <div className="df-kanban-col__head">
                <span className="df-kanban-col__title">
                  <span className="df-kanban-col__dot" style={{ background: STATUS_DOTS[col.status] }} />
                  {STATUS_LABELS[col.status]}
                </span>
                <span className="df-kanban-col__count">{colTasks.length}</span>
              </div>
              <div className="df-kanban-col__body">
                {colTasks.length === 0 && (
                  <div style={{ textAlign:"center", padding:"20px 0", color:"var(--text-muted)", fontSize:12 }}>Empty</div>
                )}
                {colTasks.map(t => (
                  <div key={t._id} className="df-task-card">
                    <div className="df-task-card__title">{t.title}</div>
                    {t.description && <div className="df-task-card__desc">{t.description}</div>}
                    <div className="df-task-card__foot">
                      <div className="df-move-btns">
                        {col.prev && (
                          <button className="df-move-btn" onClick={() => moveTask(t, col.prev)}>← Back</button>
                        )}
                        {col.next && (
                          <button className="df-move-btn" onClick={() => moveTask(t, col.next)}>{col.moveLabel}</button>
                        )}
                      </div>
                      <div className="df-task-card__actions">
                        <button className="df-icon-btn" title="Edit" onClick={() => setEditTask(t)}>
                          <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M9.5 1.5l2 2L4 11H2v-2L9.5 1.5z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round"/></svg>
                        </button>
                        <button className="df-icon-btn df-icon-btn--danger" title="Delete" onClick={() => deleteTask(t._id)}>
                          <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M2 3.5h9M5 3.5V2.5h3v1M4 3.5v7a.5.5 0 00.5.5h4a.5.5 0 00.5-.5v-7" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <AddTaskModal open={addOpen} onClose={() => setAddOpen(false)} projectId={id} onAdded={t => setTasks(p => [...p, t])} />
      {editTask && <EditTaskModal open={!!editTask} onClose={() => setEditTask(null)} task={editTask}
        onUpdated={updated => { setTasks(p => p.map(t => t._id === updated._id ? updated : t)); setEditTask(null); }} />}
      <InviteMemberModal open={inviteOpen} onClose={() => setInviteOpen(false)} projectId={id} />
    </div>
  );
}