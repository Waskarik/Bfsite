import jwt from "jsonwebtoken";

export function isAuthenticated(req, res, next) {
  const authorization = req.headers.authorization;

  if (!authorization?.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Authentication required" });
  }

  const token = authorization.slice(7);

  try {
    req.auth = jwt.verify(token, process.env.SECRET_TOKEN);
    next();
  } catch {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
}
