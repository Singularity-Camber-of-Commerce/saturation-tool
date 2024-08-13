"use client"
import React, { useState, useRef, useEffect } from 'react';

export default function Home() {
  const [image, setImage] = useState<string | null>(null);
  const [saturatedImage, setSaturatedImage] = useState<string | null>(null);
  const [saturation, setSaturation] = useState<number>(100); // Default 100% saturation
  const [imageUrl, setImageUrl] = useState<string>('');
  const [sliderPosition, setSliderPosition] = useState<number>(50);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const pasteRef = useRef<HTMLDivElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
 
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: ProgressEvent<FileReader>) => setImage(e.target?.result as string);
      reader.readAsDataURL(file);
    }
  };
 
  const handleUrlSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (imageUrl) {
      setImage(imageUrl);
    }
  };
 
  const handlePaste = (event: ClipboardEvent) => {
    const items = event.clipboardData?.items;
    if (items) {
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
          const blob = items[i].getAsFile();
          if (blob) {
            const reader = new FileReader();
            reader.onload = (e: ProgressEvent<FileReader>) => setImage(e.target?.result as string);
            reader.readAsDataURL(blob);
            break;
          }
        }
      }
    }
  };
 
  const adjustSaturation = (imgData: ImageData, sat: number): ImageData => {
    const data = imgData.data;
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      
      const max = Math.max(r, g, b);
      const min = Math.min(r, g, b);
      const l = (max + min) / 2;
      
      if (max !== min) {
        const d = max - min;
        const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        let newS: number;
 
        if (sat <= 100) {
          newS = s * (sat / 100);
        } else {
          // Gradually approach maximum saturation
          const t = (sat - 100) / 100; // 0 to 1
          newS = s + (1 - s) * t;
        }
        
        const factor = newS / s;
        
        data[i] = Math.round(Math.min(255, Math.max(0, l + (r - l) * factor)));
        data[i + 1] = Math.round(Math.min(255, Math.max(0, l + (g - l) * factor)));
        data[i + 2] = Math.round(Math.min(255, Math.max(0, l + (b - l) * factor)));
      }
    }
    return imgData;
  };
 
  useEffect(() => {
    if (image) {
      const img = new Image();
      img.crossOrigin = "Anonymous";  // Allow loading cross-origin images
      img.onload = () => {
        const canvas = canvasRef.current;
        if (canvas) {
          const ctx = canvas.getContext('2d');
          if (ctx) {
            canvas.width = img.width;
            canvas.height = img.height;
            
            ctx.drawImage(img, 0, 0);
            
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const processedData = adjustSaturation(imageData, saturation);
            
            ctx.putImageData(processedData, 0, 0);
            setSaturatedImage(canvas.toDataURL());
          }
        }
      };
      img.onerror = () => {
        alert("Failed to load image. Please check the URL or try another image.");
      };
      img.src = image;
    }
  }, [image, saturation]);
 
  useEffect(() => {
    const pasteArea = pasteRef.current;
    if (pasteArea) {
      pasteArea.addEventListener('paste', handlePaste);
      return () => {
        pasteArea.removeEventListener('paste', handlePaste);
      };
    }
  }, []);
 
  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSliderPosition(Number(e.target.value));
  };
 
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.buttons === 1) {
      const container = containerRef.current;
      if (container) {
        const rect = container.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const newPosition = (x / rect.width) * 100;
        setSliderPosition(Math.max(0, Math.min(100, newPosition)));
      }
    }
  };

  const handleSaveImage = () => {
    if (saturatedImage) {
      const link = document.createElement('a');
      link.href = saturatedImage;
      link.download = 'saturated_image.png';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <main className="min-h-screen bg-black text-neon-blue flex flex-col items-center justify-center p-4 sm:p-8">
      <div className="w-full max-w-7xl bg-gray-900 border-2 border-neon-pink rounded-lg shadow-lg shadow-neon-pink/50 p-4 sm:p-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-center mb-6 sm:mb-8 text-neon-pink cyberpunk-glitch">Image Saturation Adjuster</h1>
        
        <div className="flex flex-col lg:flex-row gap-6 sm:gap-8">
          {/* Left column for image input options */}
          <div className="lg:w-1/3 space-y-4 sm:space-y-6">
            <div className="space-y-2">
              <h2 className="text-lg font-semibold text-neon-green">Upload local image:</h2>
              <input 
                type="file" 
                accept="image/*" 
                onChange={handleImageUpload} 
                className="w-full text-sm text-neon-blue file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-neon-pink file:text-black hover:file:bg-neon-pink/80"
              />
            </div>
            
            <div className="space-y-2">
              <h2 className="text-lg font-semibold text-neon-green">Enter image URL:</h2>
              <form onSubmit={handleUrlSubmit} className="flex flex-col gap-2">
                <input 
                  type="url" 
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://example.com/image.jpg"
                  className="w-full bg-gray-800 border border-neon-blue rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-neon-pink"
                />
                <button type="submit" className="bg-neon-pink text-black px-4 py-2 rounded hover:bg-neon-pink/80 transition-colors">Load URL</button>
              </form>
            </div>
            
            {/* Hide paste image option on mobile */}
            <div className="hidden sm:block space-y-2">
              <h2 className="text-lg font-semibold text-neon-green">Paste image:</h2>
              <div 
                ref={pasteRef}
                className="border-2 border-dashed border-neon-blue rounded p-4 h-24 flex items-center justify-center text-center cursor-pointer hover:bg-gray-800 transition-colors"
              >
                Click here and paste image (Ctrl+V)
              </div>
            </div>

            {image && (
              <div className="space-y-2">
                <label htmlFor="saturation" className="block text-sm font-medium text-neon-green">
                  Saturation: {saturation}% {saturation > 100 ? "(approaching maximum saturation)" : ""}
                </label>
                <input
                  type="range"
                  id="saturation"
                  name="saturation"
                  min="0"
                  max="200"
                  value={saturation}
                  onChange={(e) => setSaturation(Number(e.target.value))}
                  className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                />
              </div>
            )}

            {/* Add Save Image button */}
            {saturatedImage && (
              <button
                onClick={handleSaveImage}
                className="w-full bg-neon-green text-black font-bold py-2 px-4 rounded hover:bg-neon-green/80 transition-colors"
              >
                Save Saturated Image
              </button>
            )}
          </div>

          {/* Right column for image display */}
          <div className="lg:w-2/3 space-y-4 sm:space-y-6">
            {image && saturatedImage ? (
              <>
                <div 
                  ref={containerRef}
                  className="relative w-full overflow-hidden rounded-lg border-2 border-neon-green"
                  onMouseMove={handleMouseMove}
                  onMouseDown={handleMouseMove}
                >
                  <img 
                    src={saturatedImage} 
                    alt="Saturated" 
                    className="w-full h-auto"
                  />
                  <div 
                    className="absolute top-0 left-0 bottom-0 right-0 overflow-hidden" 
                    style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
                  >
                    <img 
                      src={image} 
                      alt="Original" 
                      className="absolute top-0 left-0 w-full h-full object-cover"
                    />
                  </div>
                  <div 
                    className="absolute top-0 bottom-0 w-1 bg-neon-pink cursor-col-resize"
                    style={{ left: `calc(${sliderPosition}% - 2px)` }}
                  >
                    <div className="absolute top-1/2 left-1/2 w-8 h-8 -mt-4 -ml-4 bg-neon-pink rounded-full shadow-lg shadow-neon-pink/50 flex items-center justify-center">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M18 8L22 12L18 16M6 8L2 12L6 16" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                  </div>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={sliderPosition}
                  onChange={handleSliderChange}
                  className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                />
              </>
            ) : (
              <div className="h-full flex items-center justify-center text-neon-green text-xl">
                No image selected. Choose an image to start.
              </div>
            )}
          </div>
        </div>
        
        <canvas ref={canvasRef} style={{ display: 'none' }} />

        {/* AI Image Detection Description */}
        <div className="mt-8 p-6 bg-gray-800 rounded-lg border border-neon-blue">
          <h2 className="text-2xl font-bold mb-4 text-neon-pink">AI Image Detection Functions</h2>
          <ul className="space-y-3 text-neon-blue">
            <li><span className="text-neon-green">Image Consistency Analysis:</span> Examine for unnatural consistencies common in AI-generated images.</li>
            <li><span className="text-neon-green">Metadata Examination:</span> Analyze image metadata for signs of AI generation.</li>
            <li><span className="text-neon-green">Facial Feature Analysis:</span> Detect inconsistencies in facial features common in AI-generated images.</li>
            <li><span className="text-neon-green">Background Coherence Check:</span> Evaluate the background for unrealistic elements indicating AI generation.</li>
            <li><span className="text-neon-green">Texture and Pattern Recognition:</span> Identify repetitive patterns more likely in AI-generated images.</li>
            <li><span className="text-neon-green">Color Distribution Analysis:</span> Examine color palette for signs of artificial generation.</li>
            <li><span className="text-neon-green">Edge Detection:</span> Analyze object edges for unnatural smoothness or sharpness.</li>
            <li><span className="text-neon-green">Machine Learning Model:</span> Use trained models to classify images based on learned patterns.</li>
          </ul>
        </div>
        
      </div>
    </main>
  );
}