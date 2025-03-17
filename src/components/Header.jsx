import React from 'react';

const Header = ({ 
  wsiData, 
  scale, 
  handleResetZoom, 
  toggleDetections, 
  hideAllDetections,
  ZOOM_LEVELS 
}) => {
  return (
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
  );
};

export default Header;