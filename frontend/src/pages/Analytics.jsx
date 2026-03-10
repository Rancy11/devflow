import { useState, useEffect } from "react";
import api from "../api/api";
import { Spinner } from "../components/UI";
import "../components/styles.css";

export default function Analytics() {
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks]       = useState([]);
  const [loading, setLoading]   = useState(true);

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
        setTasks(allTasks);
      } catch {}
      finally { setLoading(false); }
    };
    load();
  }, []);

  const todo       = tasks.filter(t => t.status === "TODO").length;
  const inProgress = tasks.filter(t => t.status === "IN_PROGRESS").length;
  const done       = tasks.filter(t => t.status === "DONE").length;
  const total      = tasks.length;
  const completionRate = total ? Math.round((done / total) * 100) : 0;
  const inProgressRate = total ? Math.round((inProgress / total) * 100) : 0;

  // Tasks per project
  const tasksByProject = projects.map(p => ({
    name: p.name,
    total: tasks.filter(t => t.project === p._id).length,
    done:  tasks.filter(t => t.project === p._id && t.status === "DONE").length,
  })).sort((a, b) => b.total - a.total);

  const maxTasks = Math.max(...tasksByProject.map(p => p.total), 1);

  // Status donut
  const donutData = [
    { label: "Done",        count: done,       color: "var(--emerald)" },
    { label: "In Progress", count: inProgress,  color: "var(--amber)" },
    { label: "Todo",        count: todo,        color: "var(--accent)" },
  ];

  // Simple SVG donut
  const DonutChart = () => {
    const r = 44, cx = 56, cy = 56, circumference = 2 * Math.PI * r;
    let offset = 0;
    const segments = donutData.filter(d => d.count > 0).map(d => {
      const pct = total > 0 ? d.count / total : 0;
      const dash = pct * circumference;
      const gap  = circumference - dash;
      const seg  = { ...d, dash, gap, offset };
      offset += dash;
      return seg;
    });
    if (total === 0) return (
      <svg width="112" height="112" viewBox="0 0 112 112">
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="var(--bg-elevated)" strokeWidth="14"/>
        <text x={cx} y={cy+5} textAnchor="middle" fill="var(--text-muted)" fontSize="12" fontFamily="var(--font-mono)">0</text>
      </svg>
    );
    return (
      <svg width="112" height="112" viewBox="0 0 112 112">
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="var(--bg-elevated)" strokeWidth="14"/>
        {segments.map((s, i) => (
          <circle key={i} cx={cx} cy={cy} r={r} fill="none" stroke={s.color} strokeWidth="14"
            strokeDasharray={`${s.dash} ${s.gap}`}
            strokeDashoffset={-s.offset + circumference * 0.25}
            style={{ transform: "rotate(-90deg)", transformOrigin: `${cx}px ${cy}px`, transition: "stroke-dasharray 0.5s ease" }} />
        ))}
        <text x={cx} y={cy-5} textAnchor="middle" fill="var(--text-primary)" fontSize="16" fontWeight="700" fontFamily="var(--font-display)">{total}</text>
        <text x={cx} y={cy+12} textAnchor="middle" fill="var(--text-muted)" fontSize="9" fontFamily="var(--font-mono)">TASKS</text>
      </svg>
    );
  };

  // Simple line chart (sparkline) - tasks completed by day
  const SparkLine = () => {
    const days = 7;
    const now = new Date();
    const points = Array.from({ length: days }, (_, i) => {
      const d = new Date(now);
      d.setDate(now.getDate() - (days - 1 - i));
      const dayStr = d.toDateString();
      return tasks.filter(t => t.status === "DONE" && new Date(t.updatedAt).toDateString() === dayStr).length;
    });
    const max = Math.max(...points, 1);
    const w = 280, h = 80, pad = 10;
    const stepX = (w - pad*2) / (days - 1);
    const pts = points.map((v, i) => {
      const x = pad + i * stepX;
      const y = h - pad - ((v / max) * (h - pad*2));
      return [x, y];
    });
    const polyline = pts.map(([x,y]) => `${x},${y}`).join(" ");
    const area = `M${pts[0][0]},${h} ` + pts.map(([x,y]) => `L${x},${y}`).join(" ") + ` L${pts[pts.length-1][0]},${h} Z`;
    const dayLabels = Array.from({ length: days }, (_, i) => {
      const d = new Date(now); d.setDate(now.getDate() - (days-1-i));
      return d.toLocaleDateString("en",{weekday:"short"});
    });
    return (
      <div>
        <svg width="100%" viewBox={`0 0 ${w} ${h}`} style={{ overflow:"visible" }}>
          <defs>
            <linearGradient id="sparkGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.35"/>
              <stop offset="100%" stopColor="var(--accent)" stopOpacity="0"/>
            </linearGradient>
          </defs>
          <path d={area} fill="url(#sparkGrad)" />
          <polyline points={polyline} fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round"/>
          {pts.map(([x,y], i) => (
            <circle key={i} cx={x} cy={y} r="3" fill="var(--accent)" />
          ))}
        </svg>
        <div style={{ display:"flex", justifyContent:"space-between", marginTop:4 }}>
          {dayLabels.map((l,i) => <span key={i} style={{ fontSize:10, color:"var(--text-muted)", fontFamily:"var(--font-mono)" }}>{l}</span>)}
        </div>
      </div>
    );
  };

  if (loading) return <div className="df-loading"><Spinner size="lg" /></div>;

  return (
    <div className="df-page-anim">
      <div className="df-page-head">
        <h1 className="df-page-title">Analytics</h1>
        <p className="df-page-sub">Your productivity at a glance</p>
      </div>

      <div className="df-analytics-grid">
        {/* Donut - tasks by status */}
        <div className="df-card">
          <div className="df-card__head"><span className="df-card__title">Tasks by Status</span></div>
          <div className="df-chart-wrap">
            <div className="df-donut-wrap">
              <DonutChart />
              <div className="df-legend">
                {donutData.map(d => (
                  <div key={d.label} className="df-legend-item">
                    <span className="df-legend-dot" style={{ background: d.color }} />
                    <span>{d.label}</span>
                    <span style={{ color:"var(--text-muted)", fontFamily:"var(--font-mono)", fontSize:11, marginLeft:4 }}>{d.count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Productivity stats */}
        <div className="df-card">
          <div className="df-card__head"><span className="df-card__title">Productivity Score</span></div>
          <div className="df-chart-wrap">
            <div className="df-productivity-stats">
              <div className="df-prod-stat">
                <div className="df-prod-stat__val" style={{ color:"var(--emerald)" }}>{completionRate}%</div>
                <div className="df-prod-stat__label">Completion Rate</div>
              </div>
              <div className="df-prod-stat">
                <div className="df-prod-stat__val" style={{ color:"var(--amber)" }}>{inProgressRate}%</div>
                <div className="df-prod-stat__label">In Progress Rate</div>
              </div>
              <div className="df-prod-stat">
                <div className="df-prod-stat__val">{total}</div>
                <div className="df-prod-stat__label">Total Tasks</div>
              </div>
              <div className="df-prod-stat">
                <div className="df-prod-stat__val">{projects.length}</div>
                <div className="df-prod-stat__label">Active Projects</div>
              </div>
            </div>
          </div>
        </div>

        {/* Tasks per project bar chart */}
        <div className="df-card">
          <div className="df-card__head"><span className="df-card__title">Tasks Per Project</span></div>
          <div className="df-chart-wrap">
            {tasksByProject.length === 0
              ? <p style={{ color:"var(--text-muted)", fontSize:13 }}>No projects yet</p>
              : (
                <div className="df-bar-chart">
                  {tasksByProject.map(p => (
                    <div key={p.name} className="df-bar-row">
                      <span className="df-bar-label">{p.name}</span>
                      <div className="df-bar-track">
                        <div className="df-bar-fill" style={{ width: `${(p.total/maxTasks)*100}%`, background:"var(--accent)" }} />
                      </div>
                      <span className="df-bar-count">{p.total}</span>
                    </div>
                  ))}
                </div>
              )
            }
          </div>
        </div>

        {/* Completion trend sparkline */}
        <div className="df-card">
          <div className="df-card__head"><span className="df-card__title">Tasks Completed (Last 7 Days)</span></div>
          <div className="df-chart-wrap">
            <SparkLine />
          </div>
        </div>
      </div>
    </div>
  );
}
