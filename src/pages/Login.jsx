import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import SiteHeader from "../components/SiteHeader";
import useAuth from "../context/useAuth";

function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      await login(email, password);
      navigate(location.state?.from || "/tracker", { replace: true });
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <SiteHeader />
      <main className="container py-5">
        <div className="authCard card bg-dark text-light border-secondary mx-auto">
          <div className="card-body p-4">
            <h1 className="h3 mb-4">Login</h1>

            <form onSubmit={handleSubmit}>
              <label className="form-label w-100">
                Email
                <input
                  className="form-control mt-1"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                />
              </label>

              <label className="form-label w-100 mt-3">
                Password
                <input
                  className="form-control mt-1"
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                />
              </label>

              {error && <p className="text-danger small mt-3 mb-0">{error}</p>}

              <button
                className="btn btn-warning w-100 mt-4"
                type="submit"
                disabled={submitting}
              >
                {submitting ? "Logging in..." : "Login"}
              </button>
            </form>

            <p className="small text-secondary mt-3 mb-0">
              No account yet? <Link to="/register">Register</Link>
            </p>
          </div>
        </div>
      </main>
    </>
  );
}

export default Login;
