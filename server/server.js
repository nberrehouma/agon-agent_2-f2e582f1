import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './db.js';
import VaultHash from './models/VaultHash.js';
import Credential from './models/Credential.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Simple hash function to match front-end hash behavior
function simpleHash(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return hash.toString(36);
}

// Connect to MongoDB
connectDB();

// API Routes

// 1. Check if vault hash exists
app.get('/api/vault/has-hash', async (req, res) => {
  try {
    const vaultHash = await VaultHash.findOne();
    res.json({ hasVault: !!vaultHash });
  } catch (error) {
    console.error('Error in /api/vault/has-hash:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// 2. Setup master password
app.post('/api/vault/setup', async (req, res) => {
  const { password } = req.body;
  if (!password || password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters long' });
  }

  try {
    let vaultHash = await VaultHash.findOne();
    const hashVal = simpleHash(password);
    
    if (vaultHash) {
      vaultHash.hash = hashVal;
    } else {
      vaultHash = new VaultHash({ hash: hashVal });
    }
    
    await vaultHash.save();
    res.json({ success: true });
  } catch (error) {
    console.error('Error in /api/vault/setup:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// 3. Unlock vault by verifying master password
app.post('/api/vault/unlock', async (req, res) => {
  const { password } = req.body;
  if (!password) {
    return res.status(400).json({ error: 'Password is required' });
  }

  try {
    const vaultHash = await VaultHash.findOne();
    if (!vaultHash) {
      return res.status(400).json({ error: 'Vault has not been set up yet' });
    }

    if (vaultHash.hash === simpleHash(password)) {
      res.json({ success: true });
    } else {
      res.json({ success: false, error: 'Incorrect master password' });
    }
  } catch (error) {
    console.error('Error in /api/vault/unlock:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// 4. Get all credentials
app.get('/api/credentials', async (req, res) => {
  try {
    const credentials = await Credential.find();
    res.json(credentials);
  } catch (error) {
    console.error('Error fetching credentials:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// 5. Add a credential
app.post('/api/credentials', async (req, res) => {
  const { id, title, username, password, website, notes, category, createdAt, updatedAt } = req.body;
  if (!id || !title || !username || !password) {
    return res.status(400).json({ error: 'Missing required credential fields' });
  }

  try {
    const newCredential = new Credential({
      id,
      title,
      username,
      password,
      website,
      notes,
      category,
      createdAt,
      updatedAt,
    });

    await newCredential.save();
    res.json(newCredential);
  } catch (error) {
    console.error('Error adding credential:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// 6. Update a credential
app.put('/api/credentials/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const updatedCredential = await Credential.findOneAndUpdate(
      { id },
      req.body,
      { new: true, runValidators: true }
    );

    if (!updatedCredential) {
      return res.status(404).json({ error: 'Credential not found' });
    }

    res.json(updatedCredential);
  } catch (error) {
    console.error('Error updating credential:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// 7. Delete a credential
app.delete('/api/credentials/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const deleted = await Credential.findOneAndDelete({ id });
    if (!deleted) {
      return res.status(404).json({ error: 'Credential not found' });
    }
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting credential:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
