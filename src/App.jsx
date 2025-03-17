// App.jsx
import React, { useState, useEffect, useRef } from 'react';
import './App.css';

import Sidebar from './components/Sidebar';
import Header from './components/Header';
import MainView from './components/MainView';
import HubView from './components/HubView';

function App() {
  const [wsiData, setWsiData] = useState(null);
  const [detectionResults, setDetectionResults] = useState([]);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [scale, setScale] = useState(1);
  const [selectedDetection, setSelectedDetection] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hideAllDetections, setHideAllDetections] = useState(false);
  const [detectionColors, setDetectionColors] = useState({});
  
  const mainImageRef = useRef(null);
  const hubViewRef = useRef(null);
  const isDraggingRef = useRef(false);
  
  const ZOOM_LEVELS = [
    { threshold: 1.2, maxResults: 30 },  
    { threshold: 1.5, maxResults: 75 }, 
    { threshold: 2.0, maxResults: 150 },  
    { threshold: 2.5, maxResults: 250 }, 
    { threshold: 3.0, maxResults: Infinity } 
  ];
  
  const COLOR_PALETTE = [
    '#FF5733',
    '#33FF57', 
    '#3357FF', 
    '#FF33F5', 
  ];
  
  useEffect(() => {
    fetch('/output.json')
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        setWsiData(data);
        
        // Parse the inference_results string to JSON
        try {
          const inferenceResults = JSON.parse(data.inference_results);
          if (inferenceResults && inferenceResults.output && inferenceResults.output.detection_results) {
            setDetectionResults(inferenceResults.output.detection_results);
            const uniqueLabels = [...new Set(inferenceResults.output.detection_results.map(d => d[4]))];
            
            const colorMap = {};
            uniqueLabels.forEach((label, index) => {
              colorMap[label] = COLOR_PALETTE[index % COLOR_PALETTE.length];
            });
            setDetectionColors(colorMap);
          } else {
            throw new Error('Detection results not found in the expected format');
          }
        } catch (err) {
          console.error('Error parsing inference results:', err);
          setError('Failed to parse detection results');
        }
        
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching data:', err);
        setError('Failed to load data');
        setLoading(false);
      });
  }, []);
  
  const toggleDetections = () => {
    setHideAllDetections(!hideAllDetections);
  };
  
  const handleWheel = (e) => {
    e.preventDefault();
    
    // Get mouse position relative to the main view
    const rect = mainImageRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    
    // Convert to image coordinates
    const imageX = (mouseX - position.x) / scale;
    const imageY = (mouseY - position.y) / scale;
    
    // Calculate new scale
    const delta = e.deltaY > 0 ? 0.9 : 1.1; 
    const newScale = Math.min(Math.max(scale * delta, 0.5), 5); //
    
    // Calculate new position to zoom at mouse cursor
    const newPosition = {
      x: mouseX - imageX * newScale,
      y: mouseY - imageY * newScale
    };
    
    setScale(newScale);
    setPosition(newPosition);
  };
  
  const handleResetZoom = () => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  };

  const handleMouseDown = (e) => {
    if (e.button !== 0) return;
    
    isDraggingRef.current = true;
    const startX = e.clientX;
    const startY = e.clientY;
    const startPosition = { ...position };
    
    const handleMouseMove = (e) => {
      if (!isDraggingRef.current) return;
      
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;
      setPosition({
        x: startPosition.x + dx,
        y: startPosition.y + dy
      });
    };
    
    const handleMouseUp = () => {
      isDraggingRef.current = false;
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const handleDetectionClick = (detection) => {
    setSelectedDetection(detection);
    const [x1, y1, x2, y2, label] = detection;
    const centerX = (x1 + x2) / 2;
    const centerY = (y1 + y2) / 2;
    
    const minZoomLevel = ZOOM_LEVELS[0].threshold;
    const newScale = scale < minZoomLevel ? minZoomLevel : scale;
    
    setScale(newScale);
    setPosition({
      x: -centerX * newScale + mainImageRef.current.clientWidth / 2,
      y: -centerY * newScale + mainImageRef.current.clientHeight / 2
    });
  };

  const handleHubViewClick = (e) => {
    if (!hubViewRef.current) return;
    
    const rect = hubViewRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Convert click position to image coordinates
    const imageX = (x / rect.width) * 1024;
    const imageY = (y / rect.height) * 512;
    
    // Center the main view on the clicked position
    setPosition({
      x: -imageX * scale + mainImageRef.current.clientWidth / 2,
      y: -imageY * scale + mainImageRef.current.clientHeight / 2
    });
  };

  // Function to determine how many detection results to show based on current zoom level
  const getVisibleDetections = () => {
    if (hideAllDetections) return [];

    const zoomConfig = ZOOM_LEVELS.find(level => scale < level.threshold) || ZOOM_LEVELS[ZOOM_LEVELS.length - 1];
  
    const sortedDetections = [...detectionResults].sort((a, b) => {
      const aSize = (a[2] - a[0]) * (a[3] - a[1]);
      const bSize = (b[2] - b[0]) * (b[3] - b[1]);
      return bSize - aSize;
    });
    
    return sortedDetections.slice(0, zoomConfig.maxResults);
  };

  if (loading) {
    return <div className="loading">Loading data...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  const visibleDetections = getVisibleDetections();

  return (
    <div className="wsi-viewer">
      <Sidebar
        wsiData={wsiData}
        detectionResults={detectionResults}
        selectedDetection={selectedDetection}
        setSelectedDetection={setSelectedDetection}
        visibleDetections={visibleDetections}
        scale={scale}
        handleDetectionClick={handleDetectionClick}
        detectionColors={detectionColors}
        ZOOM_LEVELS={ZOOM_LEVELS}
      />
      
      <Header
        wsiData={wsiData}
        scale={scale}
        handleResetZoom={handleResetZoom}
        toggleDetections={toggleDetections}
        hideAllDetections={hideAllDetections}
        ZOOM_LEVELS={ZOOM_LEVELS}
      />
      
      <MainView
        mainImageRef={mainImageRef}
        handleMouseDown={handleMouseDown}
        handleWheel={handleWheel}
        position={position}
        scale={scale}
        wsiData={wsiData}
        visibleDetections={visibleDetections}
        selectedDetection={selectedDetection}
        detectionColors={detectionColors}
        handleDetectionClick={handleDetectionClick}
      />
      
      <HubView
        hubViewRef={hubViewRef}
        handleHubViewClick={handleHubViewClick}
        wsiData={wsiData}
        position={position}
        scale={scale}
      />
    </div>
  );
}

export default App;