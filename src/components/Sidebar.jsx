import React from 'react';

const Sidebar = ({ 
  wsiData, 
  detectionResults, 
  selectedDetection, 
  setSelectedDetection, 
  visibleDetections,
  scale,
  handleDetectionClick,
  detectionColors,
  ZOOM_LEVELS
}) => {
  
  // Get unique detection types
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

  return (
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
  );
};

export default Sidebar;