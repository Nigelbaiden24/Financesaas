import React, { useState, useRef, useCallback } from 'react';
import { Stage, Layer, Text, Rect, Circle, Line, Image as KonvaImage, Transformer } from 'react-konva';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Type, 
  Square, 
  Circle as CircleIcon, 
  Image as ImageIcon, 
  Download, 
  Trash2, 
  Move,
  FileImage,
  FileSliders,
  FileText,
  Palette,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Bold,
  Italic,
  Minus,
  Plus,
  Copy,
  Eye,
  Edit,
  RefreshCw,
  BarChart3
} from 'lucide-react';
import { exportToPDF } from './PDFExporter.ts';
import { exportMultiFormat, type ExportFormat } from './MultiFormatExporter';
import { AIChartGenerator } from './AIChartGenerator';
import { 
  ExecutiveResumeTemplate, 
  SalesRepResumeTemplate, 
  InvoiceTemplate, 
  PitchDeckTemplate, 
  NewsletterTemplate, 
  ReportTemplate, 
  BrochureTemplate 
} from "../template-styles";

export interface CanvasElement {
  id: string;
  type: 'text' | 'rectangle' | 'circle' | 'image' | 'line' | 'chart';
  x: number;
  y: number;
  width?: number;
  height?: number;
  text?: string;
  fontSize?: number;
  fontFamily?: string;
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
  align?: string;
  fontStyle?: string;
  textDecoration?: string;
  image?: HTMLImageElement;
  src?: string;
  svgContent?: string; // For chart SVG content
  points?: number[]; // For line coordinates [x1, y1, x2, y2]
  draggable: boolean;
}

interface PDFEditorProps {
  initialContent?: any;
  documentId?: string;
  onSave?: (elements: CanvasElement[]) => void;
  serviceType?: string;
  templateName?: string;
}

