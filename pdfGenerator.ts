import { Document } from '../shared/schema';

// Enhanced CSS styles that match the React component styling exactly
const basePdfStyles = `
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Playfair+Display:wght@400;600;700&display=swap');
    
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
      background: linear-gradient(135deg, #f0fdfa 0%, #ecfdf5 100%);
      min-height: 100vh;
      padding: 32px;
    }
    
    /* BROCHURE TEMPLATE STYLES - Matching React Component */
    .brochure-container {
      max-width: 1024px;
      margin: 0 auto;
    }
    
    .brochure-cover {
      background: linear-gradient(90deg, #0f766e 0%, #0891b2 100%);
      color: white;
      padding: 48px;
      border-radius: 8px;
      margin-bottom: 32px;
      text-align: center;
    }
    
    .brochure-cover h1 {
      font-size: 48px;
      font-weight: 700;
      margin-bottom: 16px;
      line-height: 1.1;
    }
    
    .brochure-cover h2 {
      font-size: 24px;
      color: #5eead4;
      margin-bottom: 24px;
      font-weight: 400;
    }
    
    .brochure-cover p {
      font-size: 20px;
      color: #99f6e4;
    }
    
    .content-panels {
      margin-bottom: 32px;
    }
    
    .panel {
      background: white;
      padding: 32px;
      border-radius: 8px;
      box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
      border-left: 4px solid #0d9488;
      margin-bottom: 32px;
      page-break-inside: avoid;
    }
    
    .panel h3 {
      font-size: 24px;
      font-weight: 700;
      color: #0f766e;
      margin-bottom: 16px;
    }
    
    .panel-content {
      color: #374151;
      line-height: 1.75;
      font-size: 18px;
    }
    
    .panel-subtitle {
      color: #0d9488;
      font-weight: 500;
      margin-top: 8px;
    }
    
    .three-column-grid {
      display: grid;
      grid-template-columns: 1fr 1fr 1fr;
      gap: 32px;
      margin-bottom: 32px;
    }
    
    .column-card {
      background: white;
      padding: 32px;
      border-radius: 8px;
      box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
    }
    
    .column-card h3 {
      font-size: 24px;
      font-weight: 700;
      color: #0f766e;
      margin-bottom: 16px;
    }
    
    .feature-list {
      list-style: none;
    }
    
    .feature-item {
      display: flex;
      align-items: flex-start;
      margin-bottom: 12px;
    }
    
    .feature-checkmark {
      color: #0d9488;
      margin-right: 8px;
      font-weight: bold;
    }
    
    .feature-text {
      color: #374151;
    }
    
    .contact-info {
      color: #374151;
      line-height: 1.75;
    }
    
    .contact-info p {
      margin-bottom: 12px;
    }
    
    .cta-section {
      background: linear-gradient(90deg, #0d9488 0%, #0891b2 100%);
      color: white;
      padding: 32px;
      border-radius: 8px;
      text-align: center;
    }
    
    .cta-section h3 {
      font-size: 32px;
      font-weight: 700;
      margin-bottom: 16px;
    }
    
    .cta-section p {
      font-size: 20px;
      margin-bottom: 24px;
    }
    
    .cta-button {
      background: white;
      color: #0f766e;
      padding: 12px 32px;
      border-radius: 9999px;
      font-weight: 700;
      font-size: 18px;
      border: none;
      display: inline-block;
    }
    
    .pitch-slide {
      margin-bottom: 40px;
      padding: 20px;
      background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
      border-radius: 8px;
      border-left: 4px solid #d4a574;
    }
    
    .slide-title {
      font-family: 'Playfair Display', serif;
      font-size: 22px;
      font-weight: 700;
      color: #2c1810;
      margin-bottom: 10px;
    }
    
    .slide-subtitle {
      font-size: 14px;
      color: #666;
      margin-bottom: 15px;
    }
    
    .invoice-header {
      display: flex;
      justify-content: space-between;
      align-items: start;
      margin-bottom: 30px;
    }
    
    .invoice-company {
      flex: 1;
    }
    
    .invoice-details {
      text-align: right;
      flex: 1;
    }
    
    .invoice-number {
      font-size: 24px;
      font-weight: 700;
      color: #d4a574;
      margin-bottom: 5px;
    }
    
    .table {
      width: 100%;
      border-collapse: collapse;
      margin: 20px 0;
    }
    
    .table th,
    .table td {
      padding: 12px;
      text-align: left;
      border-bottom: 1px solid #e5e5e5;
    }
    
    .table th {
      background-color: #f8f9fa;
      font-weight: 600;
      color: #2c1810;
    }
    
    .highlight-box {
      background: linear-gradient(135deg, #d4a574 0%, #b8935f 100%);
      color: white;
      padding: 15px;
      border-radius: 6px;
      margin: 20px 0;
      text-align: center;
    }
    
    .page-break {
      page-break-before: always;
    }
    
    .field-list {
      margin-top: 10px;
      font-style: italic;
      color: #666;
    }
    
    .metrics-section,
    .experience-section,
    .skills-section {
      margin: 10px 0;
      padding: 10px;
      background: #f8f9fa;
      border-left: 3px solid #d4a574;
      border-radius: 4px;
    }
    
    .section-content p {
      margin-bottom: 10px;
      line-height: 1.7;
    }
    
    .section-content ul {
      margin: 10px 0;
      padding-left: 20px;
    }
    
    .section-content li {
      margin-bottom: 5px;
      line-height: 1.6;
    }
    
    @media print {
      .document {
        margin: 0;
        padding: 15mm;
      }
      
      body {
        font-size: 10px;
      }
      
      .section-content {
        break-inside: avoid;
      }
    }
  </style>
`;

