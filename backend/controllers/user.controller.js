import bcrypt from "bcryptjs";
import { v2 as cloudinary } from "cloudinary";

import User from "../models/user.model.js";
import Notification from "../models/notification.model.js";

export const getUserProfile = async (req, res) => {
  // destructing the username param.
  const { username } = req.params;
  try {
    // searching the user in the db.
    const user = await User.findOne(username).select("-password");
    // if not found there is no exist.
    if (!user) return res.status(404).json({ Error: "User Not Found" });
    // else send the user back as response
    return res.status(200).json(user);
  } catch (error) {
    console.log("Error in getUserProfile", error.message);
    // return error
    return res.status(500).json({ error: error.message });
  }
};

export const followUnfollowUser = async (req, res) => {
  try {
    // destructing the user id to follow
    const { id } = req.params;
    // User to follow.
    const userToModify = await User.findById(id);
    // currentUser like Me.
    const currentUser = await User.findById(req.user._id);

    if (id === req.user._id.toString())
      return res
        .status(400)
        .json({ error: "You can't follow/unfollow yourself" });
    if (!userToModify || !currentUser)
      return res.status(400).json({ error: "User Not Found" });

    // checking the id exists in following array or not.
    const isFollowing = currentUser.followings.includes(id);

    if (isFollowing) {
      // unfollow the user
      await User.findByIdAndUpdate(id, { $pull: { followers: req.user._id } });
      await User.findByIdAndUpdate(req.user._id, { $pull: { followings: id } });
      // TODO: return the id of the user as response
      res.status(200).json({ message: "User unfollow successfully" });
    } else {
      // follow the user
      await User.findByIdAndUpdate(id, { $push: { followers: req.user._id } });
      await User.findByIdAndUpdate(req.user._id, { $push: { followings: id } });
      // send notification to the user
      const newNotification = new Notification({
        type: "follow",
        from: req.user._id,
        to: userToModify._id,
      });
      // saving in db
      await newNotification.save();

      // TODO: return the id of the user as response
      res.status(200).json({ message: "User followed successfully" });
    }
  } catch (error) {
    console.log("Error in followUnfollowUser: ", error.message);
    res.status(500).json({ error: error.message });
  }
};

export const getSuggestedUsers = async (req, res) => {
  try {
    // getting the currentUserID
    const userId = req.user._id;
    // getting its followings.
    const usersFollowedByMe = await User.findById(userId).select("followings");
    // returning the aggregate.
    const users = await User.aggregate([
      {
        $match: {
          _id: { $ne: userId },
        },
      },
      {
        $sample: { size: 10 },
      },
    ]);
    // removing ourself from suggestion.
    const filteredUsers = users.filter(
      (user) => !usersFollowedByMe.followings.includes(user._id)
    );
    const suggestedUsers = filteredUsers.slice(0, 4);
    // this doesn't effect the db; just for the case of response.
    suggestedUsers.forEach((user) => (user.password = null));
    res.status(200).json(suggestedUsers);
  } catch (error) {
    console.log("Error in getSuggestedUsers: ", error.message);
    res.status(500).json({ Error: error.message });
  }
};

export const updateUser = async (req, res) => {
  const { fullName, email, username, currentPassword, newPassword, bio, link } =
    req.body;
  let { profileImg, coverImg } = req.body;
  const userId = req.user._id;
  try {
    const user = await User.findBy(userId);
    if (!user) return res.status(404).json({ message: "User Not Found" });

    if (
      (!newPassword && currentPassword) ||
      (!currentPassword && newPassword)
    ) {
      return res
        .status(400)
        .json({
          error: "Please provide both current password and new password",
        });
    }
    if (currentPassword && newPassword) {
      // checking the password
      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch)
        return res.status(400).json({ Error: "Current password is incorrect" });
      if (newPassword.length < 6)
        return res
          .status(400)
          .json({ error: "Password must be at least 6 characters long" });
      // updating the password.
      const salt = await bcrypt.getSalt(10); //getting salt
      user.password = await bcrypt.hash(newPassword, salt); //concat with password after hashing

      if (profileImg) {
        if (user.profileImg) {
          // deleting the old image
          await cloudinary.uploader.destroy(
            user.profileImg.split("/").pop().split(".")
          );
        }
        const uploadedResponse = await cloudinary.uploader.upload(profileImg);
        profileImg = uploadedResponse.secure_url;
      }
      if (coverImg) {
        if (user.coverImg) {
          // deleting the old image
          await cloudinary.uploader.destroy(
            user.coverImg.split("/").pop().split(".")
          );
        }
        const uploadedResponse = await cloudinary.uploader.upload(coverImg);
        coverImg = uploadedResponse.secure_url;
      }
      user.fullName = fullName || user.fullName;
      user.email = email || user.email;
      user.username = username || user.username;
      user.bio = bio || user.bio;
      user.link = link || user.link;
      user.profileImg = profileImg || user.profileImg;
      (user.coverImg = coverImg || user.coverImg), (user = await user.save());

      user.password = null;

      return res.status(200).json(user);
    }
  } catch (error) {
    console.log("Error in updateUser: ", error.message);
    res.status(500).json({ Error: error.message });
  }
};
