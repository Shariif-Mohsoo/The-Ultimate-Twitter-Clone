import User from "../models/user.model.js";

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
      res.status(200).json({ message: "User unfollow successfully" });
    } else {
      // follow the user
      await User.findByIdAndUpdate(id, { $push: { followers: req.user._id } });
      await User.findByIdAndUpdate(req.user._id, { $push: { followings: id } });
      // send notification to the user
      res.status(200).json({ message: "User followed successfully" });
    }
  } catch (error) {
    console.log("Error in followUnfollowUser: ", error.message);
    res.status(500).json({ error: error.message });
  }
};
