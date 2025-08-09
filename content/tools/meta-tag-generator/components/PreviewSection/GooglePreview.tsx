import { useMemo } from 'react';
import styles from './GooglePreview.module.css';
import { getVisibleCharacterCount } from '../../utils/pixelWidth';

interface GooglePreviewProps {
  title: string;
  description: string;
  url: string;
}

export default function GooglePreview({ title, description, url }: GooglePreviewProps) {
  const formattedUrl = useMemo(() => {
    try {
      const urlObj = new URL(url || 'https://example.com');
      return urlObj.pathname === '/' 
        ? urlObj.hostname 
        : `${urlObj.hostname}${urlObj.pathname}`;
    } catch {
      return 'example.com';
    }
  }, [url]);

  const visibleTitle = useMemo(() => {
    const count = getVisibleCharacterCount(title, 'title');
    return title.length > count 
      ? `${title.substring(0, count)}...` 
      : title;
  }, [title]);

  const visibleDescription = useMemo(() => {
    const count = getVisibleCharacterCount(description, 'description');
    return description.length > count 
      ? `${description.substring(0, count)}...` 
      : description;
  }, [description]);

  return (
    <div className={styles.preview}>
      <div className={styles.url}>{formattedUrl}</div>
      <h3 className={styles.title}>{visibleTitle || 'Page Title - Brand Name'}</h3>
      <p className={styles.description}>
        {visibleDescription || 'A compelling meta description will appear here. Make it informative and include a call-to-action to improve click-through rates.'}
      </p>
    </div>
  );
} 