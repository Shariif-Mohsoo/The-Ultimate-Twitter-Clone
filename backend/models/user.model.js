import mongoose from "mongoose";
/*
    Why ObjectId is a Type?
    In MongoDB, every document in a collection has a unique identifier called _id,
    and its type is ObjectId. When referencing documents in other collections (e.g., when implementing relationships), 
    Mongoose uses the ObjectId type from mongoose.Schema.Types to represent these MongoDB references.

    For example:
    followers is an array of references to other users.
    The value of type: mongoose.Schema.Types.ObjectId tells Mongoose, 
    "This field stores ObjectId values, which refer to other documents in the User collection."
*/

//Schema: logical representation of data.
const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
    },
    fullName: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
      minLength: 6,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    followers: [
      {
        type: mongoose.Schema.Types.ObjectId, // Corrected here
        ref: "User",
        default: [],
      },
    ],
    followings: [
      {
        type: mongoose.Schema.Types.ObjectId, // Corrected here
        ref: "User",
        default: [],
      },
    ],
    profileImg: {
      type: String,
      default: "",
    },
    coverImg: {
      type: String,
      default: "",
    },
    bio: {
      type: String,
      default: "",
    },
    link: {
      type: String,
      default: "",
    },
    likedPosts: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Post",
        default: [],
      },
    ],
  },
  {
    timestamps: true,
  }
);

// User Model
const User = mongoose.model("User", userSchema);
// in moongodb user will appear as Users || users.

export default User;
