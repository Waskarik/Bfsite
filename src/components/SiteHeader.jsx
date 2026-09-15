import { Link } from "react-router-dom";
import useAuth from "../context/useAuth";

function SiteHeader() {
  const { user, loading, logout } = useAuth();

  return (
    <header className="border-bottom border-secondary">
      <div className="container py-3 d-flex flex-wrap align-items-center justify-content-between gap-2">
        <Link
          className="siteTitle h3 mb-0 text-decoration-none text-warning"
          to="/"
        >
          BadFish
        </Link>

        <div className="d-flex gap-2 align-items-center flex-wrap">
          <Link
            className="trackerButton btn btn-sm btn-outline-light"
            to="/tracker"
          >
            My Tracker
          </Link>
          <Link
            className="aboutButton btn btn-sm btn-outline-light"
            to="/about"
          >
            About
          </Link>

          {!loading && !user && (
            <>
              <Link className="btn btn-sm btn-outline-warning" to="/login">
                Login
              </Link>
              <Link className="btn btn-sm btn-warning" to="/register">
                Register
              </Link>
            </>
          )}

          {!loading && user && (
            <>
              <span className="small text-secondary">{user.username}</span>
              <button
                className="btn btn-sm btn-outline-danger"
                type="button"
                onClick={logout}
              >
                Logout
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

export default SiteHeader;
