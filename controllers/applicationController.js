const Application = require("../models/Application");
const Job = require("../models/Job");
const ApiError = require("../utils/ApiError");
const asyncHandler = require("../utils/asyncHandler");

// @route   POST /api/applications/:jobId
// @access  Private (Job Seeker only)
const applyToJob = asyncHandler(async (req, res) => {
  const { jobId } = req.params;

  const job = await Job.findById(jobId);
  if (!job) throw new ApiError(404, "Job not found");
  if (job.status !== "open") throw new ApiError(400, "This job is no longer accepting applications");

  // Duplicate-application guard (in addition to the unique DB index below)
  const existing = await Application.findOne({ job: jobId, applicant: req.user._id });
  if (existing) {
    throw new ApiError(409, "You have already applied to this job");
  }

  const application = await Application.create({
    job: jobId,
    applicant: req.user._id,
    coverLetter: req.body.coverLetter,
    applicantSnapshot: {
      name: req.user.name,
      email: req.user.email,
      skills: req.user.skills || [],
      experience: req.user.experience,
    },
  });

  res.status(201).json({ success: true, message: "Application submitted", data: application });
});

// @route   GET /api/applications/my
// @access  Private (Job Seeker only) - view own applications + status
const getMyApplications = asyncHandler(async (req, res) => {
  const applications = await Application.find({ applicant: req.user._id })
    .populate("job", "title companyName location status")
    .sort({ createdAt: -1 });

  res.status(200).json({ success: true, count: applications.length, data: applications });
});

// @route   GET /api/applications/job/:jobId
// @access  Private (Employer only - must own the job)
const getApplicationsForJob = asyncHandler(async (req, res) => {
  const job = await Job.findById(req.params.jobId);
  if (!job) throw new ApiError(404, "Job not found");

  if (job.employer.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "You can only view applications for your own jobs");
  }

  const applications = await Application.find({ job: req.params.jobId }).sort({
    createdAt: -1,
  });

  res.status(200).json({ success: true, count: applications.length, data: applications });
});

// @route   PATCH /api/applications/:id/status
// @access  Private (Employer only - must own the underlying job)
const updateApplicationStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const allowedStatuses = ["pending", "reviewed", "shortlisted", "rejected", "accepted"];

  if (!allowedStatuses.includes(status)) {
    throw new ApiError(400, `Status must be one of: ${allowedStatuses.join(", ")}`);
  }

  const application = await Application.findById(req.params.id).populate("job");
  if (!application) throw new ApiError(404, "Application not found");

  if (application.job.employer.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "You can only manage applications for your own jobs");
  }

  application.status = status;
  await application.save();

  res.status(200).json({ success: true, message: "Application status updated", data: application });
});

module.exports = {
  applyToJob,
  getMyApplications,
  getApplicationsForJob,
  updateApplicationStatus,
};
