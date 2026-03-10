import { useState, useEffect } from "react";
import api from "../api/api";
import { Btn, Modal, Field, Input, Textarea, StatusBadge, Spinner } from "../components/UI";
import "../components/styles.css";

function AddNoteModal({ open, onClose, onAdded }) {
  const [title, setTitle]     = useState("");
  const [desc, setDesc]       = useState("");
  const [err, setErr]         = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (!title.trim()) { setErr("Title is required"); return; }
    setLoading(true);
    try {
      const res = await api.post("/tasks/personal", { title, description: desc });
      onAdded(res.data);
      setTitle(""); setDesc(""); setErr(""); onClose();
    } catch (e) {
      setErr(e.response?.data?.message || "Failed to add note");
    } finally { setLoading(false); }
  };

  // reset on close
  const handleClose = () => { setTitle(""); setDesc(""); setErr(""); onClose(); };

  return (
    <Modal open={open} onClose={handleClose} title="New Personal Note">
      <Field label="Title" error={err}>
        <Input
          placeholder="e.g. Read Clean Code book"
          value={title}
          onChange={e => { setTitle(e.target.value); setErr(""); }}
        />
      </Field>
      <Field label="Note">
        <Textarea
          placeholder="Write anything... ideas, reminders, todos"
          value={desc}
          onChange={e => setDesc(e.target.value)}
          style={{ minHeight: 120 }}
        />
      </Field>
      <div className="df-form-actions">
        <Btn variant="secondary" onClick={handleClose}>Cancel</Btn>
        <Btn loading={loading} onClick={submit}>Add Note</Btn>
      </div>
    </Modal>
  );
}

const STATUS_BAR  = { TODO:"var(--accent)",  IN_PROGRESS:"var(--amber)",   DONE:"var(--emerald)" };
const STATUS_BG   = { TODO:"rgba(79,110,247,0.06)", IN_PROGRESS:"rgba(245,158,11,0.06)", DONE:"rgba(16,185,129,0.06)" };

