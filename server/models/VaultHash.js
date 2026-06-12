import mongoose from 'mongoose';

const VaultHashSchema = new mongoose.Schema({
  hash: {
    type: String,
    required: true,
  }
}, { 
  timestamps: true 
});

export default mongoose.model('VaultHash', VaultHashSchema);
