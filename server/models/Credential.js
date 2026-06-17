import mongoose from 'mongoose';

const CredentialSchema = new mongoose.Schema({
  vaultId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vault',
    required: true,
  },
  id: {
    type: String,
    required: true,
    unique: true,
  },
  title: {
    type: String,
    required: true,
  },
  username: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  website: {
    type: String,
  },
  notes: {
    type: String,
  },
  category: {
    type: String,
    enum: ['social', 'finance', 'work', 'shopping', 'entertainment', 'other'],
    default: 'other',
  },
  createdAt: {
    type: Number,
    required: true,
  },
  updatedAt: {
    type: Number,
    required: true,
  }
}, {
  toJSON: {
    transform: (doc, ret) => {
      delete ret._id;
      delete ret.__v;
      return ret;
    }
  }
});

export default mongoose.model('Credential', CredentialSchema);
