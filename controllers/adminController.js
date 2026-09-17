const User = require("../models/User");
const Job = require("../models/Job");
const ApiError = require("../utils/ApiError");
const asyncHandler = require("../utils/asyncHandler");

// @route   GET /api/admin/users
const getAllUsers = asyncHandler(async (req, res) => {
  const users = await User.find().sort({ createdAt: -1 });
  res.status(200).json({ success: true, count: users.length, data: users });
});

// @route   GET /api/admin/users/:id
const getUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) throw new ApiError(404, "User not found");
  res.status(200).json({ success: true, data: user });
});

// @route   PATCH /api/admin/users/:id/status
const updateUserStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  if (!["active", "suspended"].includes(status)) {
    throw new ApiError(400, "Status must be 'active' or 'suspended'");
  }

  const user = await User.findByIdAndUpdate(req.params.id, { status }, { new: true });
  if (!user) throw new ApiError(404, "User not found");

  res.status(200).json({ success: true, message: "User status updated", data: user });
});

// @route   DELETE /api/admin/users/:id
const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) throw new ApiError(404, "User not found");

  await user.deleteOne();
  res.status(200).json({ success: true, message: "User deleted" });
});

// @route   GET /api/admin/jobs
const getAllJobsAdmin = asyncHandler(async (req, res) => {
  const jobs = await Job.find().populate("employer", "name companyName email").sort({
    createdAt: -1,
  });
  res.status(200).json({ success: true, count: jobs.length, data: jobs });
});

// @route   GET /api/admin/jobs/:id
const getJobByIdAdmin = asyncHandler(async (req, res) => {
  const job = await Job.findById(req.params.id).populate("employer", "name companyName email");
  if (!job) throw new ApiError(404, "Job not found");
  res.status(200).json({ success: true, data: job });
});

// @route   DELETE /api/admin/jobs/:id
const deleteJobAdmin = asyncHandler(async (req, res) => {
  const job = await Job.findById(req.params.id);
  if (!job) throw new ApiError(404, "Job not found");

  await job.deleteOne();
  res.status(200).json({ success: true, message: "Job removed by admin" });
});

module.exports = {
  getAllUsers,
  getUserById,
  updateUserStatus,
  deleteUser,
  getAllJobsAdmin,
  getJobByIdAdmin,
  deleteJobAdmin,
};
