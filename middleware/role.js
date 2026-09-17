const ApiError = require("../utils/ApiError");

// Usage: authorize("employer", "admin") - restricts a route to the given roles.
// Must be used AFTER the `protect` middleware, since it relies on req.user.
const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new ApiError(401, "Not authenticated."));
    }
    if (!allowedRoles.includes(req.user.role)) {
      return next(
        new ApiError(403, `Role '${req.user.role}' is not authorized to access this resource.`)
      );
    }
    next();
  };
};

module.exports = authorize;