// Generate styled HTML for AI-generated CV/Resume structure
function generateAIResumeStyledHTML(document: Document, content: any): string {
  const personalInfo = content.personalInfo || {};
  const templateName = content.templateInfo?.templateName || 'Resume';
  const isExecutive = templateName.includes('Executive');
  const isSales = templateName.includes('Sales');
  
  // Determine color scheme based on template type
  const colorScheme = isSales ? {
    primary: '#059669', // green
    secondary: '#047857',
    accent: '#10b981',
    light: '#f0fdf4'
  } : {
    primary: '#1e40af', // blue  
    secondary: '#1d4ed8',
    accent: '#3b82f6',
    light: '#eff6ff'
  };

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>${document.title}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Playfair+Display:wght@400;600;700&display=swap');
    
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
      background: linear-gradient(135deg, ${colorScheme.light} 0%, #f8fafc 100%);
      min-height: 100vh;
      padding: 32px;
      line-height: 1.6;
    }
    
    .resume-container {
      max-width: 4xl;
      margin: 0 auto;
      background: white;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
      border-top: 8px solid ${colorScheme.primary};
    }
    
    .resume-header {
      background: linear-gradient(135deg, ${colorScheme.primary} 0%, ${colorScheme.secondary} 100%);
      color: white;
      padding: 48px 32px;
      text-align: center;
    }
    
    .resume-header h1 {
      font-size: 36px;
      font-weight: 700;
      margin-bottom: 8px;
      text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
    }
    
    .resume-header h2 {
      font-size: 20px;
      color: rgba(255, 255, 255, 0.9);
      margin-bottom: 16px;
      font-weight: 400;
    }
    
    .contact-info {
      color: rgba(255, 255, 255, 0.8);
      font-size: 16px;
      display: flex;
      justify-content: center;
      gap: 24px;
      flex-wrap: wrap;
    }
    
    .contact-info > div {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    
    .resume-content {
      padding: 48px;
    }
    
    .resume-section {
      margin-bottom: 48px;
    }
    
    .section-title {
      font-size: 24px;
      font-weight: 700;
      color: #1f2937;
      margin-bottom: 24px;
      padding-bottom: 8px;
      border-bottom: 2px solid ${colorScheme.primary};
    }
    
    .summary-box {
      background: ${colorScheme.light};
      padding: 24px;
      border-radius: 8px;
      border-left: 4px solid ${colorScheme.primary};
      color: #374151;
      font-size: 16px;
      line-height: 1.7;
    }
    
    .experience-item {
      background: #f9fafb;
      padding: 24px;
      border-radius: 8px;
      border-left: 4px solid ${colorScheme.accent};
      margin-bottom: 16px;
    }
    
    .experience-header {
      display: flex;
      justify-content: space-between;
      align-items: start;
      margin-bottom: 12px;
      flex-wrap: wrap;
      gap: 16px;
    }
    
    .job-title {
      font-size: 20px;
      font-weight: 600;
      color: #1f2937;
    }
    
    .company-name {
      color: ${colorScheme.primary};
      font-weight: 500;
      font-size: 16px;
    }
    
    .duration {
      color: #6b7280;
      font-size: 14px;
      white-space: nowrap;
    }
    
    .achievements {
      color: #4b5563;
      line-height: 1.6;
    }
    
    .skills-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 12px;
    }
    
    .skill-item {
      background: white;
      padding: 12px 16px;
      border-radius: 6px;
      border: 1px solid #e5e7eb;
      font-weight: 500;
      color: #374151;
      text-align: center;
      box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
    }
    
    .education-item {
      background: #f9fafb;
      padding: 20px;
      border-radius: 8px;
      margin-bottom: 16px;
    }
    
    .degree {
      font-size: 18px;
      font-weight: 600;
      color: #1f2937;
      margin-bottom: 4px;
    }
    
    .institution {
      color: ${colorScheme.primary};
      font-weight: 500;
    }
    
    .year {
      color: #6b7280;
      font-size: 14px;
    }
    
    .certifications-list {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 12px;
    }
    
    .certification-item {
      background: white;
      padding: 16px;
      border-radius: 6px;
      border-left: 3px solid ${colorScheme.accent};
      box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
      font-weight: 500;
      color: #374151;
    }
  </style>
</head>
<body>
  <div class="resume-container">
    <!-- Header -->
    <header class="resume-header">
      <h1>${personalInfo.name || 'Professional Name'}</h1>
      <h2>${personalInfo.title || 'Professional Title'}</h2>
      <div class="contact-info">
        ${personalInfo.email ? `<div>📧 ${personalInfo.email}</div>` : ''}
        ${personalInfo.phone ? `<div>📱 ${personalInfo.phone}</div>` : ''}
        ${personalInfo.location ? `<div>📍 ${personalInfo.location}</div>` : ''}
      </div>
    </header>
    
    <!-- Content -->
    <div class="resume-content">
      <!-- Professional Summary -->
      ${content.summary ? `
      <section class="resume-section">
        <h3 class="section-title">Professional Summary</h3>
        <div class="summary-box">
          ${content.summary}
        </div>
      </section>
      ` : ''}
      
      <!-- Professional Experience -->
      ${Array.isArray(content.experience) && content.experience.length > 0 ? `
      <section class="resume-section">
        <h3 class="section-title">Professional Experience</h3>
        ${content.experience.map((job: any) => `
          <div class="experience-item">
            <div class="experience-header">
              <div>
                <div class="job-title">${job.position || job.job_title || 'Position'}</div>
                <div class="company-name">${job.company || 'Company'}</div>
              </div>
              <div class="duration">${job.duration || job.dates || 'Duration'}</div>
            </div>
            <div class="achievements">${job.achievements || job.description || ''}</div>
          </div>
        `).join('')}
      </section>
      ` : ''}
      
      <!-- Skills -->
      ${Array.isArray(content.skills) && content.skills.length > 0 ? `
      <section class="resume-section">
        <h3 class="section-title">Key Skills</h3>
        <div class="skills-grid">
          ${content.skills.map((skill: string) => `
            <div class="skill-item">${skill}</div>
          `).join('')}
        </div>
      </section>
      ` : ''}
      
      <!-- Education -->
      ${Array.isArray(content.education) && content.education.length > 0 ? `
      <section class="resume-section">
        <h3 class="section-title">Education</h3>
        ${content.education.map((edu: any) => `
          <div class="education-item">
            <div class="degree">${edu.degree || 'Degree'}</div>
            <div class="institution">${edu.institution || 'Institution'} • <span class="year">${edu.year || edu.years || 'Year'}</span></div>
          </div>
        `).join('')}
      </section>
      ` : ''}
      
      <!-- Certifications -->
      ${Array.isArray(content.certifications) && content.certifications.length > 0 ? `
      <section class="resume-section">
        <h3 class="section-title">Certifications</h3>
        <div class="certifications-list">
          ${content.certifications.map((cert: string) => `
            <div class="certification-item">${cert}</div>
          `).join('')}
        </div>
      </section>
      ` : ''}
    </div>
  </div>
</body>
</html>`;
}

// Generate PDF specifically for Sales Representative Resume template layout
function generateSalesRepresentativeResumePDF(document: Document, content: any): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>${document.title}</title>
  ${basePdfStyles}
  <style>
    .resume-header {
      text-align: center;
      margin-bottom: 30px;
      padding-bottom: 20px;
      border-bottom: 2px solid #d4a574;
    }
    .name {
      font-family: 'Playfair Display', serif;
      font-size: 32px;
      font-weight: 700;
      color: #2c1810;
      margin-bottom: 5px;
    }
    .job-title {
      font-size: 18px;
      color: #666;
      margin-bottom: 10px;
    }
    .contact-info {
      font-size: 12px;
      color: #555;
    }
    .resume-section {
      margin-bottom: 25px;
    }
    .resume-section-title {
      font-family: 'Playfair Display', serif;
      font-size: 16px;
      font-weight: 600;
      color: #2c1810;
      margin-bottom: 10px;
      text-transform: uppercase;
      letter-spacing: 1px;
    }
    .skills-list {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }
    .skill-item {
      background: #f8f9fa;
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 11px;
      border: 1px solid #e5e5e5;
    }
    .work-item {
      margin-bottom: 15px;
      padding-left: 15px;
      border-left: 3px solid #d4a574;
    }
    .work-position {
      font-weight: 600;
      color: #2c1810;
    }
    .work-company {
      color: #666;
      font-size: 12px;
    }
    .work-responsibilities {
      margin-top: 5px;
      padding-left: 10px;
    }
    .work-responsibilities li {
      margin-bottom: 3px;
      font-size: 11px;
    }
  </style>
</head>
<body>
  <div class="document">
    <!-- Header with Personal Information -->
    <header class="resume-header">
      <h1 class="name">${content.personal?.name || 'Name'}</h1>
      <p class="job-title">${content.personal?.title || 'Title'}</p>
      <div class="contact-info">
        ${content.personal?.contact?.email ? `<span>${content.personal.contact.email}</span>` : ''}
        ${content.personal?.contact?.phone ? `<span> • ${content.personal.contact.phone}</span>` : ''}
        ${content.personal?.contact?.address ? `<span> • ${content.personal.contact.address}</span>` : ''}
      </div>
    </header>
    
    <!-- About Me Section -->
    ${content.aboutMe ? `
    <section class="resume-section">
      <h2 class="resume-section-title">About Me</h2>
      <p>${content.aboutMe}</p>
    </section>
    ` : ''}
    
    <!-- Skills Section -->
    ${content.skills && content.skills.length > 0 ? `
    <section class="resume-section">
      <h2 class="resume-section-title">Skills</h2>
      <div class="skills-list">
        ${content.skills.map((skill: string) => `<span class="skill-item">${skill}</span>`).join('')}
      </div>
    </section>
    ` : ''}
    
    <!-- Work Experience Section -->
    ${content.workExperience && content.workExperience.length > 0 ? `
    <section class="resume-section">
      <h2 class="resume-section-title">Work Experience</h2>
      ${content.workExperience.map((job: any) => `
        <div class="work-item">
          <div class="work-position">${job.position || 'Position'}</div>
          <div class="work-company">${job.company || 'Company'} • ${job.period || 'Period'}</div>
          ${job.responsibilities && Array.isArray(job.responsibilities) ? `
            <ul class="work-responsibilities">
              ${job.responsibilities.map((resp: string) => `<li>${resp}</li>`).join('')}
            </ul>
          ` : ''}
        </div>
      `).join('')}
    </section>
    ` : ''}
    
    <!-- Education Section -->
    ${content.education && content.education.length > 0 ? `
    <section class="resume-section">
      <h2 class="resume-section-title">Education</h2>
      ${content.education.map((edu: any) => `
        <div style="margin-bottom: 10px;">
          <div style="font-weight: 600;">${edu.degree || 'Degree'}</div>
          <div style="color: #666; font-size: 12px;">${edu.institution || 'Institution'} • ${edu.years || 'Years'}</div>
        </div>
      `).join('')}
    </section>
    ` : ''}
    
    <!-- Languages Section -->
    ${content.languages && content.languages.length > 0 ? `
    <section class="resume-section">
      <h2 class="resume-section-title">Languages</h2>
      <div class="skills-list">
        ${content.languages.map((lang: string) => `<span class="skill-item">${lang}</span>`).join('')}
      </div>
    </section>
    ` : ''}
    
    <!-- References Section -->
    ${content.references && content.references.length > 0 ? `
    <section class="resume-section">
      <h2 class="resume-section-title">References</h2>
      ${content.references.map((ref: any) => `
        <div style="margin-bottom: 10px;">
          <div style="font-weight: 600;">${ref.name || 'Name'}</div>
          <div style="color: #666; font-size: 12px;">${ref.role || 'Role'} at ${ref.company || 'Company'}</div>
          <div style="color: #666; font-size: 11px;">${ref.email || ''} • ${ref.phone || ''}</div>
        </div>
      `).join('')}
    </section>
    ` : ''}
  </div>
</body>
</html>`;
}

// Generate PDF for Executive Resume with sections structure
function generateExecutiveResumePDF(document: Document, content: any): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>${document.title}</title>
  ${basePdfStyles}
</head>
<body>
  <div class="document">
    <main class="content">
      ${content.sections.map((section: any, index: number) => {
        if (section.type === 'header') {
          // Don't show section title for header, just format the content directly
          return `<div class="section">${formatSectionContent(section)}</div>`;
        }
        return `
        <section class="section ${index > 2 ? 'page-break' : ''}">
          <h2 class="section-title">${section.title || section.type || 'Section'}</h2>
          <div class="section-content">
            ${formatSectionContent(section)}
          </div>
        </section>`;
      }).join('')}
    </main>
  </div>
</body>
</html>`;
}

export async function generatePDF(document: Document): Promise<Buffer> {
  console.log(`🔄 Starting PDF generation for: ${document.title}`);
  console.log(`🎨 Using Puppeteer for EXACT visual matching with styled HTML...`);
  
  try {
    // Generate comprehensive HTML content that matches the preview exactly
    const htmlContent = await generateComprehensivePDFContent(document);
    console.log(`📄 Generated HTML content (${htmlContent.length} chars)`);
    
    // Import Puppeteer dynamically to avoid require issues
    const puppeteer = await import('puppeteer');
    
    console.log('🚀 Launching Puppeteer browser...');
    const browser = await puppeteer.default.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox', 
        '--disable-dev-shm-usage',
        '--disable-gpu',
        '--no-zygote'
      ]
    });
    
    const page = await browser.newPage();
    await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
    
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true
    });
    
    await browser.close();
    console.log(`✅ PDF generated with Puppeteer: ${pdfBuffer.length} bytes`);
    return pdfBuffer;
    
  } catch (error) {
    console.error('❌ Puppeteer failed, using enhanced fallback:', error.message);
    
    // Generate comprehensive HTML content for fallback too  
    const htmlContent = await generateComprehensivePDFContent(document);
    console.log('📄 Using enhanced text conversion with visual structure...');
    
    // Create a much better structured PDF from the HTML content
    return generateRichTextPDFFromHTML(htmlContent, document.title);
  }
}

// Comprehensive PDF content generator that uses the actual template structure
export async function generateComprehensivePDFContent(document: Document): Promise<string> {
  const content = document.content as any;
  const serviceType = document.serviceType || '';
  
  // Check if this is a brochure with panels structure
  if (serviceType.includes('brochure') && content?.panels) {
    console.log('🎨 GENERATING BROCHURE PDF with enhanced styling...');
    return generateBrochureStyledHTML(content, basePdfStyles, document.title);
  }
  
  // Check if this is a CV/Resume with AI-generated structure (personalInfo, skills, experience)
  if (serviceType.includes('resume') && (content?.personalInfo || content?.skills || content?.experience)) {
    console.log('🎨 GENERATING CV/RESUME PDF with enhanced styling...');
    return generateAIResumeStyledHTML(document, content);
  }
  
  // Check if this is a Sales Representative Resume structure (legacy format)
  if (content?.personal) {
    return generateSalesRepresentativeResumePDF(document, content);
  }
  
  // Check if this is an Executive Resume with sections
  if (content?.sections && Array.isArray(content.sections)) {
    return generateExecutiveResumePDF(document, content);
  }
  
  // For other document types, use the generic structure
  const sections = content?.sections || [];
  
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>${document.title}</title>
  ${basePdfStyles}
</head>
<body>
  <div class="document">
    <header class="header">
      <h1 class="title">${document.title}</h1>
      <div class="subtitle">Generated on ${new Date().toLocaleDateString()}</div>
    </header>
    
    <main class="content">
      ${sections.length > 0 ? sections.map((section: any, index: number) => `
        <section class="section ${index > 2 ? 'page-break' : ''}">
          <h2 class="section-title">${section.title || section.type || 'Section'}</h2>
          <div class="section-content">
            ${formatSectionContent(section)}
          </div>
        </section>
      `).join('') : '<div class="section"><h2>No Content Available</h2><p>Document content could not be processed.</p></div>'}
    </main>
    
    <footer class="footer">
      <p>© ${new Date().getFullYear()} Jenrate.ai - Professional Document Generation</p>
    </footer>
  </div>
</body>
</html>`;
}

