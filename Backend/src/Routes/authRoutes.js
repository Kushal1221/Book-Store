import express from "express";
import User from "../models/User.js";
import jwt from "jsonwebtoken";

const router = express.Router();

const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: "10d" });
};

router.post("/register", async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ message: "All Fields are Required" });
    }

    if (password.length < 6) {
      return res
        .status(400)
        .json({ message: "Password should consists more than 6 characters" });
    }

    // checking if already exists
    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      return res
        .status(400)
        .json({ message: "User with same email already exists" });
    }

    const existingUsername = await User.findOne({ username });
    if (existingUsername) {
      return res
        .status(400)
        .json({ message: "User with same name already exists" });
    }

    const profilePhoto = `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`;

    const user = new User({
      username,
      email,
      password,
      profilePhoto,
    });

    await user.save();

    const token = generateToken(user._id);

    res.status(201).json({
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        profilePhoto: user.profilePhoto,
      },
    });
  } catch (error) {
    console.log("error in registering user", error);
    res.status(500).json({ message: "error in registering user" });
  }
});

router.post("/login", async (req, res) => {
  try {
    const {email,password} = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "All Fields are Required" });
    }

    const user = await User.findOne({email});

    if(!user){
      return res.status(400).json({ message: "user does not exists" });
    }

    const isPasswordCorrect = await user.comparePassword(password);
    if(!isPasswordCorrect){
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = generateToken(user._id);

    res.status(201).json({
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        profilePhoto: user.profilePhoto,
      },
    });
    
  } catch (error) {
    console.log("error in logingin user", error);
    res.status(500).json({ message: "error in logingin user" });
  }
});

export default router;
