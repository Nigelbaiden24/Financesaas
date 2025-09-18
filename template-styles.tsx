// Template-specific visual styling components
import React from 'react';
import { 
  GreenCorporateAnnualReportLayout, 
  WhiteBlueCorporateAnnualReportLayout,
  BlackMinimalistFinancialReportLayout,
  InternationalBusinessAnnualReportLayout 
} from './pdf-template-layouts';

// Make content editable component
const EditableText = ({ 
  children, 
  isEditable, 
  onEdit, 
  className = "",
  field = "",
  style = {}
}: { 
  children: React.ReactNode; 
  isEditable?: boolean; 
  onEdit?: (newValue: string) => void;
  className?: string;
  field?: string;
  style?: React.CSSProperties;
}) => {
  const [isEditing, setIsEditing] = React.useState(false);
  const [value, setValue] = React.useState(String(children));

  const handleClick = () => {
    if (isEditable) {
      setIsEditing(true);
    }
  };

  const handleBlur = () => {
    setIsEditing(false);
    if (onEdit && value !== String(children)) {
      onEdit(value);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleBlur();
    } else if (e.key === 'Escape') {
      setValue(String(children));
      setIsEditing(false);
    }
  };

  if (isEditing) {
    return (
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        className={`${className} border-2 border-blue-500 bg-white`}
        style={style}
        autoFocus
        data-testid={`input-${field}`}
      />
    );
  }

  return (
    <span
      className={`${className} ${isEditable ? 'cursor-pointer hover:bg-blue-100 hover:bg-opacity-50 border-2 border-transparent hover:border-blue-300 rounded px-1' : ''}`}
      onClick={handleClick}
      style={style}
      title={isEditable ? "Click to edit" : ""}
      data-testid={`text-${field}`}
    >
      {children}
    </span>
  );
};

