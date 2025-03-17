import React, { useState } from 'react';
import ImageZoom from 'react-image-zoom';
import { TransformWrapper, TransformComponent } from 'react-image-pan-zoom';

const WSIViewer = ({ imageUrl, detectionResults }) => {
  const [zoomLevel, setZoomLevel] = useState(1);

  return (
    <div style={{ width: '100%', height: '100vh', overflow: 'hidden' }}>
      <TransformWrapper
        defaultScale={1}
        defaultPositionX={0}
        defaultPositionY={0}
      >
        {({ zoomIn, zoomOut, resetTransform, ...rest }) => (
          <React.Fragment>
            <div style={{ position: 'absolute', top: 10, left: 10, zIndex: 1 }}>
              <button onClick={zoomIn}>+</button>
              <button onClick={zoomOut}>-</button>
              <button onClick={resetTransform}>Reset</button>
            </div>
            <TransformComponent>
              <img
                src={imageUrl}
                alt="Whole Slide Image"
                style={{ width: '100%', height: 'auto' }}
              />
              {detectionResults.map((result, index) => (
                <div
                  key={index}
                  style={{
                    position: 'absolute',
                    left: result[0],
                    top: result[1],
                    width: result[2] - result[0],
                    height: result[3] - result[1],
                    border: '2px solid red',
                    boxSizing: 'border-box',
                  }}
                />
              ))}
            </TransformComponent>
          </React.Fragment>
        )}
      </TransformWrapper>
    </div>
  );
};

export default WSIViewer;