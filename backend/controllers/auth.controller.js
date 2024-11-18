import bcrypt from "bcryptjs";
import User from "../models/user.model.js";
import { generateTokenAndSetCookie } from "../lib/utils/generateToken.js";

export const signup = async (req, res) => {
  try {
    // console.log(req.body);
    const { fullName, username, email, password } = req.body;
    // console.log(fullName, username, email, password);
    //1-) DATA CHECKING
    // for checking email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email))
      return res.status(400).json({ error: "Invalid email format" });
    // checking whether the user exists with same data also or is it new one?
    const existingUser = await User.findOne({ username });
    if (existingUser)
      return res.status(400).json({ error: "Username is already taken" });
    // checking whether the user exists with same data also or is it new one?
    const existingEmail = await User.findOne({ email });
    if (existingEmail)
      return res.status(400).json({ error: "Email is already taken" });
    //make suring this thing password should be above 5 characters.
    if (password.length < 6)
      return res
        .status(400)
        .json({ error: "Password must at least 6 characters long" });

    //2-) PASSWORD HASHING
    // hash password
    // Fix bcrypt salt generation
    const salt = await bcrypt.genSalt(10); // Add 'await' here
    const hashedPassword = await bcrypt.hash(password, salt);

    // 3-)CREATING THE NEW USER FROM USER MODEL.
    const newUser = new User({
      fullName,
      username,
      email,
      password: hashedPassword,
    });

    //4-)  IF USER CREATED RETURNING THE JWT VIA COOKIE
    if (newUser) {
      // generating the token for newUser to verify as per the need.
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
  try {
    const { username, password } = req.body;
    // checking whether the user exist or not
    const user = await User.findOne({ username });
    // comparing the user password with store password
    const isPasswordCorrect = await bcrypt.compare(
      password,
      user?.password || ""
    ); //to avoid crashing application
    if (!user || !isPasswordCorrect) {
      return res.status(400).json({ error: "Invalid Username or Password" });
    }

    generateTokenAndSetCookie(user._id, res);

    res.status(200).json({
      _id: user._id,
      fullName: user.fullName,
      username: user.username,
      email: user.email,
      followers: user.followers,
      followings: user.followings,
      profileImg: user.profileImg,
      coverImg: user.coverImg,
    });
  } catch (error) {
    console.log("Error In Login controller", error.message);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

export const logout = async (req, res) => {
  try {
    res.cookie("jwt", "", { maxAge: 0 });
    return res.status(200).json({ message: "Logged Out Successfully" });
  } catch (error) {
    console.log("Error in logout controller", error.message);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

//  to get auth user.
export const getMe = async (req, res) => {
  try {
    // checking whether the user is in db or not.
    const user = await User.findById(req.user._id).select("-password");
    res.status(200).json(user);
  } catch (error) {
    console.log("Error in getMe controller", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

/*
FOR TESTING PURPOSE=>
{
  "fullName": "John Doe",
  "username": "johndoe123",
  "password": "securePassword123",
  "email": "johndoe@example.com"
}

response:
{"_id":"673a61d36608b1cffe9b5c31","fullName":"John Doe","username":"johndoe123","email":"johndoe@example.com","followers":[],"followings":[],"profileImg":"","coverImg":""}
// 
jenny id: 673a629d497ddfcc47bf3cb6
FOR LOGIN PURPOSE
{
  "username": "johndoe123",
  "password": "securePassword123"
}
*/
