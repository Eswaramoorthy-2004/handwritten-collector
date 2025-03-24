require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const multer = require("multer");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const CharacterSchema = new mongoose.Schema({
  character: String,
  image: String, // Store as base64
});

const Character = mongoose.model("Character", CharacterSchema);

const storage = multer.memoryStorage();
const upload = multer({ storage });

app.post("/upload", upload.single("image"), async (req, res) => {
  try {
    const { character } = req.body;
    const imageBuffer = req.file.buffer.toString("base64");

    const newEntry = new Character({ character, image: imageBuffer });
    await newEntry.save();

    res.json({ success: true, message: "Image saved successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Upload failed" });
  }
});

app.get("/data", async (req, res) => {
  const data = await Character.find();
  res.json(data);
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
