const mongoose = require("mongoose");
const { Schema } = mongoose;
const playlistSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  thumbnail: {
    type: String,
    required: true,
  },
  songs: [
    {
      type: mongoose.Types.ObjectId,
      ref: "Song",
    },
  ],
  owner: {
    type: mongoose.Types.ObjectId,
    ref: "User",
  },
  collaborators: [{ type: mongoose.Types.ObjectId, ref: "User" }],
});
exports.Playlist = mongoose.model("Playlist", playlistSchema);
