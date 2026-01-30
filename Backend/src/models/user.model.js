import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    // Profile fields
    name: {
      type: String,
      trim: true,
    },

    goal: {
      type: String,
      enum: ["fat_loss", "muscle_gain", "endurance"],
    },

    fitnessLevel: {
      type: String,
      enum: ["beginner", "intermediate", "advanced"],
    },

    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },

    // Auth / identity fields
    email: {
      type: String,
      required: true,
      unique: true,
      index: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      required: true,
      select: false, // never returned by default
    },
  },
  {
    timestamps: true,
  }
);

/**
 * Hash password before saving
 */
userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;

  this.password = await bcrypt.hash(this.password, 12);
});

/**
 * Compare password for login
 */
userSchema.methods.isPasswordMatch = async function (password) {
  return bcrypt.compare(password, this.password);
};

const User = mongoose.model("User", userSchema);

export default User;
