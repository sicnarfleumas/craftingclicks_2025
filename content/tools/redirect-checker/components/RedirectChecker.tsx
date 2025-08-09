import { useState, useEffect, useRef } from 'react';
import { FiSearch, FiLoader, FiAlertCircle, FiUpload, FiExternalLink, FiChevronRight, FiCheck, FiX } from 'react-icons/fi';
import styles from './RedirectChecker.module.css';
import LoadingOverlay from '../../../../components/Tools/LoadingOverlay';
import type { Step } from '../../../../components/Tools/LoadingOverlay';

interface TimingMetric {
  dns: number;
  tcp: number;
  tls?: number;
  requestSent: number;
  firstByte: number;
  download: number;
  total: number;
}

interface RedirectStep {
  url: string;
  statusCode: number;
  redirectType: string;
  redirectUrl?: string;
  headers?: Record<string, string[]>;
  timings?: TimingMetric;
  isLoop?: boolean;
  isChain?: boolean;
  isMeta?: boolean;
  metaAttributes?: {
    httpEquiv?: string;
    content?: string;
    delay?: number;
    url?: string;
  };
}

interface RedirectResult {
  originalUrl: string;
  finalUrl: string;
  steps: RedirectStep[];
  summary: {
    redirectCount: number;
    hasChain: boolean;
    hasLoop: boolean;
    hasMetaRefresh: boolean;
    totalTime: number;
    finalStatusCode: number;
    seoImpact: {
      score: number;
      issues: string[];
    };
  };
  timestamp?: number;
}

interface BulkRedirectResult {
  url: string;
  result: RedirectResult | null;
  error?: string;
  processing?: boolean;
}

const getStatusClass = (statusCode: number): string => {
  if (statusCode >= 200 && statusCode < 300) return styles.statusSuccess;
  if (statusCode >= 300 && statusCode < 400) return styles.statusRedirect;
  if (statusCode >= 400 && statusCode < 500) return styles.statusClientError;
  if (statusCode >= 500) return styles.statusServerError;
  return styles.statusUnknown;
};

const getGradeColor = (score: number): string => {
  if (score >= 90) return styles.scoreExcellent;
  if (score >= 70) return styles.scoreGood;
  if (score >= 50) return styles.scoreFair;
  if (score >= 30) return styles.scorePoor;
  return styles.scoreCritical;
};

const formatTime = (ms: number): string => {
  if (ms < 1) return `${(ms * 1000).toFixed(0)}μs`;
  if (ms < 1000) return `${ms.toFixed(0)}ms`;
  return `${(ms / 1000).toFixed(2)}s`;
};

const validateAndFormatUrl = (input: string): string => {
  let url = input.trim();
  
  // Check if the URL contains a protocol
  if (!/^https?:\/\//i.test(url)) {
    // Add https:// if no protocol is specified
    url = `https://${url}`;
  }
  
  try {
    const parsedUrl = new URL(url);
    return parsedUrl.toString();
  } catch (error) {
    return '';
  }
};

