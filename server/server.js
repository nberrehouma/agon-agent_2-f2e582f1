import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { connectDB } from './db.js';
import User from './models/User.js';
import Vault from './models/Vault.js';
import Credential from './models/Credential.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-vault-key-123-xyz';

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB
connectDB();

// Middleware to authenticate JWT tokens
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
}

// API Routes

// 1. User Signup
app.post('/api/auth/signup', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password || password.length < 6) {
    return res.status(400).json({ error: 'Username is required and password must be at least 6 characters' });
  }
  try {
    const existingUser = await User.findOne({ username: username.trim() });
    if (existingUser) {
      return res.status(400).json({ error: 'Username is already taken' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
      username: username.trim(),
      password: hashedPassword
    });
    await newUser.save();
    res.json({ success: true });
  } catch (error) {
    console.error('Error signing up:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// 2. User Signin
app.post('/api/auth/signin', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required' });
  }
  try {
    const user = await User.findOne({ username: username.trim() });
    if (!user) {
      return res.status(400).json({ error: 'Invalid username or password' });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid username or password' });
    }
    const token = jwt.sign({ id: user._id, username: user.username }, JWT_SECRET, { expiresIn: '24h' });
    res.json({ token, user: { id: user._id, username: user.username } });
  } catch (error) {
    console.error('Error signing in:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// 3. User profile details (Self)
app.get('/api/auth/me', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    console.error('Error in /api/auth/me:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// 4. Update user profile
app.put('/api/auth/profile', authenticateToken, async (req, res) => {
  const { username, currentPassword, newPassword } = req.body;
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (username && username.trim() !== user.username) {
      const existing = await User.findOne({ username: username.trim() });
      if (existing) {
        return res.status(400).json({ error: 'Username is already taken' });
      }
      user.username = username.trim();
    }

    if (newPassword) {
      if (!currentPassword) {
        return res.status(400).json({ error: 'Current password is required to change password' });
      }
      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
        return res.status(400).json({ error: 'Incorrect current password' });
      }
      if (newPassword.length < 6) {
        return res.status(400).json({ error: 'New password must be at least 6 characters' });
      }
      user.password = await bcrypt.hash(newPassword, 10);
    }

    await user.save();
    res.json({ success: true, user: { id: user._id, username: user.username } });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// 5. Check if vault exists for current user
app.get('/api/vault/has-hash', authenticateToken, async (req, res) => {
  try {
    const vault = await Vault.findOne({ userId: req.user.id });
    res.json({ hasVault: !!vault });
  } catch (error) {
    console.error('Error checking vault:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// 6. Setup master password for current user's primary vault
app.post('/api/vault/setup', authenticateToken, async (req, res) => {
  const { password } = req.body;
  if (!password || password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters long' });
  }

  try {
    let vault = await Vault.findOne({ userId: req.user.id });
    const hashedMaster = await bcrypt.hash(password, 10);
    
    if (vault) {
      vault.hash = hashedMaster;
    } else {
      vault = new Vault({ userId: req.user.id, hash: hashedMaster });
    }
    
    await vault.save();
    res.json({ success: true });
  } catch (error) {
    console.error('Error setting up vault:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// 7. Unlock vault by verifying master password
app.post('/api/vault/unlock', authenticateToken, async (req, res) => {
  const { password } = req.body;
  if (!password) {
    return res.status(400).json({ error: 'Password is required' });
  }

  try {
    const vault = await Vault.findOne({ userId: req.user.id });
    if (!vault) {
      return res.status(400).json({ error: 'Vault has not been set up yet' });
    }

    const isMatch = await bcrypt.compare(password, vault.hash);
    if (isMatch) {
      res.json({ success: true });
    } else {
      res.json({ success: false, error: 'Incorrect master password' });
    }
  } catch (error) {
    console.error('Error unlocking vault:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// 8. Modify master password from dashboard
app.post('/api/vault/change-password', authenticateToken, async (req, res) => {
  const { currentMasterPassword, newMasterPassword } = req.body;
  if (!currentMasterPassword || !newMasterPassword || newMasterPassword.length < 6) {
    return res.status(400).json({ error: 'Invalid master passwords' });
  }
  try {
    const vault = await Vault.findOne({ userId: req.user.id });
    if (!vault) {
      return res.status(404).json({ error: 'Vault not found' });
    }
    const isMatch = await bcrypt.compare(currentMasterPassword, vault.hash);
    if (!isMatch) {
      return res.status(400).json({ error: 'Incorrect current master password' });
    }
    vault.hash = await bcrypt.hash(newMasterPassword, 10);
    await vault.save();
    res.json({ success: true });
  } catch (error) {
    console.error('Error changing master password:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// 9. Get all credentials for user's primary vault
app.get('/api/credentials', authenticateToken, async (req, res) => {
  try {
    const vault = await Vault.findOne({ userId: req.user.id });
    if (!vault) {
      return res.status(400).json({ error: 'Vault not found' });
    }
    const credentials = await Credential.find({ vaultId: vault._id });
    res.json(credentials);
  } catch (error) {
    console.error('Error fetching credentials:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// 10. Add a credential to user's primary vault
app.post('/api/credentials', authenticateToken, async (req, res) => {
  const { id, title, username, password, website, notes, category, createdAt, updatedAt } = req.body;
  if (!id || !title || !username || !password) {
    return res.status(400).json({ error: 'Missing required credential fields' });
  }

  try {
    const vault = await Vault.findOne({ userId: req.user.id });
    if (!vault) {
      return res.status(400).json({ error: 'Vault not found' });
    }

    const newCredential = new Credential({
      vaultId: vault._id,
      id,
      title,
      username,
      password, // Plaintext as requested
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

// 11. Update a credential
app.put('/api/credentials/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  try {
    const vault = await Vault.findOne({ userId: req.user.id });
    if (!vault) {
      return res.status(400).json({ error: 'Vault not found' });
    }

    const updatedCredential = await Credential.findOneAndUpdate(
      { id, vaultId: vault._id },
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

// 12. Delete a credential
app.delete('/api/credentials/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  try {
    const vault = await Vault.findOne({ userId: req.user.id });
    if (!vault) {
      return res.status(400).json({ error: 'Vault not found' });
    }

    const deleted = await Credential.findOneAndDelete({ id, vaultId: vault._id });
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
