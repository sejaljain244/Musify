const mongoose = require("mongoose");
const { Schema } = mongoose;
const songSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  thumbnail: {
    type: String,
    required: true,
  },
  track: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },

  artist: {
    type: mongoose.Types.ObjectId,
    ref: "User",
  },
  duration: {
    type: Date,
    required: true,
  },
});
exports.Song = mongoose.model("Song", songSchema);