export default function Personal() {
  const [notes, setNotes]         = useState([]);
  const [loading, setLoading]     = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    api.get("/tasks/personal")
      .then(res => setNotes(res.data))
      .catch(() => {}) // silently fail — show empty state
      .finally(() => setLoading(false));
  }, []);

  const updateStatus = async (note, status) => {
    try {
      const res = await api.patch(`/tasks/${note._id}`, { status });
      setNotes(prev => prev.map(n => n._id === note._id ? { ...n, status: res.data.status } : n));
    } catch {}
  };

  const deleteNote = async (id) => {
    try {
      await api.delete(`/tasks/${id}`);
      setNotes(prev => prev.filter(n => n._id !== id));
    } catch {}
  };

  return (
    <div className="df-page-anim">

      {/* ── Header ── */}
      <div className="df-page-head df-page-head-row">
        <div>
          <h1 className="df-page-title">Personal Notes</h1>
          <p className="df-page-sub">Private tasks & notes — only visible to you</p>
        </div>
        <Btn onClick={() => setModalOpen(true)}>
          + Add Note
        </Btn>
      </div>

      {/* ── Private banner ── */}
      <div style={{
        background:"rgba(139,92,246,0.07)", border:"1px solid rgba(139,92,246,0.2)",
        borderRadius:"var(--r-md)", padding:"10px 14px", marginBottom:22,
        display:"flex", alignItems:"center", gap:10, fontSize:13, color:"var(--violet)"
      }}>
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <circle cx="7" cy="7" r="6" stroke="currentColor" strokeWidth="1.3"/>
          <path d="M7 6v4M7 4v.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
        </svg>
        These notes are private and not shared with any project or team members.
      </div>

      {/* ── Mini stats ── */}
      <div style={{ display:"flex", gap:12, marginBottom:24 }}>
        {[
          { label:"Todo",        val: notes.filter(n=>n.status==="TODO").length,        color:"var(--accent)"  },
          { label:"In Progress", val: notes.filter(n=>n.status==="IN_PROGRESS").length, color:"var(--amber)"   },
          { label:"Done",        val: notes.filter(n=>n.status==="DONE").length,        color:"var(--emerald)" },
        ].map(s => (
          <div key={s.label} style={{
            background:"var(--bg-card)", border:"1px solid var(--border)",
            borderRadius:"var(--r-md)", padding:"10px 16px",
            display:"flex", alignItems:"center", gap:10,
          }}>
            <span style={{ fontFamily:"var(--font-display)", fontSize:20, fontWeight:800, color:s.color, letterSpacing:"-0.5px" }}>{s.val}</span>
            <span style={{ fontSize:11, color:"var(--text-muted)", textTransform:"uppercase", letterSpacing:"0.05em", fontWeight:600 }}>{s.label}</span>
          </div>
        ))}
      </div>

      {/* ── Loading ── */}
      {loading && <div className="df-loading"><Spinner size="lg" /></div>}

      {/* ── Empty state ── */}
      {!loading && notes.length === 0 && (
        <div className="df-empty">
          <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
            <rect x="6" y="4" width="36" height="40" rx="4" stroke="white" strokeWidth="2" fill="none"/>
            <path d="M14 16h20M14 24h20M14 32h12" stroke="white" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          <p>No personal notes yet.</p>
          <Btn onClick={() => setModalOpen(true)}>+ Add your first note</Btn>
        </div>
      )}

      {/* ── Notes grid ── */}
      {!loading && notes.length > 0 && (
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(240px,1fr))", gap:14 }}>
          {notes.map(n => (
            <div key={n._id} style={{
              background: STATUS_BG[n.status] || STATUS_BG.TODO,
              border:"1px solid var(--border)", borderRadius:"var(--r-lg)",
              padding:"18px 18px 18px 20px", display:"flex", flexDirection:"column", gap:12,
              position:"relative", overflow:"hidden", transition:"all 0.24s ease",
            }}
            onMouseEnter={e=>{ e.currentTarget.style.transform="translateY(-2px)"; e.currentTarget.style.boxShadow="var(--shadow-md)"; }}
            onMouseLeave={e=>{ e.currentTarget.style.transform=""; e.currentTarget.style.boxShadow=""; }}
            >
              {/* Colored left bar */}
              <div style={{ position:"absolute", left:0, top:0, bottom:0, width:4, background: STATUS_BAR[n.status]||STATUS_BAR.TODO }} />

              <div>
                <div style={{ fontSize:14, fontWeight:600, color:"var(--text-primary)", lineHeight:1.4, marginBottom:6 }}>
                  {n.title}
                </div>
                {n.description
                  ? <div style={{ fontSize:12.5, color:"var(--text-secondary)", lineHeight:1.6 }}>{n.description}</div>
                  : <div style={{ fontSize:12, color:"var(--text-muted)", fontStyle:"italic" }}>No description</div>
                }
              </div>

              <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                <StatusBadge status={n.status} />
                <div style={{ display:"flex", gap:5 }}>
                  {n.status === "TODO" && (
                    <Btn size="sm" variant="ghost" onClick={() => updateStatus(n, "IN_PROGRESS")}>Start</Btn>
                  )}
                  {n.status !== "DONE" && (
                    <Btn size="sm" variant="ghost" onClick={() => updateStatus(n, "DONE")}>✓ Done</Btn>
                  )}
                  <Btn size="sm" variant="danger" onClick={() => deleteNote(n._id)}>✕</Btn>
                </div>
              </div>
            </div>
          ))}

          {/* Dashed add card */}
          <button onClick={() => setModalOpen(true)} style={{
            background:"transparent", border:"2px dashed var(--border-light)",
            borderRadius:"var(--r-lg)", padding:"18px",
            display:"flex", alignItems:"center", justifyContent:"center", gap:8,
            color:"var(--text-muted)", fontSize:13, fontWeight:500,
            cursor:"pointer", fontFamily:"var(--font-body)",
            transition:"all 0.14s ease", minHeight:100,
          }}
          onMouseEnter={e=>{ e.currentTarget.style.borderColor="var(--accent)"; e.currentTarget.style.color="var(--accent)"; e.currentTarget.style.background="var(--accent-dim)"; }}
          onMouseLeave={e=>{ e.currentTarget.style.borderColor=""; e.currentTarget.style.color=""; e.currentTarget.style.background=""; }}
          >
            + Add note
          </button>
        </div>
      )}

      <AddNoteModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onAdded={n => setNotes(prev => [n, ...prev])}
      />
    </div>
  );
}