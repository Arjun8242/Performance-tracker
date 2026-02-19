import mongoose from 'mongoose';

const setSchema = new mongoose.Schema({
  reps: {
    type: Number,
    required: true,
    min: 1,
  },
  weight: {
    type: Number,
    required: true,
    min: 0,
  },
}, { _id: false });

const performedExerciseSchema = new mongoose.Schema({
  exerciseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Exercise',
    required: true,
  },
  sets: {
    type: [setSchema],
    required: true,
    validate: {
      validator: function (v) {
        return Array.isArray(v) && v.length > 0;
      },
      message: 'At least one set is required per exercise.',
    },
  },
}, {
  _id: false,
});

// NOTE: WorkoutLog is append-only. Never update or delete documents.


const workoutLogSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Reference to the User model
    required: true,
    index: true, // Index for faster lookups by user
  },
  workoutId: {
    type: mongoose.Schema.Types.ObjectId, // Reference to a workout's _id within a WorkoutPlan
    required: true,
  },
  date: {
    type: Date,
    required: true,
    default: Date.now, // Default to current date
    index: true, // Index for faster lookups by date
  },
  status: {
    type: String,
    enum: ['completed', 'skipped'], // Restrict to specific values
    required: true,
  },
  performedExercises: {
    type: [performedExerciseSchema],
    default: [],
  }, // Embedded performed exercises
  notes: {
    type: String,
    trim: true,
  },
}, {
  timestamps: true, // Mongoose adds createdAt and updatedAt timestamps
});

// Composite index for efficient querying by user and date
workoutLogSchema.index({ userId: 1, date: 1, workoutId: 1 }, { unique: true });

// Index for Exercise Analytics Layer
workoutLogSchema.index({ userId: 1, 'performedExercises.exerciseId': 1, date: 1 });

const WorkoutLog = mongoose.model('WorkoutLog', workoutLogSchema);

export default WorkoutLog;
