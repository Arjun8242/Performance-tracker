import mongoose from 'mongoose';

const exerciseSchema = new mongoose.Schema(
  {
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
      type: Number,
      min: 0,
    },
  },
  { _id: false }
);

const workoutSchema = new mongoose.Schema(
  {
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
    exercises: {
      type: [exerciseSchema],
      required: true,
      validate: {
        validator: function (v) {
          return Array.isArray(v) && v.length > 0;
        },
        message: 'A workout must contain at least one exercise.',
      },
    },
  },
  { _id: true }
);

const workoutPlanSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true, // One plan per user, period.
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    workouts: {
      type: [workoutSchema],
      required: true,
      validate: {
        validator: function (v) {
          return Array.isArray(v) && v.length > 0;
        },
        message: 'A workout plan must contain at least one workout.',
      },
    },
  },
  {

    //deleting __v and _id from response to make it clean
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (doc, ret) => {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

const WorkoutPlan = mongoose.model('WorkoutPlan', workoutPlanSchema);

export default WorkoutPlan;
