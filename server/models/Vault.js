import mongoose from 'mongoose';

const VaultSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  name: {
    type: String,
    required: true,
    default: 'Primary Vault',
  },
  hash: {
    type: String,
    required: true,
  }
}, {
  timestamps: true
});

export default mongoose.model('Vault', VaultSchema);
