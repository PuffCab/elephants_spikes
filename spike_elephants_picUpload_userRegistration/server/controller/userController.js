import { v2 as cloudinary } from "cloudinary";
import userModel from "../models/userModel.js";
import { passwordEncryption } from "../utils/bcrypt.js";

const imageUpload = async (req, res) => {
  console.log("req :>> ", req.file);

  try {
    const pictureUpload = await cloudinary.uploader.upload(req.file.path, {
      folder: "elephants",
    });
    console.log("pictureUpload :>> ", pictureUpload);
    res.status(200).json({
      msg: "hurrrayyy, you did it!",
      userPicture: pictureUpload.url,
    });
  } catch (error) {
    res.status(400).json({
      msg: "sorry, upload went wrong",
    });
  }
};

const signup = async (req, res) => {
  console.log("req.body", req.body);
  const { userName, email, password, userPicture } = req.body; // destructured version (be careful with undefined/null fields)

  try {
    const existingUser = await userModel.findOne({ email: req.body.email });
    console.log("existingUser :>> ", existingUser);

    if (existingUser) {
      res.status(500).json({
        msg: "ups, email already in use....you might have an account and forgot",
      });
    } else {
      const hashedPassword = await passwordEncryption(req.body.password);
      console.log("hashedPassword", hashedPassword);
      // VALIDATE email/passsword in the backend too, before saving it - express validator
      const newUser = new userModel({
        userName: req.body.userName,
        email: req.body.email,
        password: hashedPassword,
        userPicture: req.body.userPicture,
        // user roleS? do it here
      });
      try {
        const savedUser = await newUser.save();
        res.status(201).json({
          msg: "signup successful",
          user: {
            userName: savedUser.userName,
            email: savedUser.email,
            userPicture: savedUser.userPicture,
          },
        });
      } catch (error) {
        res.status(400).json({ msg: "error during signup", error: error });
      }
    }
  } catch (error) {
    console.log("error registering user", error);
  }
};

export { imageUpload, signup };
