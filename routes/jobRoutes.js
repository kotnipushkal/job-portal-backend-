const express = require("express");
const router = express.Router();

const {
  createJob,
  getAllJobs,
  getMyJobs,
  getJobById,
  updateJob,
  deleteJob,
} = require("../controllers/jobController");
const protect = require("../middleware/auth");
const authorize = require("../middleware/role");
const { validate, jobValidationRules } = require("../middleware/validate");

// Employer-only: list of jobs posted by the logged-in employer.
// Placed BEFORE "/:id" so "my-jobs" isn't swallowed by the :id param.
router.get("/employer/my-jobs", protect, authorize("employer"), getMyJobs);

router.get("/", protect, getAllJobs);
router.get("/:id", protect, getJobById);

router.post("/", protect, authorize("employer"), jobValidationRules, validate, createJob);
router.put("/:id", protect, authorize("employer"), updateJob);
router.delete("/:id", protect, authorize("employer"), deleteJob);

module.exports = router;
