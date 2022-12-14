const express = require("express");
const router = express.Router();

const { readToken } = require("../utils/jwt");
const authRoutes = require("./auth");
const usersRoutes = require("./users");
const postsRoutes = require("./posts");

router.get("/", async (req, res, next) => {
  return res.status(200).json({ message: "Successfully pinged api." });
});

// Route avaliable to all users
router.use("/auth", authRoutes);

/* 🖱️ Middlewares 🖱️ */
// User must be logged in to access the routes following the middleware
router.use(readToken); // Set req.userId to "id" value found in JWT token

/* ❗ Routes ❗ */
router.use("/users", usersRoutes);
router.use("/posts", postsRoutes);

module.exports = router;
