import User from "../model/User.model.js";
import bcrypt from "bcrypt";
import { generateToken } from "../lib/utils.js";
import { sendWelcomeEmail } from "../email/emailHandler.js";
import cloudinary from "../lib/cloudinary.js";

// ====================== SIGNUP CONTROLLER ======================

export const signup = async (req, res) => {
  const { fullName, email, password } = req.body;

  try {
    // Validation
    if (!fullName || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (password.length < 6) {
      return res
        .status(400)
        .json({ message: "Password must be at least 6 characters" });
    }

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }

    // Check existing user
    const user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: "Email already exists" });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new user
    const newUser = new User({
      fullName,
      email,
      password: hashedPassword,
    });

    // Save user
    const savedUser = await newUser.save();

    // Generate JWT Token
    generateToken(savedUser._id, res);

    // Response to client
    res.status(201).json({
      _id: savedUser._id,
      fullName: savedUser.fullName,
      email: savedUser.email,
      profilePic: savedUser.profilePic,
    });

    // Send Welcome Email
    try {
      await sendWelcomeEmail(
        savedUser.email,
        savedUser.fullName,
        process.env.CLIENT_URL
      );
    } catch (error) {
      console.error("Failed to send welcome email:", error);
    }
  } catch (error) {
    console.log("Error in Signup Controller:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// ======================== LOGIN CONTROLLER =======================

export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid Credentials" });
    }

    // Check password
    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      return res.status(400).json({ message: "Invalid Credentials" });
    }

    // Generate token
    generateToken(user._id, res);

    // Response
    return res.status(200).json({
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      profilePic: user.profilePic,
    });
  } catch (error) {
    console.log("Error in Login Controller:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

// ======================== LOGOUT CONTROLLER =======================

export const logout = async (req, res) => {
  res.cookie("jwt", "", { maxAge: 0 });
  res.status(200).json({ message: "Logout Successfully" });
};

export const updateProfile = async (req, res) => {
  try {
    const { profilePic } = req.body;
    if (!profilePic) {
      return res.status(401).json({ message: "Profile Pic is Required" });
    }
    const userId = req.user._id;
    const uploadResponse = await cloudinary.uploader.upload(profilePic);
    const updatedUser=await User.findByIdAndUpdate(
      userId,
      { profilePic: uploadResponse.secure_url },
      { new: true }
    );
    return res.status(200).json(updatedUser)
  } catch (error) {
    console.log("Error in Updated Profile",error);
    res.status(500).json({message:"Internal Server Error"})
  }
};
