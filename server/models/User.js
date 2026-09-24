const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true, select: false },
    role: {
      type: String,
      enum: ['customer', 'provider', 'ops', 'support', 'admin'],
      default: 'customer',
      required: true,
    },
    phone: { type: String, trim: true },
    isActive: { type: Boolean, default: true },
    // Only meaningful for role === 'provider'; mirrors ProviderProfile.verificationStatus
    // for fast auth-time checks (e.g. "can this provider receive requests").
    isVerified: { type: Boolean, default: false },
  },
  { timestamps: true }
);

userSchema.methods.comparePassword = async function comparePassword(candidate) {
  return bcrypt.compare(candidate, this.passwordHash);
};

userSchema.statics.hashPassword = async function hashPassword(plain) {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(plain, salt);
};

userSchema.methods.toSafeObject = function toSafeObject() {
  const obj = this.toObject();
  delete obj.passwordHash;
  return obj;
};

module.exports = mongoose.model('User', userSchema);
