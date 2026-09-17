const Job = require("../models/Job");
const ApiError = require("../utils/ApiError");
const asyncHandler = require("../utils/asyncHandler");

// @route   POST /api/jobs
// @access  Private (Employer only)
const createJob = asyncHandler(async (req, res) => {
  const job = await Job.create({
    ...req.body,
    employer: req.user._id, // employer is always the logged-in user, never client-supplied
  });

  res.status(201).json({ success: true, message: "Job created", data: job });
});

// @route   GET /api/jobs
// @access  Private (any authenticated user - Job Seekers browse open jobs;
//          Employers/Admins can see everything for context)
const getAllJobs = asyncHandler(async (req, res) => {
  const filter = {};

  // Job seekers only ever see currently open postings
  if (req.user.role === "jobseeker") {
    filter.status = "open";
  }

  // Optional simple query filters
  if (req.query.location) filter.location = new RegExp(req.query.location, "i");
  if (req.query.employmentType) filter.employmentType = req.query.employmentType;

  const jobs = await Job.find(filter)
    .populate("employer", "name companyName email")
    .sort({ createdAt: -1 });

  res.status(200).json({ success: true, count: jobs.length, data: jobs });
});

// @route   GET /api/jobs/employer/my-jobs
// @access  Private (Employer only)
const getMyJobs = asyncHandler(async (req, res) => {
  const jobs = await Job.find({ employer: req.user._id }).sort({ createdAt: -1 });
  res.status(200).json({ success: true, count: jobs.length, data: jobs });
});

// @route   GET /api/jobs/:id
// @access  Private (any authenticated user)
const getJobById = asyncHandler(async (req, res) => {
  const job = await Job.findById(req.params.id).populate(
    "employer",
    "name companyName email"
  );
  if (!job) throw new ApiError(404, "Job not found");
  res.status(200).json({ success: true, data: job });
});

// @route   PUT /api/jobs/:id
// @access  Private (Employer - must own the job)
const updateJob = asyncHandler(async (req, res) => {
  const job = await Job.findById(req.params.id);
  if (!job) throw new ApiError(404, "Job not found");

  if (job.employer.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "You can only update your own job postings");
  }

  // Prevent the employer reference from being overwritten via the body
  delete req.body.employer;

  Object.assign(job, req.body);
  await job.save();

  res.status(200).json({ success: true, message: "Job updated", data: job });
});

// @route   DELETE /api/jobs/:id
// @access  Private (Employer - must own the job)
const deleteJob = asyncHandler(async (req, res) => {
  const job = await Job.findById(req.params.id);
  if (!job) throw new ApiError(404, "Job not found");

  if (job.employer.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "You can only delete your own job postings");
  }

  await job.deleteOne();

  res.status(200).json({ success: true, message: "Job deleted" });
});

module.exports = { createJob, getAllJobs, getMyJobs, getJobById, updateJob, deleteJob };
