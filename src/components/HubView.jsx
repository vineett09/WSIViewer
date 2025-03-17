import React from 'react';

const HubView = ({ 
  hubViewRef, 
  handleHubViewClick, 
  wsiData, 
  position, 
  scale 
}) => {
  return (
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
  );
};

export default HubView;