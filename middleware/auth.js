const jwt = require("jsonwebtoken");
const User = require("../models/User");
const ApiError = require("../utils/ApiError");

// Verifies the JWT stored in the httpOnly "token" cookie and attaches the
// authenticated user (without password) to req.user.
const protect = async (req, res, next) => {
  try {
    const token = req.cookies?.token;

    if (!token) {
      throw new ApiError(401, "Not authenticated. Please log in.");
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      throw new ApiError(401, "Invalid or expired token. Please log in again.");
    }

    const user = await User.findById(decoded.id);
    if (!user) {
      throw new ApiError(401, "User belonging to this token no longer exists.");
    }

    if (user.status === "suspended") {
      throw new ApiError(403, "Your account has been suspended.");
    }

    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
};

module.exports = protect;
