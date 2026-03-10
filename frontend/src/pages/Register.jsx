import { useState, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api/api";
import { AuthContext } from "../context/AuthContext";
import "../components/styles.css";
import { Field, Input, Btn } from "../components/UI";

const Register = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await api.post("/auth/register", { name, email, password });
      login(res.data.user, res.data.token);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="df-auth">
      <div className="df-auth__box">
        <div className="df-auth__logo">
          <div className="df-logo-mark" style={{ width: 36, height: 36, fontSize: 15 }}>DF</div>
          <span className="df-logo-text" style={{ fontSize: 20 }}>Dev<span>Flow</span></span>
        </div>
        <h1 className="df-auth__heading">Create account</h1>
        <p className="df-auth__sub">Start managing your projects today</p>
        {error && <div className="df-auth__error">{error}</div>}
        <form onSubmit={handleSubmit}>
          <Field label="Full Name">
            <Input type="text" placeholder="Your name" value={name} onChange={e => setName(e.target.value)} required />
          </Field>
          <Field label="Email">
            <Input type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} required />
          </Field>
          <Field label="Password">
            <Input type="password" placeholder="Min. 6 characters" value={password} onChange={e => setPassword(e.target.value)} required />
          </Field>
          <Btn type="submit" size="lg" loading={loading} style={{ width: "100%", marginTop: 6 }}>Create Account</Btn>
        </form>
        <div className="df-auth__footer">Already have an account? <Link to="/login">Sign in</Link></div>
      </div>
    </div>
  );
};
export default Register;
