import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/api";
import { StatusBadge, Spinner, Btn } from "../components/UI";
import "../components/styles.css";

export default function Tasks() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks]       = useState([]);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState("");
  const [filterProj, setFilterProj] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");

  useEffect(() => {
    const load = async () => {
      try {
        const projRes = await api.get("/projects");
        setProjects(projRes.data);
        const allTasks = [];
        await Promise.all(projRes.data.map(async p => {
          try {
            const r = await api.get(`/tasks?projectId=${p._id}`);
            allTasks.push(...r.data.map(t => ({ ...t, projectName: p.name })));
          } catch {}
        }));
        try {
          const personal = await api.get("/tasks/personal");
          allTasks.push(...personal.data.map(t => ({ ...t, projectName: "Personal" })));
        } catch {}
        setTasks(allTasks);
      } catch {}
      finally { setLoading(false); }
    };
    load();
  }, []);

  const deleteTask = async (id) => {
    try {
      await api.delete(`/tasks/${id}`);
      setTasks(p => p.filter(t => t._id !== id));
    } catch {}
  };

  const updateStatus = async (task, status) => {
    try {
      const res = await api.patch(`/tasks/${task._id}`, { status });
      setTasks(p => p.map(t => t._id === task._id ? { ...t, status: res.data.status } : t));
    } catch {}
  };

  const filtered = tasks.filter(t => {
    const matchSearch = t.title.toLowerCase().includes(search.toLowerCase());
    const matchProj   = filterProj === "all" || t.project === filterProj || (filterProj === "personal" && !t.project);
    const matchStatus = filterStatus === "all" || t.status === filterStatus;
    return matchSearch && matchProj && matchStatus;
  });

  const STATUS_OPTIONS = ["all","TODO","IN_PROGRESS","DONE"];
  const STATUS_LABELS  = { all:"All Statuses", TODO:"Todo", IN_PROGRESS:"In Progress", DONE:"Done" };

  if (loading) return <div className="df-loading"><Spinner size="lg" /></div>;

  return (
    <div className="df-page-anim">
      <div className="df-page-head">
        <h1 className="df-page-title">Tasks</h1>
        <p className="df-page-sub">All tasks across your projects</p>
      </div>

      <div className="df-filters">
        <div className="df-search-wrap" style={{ maxWidth: 280 }}>
          <span className="df-search-icon">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><circle cx="6" cy="6" r="4.5" stroke="currentColor" strokeWidth="1.3"/><path d="M9.5 9.5L12.5 12.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>
          </span>
          <input className="df-input df-search" placeholder="Search tasks..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>

        <select className="df-select df-filter-select" value={filterProj} onChange={e => setFilterProj(e.target.value)}>
          <option value="all">All Projects</option>
          {projects.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
          <option value="personal">Personal</option>
        </select>

        <select className="df-select df-filter-select" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
          {STATUS_OPTIONS.map(s => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
        </select>
      </div>

      <div className="df-card">
        <div className="df-table-wrap">
          {filtered.length === 0 ? (
            <div className="df-empty"><p>No tasks found matching your filters.</p></div>
          ) : (
            <table className="df-table">
              <thead>
                <tr>
                  <th>Task</th>
                  <th>Project</th>
                  <th>Status</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(t => (
                  <tr key={t._id}>
                    <td>{t.title}</td>
                    <td style={{ color:"var(--text-muted)", fontFamily:"var(--font-mono)", fontSize:12 }}>{t.projectName || "—"}</td>
                    <td><StatusBadge status={t.status} /></td>
                    <td style={{ color:"var(--text-muted)", fontFamily:"var(--font-mono)", fontSize:12 }}>
                      {new Date(t.createdAt).toLocaleDateString()}
                    </td>
                    <td>
                      <div className="df-table-actions">
                        {t.status !== "DONE" && (
                          <Btn size="sm" variant="ghost"
                            onClick={() => updateStatus(t, t.status === "TODO" ? "IN_PROGRESS" : "DONE")}>
                            {t.status === "TODO" ? "Start" : "Complete"}
                          </Btn>
                        )}
                        <Btn size="sm" variant="danger" onClick={() => deleteTask(t._id)}>Delete</Btn>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
