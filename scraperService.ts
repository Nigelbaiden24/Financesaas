import axios from 'axios';

interface ScrapedData {
  title?: string;
  content?: string;
  url?: string;
  domain?: string;
  timestamp: string;
}

interface CompanyInfo {
  name: string;
  industry?: string;
  description?: string;
  website?: string;
  location?: string;
  size?: string;
  founded?: string;
  timestamp?: string;
}

interface MarketData {
  industry: string;
  trends: string[];
  statistics: string[];
  competitors: string[];
}

class ScraperAPIService {
  private apiKey: string;
  private baseUrl = 'https://api.scraperapi.com';

  constructor() {
    this.apiKey = process.env.SCRAPER_API_KEY || '';
    if (!this.apiKey) {
      console.warn('SCRAPER_API_KEY not found in environment variables');
    }
  }

  private async scrapeUrl(url: string, params: any = {}): Promise<string | null> {
    if (!this.apiKey) {
      console.warn('Scraper API key not configured, skipping web scraping');
      return null;
    }

    try {
      const response = await axios.get(this.baseUrl, {
        params: {
          api_key: this.apiKey,
          url: url,
          render: false,
          country_code: 'us',
          ...params
        },
        timeout: 6000 // Reduced timeout to 6 seconds
      });

      return response.data;
    } catch (error: any) {
      console.warn(`Scraper API timeout/error for ${url}: ${error.message}`);
      // Don't throw error, return null to continue without live data
      return null;
    }
  }

  // Extract company information from various sources
  async getCompanyInfo(companyName: string): Promise<CompanyInfo | null> {
    try {
      // Search for company on LinkedIn
      const linkedinUrl = `https://www.linkedin.com/company/${companyName.toLowerCase().replace(/\s+/g, '-')}/`;
      const linkedinData = await this.scrapeUrl(linkedinUrl);
      if (!linkedinData) return null;

      // Extract company details from LinkedIn page
      const companyInfo = this.extractCompanyInfoFromHTML(linkedinData, companyName);
      
      if (companyInfo) {
        return companyInfo;
      }

      // Fallback: Try company's official website
      const websiteUrl = `https://www.${companyName.toLowerCase().replace(/\s+/g, '')}.com`;
      const websiteData = await this.scrapeUrl(websiteUrl);
      if (!websiteData) return null;
      
      return this.extractCompanyInfoFromWebsite(websiteData, companyName);
    } catch (error) {
      console.error(`Error fetching company info for ${companyName}:`, error);
      return null;
    }
  }

  // Get current industry trends and market data
  async getIndustryData(industry: string): Promise<MarketData | null> {
    try {
      const searchQueries = [
        `${industry} industry trends 2025`,
        `${industry} market statistics current`,
        `${industry} leading companies competitors`
      ];

      const promises = searchQueries.map(query => 
        this.searchForIndustryInfo(query)
      );

      const results = await Promise.allSettled(promises);
      
      const trends: string[] = [];
      const statistics: string[] = [];
      const competitors: string[] = [];

      results.forEach((result, index) => {
        if (result.status === 'fulfilled' && result.value) {
          if (index === 0) trends.push(...result.value);
          if (index === 1) statistics.push(...result.value);
          if (index === 2) competitors.push(...result.value);
        }
      });

      return {
        industry,
        trends: trends.slice(0, 5),
        statistics: statistics.slice(0, 5),
        competitors: competitors.slice(0, 10)
      };
    } catch (error) {
      console.error(`Error fetching industry data for ${industry}:`, error);
      return null;
    }
  }

  // Search for current news and information
  async getCurrentInfo(searchQuery: string): Promise<ScrapedData[]> {
    try {
      // Search on Google News for recent information
      const newsUrl = `https://news.google.com/search?q=${encodeURIComponent(searchQuery)}&hl=en-US&gl=US&ceid=US:en`;
      const newsData = await this.scrapeUrl(newsUrl);
      if (!newsData) return [];

      return this.extractNewsData(newsData, searchQuery);
    } catch (error) {
      console.error(`Error fetching current info for "${searchQuery}":`, error);
      return [];
    }
  }

