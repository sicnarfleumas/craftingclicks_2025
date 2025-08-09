import { useState, useEffect, useRef } from 'react';
import styles from './TechnicalSEOAudit.module.css';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, PointElement, LineElement, Filler, RadialLinearScale } from 'chart.js';
import { Radar } from 'react-chartjs-2';
import { FiCheckCircle, FiAlertTriangle, FiXCircle, FiInfo, FiLock, FiSmartphone, FiSearch, FiActivity, FiLoader } from 'react-icons/fi';
import LoadingOverlay from '../../../../components/Tools/LoadingOverlay';
import ToolHeader from '../../../../components/Tools/ToolHeader';
import type { Step } from '../../../../components/Tools/LoadingOverlay';

// Register Chart.js components
ChartJS.register(
  ArcElement, 
  Tooltip, 
  Legend, 
  CategoryScale, 
  LinearScale, 
  BarElement,
  PointElement,
  LineElement,
  Filler,
  RadialLinearScale
);

interface AuditResult {
  performance?: {
    score: number;
    lcp: number;
    cls: number;
    fid: number;
    ttfb?: number;
    speedIndex?: number;
    recommendations: string[];
    detailedRecommendations?: Array<{
      title: string;
      description: string;
      impact: number;
      score: number;
      url: string | null;
    }>;
    diagnostics?: Array<{
      title: string;
      description: string;
    }>;
    passedAudits?: string[];
    metrics?: {
      firstContentfulPaint: number;
      interactive: number;
      totalBlockingTime: number;
      cumulativeLayoutShift: number;
      largestContentfulPaint: number;
    };
  };
  mobileFriendly?: {
    isMobileFriendly: boolean | null;
    issues: string[];
    detailedIssues?: Array<{
      rule: string;
      description: string;
      recommendation: string;
    }>;
    recommendations?: string[];
    screenshot?: string | null;
    testDateTime?: string;
    tableData?: {
      headers: string[];
      rows: Array<{
        type: string;
        information: string;
        mobile: boolean;
      }>;
    };
    checkResults?: Array<{
      type: string;
      name: string;
      description: string;
      information: string;
      passed: boolean;
    }>;
    justification?: string;
    disclaimer?: string;
    educationalContent?: {
      title: string;
      paragraphs: string[];
    };
  };
  crawlability?: {
    robotsTxtExists: boolean;
    disallowRules: string[];
    allowRules?: string[];
    sitemapExists: boolean;
    sitemapUrls?: string[];
    urlCount?: number;
    hasCanonical?: boolean;
    canonicalUrl?: string;
    userAgents?: string[];
    recommendations?: string[];
    crawlabilityScore?: number;
  };
  security?: {
    isSafe: boolean;
    threats: string[];
    hasHttps?: boolean;
    hasValidCert?: boolean;
    hasMixedContent?: boolean;
    hasSecurityHeaders?: {
      contentSecurityPolicy: boolean;
      strictTransportSecurity: boolean;
      xContentTypeOptions: boolean;
      xFrameOptions: boolean;
      referrerPolicy: boolean;
      permissionsPolicy: boolean;
    };
    securityScore?: number;
    recommendations?: string[];
  };
  timestamp?: number;
  url?: string;
}

