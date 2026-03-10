import { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/api";
import { AuthContext } from "../context/AuthContext";
import { StatusBadge, ProgressBar, Spinner } from "../components/UI";
import "../components/styles.css";
function StatCard({ val, label, colorCls, icon, bg, color }) {
  return (
    <div className={`df-stat-card df-stat-card--${colorCls}`}>
      <div className="df-stat-icon" style={{ background: bg, color }}>{icon}</div>
      <div>
        <div className="df-stat-val">{val}</div>
        <div className="df-stat-label">{label}</div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [personal, setPersonal] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const projRes = await api.get("/projects");
        const projs = projRes.data;
        setProjects(projs);
        const allTasks = [];
        await Promise.all(projs.map(async (p) => {
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
        try {
          const pr = await api.get("/tasks/personal");
          setPersonal(pr.data);
        } catch {}
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    load();
  }, []);

  const total     = tasks.length;
  const completed = tasks.filter(t => t.status === "DONE").length;
  const pending   = tasks.filter(t => t.status !== "DONE").length;
  const getProgress = (proj) => {
    const pt = tasks.filter(t => t.project === proj._id);
    if (!pt.length) return 0;
    return Math.round((pt.filter(t => t.status === "DONE").length / pt.length) * 100);
  };

  if (loading) return <div className="df-loading"><Spinner size="lg" /></div>;

  return (
    <div className="df-page-anim">
      <div className="df-page-head">
        <h1 className="df-page-title">Dashboard</h1>
        <p className="df-page-sub">Welcome back, {user?.name}. Here's your overview.</p>
      </div>
      <div className="df-stats-grid">
        <StatCard val={projects.length} label="Projects" colorCls="blue" bg="rgba(79,110,247,0.12)" color="var(--accent)"
          icon={<svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M1 3.5A1.5 1.5 0 012.5 2H7l1.5 1.5H16A1.5 1.5 0 0117.5 5v9A1.5 1.5 0 0116 15.5H2.5A1.5 1.5 0 011 14V3.5z" stroke="currentColor" strokeWidth="1.4" fill="none"/></svg>} />
        <StatCard val={total} label="Total Tasks" colorCls="violet" bg="rgba(139,92,246,0.12)" color="var(--violet)"
          icon={<svg width="18" height="18" viewBox="0 0 18 18" fill="none"><rect x="1.5" y="1.5" width="15" height="15" rx="3" stroke="currentColor" strokeWidth="1.4" fill="none"/><path d="M5.5 9l3 3 4-5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>} />
        <StatCard val={completed} label="Completed" colorCls="green" bg="rgba(16,185,129,0.12)" color="var(--emerald)"
          icon={<svg width="18" height="18" viewBox="0 0 18 18" fill="none"><circle cx="9" cy="9" r="7.5" stroke="currentColor" strokeWidth="1.4" fill="none"/><path d="M6 9l2.5 2.5L12 6.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>} />
        <StatCard val={pending} label="Pending" colorCls="amber" bg="rgba(245,158,11,0.12)" color="var(--amber)"
          icon={<svg width="18" height="18" viewBox="0 0 18 18" fill="none"><circle cx="9" cy="9" r="7.5" stroke="currentColor" strokeWidth="1.4" fill="none"/><path d="M9 5.5v4l2.5 2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg>} />
      </div>
      <div className="df-dash-grid">
        <div className="df-card">
          <div className="df-card__head">
            <span className="df-card__title">Recent Projects</span>
            <button className="df-view-all" onClick={() => navigate("/projects")}>View all →</button>
          </div>
          <div className="df-section-body">
            {projects.length === 0
              ? <p style={{ padding:"16px", color:"var(--text-muted)", fontSize:13 }}>No projects yet</p>
              : projects.slice(0,3).map(p => {
                  const pct = getProgress(p);
                  return (
                    <div key={p._id} className="df-proj-item" onClick={() => navigate(`/project/${p._id}`)}>
                      <div className="df-proj-item__top">
                        <span className="df-proj-item__name">{p.name}</span>
                        <span className="df-proj-item__pct">{pct}%</span>
                      </div>
                      <ProgressBar value={pct} />
                      <div className="df-proj-item__meta">
                        <span>{tasks.filter(t => t.project === p._id).length} tasks</span>
                        <span>{tasks.filter(t => t.project === p._id && t.status === "DONE").length} done</span>
                      </div>
                    </div>
                  );
              })}
          </div>
        </div>
        <div className="df-card">
          <div className="df-card__head">
            <span className="df-card__title">Recent Tasks</span>
            <button className="df-view-all" onClick={() => navigate("/tasks")}>View all →</button>
          </div>
          <div className="df-section-body">
            {tasks.length === 0
              ? <p style={{ padding:"16px", color:"var(--text-muted)", fontSize:13 }}>No tasks yet</p>
              : tasks.slice(0,5).map(t => (
                  <div key={t._id} className="df-task-row">
                    <div className={`df-task-check${t.status==="DONE"?" df-task-check--done":""}`}>
                      {t.status==="DONE" && <svg width="9" height="9" viewBox="0 0 9 9" fill="none"><path d="M1.5 4.5l2 2 4-4" stroke="white" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                    </div>
                    <div style={{ flex:1, minWidth:0 }}>
                      <div className={`df-task-title${t.status==="DONE"?" df-task-title--done":""}`}>{t.title}</div>
                      <div className="df-task-proj">{t.projectName}</div>
                    </div>
                    <StatusBadge status={t.status} />
                  </div>
                ))}
          </div>
        </div>
      </div>

      {/* Personal Notes Preview */}
      {personal.length > 0 && (
        <div className="df-card">
          <div className="df-card__head">
            <span className="df-card__title" style={{ display:"flex", alignItems:"center", gap:8 }}>
              Personal Notes
              <span style={{ fontSize:10, padding:"2px 8px", borderRadius:"var(--r-full)", background:"rgba(139,92,246,0.12)", color:"var(--violet)", fontFamily:"var(--font-mono)", fontWeight:600, textTransform:"uppercase" }}>Private</span>
            </span>
            <button className="df-view-all" onClick={() => navigate("/personal")}>View all →</button>
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))", gap:8, padding:10 }}>
            {personal.slice(0, 4).map(n => {
              const colors = { TODO:"var(--accent)", IN_PROGRESS:"var(--amber)", DONE:"var(--emerald)" };
              const bgs    = { TODO:"rgba(79,110,247,0.06)", IN_PROGRESS:"rgba(245,158,11,0.06)", DONE:"rgba(16,185,129,0.06)" };
              return (
                <div key={n._id} style={{
                  background: bgs[n.status] || bgs.TODO,
                  border:"1px solid var(--border)", borderRadius:"var(--r-md)",
                  padding:"12px 12px 12px 16px", position:"relative", overflow:"hidden",
                }}>
                  <div style={{ position:"absolute", left:0, top:0, bottom:0, width:3, background: colors[n.status]||colors.TODO, borderRadius:"var(--r-md) 0 0 var(--r-md)" }} />
                  <div style={{ fontSize:13, fontWeight:600, color:"var(--text-primary)", marginBottom:4 }}>{n.title}</div>
                  {n.description && <div style={{ fontSize:11.5, color:"var(--text-secondary)", lineHeight:1.4 }}>{n.description}</div>}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}