  // Get financial/business data for reports
  async getBusinessMetrics(companyName: string): Promise<any> {
    try {
      // Try to get basic business information
      const searchTerms = [
        `${companyName} revenue 2024`,
        `${companyName} employee count`,
        `${companyName} business model`,
        `${companyName} financial performance`
      ];

      const results = await Promise.allSettled(
        searchTerms.map(term => this.searchBusinessInfo(term))
      );

      const metrics = {};
      results.forEach((result, index) => {
        if (result.status === 'fulfilled' && result.value) {
          const keys = ['revenue', 'employees', 'businessModel', 'performance'];
          const key = keys[index];
          if (key) {
            (metrics as any)[key] = result.value;
          }
        }
      });

      return metrics;
    } catch (error) {
      console.error(`Error fetching business metrics for ${companyName}:`, error);
      return {};
    }
  }

  private async searchForIndustryInfo(query: string): Promise<string[]> {
    try {
      const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(query)}`;
      const html = await this.scrapeUrl(searchUrl);
      if (!html) return [];
      
      // Extract relevant information from search results
      return this.extractKeyPointsFromHTML(html);
    } catch (error) {
      console.error('Error searching for industry info:', error);
      return [];
    }
  }

  private async searchBusinessInfo(query: string): Promise<string> {
    try {
      const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(query)}`;
      const html = await this.scrapeUrl(searchUrl);
      if (!html) return '';
      
      return this.extractBusinessInfoFromHTML(html);
    } catch (error) {
      console.error('Error searching for business info:', error);
      return '';
    }
  }

  private extractCompanyInfoFromHTML(html: string, companyName: string): CompanyInfo | null {
    try {
      // Basic regex patterns to extract company information
      const industryMatch = html.match(/industry["\s]*:?\s*["']([^"']+)["']/i);
      const descriptionMatch = html.match(/<meta[^>]*description[^>]*content=["']([^"']+)["']/i);
      const locationMatch = html.match(/location["\s]*:?\s*["']([^"']+)["']/i);
      
      return {
        name: companyName,
        industry: industryMatch ? industryMatch[1] : undefined,
        description: descriptionMatch ? descriptionMatch[1] : undefined,
        location: locationMatch ? locationMatch[1] : undefined,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error extracting company info:', error);
      return null;
    }
  }

  private extractCompanyInfoFromWebsite(html: string, companyName: string): CompanyInfo | null {
    try {
      const descriptionMatch = html.match(/<meta[^>]*description[^>]*content=["']([^"']+)["']/i);
      const titleMatch = html.match(/<title>([^<]+)<\/title>/i);
      
      return {
        name: companyName,
        description: descriptionMatch ? descriptionMatch[1] : (titleMatch ? titleMatch[1] : undefined),
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error extracting website info:', error);
      return null;
    }
  }

  private extractNewsData(html: string, query: string): ScrapedData[] {
    try {
      // Extract news headlines and snippets
      const headlines = html.match(/<h3[^>]*>([^<]+)<\/h3>/gi) || [];
      
      return headlines.slice(0, 5).map((headline, index) => ({
        title: headline.replace(/<[^>]*>/g, '').trim(),
        content: `Recent information about: ${query}`,
        timestamp: new Date().toISOString()
      }));
    } catch (error) {
      console.error('Error extracting news data:', error);
      return [];
    }
  }

  private extractKeyPointsFromHTML(html: string): string[] {
    try {
      // Extract meaningful content points from HTML
      const textContent = html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ');
      const sentences = textContent.match(/[^.!?]+[.!?]+/g) || [];
      
      return sentences
        .filter(sentence => sentence.length > 50 && sentence.length < 200)
        .slice(0, 5)
        .map(sentence => sentence.trim());
    } catch (error) {
      console.error('Error extracting key points:', error);
      return [];
    }
  }

  private extractBusinessInfoFromHTML(html: string): string {
    try {
      const textContent = html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ');
      // Look for numerical data or business-related information
      const businessInfo = textContent.match(/\$[\d,]+(?:\.\d+)?[BMK]?|\d+(?:,\d+)*\s+employees?|\d+(?:\.\d+)?%/gi);
      
      return businessInfo ? businessInfo.slice(0, 3).join(', ') : '';
    } catch (error) {
      console.error('Error extracting business info:', error);
      return '';
    }
  }
}

export const scraperService = new ScraperAPIService();
export { CompanyInfo, MarketData, ScrapedData };