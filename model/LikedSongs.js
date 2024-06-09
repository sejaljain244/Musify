const mongoose = require("mongoose");
const { Schema } = mongoose;

const likedSongSchema = new Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  song: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Song",
    required: true,
  },
});

exports.LikedSong = mongoose.model("LikedSong", likedSongSchema);