// Format section content based on section type and structure
function formatSectionContent(section: any): string {
  const content = section.content || '';
  const type = section.type || '';
  
  // Convert line breaks to HTML for proper PDF formatting
  const formattedContent = content
    .replace(/\n\n/g, '</p><p>')  // Double line breaks become paragraph breaks
    .replace(/\n/g, '<br>')       // Single line breaks become <br> tags
    .replace(/•\s*/g, '<li>')     // Bullet points become list items
    .replace(/(\d+\.\s*)/g, '<li>'); // Numbered lists become list items
  
  // Handle list formatting
  let processedContent = formattedContent;
  if (formattedContent.includes('<li>')) {
    processedContent = `<ul>${formattedContent.replace(/<li>/g, '<li>')}</ul>`;
    processedContent = processedContent.replace(/<ul>([^<]*)<li>/g, '<ul><li>$1</li><li>');
    processedContent = processedContent.replace(/<li>([^<]*)<\/ul>/g, '<li>$1</li></ul>');
  }
  
  // Handle different section types with appropriate formatting
  switch (type) {
    case 'executive_summary':
    case 'introduction':
    case 'summary':
      return `<div class="highlight-box"><p>${processedContent}</p></div>`;
      
    case 'financial_highlights':
    case 'key_metrics':
      return `<div class="metrics-section"><p>${processedContent}</p></div>`;
      
    case 'work_experience':
    case 'experience':
      return `<div class="experience-section"><p>${processedContent}</p></div>`;
      
    case 'skills':
      return `<div class="skills-section"><p>${processedContent}</p></div>`;
      
    case 'header':
      // Handle both content and fields array for header sections
      if (section.fields && Array.isArray(section.fields)) {
        const [name, title, contact] = section.fields;
        return `<div class="resume-header">
          <h1 class="resume-name">${name || 'Professional Name'}</h1>
          <div class="resume-title">${title || 'Professional Title'}</div>
          <div class="contact-info">${contact || 'Contact Information'}</div>
        </div>`;
      }
      return `<div class="resume-header">${processedContent}</div>`;
      
    case 'pitch_slides':
      return formatPitchSlides(section);
      
    case 'invoice_items':
      return formatInvoiceItems(section);
      
    default:
      return `<div class="section-content"><p>${processedContent}</p></div>`;
  }
}

// Format pitch deck slides
function formatPitchSlides(section: any): string {
  if (section.slides && Array.isArray(section.slides)) {
    return section.slides.map((slide: any) => `
      <div class="pitch-slide">
        <h3 class="slide-title">${slide.title || 'Slide'}</h3>
        ${slide.subtitle ? `<p class="slide-subtitle">${slide.subtitle}</p>` : ''}
        <div class="slide-content">${slide.content || ''}</div>
      </div>
    `).join('');
  }
  return `<p>${section.content || ''}</p>`;
}

// Format invoice items
function formatInvoiceItems(section: any): string {
  if (section.items && Array.isArray(section.items)) {
    return `
      <table class="table">
        <thead>
          <tr>
            <th>Description</th>
            <th>Quantity</th>
            <th>Rate</th>
            <th>Amount</th>
          </tr>
        </thead>
        <tbody>
          ${section.items.map((item: any) => `
            <tr>
              <td>${item.description || ''}</td>
              <td>${item.quantity || ''}</td>
              <td>${item.rate || ''}</td>
              <td>${item.amount || ''}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;
  }
  return `<p>${section.content || ''}</p>`;
}

// Fallback PDF generator for when html-pdf-node fails
function generateFallbackPDF(document: Document): Buffer {
  const content = document.content as any;
  const serviceType = document.serviceType || '';
  let textContent = `${document.title}\n\n`;
  
  console.log('🔍 DEBUG - Fallback PDF generation:');
  console.log(`Service Type: ${serviceType}`);
  console.log(`Content Structure:`, JSON.stringify(content, null, 2));
  
  // Handle brochures with panels structure
  if (serviceType.includes('brochure') && content?.panels) {
    console.log('📄 Processing brochure with panels');
    const panels = content.panels || [];
    const coverPanel = panels.find((p: any) => p.type === 'cover') || panels[0] || {};
    const contentPanels = panels.filter((p: any) => p.type !== 'cover');
    
    // Add cover section
    if (coverPanel.title) {
      textContent += `${coverPanel.title}\n`;
      textContent += `${'='.repeat(coverPanel.title.length)}\n`;
      if (coverPanel.subtitle) {
        textContent += `${coverPanel.subtitle}\n\n`;
      }
      if (coverPanel.content) {
        textContent += `${coverPanel.content}\n\n`;
      }
    }
    
    // Add content panels
    contentPanels.forEach((panel: any) => {
      if (panel.title) {
        textContent += `${panel.title}\n`;
        textContent += `${'-'.repeat(panel.title.length)}\n`;
      }
      if (panel.content) {
        textContent += `${panel.content}\n\n`;
      }
      if (panel.subtitle) {
        textContent += `${panel.subtitle}\n\n`;
      }
    });
  } 
  // Handle other documents with sections structure
  else {
    console.log('📄 Processing document with sections');
    const sections = content?.sections || [];
    sections.forEach((section: any) => {
      if (section.title && section.content) {
        textContent += `${section.title}\n${'-'.repeat(section.title.length)}\n`;
        textContent += `${section.content}\n\n`;
      }
    });
  }
  
  textContent += `\nGenerated by Jenrate.ai on: ${new Date().toLocaleDateString()}`;
  
  console.log(`📝 Final text content (${textContent.length} chars):`, textContent.substring(0, 200) + '...');
  
  const pdfContent = `%PDF-1.4
1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj
2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj
3 0 obj<</Type/Page/Parent 2 0 R/MediaBox[0 0 612 792]/Contents 4 0 R/Resources<</Font<</F1 5 0 R>>>>>>endobj
4 0 obj<</Length ${textContent.length + 100}>>stream
BT/F1 12 Tf 72 720 Td(${textContent.replace(/\n/g, ')Tj 0 -15 Td(')})Tj ET
endstream endobj
5 0 obj<</Type/Font/Subtype/Type1/BaseFont/Helvetica>>endobj
xref 0 6
0000000000 65535 f 
0000000010 00000 n 
0000000062 00000 n 
0000000119 00000 n 
0000000267 00000 n 
0000000${(400 + textContent.length).toString().padStart(3, '0')} 00000 n 
trailer<</Size 6/Root 1 0 R>>startxref ${450 + textContent.length}%%EOF`;

  return Buffer.from(pdfContent, 'utf8');
}

// Enhanced PDF generator with proper brochure and document support
function generateEnhancedFallbackPDF(document: Document): Buffer {
  const content = document.content as any;
  const serviceType = document.serviceType || '';
  let textContent = `${document.title}\n${'='.repeat(document.title.length)}\n\n`;
  
  // Handle brochures with panels structure
  if (serviceType.includes('brochure') && content?.panels) {
    const panels = content.panels || [];
    
    panels.forEach((panel: any) => {
      if (panel.type === 'cover') {
        textContent += `${panel.title}\n`;
        textContent += `${panel.subtitle || ''}\n\n`;
        if (panel.content) {
          textContent += `${panel.content}\n\n`;
        }
      } else {
        textContent += `${panel.title || 'Section'}\n`;
        textContent += `${'-'.repeat((panel.title || 'Section').length)}\n`;
        textContent += `${panel.content || ''}\n\n`;
        if (panel.subtitle) {
          textContent += `${panel.subtitle}\n\n`;
        }
      }
    });
  } 
  // Handle other documents with sections structure
  else {
    const sections = content?.sections || [];
    
    sections.forEach((section: any) => {
      if (section.title && section.content) {
        textContent += `${section.title}\n${'-'.repeat(section.title.length)}\n`;
        textContent += `${section.content}\n\n`;
      }
    });
  }
  
  textContent += `\n--\nGenerated by Jenrate.ai on ${new Date().toLocaleDateString()}`;
  
  // Create a properly formatted PDF with the text content
  const pdfContent = `%PDF-1.4
1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj
2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj
3 0 obj<</Type/Page/Parent 2 0 R/MediaBox[0 0 612 792]/Contents 4 0 R/Resources<</Font<</F1 5 0 R>>>>>>endobj
4 0 obj<</Length ${textContent.length + 150}>>stream
BT/F1 10 Tf 50 750 Td(${textContent.replace(/\n/g, ')Tj 0 -12 Td(').replace(/'/g, "'")})Tj ET
endstream endobj
5 0 obj<</Type/Font/Subtype/Type1/BaseFont/Helvetica>>endobj
xref 0 6
0000000000 65535 f 
0000000010 00000 n 
0000000062 00000 n 
0000000119 00000 n 
0000000267 00000 n 
0000000${(400 + textContent.length).toString().padStart(3, '0')} 00000 n 
trailer<</Size 6/Root 1 0 R>>startxref ${450 + textContent.length}%%EOF`;

  return Buffer.from(pdfContent, 'utf8');
}

// Generate styled HTML template that matches the frontend preview exactly
function generateStyledTemplateHTML(document: Document): string {
  const content = document.content as any;
  const serviceType = document.serviceType || '';
  
  // Base styles that include Tailwind-equivalent CSS and the exact styling from frontend
  const baseStyles = `
    <style>
      @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Playfair+Display:wght@400;600;700&display=swap');
      
      * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
      }
      
      body {
        font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
        line-height: 1.6;
        color: #1a1a1a;
        background: white;
      }
      
      .bg-gradient-to-br {
        background: linear-gradient(to bottom right, #f0fdfa, #cffafe);
      }
      
      .bg-gradient-to-r {
        background: linear-gradient(to right, #134e4a, #0891b2);
      }
      
      .container {
        max-width: 80rem;
        margin: 0 auto;
        padding: 2rem;
      }
      
      .brochure-cover {
        background: linear-gradient(to right, #134e4a, #0891b2);
        color: white;
        padding: 3rem;
        border-radius: 0.5rem;
        margin-bottom: 2rem;
        text-align: center;
      }
      
      .brochure-cover h1 {
        font-size: 3rem;
        font-weight: bold;
        margin-bottom: 1rem;
      }
      
      .brochure-cover h2 {
        font-size: 1.5rem;
        color: #5eead4;
        margin-bottom: 1.5rem;
      }
      
      .brochure-cover p {
        font-size: 1.25rem;
        color: #99f6e4;
      }
      
      .content-panel {
        background: white;
        padding: 2rem;
        border-radius: 0.5rem;
        box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
        border-left: 4px solid #0d9488;
        margin-bottom: 2rem;
      }
      
      .content-panel h3 {
        font-size: 1.5rem;
        font-weight: bold;
        color: #134e4a;
        margin-bottom: 1rem;
      }
      
      .content-panel p {
        color: #374151;
        line-height: 1.6;
        font-size: 1.125rem;
      }
      
      .grid {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 2rem;
        margin-bottom: 2rem;
      }
      
      .feature-box {
        background: white;
        padding: 2rem;
        border-radius: 0.5rem;
        box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
      }
      
      .feature-box h3 {
        font-size: 1.5rem;
        font-weight: bold;
        color: #134e4a;
        margin-bottom: 1rem;
      }
      
      .feature-list {
        list-style: none;
      }
      
      .feature-list li {
        display: flex;
        align-items: flex-start;
        margin-bottom: 0.75rem;
      }
      
      .feature-list .checkmark {
        color: #0d9488;
        margin-right: 0.5rem;
        font-weight: bold;
      }
      
      .cta-section {
        background: linear-gradient(to right, #0d9488, #0891b2);
        color: white;
        padding: 2rem;
        border-radius: 0.5rem;
        text-align: center;
      }
      
      .cta-section h3 {
        font-size: 1.875rem;
        font-weight: bold;
        margin-bottom: 1rem;
      }
      
      .cta-section p {
        font-size: 1.25rem;
        margin-bottom: 1.5rem;
      }
      
      .cta-button {
        background: white;
        color: #0f766e;
        padding: 0.75rem 2rem;
        border-radius: 9999px;
        font-weight: bold;
        font-size: 1.125rem;
        border: none;
        cursor: pointer;
      }
    </style>
  `;
  
  // Generate template-specific HTML based on service type
  if (serviceType.includes('brochure') && content?.panels) {
    return generateBrochureStyledHTML(content, baseStyles, document.title);
  }
  
  // Add more template types as needed
  return generateGenericStyledHTML(content, baseStyles, document.title);
}

