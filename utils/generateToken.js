const jwt = require("jsonwebtoken");

/**
 * Signs a JWT for a given user id/role and sets it as an httpOnly cookie
 * on the response. Keeping this in one place ensures login and register
 * both issue tokens the exact same way.
 */
const generateTokenAndSetCookie = (res, userId, role) => {
  const token = jwt.sign({ id: userId, role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });

  const cookieExpiresDays = Number(process.env.COOKIE_EXPIRES_DAYS) || 7;

  res.cookie("token", token, {
    httpOnly: true, // not accessible via client-side JS -> mitigates XSS token theft
    secure: process.env.NODE_ENV === "production", // HTTPS only in production
    sameSite: "strict",
    expires: new Date(Date.now() + cookieExpiresDays * 24 * 60 * 60 * 1000),
  });

  return token;
};

module.exports = generateTokenAndSetCookie;
