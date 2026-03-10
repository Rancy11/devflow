import { useState, useContext, useEffect } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import api from "../api/api";

function IcoDash() {
  return <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><rect x="1" y="1" width="6" height="6" rx="1.5" fill="currentColor" opacity=".9"/><rect x="9" y="1" width="6" height="6" rx="1.5" fill="currentColor" opacity=".5"/><rect x="1" y="9" width="6" height="6" rx="1.5" fill="currentColor" opacity=".5"/><rect x="9" y="9" width="6" height="6" rx="1.5" fill="currentColor" opacity=".9"/></svg>;
}
function IcoFolder() {
  return <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M1 3.5A1.5 1.5 0 012.5 2H6l1.5 1.5H14A1.5 1.5 0 0115.5 5v7A1.5 1.5 0 0114 13.5H2.5A1.5 1.5 0 011 12V3.5z" stroke="currentColor" strokeWidth="1.3" fill="none"/></svg>;
}
function IcoCheck() {
  return <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><rect x="1" y="1" width="14" height="14" rx="3" stroke="currentColor" strokeWidth="1.3" fill="none"/><path d="M5 8l2.5 2.5L11 5.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>;
}
function IcoChart() {
  return <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M1.5 12.5l3.5-4.5 3 3 3.5-5.5 3 3.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/><path d="M1 15h14" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>;
}
function IcoNote() {
  return <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><rect x="1.5" y="1.5" width="13" height="13" rx="2" stroke="currentColor" strokeWidth="1.3" fill="none"/><path d="M4.5 5.5h7M4.5 8h7M4.5 10.5h4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>;
}
function IcoInvite() {
  return <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><rect x="1" y="3" width="14" height="10" rx="2" stroke="currentColor" strokeWidth="1.3" fill="none"/><path d="M1 6l7 4.5L15 6" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>;
}
function IcoLogout() {
  return <svg width="15" height="15" viewBox="0 0 15 15" fill="none"><path d="M5.5 13H3a1 1 0 01-1-1V3a1 1 0 011-1h2.5M9.5 10.5L13 7.5 9.5 4.5M13 7.5H5.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>;
}

export default function Sidebar({ page, onNavigate }) {
  const [collapsed, setCollapsed]   = useState(false);
  const [inviteCount, setInviteCount] = useState(0);
  const { user, logout }            = useContext(AuthContext);
  const navigate                    = useNavigate();

  useEffect(() => {
    const fetchCount = async () => {
      try {
        const res = await api.get("/projects/invites/me");
        setInviteCount(res.data.length);
      } catch {}
    };
    fetchCount();
    const interval = setInterval(fetchCount, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const main = document.getElementById("df-main");
    if (main) main.style.marginLeft = collapsed ? "64px" : "var(--sidebar-w)";
  }, [collapsed]);

  const handleLogout = () => { logout(); navigate("/login"); };
  const initials = user?.name
    ? user.name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase()
    : "U";

  const NAV = [
    { id: "dashboard",   label: "Dashboard",   Icon: IcoDash },
    { id: "projects",    label: "Projects",    Icon: IcoFolder },
    { id: "tasks",       label: "Tasks",       Icon: IcoCheck },
    { id: "analytics",   label: "Analytics",   Icon: IcoChart },
    { id: "personal",    label: "Personal",    Icon: IcoNote },
    { id: "invitations", label: "Invitations", Icon: IcoInvite, badge: inviteCount },
  ];

  return (
    <aside className={`df-sidebar${collapsed ? " df-sidebar--collapsed" : ""}`}>
      <div className="df-sidebar__logo">
        <div className="df-logo-mark">DF</div>
        <span className="df-logo-text">Dev<span>Flow</span></span>
      </div>

      <button className="df-collapse-btn" onClick={() => setCollapsed(c => !c)}>
        <span className="df-collapse-icon" style={{ transform: collapsed ? "rotate(180deg)" : "none", display: "flex" }}>
          <svg width="9" height="9" viewBox="0 0 9 9" fill="none">
            <path d="M5.5 1.5L3 4.5l2.5 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </span>
      </button>

      <nav className="df-nav">
        {NAV.map(({ id, label, Icon, badge }) => (
          <button
            key={id}
            className={`df-nav-item${page === id ? " df-nav-item--active" : ""}`}
            onClick={() => onNavigate(id)}
            style={{ position: "relative" }}
          >
            <span style={{ position: "relative", display: "flex" }}>
              <Icon />
              {badge > 0 && (
                <span style={{
                  position: "absolute", top: -5, right: -7,
                  minWidth: 14, height: 14, borderRadius: "var(--r-full)",
                  background: "var(--accent)", color: "#fff",
                  fontSize: 9, fontWeight: 700,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  padding: "0 3px", lineHeight: 1,
                }}>
                  {badge}
                </span>
              )}
            </span>
            <span className="df-nav-label">{label}</span>
          </button>
        ))}
      </nav>

      <div className="df-sidebar__bottom">
        <div className="df-user-row">
          <div className="df-avatar">{initials}</div>
          <div>
            <div className="df-user-name">{user?.name || "User"}</div>
            <div className="df-user-role">{user?.role?.toLowerCase() || "free"}</div>
          </div>
        </div>
        <button className="df-logout-btn" onClick={handleLogout}>
          <IcoLogout />
          <span className="df-nav-label">Logout</span>
        </button>
      </div>
    </aside>
  );
}