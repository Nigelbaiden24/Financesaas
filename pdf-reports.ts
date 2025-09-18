import puppeteer from 'puppeteer';
import { promises as fs } from 'fs';
import path from 'path';
import type { 
  SelectClient, 
  SelectPortfolio, 
  SelectHolding,
  SelectComplianceTask 
} from '@shared/schema';

export interface ReportData {
  client: SelectClient;
  portfolio?: SelectPortfolio;
  holdings?: SelectHolding[];
  tasks?: SelectComplianceTask[];
  organizationName: string;
  advisorName: string;
  generatedBy: string;
  generatedAt: Date;
}

export class PDFReportService {
  private static browser: puppeteer.Browser | null = null;

  private static async getBrowser(): Promise<puppeteer.Browser> {
    if (!this.browser) {
      this.browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
      });
    }
    return this.browser;
  }

  static async generateSuitabilityReport(data: ReportData): Promise<Buffer> {
    const html = this.generateSuitabilityHTML(data);
    return await this.generatePDF(html, 'suitability-report');
  }

  static async generatePortfolioReport(data: ReportData): Promise<Buffer> {
    const html = this.generatePortfolioHTML(data);
    return await this.generatePDF(html, 'portfolio-report');
  }

  static async generateComplianceReport(data: ReportData): Promise<Buffer> {
    const html = this.generateComplianceHTML(data);
    return await this.generatePDF(html, 'compliance-report');
  }

  private static async generatePDF(html: string, reportType: string): Promise<Buffer> {
    const browser = await this.getBrowser();
    const page = await browser.newPage();

    try {
      await page.setContent(html, { waitUntil: 'networkidle0' });
      
      const pdf = await page.pdf({
        format: 'A4',
        margin: {
          top: '20mm',
          bottom: '20mm',
          left: '20mm',
          right: '20mm',
        },
        displayHeaderFooter: true,
        headerTemplate: `
          <div style="font-size: 10px; color: #666; width: 100%; text-align: center; padding: 10px 0;">
            <span style="float: left;">${new Date().toLocaleDateString()}</span>
            <span>Financial Advisory Report</span>
            <span style="float: right;">Confidential</span>
          </div>
        `,
        footerTemplate: `
          <div style="font-size: 10px; color: #666; width: 100%; text-align: center; padding: 10px 0;">
            <span>Page <span class="pageNumber"></span> of <span class="totalPages"></span></span>
          </div>
        `,
        printBackground: true,
      });

      return Buffer.from(pdf);
    } finally {
      await page.close();
    }
  }

  private static generateSuitabilityHTML(data: ReportData): string {
    const { client, portfolio, organizationName, advisorName, generatedBy, generatedAt } = data;
    
    // Calculate suitability score based on client data
    const suitabilityScore = this.calculateSuitabilityScore(client, portfolio);
    const riskAlignment = this.assessRiskAlignment(client, portfolio);
    const recommendations = this.generateSuitabilityRecommendations(client, portfolio, riskAlignment);

    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <title>Investment Suitability Assessment Report</title>
        <style>
            body {
                font-family: 'Arial', sans-serif;
                line-height: 1.6;
                color: #333;
                margin: 0;
                padding: 20px;
            }
            .header {
                text-align: center;
                border-bottom: 2px solid #2563eb;
                padding-bottom: 20px;
                margin-bottom: 30px;
            }
            .company-logo {
                font-size: 24px;
                font-weight: bold;
                color: #2563eb;
                margin-bottom: 10px;
            }
            .report-title {
                font-size: 20px;
                margin-bottom: 10px;
                color: #1e40af;
            }
            .client-info {
                background: #f8fafc;
                padding: 20px;
                border-radius: 8px;
                margin-bottom: 30px;
            }
            .section {
                margin-bottom: 30px;
                page-break-inside: avoid;
            }
            .section-title {
                font-size: 18px;
                font-weight: bold;
                color: #1e40af;
                border-bottom: 1px solid #e5e7eb;
                padding-bottom: 10px;
                margin-bottom: 15px;
            }
            .info-grid {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 20px;
            }
            .info-item {
                margin-bottom: 10px;
            }
            .info-label {
                font-weight: bold;
                color: #374151;
            }
            .info-value {
                color: #6b7280;
            }
            .score-card {
                background: linear-gradient(135deg, #3b82f6, #1d4ed8);
                color: white;
                padding: 25px;
                border-radius: 12px;
                text-align: center;
                margin: 20px 0;
            }
            .score-number {
                font-size: 48px;
                font-weight: bold;
                margin-bottom: 10px;
            }
            .score-label {
                font-size: 18px;
                opacity: 0.9;
            }
            .risk-assessment {
                display: grid;
                grid-template-columns: 1fr 1fr 1fr;
                gap: 20px;
                margin: 20px 0;
            }
            .risk-item {
                text-align: center;
                padding: 15px;
                background: #f1f5f9;
                border-radius: 8px;
            }
            .risk-level {
                font-size: 14px;
                font-weight: bold;
                margin-bottom: 5px;
            }
            .risk-value {
                font-size: 16px;
                font-weight: bold;
            }
            .conservative { color: #059669; }
            .moderate { color: #d97706; }
            .aggressive { color: #dc2626; }
            .recommendations {
                background: #fef3c7;
                border-left: 4px solid #f59e0b;
                padding: 20px;
                margin: 20px 0;
            }
            .recommendation-item {
                margin: 10px 0;
                padding-left: 20px;
                position: relative;
            }
            .recommendation-item::before {
                content: "•";
                color: #f59e0b;
                font-weight: bold;
                position: absolute;
                left: 0;
            }
            .allocation-chart {
                margin: 20px 0;
            }
            .allocation-bar {
                height: 30px;
                background: #e5e7eb;
                border-radius: 15px;
                overflow: hidden;
                margin: 10px 0;
                position: relative;
            }
            .allocation-segment {
                height: 100%;
                display: inline-block;
                line-height: 30px;
                text-align: center;
                color: white;
                font-weight: bold;
                font-size: 12px;
            }
            .equities { background: #3b82f6; }
            .bonds { background: #10b981; }
            .cash { background: #f59e0b; }
            .alternatives { background: #8b5cf6; }
            .footer {
                margin-top: 50px;
                padding-top: 20px;
                border-top: 1px solid #e5e7eb;
                font-size: 12px;
                color: #6b7280;
                text-align: center;
            }
            .disclaimer {
                background: #fef2f2;
                border: 1px solid #fecaca;
                padding: 15px;
                border-radius: 8px;
                margin: 20px 0;
                font-size: 12px;
                color: #991b1b;
            }
        </style>
    </head>
    <body>
        <div class="header">
            <div class="company-logo">${organizationName}</div>
            <div class="report-title">Investment Suitability Assessment Report</div>
            <div style="font-size: 14px; color: #6b7280;">
                Generated on ${generatedAt.toLocaleDateString()} by ${generatedBy}
            </div>
        </div>

        <div class="client-info">
            <div class="section-title">Client Information</div>
            <div class="info-grid">
                <div>
                    <div class="info-item">
                        <span class="info-label">Name:</span>
                        <span class="info-value">${client.firstName} ${client.lastName}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">Client Number:</span>
                        <span class="info-value">${client.clientNumber}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">Date of Birth:</span>
                        <span class="info-value">${new Date(client.dateOfBirth).toLocaleDateString()}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">Employment:</span>
                        <span class="info-value">${client.employmentStatus}</span>
                    </div>
                </div>
                <div>
                    <div class="info-item">
                        <span class="info-label">Risk Tolerance:</span>
                        <span class="info-value ${client.riskTolerance}">${client.riskTolerance.toUpperCase()}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">Annual Income:</span>
                        <span class="info-value">£${client.annualIncome?.toLocaleString()}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">Net Worth:</span>
                        <span class="info-value">£${client.netWorth?.toLocaleString()}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">Advisor:</span>
                        <span class="info-value">${advisorName}</span>
                    </div>
                </div>
            </div>
        </div>

        <div class="score-card">
            <div class="score-number">${suitabilityScore}%</div>
            <div class="score-label">Overall Suitability Score</div>
        </div>

        <div class="section">
            <div class="section-title">Risk Assessment</div>
            <div class="risk-assessment">
                <div class="risk-item">
                    <div class="risk-level conservative">Conservative</div>
                    <div class="risk-value conservative">${riskAlignment.conservative}%</div>
                </div>
                <div class="risk-item">
                    <div class="risk-level moderate">Moderate</div>
                    <div class="risk-value moderate">${riskAlignment.moderate}%</div>
                </div>
                <div class="risk-item">
                    <div class="risk-level aggressive">Aggressive</div>
                    <div class="risk-value aggressive">${riskAlignment.aggressive}%</div>
                </div>
            </div>
        </div>

        ${portfolio ? `
        <div class="section">
            <div class="section-title">Portfolio Allocation Analysis</div>
            <div class="allocation-chart">
                <div class="allocation-bar">
                    <div class="allocation-segment equities" style="width: ${portfolio.assetAllocation?.equities || 0}%">
                        ${portfolio.assetAllocation?.equities || 0}% Equities
                    </div>
                    <div class="allocation-segment bonds" style="width: ${portfolio.assetAllocation?.bonds || 0}%">
                        ${portfolio.assetAllocation?.bonds || 0}% Bonds
                    </div>
                    <div class="allocation-segment cash" style="width: ${portfolio.assetAllocation?.cash || 0}%">
                        ${portfolio.assetAllocation?.cash || 0}% Cash
                    </div>
                    <div class="allocation-segment alternatives" style="width: ${portfolio.assetAllocation?.alternatives || 0}%">
                        ${portfolio.assetAllocation?.alternatives || 0}% Alt
                    </div>
                </div>
            </div>
            <div class="info-item">
                <span class="info-label">Portfolio Value:</span>
                <span class="info-value">£${portfolio.totalValue?.toLocaleString()}</span>
            </div>
        </div>
        ` : ''}

        <div class="section">
            <div class="section-title">Suitability Recommendations</div>
            <div class="recommendations">
                ${recommendations.map(rec => `<div class="recommendation-item">${rec}</div>`).join('')}
            </div>
        </div>

        <div class="disclaimer">
            <strong>Important Disclaimer:</strong> This suitability assessment is based on the information provided and current market conditions. 
            Investment values can go down as well as up, and you may not get back the full amount invested. 
            Past performance is not a guide to future performance. Please ensure you understand the risks involved before making investment decisions.
        </div>

        <div class="footer">
            <div>Report generated by ${organizationName} on ${generatedAt.toLocaleDateString()}</div>
            <div>This document contains confidential and proprietary information</div>
        </div>
    </body>
    </html>
    `;
  }

  private static generatePortfolioHTML(data: ReportData): string {
    const { client, portfolio, holdings, organizationName, advisorName, generatedAt } = data;

    if (!portfolio) {
      throw new Error('Portfolio data required for portfolio report');
    }

    const performanceData = this.calculatePerformanceMetrics(portfolio, holdings);

    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <title>Portfolio Performance Report</title>
        <style>
            body {
                font-family: 'Arial', sans-serif;
                line-height: 1.6;
                color: #333;
                margin: 0;
                padding: 20px;
            }
            .header {
                text-align: center;
                border-bottom: 2px solid #2563eb;
                padding-bottom: 20px;
                margin-bottom: 30px;
            }
            .company-logo {
                font-size: 24px;
                font-weight: bold;
                color: #2563eb;
                margin-bottom: 10px;
            }
            .report-title {
                font-size: 20px;
                margin-bottom: 10px;
                color: #1e40af;
            }
            .section {
                margin-bottom: 30px;
                page-break-inside: avoid;
            }
            .section-title {
                font-size: 18px;
                font-weight: bold;
                color: #1e40af;
                border-bottom: 1px solid #e5e7eb;
                padding-bottom: 10px;
                margin-bottom: 15px;
            }
            .performance-grid {
                display: grid;
                grid-template-columns: repeat(3, 1fr);
                gap: 20px;
                margin: 20px 0;
            }
            .performance-card {
                background: linear-gradient(135deg, #f0f9ff, #e0f2fe);
                padding: 20px;
                border-radius: 12px;
                text-align: center;
                border: 1px solid #0ea5e9;
            }
            .performance-value {
                font-size: 24px;
                font-weight: bold;
                color: #0284c7;
                margin-bottom: 5px;
            }
            .performance-label {
                font-size: 14px;
                color: #64748b;
            }
            .positive { color: #059669; }
            .negative { color: #dc2626; }
            .holdings-table {
                width: 100%;
                border-collapse: collapse;
                margin: 20px 0;
            }
            .holdings-table th,
            .holdings-table td {
                padding: 12px;
                text-align: left;
                border-bottom: 1px solid #e5e7eb;
            }
            .holdings-table th {
                background: #f8fafc;
                font-weight: bold;
                color: #374151;
            }
            .holdings-table tr:hover {
                background: #f9fafb;
            }
            .allocation-chart {
                margin: 20px 0;
            }
            .allocation-bar {
                height: 40px;
                background: #e5e7eb;
                border-radius: 20px;
                overflow: hidden;
                margin: 15px 0;
                position: relative;
            }
            .allocation-segment {
                height: 100%;
                display: inline-block;
                line-height: 40px;
                text-align: center;
                color: white;
                font-weight: bold;
                font-size: 14px;
            }
            .equities { background: #3b82f6; }
            .bonds { background: #10b981; }
            .cash { background: #f59e0b; }
            .alternatives { background: #8b5cf6; }
            .footer {
                margin-top: 50px;
                padding-top: 20px;
                border-top: 1px solid #e5e7eb;
                font-size: 12px;
                color: #6b7280;
                text-align: center;
            }
        </style>
    </head>
    <body>
        <div class="header">
            <div class="company-logo">${organizationName}</div>
            <div class="report-title">Portfolio Performance Report</div>
            <div style="font-size: 14px; color: #6b7280;">
                ${client.firstName} ${client.lastName} - ${portfolio.name}
            </div>
            <div style="font-size: 14px; color: #6b7280;">
                Generated on ${generatedAt.toLocaleDateString()}
            </div>
        </div>

        <div class="section">
            <div class="section-title">Portfolio Overview</div>
            <div style="background: #f8fafc; padding: 20px; border-radius: 8px;">
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
                    <div>
                        <div><strong>Portfolio Name:</strong> ${portfolio.name}</div>
                        <div><strong>Account Type:</strong> ${portfolio.accountType}</div>
                        <div><strong>Provider:</strong> ${portfolio.provider}</div>
                    </div>
                    <div>
                        <div><strong>Total Value:</strong> £${portfolio.totalValue?.toLocaleString()}</div>
                        <div><strong>Currency:</strong> ${portfolio.currency}</div>
                        <div><strong>Last Updated:</strong> ${portfolio.updatedAt ? new Date(portfolio.updatedAt).toLocaleDateString() : 'N/A'}</div>
                    </div>
                </div>
            </div>
        </div>

        <div class="section">
            <div class="section-title">Performance Summary</div>
            <div class="performance-grid">
                <div class="performance-card">
                    <div class="performance-value ${performanceData.ytdReturn >= 0 ? 'positive' : 'negative'}">
                        ${performanceData.ytdReturn >= 0 ? '+' : ''}${performanceData.ytdReturn}%
                    </div>
                    <div class="performance-label">Year to Date</div>
                </div>
                <div class="performance-card">
                    <div class="performance-value ${performanceData.oneYearReturn >= 0 ? 'positive' : 'negative'}">
                        ${performanceData.oneYearReturn >= 0 ? '+' : ''}${performanceData.oneYearReturn}%
                    </div>
                    <div class="performance-label">1 Year Return</div>
                </div>
                <div class="performance-card">
                    <div class="performance-value ${performanceData.threeYearReturn >= 0 ? 'positive' : 'negative'}">
                        ${performanceData.threeYearReturn >= 0 ? '+' : ''}${performanceData.threeYearReturn}%
                    </div>
                    <div class="performance-label">3 Year Return</div>
                </div>
            </div>
        </div>

        <div class="section">
            <div class="section-title">Asset Allocation</div>
            <div class="allocation-chart">
                <div class="allocation-bar">
                    <div class="allocation-segment equities" style="width: ${portfolio.assetAllocation?.equities || 0}%">
                        ${portfolio.assetAllocation?.equities || 0}% Equities
                    </div>
                    <div class="allocation-segment bonds" style="width: ${portfolio.assetAllocation?.bonds || 0}%">
                        ${portfolio.assetAllocation?.bonds || 0}% Bonds
                    </div>
                    <div class="allocation-segment cash" style="width: ${portfolio.assetAllocation?.cash || 0}%">
                        ${portfolio.assetAllocation?.cash || 0}% Cash
                    </div>
                    <div class="allocation-segment alternatives" style="width: ${portfolio.assetAllocation?.alternatives || 0}%">
                        ${portfolio.assetAllocation?.alternatives || 0}% Alternatives
                    </div>
                </div>
            </div>
        </div>

        ${holdings && holdings.length > 0 ? `
        <div class="section">
            <div class="section-title">Holdings Breakdown</div>
            <table class="holdings-table">
                <thead>
                    <tr>
                        <th>Security</th>
                        <th>Quantity</th>
                        <th>Current Price</th>
                        <th>Market Value</th>
                        <th>Gain/Loss</th>
                        <th>Weight</th>
                    </tr>
                </thead>
                <tbody>
                    ${holdings.map(holding => `
                    <tr>
                        <td>
                            <div><strong>${holding.symbol}</strong></div>
                            <div style="font-size: 12px; color: #6b7280;">${holding.name}</div>
                        </td>
                        <td>${holding.quantity}</td>
                        <td>£${holding.currentPrice?.toFixed(2)}</td>
                        <td>£${holding.marketValue?.toLocaleString()}</td>
                        <td class="${(holding.unrealizedGainLoss || 0) >= 0 ? 'positive' : 'negative'}">
                            £${holding.unrealizedGainLoss?.toLocaleString()}
                        </td>
                        <td>${holding.weight?.toFixed(2)}%</td>
                    </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
        ` : ''}

        <div class="footer">
            <div>Report generated by ${organizationName} on ${generatedAt.toLocaleDateString()}</div>
            <div>This document contains confidential and proprietary information</div>
        </div>
    </body>
    </html>
    `;
  }

  private static generateComplianceHTML(data: ReportData): string {
    const { client, tasks, organizationName, advisorName, generatedAt } = data;
    
    const completedTasks = tasks?.filter(t => t.status === 'completed') || [];
    const pendingTasks = tasks?.filter(t => t.status === 'pending' || t.status === 'in_progress') || [];
    const complianceScore = tasks?.length ? Math.round((completedTasks.length / tasks.length) * 100) : 0;

    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <title>Compliance Status Report</title>
        <style>
            body { font-family: 'Arial', sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 20px; }
            .header { text-align: center; border-bottom: 2px solid #2563eb; padding-bottom: 20px; margin-bottom: 30px; }
            .company-logo { font-size: 24px; font-weight: bold; color: #2563eb; margin-bottom: 10px; }
            .report-title { font-size: 20px; margin-bottom: 10px; color: #1e40af; }
            .section { margin-bottom: 30px; }
            .section-title { font-size: 18px; font-weight: bold; color: #1e40af; border-bottom: 1px solid #e5e7eb; padding-bottom: 10px; margin-bottom: 15px; }
            .compliance-score { background: linear-gradient(135deg, #059669, #047857); color: white; padding: 25px; border-radius: 12px; text-align: center; margin: 20px 0; }
            .score-number { font-size: 48px; font-weight: bold; margin-bottom: 10px; }
            .tasks-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            .tasks-table th, .tasks-table td { padding: 12px; text-align: left; border-bottom: 1px solid #e5e7eb; }
            .tasks-table th { background: #f8fafc; font-weight: bold; color: #374151; }
            .status-badge { padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: bold; }
            .status-completed { background: #d1fae5; color: #065f46; }
            .status-pending { background: #fef3c7; color: #92400e; }
            .status-in-progress { background: #dbeafe; color: #1e40af; }
            .footer { margin-top: 50px; padding-top: 20px; border-top: 1px solid #e5e7eb; font-size: 12px; color: #6b7280; text-align: center; }
        </style>
    </head>
    <body>
        <div class="header">
            <div class="company-logo">${organizationName}</div>
            <div class="report-title">Compliance Status Report</div>
            <div style="font-size: 14px; color: #6b7280;">
                ${client.firstName} ${client.lastName} - Generated on ${generatedAt.toLocaleDateString()}
            </div>
        </div>

        <div class="compliance-score">
            <div class="score-number">${complianceScore}%</div>
            <div>Compliance Score</div>
            <div style="font-size: 14px; opacity: 0.9; margin-top: 10px;">
                ${completedTasks.length} of ${tasks?.length || 0} tasks completed
            </div>
        </div>

        ${tasks && tasks.length > 0 ? `
        <div class="section">
            <div class="section-title">Task Summary</div>
            <table class="tasks-table">
                <thead>
                    <tr>
                        <th>Task</th>
                        <th>Type</th>
                        <th>Priority</th>
                        <th>Status</th>
                        <th>Due Date</th>
                        <th>Completed</th>
                    </tr>
                </thead>
                <tbody>
                    ${tasks.map(task => `
                    <tr>
                        <td><strong>${task.title}</strong></td>
                        <td>${task.type}</td>
                        <td>${task.priority}</td>
                        <td><span class="status-badge status-${task.status}">${task.status.replace('_', ' ').toUpperCase()}</span></td>
                        <td>${task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'N/A'}</td>
                        <td>${task.completedAt ? new Date(task.completedAt).toLocaleDateString() : '-'}</td>
                    </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
        ` : ''}

        <div class="footer">
            <div>Report generated by ${organizationName} on ${generatedAt.toLocaleDateString()}</div>
            <div>This document contains confidential and proprietary information</div>
        </div>
    </body>
    </html>
    `;
  }

  private static calculateSuitabilityScore(client: SelectClient, portfolio?: SelectPortfolio): number {
    let score = 70; // Base score

    // Risk alignment scoring
    if (portfolio?.assetAllocation) {
      const { equities, bonds, cash, alternatives } = portfolio.assetAllocation;
      
      switch (client.riskTolerance) {
        case 'conservative':
          if ((bonds || 0) >= 40 && (equities || 0) <= 40) score += 15;
          if ((cash || 0) >= 10) score += 5;
          break;
        case 'moderate':
          if ((equities || 0) >= 40 && (equities || 0) <= 70) score += 15;
          if ((bonds || 0) >= 20) score += 5;
          break;
        case 'aggressive':
          if ((equities || 0) >= 60) score += 15;
          if ((alternatives || 0) >= 5) score += 5;
          break;
      }
    }

    // Age-based adjustments
    const age = new Date().getFullYear() - new Date(client.dateOfBirth).getFullYear();
    if (age < 35 && client.riskTolerance === 'aggressive') score += 5;
    if (age > 60 && client.riskTolerance === 'conservative') score += 5;

    // Income and net worth considerations
    if (client.netWorth && client.netWorth > 500000) score += 5;
    if (client.annualIncome && client.annualIncome > 100000) score += 5;

    return Math.min(100, Math.max(0, score));
  }

  private static assessRiskAlignment(client: SelectClient, portfolio?: SelectPortfolio): { conservative: number; moderate: number; aggressive: number } {
    if (!portfolio?.assetAllocation) {
      return { conservative: 33, moderate: 33, aggressive: 34 };
    }

    const { equities, bonds, cash, alternatives } = portfolio.assetAllocation;
    
    const conservative = (bonds || 0) + (cash || 0);
    const aggressive = (equities || 0) + (alternatives || 0);
    const moderate = 100 - conservative - aggressive;

    return { 
      conservative: Math.max(0, conservative), 
      moderate: Math.max(0, moderate), 
      aggressive: Math.max(0, aggressive) 
    };
  }

  private static generateSuitabilityRecommendations(client: SelectClient, portfolio?: SelectPortfolio, riskAlignment?: any): string[] {
    const recommendations = [];
    
    if (portfolio && riskAlignment) {
      const riskTolerance = client.riskTolerance;
      
      if (riskTolerance === 'conservative' && riskAlignment.aggressive > 50) {
        recommendations.push('Consider reducing equity exposure to better align with conservative risk tolerance');
      }
      
      if (riskTolerance === 'aggressive' && riskAlignment.conservative > 50) {
        recommendations.push('Portfolio may be too conservative for aggressive risk profile - consider increasing equity allocation');
      }
      
      if (portfolio.assetAllocation?.cash && portfolio.assetAllocation.cash > 20) {
        recommendations.push('High cash allocation may impact long-term returns - consider investing excess cash');
      }
    }

    // Age-based recommendations
    const age = new Date().getFullYear() - new Date(client.dateOfBirth).getFullYear();
    if (age < 30) {
      recommendations.push('Long investment horizon allows for higher growth allocation');
    } else if (age > 65) {
      recommendations.push('Consider increasing income-generating assets approaching retirement');
    }

    // Default recommendations
    if (recommendations.length === 0) {
      recommendations.push('Current portfolio allocation appears suitable for client risk profile');
      recommendations.push('Regular portfolio reviews recommended to ensure continued suitability');
    }

    recommendations.push('Diversification across asset classes helps manage portfolio risk');
    
    return recommendations;
  }

  private static calculatePerformanceMetrics(portfolio: SelectPortfolio, holdings?: SelectHolding[]): any {
    // Mock performance calculation - in real implementation would use actual market data
    const basePerformance = {
      ytdReturn: Math.random() * 20 - 5, // -5% to 15%
      oneYearReturn: Math.random() * 25 - 8, // -8% to 17%
      threeYearReturn: Math.random() * 15 + 2, // 2% to 17%
    };

    return {
      ytdReturn: Number(basePerformance.ytdReturn.toFixed(2)),
      oneYearReturn: Number(basePerformance.oneYearReturn.toFixed(2)),
      threeYearReturn: Number(basePerformance.threeYearReturn.toFixed(2)),
    };
  }

  static async cleanup(): Promise<void> {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }
}

// Cleanup on process exit
process.on('SIGTERM', () => PDFReportService.cleanup());
process.on('SIGINT', () => PDFReportService.cleanup());