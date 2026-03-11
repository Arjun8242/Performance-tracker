import mongoose from 'mongoose';

const exerciseSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      unique: true, // prevents duplicates like "Bench Press" vs "bench press"
    },

    muscleGroup: {
      type: String,
      required: true,
      enum: [
        'chest',
        'back',
        'legs',
        'shoulders',
        'biceps',
        'triceps',
        'core',
      ],
      index: true,
    },

    secondaryMuscles: {
      type: [String],
      default: [],
      enum: [
        'chest',
        'back',
        'legs',
        'shoulders',
        'biceps',
        'triceps',
        'core',
      ],
    },

    equipment: {
      type: String,
      required: true,
      enum: [
        'barbell',
        'dumbbell',
        'machine',
        'cable',
        'bodyweight',
        'kettlebell',
      ],
      index: true,
    },

    category: {
      type: String,
      required: true,
      enum: ['compound', 'isolation'],
      index: true,
    },

    difficulty: {
      type: String,
      required: true,
      enum: ['beginner', 'intermediate', 'advanced'],
      index: true,
    },

    // Exercise image from ExerciseDB API
    image: {
      type: String,
      default: null,
    },

    // Legacy field, kept for backward compatibility
    imageUrl: {
      type: String,
      default: null,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for fast filtering in workout library
exerciseSchema.index({
  muscleGroup: 1,
  equipment: 1,
  category: 1,
});

const Exercise = mongoose.model('Exercise', exerciseSchema);

export default Exercise;
