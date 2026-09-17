const User = require("../models/User");
const ApiError = require("../utils/ApiError");
const asyncHandler = require("../utils/asyncHandler");
const generateTokenAndSetCookie = require("../utils/generateToken");

// Strips fields that should never be sent back to the client.
const sanitizeUser = (user) => {
  const obj = user.toObject();
  delete obj.password;
  delete obj.__v;
  return obj;
};

// @route   POST /api/auth/register
// @access  Public
const register = asyncHandler(async (req, res) => {
  const { name, email, password, role, skills, experience, education, companyName } = req.body;

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new ApiError(409, "A user with this email already exists");
  }

  const user = await User.create({
    name,
    email,
    password,
    role: role || "jobseeker",
    skills,
    experience,
    education,
    companyName,
  });

  generateTokenAndSetCookie(res, user._id, user.role);

  res.status(201).json({
    success: true,
    message: "Registered successfully",
    data: sanitizeUser(user),
  });
});

// @route   POST /api/auth/login
// @access  Public
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select("+password");
  if (!user) {
    throw new ApiError(401, "Invalid email or password");
  }

  if (user.status === "suspended") {
    throw new ApiError(403, "Your account has been suspended. Contact admin.");
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    throw new ApiError(401, "Invalid email or password");
  }

  generateTokenAndSetCookie(res, user._id, user.role);

  res.status(200).json({
    success: true,
    message: "Logged in successfully",
    data: sanitizeUser(user),
  });
});

// @route   POST /api/auth/logout
// @access  Private
const logout = asyncHandler(async (req, res) => {
  res.cookie("token", "", {
    httpOnly: true,
    expires: new Date(0),
  });
  res.status(200).json({ success: true, message: "Logged out successfully" });
});

// @route   GET /api/auth/me
// @access  Private
const getMe = asyncHandler(async (req, res) => {
  res.status(200).json({ success: true, data: sanitizeUser(req.user) });
});

module.exports = { register, login, logout, getMe, sanitizeUser };
