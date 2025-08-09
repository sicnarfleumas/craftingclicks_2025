import { useState, useEffect } from 'react';
import { FiSearch, FiLoader, FiAlertCircle, FiSmartphone } from 'react-icons/fi';
import styles from './PageSpeedChecker.module.css';
import LoadingOverlay from '../../../../components/Tools/LoadingOverlay';
import ToolHeader from '../../../../components/Tools/ToolHeader';
import type { Step } from '../../../../components/Tools/LoadingOverlay';

interface MetricResult {
  value: number;
  score: number;
  unit: string;
}

interface PageSpeedResult {
  mobile: {
    score: number;
    metrics: {
      fcp: MetricResult;
      lcp: MetricResult;
      cls: MetricResult;
      tbt: MetricResult;
      si: MetricResult;
      tti: MetricResult;
    };
  };
  desktop: {
    score: number;
    metrics: {
      fcp: MetricResult;
      lcp: MetricResult;
      cls: MetricResult;
      tbt: MetricResult;
      si: MetricResult;
      tti: MetricResult;
    };
  };
  timestamp?: number;
  url?: string;
}

const getLetterGrade = (score: number): string => {
  if (score >= 97) return 'A+';
  if (score >= 93) return 'A';
  if (score >= 90) return 'A-';
  if (score >= 87) return 'B+';
  if (score >= 83) return 'B';
  if (score >= 80) return 'B-';
  if (score >= 77) return 'C+';
  if (score >= 73) return 'C';
  if (score >= 70) return 'C-';
  if (score >= 67) return 'D+';
  if (score >= 63) return 'D';
  if (score >= 60) return 'D-';
  return 'F';
};

const getGradeColor = (grade: string): string => {
  if (grade.startsWith('A')) return styles.gradeA;
  if (grade.startsWith('B')) return styles.gradeB;
  if (grade.startsWith('C')) return styles.gradeC;
  if (grade.startsWith('D')) return styles.gradeD;
  return styles.gradeF;
};

const formatMetricValue = (value: number, unit: string): string => {
  if (unit === 's') return `${value.toFixed(1)}s`;
  if (unit === 'ms') return `${value.toFixed(0)}ms`;
  return value.toFixed(3);
};

const MetricCard = ({ name, value, score, unit }: { name: string; value: number; score: number; unit: string }) => {
  const grade = getLetterGrade(score);
  return (
    <div className={styles.metricCard}>
      <h3>{name}</h3>
      <div className={styles.metricContent}>
        <span className={styles.metricValue}>{formatMetricValue(value, unit)}</span>
        <span className={`${styles.grade} ${getGradeColor(grade)}`}>{grade}</span>
      </div>
    </div>
  );
};

const validateAndFormatUrl = (input: string): string => {
  try {
    // Try parsing as a complete URL first
    const urlObj = new URL(input);
    return urlObj.toString();
  } catch {
    try {
      // If that fails, try adding https:// and parse again
      const urlWithProtocol = new URL(`https://${input}`);
      return urlWithProtocol.toString();
    } catch {
      throw new Error('Invalid URL format. Please enter a valid website URL.');
    }
  }
};

