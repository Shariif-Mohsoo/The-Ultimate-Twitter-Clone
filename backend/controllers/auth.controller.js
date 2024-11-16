import bcrypt from "bcryptjs";
import User from "../models/user.model.js";
import { generateTokenAndSetCookie } from "../lib/utils/generateToken.js";

export const signup = async (req, res) => {
  try {
    const { fullName, username, email, password } = req.body;
    //1-) DATA CHECKING
    // for checking email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email))
      return res.status(400).json({ error: "Invalid email format" });

    const existingUser = await User.findOne({ username });
    if (existingUser)
      return res.status(400).json({ error: "Username is already taken" });

    const existingEmail = await User.findOne({ email });
    if (existingEmail)
      return res.status(400).json({ error: "Email is already taken" });

    //2-) PASSWORD HASHING
    // hash password
    const salt = bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 3-)CREATING THE NEW USER
    const newUser = new User({
      fullName,
      username,
      email,
      password: hashedPassword,
    });

    //4-)  IF USER CREATED RETURNING THE JWT VIA COOKIE
    if (newUser) {
      generateTokenAndSetCookie(newUser._id, res);
      // saving the user in db
      await newUser.save();
      // sending response back
      return res.status(201).json({
        _id: newUser._id,
        fullName: newUser.fullName,
        username: newUser.username,
        email: newUser.email,
        followers: newUser.followers,
        followings: newUser.followings,
        profileImg: newUser.profileImg,
        coverImg: newUser.coverImg,
      });
    } else return res.status(404).json({ error: "Invalid user data" });
  } catch (error) {
    console.log("Error in signup controller", error.message);
    return res.status(500).json({ error: "Internal Server Error " });
  }
};

export const login = async (req, res) => {
  res.json({ data: "You hit the login endpoint" });
};

export const logout = async (req, res) => {
  res.json({ data: "You hit the logout endpoint" });
};