export default function PDFEditor({ initialContent, documentId, onSave, serviceType, templateName }: PDFEditorProps) {
  // Store elements per page
  const [pages, setPages] = useState<{ [pageIndex: number]: CanvasElement[] }>({ 0: [] });
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [tool, setTool] = useState<'select' | 'text' | 'rectangle' | 'circle' | 'image' | 'line'>('select');
  const [isExporting, setIsExporting] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [showTemplatePreview, setShowTemplatePreview] = useState(true);
  const [isTemplateEditable, setIsTemplateEditable] = useState(false);
  const [showChartGenerator, setShowChartGenerator] = useState(false);
  
  // Get current page elements
  const elements = pages[currentPage] || [];
  const setElements = (newElements: CanvasElement[] | ((prev: CanvasElement[]) => CanvasElement[])) => {
    const elementsToSet = typeof newElements === 'function' ? newElements(elements) : newElements;
    setPages(prev => ({ ...prev, [currentPage]: elementsToSet }));
  };
  const [editableContent, setEditableContent] = useState(initialContent);
  const [htmlContentData, setHtmlContentData] = useState<any>(null); // HTML/JSON content for editing
  
  const stageRef = useRef<any>(null);
  const transformerRef = useRef<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Canvas dimensions (A4 size in pixels at 72 DPI)
  const canvasWidth = 595;
  const canvasHeight = 842;

  // Render template based on service type and content
  const renderTemplateComponent = () => {
    if (!editableContent) return null;

    // Check if we have HTML template content
    if (htmlContentData?.renderedHtml) {
      return (
        <div className="html-template-preview w-full h-full overflow-auto bg-white">
          <div 
            className="template-content p-4"
            dangerouslySetInnerHTML={{ __html: htmlContentData.renderedHtml }}
          />
          {isTemplateEditable && (
            <div className="template-edit-overlay absolute top-2 right-2 bg-blue-600 text-white px-3 py-1 rounded text-xs">
              HTML Template - Click elements to edit
            </div>
          )}
        </div>
      );
    }

    // Use HTML content data when available for editing, fallback to regular content
    const contentToUse = (isTemplateEditable && htmlContentData?.templateData) ? htmlContentData.templateData : editableContent;
    
    console.log('🎨 Template rendering with content:', {
      isTemplateEditable,
      hasHtmlContentData: !!htmlContentData,
      hasEditableContent: !!editableContent,
      contentToUse: !!contentToUse,
      contentType: typeof contentToUse,
      serviceType,
      templateName
    });
    
    const templateProps = {
      data: contentToUse,
      content: contentToUse,
      title: contentToUse?.title || editableContent?.title || 'Document',
      isEditor: true,
      isEditable: isTemplateEditable,
      onContentChange: handleContentChange || setEditableContent
    };

    // Determine which template to render based on service type or template name
    if (serviceType === 'resume-generator' || templateName?.toLowerCase().includes('resume')) {
      if (templateName?.toLowerCase().includes('executive')) {
        return <ExecutiveResumeTemplate {...templateProps} />;
      }
      return <SalesRepResumeTemplate {...templateProps} />;
    }
    
    if (serviceType === 'report-generator' || templateName?.toLowerCase().includes('report')) {
      return <ReportTemplate {...templateProps} />;
    }
    
    if (serviceType === 'invoice-generator' || templateName?.toLowerCase().includes('invoice')) {
      return <InvoiceTemplate {...templateProps} />;
    }
    
    if (serviceType === 'pitch-deck' || templateName?.toLowerCase().includes('pitch')) {
      return <PitchDeckTemplate {...templateProps} />;
    }
    
    if (serviceType === 'newsletter-creator' || templateName?.toLowerCase().includes('newsletter')) {
      return <NewsletterTemplate {...templateProps} />;
    }
    
    if (serviceType === 'brochure-designer' || templateName?.toLowerCase().includes('brochure')) {
      return <BrochureTemplate {...templateProps} />;
    }

    // Default fallback template
    return <ReportTemplate {...templateProps} />;
  };

  // Fetch HTML content when in template edit mode
  const fetchHTMLContent = async () => {
    if (documentId && isTemplateEditable) {
      try {
        const response = await fetch(`/api/documents/${documentId}`);
        const document = await response.json();
        
        if (document.htmlContent) {
          const parsedHtmlContent = typeof document.htmlContent === 'string' ? JSON.parse(document.htmlContent) : document.htmlContent;
          setHtmlContentData(parsedHtmlContent);
          console.log('📄 HTML content loaded for editing:', parsedHtmlContent);
          
          // Use HTML content for editing if available
          if (parsedHtmlContent.renderedHtml) {
            console.log('🎨 Using rendered HTML template for display');
            setEditableContent(parsedHtmlContent.templateData || initialContent);
          } else {
            setEditableContent(parsedHtmlContent.templateData || initialContent);
          }
        } else {
          console.log('⚠️ No HTML content found, using original content for editing');
        }
      } catch (error) {
        console.error('Failed to fetch HTML content:', error);
        // Fallback to regular content
        setEditableContent(initialContent);
      }
    }
  };

  // Update HTML content on server when user edits
  const updateHTMLContent = async (fieldPath: string, newValue: string) => {
    if (documentId) {
      try {
        const response = await fetch(`/api/documents/${documentId}/html-content`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            fieldPath,
            newValue
          })
        });

        if (response.ok) {
          console.log('HTML content updated successfully');
        }
      } catch (error) {
        console.error('Failed to update HTML content:', error);
      }
    }
  };

  // Enhanced content change handler for dual content system
  const handleContentChange = (newData: any) => {
    setEditableContent(newData);
    
    // If we have HTML content data, track what changed and update server
    if (htmlContentData && isTemplateEditable) {
      // Find what changed and update specific fields
      // This is a simplified approach - in practice you'd want more sophisticated diffing
      if (newData !== editableContent) {
        console.log('Content changed, updating HTML content...');
      }
    }
  };

  // Initialize with content from generated document
  React.useEffect(() => {
    console.log('🚀 Initializing canvas with content:', { 
      hasInitialContent: !!initialContent, 
      pagesCount: Object.keys(pages).length,
      currentPage,
      elementsOnCurrentPage: elements.length
    });
    if (initialContent && Object.keys(pages).length === 0) {
      setEditableContent(initialContent);
      const initialElements = convertContentToElements(initialContent);
      console.log('📝 Created initial elements for canvas:', initialElements.length, 'elements');
      setPages({ 0: initialElements });
      console.log('✅ Pages state updated with initial elements');
    }
  }, [initialContent]);

  // Auto-populate canvas when switching to canvas editor if content exists but no elements
  React.useEffect(() => {
    if (!showTemplatePreview && initialContent && elements.length === 0) {
      console.log('🎨 Auto-populating canvas editor with content...');
      const newElements = convertContentToElements(initialContent);
      if (newElements.length > 0) {
        setPages(prev => ({ ...prev, [currentPage]: newElements }));
        console.log('✅ Auto-populated canvas with', newElements.length, 'elements');
      }
    }
  }, [showTemplatePreview, initialContent, elements.length, currentPage]);

  // Fetch HTML content when entering edit mode
  React.useEffect(() => {
    if (isTemplateEditable && documentId) {
      console.log('📄 Fetching HTML content for editing mode...');
      fetchHTMLContent();
    }
  }, [isTemplateEditable, documentId]);

  // Debug: Log current state
  React.useEffect(() => {
    console.log('🔍 PDFEditor Debug State:', {
      hasInitialContent: !!initialContent,
      hasEditableContent: !!editableContent,
      hasHtmlContentData: !!htmlContentData,
      isTemplateEditable,
      showTemplatePreview,
      documentId,
      serviceType,
      templateName
    });
  }, [initialContent, editableContent, htmlContentData, isTemplateEditable, showTemplatePreview]);

  // Convert generated document content to canvas elements
  const convertContentToElements = (content: any): CanvasElement[] => {
    console.log('🔄 Converting content to canvas elements:', content);
    const newElements: CanvasElement[] = [];
    let yPosition = 50;

    // Prioritize HTML content data if available for more structured editing
    const sourceContent = htmlContentData?.templateData || content;

    // Handle empty or invalid content
    if (!sourceContent || typeof sourceContent !== 'object') {
      return [{
        id: `placeholder-${Date.now()}`,
        type: 'text',
        x: 50,
        y: yPosition,
        text: 'Click to edit this document',
        fontSize: 16,
        fontFamily: 'Arial',
        fill: '#666666',
        draggable: true
      }];
    }

    // Add logo if available
    const logoPath = sourceContent.cover?.logo || sourceContent.logo;
    if (logoPath) {
      console.log('📸 Adding logo to canvas:', logoPath);
      // Create logo image element
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        setPages((prevPages: Record<number, CanvasElement[]>) => {
          const currentElements = prevPages[0] || [];
          const logoExists = currentElements.some((el: CanvasElement) => el.id.startsWith('logo-'));
          if (!logoExists) {
            return {
              ...prevPages,
              0: [{
                id: `logo-${Date.now()}`,
                type: 'image',
                x: canvasWidth - 150, // Position in top right
                y: 20,
                width: 100,
                height: 60,
                image: img,
                src: logoPath,
                draggable: true
              }, ...currentElements]
            };
          }
          return prevPages;
        });
      };
      img.onerror = (error) => console.error('❌ Logo load error:', error);
      img.src = logoPath.startsWith('http') ? logoPath : `${window.location.origin}${logoPath}`;
    }

    // Add company name/title from cover or content
    const title = sourceContent.cover?.companyName || 
                  sourceContent.cover?.reportTitle || 
                  sourceContent.title || 
                  sourceContent.personalInfo?.name ||
                  'Document Title';
    
    if (title) {
      newElements.push({
        id: `title-${Date.now()}`,
        type: 'text',
        x: 50,
        y: yPosition,
        text: title,
        fontSize: 28,
        fontFamily: 'Arial',
        fill: '#000000',
        fontStyle: 'bold',
        draggable: true
      });
      yPosition += 60;
    }

    // Add subtitle/division if available
    const subtitle = sourceContent.cover?.division || sourceContent.cover?.year || sourceContent.subtitle;
    if (subtitle) {
      newElements.push({
        id: `subtitle-${Date.now()}`,
        type: 'text',
        x: 50,
        y: yPosition,
        text: subtitle,
        fontSize: 18,
        fontFamily: 'Arial',
        fill: '#666666',
        draggable: true
      });
      yPosition += 40;
    }

    // Handle personal info for CVs
    if (sourceContent.personalInfo) {
      const personalInfo = sourceContent.personalInfo;
      const contactInfo = `${personalInfo.email || ''} | ${personalInfo.phone || ''} | ${personalInfo.location || ''}`.replace(/^\||\|$/g, '').trim();
      
      if (contactInfo) {
        newElements.push({
          id: `contact-${Date.now()}`,
          type: 'text',
          x: 50,
          y: yPosition,
          text: contactInfo,
          fontSize: 12,
          fontFamily: 'Arial',
          fill: '#666666',
          draggable: true
        });
        yPosition += 30;
      }
    }

    // Add sections content with better structure preservation
    if (sourceContent.sections && Array.isArray(sourceContent.sections)) {
      sourceContent.sections.forEach((section: any, index: number) => {
        // Section title
        const sectionTitle = section.title || section.type?.replace('_', ' ').toUpperCase() || `Section ${index + 1}`;
        newElements.push({
          id: `section-title-${index}-${Date.now()}`,
          type: 'text',
          x: 50,
          y: yPosition,
          text: sectionTitle,
          fontSize: 20,
          fontFamily: 'Arial',
          fill: '#333333',
          fontStyle: 'bold',
          draggable: true
        });
        yPosition += 40;

        // Section content with better formatting
        let contentText = '';
        if (typeof section.content === 'string') {
          contentText = section.content;
        } else if (Array.isArray(section.content)) {
          contentText = section.content.map((item: any) => {
            if (typeof item === 'string') return item;
            if (item.company && item.position) return `${item.position} at ${item.company}`;
            return JSON.stringify(item);
          }).join('\n\n');
        } else if (section.content && typeof section.content === 'object') {
          contentText = Object.values(section.content).join(' ');
        }

        // Limit content length but preserve readability
        const maxLength = yPosition > 600 ? 150 : 300; // Less content if we're lower on the page
        const truncatedContent = contentText.length > maxLength 
          ? contentText.substring(0, maxLength).trim() + '...' 
          : contentText;

        if (truncatedContent) {
          newElements.push({
            id: `section-content-${index}-${Date.now()}`,
            type: 'text',
            x: 50,
            y: yPosition,
            width: 495,
            text: truncatedContent,
            fontSize: 12,
            fontFamily: 'Arial',
            fill: '#666666',
            draggable: true
          });
          
          // Calculate height based on text length and width
          const lineHeight = 16;
          const charsPerLine = Math.floor(495 / 7); // Rough estimate
          const lines = Math.ceil(truncatedContent.length / charsPerLine);
          yPosition += Math.max(40, lines * lineHeight + 20);
        }
      });
    }

    // Handle other content types (skills, experience, etc.)
    ['skills', 'experience', 'education', 'summary'].forEach((field) => {
      if (content[field] && (Array.isArray(content[field]) || typeof content[field] === 'string')) {
        newElements.push({
          id: `${field}-title-${Date.now()}`,
          type: 'text',
          x: 50,
          y: yPosition,
          text: field.charAt(0).toUpperCase() + field.slice(1),
          fontSize: 18,
          fontFamily: 'Arial',
          fill: '#333333',
          fontStyle: 'bold',
          draggable: true
        });
        yPosition += 35;

        let fieldContent = '';
        if (Array.isArray(content[field])) {
          fieldContent = content[field].join(', ');
        } else {
          fieldContent = content[field];
        }

        if (fieldContent) {
          newElements.push({
            id: `${field}-content-${Date.now()}`,
            type: 'text',
            x: 50,
            y: yPosition,
            width: 495,
            text: fieldContent.substring(0, 200) + (fieldContent.length > 200 ? '...' : ''),
            fontSize: 12,
            fontFamily: 'Arial',
            fill: '#666666',
            draggable: true
          });
          yPosition += 60;
        }
      }
    });

    console.log(`✅ Generated ${newElements.length} canvas elements`);
    return newElements;
  };

  // Handle stage click for adding elements
  const handleStageClick = useCallback((e: any) => {
    if (tool === 'select') {
      const clickedOnEmpty = e.target === e.target.getStage();
      if (clickedOnEmpty) {
        setSelectedId(null);
      }
      return;
    }

    const pos = e.target.getStage().getPointerPosition();
    const newElement: CanvasElement = {
      id: `${tool}-${Date.now()}`,
      type: tool as any,
      x: pos.x,
      y: pos.y,
      draggable: true
    };

    switch (tool) {
      case 'text':
        newElement.text = 'Double click to edit';
        newElement.fontSize = 16;
        newElement.fontFamily = 'Arial';
        newElement.fill = '#000000';
        break;
      case 'rectangle':
        newElement.width = 100;
        newElement.height = 60;
        newElement.fill = '#3b82f6';
        newElement.stroke = '#1e40af';
        newElement.strokeWidth = 2;
        break;
      case 'circle':
        newElement.width = 60;
        newElement.height = 60;
        newElement.fill = '#ef4444';
        newElement.stroke = '#dc2626';
        newElement.strokeWidth = 2;
        break;
      case 'line':
        newElement.points = [pos.x, pos.y, pos.x + 100, pos.y];
        newElement.stroke = '#000000';
        newElement.strokeWidth = 2;
        break;
    }

    setElements((prev: CanvasElement[]) => [...prev, newElement]);
    setTool('select');
  }, [tool]);

  // Handle element selection
  const handleElementClick = useCallback((id: string) => {
    setSelectedId(id);
  }, []);

  // Handle element drag
  const handleElementDragEnd = useCallback((id: string, newAttrs: any) => {
    setElements((prev: CanvasElement[]) =>
      prev.map((el: CanvasElement) => el.id === id ? { ...el, x: newAttrs.x, y: newAttrs.y } : el)
    );
  }, []);

  // Handle element transform
  const handleElementTransform = useCallback((id: string, newAttrs: any) => {
    setElements((prev: CanvasElement[]) =>
      prev.map((el: CanvasElement) => el.id === id ? { ...el, ...newAttrs } : el)
    );
  }, []);

  // Delete selected element
  const deleteSelectedElement = useCallback(() => {
    if (selectedId) {
      setElements((prev: CanvasElement[]) => prev.filter((el: CanvasElement) => el.id !== selectedId));
      setSelectedId(null);
    }
  }, [selectedId]);

  // Handle text double click for editing
  const handleTextDblClick = useCallback((id: string) => {
    const element = elements.find(el => el.id === id);
    if (element && element.type === 'text') {
      const newText = prompt('Edit text:', element.text);
      if (newText !== null) {
        setElements((prev: CanvasElement[]) =>
          prev.map((el: CanvasElement) => el.id === id ? { ...el, text: newText } : el)
        );
      }
    }
  }, [elements]);

  // Handle image upload
  const handleImageUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new window.Image();
        img.onload = () => {
          const newElement: CanvasElement = {
            id: `image-${Date.now()}`,
            type: 'image',
            x: 100,
            y: 100,
            width: Math.min(200, img.width),
            height: Math.min(200 * (img.height / img.width), 200),
            image: img,
            src: e.target?.result as string,
            draggable: true
          };
          setElements((prev: CanvasElement[]) => [...prev, newElement]);
        };
        img.src = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  }, []);

  // Update selected element properties
  const updateSelectedElement = useCallback((updates: Partial<CanvasElement>) => {
    if (selectedId) {
      setElements((prev: CanvasElement[]) =>
        prev.map((el: CanvasElement) => el.id === selectedId ? { ...el, ...updates } : el)
      );
    }
  }, [selectedId]);

  // Multi-format export handlers
  const handleExportPDF = useCallback(async () => {
    setIsExporting(true);
    try {
      // Use the backend PDF generation with logo support
      if (documentId) {
        const response = await fetch(`/api/documents/${documentId}/download`, {
          method: 'GET',
          credentials: 'include'
        });
        
        if (response.ok) {
          const blob = await response.blob();
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `document-${documentId}.pdf`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(url);
        } else {
          throw new Error('Failed to generate PDF from server');
        }
      } else {
        // Fallback to canvas export for standalone usage
        if (stageRef.current) {
          await exportToPDF(stageRef.current, elements, `document-${Date.now()}.pdf`);
        }
      }
    } catch (error) {
      console.error('Failed to export PDF:', error);
      alert('Failed to export PDF. Please try again.');
    } finally {
      setIsExporting(false);
    }
  }, [elements, documentId]);

  const handleMultiFormatExport = useCallback(async (format: ExportFormat) => {
    setIsExporting(true);
    try {
      const filename = `document-${documentId || Date.now()}`;
      
      await exportMultiFormat({
        format,
        filename,
        elements,
        pages,
        currentPage,
        stage: stageRef.current || undefined,
        documentContent: initialContent
      });
      
      alert(`Successfully exported ${format.toUpperCase()} file!`);
    } catch (error) {
      console.error(`Failed to export ${format}:`, error);
      alert(`Failed to export ${format.toUpperCase()}. Please try again.`);
    } finally {
      setIsExporting(false);
    }
  }, [elements, pages, currentPage, documentId, initialContent]);

  // Template editing handlers
  const handleTemplateClick = useCallback((e: React.MouseEvent) => {
    if (!isTemplateEditable) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Deselect current element
    setSelectedId(null);
    
    // If a tool is selected, create new element at click position
    if (tool !== 'select') {
      const newElement: CanvasElement = {
        id: `${tool}-${Date.now()}`,
        type: tool,
        x,
        y,
        draggable: true,
        ...(tool === 'text' && {
          text: 'Double-click to edit',
          fontSize: 16,
          fontFamily: 'Arial',
          fill: '#000000',
          width: 200,
          height: 30
        }),
        ...(tool === 'rectangle' && {
          width: 100,
          height: 80,
          fill: '#3b82f6',
          stroke: '#1e40af',
          strokeWidth: 2
        }),
        ...(tool === 'circle' && {
          width: 80,
          height: 80,
          fill: '#3b82f6',
          stroke: '#1e40af',
          strokeWidth: 2
        }),
        ...(tool === 'line' && {
          points: [0, 0, 100, 0],
          stroke: '#000000',
          strokeWidth: 2
        })
      };
      
      setElements((prev: CanvasElement[]) => [...prev, newElement]);
      setTool('select');
    }
  }, [isTemplateEditable, tool]);

  // Clear canvas elements when switching between modes to prevent overlap
  React.useEffect(() => {
    if (showTemplatePreview && isTemplateEditable) {
      // Clear canvas elements when entering template edit mode
      setElements([]);
      setSelectedId(null);
    }
  }, [showTemplatePreview, isTemplateEditable]);

  // Enhanced template editing with better field detection
  const handleTemplateDoubleClick = useCallback((e: React.MouseEvent) => {
    if (!isTemplateEditable) return;
    e.stopPropagation();
    
    const target = e.target as HTMLElement;
    const textContent = target.textContent || '';
    
    // Check if this is an editable element
    if (target.tagName === 'H1' || target.tagName === 'H2' || target.tagName === 'H3' || 
        target.tagName === 'P' || target.tagName === 'SPAN' || target.tagName === 'DIV' ||
        target.tagName === 'LI' || textContent.trim()) {
      
      // Get the data attribute or class that identifies this field
      const dataField = target.getAttribute('data-field');
      const className = target.className;
      
      const newText = prompt('Edit text:', textContent);
      if (newText !== null) {
        target.textContent = newText;
        
        // Update editable content with comprehensive field mapping
        setEditableContent((prev: any) => {
          const updated = { ...prev };
          
          // Enhanced field detection
          if (dataField === 'name' || className.includes('name') || textContent.includes('Jennifer Walsh')) {
            if (!updated.personalInfo) updated.personalInfo = {};
            updated.personalInfo.name = newText;
          } else if (dataField === 'title' || className.includes('title') || textContent.includes('Chief Technology')) {
            if (!updated.personalInfo) updated.personalInfo = {};
            updated.personalInfo.title = newText;
          } else if (dataField === 'email' || className.includes('email') || textContent.includes('@')) {
            if (!updated.personalInfo) updated.personalInfo = {};
            updated.personalInfo.email = newText;
          } else if (dataField === 'phone' || className.includes('phone') || textContent.includes('+1-') || textContent.includes('555')) {
            if (!updated.personalInfo) updated.personalInfo = {};
            updated.personalInfo.phone = newText;
          } else if (dataField === 'location' || className.includes('location') || textContent.includes('San Francisco')) {
            if (!updated.personalInfo) updated.personalInfo = {};
            updated.personalInfo.location = newText;
          } else if (dataField === 'summary' || className.includes('summary') || textContent.includes('Dynamic and results-driven')) {
            updated.summary = newText;
          } else if (dataField?.includes('experience') || className.includes('experience')) {
            // Handle experience items
            if (!updated.experience) updated.experience = [];
            const expIndex = parseInt(dataField?.split('-')[1] || '0');
            const expField = dataField?.split('-')[2];
            
            if (updated.experience[expIndex]) {
              if (expField === 'company') updated.experience[expIndex].company = newText;
              else if (expField === 'position') updated.experience[expIndex].position = newText;
              else if (expField === 'duration') updated.experience[expIndex].duration = newText;
              else if (expField === 'achievements') updated.experience[expIndex].achievements = newText;
            }
          } else if (dataField?.includes('education') || className.includes('education')) {
            // Handle education items
            if (!updated.education) updated.education = [];
            const eduIndex = parseInt(dataField?.split('-')[1] || '0');
            const eduField = dataField?.split('-')[2];
            
            if (updated.education[eduIndex]) {
              if (eduField === 'institution') updated.education[eduIndex].institution = newText;
              else if (eduField === 'degree') updated.education[eduIndex].degree = newText;
              else if (eduField === 'year') updated.education[eduIndex].year = newText;
            }
          } else if (dataField?.includes('skills') || className.includes('skills')) {
            // Handle individual skill items
            if (!updated.skills) updated.skills = [];
            const skillIndex = parseInt(dataField?.split('-')[1] || '0');
            if (updated.skills[skillIndex] !== undefined) {
              updated.skills[skillIndex] = newText;
            }
          } else if (dataField?.includes('certification') || className.includes('certification')) {
            // Handle certifications
            if (!updated.certifications) updated.certifications = [];
            const certIndex = parseInt(dataField?.split('-')[1] || '0');
            if (updated.certifications[certIndex] !== undefined) {
              updated.certifications[certIndex] = newText;
            }
          }
          
          return updated;
        });
      }
    }
  }, [isTemplateEditable]);

  // Chart generation handler
  const handleChartGenerated = useCallback((chartSvg: string) => {
    const newChartElement: CanvasElement = {
      id: `chart-${Date.now()}`,
      type: 'chart',
      x: 100,
      y: 100,
      width: 400,
      height: 300,
      svgContent: chartSvg,
      draggable: true
    };
    
    setElements((prev: CanvasElement[]) => [...prev, newChartElement]);
    setShowChartGenerator(false);
  }, []);

  // Get selected element for property panel
  const selectedElement = elements.find(el => el.id === selectedId);

  // Update transformer
  React.useEffect(() => {
    if (selectedId && transformerRef.current) {
      const selectedNode = stageRef.current?.findOne(`#${selectedId}`);
      if (selectedNode) {
        transformerRef.current.nodes([selectedNode]);
        transformerRef.current.getLayer().batchDraw();
      }
    } else if (transformerRef.current) {
      transformerRef.current.nodes([]);
      transformerRef.current.getLayer().batchDraw();
    }
  }, [selectedId]);

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header with Editor Mode Toggle */}
      <div className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex gap-2 items-center justify-between">
          <div className="flex gap-2 items-center">
            <Button
              variant={showTemplatePreview ? "default" : "outline"}
              onClick={() => setShowTemplatePreview(true)}
              className="flex items-center gap-2"
            >
              <Eye className="w-4 h-4" />
              Template View
            </Button>
            <Button
              variant={!showTemplatePreview ? "default" : "outline"}
              onClick={() => {
                setShowTemplatePreview(false);
                // Auto-load content when switching to canvas editor
                if (initialContent && elements.length === 0) {
                  console.log('🎨 Auto-loading content to canvas editor...');
                  const newElements = convertContentToElements(initialContent);
                  setPages({ [currentPage]: newElements });
                }
              }}
              className="flex items-center gap-2"
            >
              <Edit className="w-4 h-4" />
              Canvas Editor
            </Button>
          </div>
          
          {/* Template Edit Toggle - only show in Template View */}
          {showTemplatePreview && (
            <Button
              variant={isTemplateEditable ? "default" : "outline"}
              onClick={() => setIsTemplateEditable(!isTemplateEditable)}
              className="flex items-center gap-2"
            >
              <Edit className="w-4 h-4" />
              {isTemplateEditable ? 'Exit Edit Mode' : 'Edit Template'}
            </Button>
          )}
        </div>
      </div>

      <div className="flex flex-1">
        {/* Sidebar - Show for Canvas Editor or Template Edit Mode */}
        {(!showTemplatePreview || isTemplateEditable) && (
          <div className="w-64 bg-white border-r border-gray-200 p-4 overflow-y-auto max-h-screen">
        <h3 className="text-lg font-semibold mb-4">
          {showTemplatePreview ? 'Template Editor' : 'PDF Editor'}
        </h3>
        
        {/* Tools */}
        <div className="space-y-2 mb-6">
          <Label className="text-sm font-medium">Tools</Label>
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant={tool === 'select' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTool('select')}
              className="flex items-center gap-2"
            >
              <Move className="w-4 h-4" />
              Select
            </Button>
            <Button
              variant={tool === 'text' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTool('text')}
              className="flex items-center gap-2"
            >
              <Type className="w-4 h-4" />
              Text
            </Button>
            <Button
              variant={tool === 'rectangle' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTool('rectangle')}
              className="flex items-center gap-2"
            >
              <Square className="w-4 h-4" />
              Box
            </Button>
            <Button
              variant={tool === 'circle' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTool('circle')}
              className="flex items-center gap-2"
            >
              <CircleIcon className="w-4 h-4" />
              Circle
            </Button>
            <Button
              variant={tool === 'line' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTool('line')}
              className="flex items-center gap-2"
            >
              <Minus className="w-4 h-4" />
              Line
            </Button>
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            className="w-full flex items-center gap-2"
          >
            <ImageIcon className="w-4 h-4" />
            Add Image
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowChartGenerator(!showChartGenerator)}
            className="w-full flex items-center gap-2"
          >
            <BarChart3 className="w-4 h-4" />
            AI Chart/Graph Generator
          </Button>
          
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
          />
        </div>

        {/* AI Chart Generator Panel */}
        {showChartGenerator && (
          <div className="mt-6 border-t pt-4">
            <AIChartGenerator 
              onChartGenerated={handleChartGenerated}
              onClose={() => setShowChartGenerator(false)}
            />
          </div>
        )}

        {/* Properties Panel */}
        {selectedElement && (
          <Card className="p-4 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">Properties</h4>
              <Button
                variant="destructive"
                size="sm"
                onClick={deleteSelectedElement}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>

            {selectedElement.type === 'text' && (
              <>
                <div>
                  <Label htmlFor="fontSize">Font Size</Label>
                  <Input
                    id="fontSize"
                    type="number"
                    value={selectedElement.fontSize || 16}
                    onChange={(e) => updateSelectedElement({ fontSize: parseInt(e.target.value) })}
                    min="8"
                    max="72"
                  />
                </div>
                
                <div>
                  <Label htmlFor="textColor">Text Color</Label>
                  <Input
                    id="textColor"
                    type="color"
                    value={selectedElement.fill || '#000000'}
                    onChange={(e) => updateSelectedElement({ fill: e.target.value })}
                  />
                </div>

                <div className="flex gap-2">
                  <Button
                    variant={selectedElement.fontStyle?.includes('bold') ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => {
                      const isBold = selectedElement.fontStyle?.includes('bold');
                      updateSelectedElement({ 
                        fontStyle: isBold ? 'normal' : 'bold'
                      });
                    }}
                  >
                    <Bold className="w-4 h-4" />
                  </Button>
                  
                  <Button
                    variant={selectedElement.fontStyle?.includes('italic') ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => {
                      const isItalic = selectedElement.fontStyle?.includes('italic');
                      updateSelectedElement({ 
                        fontStyle: isItalic ? 'normal' : 'italic'
                      });
                    }}
                  >
                    <Italic className="w-4 h-4" />
                  </Button>
                </div>
              </>
            )}

            {(selectedElement.type === 'rectangle' || selectedElement.type === 'circle') && (
              <>
                <div>
                  <Label htmlFor="fillColor">Fill Color</Label>
                  <Input
                    id="fillColor"
                    type="color"
                    value={selectedElement.fill || '#3b82f6'}
                    onChange={(e) => updateSelectedElement({ fill: e.target.value })}
                  />
                </div>
                
                <div>
                  <Label htmlFor="strokeColor">Border Color</Label>
                  <Input
                    id="strokeColor"
                    type="color"
                    value={selectedElement.stroke || '#1e40af'}
                    onChange={(e) => updateSelectedElement({ stroke: e.target.value })}
                  />
                </div>
                
                <div>
                  <Label htmlFor="strokeWidth">Border Width</Label>
                  <Input
                    id="strokeWidth"
                    type="number"
                    value={selectedElement.strokeWidth || 2}
                    onChange={(e) => updateSelectedElement({ strokeWidth: parseInt(e.target.value) })}
                    min="0"
                    max="10"
                  />
                </div>
              </>
            )}

            {selectedElement.type === 'line' && (
              <>
                <div>
                  <Label htmlFor="lineColor">Line Color</Label>
                  <Input
                    id="lineColor"
                    type="color"
                    value={selectedElement.stroke || '#000000'}
                    onChange={(e) => updateSelectedElement({ stroke: e.target.value })}
                  />
                </div>
                
                <div>
                  <Label htmlFor="lineWidth">Line Width</Label>
                  <Input
                    id="lineWidth"
                    type="number"
                    value={selectedElement.strokeWidth || 2}
                    onChange={(e) => updateSelectedElement({ strokeWidth: parseInt(e.target.value) })}
                    min="1"
                    max="20"
                  />
                </div>
              </>
            )}
          </Card>
        )}

        {/* Page Management - Clean Layout */}
        <Card className="p-3 space-y-3 mb-4">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium text-gray-700">
              Page {currentPage + 1} of {totalPages}
            </Label>
            <div className="flex gap-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const newPageIndex = totalPages;
                  setTotalPages(prev => prev + 1);
                  setCurrentPage(newPageIndex); // Switch to new page
                  setPages(prev => ({ ...prev, [newPageIndex]: [] }));
                }}
                className="flex items-center gap-1 text-xs"
              >
                <Plus className="w-3 h-3" />
                Add
              </Button>
              {totalPages > 1 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    if (totalPages > 1) {
                      const newPages = { ...pages };
                      delete newPages[totalPages - 1];
                      setPages(newPages);
                      setTotalPages(prev => prev - 1);
                      if (currentPage >= totalPages - 1) {
                        setCurrentPage(totalPages - 2);
                      }
                    }
                  }}
                  className="flex items-center gap-1 text-xs"
                >
                  <Minus className="w-3 h-3" />
                  Delete
                </Button>
              )}
            </div>
          </div>
          
          <div className="flex gap-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
              disabled={currentPage === 0}
              className="flex-1 text-xs"
            >
              ← Prev
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(Math.min(totalPages - 1, currentPage + 1))}
              disabled={currentPage === totalPages - 1}
              className="flex-1 text-xs"
            >
              Next →
            </Button>
          </div>
        </Card>

        {/* Multi-Format Export */}
        <div className="mt-6 space-y-2">
          <Label className="text-sm font-medium">Export Document</Label>
          
          {/* PDF Export - Primary */}
          <Button 
            onClick={handleExportPDF}
            disabled={isExporting}
            className="w-full flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            {isExporting ? 'Exporting...' : 'Download PDF'}
          </Button>
          
          {/* Other Format Exports */}
          <div className="grid grid-cols-3 gap-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleMultiFormatExport('png')}
              disabled={isExporting}
              className="flex flex-col items-center gap-1 py-3 text-xs"
            >
              <FileImage className="w-4 h-4" />
              PNG
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleMultiFormatExport('pptx')}
              disabled={isExporting}
              className="flex flex-col items-center gap-1 py-3 text-xs"
            >
              <FileSliders className="w-4 h-4" />
              PPTX
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleMultiFormatExport('docx')}
              disabled={isExporting}
              className="flex flex-col items-center gap-1 py-3 text-xs"
            >
              <FileText className="w-4 h-4" />
              DOCX
            </Button>
          </div>
          
          {onSave && (
            <Button 
              variant="outline"
              onClick={() => {
                // Save all pages data
                const allPagesElements = Object.values(pages).flat();
                onSave(allPagesElements);
              }}
              className="w-full"
            >
              Save Changes
            </Button>
          )}
        </div>
          </div>
        )}

        {/* Main Editor Area */}
        <div className="flex-1 p-4 overflow-auto max-h-screen">
          {showTemplatePreview ? (
            /* Template Preview with Full Document Scrolling */
            <div className="bg-white shadow-lg mx-auto max-w-4xl relative">
              <div className="border border-gray-200 rounded-lg overflow-visible">
                <div 
                  className="min-h-screen"
                  style={{ 
                    minHeight: '297mm', // A4 height
                    width: '100%',
                    overflowY: 'visible' // Allow full content to show
                  }}
                >
                  {renderTemplateComponent()}
                </div>
                
                {/* Template Edit Mode Overlay */}
                {isTemplateEditable && (
                  <div 
                    className="absolute inset-0 bg-blue-50 bg-opacity-10"
                    style={{ zIndex: 10 }}
                  >
                    {/* Edit indicators */}
                    <div className="absolute top-2 left-2 bg-blue-600 text-white text-xs px-2 py-1 rounded z-30">
                      🎯 Template Edit Mode Active
                    </div>
                    <div className="absolute top-2 right-2 bg-green-600 text-white text-xs px-2 py-1 rounded z-30">
                      💡 Click any text to make it editable
                    </div>
                    <div className="absolute bottom-2 left-2 bg-purple-600 text-white text-xs px-2 py-1 rounded z-30">
                      🛠️ Use sidebar tools to add elements
                    </div>
                    
                    {/* Canvas for new elements only */}
                    <Stage
                      ref={stageRef}
                      width={800}
                      height={1100}
                      className="absolute inset-0"
                      style={{ zIndex: 20 }}
                      onClick={handleStageClick}
                      onTap={handleStageClick}
                    >
                      <Layer>
                        {/* Only render newly added elements, not template content */}
                        {elements.map((element) => {
                          const commonProps = {
                            key: element.id,
                            id: element.id,
                            x: element.x,
                            y: element.y,
                            draggable: element.draggable,
                            onClick: () => handleElementClick(element.id),
                            onTap: () => handleElementClick(element.id),
                            onDragEnd: (e: any) => handleElementDragEnd(element.id, e.target.attrs),
                            onTransformEnd: (e: any) => handleElementTransform(element.id, e.target.attrs),
                          };

                          switch (element.type) {
                            case 'text':
                              return (
                                <Text
                                  {...commonProps}
                                  text={element.text}
                                  fontSize={element.fontSize}
                                  fontFamily={element.fontFamily}
                                  fill={element.fill}
                                  width={element.width}
                                  align={element.align}
                                  fontStyle={element.fontStyle}
                                  textDecoration={element.textDecoration}
                                  onDblClick={() => handleTextDblClick(element.id)}
                                  onDblTap={() => handleTextDblClick(element.id)}
                                />
                              );
                            
                            case 'rectangle':
                              return (
                                <Rect
                                  {...commonProps}
                                  width={element.width}
                                  height={element.height}
                                  fill={element.fill}
                                  stroke={element.stroke}
                                  strokeWidth={element.strokeWidth}
                                />
                              );
                            
                            case 'circle':
                              return (
                                <Circle
                                  {...commonProps}
                                  radius={(element.width || 60) / 2}
                                  fill={element.fill}
                                  stroke={element.stroke}
                                  strokeWidth={element.strokeWidth}
                                />
                              );
                            
                            case 'line':
                              return (
                                <Line
                                  {...commonProps}
                                  points={element.points || [0, 0, 100, 0]}
                                  stroke={element.stroke}
                                  strokeWidth={element.strokeWidth}
                                />
                              );
                            
                            case 'image':
                              return element.image ? (
                                <KonvaImage
                                  {...commonProps}
                                  image={element.image}
                                  width={element.width}
                                  height={element.height}
                                />
                              ) : null;
                            
                            case 'chart':
                              return (
                                <Rect
                                  {...commonProps}
                                  width={element.width || 400}
                                  height={element.height || 300}
                                  fill="#f0f9ff"
                                  stroke="#3b82f6"
                                  strokeWidth={2}
                                />
                              );
                            
                            default:
                              return null;
                          }
                        })}
                        {selectedId && (
                          <Transformer
                            ref={transformerRef}
                            rotateEnabled={false}
                            borderStroke="#0066ff"
                            borderStrokeWidth={2}
                            anchorStroke="#0066ff"
                            anchorStrokeWidth={2}
                            anchorSize={8}
                          />
                        )}
                      </Layer>
                    </Stage>
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* Canvas Editor */
            <div className="bg-white shadow-lg mx-auto border border-gray-200" style={{ width: canvasWidth, height: canvasHeight }}>
            {/* Debug info */}
            <div className="absolute top-2 left-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded z-10">
              Page {currentPage + 1} | {elements.length} elements
            </div>
            
            <Stage
              ref={stageRef}
              width={canvasWidth}
              height={canvasHeight}
              onClick={handleStageClick}
              onTap={handleStageClick}
            >
              <Layer>
                {/* Background */}
                <Rect
                  x={0}
                  y={0}
                  width={canvasWidth}
                  height={canvasHeight}
                  fill="white"
                  listening={false}
                />
                
                {/* Show message if no elements */}
                {elements.length === 0 && (
                  <Text
                    x={50}
                    y={50}
                    text={`Page ${currentPage + 1}: No content yet. Switch to Template View first to load content, then return to Canvas Editor.`}
                    fontSize={16}
                    fontFamily="Arial"
                    fill="#999999"
                    width={400}
                  />
                )}
                
                {/* Elements */}
                {elements.map((element) => {
                  const commonProps = {
                    key: element.id,
                    id: element.id,
                    x: element.x,
                    y: element.y,
                    draggable: element.draggable,
                    onClick: () => handleElementClick(element.id),
                    onTap: () => handleElementClick(element.id),
                    onDragEnd: (e: any) => handleElementDragEnd(element.id, e.target.attrs),
                    onTransformEnd: (e: any) => handleElementTransform(element.id, e.target.attrs),
                  };

                switch (element.type) {
                  case 'text':
                    return (
                      <Text
                        {...commonProps}
                        text={element.text}
                        fontSize={element.fontSize}
                        fontFamily={element.fontFamily}
                        fill={element.fill}
                        width={element.width}
                        align={element.align}
                        fontStyle={element.fontStyle}
                        textDecoration={element.textDecoration}
                        onDblClick={() => handleTextDblClick(element.id)}
                        onDblTap={() => handleTextDblClick(element.id)}
                      />
                    );
                  
                  case 'rectangle':
                    return (
                      <Rect
                        {...commonProps}
                        width={element.width}
                        height={element.height}
                        fill={element.fill}
                        stroke={element.stroke}
                        strokeWidth={element.strokeWidth}
                      />
                    );
                  
                  case 'circle':
                    return (
                      <Circle
                        {...commonProps}
                        radius={(element.width || 60) / 2}
                        fill={element.fill}
                        stroke={element.stroke}
                        strokeWidth={element.strokeWidth}
                      />
                    );
                  
                  case 'line':
                    return (
                      <Line
                        {...commonProps}
                        points={element.points || [0, 0, 100, 0]}
                        stroke={element.stroke}
                        strokeWidth={element.strokeWidth}
                      />
                    );
                  
                  case 'image':
                    return element.image ? (
                      <KonvaImage
                        {...commonProps}
                        image={element.image}
                        width={element.width}
                        height={element.height}
                      />
                    ) : null;
                  
                  case 'chart':
                    // For charts, we'll render them as rectangles with text for now
                    // In a real implementation, you'd convert SVG to Konva elements or use a different approach
                    return (
                      <Rect
                        {...commonProps}
                        width={element.width || 400}
                        height={element.height || 300}
                        fill="#f0f9ff"
                        stroke="#3b82f6"
                        strokeWidth={2}
                      />
                    );
                  
                  default:
                    return null;
                }
              })}
                
                <Transformer
                  ref={transformerRef}
                  rotateEnabled={false}
                  borderStroke="#0066ff"
                  borderStrokeWidth={2}
                  anchorStroke="#0066ff"
                  anchorStrokeWidth={2}
                  anchorSize={8}
                />
              </Layer>
              </Stage>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}