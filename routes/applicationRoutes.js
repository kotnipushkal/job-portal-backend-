const express = require("express");
const router = express.Router();

const {
  applyToJob,
  getMyApplications,
  getApplicationsForJob,
  updateApplicationStatus,
} = require("../controllers/applicationController");
const protect = require("../middleware/auth");
const authorize = require("../middleware/role");

// Job Seeker
router.post("/:jobId", protect, authorize("jobseeker"), applyToJob);
router.get("/my", protect, authorize("jobseeker"), getMyApplications);

// Employer
router.get("/job/:jobId", protect, authorize("employer"), getApplicationsForJob);
router.patch("/:id/status", protect, authorize("employer"), updateApplicationStatus);

module.exports = router;
