// Dual Content Generation Service
// Creates both PDF and HTML/JSON versions of documents simultaneously
import fs from 'fs/promises';
import path from 'path';
import { generatePDF } from './pdfGenerator';
import { db } from './db';
import { templates } from '../shared/schema';

interface TemplateData {
  cover?: {
    companyName?: string;
    year?: string;
    title?: string;
    preparedBy?: string;
    presentedTo?: string;
    contact?: any;
    logo?: string;
  };
  sections?: Array<{
    type: string;
    title: string;
    content: string | any;
  }>;
  templateInfo?: {
    templateId: string;
    templateName: string;
    templateCategory: string;
  };
  [key: string]: any;
}

interface DualContentResult {
  pdfPath: string;
  htmlContent: {
    templateData: TemplateData;
    styling: {
      templateName: string;
      category: string;
      layout: string;
      colors: Record<string, string>;
      fonts: Record<string, string>;
      spacing: Record<string, string>;
    };
    editableFields: Array<{
      field: string;
      type: 'text' | 'textarea' | 'select';
      label: string;
      value: string;
      section?: string;
    }>;
  };
}

export class DualContentGenerator {
  constructor() {}

  /**
   * Generates HTML/JSON content only (PDF generation on demand)
   */
  async generateHTMLOnlyContent(
    templateData: TemplateData,
    userId: string,
    documentId: string
  ): Promise<{ htmlContent: DualContentResult['htmlContent'] }> {
    console.log('🔄 Generating HTML/JSON content only for document:', documentId);

    // Generate HTML/JSON version for editor (primary format)
    const htmlContent = await this.generateHTMLContent(templateData);

    console.log('✅ HTML content generated successfully');

    return { htmlContent };
  }

  /**
   * Generates HTML content using HTML template files
   */
  async generateHTMLFromTemplate(
    templateData: TemplateData, 
    htmlTemplatePath: string
  ): Promise<string> {
    try {
      const templatePath = path.join(process.cwd(), 'server', 'templates', htmlTemplatePath);
      let htmlTemplate = await fs.readFile(templatePath, 'utf8');
      
      // Replace template variables with actual data
      htmlTemplate = this.replaceTemplateVariables(htmlTemplate, templateData);
      
      return htmlTemplate;
    } catch (error) {
      console.error('❌ Error loading HTML template:', error);
      throw new Error(`Failed to load HTML template: ${htmlTemplatePath}`);
    }
  }

  /**
   * Replace template variables with actual data
   */
  private replaceTemplateVariables(htmlTemplate: string, data: TemplateData): string {
    let processedHtml = htmlTemplate;
    
    // Helper function to safely get nested values
    const getValue = (obj: any, path: string): string => {
      const keys = path.split('.');
      let value = obj;
      for (const key of keys) {
        value = value?.[key];
      }
      return value ? String(value) : '';
    };
    
    // Replace template variables {{variableName}}
    processedHtml = processedHtml.replace(/\{\{([^}]+)\}\}/g, (match, variableName) => {
      const trimmedVar = variableName.trim();
      
      // Try to get value from the data object
      let value = getValue(data, trimmedVar);
      
      // If not found in main data, try cover section
      if (!value && data.cover) {
        value = getValue(data.cover, trimmedVar);
      }
      
      // If not found in cover, try first section content
      if (!value && data.sections && data.sections.length > 0) {
        value = getValue(data.sections[0], trimmedVar);
      }
      
      return value || match; // Keep original if no value found
    });
    