// Component for a single redirect step
const RedirectStepCard = ({ step, index, total }: { step: RedirectStep; index: number; total: number }) => {
  const isLastStep = index === total - 1;
  const statusClass = getStatusClass(step.statusCode);
  
  return (
    <div className={styles.stepCard}>
      <div className={styles.stepHeader}>
        <div className={styles.stepIndex}>{index + 1}</div>
        <div className={styles.stepUrl}>{step.url}</div>
        <div className={`${styles.statusCode} ${statusClass}`}>
          {step.statusCode} {step.redirectType}
        </div>
      </div>
      
      <div className={styles.stepDetails}>
        {step.timings && (
          <div className={styles.timingMetrics}>
            <div className={styles.timingTitle}>Timing</div>
            <div className={styles.timingGrid}>
              <div className={styles.timingItem}>
                <span className={styles.timingLabel}>DNS</span>
                <span className={styles.timingValue}>{formatTime(step.timings.dns)}</span>
              </div>
              <div className={styles.timingItem}>
                <span className={styles.timingLabel}>TCP</span>
                <span className={styles.timingValue}>{formatTime(step.timings.tcp)}</span>
              </div>
              {step.timings.tls && (
                <div className={styles.timingItem}>
                  <span className={styles.timingLabel}>TLS</span>
                  <span className={styles.timingValue}>{formatTime(step.timings.tls)}</span>
                </div>
              )}
              <div className={styles.timingItem}>
                <span className={styles.timingLabel}>Request</span>
                <span className={styles.timingValue}>{formatTime(step.timings.requestSent)}</span>
              </div>
              <div className={styles.timingItem}>
                <span className={styles.timingLabel}>TTFB</span>
                <span className={styles.timingValue}>{formatTime(step.timings.firstByte)}</span>
              </div>
              <div className={styles.timingItem}>
                <span className={styles.timingLabel}>Download</span>
                <span className={styles.timingValue}>{formatTime(step.timings.download)}</span>
              </div>
              <div className={styles.timingItem}>
                <span className={styles.timingLabel}>Total</span>
                <span className={styles.timingValue}>{formatTime(step.timings.total)}</span>
              </div>
            </div>
          </div>
        )}
        
        {step.isLoop && (
          <div className={styles.warningBox}>
            <FiAlertCircle /> Redirect loop detected! This URL redirects back to a previous URL in the chain.
          </div>
        )}
        
        {step.isMeta && (
          <div className={styles.infoBox}>
            <div className={styles.metaInfo}>
              <strong>Meta Refresh Redirect</strong>
              <div>Delay: {step.metaAttributes?.delay}s</div>
              <div>Target: {step.metaAttributes?.url}</div>
            </div>
          </div>
        )}
        
        {!isLastStep && step.redirectUrl && (
          <div className={styles.redirectArrow}>
            <div className={styles.arrowLine}></div>
            <FiChevronRight />
            <div className={styles.nextUrl}>{step.redirectUrl}</div>
          </div>
        )}
      </div>
    </div>
  );
};

