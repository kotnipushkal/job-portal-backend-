const express = require("express");
const router = express.Router();

const {
  getAllUsers,
  getUserById,
  updateUserStatus,
  deleteUser,
  getAllJobsAdmin,
  getJobByIdAdmin,
  deleteJobAdmin,
} = require("../controllers/adminController");
const protect = require("../middleware/auth");
const authorize = require("../middleware/role");

// Every route here requires authentication AND the admin role.
router.use(protect, authorize("admin"));

router.get("/users", getAllUsers);
router.get("/users/:id", getUserById);
router.patch("/users/:id/status", updateUserStatus);
router.delete("/users/:id", deleteUser);

router.get("/jobs", getAllJobsAdmin);
router.get("/jobs/:id", getJobByIdAdmin);
router.delete("/jobs/:id", deleteJobAdmin);

module.exports = router;
