import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileText, Users, DollarSign, TrendingUp, Mail, Book, BarChart, Receipt, Briefcase, Download, Eye, Edit } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import PDFEditor from "./pdf-editor/PDFEditor";
import { 
  ExecutiveResumeTemplate, 
  SalesRepResumeTemplate, 
  InvoiceTemplate, 
  PitchDeckTemplate, 
  NewsletterTemplate, 
  ReportTemplate, 
  BrochureTemplate 
} from "./template-styles";

interface DocumentPreviewProps {
  content: any;
  title: string;
  serviceType: string;
  pageCount?: number;
  isGuest?: boolean;
  documentId?: string;
  showActions?: boolean;
}

export default function DocumentPreview({ content, title, serviceType, pageCount = 1, isGuest = false, documentId, showActions = true }: DocumentPreviewProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [showEditor, setShowEditor] = useState(false);
  const [editedContent, setEditedContent] = useState<any>(null);
  const { toast } = useToast();

  // Use edited content if available, otherwise use original content
  const displayContent = editedContent || content;
  const hasEdits = !!editedContent;
  
  console.log(`🔍 Preview render - Using ${hasEdits ? 'EDITED' : 'ORIGINAL'} content`);

  // Convert canvas elements back to content structure
  const convertElementsToContent = (elements: any[], originalContent: any) => {
    console.log('🔄 Converting canvas elements back to content:', elements);
    
    // Create deep copy of original content structure
    const updatedContent = JSON.parse(JSON.stringify(originalContent));
    
    // Group elements by their purpose for better matching
    const textElements = elements.filter(el => el.type === 'text' && el.text);
    
    // Update text elements by matching IDs or content types
    textElements.forEach((element) => {
      const elementId = element.id.toLowerCase();
      
      console.log(`Processing element: ${elementId} with text: "${element.text.substring(0, 50)}..."`);
      
      // Update title/company name - more flexible matching
      if ((elementId.includes('title') || elementId.includes('company')) && updatedContent.cover) {
        if (elementId.includes('title') || elementId.includes('report-title')) {
          updatedContent.cover.reportTitle = element.text;
        } else if (elementId.includes('company')) {
          updatedContent.cover.companyName = element.text;
        }
        if (updatedContent.cover.division && elementId.includes('subtitle')) {
          updatedContent.cover.division = element.text;
        }
      }
      
      // Update contact info
      if (elementId.includes('contact') && updatedContent.cover?.contactDetails) {
        if (elementId.includes('email')) {
          updatedContent.cover.contactDetails.email = element.text;
        } else if (elementId.includes('phone')) {
          updatedContent.cover.contactDetails.phone = element.text;
        } else if (elementId.includes('address')) {
          updatedContent.cover.contactDetails.address = element.text;
        }
      }
      
      // Update section content by matching section index - enhanced matching
      const sectionContentMatch = elementId.match(/section-content-(\d+)/);
      if (sectionContentMatch && updatedContent.sections) {
        const sectionIndex = parseInt(sectionContentMatch[1]);
        if (updatedContent.sections[sectionIndex]) {
          updatedContent.sections[sectionIndex].content = element.text;
          console.log(`Updated section ${sectionIndex} content`);
        }
      }
      
      // Update section titles - enhanced matching
      const sectionTitleMatch = elementId.match(/section-title-(\d+)/);
      if (sectionTitleMatch && updatedContent.sections) {
        const sectionIndex = parseInt(sectionTitleMatch[1]);
        if (updatedContent.sections[sectionIndex]) {
          updatedContent.sections[sectionIndex].title = element.text;
          console.log(`Updated section ${sectionIndex} title`);
        }
      }
      
      // Update field-based content (skills, experience, etc.)
      ['skills', 'experience', 'education', 'summary'].forEach(field => {
        if (elementId.includes(field) && updatedContent[field]) {
          if (elementId.includes('content') || elementId.includes(field + '-')) {
            // Convert text back to appropriate format
            if (field === 'skills' && typeof updatedContent[field] === 'object') {
              updatedContent[field] = element.text.split(',').map((s: string) => s.trim());
            } else {
              updatedContent[field] = element.text;
            }
            console.log(`Updated ${field} content`);
          }
        }
      });
    });
    
    console.log('✅ Updated content structure:', updatedContent);
    return updatedContent;
  };

  // Template-specific rendering based on template name and service type
  const renderTemplateSpecificContent = (data: any) => {
    const templateName = data?.templateInfo?.templateName || '';
    const templateCategory = data?.templateInfo?.templateCategory || serviceType;
    
    console.log('Rendering template:', templateName, 'Category:', templateCategory);
    
    // Resume Templates
    if (templateCategory === 'resume' || serviceType === 'resume-builder') {
      if (templateName === 'Executive Resume' || templateName.includes('Executive')) {
        return <ExecutiveResumeTemplate data={data} />;
      } else if (templateName === 'Sales Representative Resume' || templateName.includes('Sales')) {
        return <SalesRepResumeTemplate data={data} />;
      } else {
        // Default to Executive Resume for other resume types
        return <ExecutiveResumeTemplate data={data} />;
      }
    }
    
    // Invoice Templates
    else if (templateCategory === 'invoice' || serviceType === 'invoice-generator') {
      return <InvoiceTemplate data={data} />;
    }
    
    // Pitch Deck Templates
    else if (templateCategory === 'pitch-deck' || serviceType === 'pitch-deck') {
      return <PitchDeckTemplate data={data} />;
    }
    
    // Newsletter Templates
    else if (templateCategory === 'newsletter' || serviceType === 'newsletter-creator') {
      return <NewsletterTemplate data={data} />;
    }
    
    // Report Templates - Enhanced template-specific styling
    else if (templateCategory === 'report' || serviceType === 'report-generator') {
      // Apply template-specific styling based on database template name
      return <ReportTemplate data={data} templateName={templateName} />;
    }
    
    // Brochure Templates
    else if (templateCategory === 'brochure' || serviceType === 'brochure-designer') {
      return <BrochureTemplate data={data} />;
    }
    
    // Fallback to generic rendering
    return renderGenericContent(data);
  };
  
  // Enhanced debugging for frontend display
  console.log("=== RECEIVED IN FRONTEND ===");
  console.log("Full content object:", content);
  console.log("Service type:", serviceType);
  console.log("Title:", title);
  console.log("Content structure:", content);
  console.log("Content._isStructured:", content?._isStructured);
  console.log("===========================");
  const getServiceIcon = (type: string) => {
    const icons = {
      'pitch-deck': Users,
      'resume-builder': FileText,
      'brochure-designer': Mail,
      'report-generator': TrendingUp,
      'invoice-creator': Receipt,
      'business-plan': Briefcase,
      'ebook-creator': Book,
      'newsletter-designer': Mail,
      'chart-generator': BarChart,
    };
    return icons[type as keyof typeof icons] || FileText;
  };

  const IconComponent = getServiceIcon(serviceType);

  const handleDownload = async () => {
    if (!documentId) {
      toast({
        title: "Download unavailable",
        description: "Document ID is required for download",
        variant: "destructive",
      });
      return;
    }

    setIsDownloading(true);
    try {
      const response = await fetch(`/api/documents/${documentId}/download`);
      if (!response.ok) {
        throw new Error('Failed to download document');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `${title.replace(/[^a-zA-Z0-9\s]/g, '_').replace(/\s+/g, '_')}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({
        title: "PDF Downloaded",
        description: "Professional PDF document has been downloaded",
      });
    } catch (error) {
      toast({
        title: "PDF Generation Failed",
        description: "Failed to generate PDF document",
        variant: "destructive",
      });
    } finally {
      setIsDownloading(false);
    }
  };

  // Generic fallback rendering for when template-specific styling isn't available
  const renderGenericContent = (data: any) => {
    console.log('Using generic rendering for data:', JSON.stringify(data, null, 2));
    
    // Handle sections-based structure
    if (data.sections && Array.isArray(data.sections)) {
      return (
        <div className="space-y-6" id="design-preview">
          {data.sections.map((section: any, index: number) => {
            const sectionType = section.type?.toLowerCase();
            
            // Render different section types with appropriate styling - only real content
            if (sectionType === 'header') {
              return (
                <div key={index} className="text-center border-b pb-4 bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg">
                  <div className="text-gray-700 whitespace-pre-line text-lg leading-relaxed">
                    {/* Handle both content string and fields array for header sections */}
                    {section.content || (section.fields && section.fields.join(' | '))}
                  </div>
                </div>
              );
            }
            
            if (sectionType === 'summary') {
              console.log('Rendering summary section:', section);
              console.log('Summary content:', section.content);
              return (
                <div key={index} className="bg-gray-50 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    👋 {section.title || 'Professional Summary'}
                  </h3>
                  <div className="text-gray-700 whitespace-pre-line leading-relaxed" style={{ fontSize: '16px', lineHeight: '1.6' }}>
                    {section.content || 'No content available'}
                  </div>
                </div>
              );
            }
            
            if (sectionType === 'experience') {
              console.log('Rendering experience section:', section);
              return (
                <div key={index} className="bg-green-50 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    💼 {section.title || 'Work Experience'}
                  </h3>
                  <div className="text-gray-700 leading-relaxed" style={{ fontSize: '16px', lineHeight: '1.6' }}>
                    {Array.isArray(section.content) ? (
                      section.content.map((job: any, jobIndex: number) => (
                        <div key={jobIndex} className="mb-4 pb-4 border-b border-green-200 last:border-b-0">
                          <div className="font-semibold text-gray-900">{job.job_title || job.position}</div>
                          <div className="text-green-700 font-medium">{job.company} • {job.duration || job.period}</div>
                          {job.responsibilities && Array.isArray(job.responsibilities) && (
                            <ul className="mt-2 list-disc list-inside space-y-1">
                              {job.responsibilities.map((resp: string, respIndex: number) => (
                                <li key={respIndex} className="text-sm">{resp}</li>
                              ))}
                            </ul>
                          )}
                        </div>
                      ))
                    ) : (
                      <div className="whitespace-pre-line">{section.content || 'Experience content not available'}</div>
                    )}
                  </div>
                </div>
              );
            }
            
            // Handle skills section with array of skills
            if (sectionType === 'skills') {
              return (
                <div key={index} className="bg-blue-50 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    🛠️ {section.title || 'Skills'}
                  </h3>
                  <div className="text-gray-700 leading-relaxed" style={{ fontSize: '16px', lineHeight: '1.6' }}>
                    {Array.isArray(section.content) ? (
                      <div className="flex flex-wrap gap-2">
                        {section.content.map((skill: string, skillIndex: number) => (
                          <span key={skillIndex} className="bg-blue-200 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                            {skill}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <div className="whitespace-pre-line">{section.content || 'Skills not available'}</div>
                    )}
                  </div>
                </div>
              );
            }

            // Handle education section with array of education items
            if (sectionType === 'education') {
              return (
                <div key={index} className="bg-purple-50 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    🎓 {section.title || 'Education'}
                  </h3>
                  <div className="text-gray-700 leading-relaxed" style={{ fontSize: '16px', lineHeight: '1.6' }}>
                    {Array.isArray(section.content) ? (
                      section.content.map((edu: any, eduIndex: number) => (
                        <div key={eduIndex} className="mb-3 pb-3 border-b border-purple-200 last:border-b-0">
                          <div className="font-semibold text-gray-900">{edu.degree}</div>
                          <div className="text-purple-700">{edu.institution} • {edu.year || edu.years}</div>
                        </div>
                      ))
                    ) : (
                      <div className="whitespace-pre-line">{section.content || 'Education not available'}</div>
                    )}
                  </div>
                </div>
              );
            }
            
            // Default section rendering for other section types
            return (
              <div key={index} className="bg-white p-6 rounded-lg border">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  {section.title || section.type?.replace('_', ' ').toUpperCase()}
                </h3>
                <div className="text-gray-700 whitespace-pre-line leading-relaxed" style={{ fontSize: '16px', lineHeight: '1.6' }}>
                  {Array.isArray(section.content) ? (
                    <ul className="list-disc list-inside space-y-1">
                      {section.content.map((item: any, itemIndex: number) => (
                        <li key={itemIndex}>{typeof item === 'string' ? item : JSON.stringify(item)}</li>
                      ))}
                    </ul>
                  ) : (
                    section.content || 'Content not available'
                  )}
                </div>
              </div>
            );
          })}
        </div>
      );
    }
    
    // First check if we have structured content from the AI generation
    const contentToRender = data._isStructured ? data : data;
    
    // Handle the specific Sales Representative Resume template structure
    return (
      <div className="space-y-6" id="design-preview">
        {/* Header Section - Personal Information */}
        <div className="text-center border-b pb-4 bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            {contentToRender.personal?.name || "Professional Name"}
          </h2>
          <p className="text-xl text-gray-600 mb-3">
            {contentToRender.personal?.title || "Professional Title"}
          </p>
          <div className="text-sm text-gray-500 space-y-1">
            {contentToRender.personal?.contact?.email && <div>📧 {contentToRender.personal.contact.email}</div>}
            {contentToRender.personal?.contact?.phone && <div>📱 {contentToRender.personal.contact.phone}</div>}
            {contentToRender.personal?.contact?.address && <div>📍 {contentToRender.personal.contact.address}</div>}
          </div>
        </div>
        
        {/* About Me Section */}
        {contentToRender.aboutMe && (
          <div className="bg-gray-50 p-6 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
              👋 About Me
            </h3>
            <p className="text-gray-700 leading-relaxed">{contentToRender.aboutMe}</p>
          </div>
        )}
        
        {/* Skills Section */}
        {contentToRender.skills && Array.isArray(contentToRender.skills) && contentToRender.skills.length > 0 && (
          <div className="bg-blue-50 p-6 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
              🎯 Skills
            </h3>
            <div className="flex flex-wrap gap-2">
              {contentToRender.skills.map((skill: string, index: number) => (
                <Badge key={index} variant="secondary" className="bg-blue-200 text-blue-800">{skill}</Badge>
              ))}
            </div>
          </div>
        )}
        
        {/* Work Experience Section */}
        {contentToRender.workExperience && Array.isArray(contentToRender.workExperience) && contentToRender.workExperience.length > 0 && (
          <div className="bg-green-50 p-6 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              💼 Work Experience
            </h3>
            <div className="space-y-6">
              {contentToRender.workExperience.map((job: any, index: number) => (
                <div key={index} className="border-l-4 border-green-500 pl-6 bg-white p-4 rounded-lg">
                  <div className="font-bold text-lg text-gray-900">{job.position}</div>
                  <div className="text-green-600 font-semibold mb-2">{job.company} • {job.period}</div>
                  {job.responsibilities && Array.isArray(job.responsibilities) && (
                    <ul className="text-sm text-gray-700 list-disc list-inside space-y-1 ml-4">
                      {job.responsibilities.map((resp: string, respIndex: number) => (
                        <li key={respIndex}>{resp}</li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Education Section */}
        {contentToRender.education && Array.isArray(contentToRender.education) && contentToRender.education.length > 0 && (
          <div className="bg-purple-50 p-6 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
              🎓 Education
            </h3>
            <div className="space-y-3">
              {contentToRender.education.map((edu: any, index: number) => (
                <div key={index} className="bg-white p-4 rounded-lg border-l-4 border-purple-500">
                  <div className="font-semibold text-gray-900 text-lg">{edu.degree}</div>
                  <div className="text-purple-600 font-medium">{edu.institution} • {edu.years}</div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Languages Section */}
        {contentToRender.languages && Array.isArray(contentToRender.languages) && contentToRender.languages.length > 0 && (
          <div className="bg-orange-50 p-6 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
              🗣️ Languages
            </h3>
            <div className="flex flex-wrap gap-2">
              {contentToRender.languages.map((language: string, index: number) => (
                <Badge key={index} variant="outline" className="bg-orange-200 text-orange-800 border-orange-300">{language}</Badge>
              ))}
            </div>
          </div>
        )}
        
        {/* References Section */}
        {contentToRender.references && Array.isArray(contentToRender.references) && contentToRender.references.length > 0 && (
          <div className="bg-gray-50 p-6 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
              👥 References
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {contentToRender.references.map((ref: any, index: number) => (
                <div key={index} className="bg-white p-4 rounded-lg border">
                  <div className="font-semibold text-gray-900">{ref.name}</div>
                  <div className="text-gray-600 text-sm">{ref.role}</div>
                  {ref.email && <div className="text-gray-500 text-sm">📧 {ref.email}</div>}
                  {ref.phone && <div className="text-gray-500 text-sm">📱 {ref.phone}</div>}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderPitchDeckContent = (data: any) => {
    // Handle backend template structure with slides
    if (data.slides && Array.isArray(data.slides)) {
      return (
        <div className="space-y-6">
          {data.slides.map((slide: any, index: number) => (
            <div key={index} className="bg-blue-50 p-6 rounded-lg">
              <h3 className="text-xl font-bold text-blue-900 mb-2">
                {slide.title || `Slide ${index + 1}`}
              </h3>
              {slide.subtitle && (
                <p className="text-lg text-blue-700 mb-3">{slide.subtitle}</p>
              )}
              {slide.content && (
                <div className="text-blue-800 whitespace-pre-line">{slide.content}</div>
              )}
            </div>
          ))}
        </div>
      );
    }
    
    // Fallback for old structure
    return (
      <div className="space-y-6">
        <div className="text-center bg-blue-50 p-6 rounded-lg">
          <h2 className="text-2xl font-bold text-blue-900">{data.company_name || "Company Name"}</h2>
          <p className="text-lg text-blue-700">{data.tagline || "Company Tagline"}</p>
        </div>
      </div>
    );
  };

  const renderReportContent = (data: any) => {
    if (data.sections && Array.isArray(data.sections)) {
      return (
        <div className="space-y-6">
          {data.sections.map((section: any, index: number) => (
            <div key={index} className="border-l-4 border-green-500 bg-green-50 p-6 rounded-lg">
              <h3 className="text-xl font-bold text-green-900 mb-3">{section.title}</h3>
              <div className="text-green-800 whitespace-pre-line leading-relaxed">
                {section.content}
              </div>
            </div>
          ))}
        </div>
      );
    }
    return <div className="text-gray-500">No sections available</div>;
  };





  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <IconComponent className="h-6 w-6 text-blue-600" />
          <h3 className="text-xl font-bold text-gray-900">{title}</h3>
          {pageCount > 1 && (
            <Badge variant="secondary">
              {pageCount} Pages
            </Badge>
          )}
          {hasEdits && (
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
              ✓ Edited
            </Badge>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          {showActions && !isGuest && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsExpanded(!isExpanded)}
                className="flex items-center gap-2"
              >
                <Eye className="h-4 w-4" />
                {isExpanded ? 'Collapse' : 'Preview'}
              </Button>
              
              {documentId && (
                <>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setShowEditor(true)}
                    className="flex items-center gap-2"
                    data-testid="button-edit-document"
                  >
                    <Edit className="h-4 w-4" />
                    Edit
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleDownload}
                    disabled={isDownloading}
                    className="flex items-center gap-2"
                  >
                    <Download className="h-4 w-4" />
                    {isDownloading ? 'Generating PDF...' : 'Download PDF'}
                  </Button>
                </>
              )}
            </>
          )}
          
          {isGuest && (
            <Badge variant="outline" className="text-orange-600 border-orange-300">
              Preview • Sign up to save
            </Badge>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
        {!isExpanded ? (
          <div className="text-center py-8">
            <IconComponent className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 mb-4">Click "Preview" to view document content</p>
            <Button
              variant="outline"
              onClick={() => setIsExpanded(true)}
              className="flex items-center gap-2"
            >
              <Eye className="h-4 w-4" />
              Show Preview
            </Button>
          </div>
        ) : (
          <div className={isExpanded ? 'max-h-96 overflow-y-auto' : ''}>
            {renderTemplateSpecificContent(displayContent)}
          </div>
        )}
      </div>

      {/* PDF Editor Modal */}
      {showEditor && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg w-full h-full max-w-7xl max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-lg font-semibold">Edit Document</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowEditor(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </Button>
            </div>
            <div className="flex-1 overflow-hidden">
              <PDFEditor
                initialContent={displayContent}
                documentId={documentId}
                serviceType={serviceType}
                templateName={displayContent?.templateInfo?.templateName || content?.templateInfo?.templateName}
                onSave={(elements) => {
                  console.log('🔧 PDF Editor saved elements:', elements);
                  
                  // Convert canvas elements back to content structure for preview
                  const updatedContent = convertElementsToContent(elements, displayContent);
                  
                  console.log('🔄 Setting edited content for preview update');
                  setEditedContent(updatedContent);
                  
                  // Force a re-render by updating the key
                  setTimeout(() => {
                    console.log('✅ Preview should now show updated content');
                  }, 100);
                  
                  toast({
                    title: "Changes saved",
                    description: "Your document edits have been saved successfully.",
                  });
                  setShowEditor(false);
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Guest Notice */}
      {isGuest && (
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-blue-800 text-sm">
            <strong>Sign up to save this content!</strong> Create an account to access your designs anytime, 
            collaborate with others, and unlock premium features.
          </p>
        </div>
      )}
    </div>
  );
}