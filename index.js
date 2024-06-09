require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const app = express();
const passport = require("passport");
const { User } = require("./model/User");
const songRoutes = require("./routes/song");
const cors = require("cors");
const playlistRoutes = require("./routes/playlist");
var JwtStrategy = require("passport-jwt").Strategy,
  ExtractJwt = require("passport-jwt").ExtractJwt;
const authRoutes = require("./routes/auth");
const LikedSongsRoutes = require("./routes/LikedSong.js");

const path = require("path");
app.use(express.json());
app.use(cors());
const port = 8080;

app.use("/auth", authRoutes.router);
app.use("/song", songRoutes.router);
app.use("/playlist", playlistRoutes.router);
app.use("/likedsongs", LikedSongsRoutes.router);
app.listen(port, () => {
  console.log("App is running on port " + port);
});

let opts = {};
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
opts.secretOrKey = process.env.SECRET_KEY;
app.use(express.static(path.resolve(__dirname, "build")));
app.get("/*", (req, res) => {
  res.sendFile(path.join(__dirname, "build", "index.html"));
});
// passport.use(
//   new JwtStrategy(opts, function async(jwt_payload, done) {
//     User.findOne({ id: jwt_payload.sub }, function (err, user) {
//       if (err) {
//         return done(err, false);
//       }
//       if (user) {
//         return done(null, user);
//       } else {
//         return done(null, false);
//         // or you could create a new account
//       }
//     });
//   })
// );
passport.use(
  "jwt",
  new JwtStrategy(opts, async function (jwt_payload, done) {
    try {
      const user = await User.findById(jwt_payload.identifier).exec();

      if (user) {
        return done(null, user);
      } else {
        return done(null, false);
      }
    } catch (err) {
      return done(err, false);
    }
  })
);
main().catch((err) => console.log(err));

async function main() {
  await mongoose.connect(process.env.MONGODB_URL);
  console.log("database connected");
}