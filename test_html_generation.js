// Test the HTML generation function to ensure it matches the preview
const testContent = {
  "panels": [
    {
      "type": "cover",
      "title": "TechSolutions Inc",
      "subtitle": "Innovative AI Solutions for a Smarter Future"
    },
    {
      "type": "about", 
      "title": "About TechSolutions Inc",
      "content": "Founded 8 years ago in the heart of London, TechSolutions Inc has been at the forefront of AI innovation. Our team of experts is dedicated to developing cutting-edge software solutions that empower businesses to harness the power of artificial intelligence."
    },
    {
      "type": "services",
      "title": "Our Services", 
      "content": "At TechSolutions Inc, we specialize in a range of AI-driven services including machine learning model development, natural language processing, and data analytics. Our solutions are tailored to meet the unique needs of each client, ensuring maximum efficiency and effectiveness."
    },
    {
      "type": "credentials",
      "title": "Why Choose Us",
      "content": "With a stellar 4.9-star rating, TechSolutions Inc is recognized for its commitment to excellence and customer satisfaction. Our experienced team and innovative approach have earned us a reputation as leaders in the AI industry."
    },
    {
      "type": "contact",
      "title": "Get In Touch", 
      "content": "Contact us today to learn how TechSolutions Inc can transform your business with AI. Visit us in London or reach out via email at contact@techsolutionsinc.com or call us at +44 20 7946 0958."
    }
  ],
  "templateInfo": {
    "templateId": "8a3aff97-3a6f-4ed0-b53b-36f55574a392",
    "templateName": "Marketing Brochure",
    "templateCategory": "brochure"
  }
};

// Generate brochure HTML that matches the BrochureTemplate component exactly
function generateBrochureHTML(data, title) {
  const panels = data.panels || [];
  const coverPanel = panels.find((p) => p.type === 'cover') || panels[0] || {};
  const contentPanels = panels.filter((p) => p.type !== 'cover');
  
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${title}</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
          font-family: 'Arial', sans-serif;
          background: linear-gradient(135deg, #f0fdfa 0%, #e6fffa 100%);
          min-height: 100vh;
          padding: 32px;
          line-height: 1.6;
        }
        .container { max-width: 1200px; margin: 0 auto; }
        
        /* Cover Section */
        .cover {
          background: linear-gradient(to right, #0f766e, #0891b2);
          color: white;
          padding: 48px;
          border-radius: 8px;
          margin-bottom: 32px;
          text-align: center;
        }
        .cover h1 { font-size: 3rem; font-weight: bold; margin-bottom: 16px; }
        .cover h2 { font-size: 1.5rem; color: #5eead4; margin-bottom: 24px; }
        .cover p { font-size: 1.25rem; color: #99f6e4; }
        
        /* Content Panels */
        .content-panel {
          background: white;
          padding: 32px;
          border-radius: 8px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          border-left: 4px solid #0d9488;
          margin-bottom: 32px;
        }
        .content-panel h3 {
          font-size: 1.5rem;
          font-weight: bold;
          color: #115e59;
          margin-bottom: 16px;
        }
        .content-panel p {
          color: #374151;
          font-size: 1.125rem;
          line-height: 1.75;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <!-- Cover Section -->
        <div class="cover">
          <h1>${coverPanel.title || 'Business Brochure'}</h1>
          <h2>${coverPanel.subtitle || 'Professional Services'}</h2>
        </div>
        
        <!-- Content Panels -->
        ${contentPanels.map((panel) => `
          <div class="content-panel">
            <h3>${panel.title}</h3>
            <p>${panel.content || ''}</p>
          </div>
        `).join('')}
      </div>
    </body>
    </html>
  `;
}

const generatedHTML = generateBrochureHTML(testContent, "TechSolutions Inc Marketing Brochure");
console.log("Generated HTML length:", generatedHTML.length);
console.log("Contains styling:", generatedHTML.includes('linear-gradient'));
console.log("Contains panels:", testContent.panels.length);

// Save to file for testing
require('fs').writeFileSync('generated_brochure.html', generatedHTML);
console.log("HTML saved to generated_brochure.html");