// Component for showing overall summary and SEO impact
const RedirectSummary = ({ result }: { result: RedirectResult }) => {
  const { summary } = result;
  const scoreClass = getGradeColor(summary.seoImpact.score);
  const scoreCategory = getScoreCategory(summary.seoImpact.score);
  
  return (
    <div className={styles.summaryContainer}>
      <div className={styles.summaryHeader}>
        <h3>Analysis Summary</h3>
        <div className={styles.scoreWrapper}>
          <div className={`${styles.seoScore} ${scoreClass}`}>
            <div className={styles.scoreValue}>{summary.seoImpact.score}</div>
          </div>
          <div className={styles.scoreInfo}>
            <div className={styles.scoreCategory}>{scoreCategory}</div>
            <div className={styles.scoreLabel}>SEO Impact</div>
          </div>
        </div>
      </div>
      
      <div className={styles.summaryContent}>
        <div className={styles.summaryMetrics}>
          <div className={styles.summaryMetric}>
            <div className={styles.metricLabel}>Redirects</div>
            <div className={styles.metricValue}>{summary.redirectCount}</div>
          </div>
          <div className={styles.summaryMetric}>
            <div className={styles.metricLabel}>Total Time</div>
            <div className={styles.metricValue}>{formatTime(summary.totalTime)}</div>
          </div>
          <div className={styles.summaryMetric}>
            <div className={styles.metricLabel}>Final Status</div>
            <div className={`${styles.metricValue} ${getStatusClass(summary.finalStatusCode)}`}>
              {summary.finalStatusCode}
            </div>
          </div>
        </div>
        
        <div className={styles.summaryFlags}>
          <div className={`${styles.summaryFlag} ${summary.hasChain ? styles.flagWarning : styles.flagSuccess}`}>
            {summary.hasChain ? <FiAlertCircle /> : <FiCheck />}
            Redirect Chain
          </div>
          <div className={`${styles.summaryFlag} ${summary.hasLoop ? styles.flagCritical : styles.flagSuccess}`}>
            {summary.hasLoop ? <FiX /> : <FiCheck />}
            Redirect Loop
          </div>
          <div className={`${styles.summaryFlag} ${summary.hasMetaRefresh ? styles.flagWarning : styles.flagSuccess}`}>
            {summary.hasMetaRefresh ? <FiAlertCircle /> : <FiCheck />}
            Meta Refresh
          </div>
        </div>
        
        {summary.seoImpact.issues.length > 0 && (
          <div className={styles.seoIssues}>
            <h4>SEO Recommendations</h4>
            <div className={styles.issuesContainer}>
              {summary.seoImpact.issues.map((issue, index) => (
                <div key={index} className={styles.issueItem}>
                  <div className={styles.issueIcon}>
                    <FiAlertCircle />
                  </div>
                  <p>{issue}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Component for bulk URL testing
const BulkRedirectTester = ({ 
  onSubmit, 
  loading 
}: { 
  onSubmit: (urls: string[]) => void; 
  loading: boolean;
}) => {
  const [urls, setUrls] = useState<string>('');
  const [urlError, setUrlError] = useState<string | null>(null);
  const MAX_URLS = 5;
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setUrlError(null);
    
    const urlList = urls
      .split('\n')
      .map(url => url.trim())
      .filter(url => url.length > 0);
    
    if (urlList.length === 0) {
      setUrlError('Please enter at least one URL');
      return;
    }
    
    if (urlList.length > MAX_URLS) {
      setUrlError(`Maximum ${MAX_URLS} URLs allowed at once. Please reduce the number of URLs.`);
      return;
    }
    
    // Validate each URL
    const invalidUrls = urlList.filter(url => !validateAndFormatUrl(url));
    if (invalidUrls.length > 0) {
      setUrlError(`Some URLs are invalid. Please check your input.`);
      return;
    }
    
    onSubmit(urlList);
  };
  
  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setUrls(e.target.value);
    setUrlError(null);
  };
  
  return (
    <div className={styles.bulkTesterContainer}>
      <h3>Bulk URL Checker</h3>
      <p>Enter up to {MAX_URLS} URLs (one per line) to check multiple redirects at once.</p>
      
      <form onSubmit={handleSubmit}>
        <textarea
          className={styles.bulkTextarea}
          value={urls}
          onChange={handleTextareaChange}
          placeholder={`Enter up to ${MAX_URLS} URLs (one per line)&#10;example.com&#10;https://another-example.com/page&#10;https://third-example.com`}
          rows={5}
          disabled={loading}
        />
        
        {urlError && (
          <div className={styles.errorContainer} style={{ marginBottom: '1rem' }}>
            <FiAlertCircle />
            <p>{urlError}</p>
          </div>
        )}
        
        <button type="submit" className={styles.bulkSubmitBtn} disabled={loading}>
          {loading ? (
            <>
              <FiLoader className={styles.loadingIcon} />
              Processing...
            </>
          ) : (
            <>
              <FiUpload />
              Check URLs
            </>
          )}
        </button>
      </form>
    </div>
  );
};

const getScoreCategory = (score: number): string => {
  if (score >= 90) return 'Excellent';
  if (score >= 70) return 'Good';
  if (score >= 50) return 'Fair';
  if (score >= 30) return 'Poor';
  return 'Critical';
};

const RedirectChecker = () => {
  const [url, setUrl] = useState('');
  const [bulkUrls, setBulkUrls] = useState('');
  const [isBulkMode, setIsBulkMode] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<RedirectResult | null>(null);
  const [bulkResults, setBulkResults] = useState<BulkRedirectResult[]>([]);
  const [currentStep, setCurrentStep] = useState(1);
  const [progress, setProgress] = useState(0);
  const [currentBulkIndex, setCurrentBulkIndex] = useState(0);
  const resultContainerRef = useRef<HTMLDivElement>(null);

  // Loading steps for the overlay
  const steps: Step[] = [
    { name: "Checking Redirects", description: "Following redirect chain..." },
    { name: "Analyzing Results", description: "Processing response data..." },
    { name: "Generating Report", description: "Preparing detailed analysis..." }
  ];

  const handleSingleUrlCheck = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      if (!url) {
        throw new Error('Please enter a URL');
      }

      const formattedUrl = validateAndFormatUrl(url);
      if (!formattedUrl) {
        throw new Error('Please enter a valid URL');
      }

      setCurrentStep(1);
      setProgress(20);

      const response = await fetch('/api/redirect-checker/single', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url: formattedUrl,
          userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to check redirects');
      }

      const data = await response.json();
      setProgress(85);

      // Step 4: Generating report
      setCurrentStep(3);

      setResult(data);

      // Scroll to results
      if (resultContainerRef.current) {
        resultContainerRef.current.scrollIntoView({ behavior: 'smooth' });
      }

      setProgress(100);
    } catch (error: any) {
      setError(error.message || 'An error occurred while checking redirects');
    } finally {
      setIsLoading(false);
      setProgress(0);
      setCurrentStep(0);
    }
  };

  const handleBulkCheck = async (urls: string[]) => {
    setIsLoading(true);
    setError(null);
    setBulkResults([]);

    try {
      if (!urls.length) {
        throw new Error('Please enter at least one URL');
      }

      const formattedUrls = urls
        .map(url => validateAndFormatUrl(url))
        .filter(url => url) as string[];

      if (!formattedUrls.length) {
        throw new Error('No valid URLs found');
      }

      setCurrentStep(1);
      setProgress(20);

      const response = await fetch('/api/redirect-checker/bulk', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          urls: formattedUrls,
          userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to check redirects');
      }

      const data = await response.json();
      setProgress(85);

      // Step 3 & 4: Analyzing results and generating report
      setCurrentStep(3);

      // Scroll to results
      if (resultContainerRef.current) {
        resultContainerRef.current.scrollIntoView({ behavior: 'smooth' });
      }

      setProgress(100);

      setBulkResults(data);
    } catch (error: any) {
      setError(error.message || 'An error occurred during bulk processing');
    } finally {
      setIsLoading(false);
      setProgress(0);
      setCurrentStep(0);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Website Redirect Analyzer</h1>
        <p>Check redirect chains, identify loops, and analyze SEO impact of your website's redirects.</p>
      </div>

      <div className={styles.form}>
        <div className={styles.tabsContainer}>
          <button 
            className={`${styles.tabButton} ${!isBulkMode ? styles.activeTab : ''}`}
            onClick={() => {
              setIsBulkMode(false);
              setResult(null);
              setBulkResults([]);
              setError(null);
            }}
            disabled={isLoading}
          >
            Single URL Check
          </button>
          <button 
            className={`${styles.tabButton} ${isBulkMode ? styles.activeTab : ''}`}
            onClick={() => {
              setIsBulkMode(true);
              setResult(null);
              setBulkResults([]);
              setError(null);
            }}
            disabled={isLoading}
          >
            Bulk URL Check (Up to 5 URLs)
          </button>
        </div>
        
        {!isBulkMode ? (
          <div className={styles.singleCheckContainer}>
            <div className={styles.inputGroup}>
              <div className={styles.inputWrapper}>
                <FiSearch className={styles.searchIcon} />
                <input
                  type="text"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="Enter a URL (e.g., example.com or https://example.com/page)"
                  className={styles.urlInput}
                  disabled={isLoading}
                />
              </div>
              <button type="submit" className={styles.submitButton} disabled={isLoading}>
                Check Redirects
              </button>
            </div>
          </div>
        ) : (
          <BulkRedirectTester onSubmit={handleBulkCheck} loading={isLoading} />
        )}
      </div>
      
      {error && (
        <div className={styles.errorContainer}>
          <FiAlertCircle />
          <p>{error}</p>
        </div>
      )}
      
      <LoadingOverlay 
        isVisible={isLoading} 
        title={isBulkMode ? 'Processing URLs' : 'Checking Redirects'}
        steps={steps}
        currentStep={currentStep}
        progress={progress}
      />
      
      {!isBulkMode && result && (
        <div className={styles.resultContainer} ref={resultContainerRef}>
          <div className={styles.resultHeader}>
            <h3>Redirect Analysis Results</h3>
            <div className={styles.urlInfo}>
              <div>
                <strong>Original URL:</strong> {result.originalUrl}
              </div>
              <div>
                <strong>Final URL:</strong> {result.finalUrl}
                <a 
                  href={result.finalUrl} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className={styles.externalLink}
                >
                  <FiExternalLink />
                </a>
              </div>
            </div>
          </div>
          
          <RedirectSummary result={result} />
          
          <div className={styles.redirectSteps}>
            <h3>Redirect Chain</h3>
            {result.steps.map((step, index) => (
              <RedirectStepCard 
                key={index} 
                step={step} 
                index={index} 
                total={result.steps.length} 
              />
            ))}
          </div>
        </div>
      )}
      
      {isBulkMode && bulkResults.length > 0 && (
        <div className={styles.resultContainer} ref={resultContainerRef}>
          <div className={styles.resultHeader}>
            <h3>Bulk Analysis Results</h3>
            <div className={styles.urlInfo}>
              Analyzed {bulkResults.filter(item => item.result || item.error).length} of {bulkResults.length} URLs
              {isLoading && (
                <div className={styles.loadingIndicator}>
                  <FiLoader className={styles.loadingIcon} /> 
                  Processing URL {currentBulkIndex + 1} of {bulkResults.length}
                </div>
              )}
            </div>
          </div>
          
          {bulkResults.map((item, index) => (
            <div key={index} className={styles.bulkResultCard}>
              <div className={styles.bulkResultHeader}>
                <h4>URL: {item.url}</h4>
                {item.processing && <FiLoader className={styles.loadingIcon} />}
                {item.error && <div className={styles.errorMessage}><FiAlertCircle /> {item.error}</div>}
              </div>
              
              {item.result && (
                <div className={styles.bulkResultContent}>
                  <div className={styles.bulkUrlInfo}>
                    <div>
                      <strong>Final URL:</strong> {item.result.finalUrl}
                      <a 
                        href={item.result.finalUrl} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className={styles.externalLink}
                      >
                        <FiExternalLink />
                      </a>
                    </div>
                    <div>
                      <strong>Redirects:</strong> {item.result.summary.redirectCount}
                      <strong> | Time:</strong> {formatTime(item.result.summary.totalTime)}
                      <strong> | Status:</strong> <span className={getStatusClass(item.result.summary.finalStatusCode)}>
                        {item.result.summary.finalStatusCode}
                      </span>
                    </div>
                  </div>
                  
                  <div className={styles.bulkUrlSummary}>
                    <div className={styles.summaryFlags}>
                      <div className={`${styles.summaryFlag} ${item.result.summary.hasChain ? styles.flagWarning : styles.flagSuccess}`}>
                        {item.result.summary.hasChain ? <FiAlertCircle /> : <FiCheck />}
                        Chain
                      </div>
                      <div className={`${styles.summaryFlag} ${item.result.summary.hasLoop ? styles.flagCritical : styles.flagSuccess}`}>
                        {item.result.summary.hasLoop ? <FiX /> : <FiCheck />}
                        Loop
                      </div>
                      <div className={`${styles.summaryFlag} ${item.result.summary.hasMetaRefresh ? styles.flagWarning : styles.flagSuccess}`}>
                        {item.result.summary.hasMetaRefresh ? <FiAlertCircle /> : <FiCheck />}
                        Meta
                      </div>
                      <div className={`${styles.bulkSeoScore} ${getGradeColor(item.result.summary.seoImpact.score)}`}>
                        <span>{item.result.summary.seoImpact.score}</span>
                        <span className={styles.scoreLabel}>{getScoreCategory(item.result.summary.seoImpact.score)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RedirectChecker;