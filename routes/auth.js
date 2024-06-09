const express = require("express");
const router = express.Router();
const { User } = require("../model/User");
const bcrypt = require("bcrypt");
const { getToken } = require("../utils/helpers");
const passport = require("passport");
router.post("/register", async (req, res) => {
  const { email, password, firstName, lastName, username } = req.body;

  const user = await User.findOne({ email: email });

  if (user) {
    return res
      .status(403)
      .json({ error: "A user with this email already exist" });
  }
  const hashedPassword = await bcrypt.hash(password, 10);
  const newUserData = {
    email,
    password: hashedPassword,
    firstName,
    lastName,
    username,
  };
  const newUser = await User.create(newUserData);

  const token = await getToken(email, newUser);

  const usertoReturn = { ...newUser.toJSON(), token };
  delete usertoReturn.password;
  return res.status(200).json(usertoReturn);
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email: email });
  if (!user) {
    return res.status(403).json({ err: "Invalid Credentials" });
  }
  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    return res.status(403).json({ err: "Invalid Credentials" });
  }
  const token = await getToken(user.email, user);
  const usertoReturn = { ...user.toJSON(), token };

  delete usertoReturn.password;
  return res.status(200).json(usertoReturn);
});
router.get(
  "/current-artist",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    try {
      // Assuming req.user contains information about the authenticated artist
      const currentArtist = req.user;
      return res.status(200).json({ data: currentArtist });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Internal server error" });
    }
  }
);
router.post(
  "/logout",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      return res.status(200).json({ message: "Logged out successfully" });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Internal server error" });
    }
  }
);

exports.router = router;
