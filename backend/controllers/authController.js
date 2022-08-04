const { body, validationResult } = require("express-validator");
const passport = require("passport");

const { hashPassword } = require("../utils/hash");
const { issueToken } = require("../utils/jwt");
const User = require("../models/User");

exports.signupPost = [
  body("first_name")
    .trim()
    .isLength({ min: 1 })
    .withMessage("First name is required.")
    .isAlpha("en-US")
    .withMessage("First name must contain only alphabet characters."),
  body("last_name")
    .trim()
    .isLength({ min: 1 })
    .withMessage("Last name is required.")
    .isAlpha("en-US")
    .withMessage("Last name must contain only alphabet characters."),
  body("email", "An email is required.").trim().isEmail().escape(),
  body("password", "Password must be atleast 6 characters long.")
    .trim()
    .isLength({ min: 6 })
    .escape(),

  async (req, res, next) => {
    const errors = validationResult(req);

    const user = await User.findOne({ email: req.body.email });
    if (user) {
      return res.status(409).json({
        message: "User with that email already exists.",
      });
    }

    const hashedPassword = await hashPassword(req.body.password);
    let userBody = {
      first_name: req.body.first_name,
      last_name: req.body.last_name,
      email: req.body.email,
      profilePicUrl: "",
    };

    if (!errors.isEmpty()) {
      return res.status(409).json({
        message: "Something is wrong with your input.",
        inputData: userBody,
        errors: errors.errors,
      });
    }
    // To not send hashed password back to frontend
    userBody.password = hashedPassword;

    // User data is valid — sign user up
    try {
      const newUser = await User.create(userBody);
      const token = issueToken(newUser);
      return res.status(201).json({
        message: "Successfully signed up user.",
        user: newUser,
        token: token,
      });
    } catch (err) {
      return res.status(500).json({
        message: "Something went wrong when creating your user.",
      });
    }
  },
];

exports.normLoginPost = async (req, res, next) => {
  passport.authenticate("local", { session: false }, (err, user, info) => {
    if (err) return res.status(400).json({ message: "Something went wrong." });
    if (!user) return res.status(400).json(info);
    // We've logged in with valid credentials — return a token
    try {
      const token = issueToken(user);
      return res.status(200).json({
        message: "Successfully logged in.",
        token: token,
      });
    } catch (err) {
      return res.status(500).json({
        message: "Something went wrong when creating your user token.",
      });
    }
  })(req, res);
};

exports.facebookLoginGet = async (req, res, next) => {
  // Successfuly authentication, send back token
  try {
    console.log(req.user);
    const token = issueToken(req.user);
    return res.status(200).json({
      message: "Successfully logged in via Facebook.",
      token: token,
    });
  } catch (err) {
    return res.status(500).json({
      message: "Something went wrong when creating your user token.",
    });
  }
};
