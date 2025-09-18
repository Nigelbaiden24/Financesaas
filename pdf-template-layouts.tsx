import React from 'react';

// Make content editable component
const EditableText = ({ 
  children, 
  isEditable, 
  onEdit, 
  className = "",
  field = "",
  style = {},
  multiline = false
}: { 
  children: React.ReactNode; 
  isEditable?: boolean; 
  onEdit?: (newValue: string) => void;
  className?: string;
  field?: string;
  style?: React.CSSProperties;
  multiline?: boolean;
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
    if (e.key === 'Enter' && !multiline && !e.shiftKey) {
      e.preventDefault();
      handleBlur();
    } else if (e.key === 'Escape') {
      setValue(String(children));
      setIsEditing(false);
    }
  };

  if (isEditing) {
    return multiline ? (
      <textarea
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        className={`${className} border-2 border-blue-500 bg-white resize-none`}
        style={style}
        autoFocus
        rows={4}
        data-testid={`textarea-${field}`}
      />
    ) : (
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
      className={`${className} ${isEditable ? 'cursor-pointer hover:bg-blue-100 hover:bg-opacity-50 border-2 border-transparent hover:border-blue-300 rounded px-1 transition-all duration-200 select-none' : ''}`}
      onClick={handleClick}
      style={style}
      title={isEditable ? "Click to edit or drag to move" : ""}
      data-testid={`text-${field}`}
      draggable={isEditable}
      onDragStart={(e) => {
        if (isEditable) {
          e.dataTransfer.setData('text/plain', String(children));
          e.dataTransfer.setData('application/json', JSON.stringify({ field, content: String(children) }));
        }
      }}
    >
      {children}
    </span>
  );
};

// Green Corporate Annual Report Layout
export function GreenCorporateAnnualReportLayout({ data, isEditable = false, onContentChange }: { data: any; isEditable?: boolean; onContentChange?: (newData: any) => void }) {
  
  const handleEdit = (field: string, newValue: string) => {
    if (onContentChange) {
      const updatedData = { ...data };
      
      // Handle nested field updates
      if (field.includes('.')) {
        const keys = field.split('.');
        let current = updatedData;
        for (let i = 0; i < keys.length - 1; i++) {
          if (!current[keys[i]]) current[keys[i]] = {};
          current = current[keys[i]];
        }
        current[keys[keys.length - 1]] = newValue;
      } else {
        updatedData[field] = newValue;
      }
      
      onContentChange(updatedData);
    }
  };

  const handleSectionEdit = (sectionIndex: number, field: string, newValue: string) => {
    if (onContentChange && data.sections) {
      const updatedSections = [...data.sections];
      updatedSections[sectionIndex] = {
        ...updatedSections[sectionIndex],
        [field]: newValue
      };
      onContentChange({
        ...data,
        sections: updatedSections
      });
    }
  };
  const company = data.cover?.companyName || 'Company Name';
  const year = data.cover?.year || '2025';
  const preparedBy = data.cover?.preparedBy || 'Prepared By';
  const presentedTo = data.cover?.presentedTo || 'Presented To';
  const phone = data.cover?.contact?.phone || '123-456-7890';
  const social = data.cover?.contact?.social || '@reallygreatsite';
  const website = data.cover?.contact?.website || 'www.reallygreatsite.com';

  return (
    <div className="bg-white min-h-full font-serif">
      {/* Cover Page - Exact Green Corporate Layout */}
      <div className="min-h-screen bg-gradient-to-br from-green-600 to-green-800 text-white flex flex-col justify-between p-12">
        {/* Company Name - Top Left */}
        <div className="text-left">
          <h1 className="text-4xl font-bold tracking-wider">
            <EditableText 
              isEditable={isEditable}
              onEdit={(newValue) => handleEdit('cover.companyName', newValue)}
              className="text-4xl font-bold tracking-wider"
              field="company-name"
            >
              {company}
            </EditableText>
          </h1>
        </div>
        
        {/* Year and Title - Center */}
        <div className="text-center flex-1 flex flex-col justify-center">
          <div className="text-8xl font-bold mb-4">
            <EditableText 
              isEditable={isEditable}
              onEdit={(newValue) => handleEdit('cover.year', newValue)}
              className="text-8xl font-bold"
              field="year"
            >
              {year}
            </EditableText>
          </div>
          <div className="text-6xl font-light tracking-[0.3em] mb-2">ANNUAL</div>
          <div className="text-6xl font-light tracking-[0.3em]">REPORT</div>
        </div>
        
        {/* Bottom Section */}
        <div className="flex justify-between items-end">
          {/* Left - Prepared By */}
          <div className="text-left">
            <div className="text-sm font-semibold mb-1">PREPARED BY :</div>
            <div className="text-lg">
              <EditableText 
                isEditable={isEditable}
                onEdit={(newValue) => handleEdit('cover.preparedBy', newValue)}
                className="text-lg"
                field="prepared-by"
              >
                {preparedBy}
              </EditableText>
            </div>
            <div className="text-sm font-semibold mb-1 mt-4">PRESENTED TO :</div>
            <div className="text-lg">
              <EditableText 
                isEditable={isEditable}
                onEdit={(newValue) => handleEdit('cover.presentedTo', newValue)}
                className="text-lg"
                field="presented-to"
              >
                {presentedTo}
              </EditableText>
            </div>
          </div>
          
          {/* Right - Contact Info */}
          <div className="text-right space-y-2">
            <div className="text-sm">📞 {phone}</div>
            <div className="text-sm">📱 {social}</div>
            <div className="text-sm">🌐 {website}</div>
          </div>
        </div>
      </div>

      {/* Multi-Page Content Structure */}
      {data.sections && (
        <>
          {/* Executive Summary - Always Page 2 */}
          {data.sections.find((s: any) => s.type === 'executive_summary') && (
            <div className="min-h-screen bg-white p-12 flex flex-col">
              {/* Small logo in corner for content pages */}
              {data.cover?.logo && (
                <div className="absolute top-8 right-8">
                  <img 
                    src={data.cover.logo} 
                    alt="Company Logo" 
                    className="w-12 h-12 object-contain opacity-60"
                  />
                </div>
              )}
              
              <div className="border-l-4 border-green-600 pl-8 flex-1">
                <h2 className="text-4xl font-bold text-gray-800 mb-8 uppercase tracking-wide">
                  Executive Summary
                </h2>
                <div className="text-lg text-gray-700 leading-relaxed space-y-6">
                  <p>
                    <EditableText 
                      isEditable={isEditable}
                      onEdit={(newValue) => {
                        const sectionIndex = data.sections.findIndex((s: any) => s.type === 'executive_summary');
                        if (sectionIndex >= 0) {
                          handleSectionEdit(sectionIndex, 'content', newValue);
                        }
                      }}
                      className="text-lg text-gray-700 leading-relaxed"
                      field="executive-summary"
                      multiline={true}
                    >
                      {data.sections.find((s: any) => s.type === 'executive_summary')?.content}
                    </EditableText>
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Each Additional Section Gets Its Own Page */}
          {data.sections.filter((s: any) => s.type !== 'executive_summary').map((section: any, index: number) => (
            <div key={index} className="min-h-screen bg-white p-12 flex flex-col">
              {/* Small logo in corner for content pages */}
              {data.cover?.logo && (
                <div className="absolute top-8 right-8">
                  <img 
                    src={data.cover.logo} 
                    alt="Company Logo" 
                    className="w-12 h-12 object-contain opacity-60"
                  />
                </div>
              )}
              
              <div className="border-l-4 border-green-600 pl-8 flex-1">
                <h2 className="text-4xl font-bold text-gray-800 mb-8 uppercase tracking-wide">
                  <EditableText 
                    isEditable={isEditable}
                    onEdit={(newValue) => handleSectionEdit(index, 'title', newValue)}
                    className="text-4xl font-bold text-gray-800 uppercase tracking-wide"
                    field={`section-title-${index}`}
                  >
                    {section.title}
                  </EditableText>
                </h2>
                <div className="text-lg text-gray-700 leading-relaxed space-y-6">
                  {typeof section.content === 'string' ? (
                    <p className="whitespace-pre-line">
                      <EditableText 
                        isEditable={isEditable}
                        onEdit={(newValue) => handleSectionEdit(index, 'content', newValue)}
                        className="text-lg text-gray-700 leading-relaxed"
                        field={`section-content-${index}`}
                        multiline={true}
                      >
                        {section.content}
                      </EditableText>
                    </p>
                  ) : (
                    <div className="grid grid-cols-1 gap-6">
                      {Object.entries(section.content).map(([key, value]: [string, any]) => (
                        <div key={key} className="bg-green-50 p-6 rounded-lg border border-green-200">
                          <h4 className="font-semibold text-green-800 mb-3 capitalize text-xl">
                            {key.replace(/_/g, ' ')}
                          </h4>
                          <p className="text-gray-700 text-lg">
                            <EditableText 
                              isEditable={isEditable}
                              onEdit={(newValue) => {
                                const updatedContent = { ...section.content, [key]: newValue };
                                handleSectionEdit(index, 'content', updatedContent);
                              }}
                              className="text-gray-700 text-lg"
                              field={`section-${index}-${key}`}
                              multiline={true}
                            >
                              {String(value)}
                            </EditableText>
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </>
      )}
    </div>
  );
}

// International Business Annual Report Layout - Exact from PDF template
export function InternationalBusinessAnnualReportLayout({ data, isEditable = false, onContentChange }: { data: any; isEditable?: boolean; onContentChange?: (newData: any) => void }) {
  
  const handleEdit = (field: string, newValue: string) => {
    if (onContentChange) {
      const updatedData = { ...data };
      if (field.includes('.')) {
        const keys = field.split('.');
        let current = updatedData;
        for (let i = 0; i < keys.length - 1; i++) {
          if (!current[keys[i]]) current[keys[i]] = {};
          current = current[keys[i]];
        }
        current[keys[keys.length - 1]] = newValue;
      } else {
        updatedData[field] = newValue;
      }
      onContentChange(updatedData);
    }
  };

  const handleSectionEdit = (sectionIndex: number, field: string, newValue: string) => {
    if (onContentChange && data.sections) {
      const updatedSections = [...data.sections];
      updatedSections[sectionIndex] = {
        ...updatedSections[sectionIndex],
        [field]: newValue
      };
      onContentChange({
        ...data,
        sections: updatedSections
      });
    }
  };
  const company = data.cover?.companyName || 'Company Name';
  const year = data.cover?.year || '2025';
  const email = data.cover?.contactDetails?.email || data.cover?.email || 'hello@reallygreatsite.com';
  const website = data.cover?.contactDetails?.website || data.cover?.website || 'www.reallygreatsite.com';
  const logo = data.cover?.logo;

  return (
    <div className="bg-white min-h-screen font-serif">
      {/* Cover Page - Exact International Business Layout matching PDF */}
      <div className="h-screen bg-white text-gray-800 flex flex-col justify-center items-center p-12 relative">
        {/* Logo - Top Center Large (Cover Page) */}
        {logo && logo !== 'transparent-logo.png' && (
          <div className="absolute top-16 left-1/2 transform -translate-x-1/2">
            <img 
              src={logo} 
              alt="Company Logo" 
              className="w-32 h-32 object-contain rounded-lg shadow-lg"
              onError={(e) => {
                // Fallback if logo fails to load
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
              }}
            />
          </div>
        )}
        
        {/* Company Name - Top Center */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-800 tracking-wide">{company}</h1>
        </div>
        
        {/* Main Title - Center */}
        <div className="text-center mb-16">
          <div className="text-7xl font-bold text-gray-800 tracking-[0.2em] mb-4">ANNUAL</div>
          <div className="text-7xl font-bold text-gray-800 tracking-[0.2em]">REPORT</div>
          <div className="text-3xl font-light text-gray-600 mt-8">{year}</div>
        </div>
        
        {/* Bottom Contact Info */}
        <div className="absolute bottom-12 left-1/2 transform -translate-x-1/2 text-center space-y-2 text-sm text-gray-600">
          <div>📧 {email}</div>
          <div>🌐 {website}</div>
        </div>
      </div>

      {/* Multi-Page Content Structure */}
      {data.sections && (
        <>
          {/* Executive Summary - Always Page 2 */}
          {data.sections.find((s: any) => s.type === 'executive_summary') && (
            <div className="min-h-screen bg-white p-12 flex flex-col relative">
              {/* Small logo in corner for content pages */}
              {logo && (
                <div className="absolute top-8 right-8">
                  <img 
                    src={logo} 
                    alt="Company Logo" 
                    className="w-12 h-12 object-contain opacity-60"
                  />
                </div>
              )}
              
              <div className="border-l-4 border-emerald-600 pl-8 flex-1">
                <h2 className="text-4xl font-bold text-emerald-800 mb-8 uppercase tracking-wide">
                  Executive Summary
                </h2>
                <div className="text-lg text-gray-700 leading-relaxed space-y-6">
                  <p className="whitespace-pre-line">{data.sections.find((s: any) => s.type === 'executive_summary')?.content}</p>
                </div>
              </div>
            </div>
          )}

          {/* Each Additional Section Gets Its Own Page */}
          {data.sections.filter((s: any) => s.type !== 'executive_summary').map((section: any, index: number) => (
            <div key={index} className="min-h-screen bg-white p-12 flex flex-col relative">
              {/* Small logo in corner for content pages */}
              {logo && (
                <div className="absolute top-8 right-8">
                  <img 
                    src={logo} 
                    alt="Company Logo" 
                    className="w-12 h-12 object-contain opacity-60"
                  />
                </div>
              )}
              
              <div className="border-l-4 border-emerald-600 pl-8 flex-1">
                <h2 className="text-4xl font-bold text-emerald-800 mb-8 uppercase tracking-wide">
                  {section.title}
                </h2>
                <div className="text-lg text-gray-700 leading-relaxed space-y-6">
                  <p className="whitespace-pre-line">{section.content}</p>
                </div>
              </div>
            </div>
          ))}
        </>
      )}
    </div>
  );
}

// White Blue Corporate Annual Report Layout
export function WhiteBlueCorporateAnnualReportLayout({ data, isEditable = false, onContentChange }: { data: any; isEditable?: boolean; onContentChange?: (newData: any) => void }) {
  
  const handleEdit = (field: string, newValue: string) => {
    if (onContentChange) {
      const updatedData = { ...data };
      if (field.includes('.')) {
        const keys = field.split('.');
        let current = updatedData;
        for (let i = 0; i < keys.length - 1; i++) {
          if (!current[keys[i]]) current[keys[i]] = {};
          current = current[keys[i]];
        }
        current[keys[keys.length - 1]] = newValue;
      } else {
        updatedData[field] = newValue;
      }
      onContentChange(updatedData);
    }
  };

  const handleSectionEdit = (sectionIndex: number, field: string, newValue: string) => {
    if (onContentChange && data.sections) {
      const updatedSections = [...data.sections];
      updatedSections[sectionIndex] = {
        ...updatedSections[sectionIndex],
        [field]: newValue
      };
      onContentChange({
        ...data,
        sections: updatedSections
      });
    }
  };
  const company = data.cover?.companyName || 'Company Name';
  const year = data.cover?.year || '2025';
  const preparedBy = data.cover?.preparedBy || 'Prepared By';
  const presentedTo = data.cover?.presentedTo || 'Presented To';
  const phone = data.cover?.contact?.phone || '123-456-7890';
  const social = data.cover?.contact?.social || '@reallygreatsite';
  const website = data.cover?.contact?.website || 'www.reallygreatsite.com';

  const logo = data.cover?.logo;

  return (
    <div className="bg-white min-h-screen font-serif">
      {/* Cover Page - Exact White Blue Layout */}
      <div className="cover-page h-screen bg-white text-gray-800 flex flex-col justify-between p-12 relative">
        {/* Logo - Top Center Large (Cover Page) */}
        {logo && logo !== 'transparent-logo.png' && (
          <div className="absolute top-16 left-1/2 transform -translate-x-1/2">
            <img 
              src={logo} 
              alt="Company Logo" 
              className="w-32 h-32 object-contain rounded-lg shadow-lg"
              onError={(e) => {
                // Fallback if logo fails to load
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
              }}
            />
          </div>
        )}

        {/* Company Name - Centered at Top */}
        <div className="text-center pt-32">
          <h1 className="text-5xl font-bold text-blue-900 tracking-wider">{company}</h1>
        </div>
        
        {/* Title and Year - Center */}
        <div className="text-center flex-1 flex flex-col justify-center">
          <div className="text-7xl font-bold text-blue-800 tracking-[0.2em] mb-4">ANNUAL</div>
          <div className="text-7xl font-bold text-blue-800 tracking-[0.2em] mb-8">REPORT</div>
          <div className="text-4xl font-light text-gray-600">{year}</div>
        </div>
        
        {/* Bottom Section */}
        <div className="flex justify-between items-end">
          {/* Left - Prepared By */}
          <div className="text-left">
            <div className="text-sm font-semibold text-gray-600 mb-1">PREPARED BY :</div>
            <div className="text-lg font-medium text-gray-800">{preparedBy}</div>
          </div>
          
          {/* Right - Presented To */}
          <div className="text-right">
            <div className="text-sm font-semibold text-gray-600 mb-1">PRESENTED TO :</div>
            <div className="text-lg font-medium text-gray-800">{presentedTo}</div>
          </div>
        </div>
        
        {/* Contact Info - Bottom Center */}
        <div className="text-center mt-8 space-y-1 text-sm text-gray-500">
          <div>📞 {phone}</div>
          <div>📱 {social}</div>
          <div>🌐 {website}</div>
        </div>
      </div>

      {/* Multi-Page Content Structure with Proper Page Breaks */}
      {data.sections && (
        <>
          {/* Executive Summary - Always Page 2 */}
          {data.sections.find((s: any) => s.type === 'executive_summary') && (
            <div className="page-break-before h-screen bg-white p-12 flex flex-col relative" style={{ pageBreakBefore: 'always', breakBefore: 'page' }}>
              {/* Small logo in corner for content pages */}
              {logo && logo !== 'transparent-logo.png' && (
                <div className="absolute top-8 right-8">
                  <img 
                    src={logo} 
                    alt="Company Logo" 
                    className="w-12 h-12 object-contain opacity-60"
                  />
                </div>
              )}
              
              <div className="border-l-4 border-blue-600 pl-8 flex-1">
                <h2 className="text-4xl font-bold text-blue-800 mb-8 uppercase tracking-wide">
                  Executive Summary
                </h2>
                <div className="text-lg text-gray-700 leading-relaxed space-y-6">
                  <p className="whitespace-pre-line">{data.sections.find((s: any) => s.type === 'executive_summary')?.content}</p>
                </div>
              </div>
            </div>
          )}

          {/* Each Additional Section Gets Its Own Page */}
          {data.sections.filter((s: any) => s.type !== 'executive_summary').map((section: any, index: number) => (
            <div key={index} className="page-break-before h-screen bg-white p-12 flex flex-col relative" style={{ pageBreakBefore: 'always', breakBefore: 'page' }}>
              {/* Small logo in corner for content pages */}
              {logo && logo !== 'transparent-logo.png' && (
                <div className="absolute top-8 right-8">
                  <img 
                    src={logo} 
                    alt="Company Logo" 
                    className="w-12 h-12 object-contain opacity-60"
                  />
                </div>
              )}
              
              <div className="border-l-4 border-blue-600 pl-8 flex-1">
                <h2 className="text-4xl font-bold text-blue-800 mb-8 uppercase tracking-wide">
                  {section.title}
                </h2>
                <div className="text-lg text-gray-700 leading-relaxed space-y-6">
                  {typeof section.content === 'string' ? (
                    <p className="whitespace-pre-line">{section.content}</p>
                  ) : (
                    <div className="grid grid-cols-1 gap-6">
                      {Object.entries(section.content).map(([key, value]: [string, any]) => (
                        <div key={key} className="bg-blue-50 p-6 rounded-lg border border-blue-200">
                          <h4 className="font-semibold text-blue-800 mb-3 capitalize text-xl">
                            {key.replace(/_/g, ' ')}
                          </h4>
                          <p className="text-gray-700 text-lg">{String(value)}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </>
      )}
    </div>
  );
}

// Black Minimalist Financial Report Layout
export function BlackMinimalistFinancialReportLayout({ data, isEditable = false, onContentChange }: { data: any; isEditable?: boolean; onContentChange?: (newData: any) => void }) {
  
  const handleEdit = (field: string, newValue: string) => {
    if (onContentChange) {
      const updatedData = { ...data };
      if (field.includes('.')) {
        const keys = field.split('.');
        let current = updatedData;
        for (let i = 0; i < keys.length - 1; i++) {
          if (!current[keys[i]]) current[keys[i]] = {};
          current = current[keys[i]];
        }
        current[keys[keys.length - 1]] = newValue;
      } else {
        updatedData[field] = newValue;
      }
      onContentChange(updatedData);
    }
  };

  const handleSectionEdit = (sectionIndex: number, field: string, newValue: string) => {
    if (onContentChange && data.sections) {
      const updatedSections = [...data.sections];
      updatedSections[sectionIndex] = {
        ...updatedSections[sectionIndex],
        [field]: newValue
      };
      onContentChange({
        ...data,
        sections: updatedSections
      });
    }
  };
  const company = data.cover?.companyName || 'LEGEND BOOKS & PUBLISHING';
  const reportDate = data.cover?.date || 'April 2030';
  const reportTitle = data.cover?.title || 'Financial Report';
  const reportSubtitle = data.cover?.subtitle || 'Q2 for 2030';

  const logo = data.cover?.logo;

  return (
    <div className="bg-white min-h-screen font-sans">
      {/* Cover Page - Exact Black Minimalist Layout */}
      <div className="h-screen bg-white text-black flex flex-col p-12 relative">
        {/* Logo - Top Center Large (Cover Page) */}
        {logo && logo !== 'transparent-logo.png' && (
          <div className="absolute top-16 left-1/2 transform -translate-x-1/2">
            <img 
              src={logo} 
              alt="Company Logo" 
              className="w-32 h-32 object-contain rounded-lg shadow-lg"
              onError={(e) => {
                // Fallback if logo fails to load
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
              }}
            />
          </div>
        )}

        {/* Header */}
        <div className="flex justify-between items-start mb-16 pt-24">
          <div>
            <h1 className="text-2xl font-bold tracking-wider">{company}</h1>
          </div>
          <div className="text-right text-gray-600">
            {reportDate}
          </div>
        </div>
        
        {/* Main Title - Center Left */}
        <div className="flex-1 flex flex-col justify-center">
          <div className="max-w-md">
            <h2 className="text-6xl font-light text-black mb-4 leading-tight">
              {reportTitle}
            </h2>
            <p className="text-xl text-gray-600 font-medium">
              {reportSubtitle}
            </p>
          </div>
        </div>
        
        {/* Footer Contact */}
        <div className="border-t border-gray-200 pt-6 text-sm text-gray-600">
          <div className="flex justify-between">
            <div>
              <div className="font-semibold">CEO Name</div>
              <div>Chief Executive Officer</div>
            </div>
            <div className="text-right">
              <div>123 Anywhere Street, Any City,</div>
              <div>ST 123456</div>
              <div>www.reallygreatsite.com</div>
            </div>
          </div>
        </div>
      </div>

      {/* Multi-Page Content Structure with Proper Page Breaks */}
      {data.sections && (
        <>
          {/* Executive Summary - Always Page 2 */}
          {data.sections.find((s: any) => s.type === 'executive_summary') && (
            <div className="page-break-before h-screen bg-white p-12 flex flex-col relative" style={{ pageBreakBefore: 'always', breakBefore: 'page' }}>
              {/* Small logo in corner for content pages */}
              {logo && logo !== 'transparent-logo.png' && (
                <div className="absolute top-8 right-8">
                  <img 
                    src={logo} 
                    alt="Company Logo" 
                    className="w-12 h-12 object-contain opacity-60"
                  />
                </div>
              )}
              
              <div className="flex-1">
                <h2 className="text-4xl font-bold text-black mb-8 uppercase tracking-wide">
                  Executive Summary
                </h2>
                <div className="text-lg text-gray-700 leading-relaxed space-y-6">
                  <p className="whitespace-pre-line">{data.sections.find((s: any) => s.type === 'executive_summary')?.content}</p>
                </div>
              </div>
            </div>
          )}

          {/* Each Additional Section Gets Its Own Page */}
          {data.sections.filter((s: any) => s.type !== 'executive_summary').map((section: any, index: number) => (
            <div key={index} className="page-break-before h-screen bg-white p-12 flex flex-col relative" style={{ pageBreakBefore: 'always', breakBefore: 'page' }}>
              {/* Small logo in corner for content pages */}
              {logo && logo !== 'transparent-logo.png' && (
                <div className="absolute top-8 right-8">
                  <img 
                    src={logo} 
                    alt="Company Logo" 
                    className="w-12 h-12 object-contain opacity-60"
                  />
                </div>
              )}
              
              <div className="flex-1">
                <h2 className="text-4xl font-bold text-black mb-8 uppercase tracking-wide">
                  {section.title}
                </h2>
                <div className="text-lg text-gray-700 leading-relaxed space-y-6">
                  {typeof section.content === 'string' ? (
                    <p className="whitespace-pre-line">{section.content}</p>
                  ) : typeof section.content === 'object' && section.content !== null ? (
                    <div className="space-y-8">
                      {Object.entries(section.content).map(([key, value]: [string, any]) => {
                        if (typeof value === 'object' && value !== null) {
                          return (
                            <div key={key} className="bg-gray-50 p-6 rounded-lg">
                              <h4 className="text-xl font-bold text-black mb-4 capitalize">
                                {key.replace(/_/g, ' ').replace(/metrics/g, 'Metrics')}
                              </h4>
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {Object.entries(value).map(([subKey, subValue]: [string, any]) => (
                                  <div key={subKey} className="bg-white p-4 rounded border">
                                    <div className="text-xs text-gray-500 mb-2 uppercase">
                                      {subKey.replace(/_/g, ' ')}
                                    </div>
                                    <div className="text-2xl font-bold text-black">{String(subValue)}</div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          );
                        }
                        return (
                          <div key={key} className="bg-black text-white p-6 rounded-lg">
                            <h4 className="text-sm font-semibold opacity-80 mb-2 capitalize">
                              {key.replace(/_/g, ' ')}
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
              </div>
            </div>
          ))}
        </>
      )}
    </div>
  );
}