// Executive Resume Template Styling
export const ExecutiveResumeTemplate = ({ data, isEditor = false, isEditable = false, onContentChange }: { data: any; isEditor?: boolean; isEditable?: boolean; onContentChange?: (newData: any) => void }) => {
  // Handle both old section-based format and new AI-generated format
  const personalInfo = data.personal || {};
  const hasExperience = Array.isArray(data.experience);
  const hasSkills = Array.isArray(data.skills);
  const hasEducation = Array.isArray(data.education);
  
  return (
    <div className="bg-gradient-to-br from-slate-50 to-blue-50 min-h-screen p-8">
      <div className="max-w-4xl mx-auto bg-white shadow-2xl rounded-lg overflow-hidden">
        {/* Professional Header with Blue Accent */}
        <div className="bg-gradient-to-r from-blue-900 to-blue-700 text-white p-8">
          <div className="text-center">
            {isEditor ? (
              <>
                <input
                  className="text-4xl font-bold mb-2 bg-transparent text-white border-b border-blue-300 w-full text-center"
                  defaultValue={data.personalInfo?.name || personalInfo.name || data.name || 'Professional Name'}
                  onChange={(e) => onContentChange?.({ ...data, personalInfo: { ...data.personalInfo, name: e.target.value } })}
                />
                <input
                  className="text-xl text-blue-200 mb-4 bg-transparent border-b border-blue-300 w-full text-center"
                  defaultValue={data.personalInfo?.title || personalInfo.title || data.title || 'Professional Title'}
                  onChange={(e) => onContentChange?.({ ...data, personalInfo: { ...data.personalInfo, title: e.target.value } })}
                />
              </>
            ) : (
              <>
                <h1 
                  className={`text-4xl font-bold mb-2 ${isEditable ? 'cursor-pointer hover:bg-blue-800 hover:bg-opacity-20 rounded px-2 py-1' : ''}`}
                  data-field="name"
                  title={isEditable ? "Double-click to edit name" : ""}
                >
                  {data.personalInfo?.name || personalInfo.name || data.name || 'Professional Name'}
                </h1>
                <h2 
                  className={`text-xl text-blue-200 mb-4 ${isEditable ? 'cursor-pointer hover:bg-blue-800 hover:bg-opacity-20 rounded px-2 py-1' : ''}`}
                  data-field="title"
                  title={isEditable ? "Double-click to edit title" : ""}
                >
                  {data.personalInfo?.title || personalInfo.title || data.title || 'Professional Title'}
                </h2>
              </>
            )}
            <div className="text-blue-100">
              <div 
                className={`${isEditable ? 'cursor-pointer hover:bg-blue-800 hover:bg-opacity-20 rounded px-2 py-1 inline-block' : ''}`}
                data-field="email"
                title={isEditable ? "Double-click to edit email" : ""}
              >
                📧 {data.personalInfo?.email || personalInfo.email || data.email || 'Email'}
              </div>
              <div 
                className={`${isEditable ? 'cursor-pointer hover:bg-blue-800 hover:bg-opacity-20 rounded px-2 py-1 inline-block' : ''}`}
                data-field="phone"
                title={isEditable ? "Double-click to edit phone" : ""}
              >
                📱 {data.personalInfo?.phone || personalInfo.phone || data.phone || 'Phone'}
              </div>
              <div 
                className={`${isEditable ? 'cursor-pointer hover:bg-blue-800 hover:bg-opacity-20 rounded px-2 py-1 inline-block' : ''}`}
                data-field="location"
                title={isEditable ? "Double-click to edit location" : ""}
              >
                📍 {data.personalInfo?.location || personalInfo.location || data.location || 'Location'}
              </div>
            </div>
          </div>
        </div>
        
        {/* Content Sections */}
        <div className="p-8">
          {/* Professional Summary */}
          {data.summary && (
            <div className="mb-8 border-l-4 border-blue-600 pl-6">
              <h3 className="text-2xl font-bold text-gray-800 mb-4">Professional Summary</h3>
              {isEditor ? (
                <textarea
                  className="w-full p-3 text-gray-700 leading-relaxed text-lg border border-gray-300 rounded-lg resize-none"
                  rows={4}
                  defaultValue={data.summary}
                  onChange={(e) => onContentChange?.({ ...data, summary: e.target.value })}
                />
              ) : (
                <p 
                  className={`text-gray-700 leading-relaxed text-lg ${isEditable ? 'cursor-pointer hover:bg-gray-100 rounded p-2' : ''}`}
                  data-field="summary"
                  title={isEditable ? "Double-click to edit summary" : ""}
                >
                  {data.summary}
                </p>
              )}
            </div>
          )}
          
          {/* Experience Section */}
          {hasExperience && (
            <div className="mb-8">
              <h3 className="text-2xl font-bold text-gray-800 mb-6 border-b-2 border-blue-600 pb-2">Professional Experience</h3>
              <div className="space-y-6">
                {data.experience.map((job: any, jobIndex: number) => (
                  <div key={jobIndex} className="bg-gray-50 p-6 rounded-lg border-l-4 border-blue-400">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 
                          className={`text-xl font-semibold text-gray-900 ${isEditable ? 'cursor-pointer hover:bg-gray-200 rounded p-1' : ''}`}
                          data-field={`experience-${jobIndex}-position`}
                          title={isEditable ? "Double-click to edit position" : ""}
                        >
                          {job.position || job.job_title}
                        </h4>
                        <p 
                          className={`text-blue-700 font-medium ${isEditable ? 'cursor-pointer hover:bg-gray-200 rounded p-1' : ''}`}
                          data-field={`experience-${jobIndex}-company`}
                          title={isEditable ? "Double-click to edit company" : ""}
                        >
                          {job.company}
                        </p>
                      </div>
                      <span 
                        className={`text-gray-500 text-sm ${isEditable ? 'cursor-pointer hover:bg-gray-200 rounded p-1' : ''}`}
                        data-field={`experience-${jobIndex}-duration`}
                        title={isEditable ? "Double-click to edit duration" : ""}
                      >
                        {job.duration || job.dates}
                      </span>
                    </div>
                    <p 
                      className={`text-gray-700 ${isEditable ? 'cursor-pointer hover:bg-gray-200 rounded p-1' : ''}`}
                      data-field={`experience-${jobIndex}-achievements`}
                      title={isEditable ? "Double-click to edit achievements" : ""}
                    >
                      {job.achievements || job.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Skills Section */}
          {hasSkills && (
            <div className="mb-8">
              <h3 className="text-2xl font-bold text-gray-800 mb-6 border-b-2 border-blue-600 pb-2">Core Skills</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {data.skills.map((skill: string, skillIndex: number) => (
                  <div 
                    key={skillIndex} 
                    className={`bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-center font-medium ${isEditable ? 'cursor-pointer hover:bg-blue-200' : ''}`}
                    data-field={`skills-${skillIndex}`}
                    title={isEditable ? "Double-click to edit skill" : ""}
                  >
                    {skill}
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Education Section */}
          {hasEducation && (
            <div className="mb-8">
              <h3 className="text-2xl font-bold text-gray-800 mb-6 border-b-2 border-blue-600 pb-2">Education</h3>
              <div className="space-y-4">
                {data.education.map((edu: any, eduIndex: number) => (
                  <div key={eduIndex} className="bg-gray-50 p-4 rounded-lg">
                    <h4 
                      className={`text-lg font-semibold text-gray-900 ${isEditable ? 'cursor-pointer hover:bg-gray-200 rounded p-1' : ''}`}
                      data-field={`education-${eduIndex}-degree`}
                      title={isEditable ? "Double-click to edit degree" : ""}
                    >
                      {edu.degree}
                    </h4>
                    <p className="text-blue-700">
                      <span 
                        className={`${isEditable ? 'cursor-pointer hover:bg-gray-200 rounded p-1' : ''}`}
                        data-field={`education-${eduIndex}-institution`}
                        title={isEditable ? "Double-click to edit institution" : ""}
                      >
                        {edu.institution}
                      </span>
                      <span> • </span>
                      <span 
                        className={`${isEditable ? 'cursor-pointer hover:bg-gray-200 rounded p-1' : ''}`}
                        data-field={`education-${eduIndex}-year`}
                        title={isEditable ? "Double-click to edit year" : ""}
                      >
                        {edu.year || edu.years}
                      </span>
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Sales Representative Resume Template Styling
export const SalesRepResumeTemplate = ({ data, isEditor = false, isEditable = false, onContentChange }: { data: any; isEditor?: boolean; isEditable?: boolean; onContentChange?: (newData: any) => void }) => {
  const hasExperience = Array.isArray(data.experience);
  const hasSkills = Array.isArray(data.skills);
  const hasEducation = Array.isArray(data.education);
  
  return (
    <div className="bg-gradient-to-br from-green-50 to-emerald-50 min-h-screen p-8">
      <div className="max-w-4xl mx-auto bg-white shadow-xl rounded-lg overflow-hidden border-t-8 border-green-600">
        {/* Sales-focused Header */}
        <div className="bg-gradient-to-r from-green-700 to-green-600 text-white p-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-2">{data.personalInfo?.name || data.name || 'Sales Professional'}</h1>
            <h2 className="text-xl text-green-200 mb-4">{data.personalInfo?.title || data.title || 'Sales Representative'}</h2>
            <div className="text-green-100">
              <div>📧 {data.personalInfo?.email || data.email || 'Email'}</div>
              <div>📱 {data.personalInfo?.phone || data.phone || 'Phone'}</div>
              <div>📍 {data.personalInfo?.location || data.location || 'Location'}</div>
            </div>
          </div>
        </div>
        
        {/* Content with Sales-specific styling */}
        <div className="p-8">
          {/* Professional Summary */}
          {data.summary && (
            <div className="mb-8 bg-green-50 p-6 rounded-lg border-l-4 border-green-600">
              <h3 className="text-2xl font-bold text-gray-800 mb-4">Professional Summary</h3>
              <p className="text-gray-700 leading-relaxed">{data.summary}</p>
            </div>
          )}
          
          {/* Professional Experience */}
          {hasExperience && (
            <div className="mb-8">
              <h3 className="text-2xl font-bold text-gray-800 mb-6 border-b-2 border-green-600 pb-2">Professional Experience</h3>
              <div className="space-y-6">
                {data.experience.map((job: any, index: number) => (
                  <div key={index} className="bg-gray-50 p-6 rounded-lg border-l-4 border-green-400">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className="text-xl font-semibold text-gray-900">{job.position || job.job_title}</h4>
                        <p className="text-green-700 font-medium">{job.company}</p>
                      </div>
                      <span className="text-gray-500 text-sm">{job.duration || job.dates}</span>
                    </div>
                    <p className="text-gray-700">{job.achievements || job.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Core Skills */}
          {hasSkills && (
            <div className="mb-8">
              <h3 className="text-2xl font-bold text-gray-800 mb-6 border-b-2 border-green-600 pb-2">Core Skills</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {data.skills.map((skill: string, index: number) => (
                  <div key={index} className="bg-green-100 text-green-800 px-4 py-2 rounded-full text-center font-medium">
                    {skill}
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Education */}
          {hasEducation && (
            <div className="mb-8">
              <h3 className="text-2xl font-bold text-gray-800 mb-6 border-b-2 border-green-600 pb-2">Education</h3>
              <div className="space-y-4">
                {data.education.map((edu: any, index: number) => (
                  <div key={index} className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="text-lg font-semibold text-gray-900">{edu.degree}</h4>
                    <p className="text-green-700">{edu.institution} • {edu.year || edu.years}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Invoice Template Styling
export const InvoiceTemplate = ({ data, isEditor = false, isEditable = false, onContentChange }: { data: any; isEditor?: boolean; isEditable?: boolean; onContentChange?: (newData: any) => void }) => {
  return (
    <div className="bg-gray-50 min-h-screen p-8">
      <div className="max-w-4xl mx-auto bg-white shadow-lg rounded-lg overflow-hidden">
        {/* Invoice Header */}
        <div className="bg-gradient-to-r from-gray-800 to-gray-700 text-white p-8">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold mb-2">INVOICE</h1>
              <p className="text-gray-300">{data.invoiceNumber || 'INV-001'}</p>
            </div>
            <div className="text-right">
              <h2 className="text-xl font-bold">{data.companyName || 'Company Name'}</h2>
              <p className="text-gray-300">{data.companyAddress || 'Company Address'}</p>
            </div>
          </div>
        </div>
        
        {/* Invoice Content */}
        <div className="p-8">
          <div className="grid grid-cols-2 gap-8 mb-8">
            <div>
              <h3 className="font-bold text-gray-800 mb-2">Bill To:</h3>
              <div className="text-gray-700">
                <p className="font-medium">{data.clientName || 'Client Name'}</p>
                <p>{data.clientAddress || 'Client Address'}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-gray-600">Date: <span className="font-medium">{data.date || new Date().toLocaleDateString()}</span></p>
              <p className="text-gray-600">Due Date: <span className="font-medium">{data.dueDate || 'Due Date'}</span></p>
            </div>
          </div>
          
          {/* Sections from AI Data */}
          {data.sections && (
            <div className="space-y-6 mb-8">
              {data.sections.map((section: any, index: number) => (
                <div key={index} className="border rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">{section.title}</h3>
                  <div className="text-gray-700">
                    {typeof section.content === 'string' ? (
                      <p>{section.content}</p>
                    ) : typeof section.content === 'object' && section.content !== null ? (
                      <div className="grid grid-cols-2 gap-4">
                        {Object.entries(section.content).map(([key, value]: [string, any]) => (
                          <div key={key} className="bg-gray-50 p-3 rounded">
                            <span className="font-semibold capitalize text-gray-800">{key.replace(/_/g, ' ')}: </span>
                            <span>{String(value)}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 italic">No content available</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Invoice Items Table */}
          <div className="border rounded-lg overflow-hidden mb-8">
            <table className="w-full">
              <thead className="bg-gray-100">
                <tr>
                  <th className="text-left p-4 font-medium text-gray-800">Description</th>
                  <th className="text-right p-4 font-medium text-gray-800">Quantity</th>
                  <th className="text-right p-4 font-medium text-gray-800">Rate</th>
                  <th className="text-right p-4 font-medium text-gray-800">Amount</th>
                </tr>
              </thead>
              <tbody>
                {data.items?.map((item: any, index: number) => (
                  <tr key={index} className="border-t">
                    <td className="p-4 text-gray-700">{item.description}</td>
                    <td className="p-4 text-right text-gray-700">{item.quantity}</td>
                    <td className="p-4 text-right text-gray-700">${item.rate}</td>
                    <td className="p-4 text-right text-gray-700">${item.amount}</td>
                  </tr>
                )) || (
                  <tr className="border-t">
                    <td className="p-4 text-gray-700">Service/Product Description</td>
                    <td className="p-4 text-right text-gray-700">1</td>
                    <td className="p-4 text-right text-gray-700">$100.00</td>
                    <td className="p-4 text-right text-gray-700">$100.00</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          
          {/* Total */}
          <div className="flex justify-end">
            <div className="w-64 bg-gray-50 p-4 rounded-lg">
              <div className="flex justify-between mb-2">
                <span className="text-gray-600">Subtotal:</span>
                <span className="font-medium">${data.subtotal || '100.00'}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="text-gray-600">Tax:</span>
                <span className="font-medium">${data.tax || '0.00'}</span>
              </div>
              <div className="flex justify-between text-lg font-bold border-t pt-2">
                <span>Total:</span>
                <span>${data.total || '100.00'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Pitch Deck Template Styling
export const PitchDeckTemplate = ({ data, isEditor = false, isEditable = false, onContentChange }: { data: any; isEditor?: boolean; isEditable?: boolean; onContentChange?: (newData: any) => void }) => {
  return (
    <div className="bg-gradient-to-br from-purple-50 to-indigo-50 min-h-screen p-8">
      <div className="max-w-5xl mx-auto">
        {/* Title Slide */}
        <div className="bg-gradient-to-r from-purple-900 to-indigo-900 text-white p-12 rounded-lg mb-8 text-center">
          <h1 className="text-5xl font-bold mb-4">{data.companyName || 'Company Name'}</h1>
          <h2 className="text-2xl text-purple-200 mb-6">{data.tagline || 'Revolutionizing the Future'}</h2>
          <p className="text-purple-100">{data.subtitle || 'Innovative Solutions for Tomorrow'}</p>
        </div>
        
        {/* Slides Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Problem Slide */}
          <div className="bg-white p-8 rounded-lg shadow-lg border-l-4 border-red-500">
            <h3 className="text-2xl font-bold text-gray-800 mb-4">Problem</h3>
            <p className="text-gray-700 leading-relaxed">{data.problem || 'Current market challenges and pain points that need addressing.'}</p>
          </div>
          
          {/* Solution Slide */}
          <div className="bg-white p-8 rounded-lg shadow-lg border-l-4 border-green-500">
            <h3 className="text-2xl font-bold text-gray-800 mb-4">Solution</h3>
            <p className="text-gray-700 leading-relaxed">{data.solution || 'Our innovative approach to solving these challenges.'}</p>
          </div>
          
          {/* Market Slide */}
          <div className="bg-white p-8 rounded-lg shadow-lg border-l-4 border-blue-500">
            <h3 className="text-2xl font-bold text-gray-800 mb-4">Market</h3>
            <p className="text-gray-700 leading-relaxed">{data.market || 'Large and growing market opportunity with significant potential.'}</p>
          </div>
          
          {/* Business Model */}
          <div className="bg-white p-8 rounded-lg shadow-lg border-l-4 border-yellow-500">
            <h3 className="text-2xl font-bold text-gray-800 mb-4">Business Model</h3>
            <p className="text-gray-700 leading-relaxed">{data.businessModel || 'Sustainable revenue model with multiple income streams.'}</p>
          </div>
        </div>
        
        {/* Sections from AI Data */}
        {data.sections && (
          <div className="mt-8 space-y-6">
            {data.sections.map((section: any, index: number) => (
              <div key={index} className="bg-white p-8 rounded-lg shadow-lg border-l-4 border-purple-500">
                <h3 className="text-2xl font-bold text-gray-800 mb-4">{section.title}</h3>
                <div className="text-gray-700 leading-relaxed">
                  {typeof section.content === 'string' ? (
                    <p>{section.content}</p>
                  ) : typeof section.content === 'object' && section.content !== null ? (
                    <div className="grid grid-cols-2 gap-4">
                      {Object.entries(section.content).map(([key, value]: [string, any]) => (
                        <div key={key} className="bg-purple-50 p-3 rounded">
                          <span className="font-semibold capitalize">{key.replace(/_/g, ' ')}: </span>
                          <span>{String(value)}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 italic">No content available</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Financial Projections */}
        <div className="bg-white p-8 rounded-lg shadow-lg mt-8">
          <h3 className="text-2xl font-bold text-gray-800 mb-6 text-center">Financial Projections</h3>
          <div className="grid grid-cols-3 gap-8 text-center">
            <div>
              <h4 className="text-xl font-semibold text-purple-700">Year 1</h4>
              <p className="text-3xl font-bold text-gray-800">{data.year1Revenue || '$100K'}</p>
            </div>
            <div>
              <h4 className="text-xl font-semibold text-purple-700">Year 2</h4>
              <p className="text-3xl font-bold text-gray-800">{data.year2Revenue || '$500K'}</p>
            </div>
            <div>
              <h4 className="text-xl font-semibold text-purple-700">Year 3</h4>
              <p className="text-3xl font-bold text-gray-800">{data.year3Revenue || '$1M'}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Newsletter Template Styling
export const NewsletterTemplate = ({ data, isEditor = false, isEditable = false, onContentChange }: { data: any; isEditor?: boolean; isEditable?: boolean; onContentChange?: (newData: any) => void }) => {
  return (
    <div className="bg-blue-50 min-h-screen p-8">
      <div className="max-w-4xl mx-auto bg-white shadow-xl rounded-lg overflow-hidden">
        {/* Newsletter Header */}
        <div className="bg-gradient-to-r from-blue-800 to-blue-600 text-white p-8">
          <div className="flex items-center justify-between mb-6">
            {/* Logo */}
            {(data.cover?.logo || data.logo) && (
              <div className="flex-shrink-0">
                <img 
                  src={data.cover?.logo || data.logo} 
                  alt="Logo" 
                  className="h-16 w-auto object-contain bg-white p-2 rounded"
                />
              </div>
            )}
            
            {/* Newsletter Info */}
            <div className="flex-1 text-center">
              <h1 className="text-4xl font-bold mb-2">
                {data.header?.title || data.title || 'Newsletter Title'}
              </h1>
              <div className="text-blue-200 space-x-4">
                <span>{data.header?.issue || data.subtitle || 'Monthly Update'}</span>
                {(data.header?.date || data.date) && (
                  <>
                    <span>•</span>
                    <span>{data.header?.date || data.date}</span>
                  </>
                )}
              </div>
            </div>
            
            {/* Spacer for balance */}
            <div className="flex-shrink-0 w-16"></div>
          </div>
        </div>
        
        {/* Newsletter Content */}
        <div className="p-8">
          {/* Featured Article */}
          <div className="mb-8 border-b pb-8">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">{data.featuredTitle || 'Featured Article'}</h2>
            <p className="text-gray-700 leading-relaxed text-lg">{data.featuredContent || 'Main newsletter content and featured article details.'}</p>
          </div>
          
          {/* Sections from AI Data */}
          {data.sections && (
            <div className="space-y-8 mb-8">
              {data.sections.map((section: any, index: number) => (
                <div key={index} className="bg-blue-50 p-6 rounded-lg">
                  <h3 className="text-xl font-bold text-gray-800 mb-3">{section.title}</h3>
                  <div className="text-gray-700">
                    {typeof section.content === 'string' ? (
                      <p>{section.content}</p>
                    ) : typeof section.content === 'object' && section.content !== null ? (
                      <div className="grid grid-cols-2 gap-3">
                        {Object.entries(section.content).map(([key, value]: [string, any]) => (
                          <div key={key} className="bg-white p-2 rounded">
                            <span className="font-semibold capitalize text-blue-800">{key.replace(/_/g, ' ')}: </span>
                            <span>{String(value)}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 italic">No content available</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Articles Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            {data.articles?.map((article: any, index: number) => (
              <div key={index} className="bg-blue-50 p-6 rounded-lg">
                <h3 className="text-xl font-bold text-gray-800 mb-3">{article.title}</h3>
                <p className="text-gray-700">{article.content}</p>
              </div>
            )) || (
              <>
                <div className="bg-blue-50 p-6 rounded-lg">
                  <h3 className="text-xl font-bold text-gray-800 mb-3">Article Title 1</h3>
                  <p className="text-gray-700">Article content and summary goes here.</p>
                </div>
                <div className="bg-blue-50 p-6 rounded-lg">
                  <h3 className="text-xl font-bold text-gray-800 mb-3">Article Title 2</h3>
                  <p className="text-gray-700">Article content and summary goes here.</p>
                </div>
              </>
            )}
          </div>
          
          {/* Footer */}
          <div className="text-center bg-gray-100 p-6 rounded-lg">
            <div className="text-gray-600">
              {typeof data.footer === 'object' && data.footer ? (
                <div className="space-y-2">
                  {data.footer.contact && <p>{data.footer.contact}</p>}
                  {data.footer.unsubscribe && <p>{data.footer.unsubscribe}</p>}
                </div>
              ) : (
                <p>{data.footer || 'Thank you for reading! Visit our website for more updates.'}</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Report Template Styling - Enhanced with actual PDF template layouts
export const ReportTemplate = ({ data, templateName, isEditor = false, isEditable = false, onContentChange }: { data: any; templateName?: string; isEditor?: boolean; isEditable?: boolean; onContentChange?: (newData: any) => void }) => {
  // Enhanced template detection and styling based on database template
  const currentTemplateName = data.templateInfo?.templateName || templateName || '';
  
  console.log('🎨 Using PDF Template Layout for:', currentTemplateName);
  
  // Use exact PDF template layouts based on template name
  if (currentTemplateName === "International Business Annual Report") {
    return <InternationalBusinessAnnualReportLayout data={data} isEditable={isEditable} onContentChange={onContentChange} />;
  }
  
  if (currentTemplateName === "Green Corporate Annual Report") {
    return <GreenCorporateAnnualReportLayout data={data} isEditable={isEditable} onContentChange={onContentChange} />;
  }
  
  if (currentTemplateName === "Corporate Annual Report" || currentTemplateName === "White Blue Corporate Annual Report") {
    return <WhiteBlueCorporateAnnualReportLayout data={data} isEditable={isEditable} onContentChange={onContentChange} />;
  }
  
  if (currentTemplateName === "Financial Report" || currentTemplateName?.includes("Black Minimalist") || currentTemplateName?.includes("Financial Report")) {
    return <BlackMinimalistFinancialReportLayout data={data} isEditable={isEditable} onContentChange={onContentChange} />;
  }

  // Fallback template detection for generic styling
  const templateSector = data.templateInfo?.sector || '';
  const isFinancialReport = currentTemplateName.toLowerCase().includes('financial') || templateSector === 'finance';
  const isCorporateReport = currentTemplateName.toLowerCase().includes('corporate') || currentTemplateName.toLowerCase().includes('annual');
  const isInternationalReport = currentTemplateName.toLowerCase().includes('international');
  
  // Debug logging to check template detection
  console.log('🎨 Template Detection Debug (Fallback):', {
    currentTemplateName,
    templateSector,
    isFinancialReport,
    isCorporateReport,
    isInternationalReport,
    templateName
  });

  // Template-specific styling configuration
  const getTemplateStyle = () => {
    if (isFinancialReport) {
      return {
        backgroundGradient: 'bg-gradient-to-r from-blue-900 to-indigo-800',
        accentColor: 'blue',
        cardStyle: 'bg-gradient-to-br from-blue-50 to-indigo-50',
        borderColor: 'border-blue-500'
      };
    } else if (isCorporateReport) {
      return {
        backgroundGradient: 'bg-gradient-to-r from-gray-800 to-slate-800',
        accentColor: 'gray',
        cardStyle: 'bg-gradient-to-br from-gray-50 to-slate-50',
        borderColor: 'border-gray-500'
      };
    } else if (isInternationalReport) {
      return {
        backgroundGradient: 'bg-gradient-to-r from-emerald-800 to-teal-800',
        accentColor: 'emerald',
        cardStyle: 'bg-gradient-to-br from-emerald-50 to-teal-50',
        borderColor: 'border-emerald-500'
      };
    }
    // Default styling
    return {
      backgroundGradient: 'bg-gradient-to-r from-gray-900 to-gray-700',
      accentColor: 'gray',
      cardStyle: 'bg-gradient-to-br from-gray-50 to-slate-50',
      borderColor: 'border-gray-500'
    };
  };

  const templateStyle = getTemplateStyle();



  return (
    <div className="bg-gray-50 min-h-screen p-8">
      <div className="max-w-5xl mx-auto bg-white shadow-xl rounded-lg overflow-hidden">
        {/* Report Header - Database template-specific styling */}
        <div className={`${templateStyle.backgroundGradient} text-white p-12 text-center`}>
          <h1 className="text-4xl font-bold mb-4">{currentTemplateName || data.title || 'Annual Report'}</h1>
          <p className="text-gray-300 text-xl">{data.year || new Date().getFullYear()} • {data.company || 'Company Report'}</p>
          {isFinancialReport && (
            <div className="mt-4 inline-block bg-white bg-opacity-20 rounded-full px-6 py-2">
              <span className="text-sm font-medium text-blue-100">Financial Analysis Report</span>
            </div>
          )}
          {isCorporateReport && (
            <div className="mt-4 inline-block bg-white bg-opacity-20 rounded-full px-6 py-2">
              <span className="text-sm font-medium text-gray-100">Corporate Annual Report</span>
            </div>
          )}
          {isInternationalReport && (
            <div className="mt-4 inline-block bg-white bg-opacity-20 rounded-full px-6 py-2">
              <span className="text-sm font-medium text-emerald-100">International Business Report</span>
            </div>
          )}
        </div>
        
        {/* Cover Section (if available) */}
        {data.cover && (
          <div className="p-8 border-b-4 border-gray-200">
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <div className="text-center space-y-4">
                <h2 className="text-2xl font-bold text-gray-800">{data.cover.companyName || data.cover.title || 'Company Report'}</h2>
                {data.cover.year && <p className="text-lg text-gray-600">{data.cover.year}</p>}
                {data.cover.preparedBy && <p className="text-sm text-gray-500">Prepared by: {data.cover.preparedBy}</p>}
                {data.cover.presentedTo && <p className="text-sm text-gray-500">Presented to: {data.cover.presentedTo}</p>}
                {data.cover.contact && (
                  <div className="text-sm text-gray-500 space-y-1">
                    {data.cover.contact.phone && <p>Phone: {data.cover.contact.phone}</p>}
                    {data.cover.contact.email && <p>Email: {data.cover.contact.email}</p>}
                    {data.cover.contact.website && <p>Website: {data.cover.contact.website}</p>}
                    {data.cover.contact.social && <p>Social: {data.cover.contact.social}</p>}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Report Sections */}
        <div className="p-8">
          {data.sections?.map((section: any, index: number) => (
            <div key={index} className="mb-12 pb-8 border-b border-gray-200 last:border-b-0">
              <h2 className="text-3xl font-bold text-gray-800 mb-6">{section.title}</h2>
              {/* Inline content rendering */}
              {typeof section.content === 'string' ? (
                <p className="text-gray-700 leading-relaxed text-lg">{section.content}</p>
              ) : typeof section.content === 'object' && section.content !== null ? (
                <div className="space-y-6">
                  {Object.entries(section.content).map(([key, value]: [string, any]) => {
                    // Handle nested objects (like revenue_metrics, profitability_metrics)
                    if (typeof value === 'object' && value !== null) {
                      return (
                        <div key={key} className={`${templateStyle.cardStyle} p-6 rounded-lg border-l-4 ${templateStyle.borderColor}`}>
                          <h4 className={`text-lg font-bold mb-4 capitalize ${
                            isFinancialReport ? 'text-blue-800' : isCorporateReport ? 'text-gray-800' : isInternationalReport ? 'text-emerald-800' : 'text-gray-800'
                          }`}>
                            {key.replace(/_/g, ' ').replace(/metrics/g, 'Metrics').replace(/([A-Z])/g, ' $1').trim()}
                          </h4>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {Object.entries(value).map(([subKey, subValue]: [string, any]) => (
                              <div key={subKey} className={`bg-white p-4 rounded-lg shadow-sm border ${
                                isFinancialReport ? 'border-blue-100' : isCorporateReport ? 'border-gray-100' : isInternationalReport ? 'border-emerald-100' : 'border-gray-100'
                              }`}>
                                <div className="text-xs font-medium text-gray-600 mb-2 capitalize">
                                  {subKey.replace(/_/g, ' ').replace(/([A-Z])/g, ' $1').trim()}
                                </div>
                                <div className={`text-lg font-bold ${
                                  isFinancialReport ? 'text-blue-700' : isCorporateReport ? 'text-gray-700' : isInternationalReport ? 'text-emerald-700' : 'text-gray-700'
                                }`}>{String(subValue)}</div>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    }
                    
                    // Handle simple key-value pairs
                    const gradientClass = isFinancialReport 
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600' 
                      : isCorporateReport 
                      ? 'bg-gradient-to-r from-gray-600 to-slate-600'
                      : isInternationalReport
                      ? 'bg-gradient-to-r from-emerald-600 to-teal-600'
                      : 'bg-gradient-to-r from-gray-600 to-slate-600';
                    
                    return (
                      <div key={key} className={`${gradientClass} text-white p-6 rounded-lg shadow-lg`}>
                        <h4 className="text-sm font-semibold text-white opacity-80 mb-2 capitalize">
                          {key.replace(/_/g, ' ').replace(/([A-Z])/g, ' $1').trim()}
                        </h4>
                        <p className="text-2xl font-bold">{String(value)}</p>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-gray-500 italic">No content available</p>
              )}
            </div>
          )) || (
            // Fallback content with template-specific styling when no sections exist
            <div className="space-y-8">
              <div className={`${templateStyle.cardStyle} p-8 rounded-lg border-l-4 ${templateStyle.borderColor}`}>
                <h3 className={`text-2xl font-bold mb-4 ${
                  isFinancialReport ? 'text-blue-800' : isCorporateReport ? 'text-gray-800' : isInternationalReport ? 'text-emerald-800' : 'text-gray-800'
                }`}>
                  {isFinancialReport ? 'Financial Performance' : isCorporateReport ? 'Corporate Overview' : isInternationalReport ? 'Global Market Analysis' : 'Report Analysis'}
                </h3>
                <p className="text-gray-700 leading-relaxed">This document contains important information relevant to your request. The content structure is being processed and will be available shortly.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Brochure Template Styling - Professional Three-Column Layout
export const BrochureTemplate = ({ data, isEditor = false, onContentChange }: { data: any; isEditor?: boolean; onContentChange?: (newData: any) => void }) => {
  // Enhanced brochure data extraction with multiple fallback paths
  const panels = data.panels || data.content?.panels || [];
  const coverPanel = panels.find((p: any) => p.type === 'cover') || panels[0] || {};
  const contentPanels = panels.filter((p: any) => p.type !== 'cover');
  
  // Extract logo information from various possible locations
  const logoPath = data.cover?.logo || data.logo || data.content?.cover?.logo || data.content?.logo;
  const hasLogo = !!logoPath;
  
  console.log('BrochureTemplate received data:', data);
  console.log('BrochureTemplate panels:', panels);
  console.log('BrochureTemplate logo:', logoPath);
  console.log('BrochureTemplate hasLogo:', hasLogo);
  
  // Organize content for three-column layout
  const aboutPanel = contentPanels.find((p: any) => p.type === 'about') || contentPanels[0];
  const servicesPanel = contentPanels.find((p: any) => p.type === 'services') || contentPanels[1];
  const contactPanel = contentPanels.find((p: any) => p.type === 'contact') || contentPanels[contentPanels.length - 1];
  const credentialsPanel = contentPanels.find((p: any) => p.type === 'credentials') || contentPanels[2];
  
  return (
    <div className="bg-white min-h-screen" style={{ fontFamily: 'Arial, sans-serif' }}>
      {/* Professional Brochure - Single Page Three-Column Layout */}
      <div className="w-full max-w-none mx-0 p-0">
        {/* Professional Tri-Fold Brochure Layout */}
        <div className="w-full bg-white shadow-lg" style={{ aspectRatio: '11/8.5', minHeight: '850px' }}>
          
          {/* Three-Column Layout Container */}
          <div className="grid grid-cols-3 h-full divide-x divide-gray-200">
            
            {/* LEFT COLUMN - Cover/Front Panel */}
            <div className="bg-gradient-to-b from-teal-700 to-teal-900 text-white p-8 flex flex-col justify-between relative">
              {/* Logo in header */}
              {hasLogo && (
                <div className="absolute top-6 left-6">
                  <img 
                    src={logoPath} 
                    alt="Company Logo" 
                    className="h-12 w-auto object-contain"
                    onError={(e) => {
                      console.log('Logo failed to load:', logoPath);
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                </div>
              )}
              
              {/* Main Title Area */}
              <div className="text-center mt-16">
                <h1 className="text-4xl font-bold mb-4 leading-tight">
                  {coverPanel.title || data.title || 'Business Brochure'}
                </h1>
                <h2 className="text-xl text-teal-200 mb-6">
                  {coverPanel.subtitle || data.subtitle || 'Professional Services'}
                </h2>
                <div className="w-16 h-1 bg-white mx-auto mb-6"></div>
                <p className="text-sm leading-relaxed text-teal-100">
                  {coverPanel.content || data.description || 'Discover our comprehensive business solutions designed to drive your success.'}
                </p>
              </div>
              
              {/* Footer Logo */}
              {hasLogo && (
                <div className="text-center">
                  <img 
                    src={logoPath} 
                    alt="Company Logo" 
                    className="h-8 w-auto object-contain mx-auto opacity-80"
                  />
                </div>
              )}
            </div>

            {/* MIDDLE COLUMN - About & Services */}
            <div className="bg-white p-8 flex flex-col">
              {/* About Section */}
              <div className="mb-8">
                <h3 className="text-2xl font-bold text-teal-800 mb-4 border-b-2 border-teal-200 pb-2">
                  {aboutPanel?.title || 'About Us'}
                </h3>
                <p className="text-gray-700 text-sm leading-relaxed">
                  {aboutPanel?.content || 'We are a leading provider of professional business solutions, committed to delivering exceptional value and service to our clients worldwide.'}
                </p>
              </div>

              {/* Services Section */}
              <div className="flex-1">
                <h3 className="text-2xl font-bold text-teal-800 mb-4 border-b-2 border-teal-200 pb-2">
                  {servicesPanel?.title || 'Our Services'}
                </h3>
                <p className="text-gray-700 text-sm leading-relaxed">
                  {servicesPanel?.content || 'Our comprehensive suite of services includes consulting, implementation, support, and training solutions tailored to meet your specific business requirements.'}
                </p>
              </div>
            </div>

            {/* RIGHT COLUMN - Credentials & Contact */}
            <div className="bg-gray-50 p-8 flex flex-col">
              {/* Credentials/Why Choose Us Section */}
              <div className="mb-8">
                <h3 className="text-2xl font-bold text-teal-800 mb-4 border-b-2 border-teal-200 pb-2">
                  {credentialsPanel?.title || 'Why Choose Us'}
                </h3>
                <p className="text-gray-700 text-sm leading-relaxed">
                  {credentialsPanel?.content || 'Our proven track record, industry expertise, and commitment to excellence make us the trusted choice for businesses seeking reliable solutions and outstanding results.'}
                </p>
              </div>

              {/* Contact Section */}
              <div className="flex-1">
                <h3 className="text-2xl font-bold text-teal-800 mb-4 border-b-2 border-teal-200 pb-2">
                  {contactPanel?.title || 'Contact Us'}
                </h3>
                <div className="text-gray-700 text-sm leading-relaxed space-y-2">
                  {contactPanel?.content ? (
                    <p>{contactPanel.content}</p>
                  ) : (
                    <>
                      <p className="font-semibold">Get in touch today</p>
                      <p>📧 info@company.com</p>
                      <p>📞 +1 (555) 123-4567</p>
                      <p>🌐 www.company.com</p>
                      <p>📍 123 Business Ave, Suite 100<br />City, State 12345</p>
                    </>
                  )}
                </div>
              </div>

              {/* Bottom Logo */}
              {hasLogo && (
                <div className="text-center mt-6 pt-4 border-t border-gray-300">
                  <img 
                    src={logoPath} 
                    alt="Company Logo" 
                    className="h-6 w-auto object-contain mx-auto opacity-60"
                  />
                </div>
              )}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};