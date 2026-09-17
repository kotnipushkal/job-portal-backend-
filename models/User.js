const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

// Embedded sub-document: education entries belong entirely to the user,
// are always read/updated together with the profile, and have no identity
// of their own outside the User -> this is a good candidate for embedding
// (as opposed to Job/Application, which are referenced because they have
// their own lifecycle and are shared/queried independently).
const educationSchema = new mongoose.Schema(
  {
    degree: { type: String, trim: true },
    institution: { type: String, trim: true },
    fieldOfStudy: { type: String, trim: true },
    yearOfCompletion: { type: Number },
  },
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please provide a valid email"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: 6,
      select: false, // never returned by default on find queries
    },
    role: {
      type: String,
      enum: ["jobseeker", "employer", "admin"],
      default: "jobseeker",
    },
    status: {
      type: String,
      enum: ["active", "suspended"],
      default: "active",
    },

    // --- Job Seeker specific (embedded) profile fields ---
    skills: {
      type: [String],
      default: undefined,
    },
    experience: {
      type: String, // e.g. "2 years" / free-text summary
      trim: true,
    },
    education: {
      type: [educationSchema],
      default: undefined,
    },

    // --- Employer specific field ---
    companyName: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
);

// Hash password before saving, only if it was modified
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Instance method to compare plaintext password with stored hash
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model("User", userSchema);
