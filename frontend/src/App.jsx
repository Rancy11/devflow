import { useState, useContext } from "react";
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from "react-router-dom";
import { AuthContext } from "./context/AuthContext";
import Login     from "./pages/Login";
import Register  from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Projects  from "./pages/Projects";
import Project   from "./pages/Project";
import Tasks     from "./pages/Tasks";
import Analytics from "./pages/Analytics";
import Personal  from "./pages/Personal";
import ProtectedRoute from "./components/ProtectedRoute";
import Sidebar   from "./components/Sidebar";
import "./components/styles.css";

const PAGE_TITLES = {
  dashboard: "Dashboard",
  projects:  "Projects",
  tasks:     "Tasks",
  analytics: "Analytics",
  personal:  "Personal Notes",
};

function AppShell() {
  const navigate  = useNavigate();
  const location  = useLocation();
  const { user }  = useContext(AuthContext);

  // Derive current page from path
  const path = location.pathname.replace("/","");
  const page = path.startsWith("project/") ? "projects" : (path || "dashboard");

  const handleNavigate = (id) => {
    navigate("/" + id);
  };

  if (!user) return null;

  return (
    <div className="df-shell">
      <Sidebar page={page} onNavigate={handleNavigate} />
      <main className="df-main" id="df-main">
        <header className="df-topbar">
          <div className="df-topbar__left">
            <span className="df-breadcrumb">{PAGE_TITLES[page] || "Project"}</span>
          </div>
          <div className="df-topbar__right">
            <span style={{ fontSize:12, color:"var(--text-muted)", fontFamily:"var(--font-mono)" }}>
              {new Date().toLocaleDateString("en",{weekday:"short", month:"short", day:"numeric"})}
            </span>
          </div>
        </header>
        <div className="df-content">
          <Routes>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/projects"  element={<Projects />}  />
            <Route path="/project/:id" element={<Project />} />
            <Route path="/tasks"     element={<Tasks />}     />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/personal"  element={<Personal />}  />
            <Route path="*" element={<Navigate to="/dashboard" />} />
          </Routes>
        </div>
      </main>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login"    element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/*" element={
          <ProtectedRoute>
            <AppShell />
          </ProtectedRoute>
        } />
      </Routes>
    </BrowserRouter>
  );
}

export default App;