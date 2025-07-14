import React from "react";

interface PdfViewerProps {
  src: string;
  height?: string;
  width?: string;
}

const PdfViewer: React.FC<PdfViewerProps> = ({ src, height = "800px", width = "100%" }) => (
  <iframe
    src={src}
    title="PDF Viewer"
    width={width}
    height={height}
    style={{ border: "none" }}
  />
);

export default PdfViewer;
