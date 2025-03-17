import React from 'react';
import OpenSeadragon from 'openseadragon';

class HubView extends React.Component {
  constructor(props) {
    super(props);
    this.viewerRef = React.createRef();
    this.state = { viewer: null };
  }

  componentDidMount() {
    const viewer = OpenSeadragon({
      id: this.viewerRef.current.id,
      prefixUrl: 'https://openseadragon.github.io/openseadragon/images/',
      tileSources: {
        type: 'image',
        url: '/sample-blood-smear.png',
      },
      showNavigationControl: false,
      minZoomLevel: 0.1,
      maxZoomLevel: 1,
      visibilityRatio: 1,
      gestureSettingsMouse: { clickToZoom: false },
      degrees: 180, // Rotate the image 180 degrees to correct upside-down orientation
    });
    this.setState({ viewer });
  }

  componentDidUpdate(prevProps) {
    if (this.state.viewer && prevProps.viewport !== this.props.viewport) {
      const { x, y, width, height } = this.props.viewport;
      const hubBounds = this.state.viewer.viewport.getBounds();
      const hubWidth = hubBounds.width;
      const hubHeight = hubBounds.height;
      const pointerWidth = width * hubWidth;
      const pointerHeight = height * hubHeight;
      const pointerX = x * hubWidth;
      const pointerY = y * hubHeight;

      this.state.viewer.clearOverlays();
      const overlayElement = document.createElement('div');
      overlayElement.style.border = '2px solid red';
      overlayElement.style.background = 'rgba(255, 0, 0, 0.2)';
      this.state.viewer.addOverlay({
        element: overlayElement,
        location: new OpenSeadragon.Rect(pointerX, pointerY, pointerWidth, pointerHeight),
      });
    }
  }

  render() {
    return (
      <div
        ref={this.viewerRef}
        id="hub-viewer"
        style={{ width: '200px', height: '200px', border: '1px solid #000', position: 'absolute', top: '10px', right: '10px' }}
      />
    );
  }
}

export default HubView;