function generateBrochureStyledHTML(content: any, baseStyles: string, title: string): string {
  const panels = content.panels || [];
  const coverPanel = panels.find((p: any) => p.type === 'cover') || {};
  const contentPanels = panels.filter((p: any) => p.type !== 'cover');
  
  console.log('🎨 BROCHURE PDF: Creating HTML with INLINE STYLES for exact visual match');
  console.log('🎨 Cover Panel:', coverPanel);
  console.log('🎨 Content Panels:', contentPanels.length);
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>${title}</title>
      <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { 
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, system-ui, sans-serif;
          line-height: 1.6;
          color: #1f2937;
          background: linear-gradient(to bottom right, #f0fdfa, #cffafe);
          min-height: 100vh;
        }
        .brochure-container {
          max-width: 800px;
          margin: 0 auto;
          padding: 32px;
          background: linear-gradient(to bottom right, #f0fdfa, #cffafe);
        }
        .brochure-cover {
          background: linear-gradient(to bottom right, #0d9488, #0891b2);
          color: white;
          padding: 48px 32px;
          text-align: center;
          border-radius: 16px;
          margin-bottom: 32px;
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
        }
        .brochure-cover h1 {
          font-size: 48px;
          font-weight: 700;
          margin-bottom: 16px;
          text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
        }
        .brochure-cover h2 {
          font-size: 24px;
          font-weight: 500;
          margin-bottom: 16px;
          opacity: 0.9;
        }
        .brochure-cover p {
          font-size: 18px;
          opacity: 0.8;
        }
        .content-panels {
          display: grid;
          grid-template-columns: 1fr;
          gap: 24px;
          margin-bottom: 32px;
        }
        .panel {
          background: white;
          padding: 32px;
          border-radius: 12px;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
          border-left: 4px solid #0d9488;
        }
        .panel h3 {
          font-size: 24px;
          font-weight: 600;
          color: #0f766e;
          margin-bottom: 16px;
        }
        .panel p {
          color: #4b5563;
          font-size: 16px;
          line-height: 1.7;
        }
        .three-column-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 24px;
          margin-bottom: 32px;
        }
        @media (max-width: 768px) {
          .three-column-grid { grid-template-columns: 1fr; }
        }
        .column-card {
          background: white;
          padding: 24px;
          border-radius: 12px;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
          border: 1px solid #e5e7eb;
        }
        .column-card h3 {
          font-size: 20px;
          font-weight: 600;
          color: #0f766e;
          margin-bottom: 16px;
        }
        .feature-list {
          list-style: none;
        }
        .feature-item {
          display: flex;
          align-items: center;
          margin-bottom: 8px;
        }
        .feature-checkmark {
          color: #059669;
          font-weight: bold;
          margin-right: 8px;
          font-size: 16px;
        }
        .feature-text {
          color: #4b5563;
        }
        .contact-info p {
          color: #4b5563;
          font-size: 14px;
          margin-bottom: 4px;
        }
        .cta-section {
          background: linear-gradient(to bottom right, #0d9488, #0891b2);
          color: white;
          padding: 32px;
          text-align: center;
          border-radius: 12px;
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
        }
        .cta-section h3 {
          font-size: 28px;
          font-weight: 600;
          margin-bottom: 12px;
        }
        .cta-section p {
          font-size: 18px;
          margin-bottom: 16px;
          opacity: 0.9;
        }
        .cta-button {
          display: inline-block;
          background: white;
          color: #0f766e;
          padding: 12px 24px;
          border-radius: 8px;
          font-weight: 600;
          text-decoration: none;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
      </style>
    </head>
    <body>
      <div class="brochure-container">
        <!-- Brochure Cover -->
        <div class="brochure-cover">
          <h1>${coverPanel.title || 'Business Brochure'}</h1>
          <h2>${coverPanel.subtitle || 'Professional Services'}</h2>
          <p>${coverPanel.content || 'Discover our business solutions'}</p>
        </div>
        
        <!-- AI-Generated Content Panels -->
        <div class="content-panels">
          ${contentPanels.map((panel: any) => `
            <div class="panel">
              <h3>${panel.title || 'Section'}</h3>
              <div class="panel-content">
                ${panel.content ? `<p>${panel.content}</p>` : ''}
                ${panel.subtitle ? `<p style="color: #0d9488; font-weight: 500; margin-top: 8px;">${panel.subtitle}</p>` : ''}
              </div>
            </div>
          `).join('')}
        </div>
        
        <!-- Three-Column Grid Layout -->
        <div class="three-column-grid">
          <div class="column-card">
            <h3>Features</h3>
            <ul class="feature-list">
              <li class="feature-item">
                <span class="feature-checkmark">✓</span>
                <span class="feature-text">Premium Quality</span>
              </li>
              <li class="feature-item">
                <span class="feature-checkmark">✓</span>
                <span class="feature-text">Easy to Use</span>
              </li>
              <li class="feature-item">
                <span class="feature-checkmark">✓</span>
                <span class="feature-text">24/7 Support</span>
              </li>
            </ul>
          </div>
          
          <div class="column-card">
            <h3>Benefits</h3>
            <div class="panel-content">
              <p>Experience the advantages of choosing our products and services for your business needs.</p>
            </div>
          </div>
          
          <div class="column-card">
            <h3>Contact</h3>
            <div class="contact-info">
              <p>info@company.com</p>
              <p>+1 (555) 123-4567</p>
              <p>123 Business St, City, State</p>
            </div>
          </div>
        </div>
        
        <!-- Call to Action Section -->
        <div class="cta-section">
          <h3>Ready to Get Started?</h3>
          <p>Contact us today to learn more about our solutions</p>
          <div class="cta-button">Get in Touch</div>
        </div>
      </div>
    </body>
    </html>
  `;
}

function generateGenericStyledHTML(content: any, baseStyles: string, title: string): string {
  const sections = content?.sections || [];
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>${title}</title>
      ${baseStyles}
    </head>
    <body>
      <div class="container">
        <h1 style="text-align: center; margin-bottom: 2rem; font-size: 2rem; color: #134e4a;">${title}</h1>
        
        ${sections.map((section: any) => `
          <div class="content-panel">
            <h3>${section.title || 'Section'}</h3>
            <p>${section.content || ''}</p>
          </div>
        `).join('')}
      </div>
    </body>
    </html>
  `;
}

// Generate advanced styled PDF with layout preservation 
function generateAdvancedStyledPDF(document: Document): Buffer {
  const content = document.content as any;
  const serviceType = document.serviceType || '';
  
  console.log(`🎨 generateAdvancedStyledPDF called for: ${serviceType}`);
  console.log(`🎨 Content has panels:`, !!content?.panels);
  
  // For brochures, use the enhanced HTML-to-PDF generation that matches the preview
  if (serviceType.includes('brochure') && content?.panels) {
    console.log('🎨 Using ENHANCED brochure PDF generation...');
    
    try {
      // Generate the styled HTML content
      const htmlContent = generateBrochureStyledHTML(content, basePdfStyles, document.title);
      console.log('🎨 Generated HTML content length:', htmlContent.length);
      
      // For now, return the HTML content as structured text until we can implement proper HTML-to-PDF
      console.log('📄 Converting styled HTML to structured text for PDF...');
      const structuredText = convertHTMLToStructuredText(htmlContent, content);
      return createPDFFromStructuredContent(structuredText, document.title);
      
    } catch (error) {
      console.error('❌ Error in brochure PDF generation:', error);
      return generateBrochureStyledPDF(content, document.title);
    }
  }
  
  // For other documents, use enhanced formatting
  return generateEnhancedStyledPDF(content, document.title);
}

function generateBrochureStyledPDF(content: any, title: string): Buffer {
  const panels = content.panels || [];
  const coverPanel = panels.find((p: any) => p.type === 'cover') || {};
  const contentPanels = panels.filter((p: any) => p.type !== 'cover');
  
  // Build properly formatted PDF content with styling
  let pdfText = '';
  
  // Cover section with styled formatting
  pdfText += `${coverPanel.title || 'Business Brochure'}\n`;
  pdfText += `${'='.repeat((coverPanel.title || 'Business Brochure').length)}\n\n`;
  if (coverPanel.subtitle) {
    pdfText += `${coverPanel.subtitle}\n\n`;
  }
  if (coverPanel.content) {
    pdfText += `${coverPanel.content}\n\n`;
  }
  
  // Content panels with proper formatting
  contentPanels.forEach((panel: any) => {
    pdfText += `${panel.title || 'Section'}\n`;
    pdfText += `${'-'.repeat((panel.title || 'Section').length)}\n`;
    pdfText += `${panel.content || ''}\n\n`;
    if (panel.subtitle) {
      pdfText += `${panel.subtitle}\n\n`;
    }
  });
  
  // Add features section
  pdfText += `Our Features\n`;
  pdfText += `------------\n`;
  pdfText += `✓ Premium Quality Service\n`;
  pdfText += `✓ Professional Excellence\n`;
  pdfText += `✓ Customer Satisfaction\n\n`;
  
  pdfText += `Why Choose Us\n`;
  pdfText += `-------------\n`;
  pdfText += `✓ Experienced Team\n`;
  pdfText += `✓ Reliable Service\n`;
  pdfText += `✓ Competitive Pricing\n\n`;
  
  pdfText += `Our Promise\n`;
  pdfText += `-----------\n`;
  pdfText += `✓ Quality Guaranteed\n`;
  pdfText += `✓ Timely Delivery\n`;
  pdfText += `✓ Full Support\n\n`;
  
  pdfText += `Ready to Get Started?\n`;
  pdfText += `---------------------\n`;
  pdfText += `Contact us today to learn more about our services and solutions\n\n`;
  
  pdfText += `Generated by Jenrate.ai on ${new Date().toLocaleDateString()}`;
  
  // Create enhanced PDF with better formatting
  return createEnhancedFormattedPDF(pdfText, title);
}

function generateEnhancedStyledPDF(content: any, title: string): Buffer {
  const sections = content?.sections || [];
  
  let pdfText = `${title}\n${'='.repeat(title.length)}\n\n`;
  
  sections.forEach((section: any) => {
    if (section.title && section.content) {
      pdfText += `${section.title}\n${'-'.repeat(section.title.length)}\n`;
      pdfText += `${section.content}\n\n`;
    }
  });
  
  pdfText += `Generated by Jenrate.ai on ${new Date().toLocaleDateString()}`;
  
  return createEnhancedFormattedPDF(pdfText, title);
}

function createEnhancedFormattedPDF(content: string, title: string): Buffer {
  // Enhanced PDF generation with better styling and layout
  const lines = content.split('\n');
  let yPosition = 750;
  const lineHeight = 14;
  const margin = 50;
  const pageWidth = 612;
  const pageHeight = 792;
  
  let pdfCommands = 'BT\n/F1 12 Tf\n';
  let currentPage = 1;
  
  lines.forEach((line, index) => {
    // Check if we need a new page
    if (yPosition < 50) {
      pdfCommands += 'ET\n'; // End text
      // Add new page logic here if needed
      yPosition = 750;
      pdfCommands += 'BT\n/F1 12 Tf\n';
    }
    
    // Detect headers and style them differently
    if (line.includes('='.repeat(3)) || line.includes('-'.repeat(3))) {
      // Skip decoration lines but adjust spacing
      yPosition -= lineHeight / 2;
      return;
    }
    
    // Format text based on content type
    let fontSize = 12;
    let fontWeight = 'F1';
    
    // Title formatting
    if (index === 0 || line === title) {
      fontSize = 16;
      fontWeight = 'F2'; // We'll define this as bold
    }
    
    // Section headers
    else if (lines[index + 1]?.includes('-'.repeat(3))) {
      fontSize = 14;
      fontWeight = 'F2';
    }
    
    // Clean the line and add to PDF
    const cleanLine = line.replace(/'/g, "'").replace(/"/g, '"');
    if (cleanLine.trim()) {
      pdfCommands += `${margin} ${yPosition} Td (${cleanLine}) Tj\n`;
      pdfCommands += `0 -${lineHeight} Td\n`;
      yPosition -= lineHeight;
    } else {
      // Empty line - add small space
      pdfCommands += `0 -${lineHeight / 2} Td\n`;
      yPosition -= lineHeight / 2;
    }
  });
  
  pdfCommands += 'ET\n';
  
  // Create complete PDF with enhanced formatting
  const pdfContent = `%PDF-1.4
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj

2 0 obj
<< /Type /Pages /Kids [3 0 R] /Count 1 >>
endobj

3 0 obj
<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${pageWidth} ${pageHeight}] /Contents 4 0 R /Resources << /Font << /F1 5 0 R /F2 6 0 R >> >> >>
endobj

4 0 obj
<< /Length ${pdfCommands.length + 50} >>
stream
${pdfCommands}
endstream
endobj

5 0 obj
<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>
endobj

6 0 obj
<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>
endobj

xref
0 7
0000000000 65535 f 
0000000010 00000 n 
0000000062 00000 n 
0000000119 00000 n 
0000000267 00000 n 
0000000${(400 + pdfCommands.length).toString().padStart(3, '0')} 00000 n 
0000000${(450 + pdfCommands.length).toString().padStart(3, '0')} 00000 n 
trailer
<< /Size 7 /Root 1 0 R >>
startxref
${500 + pdfCommands.length}
%%EOF`;

  return Buffer.from(pdfContent, 'utf8');
}

async function createSimplePDF(content: string, title: string): Promise<Buffer> {
  // Create a simple PDF-like structure that browsers can interpret
  const pdfHeader = `%PDF-1.4
1 0 obj
<<
/Type /Catalog
/Pages 2 0 R
>>
endobj

2 0 obj
<<
/Type /Pages
/Kids [3 0 R]
/Count 1
>>
endobj

3 0 obj
<<
/Type /Page
/Parent 2 0 R
/MediaBox [0 0 612 792]
/Contents 4 0 R
/Resources <<
  /Font <<
    /F1 5 0 R
  >>
>>
>>
endobj

4 0 obj
<<
/Length ${content.length + 100}
>>
stream
BT
/F1 12 Tf
72 720 Td
(${title}) Tj
0 -20 Td
(${content.substring(0, 1000).replace(/[\(\)]/g, '')}) Tj
ET
endstream
endobj

5 0 obj
<<
/Type /Font
/Subtype /Type1
/BaseFont /Helvetica
>>
endobj

xref
0 6
0000000000 65535 f 
0000000010 00000 n 
0000000062 00000 n 
0000000119 00000 n 
0000000267 00000 n 
0000000${(400 + content.length).toString().padStart(3, '0')} 00000 n 
trailer
<<
/Size 6
/Root 1 0 R
>>
startxref
${500 + content.length}
%%EOF`;

  return Buffer.from(pdfHeader, 'utf8');
}

function generateProfessionalPDFContent(document: Document): string {
  const content = document.content as any;
  const sections = content.sections || [];
  
  let textContent = `${document.title}\n\n`;
  
  sections.forEach((section: any) => {
    textContent += `${section.title}\n`;
    textContent += `${section.content || ''}\n\n`;
    
    if (section.fields) {
      Object.entries(section.fields).forEach(([key, value]) => {
        textContent += `${key.replace(/_/g, ' ')}: ${value}\n`;
      });
      textContent += '\n';
    }
  });
  
  return textContent;
}

// Helper function to convert HTML to structured text preserving the visual layout information
function convertHTMLToStructuredText(htmlContent: string, originalContent: any): string {
  const panels = originalContent.panels || [];
  const coverPanel = panels.find((p: any) => p.type === 'cover') || {};
  const contentPanels = panels.filter((p: any) => p.type !== 'cover');
  
  let structuredText = '';
  
  // Cover section with visual indicators
  structuredText += `${coverPanel.title || 'Business Brochure'}\n`;
  structuredText += `${'='.repeat((coverPanel.title || 'Business Brochure').length)}\n`;
  structuredText += `${coverPanel.subtitle || 'Professional Services'}\n\n`;
  if (coverPanel.content) {
    structuredText += `${coverPanel.content}\n\n`;
  }
  
  // Content panels with visual formatting
  contentPanels.forEach((panel: any, index: number) => {
    structuredText += `${index + 1}. ${panel.title || 'Section'}\n`;
    structuredText += `${'-'.repeat((panel.title || 'Section').length + 3)}\n`;
    if (panel.content) {
      structuredText += `${panel.content}\n`;
    }
    if (panel.subtitle) {
      structuredText += `\n   → ${panel.subtitle}\n`;
    }
    structuredText += '\n';
  });
  
  // Add features section
  structuredText += `KEY FEATURES & BENEFITS\n`;
  structuredText += `${'='.repeat(22)}\n\n`;
  
  structuredText += `✓ Premium Quality Service\n`;
  structuredText += `✓ Professional Excellence  \n`;
  structuredText += `✓ Customer Satisfaction\n\n`;
  
  structuredText += `✓ Experienced Team\n`;
  structuredText += `✓ Reliable Service\n`;
  structuredText += `✓ Competitive Pricing\n\n`;
  
  structuredText += `CONTACT INFORMATION\n`;
  structuredText += `${'='.repeat(18)}\n`;
  structuredText += `Email: info@company.com\n`;
  structuredText += `Phone: +1 (555) 123-4567\n`;
  structuredText += `Address: 123 Business St, City, State\n\n`;
  
  structuredText += `Ready to Get Started?\n`;
  structuredText += `Contact us today to learn more about our solutions!\n\n`;
  
  structuredText += `Generated by Jenrate.ai on ${new Date().toLocaleDateString()}`;
  
  return structuredText;
}

// Enhanced PDF creation from structured content with better formatting
function createPDFFromStructuredContent(content: string, title: string): Buffer {
  console.log('📄 Creating enhanced PDF with structured content...');
  console.log('📄 Content length:', content.length, 'characters');
  
  // Create a more comprehensive PDF with proper formatting
  const lines = content.split('\n');
  const pdfContent = lines.join('\\n').replace(/[()]/g, '');
  
  const pdfStructure = `%PDF-1.4
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj

2 0 obj
<< /Type /Pages /Kids [3 0 R] /Count 1 >>
endobj

3 0 obj
<<
  /Type /Page
  /Parent 2 0 R
  /MediaBox [0 0 612 792]
  /Contents 4 0 R
  /Resources << /Font << /F1 5 0 R /F2 6 0 R >> >>
>>
endobj

4 0 obj
<<
/Length ${content.length + 500}
>>
stream
BT
/F2 16 Tf
50 750 Td
(${title.replace(/[()]/g, '')}) Tj
0 -30 Td
/F1 11 Tf
${lines.slice(0, 50).map((line, index) => {
  const yPos = 720 - (index * 14);
  const cleanLine = line.replace(/[()]/g, '').substring(0, 80);
  return `0 ${yPos - (index * 14)} Td\n(${cleanLine}) Tj`;
}).join('\n')}
ET
endstream
endobj

5 0 obj
<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>
endobj

6 0 obj
<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>
endobj

xref
0 7
0000000000 65535 f 
0000000010 00000 n 
0000000062 00000 n 
0000000119 00000 n 
0000000267 00000 n 
0000000${(800 + content.length).toString().padStart(3, '0')} 00000 n 
0000000${(850 + content.length).toString().padStart(3, '0')} 00000 n 
trailer
<< /Size 7 /Root 1 0 R >>
startxref
${900 + content.length}
%%EOF`;

  return Buffer.from(pdfStructure, 'utf8');
}

// External HTML-to-PDF generation using PDFShift API
export async function generatePDFFromHTMLWithExternalAPI(htmlContent: string, title: string): Promise<Buffer> {
  console.log('🌐 Generating PDF using external HTML-to-PDF API service...');
  
  const apiKey = process.env.PDFSHIFT_API_KEY;
  console.log('🔑 API Key status:', apiKey ? 'Found' : 'Missing');
  
  if (!apiKey) {
    console.log('❌ PDFSHIFT_API_KEY not found, falling back to local generation...');
    return generateRichPDFFromHTML(htmlContent, title);
  }

  try {
    console.log('🚀 Calling PDFShift API for pixel-perfect PDF generation...');
    
    const requestPayload = {
      source: htmlContent
    };
    
    const requestBody = JSON.stringify(requestPayload);
    console.log('📤 Sending request payload keys:', Object.keys(requestPayload));
    console.log('📤 HTML content length:', htmlContent.length);
    
    const authHeader = `Basic ${Buffer.from(`api:${apiKey}`).toString('base64')}`;
    console.log('🔐 Authorization header prepared (length:', authHeader.length, ')');
    
    const response = await fetch('https://api.pdfshift.io/v3/convert/pdf', {
      method: 'POST',
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json'
      },
      body: requestBody
    });

    console.log('📥 API Response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ PDFShift API error (${response.status}):`, errorText);
      
      // Fallback to local generation on API error
      console.log('🔄 Falling back to local PDF generation...');
      return generateRichPDFFromHTML(htmlContent, title);
    }

    const pdfBuffer = Buffer.from(await response.arrayBuffer());
    console.log(`✅ PDF generated successfully via PDFShift API: ${pdfBuffer.length} bytes`);
    
    return pdfBuffer;

  } catch (error) {
    console.error('❌ External PDF API failed:', error);
    
    // Fallback to local generation on network error
    console.log('🔄 Falling back to local PDF generation...');
    return generateRichPDFFromHTML(htmlContent, title);
  }
}

// Enhanced PDF generation from HTML content with rich text formatting (fallback)
export function generateRichPDFFromHTML(htmlContent: string, title: string): Buffer {
  console.log('📄 Creating professional PDF from HTML with advanced formatting...');
  
  // Extract content from HTML with better parsing
  const extractedContent = extractAdvancedContentFromHTML(htmlContent);
  console.log('📄 Extracted content sections:', extractedContent.sections.length);
  
  // Generate a professional PDF with proper structure
  return createProfessionalPDF(extractedContent, title);
}

// Advanced HTML content extraction with better parsing
function extractAdvancedContentFromHTML(htmlContent: string): { title: string, sections: any[] } {
  console.log('🔍 Parsing HTML content for advanced extraction...');
  
  let sections = [];
  
  // Extract title from h1 tags
  const titleMatch = htmlContent.match(/<h1[^>]*>([^<]+)<\/h1>/i);
  const title = titleMatch ? titleMatch[1].trim() : 'Professional Document';
  
  // Extract main sections with h2 tags
  const h2Matches = htmlContent.match(/<h2[^>]*>([^<]+)<\/h2>[\s\S]*?(?=<h2|<\/body|$)/gi);
  
  if (h2Matches) {
    h2Matches.forEach((section, index) => {
      const titleMatch = section.match(/<h2[^>]*>([^<]+)<\/h2>/i);
      const contentMatch = section.match(/<p[^>]*>([^<]+)<\/p>/gi);
      const listMatch = section.match(/<li[^>]*>([^<]+)<\/li>/gi);
      
      if (titleMatch) {
        let content = '';
        
        // Extract paragraph content
        if (contentMatch) {
          content = contentMatch.map(p => 
            p.replace(/<\/?p[^>]*>/gi, '').trim()
          ).join('\n\n');
        }
        
        // Extract list items
        if (listMatch) {
          const listItems = listMatch.map(li => 
            '• ' + li.replace(/<\/?li[^>]*>/gi, '').trim()
          ).join('\n');
          content = content ? `${content}\n\n${listItems}` : listItems;
        }
        
        sections.push({
          type: index === 0 ? 'cover' : 'content',
          title: titleMatch[1].trim(),
          content: content || 'Professional content section'
        });
      }
    });
  }
  
  // Add cover section if not already present
  if (!sections.find(s => s.type === 'cover')) {
    sections.unshift({
      type: 'cover',
      title: title,
      subtitle: 'Professional Business Document',
      content: ''
    });
  }
  
  return {
    title,
    sections: sections
  };
}

// Create professional PDF with enhanced formatting
function createProfessionalPDF(content: { title: string, sections: any[] }, documentTitle: string): Buffer {
  console.log('📄 Creating professional PDF with advanced formatting...');
  
  let pdfText = '';
  
  // Build comprehensive professional content
  content.sections.forEach((section, index) => {
    if (section.type === 'cover') {
      pdfText += `${section.title}\n`;
      pdfText += `${'═'.repeat(Math.min(section.title.length, 50))}\n`;
      if (section.subtitle) {
        pdfText += `${section.subtitle}\n`;
      }
      pdfText += `\n`;
    } else {
      pdfText += `${index}. ${section.title}\n`;
      pdfText += `${'-'.repeat(Math.min(section.title.length + 3, 50))}\n`;
      pdfText += `${section.content || 'Professional content for this section.'}\n\n`;
    }
  });
  
  // Add professional footer
  pdfText += `\n${'═'.repeat(50)}\n`;
  pdfText += `Generated by Jenrate.ai Professional Document System\n`;
  pdfText += `Document created: ${new Date().toLocaleDateString()}\n`;
  pdfText += `Document type: ${documentTitle}\n`;
  
  // Create enhanced PDF structure with better formatting
  const lines = pdfText.split('\n').filter(line => line.trim());
  const maxCharsPerLine = 80;
  
  let pdfCommands = '';
  let currentY = 720;
  const lineHeight = 16;
  let fontSize = 12;
  
  lines.forEach((line, index) => {
    // Adjust font size for headings
    if (line.includes('═')) {
      fontSize = 14;
      pdfCommands += `/F2 ${fontSize} Tf\n`;
    } else if (line.match(/^\d+\./)) {
      fontSize = 13;
      pdfCommands += `/F2 ${fontSize} Tf\n`;
    } else {
      fontSize = 11;
      pdfCommands += `/F1 ${fontSize} Tf\n`;
    }
    
    if (currentY < 80) {
      currentY = 720; // New page
      pdfCommands += `BT\n50 ${currentY} Td\n`;
    }
    
    // Handle long lines
    const chunks = [];
    for (let i = 0; i < line.length; i += maxCharsPerLine) {
      chunks.push(line.substring(i, i + maxCharsPerLine));
    }
    
    chunks.forEach((chunk, chunkIndex) => {
      const cleanChunk = chunk.replace(/[()]/g, '').trim();
      if (cleanChunk) {
        pdfCommands += `50 ${currentY} Td\n(${cleanChunk}) Tj\n0 -${lineHeight} Td\n`;
        currentY -= lineHeight;
      }
    });
  });
  
  const pdfStructure = `%PDF-1.4
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj

2 0 obj
<< /Type /Pages /Kids [3 0 R] /Count 1 >>
endobj

3 0 obj
<<
  /Type /Page
  /Parent 2 0 R
  /MediaBox [0 0 612 792]
  /Contents 4 0 R
  /Resources << /Font << /F1 5 0 R /F2 6 0 R >> >>
>>
endobj

4 0 obj
<<
/Length ${pdfCommands.length + 250}
>>
stream
BT
/F2 16 Tf
50 750 Td
(${documentTitle.replace(/[()]/g, '').substring(0, 40)}) Tj
0 -30 Td
${pdfCommands}
ET
endstream
endobj

5 0 obj
<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>
endobj

6 0 obj
<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>
endobj

xref
0 7
0000000000 65535 f 
0000000010 00000 n 
0000000062 00000 n 
0000000119 00000 n 
0000000267 00000 n 
0000000${(650 + pdfCommands.length).toString().padStart(3, '0')} 00000 n 
0000000${(700 + pdfCommands.length).toString().padStart(3, '0')} 00000 n 
trailer
<< /Size 7 /Root 1 0 R >>
startxref
${750 + pdfCommands.length}
%%EOF`;

  console.log('📄 Generated professional PDF with', lines.length, 'content lines');
  return Buffer.from(pdfStructure, 'utf8');
}

// Enhanced function that's already implemented
function generateRichTextPDFFromHTML(htmlContent: string, title: string): Buffer {
  console.log('📄 Creating rich text PDF from HTML with enhanced structure...');
  
  // Extract meaningful content from the HTML
  const extractedContent = extractContentFromBrochureHTML(htmlContent);
  console.log('📄 Extracted content sections:', extractedContent.sections.length);
  
  // Generate a comprehensive PDF with proper structure
  return createStructuredPDF(extractedContent, title);
}

// Extract structured content from brochure HTML
function extractContentFromBrochureHTML(htmlContent: string): { title: string, sections: any[] } {
  // Simple HTML parsing to extract meaningful content
  const coverMatch = htmlContent.match(/<h1[^>]*>([^<]+)<\/h1>[\s\S]*?<h2[^>]*>([^<]+)<\/h2>/);
  const panelMatches = htmlContent.match(/<div class="panel">[\s\S]*?<h3[^>]*>([^<]+)<\/h3>[\s\S]*?<p>([^<]+)<\/p>/g);
  
  let sections = [];
  
  if (coverMatch) {
    sections.push({
      type: 'cover',
      title: coverMatch[1].trim(),
      subtitle: coverMatch[2].trim(),
      content: ''
    });
  }
  
  if (panelMatches) {
    panelMatches.forEach(match => {
      const titleMatch = match.match(/<h3[^>]*>([^<]+)<\/h3>/);
      const contentMatch = match.match(/<p>([^<]+)<\/p>/);
      if (titleMatch && contentMatch) {
        sections.push({
          type: 'content',
          title: titleMatch[1].trim(),
          content: contentMatch[1].trim()
        });
      }
    });
  }
  
  // Add standard features section
  sections.push({
    type: 'features',
    title: 'Key Features & Benefits',
    content: '✓ Premium Quality Service\n✓ Professional Excellence\n✓ Customer Satisfaction\n✓ Experienced Team\n✓ Reliable Service\n✓ Competitive Pricing'
  });
  
  return {
    title: coverMatch ? coverMatch[1].trim() : 'Business Brochure',
    sections: sections
  };
}

// Create a properly structured PDF with better formatting
function createStructuredPDF(content: { title: string, sections: any[] }, documentTitle: string): Buffer {
  console.log('📄 Creating structured PDF with enhanced formatting...');
  
  let pdfText = '';
  let yPosition = 750;
  const lineHeight = 16;
  
  // Build comprehensive content
  content.sections.forEach((section, index) => {
    if (section.type === 'cover') {
      pdfText += `${section.title}\n`;
      pdfText += `${'='.repeat(section.title.length)}\n`;
      pdfText += `${section.subtitle}\n\n`;
    } else {
      pdfText += `${index}. ${section.title}\n`;
      pdfText += `${'-'.repeat(section.title.length + 3)}\n`;
      pdfText += `${section.content}\n\n`;
    }
  });
  
  pdfText += `\nGenerated by Jenrate.ai on ${new Date().toLocaleDateString()}`;
  
  // Create enhanced PDF structure
  const lines = pdfText.split('\n').filter(line => line.trim());
  const maxCharsPerLine = 70;
  
  let pdfCommands = '';
  let currentY = 720;
  
  lines.forEach((line, index) => {
    if (currentY < 50) {
      currentY = 720; // New page logic would go here
    }
    
    const chunks = [];
    for (let i = 0; i < line.length; i += maxCharsPerLine) {
      chunks.push(line.substring(i, i + maxCharsPerLine));
    }
    
    chunks.forEach((chunk, chunkIndex) => {
      const cleanChunk = chunk.replace(/[()]/g, '').trim();
      if (cleanChunk) {
        pdfCommands += `50 ${currentY} Td\n(${cleanChunk}) Tj\n0 -${lineHeight} Td\n`;
        currentY -= lineHeight;
      }
    });
  });
  
  const pdfStructure = `%PDF-1.4
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj

2 0 obj
<< /Type /Pages /Kids [3 0 R] /Count 1 >>
endobj

3 0 obj
<<
  /Type /Page
  /Parent 2 0 R
  /MediaBox [0 0 612 792]
  /Contents 4 0 R
  /Resources << /Font << /F1 5 0 R /F2 6 0 R >> >>
>>
endobj

4 0 obj
<<
/Length ${pdfCommands.length + 200}
>>
stream
BT
/F2 18 Tf
50 750 Td
(${documentTitle.replace(/[()]/g, '')}) Tj
0 -30 Td
/F1 12 Tf
${pdfCommands}
ET
endstream
endobj

5 0 obj
<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>
endobj

6 0 obj
<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>
endobj

xref
0 7
0000000000 65535 f 
0000000010 00000 n 
0000000062 00000 n 
0000000119 00000 n 
0000000267 00000 n 
0000000${(600 + pdfCommands.length).toString().padStart(3, '0')} 00000 n 
0000000${(650 + pdfCommands.length).toString().padStart(3, '0')} 00000 n 
trailer
<< /Size 7 /Root 1 0 R >>
startxref
${700 + pdfCommands.length}
%%EOF`;

  console.log('📄 Generated structured PDF with', lines.length, 'content lines');
  return Buffer.from(pdfStructure, 'utf8');
}

function generateHTMLContent(document: Document): string {
  const serviceType = document.serviceType || 'document';
  
  if (serviceType.includes('resume') || serviceType.includes('cv')) {
    return generateResumeHTML(document);
  } else if (serviceType.includes('pitch-deck')) {
    return generatePitchDeckHTML(document);
  } else if (serviceType.includes('invoice')) {
    return generateInvoiceHTML(document);
  } else if (serviceType.includes('report')) {
    return generateReportHTML(document);
  } else if (serviceType.includes('business-plan')) {
    return generateBusinessPlanHTML(document);
  } else if (serviceType.includes('brochure')) {
    return generateBrochureHTML(document);
  } else if (serviceType.includes('newsletter')) {
    return generateNewsletterHTML(document);
  } else {
    return generateGenericHTML(document);
  }
}

function generateResumeHTML(document: Document): string {
  const content = document.content as any;
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>${document.title}</title>
      ${basePdfStyles}
    </head>
    <body>
      <div class="document">
        <div class="resume-header">
          <div class="resume-name">${content.personal_info?.name || 'Professional Resume'}</div>
          <div class="resume-title">${content.personal_info?.title || content.personal_info?.position || ''}</div>
          <div class="contact-info">
            ${content.personal_info?.email ? `<span>📧 ${content.personal_info.email}</span>` : ''}
            ${content.personal_info?.phone ? `<span>📱 ${content.personal_info.phone}</span>` : ''}
            ${content.personal_info?.location ? `<span>📍 ${content.personal_info.location}</span>` : ''}
            ${content.personal_info?.linkedin ? `<span>💼 ${content.personal_info.linkedin}</span>` : ''}
          </div>
        </div>
        
        ${content.sections?.map((section: any) => `
          <div class="section">
            <div class="section-title">${section.title}</div>
            <div class="section-content">${section.content || ''}</div>
            ${section.items?.map((item: any) => `
              <div style="margin-bottom: 15px;">
                <div style="font-weight: 600; color: #2c1810;">${item.title || item.position || ''}</div>
                <div style="color: #666; font-size: 10px; margin-bottom: 5px;">
                  ${item.company || ''} ${item.date || item.duration || ''}
                </div>
                <div style="margin-left: 10px;">${item.description || item.details || ''}</div>
              </div>
            `).join('') || ''}
          </div>
        `).join('') || ''}
      </div>
    </body>
    </html>
  `;
}

function generatePitchDeckHTML(document: Document): string {
  const content = document.content as any;
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>${document.title}</title>
      ${basePdfStyles}
    </head>
    <body>
      <div class="document">
        <div class="header">
          <div class="title">${document.title}</div>
          <div class="subtitle">Professional Pitch Deck Presentation</div>
        </div>
        
        ${content.slides?.map((slide: any, index: number) => `
          <div class="pitch-slide">
            <div class="slide-title">${slide.title || `Slide ${index + 1}`}</div>
            ${slide.subtitle ? `<div class="slide-subtitle">${slide.subtitle}</div>` : ''}
            <div class="section-content">${slide.content || ''}</div>
          </div>
        `).join('') || ''}
      </div>
    </body>
    </html>
  `;
}

function generateInvoiceHTML(document: Document): string {
  const content = document.content as any;
  const sections = content.sections || [];
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>${document.title}</title>
      ${basePdfStyles}
    </head>
    <body>
      <div class="document">
        <div class="invoice-header">
          <div class="invoice-company">
            <div style="font-size: 24px; font-weight: 700; color: #2c1810; margin-bottom: 10px;">
              ${sections.find((s: any) => s.type === 'header')?.fields?.companyName || 'Invoice'}
            </div>
            <div style="color: #666; font-size: 10px;">
              ${sections.find((s: any) => s.type === 'header')?.fields?.companyAddress || ''}
            </div>
          </div>
          <div class="invoice-details">
            <div class="invoice-number">INVOICE</div>
            <div style="color: #666;">
              ${sections.find((s: any) => s.type === 'invoice_details')?.fields?.invoiceNumber || ''}
            </div>
          </div>
        </div>
        
        ${sections.map((section: any) => `
          <div class="section">
            <div class="section-title">${section.title}</div>
            <div class="section-content">${section.content || ''}</div>
            ${section.fields ? `
              <div class="field-grid">
                ${Object.entries(section.fields).map(([key, value]: [string, any]) => `
                  <div class="field-item">
                    <div class="field-label">${key.replace(/_/g, ' ')}</div>
                    <div class="field-value">${value}</div>
                  </div>
                `).join('')}
              </div>
            ` : ''}
          </div>
        `).join('')}
      </div>
    </body>
    </html>
  `;
}

function generateReportHTML(document: Document): string {
  const content = document.content as any;
  const templateName = content.templateInfo?.templateName || '';
  
  // Use exact PDF template layouts based on template name
  if (templateName === "Green Corporate Annual Report") {
    return generateGreenCorporateAnnualReportHTMLForPDF(content);
  }
  
  if (templateName === "Corporate Annual Report" || templateName === "White Blue Corporate Annual Report") {
    return generateWhiteBlueCorporateAnnualReportHTMLForPDF(content);
  }
  
  if (templateName === "Financial Report" || templateName?.includes("Black Minimalist")) {
    return generateBlackMinimalistFinancialReportHTMLForPDF(content);
  }

  // Fallback generic report layout
  const sections = content.sections || [];
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>${document.title}</title>
      ${basePdfStyles}
    </head>
    <body>
      <div class="document">
        <div class="header">
          <div class="title">${document.title}</div>
          <div class="subtitle">Professional Business Report</div>
        </div>
        
        ${sections.map((section: any) => `
          <div class="section">
            <div class="section-title">${section.title}</div>
            <div class="section-content">${section.content || ''}</div>
          </div>
        `).join('')}
        
        <div class="highlight-box">
          <div style="font-weight: 600;">Report Generated on ${new Date().toLocaleDateString()}</div>
        </div>
      </div>
    </body>
    </html>
  `;
}

// Green Corporate Annual Report HTML for PDF
function generateGreenCorporateAnnualReportHTMLForPDF(content: any): string {
  const cover = content.cover || {};
  const sections = content.sections || [];
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>${cover.companyName || 'Company'} Annual Report ${cover.year || '2025'}</title>
      <style>
        body { margin: 0; padding: 0; font-family: 'Georgia', serif; color: #333; }
        .cover-page {
          height: 100vh; 
          background: linear-gradient(135deg, #16a085, #2e8b57);
          color: white;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          padding: 60px;
          page-break-after: always;
        }
        .company-header { font-size: 36px; font-weight: bold; letter-spacing: 2px; }
        .year-title { 
          text-align: center; 
          flex: 1; 
          display: flex; 
          flex-direction: column; 
          justify-content: center; 
        }
        .year { font-size: 120px; font-weight: bold; margin-bottom: 20px; }
        .annual-report { font-size: 72px; font-weight: 300; letter-spacing: 8px; line-height: 1.2; }
        .footer-info {
          display: flex;
          justify-content: space-between;
          align-items: end;
          font-size: 14px;
        }
        .prepared-info { text-align: left; }
        .contact-info { text-align: right; }
        .content-page {
          padding: 40px 60px;
          min-height: 90vh;
          page-break-before: always;
        }
        .section-header {
          border-left: 6px solid #16a085;
          padding-left: 30px;
          margin: 40px 0 30px 0;
        }
        .section-title {
          font-size: 32px;
          font-weight: bold;
          color: #2c3e50;
          text-transform: uppercase;
          letter-spacing: 2px;
        }
        .section-content {
          font-size: 16px;
          line-height: 1.8;
          color: #34495e;
          margin: 20px 0;
        }
      </style>
    </head>
    <body>
      <div class="cover-page">
        <div class="company-header">${cover.companyName || 'Company Name'}</div>
        <div class="year-title">
          <div class="year">${cover.year || '2025'}</div>
          <div class="annual-report">ANNUAL<br>REPORT</div>
        </div>
        <div class="footer-info">
          <div class="prepared-info">
            <div><strong>PREPARED BY:</strong></div>
            <div>${cover.preparedBy || 'Prepared By'}</div>
            <div style="margin-top: 15px;"><strong>PRESENTED TO:</strong></div>
            <div>${cover.presentedTo || 'Presented To'}</div>
          </div>
          <div class="contact-info">
            <div>📞 ${cover.contact?.phone || '123-456-7890'}</div>
            <div>📱 ${cover.contact?.social || '@reallygreatsite'}</div>
            <div>🌐 ${cover.contact?.website || 'www.reallygreatsite.com'}</div>
          </div>
        </div>
      </div>
      
      ${sections.map((section: any) => `
        <div class="content-page">
          <div class="section-header">
            <h2 class="section-title">${section.title}</h2>
          </div>
          <div class="section-content">${section.content}</div>
        </div>
      `).join('')}
    </body>
    </html>
  `;
}

// White Blue Corporate Annual Report HTML for PDF
function generateWhiteBlueCorporateAnnualReportHTMLForPDF(content: any): string {
  const cover = content.cover || {};
  const sections = content.sections || [];
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>${cover.companyName || 'Company'} Annual Report ${cover.year || '2025'}</title>
      <style>
        body { margin: 0; padding: 0; font-family: 'Georgia', serif; color: #2c3e50; }
        .cover-page {
          height: 100vh; 
          background: white;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          padding: 60px;
          page-break-after: always;
        }
        .company-header { 
          text-align: center; 
          font-size: 48px; 
          font-weight: bold; 
          color: #1e3a8a; 
          letter-spacing: 3px; 
          margin-top: 80px;
        }
        .title-section { 
          text-align: center; 
          flex: 1; 
          display: flex; 
          flex-direction: column; 
          justify-content: center; 
        }
        .annual-report { 
          font-size: 84px; 
          font-weight: bold; 
          color: #1e40af; 
          letter-spacing: 6px; 
          line-height: 1.1; 
          margin-bottom: 30px;
        }
        .year { font-size: 36px; color: #64748b; font-weight: 300; }
        .footer-info {
          display: flex;
          justify-content: space-between;
          align-items: end;
          font-size: 14px;
          color: #64748b;
        }
        .contact-center {
          text-align: center;
          margin-top: 30px;
          font-size: 12px;
          color: #64748b;
        }
        .content-page {
          padding: 40px 60px;
          min-height: 90vh;
          page-break-before: always;
        }
        .section-header {
          border-left: 6px solid #1e40af;
          padding-left: 30px;
          margin: 40px 0 30px 0;
        }
        .section-title {
          font-size: 32px;
          font-weight: bold;
          color: #1e40af;
          text-transform: uppercase;
          letter-spacing: 2px;
        }
        .section-content {
          font-size: 16px;
          line-height: 1.8;
          color: #374151;
          margin: 20px 0;
        }
      </style>
    </head>
    <body>
      <div class="cover-page">
        <div class="company-header">${cover.companyName || 'Company Name'}</div>
        <div class="title-section">
          <div class="annual-report">ANNUAL<br>REPORT</div>
          <div class="year">${cover.year || '2025'}</div>
        </div>
        <div class="footer-info">
          <div>
            <div><strong>PREPARED BY:</strong></div>
            <div>${cover.preparedBy || 'Prepared By'}</div>
          </div>
          <div>
            <div><strong>PRESENTED TO:</strong></div>
            <div>${cover.presentedTo || 'Presented To'}</div>
          </div>
        </div>
        <div class="contact-center">
          <div>📞 ${cover.contact?.phone || '123-456-7890'}</div>
          <div>📱 ${cover.contact?.social || '@reallygreatsite'}</div>
          <div>🌐 ${cover.contact?.website || 'www.reallygreatsite.com'}</div>
        </div>
      </div>
      
      ${sections.map((section: any) => `
        <div class="content-page">
          <div class="section-header">
            <h2 class="section-title">${section.title}</h2>
          </div>
          <div class="section-content">${section.content}</div>
        </div>
      `).join('')}
    </body>
    </html>
  `;
}

// Black Minimalist Financial Report HTML for PDF  
function generateBlackMinimalistFinancialReportHTMLForPDF(content: any): string {
  const cover = content.cover || {};
  const sections = content.sections || [];
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>${cover.companyName || 'Company'} Financial Report</title>
      <style>
        body { margin: 0; padding: 0; font-family: 'Arial', sans-serif; color: #000; }
        .cover-page {
          height: 100vh; 
          background: white;
          display: flex;
          flex-direction: column;
          padding: 60px;
          page-break-after: always;
        }
        .header-section {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 80px;
        }
        .company-name { 
          font-size: 24px; 
          font-weight: bold; 
          letter-spacing: 2px; 
          text-transform: uppercase;
        }
        .report-date { 
          font-size: 14px; 
          color: #666; 
          text-align: right;
        }
        .main-title-section { 
          flex: 1; 
          display: flex; 
          flex-direction: column; 
          justify-content: center; 
          max-width: 500px;
        }
        .financial-title { 
          font-size: 72px; 
          font-weight: 300; 
          color: #000; 
          line-height: 1.1; 
          margin-bottom: 20px;
        }
        .report-subtitle { 
          font-size: 20px; 
          color: #666; 
          font-weight: 500;
        }
        .footer-contact {
          border-top: 1px solid #e5e5e5;
          padding-top: 30px;
          display: flex;
          justify-content: space-between;
          font-size: 12px;
          color: #666;
        }
        .content-page {
          padding: 40px 60px;
          min-height: 90vh;
          page-break-before: always;
        }
        .section-title {
          font-size: 28px;
          font-weight: bold;
          color: #000;
          text-transform: uppercase;
          letter-spacing: 2px;
          margin: 40px 0 30px 0;
        }
        .section-content {
          font-size: 16px;
          line-height: 1.8;
          color: #333;
          margin: 20px 0;
        }
        .metrics-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 20px;
          margin: 30px 0;
        }
        .metric-card {
          background: #f8f9fa;
          padding: 20px;
          border-radius: 8px;
          border: 1px solid #e9ecef;
        }
        .metric-label {
          font-size: 12px;
          color: #666;
          text-transform: uppercase;
          margin-bottom: 8px;
        }
        .metric-value {
          font-size: 24px;
          font-weight: bold;
          color: #000;
        }
      </style>
    </head>
    <body>
      <div class="cover-page">
        <div class="header-section">
          <div class="company-name">${cover.companyName || 'LEGEND BOOKS & PUBLISHING'}</div>
          <div class="report-date">${cover.date || 'April 2030'}</div>
        </div>
        
        <div class="main-title-section">
          <div class="financial-title">${cover.title || 'Financial<br>Report'}</div>
          <div class="report-subtitle">${cover.subtitle || 'Q2 for 2030'}</div>
        </div>
        
        <div class="footer-contact">
          <div>
            <div><strong>CEO Name</strong></div>
            <div>Chief Executive Officer</div>
          </div>
          <div style="text-align: right;">
            <div>123 Anywhere Street, Any City,</div>
            <div>ST 123456</div>
            <div>www.reallygreatsite.com</div>
          </div>
        </div>
      </div>
      
      ${sections.map((section: any) => `
        <div class="content-page">
          <h2 class="section-title">${section.title}</h2>
          <div class="section-content">
            ${typeof section.content === 'string' ? section.content : 
              typeof section.content === 'object' ? 
                `<div class="metrics-grid">
                  ${Object.entries(section.content).map(([key, value]: [string, any]) => {
                    if (typeof value === 'object') {
                      return Object.entries(value).map(([subKey, subValue]) => 
                        `<div class="metric-card">
                          <div class="metric-label">${subKey.replace(/_/g, ' ')}</div>
                          <div class="metric-value">${subValue}</div>
                        </div>`
                      ).join('');
                    }
                    return `<div class="metric-card">
                      <div class="metric-label">${key.replace(/_/g, ' ')}</div>
                      <div class="metric-value">${value}</div>
                    </div>`;
                  }).join('')}
                </div>` : 
                'No content available'
            }
          </div>
        </div>
      `).join('')}
    </body>
    </html>
  `;
}

function generateBusinessPlanHTML(document: Document): string {
  const content = document.content as any;
  const sections = content.sections || [];
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>${document.title}</title>
      ${basePdfStyles}
    </head>
    <body>
      <div class="document">
        <div class="header">
          <div class="title">${document.title}</div>
          <div class="subtitle">Comprehensive Business Plan</div>
        </div>
        
        ${sections.map((section: any, index: number) => `
          <div class="section">
            <div class="section-title">${section.title}</div>
            <div class="section-content">${section.content || ''}</div>
            ${section.fields ? `
              <div class="field-grid">
                ${Object.entries(section.fields).map(([key, value]: [string, any]) => `
                  <div class="field-item">
                    <div class="field-label">${key.replace(/_/g, ' ')}</div>
                    <div class="field-value">${value}</div>
                  </div>
                `).join('')}
              </div>
            ` : ''}
          </div>
          ${index === 2 ? '<div class="page-break"></div>' : ''}
        `).join('')}
      </div>
    </body>
    </html>
  `;
}

function generateBrochureHTML(document: Document): string {
  const content = document.content as any;
  const panels = content.panels || [];
  
  // Get cover panel and content panels
  const coverPanel = panels.find((p: any) => p.type === 'cover') || panels[0] || {};
  const contentPanels = panels.filter((p: any) => p.type !== 'cover');
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>${document.title}</title>
      ${basePdfStyles}
      <style>
        .brochure-cover {
          background: linear-gradient(135deg, #14b8a6 0%, #0891b2 100%);
          color: white;
          padding: 40px;
          border-radius: 12px;
          text-align: center;
          margin-bottom: 30px;
        }
        .brochure-title {
          font-family: 'Playfair Display', serif;
          font-size: 36px;
          font-weight: 700;
          margin-bottom: 10px;
        }
        .brochure-subtitle {
          font-size: 18px;
          opacity: 0.9;
          margin-bottom: 15px;
        }
        .panel {
          background: white;
          margin-bottom: 25px;
          padding: 25px;
          border-radius: 8px;
          border-left: 4px solid #14b8a6;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
        .panel-title {
          font-family: 'Playfair Display', serif;
          font-size: 22px;
          font-weight: 600;
          color: #14b8a6;
          margin-bottom: 15px;
        }
        .panel-content {
          font-size: 14px;
          line-height: 1.7;
          color: #374151;
        }
      </style>
    </head>
    <body>
      <div class="document">
        <!-- Brochure Cover -->
        <div class="brochure-cover">
          <div class="brochure-title">${coverPanel.title || document.title}</div>
          <div class="brochure-subtitle">${coverPanel.subtitle || 'Professional Services'}</div>
          ${coverPanel.content ? `<p style="font-size: 16px; margin-top: 15px;">${coverPanel.content}</p>` : ''}
        </div>
        
        <!-- Content Panels -->
        ${contentPanels.map((panel: any) => `
          <div class="panel">
            <div class="panel-title">${panel.title || 'Section'}</div>
            <div class="panel-content">${panel.content || ''}</div>
            ${panel.subtitle ? `<p style="color: #14b8a6; font-weight: 500; margin-top: 10px;">${panel.subtitle}</p>` : ''}
          </div>
        `).join('')}
        
        <!-- Call to Action -->
        <div style="background: linear-gradient(135deg, #14b8a6 0%, #0891b2 100%); color: white; padding: 25px; border-radius: 8px; text-align: center; margin-top: 30px;">
          <h3 style="font-size: 24px; margin-bottom: 10px;">Ready to Get Started?</h3>
          <p style="font-size: 16px; margin-bottom: 0;">Contact us today to learn more about our services.</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

function generateNewsletterHTML(document: Document): string {
  const content = document.content as any;
  const sections = content.sections || [];
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>${document.title}</title>
      ${basePdfStyles}
    </head>
    <body>
      <div class="document">
        <div class="header">
          <div class="title">${sections.find((s: any) => s.type === 'header')?.fields?.title || document.title}</div>
          <div class="subtitle">${sections.find((s: any) => s.type === 'header')?.fields?.subtitle || 'Professional Newsletter'}</div>
        </div>
        
        ${sections.filter((s: any) => s.type !== 'header').map((section: any) => `
          <div class="section">
            <div class="section-title">${section.title}</div>
            <div class="section-content">${section.content || ''}</div>
          </div>
        `).join('')}
      </div>
    </body>
    </html>
  `;
}

function generateGenericHTML(document: Document): string {
  const content = document.content as any;
  const sections = content.sections || [];
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>${document.title}</title>
      ${basePdfStyles}
    </head>
    <body>
      <div class="document">
        <div class="header">
          <div class="title">${document.title}</div>
          <div class="subtitle">Professional Document</div>
        </div>
        
        ${sections.map((section: any) => `
          <div class="section">
            <div class="section-title">${section.title}</div>
            <div class="section-content">${section.content || ''}</div>
            ${section.fields ? `
              <div class="field-grid">
                ${Object.entries(section.fields).map(([key, value]: [string, any]) => `
                  <div class="field-item">
                    <div class="field-label">${key.replace(/_/g, ' ')}</div>
                    <div class="field-value">${value}</div>
                  </div>
                `).join('')}
              </div>
            ` : ''}
          </div>
        `).join('')}
      </div>
    </body>
    </html>
  `;
}

