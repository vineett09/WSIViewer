import React from 'react';
import OpenSeadragon from 'openseadragon';

class WSIViewer extends React.Component {
  constructor(props) {
    super(props);
    this.viewerRef = React.createRef();
    this.state = { viewer: null, viewport: { x: 0, y: 0, width: 1, height: 1 } };
  }

  componentDidMount() {
    const viewer = OpenSeadragon({
      id: this.viewerRef.current.id,
      prefixUrl: 'https://openseadragon.github.io/openseadragon/images/',
      tileSources: {
        type: 'image',
        url: '/sample-blood-smear.png',
      },
      showNavigationControl: true,
      minZoomLevel: 0.1,
      maxZoomLevel: 10,
    });

    viewer.addHandler('update-viewport', () => {
      const bounds = viewer.viewport.getBounds();
      this.setState({
        viewport: {
          x: bounds.x,
          y: bounds.y,
          width: bounds.width,
          height: bounds.height,
        },
      });
      this.updateVisibleDetections(bounds);
    });

    this.setState({ viewer });
    this.addBoundingBoxes(viewer);
  }

  componentWillUnmount() {
    if (this.state.viewer) this.state.viewer.destroy();
  }

  addBoundingBoxes(viewer) {
    const detectionResults = this.props.detectionResults;
    detectionResults.forEach(([xMin, yMin, xMax, yMax]) => {
      const rect = document.createElement('div');
      rect.style.position = 'absolute';
      rect.style.border = '2px solid green';
      rect.style.background = 'rgba(0, 255, 0, 0.2)';
      rect.style.left = `${(xMin / 1024) * 100}%`;
      rect.style.top = `${(yMin / 512) * 100}%`;
      rect.style.width = `${((xMax - xMin) / 1024) * 100}%`;
      rect.style.height = `${((yMax - yMin) / 512) * 100}%`;
      rect.style.pointerEvents = 'none';
      viewer.canvas.appendChild(rect);
    });
  }

  updateVisibleDetections(bounds) {
    const { x, y, width, height } = bounds;
    const visible = this.props.detectionResults.filter(([xMin, yMin, xMax, yMax]) => {
      return xMin >= x * 1024 && xMax <= (x + width) * 1024 && yMin >= y * 512 && yMax <= (y + height) * 512;
    });
    this.props.onVisibleDetectionsChange(visible);
  }

  render() {
    return (
      <div
        ref={this.viewerRef}
        id="wsi-viewer"
        style={{ width: '60%', height: 'calc(100vh - 220px)', margin: '0 auto', border: '1px solid #000' }}
      />
    );
  }
}

export default WSIViewer;