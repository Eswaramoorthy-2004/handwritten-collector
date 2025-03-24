require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
app.use(express.json({ limit: "10mb" }));

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log("Connected to MongoDB"))
.catch(err => console.error("MongoDB connection error:", err));

// app.use(cors({
//   origin: [
//     "https://67e18b9a991d744159c408b6--teal-griffin-e1c96c.netlify.app",
//     "https://handwritten-collector.onrender.com"
//   ],
//   methods: "GET,POST",
//   credentials: true
// }));


const cors = require("cors");

app.use(cors({
  origin: [
    "https://teal-griffin-e1c96c.netlify.app",
    "https://handwritten-collector.onrender.com"
  ],
  methods: "GET, POST, OPTIONS",
  allowedHeaders: ["Origin", "X-Requested-With", "Content-Type", "Accept"],
  credentials: true
}));

// Handle preflight requests
app.options("*", cors());


const CharacterSchema = new mongoose.Schema({
  character: String,
  image: String,
});

const Character = mongoose.model("Character", CharacterSchema);

app.post("/upload", async (req, res) => {
  try {
    const { character, image } = req.body;

    if (!character || !image) {
      return res.status(400).json({ success: false, message: "Missing data" });
    }

    const newEntry = new Character({ character, image });
    await newEntry.save();

    res.json({ success: true, message: "Image saved successfully" });
  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({ success: false, message: "Upload failed" });
  }
});

app.get("/data", async (req, res) => {
  try {
    const data = await Character.find();
    res.json(data);
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch data" });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

app.get("/", (req, res) => {
  res.send("Backend is running successfully!");
});
