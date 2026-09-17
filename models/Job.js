const mongoose = require("mongoose");

const jobSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Job title is required"],
      trim: true,
    },
    companyName: {
      type: String,
      required: [true, "Company name is required"],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Job description is required"],
    },
    location: {
      type: String,
      required: [true, "Location is required"],
      trim: true,
    },
    employmentType: {
      type: String,
      enum: ["full-time", "part-time", "contract", "internship", "remote"],
      required: true,
    },
    salaryRange: {
      min: { type: Number },
      max: { type: Number },
    },
    requiredSkills: {
      type: [String],
      default: [],
    },
    experienceRequired: {
      type: String, // e.g. "0-1 years", "3+ years"
      trim: true,
    },
    postedDate: {
      type: Date,
      default: Date.now,
    },
    applicationDeadline: {
      type: Date,
    },
    status: {
      type: String,
      enum: ["open", "closed"],
      default: "open",
    },

    // Reference: a Job has its own lifecycle (can be updated/closed
    // independently) and is owned by one Employer -> referenced, not embedded.
    employer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

jobSchema.index({ employer: 1 });

module.exports = mongoose.model("Job", jobSchema);
