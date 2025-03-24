require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const multer = require("multer");
const cors = require("cors");

const app = express();
app.use(express.json());

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log("Connected to MongoDB"))
.catch(err => console.error("MongoDB connection error:", err));

app.use(cors({
    origin: "https://67e18b9a991d744159c408b6--teal-griffin-e1c96c.netlify.app", // Corrected Netlify URL
    methods: "GET,POST,PUT,DELETE",
    credentials: true
}));

const CharacterSchema = new mongoose.Schema({
  character: String,
  image: Buffer, // Store as binary buffer
});

const Character = mongoose.model("Character", CharacterSchema);

const storage = multer.memoryStorage();
const upload = multer({ storage });

app.post("/upload", upload.single("image"), async (req, res) => {
  try {
    const { character } = req.body;
    const imageBuffer = req.file.buffer; // Corrected: Store as binary buffer

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

app.get("/", (req, res) => {
  res.send("Backend is running successfully!");
});
