const User = require("../models/User");
const ApiError = require("../utils/ApiError");
const asyncHandler = require("../utils/asyncHandler");
const { sanitizeUser } = require("./authController");

// @route   GET /api/users/me
// @access  Private (any authenticated user)
const getProfile = asyncHandler(async (req, res) => {
  res.status(200).json({ success: true, data: sanitizeUser(req.user) });
});

// @route   PUT /api/users/me
// @access  Private (any authenticated user)
// A user may only ever update their own profile - req.user._id is used,
// never an id from the request body/params, so no one can edit someone else.
const updateProfile = asyncHandler(async (req, res) => {
  const allowedFields = ["name", "skills", "experience", "education", "companyName"];
  const updates = {};

  for (const field of allowedFields) {
    if (req.body[field] !== undefined) updates[field] = req.body[field];
  }

  // Explicitly block privilege escalation / account takeover attempts
  if (req.body.role || req.body.password || req.body.email || req.body.status) {
    throw new ApiError(
      400,
      "Role, email, password, and status cannot be changed through this endpoint"
    );
  }

  const user = await User.findByIdAndUpdate(req.user._id, updates, {
    new: true,
    runValidators: true,
  });

  if (!user) throw new ApiError(404, "User not found");

  res.status(200).json({ success: true, message: "Profile updated", data: sanitizeUser(user) });
});

module.exports = { getProfile, updateProfile };
