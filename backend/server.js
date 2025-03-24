require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
app.use(express.json({ limit: "10mb" })); // Increase payload limit for Base64 images

// ✅ Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log("Connected to MongoDB"))
.catch(err => console.error("MongoDB connection error:", err));

// ✅ Fix CORS Issues
const allowedOrigins = [
  "https://67e18b9a991d744159c408b6--teal-griffin-e1c96c.netlify.app",
  "https://teal-griffin-e1c96c.netlify.app",
  "https://your-custom-domain.com"
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("CORS not allowed"));
    }
  },
  methods: ["GET", "POST"],
  credentials: true
}));

// ✅ Handle Preflight (OPTIONS request)
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", req.headers.origin);
  res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type");
  res.header("Access-Control-Allow-Credentials", "true");

  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  next();
});

// ✅ Mongoose Schema
const CharacterSchema = new mongoose.Schema({
  character: String,
  image: String, // Store as Base64 string
});

const Character = mongoose.model("Character", CharacterSchema);

// ✅ Upload Route
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

// ✅ Get Data Route
app.get("/data", async (req, res) => {
  try {
    const data = await Character.find();
    res.json(data);
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch data" });
  }
});

// ✅ Root Route
app.get("/", (req, res) => {
  res.send("Backend is running successfully!");
});

// ✅ Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
