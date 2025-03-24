import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import "./App.css"; 

const characters = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

const App = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const canvasRef = useRef(null);
  const ctxRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setupCanvas();
  }, []);

  const setupCanvas = () => {
    const canvas = canvasRef.current;
    canvas.width = 300;
    canvas.height = 300;
    const ctx = canvas.getContext("2d");
    ctx.lineWidth = 5;
    ctx.lineCap = "round";
    ctx.strokeStyle = "black";
    ctxRef.current = ctx;
  };

  const startDrawing = (e) => {
    ctxRef.current.beginPath();
    ctxRef.current.moveTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
    setIsDrawing(true);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    ctxRef.current.lineTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
    ctxRef.current.stroke();
  };

  const stopDrawing = () => {
    ctxRef.current.closePath();
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    ctxRef.current.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
  };

  const saveImage = async () => {
    const canvas = canvasRef.current;
    const dataUrl = canvas.toDataURL("image/png");

    // Debugging: Check if the canvas is empty
    console.log("Canvas Data URL:", dataUrl);

    if (dataUrl === "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...") {
      setMessage("⚠️ Draw something before submitting!");
      return;
    }

    setIsLoading(true);
    setMessage("");

    try {
      await axios.post("https://handwritten-collector.onrender.com/upload", {
        character: characters[currentIndex],
        image: dataUrl,
      });

      setMessage("✅ Image uploaded successfully!");
      clearCanvas();
      setCurrentIndex((prev) => (prev < characters.length - 1 ? prev + 1 : prev));
    } catch (error) {
      setMessage("❌ Upload failed! Try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container">
      <h1>Handwritten Character Collector</h1>
      <div className="card">
        <h2>Write: {characters[currentIndex]}</h2>
        <canvas
          ref={canvasRef}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          className="canvas"
        ></canvas>
        <div className="buttons">
          <button onClick={clearCanvas} className="clear-btn">Clear</button>
          <button onClick={saveImage} className="submit-btn" disabled={isLoading}>
            {isLoading ? "Uploading..." : "Submit"}
          </button>
        </div>
        <p className="message">{message}</p>
      </div>
    </div>
  );
};

export default App;