export default function TechnicalSEOAudit() {
  const [url, setUrl] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AuditResult | null>(null);
  const [activeTab, setActiveTab] = useState('performance');
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);
  const [urlValid, setUrlValid] = useState<boolean | null>(null);
  
  const steps: Step[] = [
    { name: 'Preparing Request', description: 'Setting up the SEO audit' },
    { name: 'Analyzing Performance', description: 'Checking page speed and performance metrics' },
    { name: 'Testing Mobile Friendliness', description: 'Verifying how well your site works on mobile devices' },
    { name: 'Checking Crawlability', description: 'Examining robots.txt and sitemap configuration' },
    { name: 'Verifying Security', description: 'Inspecting HTTPS implementation and security headers' },
    { name: 'Generating Report', description: 'Compiling the comprehensive SEO analysis' }
  ];

  const validateUrl = (input: string) => {
    let formattedUrl = input.trim();
    
    // Automatically add https:// if no protocol is specified
    if (!formattedUrl.startsWith('http://') && !formattedUrl.startsWith('https://')) {
      formattedUrl = 'https://' + formattedUrl;
    }
    
    try {
      const url = new URL(formattedUrl);
      setUrl(formattedUrl);
      setUrlValid(true);
      return formattedUrl;
    } catch {
      setUrlValid(false);
      return false;
    }
  };

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newUrl = e.target.value;
    setUrl(newUrl);
    
    if (newUrl.length > 3) {
      // Don't do a full validation on every keystroke, just check if it looks like a valid domain
      const basicCheck = /^[a-zA-Z0-9]([a-zA-Z0-9\-\.]+\.)+[a-zA-Z]{2,}/.test(newUrl) || 
                        /^https?:\/\//.test(newUrl);
      setUrlValid(basicCheck ? true : null);
    } else {
      setUrlValid(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      if (!url) {
        throw new Error('Please enter a URL');
      }

      const formattedUrl = validateUrl(url);
      if (!formattedUrl) {
        throw new Error('Please enter a valid URL');
      }

      setCurrentStep(1);
      setProgress(20);

      // Step 2: Analyzing Performance
      setCurrentStep(1);
      setProgress(30);

      console.log(`Making API request to /api/technical-seo-audit for URL: ${formattedUrl}`);
      
      const response = await fetch('/api/technical-seo-audit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url: formattedUrl
        }),
      });
      
      if (!response.ok) {
        let errorMessage = 'Failed to run SEO audit';
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } catch (e) {
          // If parsing JSON fails, use status text
          errorMessage = `${errorMessage} (${response.status}: ${response.statusText})`;
        }
        console.error(`API Error: ${errorMessage}`);
        throw new Error(errorMessage);
      }

      // Step 3-5: Testing Mobile, Crawlability, Verifying Security
      setCurrentStep(2);
      setProgress(50);
      
      setCurrentStep(3);
      setProgress(70);
      
      setCurrentStep(4);
      setProgress(80);
      
      try {
        const data = await response.json();
        console.log('API Response Data:', data);
        
        // Validate the data structure
        if (!data || typeof data !== 'object') {
          throw new Error('Invalid response format from API');
        }
        
        // Step 6: Generating Report
        setCurrentStep(5);
        setProgress(90);
        
        setResult(data);
        setProgress(100);
      } catch (parseError) {
        console.error('Error parsing API response:', parseError);
        throw new Error('Failed to parse the audit results. Please try again.');
      }
    } catch (error) {
      console.error('Technical SEO Audit Error:', error);
      setError(error instanceof Error ? error.message : 'An unexpected error occurred');
    } finally {
      setLoading(false);
      setProgress(0);
      setCurrentStep(0);
    }
  };

  // Updated score color functions to use theme colors
  const getScoreColor = (score: number) => {
    if (score >= 90) return styles.scoreExcellent;
    if (score >= 70) return styles.scoreGood;
    if (score >= 50) return styles.scoreMedium;
    return styles.scorePoor;
  };

  const getScoreColorCode = (score: number) => {
    if (score >= 90) return 'var(--color-success)'; // Use theme success color
    if (score >= 70) return 'var(--color-warning)'; // Use theme warning color instead of orange
    if (score >= 50) return 'var(--color-info)'; // Use theme info color instead of accent
    return 'var(--color-error)';  // Use theme error color
  };

  // Add a helper function to create a more descriptive score label
  const getScoreLabel = (score: number) => {
    if (score >= 90) return 'Excellent';
    if (score >= 70) return 'Good';
    if (score >= 50) return 'Needs Improvement';
    return 'Poor';
  };

  // Add a function to handle and normalize failed checks more gracefully
  const normalizeMetricValue = (value: number | undefined, type: 'lcp' | 'cls' | 'fid' | 'ttfb' | 'other') => {
    if (value === undefined || value === null || isNaN(Number(value))) {
      return { 
        value: 'N/A', 
        score: 0, 
        label: 'Not Available',
        className: styles.neutral
      };
    }
    
    let score = 0;
    let label = '';
    let className = '';
    let displayValue = '';
    
    switch(type) {
      case 'lcp':
        score = value < 2.5 ? 100 : value < 4 ? 50 : 0;
        label = value < 2.5 ? 'Good' : value < 4 ? 'Needs Improvement' : 'Poor';
        className = value < 2.5 ? styles.success : value < 4 ? styles.warning : styles.error;
        displayValue = `${value.toFixed(2)}s`;
        break;
      case 'cls':
        score = value < 0.1 ? 100 : value < 0.25 ? 50 : 0;
        label = value < 0.1 ? 'Good' : value < 0.25 ? 'Needs Improvement' : 'Poor';
        className = value < 0.1 ? styles.success : value < 0.25 ? styles.warning : styles.error;
        displayValue = value.toFixed(3);
        break;
      case 'fid':
        score = value < 100 ? 100 : value < 300 ? 50 : 0;
        label = value < 100 ? 'Good' : value < 300 ? 'Needs Improvement' : 'Poor';
        className = value < 100 ? styles.success : value < 300 ? styles.warning : styles.error;
        displayValue = `${value}ms`;
        break;
      case 'ttfb':
        score = value < 0.6 ? 100 : value < 1 ? 50 : 0;
        label = value < 0.6 ? 'Good' : value < 1 ? 'Needs Improvement' : 'Poor';
        className = value < 0.6 ? styles.success : value < 1 ? styles.warning : styles.error;
        displayValue = `${value.toFixed(2)}s`;
        break;
      default:
        score = 0;
        label = 'Unknown';
        className = styles.neutral;
        displayValue = `${value}`;
    }
    
    return { value: displayValue, score, label, className };
  };

  // Generate improved bar chart data for Core Web Vitals with clearer labels and better failure handling
  const generateCoreWebVitalsData = () => {
    if (!result?.performance) return null;
    
    const { lcp, cls, fid } = result.performance;
    
    const lcpMetric = normalizeMetricValue(lcp, 'lcp');
    const clsMetric = normalizeMetricValue(cls, 'cls');
    const fidMetric = normalizeMetricValue(fid, 'fid');
    
    return {
      labels: ['LCP (Load)', 'CLS (Stability)', 'FID (Interactivity)'],
      datasets: [
        {
          label: 'Score',
          data: [lcpMetric.score, clsMetric.score, fidMetric.score],
          backgroundColor: [
            lcpMetric.score === 100 ? 'var(--color-success)' : 
            lcpMetric.score === 50 ? 'var(--color-info)' : 
            lcpMetric.score === 0 ? 'var(--color-error)' : 
            'rgba(148, 163, 184, 0.85)',
            
            clsMetric.score === 100 ? 'var(--color-success)' : 
            clsMetric.score === 50 ? 'var(--color-info)' : 
            clsMetric.score === 0 ? 'var(--color-error)' : 
            'rgba(148, 163, 184, 0.85)',
            
            fidMetric.score === 100 ? 'var(--color-success)' : 
            fidMetric.score === 50 ? 'var(--color-info)' : 
            fidMetric.score === 0 ? 'var(--color-error)' : 
            'rgba(148, 163, 184, 0.85)'
          ],
          borderRadius: 6,
          borderWidth: 0,
          hoverBackgroundColor: [
            lcpMetric.score === 100 ? 'var(--color-success)' : 
            lcpMetric.score === 50 ? 'var(--color-info)' : 
            lcpMetric.score === 0 ? 'var(--color-error)' : 
            'rgba(148, 163, 184, 1)',
            
            clsMetric.score === 100 ? 'var(--color-success)' : 
            clsMetric.score === 50 ? 'var(--color-info)' : 
            clsMetric.score === 0 ? 'var(--color-error)' : 
            'rgba(148, 163, 184, 1)',
            
            fidMetric.score === 100 ? 'var(--color-success)' : 
            fidMetric.score === 50 ? 'var(--color-info)' : 
            fidMetric.score === 0 ? 'var(--color-error)' : 
            'rgba(148, 163, 184, 1)'
          ],
        },
      ],
    };
  };

  const getStatusColor = (status: boolean) => {
    return status ? 'var(--color-success)' : 'var(--color-error)';
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
  };

  // Helper function to get descriptions for security headers
  const getSecurityHeaderDescription = (header: string): string => {
    switch (header) {
      case 'contentSecurityPolicy':
        return 'Helps prevent Cross-Site Scripting (XSS) and data injection attacks';
      case 'strictTransportSecurity':
        return 'Forces browsers to use HTTPS for future requests';
      case 'xContentTypeOptions':
        return 'Prevents browsers from MIME-sniffing a response from its declared content-type';
      case 'xFrameOptions':
        return 'Protects against clickjacking by preventing your site from being embedded in iframes';
      case 'referrerPolicy':
        return 'Controls how much referrer information is included with requests';
      case 'permissionsPolicy':
        return 'Allows you to control which browser features can be used on your website';
      default:
        return 'Security header that helps protect your website';
    }
  };

  // Generate doughnut chart data for performance scores with improved appearance
  const generatePerformanceChartData = () => {
    if (!result?.performance) return null;
    
    return {
      labels: ['Score', 'Remaining'],
      datasets: [
        {
          data: [result.performance.score, 100 - result.performance.score],
          backgroundColor: [
            getScoreColorCode(result.performance.score),
            'rgba(243, 244, 246, 0.8)',
          ],
          borderWidth: 0,
          borderRadius: 4,
          hoverOffset: 5,
        },
      ],
    };
  };

  // Update the radar chart component with error handling
  const generateSecurityRadarChart = () => {
    if (!result?.security?.hasSecurityHeaders) {
      console.log('Security headers data not available for chart');
      return null;
    }
    
    try {
      const headers = result.security.hasSecurityHeaders;
      const headerLabels: Record<string, string> = {
        contentSecurityPolicy: 'CSP',
        strictTransportSecurity: 'HSTS',
        xContentTypeOptions: 'X-Content-Type',
        xFrameOptions: 'X-Frame-Options',
        referrerPolicy: 'Referrer Policy',
        permissionsPolicy: 'Permissions'
      };
      
      const securityScores = Object.entries(headers).map(([key, value]) => value ? 100 : 0);
      const labels = Object.entries(headers).map(([key]) => headerLabels[key as keyof typeof headerLabels] || key);
      
      return {
        labels,
        datasets: [
          {
            label: 'Security Headers',
            data: securityScores,
            backgroundColor: 'var(--color-warning-bg)',
            borderColor: 'var(--color-warning)',
            borderWidth: 2,
            pointBackgroundColor: securityScores.map(score => 
              score === 100 ? 'var(--color-success)' : 'var(--color-error)'
            ),
            pointBorderColor: 'var(--white)',
            pointHoverBackgroundColor: 'var(--white)',
            pointHoverBorderColor: 'var(--color-warning)',
            pointRadius: 5,
            pointHoverRadius: 7,
            fill: true,
          }
        ]
      };
    } catch (err) {
      console.error('Error generating security radar chart:', err);
      return null;
    }
  };

  // New options for radar chart
  const radarChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      r: {
        min: 0,
        max: 100,
        beginAtZero: true,
        ticks: {
          stepSize: 25,
          display: false,
        },
        pointLabels: {
          font: {
            size: 12,
            weight: 'bold' as const
          }
        }
      }
    },
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        titleColor: 'var(--dark-text)',
        bodyColor: 'var(--body-text)',
        borderColor: '#e5e7eb',
        borderWidth: 1,
        padding: 12,
        cornerRadius: 8,
        callbacks: {
          label: function(context: any) {
            return context.raw === 100 ? 'Implemented ✓' : 'Missing ✗';
          },
          title: function(tooltipItems: any[]) {
            const fullHeaderNames: Record<string, string> = {
              'CSP': 'Content Security Policy',
              'HSTS': 'HTTP Strict Transport Security',
              'X-Content-Type': 'X-Content-Type-Options',
              'X-Frame-Options': 'X-Frame-Options',
              'Referrer Policy': 'Referrer Policy',
              'Permissions': 'Permissions Policy'
            };
            
            const shortLabel = tooltipItems[0].label;
            return fullHeaderNames[shortLabel] || shortLabel;
          }
        }
      }
    }
  };

  // Improve chart options with better tooltips and aesthetics 
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '70%',
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        titleColor: 'var(--dark-text)',
        bodyColor: 'var(--body-text)',
        borderColor: '#e5e7eb',
        borderWidth: 1,
        padding: 12,
        boxPadding: 6,
        cornerRadius: 8,
        displayColors: true,
        boxWidth: 12,
        boxHeight: 12,
        usePointStyle: true,
        titleFont: {
          weight: 'bold' as const,
          size: 14
        },
        bodyFont: {
          size: 13
        },
        callbacks: {
          label: function(context: any) {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            let value = context.parsed;
            if (value !== undefined) {
              label += value + (label.includes('Score') ? '/100' : '');
            }
            return label;
          }
        }
      }
    }
  };

  // Improved bar chart options
  const barChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    indexAxis: 'y' as const,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        titleColor: 'var(--dark-text)',
        bodyColor: 'var(--body-text)',
        borderColor: '#e5e7eb',
        borderWidth: 1,
        padding: 12,
        cornerRadius: 8,
        displayColors: true,
        callbacks: {
          title: function(tooltipItems: any[]) {
            return tooltipItems[0].label;
          },
          label: function(context: any) {
            const metrics: Record<string, {unit: string, good: string, needsImprovement: string, poor: string}> = {
              'LCP (Load)': {
                unit: 's',
                good: '< 2.5s',
                needsImprovement: '< 4s',
                poor: '> 4s'
              },
              'CLS (Stability)': {
                unit: '',
                good: '< 0.1',
                needsImprovement: '< 0.25',
                poor: '> 0.25'
              },
              'FID (Interactivity)': {
                unit: 'ms',
                good: '< 100ms',
                needsImprovement: '< 300ms',
                poor: '> 300ms'
              }
            };
            
            const metricInfo = metrics[context.label];
            if (!metricInfo) return context.formattedValue;
            
            let scoreLabel = '';
            if (context.raw === 100) scoreLabel = 'Good';
            else if (context.raw === 50) scoreLabel = 'Needs Improvement';
            else if (context.raw === 0) scoreLabel = 'Poor';
            
            let thresholds = '';
            if (metricInfo) {
              thresholds = `\nThresholds: ${metricInfo.good} (Good), ${metricInfo.needsImprovement} (Needs Improvement)`;
            }
            
            return [`Score: ${context.raw}/100 (${scoreLabel})`, thresholds];
          }
        }
      }
    },
    scales: {
      x: {
        beginAtZero: true,
        max: 100,
        ticks: {
          stepSize: 25,
          callback: function(value: number) {
            if (value === 0) return 'Poor';
            if (value === 50) return 'Avg.';
            if (value === 100) return 'Good';
            return '';
          }
        },
        grid: {
          display: true,
          color: 'rgba(0, 0, 0, 0.05)',
        }
      },
      y: {
        grid: {
          display: false
        }
      }
    }
  };

  // Generate doughnut chart for crawlability
  const generateCrawlabilityChart = () => {
    if (!result?.crawlability) return null;
    
    const hasRobotsTxt = result.crawlability.robotsTxtExists ? 1 : 0;
    const hasSitemap = result.crawlability.sitemapExists ? 1 : 0;
    const hasCanonical = result.crawlability.hasCanonical ? 1 : 0;
    
    const score = Math.round(((hasRobotsTxt + hasSitemap + (hasCanonical ? 1 : 0)) / 3) * 100);
    
    return {
      labels: ['Score', 'Remaining'],
      datasets: [
        {
          data: [score, 100 - score],
          backgroundColor: [
            getScoreColorCode(score),
            'rgba(243, 244, 246, 0.8)',
          ],
          borderWidth: 0,
          borderRadius: 4,
          hoverOffset: 5,
        },
      ],
    };
  };

  // Add a useEffect hook to debug API responses
  useEffect(() => {
    if (result) {
      console.log('SEO Audit Result:', result);
      
      // Check for missing data sections
      if (!result.performance) {
        console.warn('Performance data is missing');
      }
      if (!result.security) {
        console.warn('Security data is missing');
      }
      if (!result.mobileFriendly) {
        console.warn('Mobile friendly data is missing');
      }
      if (!result.crawlability) {
        console.warn('Crawlability data is missing');
      }
    }
  }, [result]);

  return (
    <div className={styles.container}>
      <ToolHeader 
        title="Free Technical SEO Audit"
        description="Check your website's technical SEO health with in-depth analysis of performance, mobile-friendliness, crawlability, and security."
      />

      <div className={styles.inputSection}>
        <div className={styles.inputWrapper}>
          <FiSearch className={styles.searchIcon} />
          <input
            type="text"
            className={`${styles.urlInput} ${
              urlValid === true ? styles.validInput : 
              urlValid === false ? styles.invalidInput : ''
            }`}
            placeholder="Enter your website URL (e.g., https://example.com)"
            value={url}
            onChange={handleUrlChange}
            aria-label="Website URL"
          />
        </div>
        <button
          onClick={handleSubmit}
          disabled={loading}
          className={styles.submitButton}
        >
          Run Technical SEO Audit
        </button>
      </div>

      {error && (
        <div className={styles.error}>
          <FiAlertTriangle />
          <span>{error}</span>
        </div>
      )}

      <LoadingOverlay 
        isVisible={loading} 
        title="Running SEO Audit"
        steps={steps}
        currentStep={currentStep}
        progress={progress}
      />

      {result && (
        <div className={styles.results}>
          <div className={styles.summaryDashboard}>
            <div className={styles.dashboardHeader}>
              <h2>Technical SEO Audit Results</h2>
              {result.timestamp && (
                <p className={styles.auditTimestamp}>Analysis completed on {formatDate(result.timestamp)}</p>
              )}
            </div>
            
            <div className={styles.dashboardUrl}>
              <span className={styles.urlLabel}>Audited URL:</span> {result.url}
            </div>
            
            <div className={styles.overallScore}>
              <div className={styles.overallScoreHeader}>
                <h3>Overall Performance</h3>
                <p className={styles.overallDescription}>
                  This score represents the combined results of performance, mobile-friendliness, 
                  crawlability, and security checks for your website.
                </p>
              </div>
              
              <div className={styles.scoreIndicator}>
                {(() => {
                  // Calculate an overall score based on available metrics
                  let totalScore = 0;
                  let scoreCount = 0;
                  
                  if (result.performance && !isNaN(result.performance.score)) {
                    totalScore += result.performance.score;
                    scoreCount++;
                  }
                  
                  if (result.security && result.security.securityScore !== undefined) {
                    totalScore += result.security.securityScore;
                    scoreCount++;
                  }
                  
                  if (result.crawlability && result.crawlability.crawlabilityScore !== undefined) {
                    totalScore += result.crawlability.crawlabilityScore;
                    scoreCount++;
                  }
                  
                  // Mobile friendliness (simplified scoring)
                  if (result.mobileFriendly && result.mobileFriendly.isMobileFriendly !== null) {
                    totalScore += result.mobileFriendly.isMobileFriendly ? 100 : 30;
                    scoreCount++;
                  }
                  
                  const overallScore = scoreCount > 0 ? Math.round(totalScore / scoreCount) : 0;
                  
                  return (
                    <div 
                      className={`${styles.scoreCircleLarge} ${getScoreColor(overallScore)}`}
                    >
                      {overallScore}
                    </div>
                  );
                })()}
                <div className={styles.scoreLabel}>{(() => {
                  // Calculate overall score label based on all metrics
                  let totalScore = 0;
                  let scoreCount = 0;
                  
                  if (result.performance && !isNaN(result.performance.score)) {
                    totalScore += result.performance.score;
                    scoreCount++;
                  }
                  
                  if (result.security && result.security.securityScore !== undefined) {
                    totalScore += result.security.securityScore;
                    scoreCount++;
                  }
                  
                  if (result.crawlability && result.crawlability.crawlabilityScore !== undefined) {
                    totalScore += result.crawlability.crawlabilityScore;
                    scoreCount++;
                  }
                  
                  // Mobile friendliness (simplified scoring)
                  if (result.mobileFriendly && result.mobileFriendly.isMobileFriendly !== null) {
                    totalScore += result.mobileFriendly.isMobileFriendly ? 100 : 30;
                    scoreCount++;
                  }
                  
                  const overallScore = scoreCount > 0 ? Math.round(totalScore / scoreCount) : 0;
                  return getScoreLabel(overallScore);
                })()}</div>
              </div>
            </div>
          </div>
          
          <div className={styles.dashboardGrid}>
            {/* Performance Card */}
            {result.performance && (
              <div 
                className={`${styles.dashboardItem} ${styles.performance} ${
                  getScoreColor(result.performance.score)
                }`}
                onClick={() => setActiveTab('performance')}
              >
                <h3>
                  <FiActivity />
                  Performance
                </h3>
                <div className={styles.itemContent}>
                  {result.performance?.score !== undefined ? (
                    <>
                      <div className={styles.metricScoreValue}>{result.performance.score}</div>
                      <div className={styles.metricScoreLabel}>{getScoreLabel(result.performance.score)}</div>
                    </>
                  ) : 'N/A'}
                </div>
                <div className={styles.metricsPreview}>
                  <>
                    <div className={styles.previewMetric}>LCP: {normalizeMetricValue(result.performance.lcp, 'lcp').value}</div>
                    <div className={styles.previewMetric}>CLS: {normalizeMetricValue(result.performance.cls, 'cls').value}</div>
                  </>
                </div>
              </div>
            )}
            
            {/* Mobile Friendly Card */}
            {result.mobileFriendly && (
              <div 
                className={`${styles.dashboardItem} ${styles.mobileFriendly} ${
                  result.mobileFriendly?.isMobileFriendly === true ? styles.goodItem : 
                  result.mobileFriendly?.isMobileFriendly === false ? styles.poorItem : 
                  styles.warningItem
                }`}
                onClick={() => setActiveTab('mobileFriendly')}
              >
                <h3>
                  <FiSmartphone />
                  Mobile Friendly
                </h3>
                <div className={styles.itemContent}>
                  {result.mobileFriendly?.isMobileFriendly !== null ? (
                    result.mobileFriendly?.isMobileFriendly ? 
                    <><FiCheckCircle /> <span className={styles.statusText}>Good</span></> : 
                    <><FiXCircle /> <span className={styles.statusText}>Not Mobile Friendly</span></>
                  ) : 'N/A'}
                </div>
                <div className={styles.metricsPreview}>
                  {result.mobileFriendly?.issues?.length ? (
                    <div className={styles.issuesCount}>{result.mobileFriendly.issues.length} issue{result.mobileFriendly.issues.length !== 1 ? 's' : ''} found</div>
                  ) : (
                    <div className={styles.allPassed}>No issues detected</div>
                  )}
                </div>
              </div>
            )}
            
            {/* Security Card */}
            {result.security && (
              <div 
                className={`${styles.dashboardItem} ${styles.security} ${
                  result.security?.isSafe ? styles.goodItem : styles.poorItem
                }`}
                onClick={() => setActiveTab('security')}
              >
                <h3>
                  <FiLock />
                  Security
                </h3>
                <div className={styles.itemContent}>
                  {result.security ? (
                    result.security.isSafe ? 
                    <><FiCheckCircle /> <span className={styles.statusText}>Secure</span></> : 
                    <><FiAlertTriangle /> <span className={styles.statusText}>Issues Found</span></>
                  ) : 'N/A'}
                </div>
                <div className={styles.metricsPreview}>
                  {result.security?.threats?.length ? (
                    <div className={styles.issuesCount}>{result.security.threats.length} threat{result.security.threats.length !== 1 ? 's' : ''} detected</div>
                  ) : (
                    <div className={styles.allPassed}>HTTPS enabled</div>
                  )}
                </div>
              </div>
            )}
            
            {/* Crawlability Card */}
            {result.crawlability && (
              <div 
                className={`${styles.dashboardItem} ${styles.crawlability} ${
                  result.crawlability.robotsTxtExists && result.crawlability.sitemapExists ? styles.goodItem : 
                  (result.crawlability.robotsTxtExists || result.crawlability.sitemapExists) ? styles.warningItem : 
                  styles.poorItem
                }`}
                onClick={() => setActiveTab('crawlability')}
              >
                <h3>
                  <FiSearch />
                  Crawlability
                </h3>
                <div className={styles.itemContent}>
                  {result.crawlability ? (
                    result.crawlability.robotsTxtExists && result.crawlability.sitemapExists ? 
                    <><FiCheckCircle /> <span className={styles.statusText}>Good</span></> : 
                    <><FiAlertTriangle /> <span className={styles.statusText}>Partial</span></>
                  ) : 'N/A'}
                </div>
                <div className={styles.metricsPreview}>
                  {result.crawlability && (
                    <>
                      <div className={styles.previewMetric}>
                        Robots.txt: {result.crawlability.robotsTxtExists ? 'Found' : 'Missing'}
                      </div>
                      <div className={styles.previewMetric}>
                        Sitemap: {result.crawlability.sitemapExists ? 'Found' : 'Missing'}
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
          
          {/* Mobile Friendly Section */}
          {activeTab === 'mobileFriendly' && result.mobileFriendly && (
            <div className={styles.detailSection}>
              <div className={styles.sectionHeader}>
                <h2>
                  <FiSmartphone />
                  Mobile-Friendly
                </h2>
                <div className={styles.sectionScore}>
                  <div className={`${styles.scoreCircle} ${
                    result.mobileFriendly.isMobileFriendly === true ? styles.scoreExcellent : 
                    result.mobileFriendly.isMobileFriendly === false ? styles.scorePoor : 
                    styles.scoreMedium
                  }`}>
                    {result.mobileFriendly.isMobileFriendly === true ? 100 : 
                     result.mobileFriendly.isMobileFriendly === false ? 0 : 50}
                  </div>
                </div>
              </div>
              
              <div className={styles.chartsGrid}>
                {result.mobileFriendly.screenshot && (
                  <div className={styles.chartContainer}>
                    <h3>Mobile Preview</h3>
                    <img 
                      src={result.mobileFriendly.screenshot} 
                      alt="Mobile preview" 
                      style={{ maxWidth: '100%', maxHeight: '400px', borderRadius: '0.5rem', border: '1px solid #e5e7eb' }}
                    />
                  </div>
                )}
                
                <div className={styles.metricsGrid} style={{ margin: 0 }}>
                  {result.mobileFriendly.tableData?.rows.slice(0, 3).map((row, index) => (
                    <div key={index} className={styles.metricCard}>
                      <div className={styles.metricHeader}>
                        <span className={styles.metricName}>{row.type}</span>
                        <span className={`${styles.metricValue} ${row.mobile ? styles.success : styles.error}`}>
                          {row.mobile ? 'Passed' : 'Failed'}
                        </span>
                      </div>
                      <p className={styles.metricDescription}>
                        {row.information}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Display justification and disclaimer */}
              {result.mobileFriendly.justification && (
                <div className={styles.infoBox}>
                  <h3>Assessment</h3>
                  <p>{result.mobileFriendly.justification}</p>
                  
                  {result.mobileFriendly.disclaimer && (
                    <div className={styles.disclaimer}>
                      <FiInfo />
                      <p>{result.mobileFriendly.disclaimer}</p>
                    </div>
                  )}
                </div>
              )}
              
              {result.mobileFriendly.detailedIssues && result.mobileFriendly.detailedIssues.length > 0 && (
                <div className={styles.infoBox}>
                  <h3>Mobile-Friendly Issues</h3>
                  <ul className={styles.recommendationsList}>
                    {result.mobileFriendly.detailedIssues.map((issue, index) => (
                      <li key={index} className={styles.recommendationItem}>
                        <FiAlertTriangle className={styles.recommendationIcon} />
                        <div>
                          <strong>{issue.rule}</strong>
                          <p>{issue.description}</p>
                          <p><em>Recommendation: {issue.recommendation}</em></p>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
              <div className={styles.infoBox}>
                <h3>{result.mobileFriendly.educationalContent?.title || "Why Mobile-Friendliness Matters"}</h3>
                {result.mobileFriendly.educationalContent?.paragraphs ? (
                  result.mobileFriendly.educationalContent.paragraphs.map((paragraph, index) => (
                    <p key={index}>{paragraph}</p>
                  ))
                ) : (
                  <>
                    <p>
                      With more than half of web traffic coming from mobile devices, having a mobile-friendly website is essential. 
                      Google uses mobile-first indexing, meaning it primarily uses the mobile version of a site for ranking and indexing.
                    </p>
                    <p>
                      A good mobile experience includes appropriate text sizes, enough spacing for touch targets, 
                      and content that fits the screen without horizontal scrolling.
                    </p>
                  </>
                )}
              </div>
            </div>
          )}
          
          {/* Security Section */}
          {result.security && (
            <div className={styles.detailSection}>
              <div className={styles.sectionHeader}>
                <h2>
                  <FiLock />
                  Security
                </h2>
                <div className={styles.sectionScore}>
                  <div className={`${styles.scoreCircle} ${
                    result.security.isSafe ? styles.scoreExcellent : styles.scorePoor
                  }`}>
                    {result.security.securityScore || (result.security.isSafe ? 100 : 50)}
                  </div>
                </div>
              </div>
              
              <div className={styles.chartsGrid}>
                <div className={styles.chartContainer}>
                  <h3>Security Headers</h3>
                  {generateSecurityRadarChart() ? (
                    <div style={{ height: '300px', position: 'relative' }}>
                      <Radar
                        data={generateSecurityRadarChart()!}
                        options={radarChartOptions}
                      />
                    </div>
                  ) : (
                    <div className={styles.infoBox}>
                      <p>Security header data is not available. This may be due to an error accessing the site's security headers.</p>
                    </div>
                  )}
                </div>
                
                <div className={styles.metricsGrid} style={{ margin: 0 }}>
                  <div className={styles.metricCard}>
                    <div className={styles.metricHeader}>
                      <span className={styles.metricName}>HTTPS</span>
                      <span className={`${styles.metricValue} ${
                        result.security.hasHttps ? styles.success : styles.error}`}>
                        {result.security.hasHttps ? 'Enabled' : 'Not Enabled'}
                      </span>
                    </div>
                    <p className={styles.metricDescription}>
                      HTTPS encrypts data between your browser and the website, keeping sensitive information secure.
                    </p>
                  </div>
                  
                  <div className={styles.metricCard}>
                    <div className={styles.metricHeader}>
                      <span className={styles.metricName}>Mixed Content</span>
                      <span className={`${styles.metricValue} ${
                        !result.security.hasMixedContent ? styles.success : styles.error}`}>
                        {!result.security.hasMixedContent ? 'None Detected' : 'Found'}
                      </span>
                    </div>
                    <p className={styles.metricDescription}>
                      Mixed content occurs when an HTTPS page loads resources (scripts, images) over HTTP, creating security vulnerabilities.
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Security Headers Section - Display as cards */}
              {result.security.hasSecurityHeaders && (
                <div className={styles.infoBox}>
                  <h3>Security Headers Detailed</h3>
                  <div className={styles.metricsGrid}>
                    {Object.entries(result.security.hasSecurityHeaders).map(([header, enabled]) => (
                      <div key={header} className={styles.metricCard}>
                        <div className={styles.metricHeader}>
                          <span className={styles.metricName}>
                            {header.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                          </span>
                          <span className={`${styles.metricValue} ${enabled ? styles.success : styles.error}`}>
                            {enabled ? 'Implemented' : 'Missing'}
                          </span>
                        </div>
                        <p className={styles.metricDescription}>
                          {getSecurityHeaderDescription(header)}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Security Recommendations */}
              {result.security.recommendations && result.security.recommendations.length > 0 && (
                <div className={styles.infoBox}>
                  <h3>Security Recommendations</h3>
                  <ul className={styles.recommendationsList}>
                    {result.security.recommendations.map((recommendation, index) => (
                      <li key={index} className={styles.recommendationItem}>
                        <FiAlertTriangle className={styles.recommendationIcon} />
                        <span>{recommendation}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
          
          {/* Crawlability Section */}
          {activeTab === 'crawlability' && result.crawlability && (
            <div className={styles.detailSection}>
              <div className={styles.sectionHeader}>
                <h2>
                  <FiSearch />
                  Crawlability
                </h2>
                <div className={styles.sectionScore}>
                  <div className={`${styles.scoreCircle} ${
                    result.crawlability.robotsTxtExists && result.crawlability.sitemapExists ? 
                    styles.scoreExcellent : (result.crawlability.robotsTxtExists || result.crawlability.sitemapExists) ? 
                    styles.scoreMedium : styles.scorePoor
                  }`}>
                    {result.crawlability.crawlabilityScore || 
                      (result.crawlability.robotsTxtExists && result.crawlability.sitemapExists ? 
                      100 : (result.crawlability.robotsTxtExists || result.crawlability.sitemapExists) ? 
                      50 : 0)}
                  </div>
                </div>
              </div>
              
              <div className={styles.chartsGrid}>
                <div className={styles.chartContainer}>
                  <h3>Crawlability Summary</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', justifyContent: 'center', height: '80%' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <div style={{ 
                        width: '80px', 
                        height: '80px', 
                        borderRadius: '50%', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        backgroundColor: result.crawlability.robotsTxtExists ? 'var(--color-success)' : 'var(--color-error)',
                        color: 'var(--white)',
                        fontSize: '2rem'
                      }}>
                        {result.crawlability.robotsTxtExists ? <FiCheckCircle /> : <FiXCircle />}
                      </div>
                      <div>
                        <h4 style={{ margin: '0 0 0.5rem 0' }}>robots.txt</h4>
                        <p style={{ margin: 0 }}>{result.crawlability.robotsTxtExists ? 'Found' : 'Not Found'}</p>
                      </div>
                    </div>
                    
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <div style={{ 
                        width: '80px', 
                        height: '80px', 
                        borderRadius: '50%', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        backgroundColor: result.crawlability.sitemapExists ? 'var(--color-success)' : 'var(--color-error)',
                        color: 'var(--white)',
                        fontSize: '2rem'
                      }}>
                        {result.crawlability.sitemapExists ? <FiCheckCircle /> : <FiXCircle />}
                      </div>
                      <div>
                        <h4 style={{ margin: '0 0 0.5rem 0' }}>Sitemap.xml</h4>
                        <p style={{ margin: 0 }}>{result.crawlability.sitemapExists ? 'Found' : 'Not Found'}</p>
                      </div>
                    </div>
                    
                    {result.crawlability.hasCanonical !== undefined && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{ 
                          width: '80px', 
                          height: '80px', 
                          borderRadius: '50%', 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'center',
                          backgroundColor: result.crawlability.hasCanonical ? 'var(--color-success)' : 'var(--color-warning)', // Use warning instead of accent
                          color: 'var(--white)',
                          fontSize: '2rem'
                        }}>
                          {result.crawlability.hasCanonical ? <FiCheckCircle /> : <FiAlertTriangle />}
                        </div>
                        <div>
                          <h4 style={{ margin: '0 0 0.5rem 0' }}>Canonical Tags</h4>
                          <p style={{ margin: 0 }}>{result.crawlability.hasCanonical ? 'Implemented' : 'Not Found'}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className={styles.metricsGrid} style={{ margin: 0 }}>
                  <div className={styles.metricCard}>
                    <div className={styles.metricHeader}>
                      <span className={styles.metricName}>robots.txt</span>
                      <span className={`${styles.metricValue} ${
                        result.crawlability.robotsTxtExists ? styles.success : styles.warning}`}>
                        {result.crawlability.robotsTxtExists ? 'Found' : 'Not Found'}
                      </span>
                    </div>
                    <p className={styles.metricDescription}>
                      robots.txt tells search engines which pages they should and shouldn't crawl.
                    </p>
                  </div>
                  
                  <div className={styles.metricCard}>
                    <div className={styles.metricHeader}>
                      <span className={styles.metricName}>Sitemap</span>
                      <span className={`${styles.metricValue} ${
                        result.crawlability.sitemapExists ? styles.success : styles.warning}`}>
                        {result.crawlability.sitemapExists ? 'Found' : 'Not Found'}
                      </span>
                    </div>
                    <p className={styles.metricDescription}>
                      A sitemap helps search engines discover and index your content more efficiently.
                    </p>
                  </div>
                  
                  {result.crawlability.hasCanonical !== undefined && (
                    <div className={styles.metricCard}>
                      <div className={styles.metricHeader}>
                        <span className={styles.metricName}>Canonical Tags</span>
                        <span className={`${styles.metricValue} ${
                          result.crawlability.hasCanonical ? styles.success : styles.warning}`}>
                          {result.crawlability.hasCanonical ? 'Found' : 'Not Found'}
                        </span>
                      </div>
                      <p className={styles.metricDescription}>
                        Canonical tags prevent duplicate content issues by specifying the preferred version of a page.
                      </p>
                    </div>
                  )}
                </div>
              </div>
              
              {result.crawlability.disallowRules && result.crawlability.disallowRules.length > 0 && (
                <div className={styles.infoBox}>
                  <h3>Disallow Rules in robots.txt</h3>
                  <ul>
                    {result.crawlability.disallowRules.map((rule, index) => (
                      <li key={index}>{rule}</li>
                    ))}
                  </ul>
                </div>
              )}
              
              <div className={styles.infoBox}>
                <h3>Why Crawlability Matters</h3>
                <p>
                  Search engines need to find and understand your content before they can rank it. Good crawlability ensures 
                  that search engines can discover all your important pages and understand their relationship.
                </p>
                <p>
                  Having a proper robots.txt file and sitemap improves crawl efficiency, helping search engines focus on your 
                  important content and respect your crawling preferences.
                </p>
              </div>
            </div>
          )}
          
          <div className={styles.actionButtons}>
            <button 
              onClick={() => window.print()} 
              className={styles.printButton}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="6 9 6 2 18 2 18 9"></polyline>
                <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path>
                <rect x="6" y="14" width="12" height="8"></rect>
              </svg>
              Print Report
            </button>
            <button 
              onClick={handleSubmit} 
              className={styles.rerunButton}
            >
              Re-run Audit
            </button>
          </div>
        </div>
      )}

      <div className={styles.actionHint}>
        Click on any section above to view detailed analysis
      </div>
    </div>
  );
} 