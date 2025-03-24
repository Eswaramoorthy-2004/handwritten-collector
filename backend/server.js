require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
app.use(express.json({ limit: "10mb" })); // Allow large JSON payloads

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log("Connected to MongoDB"))
.catch(err => console.error("MongoDB connection error:", err));

app.use(cors({
    origin: "https://teal-griffin-e1c96c.netlify.app", // Use main Netlify URL
    methods: "GET,POST",
    credentials: true
}));

const CharacterSchema = new mongoose.Schema({
  character: String,
  image: String, // Store as Base64 string
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
    res.status(500).json({ success: false, message: "Upload failed" });
  }
});

app.get("/data", async (req, res) => {
  try {
    const data = await Character.find();
    res.json(data);
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching data" });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

app.get("/", (req, res) => {
  res.send("Backend is running successfully!");
});
