import bcrypt from 'bcryptjs';
import User from '../models/User.js';

export const registerUser = async (req, res) => {

    console.log('Registering user:', req.body);
  const { username, password, role } = req.body;

  if (!username || !password || !role) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  try {
    const existing = await User.findOne({ username });
    if (existing) return res.status(400).json({ message: 'User already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ username, password: hashedPassword, role });

    res.status(201).json({
      message: 'User registered successfully',
      user: {
        id: user._id,
        username: user.username,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Registration failed', error: error.message });
  }
};


export const loginUser = async (req, res) => {
    console.log('Logging in user:', req.body);
  const { username, password } = req.body;

  if (!username || !password)
    return res.status(400).json({ message: 'Username and password required' });
  
  try {
    const user = await User.findOne({ username });
    
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });
    

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });

    res.status(200).json({
      message: 'Login successful',
      user: {
        id: user._id,
        username: user.username,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Login failed', error: error.message });
  }
};