    return processedHtml;
  }

  /**
   * Generates PDF on demand from existing HTML/JSON content
   */
  async generatePDFOnDemand(
    templateData: TemplateData,
    userId: string,
    documentId: string
  ): Promise<string> {
    console.log('🔄 Generating PDF on demand for document:', documentId);

    // Generate PDF using existing system
    const pdfPath = await this.generatePDFContent(templateData, userId, documentId);

    console.log('✅ PDF generated on demand:', pdfPath);

    return pdfPath;
  }

  /**
   * Generates both PDF and HTML/JSON content from template data
   */
  async generateDualContent(
    templateData: TemplateData,
    userId: string,
    documentId: string
  ): Promise<DualContentResult> {
    console.log('🔄 Generating dual content for document:', documentId);

    // 1. Generate PDF as usual (existing system)
    const pdfPath = await this.generatePDFContent(templateData, userId, documentId);

    // 2. Generate HTML/JSON version for editor
    const htmlContent = await this.generateHTMLContent(templateData);

    console.log('✅ Dual content generated:', { pdfPath, htmlContent: !!htmlContent });

    return {
      pdfPath,
      htmlContent
    };
  }

  /**
   * Generate PDF using existing system
   */
  public async generatePDFContent(
    templateData: TemplateData,
    userId: string,
    documentId: string
  ): Promise<string> {
    try {
      // Use existing PDF generation system - pass it as document-like object
      const pdfDocument = {
        content: templateData,
        templateId: templateData.templateInfo?.templateId || null,
        title: `Generated Document - ${new Date().toLocaleDateString()}`,
        // Add other required fields with defaults
        id: documentId,
        userId: userId,
        createdAt: new Date(),
        updatedAt: new Date(),
        isPublic: false,
        originalPrompt: '',
        serviceType: templateData.templateInfo?.templateCategory || 'report',
        detectedSector: 'general',
        pageCount: 1,
        status: 'completed',
        pdfPath: null,
        htmlContent: null,
        logoPath: null,
        viewCount: null
      };
      const pdfResult = await generatePDF(pdfDocument);
      
      // Save PDF to file system and return path
      const pdfFileName = `${documentId}_${Date.now()}.pdf`;
      const pdfPath = path.join(process.cwd(), 'generated-pdfs', pdfFileName);
      
      // Ensure directory exists
      await fs.mkdir(path.dirname(pdfPath), { recursive: true });
      
      // Write PDF buffer to file
      await fs.writeFile(pdfPath, pdfResult);
      
      return pdfPath;
    } catch (error: any) {
      console.error('❌ PDF generation failed:', error);
      throw new Error(`PDF generation failed: ${error?.message || 'Unknown error'}`);
    }
  }

  /**
   * Generate HTML/JSON content for editor
   */
  public async generateHTMLContent(templateData: TemplateData): Promise<any> {
    const templateName = templateData.templateInfo?.templateName || 'Default Template';
    const category = templateData.templateInfo?.templateCategory || 'report';

    // Extract styling information based on template
    const styling = this.extractTemplateStyles(templateName, category);

    // Create editable fields mapping
    const editableFields = this.createEditableFieldsMapping(templateData);

    return {
      templateData: templateData,
      styling: styling,
      editableFields: editableFields,
      metadata: {
        generatedAt: new Date().toISOString(),
        version: '1.0',
        contentType: 'html-json',
        templateName: templateName,
        category: category
      }
    };
  }

  /**
   * Extract styling information for the template
   */
  private extractTemplateStyles(templateName: string, category: string) {
    // Map template names to their styling configurations
    const templateStyles: Record<string, any> = {
      'Green Corporate Annual Report': {
        layout: 'multi-page-report',
        colors: {
          primary: '#16a34a', // green-600
          secondary: '#15803d', // green-700
          accent: '#22c55e', // green-500
          background: '#f0fdf4', // green-50
          text: '#374151', // gray-700
          heading: '#1f2937' // gray-800
        },
        fonts: {
          primary: 'ui-serif, Georgia, Cambria, serif',
          secondary: 'ui-sans-serif, system-ui, sans-serif',
          heading: 'ui-serif, Georgia, Cambria, serif'
        },
        spacing: {
          section: '2rem',
          paragraph: '1.5rem',
          heading: '2rem'
        }
      },
      'Corporate Annual Report': {
        layout: 'multi-page-report',
        colors: {
          primary: '#1e40af', // blue-800
          secondary: '#1d4ed8', // blue-700
          accent: '#3b82f6', // blue-500
          background: '#f8fafc', // slate-50
          text: '#374151', // gray-700
          heading: '#1f2937' // gray-800
        },
        fonts: {
          primary: 'ui-serif, Georgia, Cambria, serif',
          secondary: 'ui-sans-serif, system-ui, sans-serif',
          heading: 'ui-serif, Georgia, Cambria, serif'
        },
        spacing: {
          section: '2rem',
          paragraph: '1.5rem',
          heading: '2rem'
        }
      },
      'International Business Annual Report': {
        layout: 'multi-page-report',
        colors: {
          primary: '#059669', // emerald-600
          secondary: '#047857', // emerald-700
          accent: '#10b981', // emerald-500
          background: '#ecfdf5', // emerald-50
          text: '#374151', // gray-700
          heading: '#1f2937' // gray-800
        },
        fonts: {
          primary: 'ui-serif, Georgia, Cambria, serif',
          secondary: 'ui-sans-serif, system-ui, sans-serif',
          heading: 'ui-serif, Georgia, Cambria, serif'
        },
        spacing: {
          section: '2rem',
          paragraph: '1.5rem',
          heading: '2rem'
        }
      },
      'Financial Report': {
        layout: 'multi-page-report',
        colors: {
          primary: '#1e40af', // blue-800
          secondary: '#1d4ed8', // blue-700
          accent: '#3b82f6', // blue-500
          background: '#0f172a', // slate-900
          text: '#f1f5f9', // slate-100
          heading: '#ffffff' // white
        },
        fonts: {
          primary: 'ui-serif, Georgia, Cambria, serif',
          secondary: 'ui-sans-serif, system-ui, sans-serif',
          heading: 'ui-serif, Georgia, Cambria, serif'
        },
        spacing: {
          section: '2rem',
          paragraph: '1.5rem',
          heading: '2rem'
        }
      }
    };

    // Return specific template styles or default
    return templateStyles[templateName] || templateStyles['Corporate Annual Report'];
  }

  /**
   * Create mapping of editable fields for the editor
   */
  private createEditableFieldsMapping(templateData: TemplateData): Array<any> {
    const fields: Array<any> = [];

    // Cover page fields
    if (templateData.cover) {
      if (templateData.cover.companyName) {
        fields.push({
          field: 'cover.companyName',
          type: 'text',
          label: 'Company Name',
          value: templateData.cover.companyName,
          section: 'cover'
        });
      }
      if (templateData.cover.year) {
        fields.push({
          field: 'cover.year',
          type: 'text',
          label: 'Year',
          value: templateData.cover.year,
          section: 'cover'
        });
      }
      if (templateData.cover.title) {
        fields.push({
          field: 'cover.title',
          type: 'text',
          label: 'Report Title',
          value: templateData.cover.title,
          section: 'cover'
        });
      }
      if (templateData.cover.preparedBy) {
        fields.push({
          field: 'cover.preparedBy',
          type: 'text',
          label: 'Prepared By',
          value: templateData.cover.preparedBy,
          section: 'cover'
        });
      }
      if (templateData.cover.presentedTo) {
        fields.push({
          field: 'cover.presentedTo',
          type: 'text',
          label: 'Presented To',
          value: templateData.cover.presentedTo,
          section: 'cover'
        });
      }
    }

    // Section fields
    if (templateData.sections && Array.isArray(templateData.sections)) {
      templateData.sections.forEach((section, index) => {
        fields.push({
          field: `sections.${index}.title`,
          type: 'text',
          label: `Section ${index + 1} Title`,
          value: section.title,
          section: `section-${index}`
        });
        fields.push({
          field: `sections.${index}.content`,
          type: 'textarea',
          label: `Section ${index + 1} Content`,
          value: typeof section.content === 'string' ? section.content : JSON.stringify(section.content),
          section: `section-${index}`
        });
      });
    }

    return fields;
  }

  /**
   * Update HTML/JSON content when user edits
   */
  async updateHTMLContent(
    documentId: string,
    fieldPath: string,
    newValue: string,
    currentHTMLContent: any
  ): Promise<any> {
    console.log('🔄 Updating HTML content:', { documentId, fieldPath, newValue });

    const updatedContent = { ...currentHTMLContent };
    
    // Update the template data
    const keys = fieldPath.split('.');
    let current = updatedContent.templateData;
    
    for (let i = 0; i < keys.length - 1; i++) {
      if (!current[keys[i]]) {
        current[keys[i]] = {};
      }
      current = current[keys[i]];
    }
    
    current[keys[keys.length - 1]] = newValue;

    // Update the editable fields mapping
    const fieldIndex = updatedContent.editableFields.findIndex((field: any) => field.field === fieldPath);
    if (fieldIndex >= 0) {
      updatedContent.editableFields[fieldIndex].value = newValue;
    }

    // Update metadata
    updatedContent.metadata.lastEditedAt = new Date().toISOString();

    console.log('✅ HTML content updated successfully');
    return updatedContent;
  }
}

export const dualContentGenerator = new DualContentGenerator();