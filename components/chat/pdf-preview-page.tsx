"use client";

import { Document, Page } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";
import "@/lib/pdf-worker";

interface PdfPreviewPageProps {
  file: string;
  width: number;
  onLoadSuccess: () => void;
  onLoadError: () => void;
}

export function PdfPreviewPage({
  file,
  width,
  onLoadSuccess,
  onLoadError,
}: PdfPreviewPageProps) {
  return (
    <Document
      file={file}
      onLoadSuccess={onLoadSuccess}
      onLoadError={onLoadError}
      loading={null}
      error={null}
    >
      <Page
        pageNumber={1}
        width={width}
        renderTextLayer={false}
        renderAnnotationLayer={false}
      />
    </Document>
  );
}
