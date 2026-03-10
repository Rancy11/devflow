import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/api";
import { Btn, Spinner } from "../components/UI";
import "../components/styles.css";

export default function Invitations() {
  const navigate = useNavigate();
  const [invites, setInvites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [acting, setActing]   = useState({});

  useEffect(() => { fetchInvites(); }, []);

  const fetchInvites = async () => {
    setLoading(true);
    try {
      const res = await api.get("/projects/invites/me");
      setInvites(res.data);
    } catch {}
    finally { setLoading(false); }
  };

  const handleAction = async (projectId, action) => {
    setActing(prev => ({ ...prev, [projectId]: action }));
    try {
      await api.post(`/projects/${projectId}/invites/${action}`);
      setInvites(prev => prev.filter(inv => inv.projectId !== projectId));
      if (action === "accept") navigate(`/project/${projectId}`);
    } catch (e) {
      alert(e.response?.data?.message || "Something went wrong");
    } finally {
      setActing(prev => { const n = { ...prev }; delete n[projectId]; return n; });
    }
  };

  const timeAgo = (date) => {
    const diff = Math.floor((Date.now() - new Date(date)) / 1000);
    if (diff < 60) return "just now";
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  };

  if (loading) return <div className="df-loading"><Spinner size="lg" /></div>;

  return (
    <div className="df-page-anim">
      <div className="df-page-head">
        <h1 className="df-page-title">
          Invitations
          {invites.length > 0 && (
            <span style={{
              marginLeft: 10, fontSize: 13, fontWeight: 700,
              padding: "3px 10px", borderRadius: "var(--r-full)",
              background: "rgba(79,110,247,0.12)", color: "var(--accent)",
              verticalAlign: "middle",
            }}>
              {invites.length}
            </span>
          )}
        </h1>
        <p className="df-page-sub">Projects you've been invited to join.</p>
      </div>

      {invites.length === 0 ? (
        <div className="df-card" style={{ padding: "48px 24px", textAlign: "center" }}>
          <div style={{
            width: 52, height: 52, borderRadius: "50%",
            background: "var(--bg-elevated)",
            display: "flex", alignItems: "center", justifyContent: "center",
            margin: "0 auto 16px",
          }}>
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
              <path d="M11 2C6.03 2 2 6.03 2 11s4.03 9 9 9 9-4.03 9-9-4.03-9-9-9z" stroke="var(--text-muted)" strokeWidth="1.4" fill="none"/>
              <path d="M11 7v5M11 15h.01" stroke="var(--text-muted)" strokeWidth="1.4" strokeLinecap="round"/>
            </svg>
          </div>
          <p style={{ color: "var(--text-muted)", fontSize: 14, margin: 0 }}>No pending invitations</p>
          <p style={{ color: "var(--text-muted)", fontSize: 12, marginTop: 6 }}>
            When someone invites you to a project, it will appear here.
          </p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {invites.map((inv) => (
            <div key={inv.projectId} className="df-card" style={{ padding: "20px 24px" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                  <div style={{
                    width: 44, height: 44, borderRadius: "var(--r-md)",
                    background: "rgba(79,110,247,0.12)",
                    display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                  }}>
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                      <path d="M2 5A2 2 0 014 3h4l1.5 2H17a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V5z" stroke="var(--accent)" strokeWidth="1.4" fill="none"/>
                    </svg>
                  </div>
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: "var(--text-primary)", marginBottom: 3 }}>
                      {inv.projectName}
                    </div>
                    <div style={{ fontSize: 12, color: "var(--text-muted)", display: "flex", alignItems: "center", gap: 6 }}>
                      <div style={{
                        width: 18, height: 18, borderRadius: "50%",
                        background: "var(--bg-elevated)",
                        display: "inline-flex", alignItems: "center", justifyContent: "center",
                        fontSize: 9, fontWeight: 700, color: "var(--text-secondary)",
                      }}>
                        {inv.invitedBy?.name?.charAt(0).toUpperCase() || "?"}
                      </div>
                      Invited by <strong style={{ color: "var(--text-secondary)" }}>{inv.invitedBy?.name}</strong>
                      &nbsp;·&nbsp; {timeAgo(inv.invitedAt)}
                    </div>
                  </div>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <Btn
                    variant="secondary"
                    size="sm"
                    loading={acting[inv.projectId] === "decline"}
                    onClick={() => handleAction(inv.projectId, "decline")}
                    style={{ color: "var(--rose)", borderColor: "rgba(244,63,94,0.2)" }}
                  >
                    <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
                      <path d="M1.5 1.5l8 8M9.5 1.5l-8 8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
                    </svg>
                    Decline
                  </Btn>
                  <Btn
                    size="sm"
                    loading={acting[inv.projectId] === "accept"}
                    onClick={() => handleAction(inv.projectId, "accept")}
                  >
                    <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
                      <path d="M1.5 5.5l3 3 5-5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    Accept
                  </Btn>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}