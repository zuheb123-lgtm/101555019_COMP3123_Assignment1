const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const SALT_ROUNDS = 10;

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, 'Username is required'],
      unique: true,
      trim: true,
      minlength: 3,
      maxlength: 30
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      trim: true,
      lowercase: true,
      maxlength: 100,
      match: [/^\S+@\S+\.\S+$/, 'Email must be a valid email address']
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      // Never returned by queries unless explicitly requested with .select('+password')
      select: false
    }
  },
  {
    // Automatically maintains created_at and updated_at
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
  }
);

// Hash the password with bcrypt before it is saved to MongoDB
userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, SALT_ROUNDS);
});

// Compare a plain-text password with the stored hash
userSchema.methods.comparePassword = function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Remove the password hash whenever a user is converted to JSON for a response
userSchema.set('toJSON', {
  transform: (doc, ret) => {
    delete ret.password;
    delete ret.__v;
    return ret;
  }
});

module.exports = mongoose.model('User', userSchema);