import { useMemo } from 'react';
import styles from './Analysis.module.css';
import { validateMetaTags } from '../../utils/validation';
import type { ValidationResult } from '../../types/validation';

interface MetaData {
  title: string;
  description: string;
  keywords: string;
  url: string;
  image: string;
  author: string;
  language: string;
}

interface AnalysisProps {
  metaData: MetaData;
}

export default function Analysis({ metaData }: AnalysisProps) {
  const { title, description, keywords } = metaData;
  
  const validationResults = useMemo(() => {
    return validateMetaTags(title, description, keywords);
  }, [title, description, keywords]);

  const renderValidationResults = (results: ValidationResult[]) => {
    return results.map((result, index) => (
      <div
        key={index}
        className={`${styles.validationItem} ${styles[result.type]}`}
      >
        <span className={styles.icon}>
          {result.type === 'success' && '✓'}
          {result.type === 'warning' && '⚠'}
          {result.type === 'error' && '✕'}
        </span>
        <span className={styles.message}>{result.message}</span>
      </div>
    ));
  };

  return (
    <div className={styles.analysis}>
      <div className={styles.section}>
        <h3>Title Analysis</h3>
        {renderValidationResults(validationResults.title)}
      </div>

      <div className={styles.section}>
        <h3>Description Analysis</h3>
        {renderValidationResults(validationResults.description)}
      </div>

      <div className={styles.section}>
        <h3>Keywords Analysis</h3>
        {renderValidationResults(validationResults.keywords)}
      </div>
    </div>
  );
} 