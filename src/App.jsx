// App.jsx
import React, { useState, useEffect, useRef } from 'react';
import './App.css';

function App() {
  const [wsiData, setWsiData] = useState(null);
  const [detectionResults, setDetectionResults] = useState([]);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [scale, setScale] = useState(1);
  const [selectedDetection, setSelectedDetection] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const mainImageRef = useRef(null);
  const hubViewRef = useRef(null);
  const isDraggingRef = useRef(false);
  const [hideAllDetections, setHideAllDetections] = useState(false);
const [detectionColors, setDetectionColors] = useState({});
  // Define zoom thresholds for different levels of detail
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
    const delta = e.deltaY > 0 ? 0.9 : 1.1; // Zoom factor
    const newScale = Math.min(Math.max(scale * delta, 0.5), 5); // Limit scale between 0.5 and 5
    
    // Calculate new position to zoom at mouse cursor
    const newPosition = {
      x: mouseX - imageX * newScale,
      y: mouseY - imageY * newScale
    };
    
    setScale(newScale);
    setPosition(newPosition);
  };
// Add this function to the App component
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

    // Find the appropriate zoom level config
    const zoomConfig = ZOOM_LEVELS.find(level => scale < level.threshold) || ZOOM_LEVELS[ZOOM_LEVELS.length - 1];
  
    const sortedDetections = [...detectionResults].sort((a, b) => {
      const aSize = (a[2] - a[0]) * (a[3] - a[1]);
      const bSize = (b[2] - b[0]) * (b[3] - b[1]);
      return bSize - aSize;
    });
    
    return sortedDetections.slice(0, zoomConfig.maxResults);
  };
  const getUniqueDetectionTypes = () => {
    return [...new Set(detectionResults.map(d => d[4]))];
  };
  // Get total number of detections visible at current zoom
  const visibleDetectionsCount = () => {
    if (scale < ZOOM_LEVELS[0].threshold) return 0;
    
    const zoomConfig = ZOOM_LEVELS.find(level => scale < level.threshold) || ZOOM_LEVELS[ZOOM_LEVELS.length - 1];
    return Math.min(zoomConfig.maxResults, detectionResults.length);
  };

  // Get the next zoom threshold that will show more detections
  const getNextZoomThreshold = () => {
    const nextLevel = ZOOM_LEVELS.find(level => scale < level.threshold);
    return nextLevel ? nextLevel.threshold : null;
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
      <div className="left-panel">
        <h2>Detection Results</h2>
        <div className="detection-legend">
  <h3>Detection Types</h3>
  {getUniqueDetectionTypes().map((type, index) => (
    <div key={index} className="legend-item">
      <div 
        className="color-box" 
        style={{ backgroundColor: detectionColors[type] || '#ccc' }}
      ></div>
      <span>{type}</span>
    </div>
  ))}
</div>
        <div className="sample-info">
        <div className="detection-controls">
 
</div>
          <p><strong>Sample ID:</strong> {wsiData.id}</p>
          <p><strong>Patient ID:</strong> {wsiData.patient_id}</p>
          <p><strong>Date:</strong> {wsiData.date}</p>
          <p><strong>Sample Type:</strong> {wsiData.sample_type}</p>
          <p><strong>Total Detections:</strong> {detectionResults.length}</p>
          <p><strong>Visible Detections:</strong> {visibleDetectionsCount()} / {detectionResults.length}</p>
          <p><strong>Current Zoom:</strong> {Math.round(scale * 100)}%</p>
          {scale < ZOOM_LEVELS[0].threshold && (
            <p className="zoom-notice">Zoom in to {Math.round(ZOOM_LEVELS[0].threshold * 100)}% to start seeing detections</p>
          )}
          {getNextZoomThreshold() && (
            <p className="zoom-notice">Zoom to {Math.round(getNextZoomThreshold() * 100)}% to see more detections</p>
          )}
        </div>
       
        <div className="detection-list">
          {detectionResults.map((detection, index) => (
           <div 
           key={index} 
           className={`detection-item ${selectedDetection === detection ? 'selected' : ''} ${visibleDetections.includes(detection) ? 'visible' : 'hidden'}`}
           onClick={() => handleDetectionClick(detection)}
           style={{
             borderLeft: `4px solid ${detectionColors[detection[4]] || '#ccc'}`
           }}
         >
           {`${detection[4]} (${index + 1}): [${detection[0]}, ${detection[1]}]`}
         </div>
          ))}
        </div>
        {selectedDetection && (
          <div className="detection-details">
            <h3>Selected Detection</h3>
            <p>Type: {selectedDetection[4]}</p>
            <p>Position: [{selectedDetection[0]}, {selectedDetection[1]}, {selectedDetection[2]}, {selectedDetection[3]}]</p>
            <p>Width: {selectedDetection[2] - selectedDetection[0]}px</p>
            <p>Height: {selectedDetection[3] - selectedDetection[1]}px</p>
            <p>Size: {(selectedDetection[2] - selectedDetection[0]) * (selectedDetection[3] - selectedDetection[1])}px²</p>
          </div>
        )}
      </div>
      <div className="right-panel">
  <button onClick={handleResetZoom} className="reset-zoom-button">
    Reset View
  </button>
  <button 
    onClick={toggleDetections} 
    className="toggle-detections-button"
  >
    {hideAllDetections ? "Show Detections" : "Hide Detections"}
  </button>
  <div className="sample-date">
    Date: {wsiData.date}
  </div>
  <div className="zoom-indicators">
    {ZOOM_LEVELS.map((level, index) => (
      <div 
        key={index} 
        className={`zoom-level ${scale >= level.threshold ? 'active' : ''}`}
        title={`${Math.round(level.threshold * 100)}%: Up to ${level.maxResults === Infinity ? 'all' : level.maxResults} detections`}
      >
        {Math.round(level.threshold * 100)}%
      </div>
    ))}
  </div>
  <div>Zoom: {Math.round(scale * 100)}%</div>
</div>
      <div 
        className="main-view" 
        ref={mainImageRef} 
        onMouseDown={handleMouseDown}
        onWheel={handleWheel}
      >
        <div 
          className="wsi-container"
          style={{
            transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
            transformOrigin: '0 0'
          }}
        >
          <img src={wsiData.filename} alt="Whole Slide Image" className="wsi-image" />
          {visibleDetections.map((detection, index) => {
            const [x1, y1, x2, y2, label] = detection;
            return (
              <div
              key={index}
              className={`bounding-box ${selectedDetection === detection ? 'selected' : ''}`}
              style={{
                left: x1 + 'px',
                top: y1 + 'px',
                width: (x2 - x1) + 'px',
                height: (y2 - y1) + 'px',
                borderColor: detectionColors[label] || '#ccc',
                backgroundColor: `${detectionColors[label] || '#ccc'}33` 
              }}
              onClick={(e) => {
                e.stopPropagation();
                handleDetectionClick(detection);
              }}
            >
            
            </div>
            );
          })}
        </div>
      </div>
      <div className="hub-view-container" ref={hubViewRef} onClick={handleHubViewClick}>
  <div className="hub-view-info">
    <div><strong>Patient ID:</strong> {wsiData.patient_id}</div>
    <div><strong>Sample Type:</strong> {wsiData.sample_type}</div>
  </div>
  <img src={wsiData.filename} alt="Whole Slide Image Overview" />
  <div 
    className="viewer-box" 
    style={{
      left: -position.x / scale / 1024 * 100 + '%',
      top: -position.y / scale / 512 * 100 + '%',
      width: 100 / scale + '%',
      height: 100 / scale + '%'
    }}
  ></div>
</div>
    </div>
  );
}

export default App;