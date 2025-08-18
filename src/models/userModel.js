import mongoose from "mongoose";
import validator from "validator";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    required: true,
    unique: true,
  },
  profilePicture: {
    type: String,
    default: "",
  },
  isVerified: {
    type: Boolean,
    default: false,
  }
  });
userSchema.statics.signup = async function (name, email, password, phone, profilePicture) {
  if (!name || !email || !password || !phone) {
    throw Error("All fields must be filled");
  }
  if(!validator.isEmail(email)) {
    throw Error("Email is not valid");
  }
  if(!validator.isStrongPassword(password)) {
    throw Error("Password is not strong enough");
  }
  const exists = await this.findOne({ email });
  if (exists) {
    throw Error("Email already in use");
  }
  //default profile picture if not provided
  if (!profilePicture) {
    profilePicture = "https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y";
  }
  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash(password, salt);
  const user = await this.create({
    name,
    email,
    password: hash,
    phone,
    profilePicture,
  });
  return user;
}
userSchema.statics.login = async function (email, password) {
  if (!email || !password) {
    throw Error("All fields must be filled");
  }
  const user = await this.findOne({ email });
  if (!user) {
    throw Error("Incorrect email");
  }
  const match = await bcrypt.compare(password, user.password);
  if (!match) {
    throw Error("Incorrect password");
  }
  return user;
}
export default mongoose.models.User || mongoose.model("User", userSchema);