import React, { useState, useRef, useEffect, useCallback } from "react";
import axios from "axios";
import "./App.css"; // Importing CSS

const characters = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

const App = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const canvasRef = useRef(null);
  const ctxRef = useRef(null);
  const isDrawingRef = useRef(false);

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

  const startDrawing = useCallback((e) => {
    const { offsetX, offsetY } = e.nativeEvent;
    ctxRef.current.beginPath();
    ctxRef.current.moveTo(offsetX, offsetY);
    isDrawingRef.current = true;
  }, []);

  const draw = useCallback((e) => {
    if (!isDrawingRef.current) return;
    const { offsetX, offsetY } = e.nativeEvent;
    ctxRef.current.lineTo(offsetX, offsetY);
    ctxRef.current.stroke();
  }, []);

  const stopDrawing = useCallback(() => {
    isDrawingRef.current = false;
    ctxRef.current.closePath();
  }, []);

  const handleTouchStart = (e) => {
    e.preventDefault();
    const touch = e.touches[0];
    const rect = canvasRef.current.getBoundingClientRect();
    ctxRef.current.beginPath();
    ctxRef.current.moveTo(touch.clientX - rect.left, touch.clientY - rect.top);
    isDrawingRef.current = true;
  };

  const handleTouchMove = (e) => {
    e.preventDefault();
    if (!isDrawingRef.current) return;
    const touch = e.touches[0];
    const rect = canvasRef.current.getBoundingClientRect();
    ctxRef.current.lineTo(touch.clientX - rect.left, touch.clientY - rect.top);
    ctxRef.current.stroke();
  };

  const handleTouchEnd = () => {
    isDrawingRef.current = false;
    ctxRef.current.closePath();
  };

  const clearCanvas = () => {
    ctxRef.current.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
  };

  const saveImage = async () => {
    const canvas = canvasRef.current;
    const dataUrl = canvas.toDataURL("image/png");

    if (dataUrl === canvas.toDataURL("image/png")) {
      setMessage("Draw something before submitting!");
      return;
    }

    setIsLoading(true);
    setMessage("");

    const payload = {
      character: characters[currentIndex],
      image: dataUrl,
    };

    try {
      await axios.post("https://handwritten-collector.onrender.com/upload", payload, {
        headers: { "Content-Type": "application/json" },
      });

      setMessage("✅ Image uploaded successfully!");
      clearCanvas();

      if (currentIndex < characters.length - 1) {
        setCurrentIndex(currentIndex + 1);
      } else {
        setMessage("🎉 All characters completed!");
      }
    } catch (error) {
      console.error(error);
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
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
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
