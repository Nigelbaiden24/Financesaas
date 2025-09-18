import { saveAs } from 'file-saver';
import html2canvas from 'html2canvas';
import JSZip from 'jszip';
import pptx from 'pptxgenjs';
// Note: DOCX support will be added when the library is properly configured
// import { Document, Packer, Paragraph, TextRun } from 'docx';
import type { CanvasElement } from './PDFEditor';
import type { Stage } from 'konva/lib/Stage';

// Export formats type
export type ExportFormat = 'pdf' | 'png' | 'pptx' | 'docx';

export interface ExportOptions {
  format: ExportFormat;
  filename: string;
  elements: CanvasElement[];
  pages: { [pageIndex: number]: CanvasElement[] };
  currentPage: number;
  stage?: Stage;
  documentContent?: any;
}

// PNG Export - Single page or all pages
export async function exportToPNG(options: ExportOptions): Promise<void> {
  const { stage, filename, pages, currentPage } = options;
  
  if (!stage) {
    throw new Error('Canvas stage is required for PNG export');
  }

  try {
    if (Object.keys(pages).length > 1) {
      // Multi-page PNG export as ZIP
      const zip = new JSZip();
      
      for (const [pageIndex, elements] of Object.entries(pages)) {
        // Switch to each page and capture
        const canvas = stage.toCanvas({
          width: stage.width(),
          height: stage.height(),
          pixelRatio: 2 // High quality
        });
        
        const blob = await new Promise<Blob>((resolve) => {
          canvas.toBlob((blob) => resolve(blob!), 'image/png', 0.9);
        });
        
        zip.file(`page-${parseInt(pageIndex) + 1}.png`, blob);
      }
      
      const zipBlob = await zip.generateAsync({ type: 'blob' });
      saveAs(zipBlob, `${filename}.zip`);
    } else {
      // Single page PNG
      const canvas = stage.toCanvas({
        width: stage.width(),
        height: stage.height(),
        pixelRatio: 2
      });
      
      const blob = await new Promise<Blob>((resolve) => {
        canvas.toBlob((blob) => resolve(blob!), 'image/png', 0.9);
      });
      
      saveAs(blob, `${filename}.png`);
    }
  } catch (error) {
    console.error('PNG export failed:', error);
    throw new Error('Failed to export PNG');
  }
}

// PPTX Export - Convert canvas elements to PowerPoint
export async function exportToPPTX(options: ExportOptions): Promise<void> {
  const { filename, pages, documentContent } = options;
  
  try {
    const presentation = new pptx();
    presentation.layout = 'LAYOUT_16x9';
    
    // Add pages to presentation
    for (const [pageIndex, elements] of Object.entries(pages)) {
      const slide = presentation.addSlide();
      
      // Add title if available from document content
      if (documentContent?.cover?.companyName || documentContent?.cover?.reportTitle) {
        slide.addText(
          documentContent.cover.reportTitle || documentContent.cover.companyName || 'Document Title',
          {
            x: 0.5,
            y: 0.5,
            w: 8.5,
            h: 1,
            fontSize: 28,
            bold: true,
            color: '363636'
          }
        );
      }
      
      // Convert canvas elements to PowerPoint elements
      elements.forEach((element, index) => {
        if (element.type === 'text' && element.text) {
          slide.addText(element.text, {
            x: (element.x || 0) / 100, // Convert pixels to inches
            y: (element.y || 0) / 100,
            w: (element.width || 200) / 100,
            h: (element.height || 50) / 100,
            fontSize: element.fontSize || 12,
            color: element.fill?.replace('#', '') || '000000',
            fontFace: element.fontFamily || 'Arial'
          });
        }
        
        if (element.type === 'rectangle') {
          slide.addShape('rect', {
            x: (element.x || 0) / 100,
            y: (element.y || 0) / 100,
            w: (element.width || 100) / 100,
            h: (element.height || 100) / 100,
            fill: { color: element.fill?.replace('#', '') || 'FFFFFF' },
            line: element.stroke ? { color: element.stroke.replace('#', ''), width: element.strokeWidth || 1 } : undefined
          });
        }
      });
      
      // Add content sections if available
      if (documentContent?.sections && Array.isArray(documentContent.sections)) {
        documentContent.sections.forEach((section: any, sectionIndex: number) => {
          if (parseInt(pageIndex) === sectionIndex + 1) { // Match page to section
            slide.addText(section.title || `Section ${sectionIndex + 1}`, {
              x: 0.5,
              y: 2,
              w: 8.5,
              h: 0.8,
              fontSize: 20,
              bold: true,
              color: '2F4F4F'
            });
            
            if (section.content) {
              slide.addText(section.content, {
                x: 0.5,
                y: 3,
                w: 8.5,
                h: 4,
                fontSize: 14,
                color: '363636',
                valign: 'top'
              });
            }
          }
        });
      }
    }
    
    // Generate and save PPTX
    const pptxBlob = await presentation.writeFile();
    saveAs(pptxBlob, `${filename}.pptx`);
    
  } catch (error) {
    console.error('PPTX export failed:', error);
    throw new Error('Failed to export PPTX');
  }
}

