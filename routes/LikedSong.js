const express = require("express");
const router = express.Router();
const { Song } = require("../model/Song");
const { LikedSong } = require("../model/LikedSongs");

// Add a song to liked songs
router.post("/like", async (req, res) => {
  const { userId, songId } = req.body;

  try {
    const existingLikedSong = await LikedSong.findOne({
      user: userId,
      song: songId,
    });

    if (existingLikedSong) {
      return res.status(400).json({ error: "Song already liked" });
    }

    const newLikedSong = new LikedSong({
      user: userId,
      song: songId,
    });
    await newLikedSong.save();

    res.status(200).json({ message: "Song liked successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});
router.post("/unlike", async (req, res) => {
  const { userId, songId } = req.body;

  try {
    const likedSong = await LikedSong.findOneAndDelete({
      user: userId,
      song: songId,
    });

    if (!likedSong) {
      return res.status(404).json({ error: "Liked song not found" });
    }

    res.status(200).json({ message: "Song unliked successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get all liked songs for a user
router.get("/liked/:userId", async (req, res) => {
  const { userId } = req.params;

  try {
    const likedSongs = await LikedSong.find({ user: userId })
      .populate("song")
      .populate({
        path: "song",
        populate: {
          path: "artist",
          model: "User",
        },
      });

    res.status(200).json(likedSongs);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

exports.router = router;
