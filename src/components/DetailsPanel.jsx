import React from 'react';

const DetailsPanel = ({ detectionResults, visibleDetections }) => {
  const metadata = {
    id: 19,
    patient_id: '7',
    filename: '7_20241209_024613.png',
    sample_type: 'blood',
    date: '2024-12-09',
    inference: {
      delayTime: 950,
      executionTime: 7223,
      id: 'sync-e1323ad4-a299-4159-9342-1fa220a3c2b5-e1',
      status: 'COMPLETED',
      workerId: 'vgfqxs1imv8aym',
    },
  };

  return (
    <div style={{ width: '20%', padding: '10px', background: '#f0f0f0', height: '100vh', overflowY: 'auto' }}>
      <h2>Details</h2>
      <h3>Metadata</h3>
      <ul>
        <li>ID: {metadata.id}</li>
        <li>Patient ID: {metadata.patient_id}</li>
        <li>Filename: {metadata.filename}</li>
        <li>Sample Type: {metadata.sample_type}</li>
        <li>Date: {metadata.date}</li>
      </ul>
      <h3>Inference Results</h3>
      <ul>
        <li>Delay Time: {metadata.inference.delayTime} ms</li>
        <li>Execution Time: {metadata.inference.executionTime} ms</li>
        <li>ID: {metadata.inference.id}</li>
        <li>Status: {metadata.inference.status}</li>
        <li>Worker ID: {metadata.inference.workerId}</li>
      </ul>
      <h3>Detections</h3>
      <p>Total Detections: {detectionResults.length}</p>
      <p>Visible Detections: {visibleDetections.length}</p>
      <ul>
        {visibleDetections.map((box, index) => (
          <li key={index}>
            {`x: ${box[0]}, y: ${box[1]}, w: ${box[2] - box[0]}, h: ${box[3] - box[1]}`}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default DetailsPanel;