// DOCX Export - Simple text-based conversion for now
export async function exportToDOCX(options: ExportOptions): Promise<void> {
  const { filename, documentContent, elements } = options;
  
  try {
    // Create a simple HTML structure for DOCX conversion
    let htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>${filename}</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; margin: 40px; }
          h1 { color: #2F4F4F; font-size: 24px; margin-bottom: 20px; }
          h2 { color: #2F4F4F; font-size: 20px; margin-top: 30px; margin-bottom: 15px; }
          p { margin-bottom: 15px; }
          .contact { margin-top: 40px; padding: 20px; background: #f9f9f9; }
        </style>
      </head>
      <body>
    `;
    
    // Add title
    if (documentContent?.cover?.companyName || documentContent?.cover?.reportTitle) {
      htmlContent += `<h1>${documentContent.cover.reportTitle || documentContent.cover.companyName || 'Document Title'}</h1>`;
    }
    
    // Add subtitle
    if (documentContent?.cover?.division || documentContent?.cover?.year) {
      htmlContent += `<p><strong>${documentContent.cover.division || ''} ${documentContent.cover.year || ''}</strong></p>`;
    }
    
    // Add sections
    if (documentContent?.sections && Array.isArray(documentContent.sections)) {
      documentContent.sections.forEach((section: any) => {
        htmlContent += `<h2>${section.title || 'Section'}</h2>`;
        if (section.content) {
          htmlContent += `<p>${section.content}</p>`;
        }
      });
    }
    
    // Add text elements from canvas
    elements.forEach((element) => {
      if (element.type === 'text' && element.text) {
        htmlContent += `<p style="font-size: ${element.fontSize || 12}px;">${element.text}</p>`;
      }
    });
    
    // Add contact details
    if (documentContent?.cover?.contactDetails) {
      const contact = documentContent.cover.contactDetails;
      htmlContent += '<div class="contact"><h2>Contact Information</h2>';
      if (contact.email) htmlContent += `<p>Email: ${contact.email}</p>`;
      if (contact.phone) htmlContent += `<p>Phone: ${contact.phone}</p>`;
      if (contact.address) htmlContent += `<p>Address: ${contact.address}</p>`;
      htmlContent += '</div>';
    }
    
    htmlContent += '</body></html>';
    
    // Create blob and download
    const blob = new Blob([htmlContent], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
    saveAs(blob, `${filename}.docx`);
    
  } catch (error) {
    console.error('DOCX export failed:', error);
    throw new Error('Failed to export DOCX');
  }
}

// Main export function
export async function exportMultiFormat(options: ExportOptions): Promise<void> {
  switch (options.format) {
    case 'png':
      await exportToPNG(options);
      break;
    case 'pptx':
      await exportToPPTX(options);
      break;
    case 'docx':
      await exportToDOCX(options);
      break;
    case 'pdf':
      // PDF export handled separately through existing system
      throw new Error('PDF export should use existing system');
    default:
      throw new Error(`Unsupported export format: ${options.format}`);
  }
}