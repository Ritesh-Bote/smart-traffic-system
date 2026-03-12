/**
 * User Model (MongoDB Schema)
 *
 * This defines the structure of admin/police officer accounts
 * stored in MongoDB. Each user has a name, email, password, and role.
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Define the schema (structure) for User documents
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,           // Remove whitespace from start/end
      minlength: [2, 'Name must be at least 2 characters'],
      maxlength: [50, 'Name cannot exceed 50 characters']
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,         // No two users can have same email
      trim: true,
      lowercase: true,      // Always store email in lowercase
      match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false         // By default, don't include password in query results (security)
    },
    role: {
      type: String,
      enum: ['admin', 'police'],   // Only these values are allowed
      default: 'police'
    },
    badgeNumber: {
      type: String,
      trim: true
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true   // Automatically adds createdAt and updatedAt fields
  }
);

// ==================== MIDDLEWARE (Pre-save Hook) ====================

/**
 * Before saving a user, hash their password.
 * This runs automatically before every .save() call.
 * We NEVER store plain text passwords!
 */
userSchema.pre('save', async function (next) {
  // Only hash if password was modified (avoids re-hashing on other updates)
  if (!this.isModified('password')) return next();

  // Generate a salt (random data added to password before hashing)
  const salt = await bcrypt.genSalt(12);

  // Hash the password with the salt
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// ==================== INSTANCE METHODS ====================

/**
 * Compare a plain text password with the hashed password in database.
 * Used during login to verify credentials.
 */
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Create and export the User model
const User = mongoose.model('User', userSchema);
module.exports = User;
