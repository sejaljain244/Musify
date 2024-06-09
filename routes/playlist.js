const express = require("express");
const router = express.Router();
const { Playlist } = require("../model/Playlist");
const passport = require("passport");
const { User } = require("../model/User");
const { Song } = require("../model/Song");
// const User = require("../model/User");
router.post(
  "/create",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    const currentUser = req.user;
    const { name, thumbnail, songs } = req.body;

    // Validate request data
    if (!name || !thumbnail || !songs) {
      return res.status(400).json({ error: "Bad Request - Insufficient data" });
    }

    try {
      const existingPlaylist = await Playlist.findOne({
        name,
        owner: currentUser._id,
      });

      if (existingPlaylist) {
        return res
          .status(409)
          .json({ error: "Conflict - Playlist name already exists" });
      }

      const playlistData = {
        name,
        thumbnail,
        songs,
        owner: currentUser._id,
        collaborators: [],
      };

      const playlist = await Playlist.create(playlistData);
      return res.status(200).json(playlist);
    } catch (error) {
      console.error("Error creating playlist:", error);
      return res.status(500).json({ error: "Internal Server Error" });
    }
  }
);

router.get(
  "/get/playlist/:playlistId",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    const playlistId = req.params.playlistId;
    const playlist = await Playlist.findOne({ _id: playlistId }).populate({
      path: "songs",
      populate: {
        path: "artist",
      },
    });
    if (!playlist) {
      return res.status(301).json({ err: "Invalid Id" });
    }
    return res.status(200).json(playlist);
  }
);
router.get(
  "/get/me",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    const artistId = req.user._id;

    const playlist = await Playlist.find({ owner: artistId }).populate("owner");

    return res.status(200).json({ data: playlist });
  }
);
router.get(
  "/get/artist/:artistId",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    const artistId = req.params.artistId;
    const artist = User.findOne({ _id: artistId });
    if (!artist) {
      return res.status(304).json({ err: "Invalid Artist Id" });
    }

    const playlist = await Playlist.find({ owner: artistId });

    return res.status(200).json({ data: playlist });
  }
);
router.get("/allplaylists", async (req, res) => {
  try {
    const playlists = await Playlist.find().populate("owner");
    return res.status(200).json({ data: playlists });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal server error" });
  }
});
router.post(
  "/add/song",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    const currentuser = req.user;
    const { playlistId, songId } = req.body;
    const playlist = await Playlist.findOne({ _id: playlistId });
    if (!playlist) {
      res.status(304).json({ err: "Playlist does not exist" });
    }
    if (
      !playlist.owner.equals(currentuser._id) &&
      !playlist.collaborators.include(currentuser._id)
    ) {
      return res.status(400).json({ err: "Not allowed" });
    }
    const song = await Song.findOne({ _id: songId });
    if (!song) {
      res.status(304).json({ err: "Song doesnt exist" });
    }
    playlist.songs.push(songId);
    await playlist.save();
    return res.status(200).json(playlist);
  }
);
exports.router = router;
