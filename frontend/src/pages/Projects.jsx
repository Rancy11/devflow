import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/api";
import { Btn, Modal, Field, Input, Textarea, ProgressBar, Spinner } from "../components/UI";
import "../components/styles.css";

function CreateModal({ open, onClose, onCreated }) {
  const [name, setName]   = useState("");
  const [err, setErr]     = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (!name.trim()) { setErr("Project name is required"); return; }
    setLoading(true);
    try {
      const res = await api.post("/projects", { name });
      onCreated(res.data);
      setName(""); setErr(""); onClose();
    } catch (e) { setErr(e.response?.data?.message || "Failed to create project"); }
    finally { setLoading(false); }
  };

  return (
    <Modal open={open} onClose={onClose} title="New Project">
      <Field label="Project Name" error={err}>
        <Input placeholder="e.g. My Awesome App" value={name} onChange={e => { setName(e.target.value); setErr(""); }} />
      </Field>
      <div className="df-form-actions">
        <Btn variant="secondary" onClick={onClose}>Cancel</Btn>
        <Btn loading={loading} onClick={submit}>Create Project</Btn>
      </div>
    </Modal>
  );
}

export default function Projects() {
  const navigate = useNavigate();
  const [projects, setProjects]   = useState([]);
  const [tasks, setTasks]         = useState([]);
  const [loading, setLoading]     = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [deleting, setDeleting]   = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get("/projects");
        setProjects(res.data);
        const allTasks = [];
        await Promise.all(res.data.map(async p => {
          try {
            const r = await api.get(`/tasks?projectId=${p._id}`);
            allTasks.push(...r.data);
          } catch {}
        }));
        setTasks(allTasks);
      } catch {}
      finally { setLoading(false); }
    };
    load();
  }, []);

  const handleDelete = async (id) => {
    setDeleting(id);
    // Note: backend doesn't have DELETE /projects/:id yet — you can add it.
    // For now we just remove from local state.
    setProjects(p => p.filter(x => x._id !== id));
    setDeleting(null);
  };

  const getProgress = (proj) => {
    const pt = tasks.filter(t => t.project === proj._id);
    if (!pt.length) return 0;
    return Math.round((pt.filter(t => t.status === "DONE").length / pt.length) * 100);
  };

  if (loading) return <div className="df-loading"><Spinner size="lg" /></div>;

  return (
    <div className="df-page-anim">
      <div className="df-page-head df-page-head-row">
        <div>
          <h1 className="df-page-title">Projects</h1>
          <p className="df-page-sub">{projects.length} project{projects.length !== 1 ? "s" : ""} total</p>
        </div>
        <Btn onClick={() => setModalOpen(true)} icon={
          <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M6.5 1v11M1 6.5h11" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>
        }>New Project</Btn>
      </div>

      {projects.length === 0 ? (
        <div className="df-empty">
          <svg width="48" height="48" viewBox="0 0 48 48" fill="none"><path d="M6 10a4 4 0 014-4h10l4 4h14a4 4 0 014 4v20a4 4 0 01-4 4H10a4 4 0 01-4-4V10z" stroke="white" strokeWidth="2" fill="none"/></svg>
          <p>No projects yet. Create your first project!</p>
          <Btn onClick={() => setModalOpen(true)}>Create Project</Btn>
        </div>
      ) : (
        <div className="df-projects-grid">
          {projects.map(p => {
            const pct = getProgress(p);
            const taskCount = tasks.filter(t => t.project === p._id).length;
            const doneCount = tasks.filter(t => t.project === p._id && t.status === "DONE").length;
            return (
              <div key={p._id} className="df-project-card">
                <div>
                  <div className="df-project-card__name">{p.name}</div>
                </div>
                <div className="df-project-card__progress">
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                    <span style={{ fontSize:11, color:"var(--text-muted)", fontFamily:"var(--font-mono)" }}>{doneCount}/{taskCount} tasks</span>
                    <span className="df-project-card__pct">{pct}%</span>
                  </div>
                  <ProgressBar value={pct} />
                </div>
                <div className="df-project-card__stats">
                  <span>Created {new Date(p.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="df-project-card__actions">
                  <Btn size="sm" onClick={() => navigate(`/project/${p._id}`)}>Open</Btn>
                  <Btn size="sm" variant="danger" loading={deleting === p._id} onClick={() => handleDelete(p._id)}>Delete</Btn>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <CreateModal open={modalOpen} onClose={() => setModalOpen(false)} onCreated={p => setProjects(prev => [p, ...prev])} />
    </div>
  );
}
