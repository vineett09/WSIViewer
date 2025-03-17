import React from 'react';

const MainView = ({
  mainImageRef,
  handleMouseDown,
  handleWheel,
  position,
  scale,
  wsiData,
  visibleDetections,
  selectedDetection,
  detectionColors,
  handleDetectionClick
}) => {
  return (
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
  );
};

export default MainView;