import mongoose from 'mongoose';

const exerciseSchema = new mongoose.Schema({
  exerciseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Exercise',
    required: true,
  },

  sets: {
    type: Number,
    required: true,
    min: 1,
  },
  reps: {
    type: Number,
    required: true,
    min: 1,
  },
  weight: {
    type: Number, // Planned weight, optional
    min: 0,
  },
}, {
  _id: false, // Do not create a default _id for subdocuments if not explicitly needed
});

const workoutSchema = new mongoose.Schema({
  day: {
    type: String,
    required: true,
    trim: true,
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  exercises: [exerciseSchema], // Embedded exercises
}, {
  _id: true, // Allow Mongoose to create an _id for workouts to reference later if needed
});

const workoutPlanSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Reference to the User model
    required: true,
    index: true, // Index for faster lookups by user
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  week: {
    type: Number,
    required: true,
    min: 1,
  },
  workouts: [workoutSchema], // Embedded workouts
}, {
  timestamps: true, // Mongoose adds createdAt and updatedAt timestamps
});

// Composite index for efficient querying by user and week
workoutPlanSchema.index({ userId: 1, week: 1 }, { unique: true });

const WorkoutPlan = mongoose.model('WorkoutPlan', workoutPlanSchema);

export default WorkoutPlan;
