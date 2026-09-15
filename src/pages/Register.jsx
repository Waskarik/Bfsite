import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import SiteHeader from "../components/SiteHeader";
import useAuth from "../context/useAuth";

function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      await register(username, email, password);
      navigate("/tracker", { replace: true });
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
            <h1 className="h3 mb-4">Register</h1>

            <form onSubmit={handleSubmit}>
              <label className="form-label w-100">
                Username
                <input
                  className="form-control mt-1"
                  value={username}
                  onChange={(event) => setUsername(event.target.value)}
                  minLength="2"
                  maxLength="30"
                  required
                />
              </label>

              <label className="form-label w-100 mt-3">
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
                  minLength="6"
                  required
                />
              </label>

              {error && <p className="text-danger small mt-3 mb-0">{error}</p>}

              <button
                className="btn btn-warning w-100 mt-4"
                type="submit"
                disabled={submitting}
              >
                {submitting ? "Creating account..." : "Create account"}
              </button>
            </form>

            <p className="small text-secondary mt-3 mb-0">
              Already registered? <Link to="/login">Login</Link>
            </p>
          </div>
        </div>
      </main>
    </>
  );
}

export default Register;
