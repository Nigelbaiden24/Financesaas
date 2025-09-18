import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import type { CanvasElement } from './PDFEditor';

export async function exportToPDF(stage: any, elements: CanvasElement[], filename: string) {
  try {
    // Create a new PDF document
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([595.28, 841.89]); // A4 size in points
    
    const { width: pageWidth, height: pageHeight } = page.getSize();
    
    // Load fonts
    const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const helveticaBoldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    
    // Sort elements by z-index (render order)
    const sortedElements = [...elements].sort((a, b) => {
      // Text elements should render on top
      if (a.type === 'text' && b.type !== 'text') return 1;
      if (b.type === 'text' && a.type !== 'text') return -1;
      return 0;
    });

    // Convert and add each element to PDF
    for (const element of sortedElements) {
      // Convert canvas coordinates to PDF coordinates (PDF origin is bottom-left)
      const pdfY = pageHeight - element.y - (element.height || 0);
      
      switch (element.type) {
        case 'text':
          if (element.text) {
            const font = element.fontStyle?.includes('bold') ? helveticaBoldFont : helveticaFont;
            const fontSize = element.fontSize || 16;
            
            // Parse color (hex to RGB)
            const fillColor = hexToRgb(element.fill || '#000000');
            
            // Handle text wrapping for long text
            const maxWidth = element.width || (pageWidth - element.x - 50);
            const words = element.text.split(' ');
            const lines: string[] = [];
            let currentLine = '';
            
            for (const word of words) {
              const testLine = currentLine + (currentLine ? ' ' : '') + word;
              const textWidth = font.widthOfTextAtSize(testLine, fontSize);
              
              if (textWidth <= maxWidth) {
                currentLine = testLine;
              } else {
                if (currentLine) {
                  lines.push(currentLine);
                  currentLine = word;
                } else {
                  lines.push(word); // Single word is too long, but we add it anyway
                }
              }
            }
            
            if (currentLine) {
              lines.push(currentLine);
            }
            
            // Draw each line
            lines.forEach((line, index) => {
              page.drawText(line, {
                x: element.x,
                y: pdfY - (index * fontSize * 1.2),
                size: fontSize,
                font: font,
                color: rgb(fillColor.r / 255, fillColor.g / 255, fillColor.b / 255),
              });
            });
          }
          break;
          
        case 'rectangle':
          const rectFillColor = hexToRgb(element.fill || '#3b82f6');
          const rectStrokeColor = hexToRgb(element.stroke || '#1e40af');
          
          // Draw filled rectangle
          page.drawRectangle({
            x: element.x,
            y: pdfY,
            width: element.width || 100,
            height: element.height || 60,
            color: rgb(rectFillColor.r / 255, rectFillColor.g / 255, rectFillColor.b / 255),
            borderColor: rgb(rectStrokeColor.r / 255, rectStrokeColor.g / 255, rectStrokeColor.b / 255),
            borderWidth: element.strokeWidth || 2,
          });
          break;
          
        case 'circle':
          const circleFillColor = hexToRgb(element.fill || '#ef4444');
          const circleStrokeColor = hexToRgb(element.stroke || '#dc2626');
          const radius = (element.width || 60) / 2;
          
          // Draw filled circle (using drawEllipse)
          page.drawEllipse({
            x: element.x + radius,
            y: pdfY + radius,
            xScale: radius,
            yScale: radius,
            color: rgb(circleFillColor.r / 255, circleFillColor.g / 255, circleFillColor.b / 255),
            borderColor: rgb(circleStrokeColor.r / 255, circleStrokeColor.g / 255, circleStrokeColor.b / 255),
            borderWidth: element.strokeWidth || 2,
          });
          break;
          
        case 'image':
          if (element.src) {
            try {
              // Convert base64 image to bytes
              const imageBytes = await fetch(element.src).then(res => res.arrayBuffer());
              
              let embeddedImage;
              if (element.src.includes('data:image/png')) {
                embeddedImage = await pdfDoc.embedPng(imageBytes);
              } else if (element.src.includes('data:image/jpg') || element.src.includes('data:image/jpeg')) {
                embeddedImage = await pdfDoc.embedJpg(imageBytes);
              } else {
                console.warn('Unsupported image format, skipping:', element.src);
                continue;
              }
              
              page.drawImage(embeddedImage, {
                x: element.x,
                y: pdfY,
                width: element.width || 200,
                height: element.height || 200,
              });
            } catch (error) {
              console.error('Failed to embed image:', error);
            }
          }
          break;
      }
    }
    
    // Serialize PDF and download
    const pdfBytes = await pdfDoc.save();
    
    // Create download link
    const blob = new Blob([pdfBytes], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    URL.revokeObjectURL(url);
    
    console.log('PDF exported successfully:', filename);
  } catch (error) {
    console.error('PDF export failed:', error);
    throw error;
  }
}

// Helper function to convert hex color to RGB
function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : { r: 0, g: 0, b: 0 };
}