export const PageSpeedChecker = () => {
  const [url, setUrl] = useState('');
  const [result, setResult] = useState<PageSpeedResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showUrlHint, setShowUrlHint] = useState(false);
  const [progress, setProgress] = useState<number>(0);
  const [currentStep, setCurrentStep] = useState<number>(0);
  
  const steps: Step[] = [
    { name: 'Preparing Request', description: 'Setting up the analysis' },
    { name: 'Running Tests', description: 'Testing mobile and desktop performance' },
    { name: 'Analyzing Metrics', description: 'Evaluating Core Web Vitals and performance metrics' },
    { name: 'Generating Report', description: 'Preparing the performance analysis' }
  ];

  // Load last result from localStorage on component mount
  useEffect(() => {
    const lastResult = localStorage.getItem('pageSpeedLastResult');
    if (lastResult) {
      try {
        const parsedResult = JSON.parse(lastResult);
        setResult(parsedResult);
        if (parsedResult.url) {
          setUrl(parsedResult.url);
        }
      } catch (e) {
        console.error('Failed to parse last page speed result:', e);
      }
    }
  }, []);

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setUrl(value);
    // Show hint if URL doesn't start with http:// or https://
    setShowUrlHint(value.length > 0 && !value.match(/^https?:\/\//i));
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

      const formattedUrl = validateAndFormatUrl(url);
      if (!formattedUrl) {
        throw new Error('Please enter a valid URL');
      }

      setCurrentStep(1);
      setProgress(20);

      const response = await fetch('/api/page-speed', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url: formattedUrl,
          strategy: 'mobile'
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to check page speed');
      }

      const data = await response.json();
      setProgress(85);

      setCurrentStep(3);
      setResult(data);

      setProgress(100);
    } catch (error: any) {
      setError(error.message || 'An error occurred while checking page speed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.pageSpeedChecker}>
      <ToolHeader 
        title="Website Speed Analyzer" 
        description="Analyze your website's loading speed, Core Web Vitals, and performance metrics on mobile and desktop devices."
      />

      <form id="page-speed-checker-form" onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.inputGroup}>
          <div className={styles.inputWrapper}>
            <FiSearch className={styles.searchIcon} />
            <input
              type="text"
              value={url}
              onChange={handleUrlChange}
              placeholder="Enter website URL (e.g., example.com)"
              className={styles.urlInput}
              required
            />
            {showUrlHint && (
              <div className={styles.urlHint}>
                <span>https:// will be added automatically</span>
              </div>
            )}
          </div>
          <button type="submit" disabled={loading} className={styles.submitButton}>
            Analyze
          </button>
        </div>
      </form>

      {error && (
        <div className={styles.error}>
          <FiAlertCircle />
          <p>{error}</p>
        </div>
      )}

      <LoadingOverlay 
        isVisible={loading} 
        title="Analyzing Website Speed"
        steps={steps}
        currentStep={currentStep}
        progress={progress}
      />

      {result && (
        <div className={styles.results}>
          {result.timestamp && (
            <div className={styles.resultTimestamp}>
              Analysis completed on {new Date(result.timestamp).toLocaleString()}
            </div>
          )}
          <div className={styles.deviceResults}>
            <div className={styles.deviceSection}>
              <h2>Mobile Performance</h2>
              <div className={`${styles.overallScore} ${getGradeColor(getLetterGrade(result.mobile.score))}`}>
                <span className={styles.grade}>{getLetterGrade(result.mobile.score)}</span>
                <span className={styles.score}>{result.mobile.score}</span>
              </div>
              <div className={styles.metrics}>
                <MetricCard name="First Contentful Paint (FCP)" value={result.mobile.metrics.fcp.value} score={result.mobile.metrics.fcp.score} unit="s" />
                <MetricCard name="Largest Contentful Paint (LCP)" value={result.mobile.metrics.lcp.value} score={result.mobile.metrics.lcp.score} unit="s" />
                <MetricCard name="Cumulative Layout Shift (CLS)" value={result.mobile.metrics.cls.value} score={result.mobile.metrics.cls.score} unit="" />
                <MetricCard name="Total Blocking Time (TBT)" value={result.mobile.metrics.tbt.value} score={result.mobile.metrics.tbt.score} unit="ms" />
                <MetricCard name="Speed Index (SI)" value={result.mobile.metrics.si.value} score={result.mobile.metrics.si.score} unit="s" />
                <MetricCard name="Time to Interactive (TTI)" value={result.mobile.metrics.tti.value} score={result.mobile.metrics.tti.score} unit="s" />
              </div>
            </div>

            <div className={styles.deviceSection}>
              <h2>Desktop Performance</h2>
              <div className={`${styles.overallScore} ${getGradeColor(getLetterGrade(result.desktop.score))}`}>
                <span className={styles.grade}>{getLetterGrade(result.desktop.score)}</span>
                <span className={styles.score}>{result.desktop.score}</span>
              </div>
              <div className={styles.metrics}>
                <MetricCard name="First Contentful Paint (FCP)" value={result.desktop.metrics.fcp.value} score={result.desktop.metrics.fcp.score} unit="s" />
                <MetricCard name="Largest Contentful Paint (LCP)" value={result.desktop.metrics.lcp.value} score={result.desktop.metrics.lcp.score} unit="s" />
                <MetricCard name="Cumulative Layout Shift (CLS)" value={result.desktop.metrics.cls.value} score={result.desktop.metrics.cls.score} unit="" />
                <MetricCard name="Total Blocking Time (TBT)" value={result.desktop.metrics.tbt.value} score={result.desktop.metrics.tbt.score} unit="ms" />
                <MetricCard name="Speed Index (SI)" value={result.desktop.metrics.si.value} score={result.desktop.metrics.si.score} unit="s" />
                <MetricCard name="Time to Interactive (TTI)" value={result.desktop.metrics.tti.value} score={result.desktop.metrics.tti.score} unit="s" />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PageSpeedChecker;