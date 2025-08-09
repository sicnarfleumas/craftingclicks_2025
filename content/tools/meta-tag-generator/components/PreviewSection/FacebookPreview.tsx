import styles from './FacebookPreview.module.css';

interface FacebookPreviewProps {
  title: string;
  description: string;
  url: string;
  image?: string;
}

export default function FacebookPreview({
  title,
  description,
  url,
  image = 'https://via.placeholder.com/1200x630'
}: FacebookPreviewProps) {
  const formattedUrl = url
    ? new URL(url).hostname
    : 'example.com';

  return (
    <div className={styles.preview}>
      <div className={styles.card}>
        <div className={styles.image}>
          <img src={image} alt={title} />
        </div>
        <div className={styles.content}>
          <div className={styles.domain}>{formattedUrl}</div>
          <h3 className={styles.title}>
            {title || 'Your Page Title'}
          </h3>
          <p className={styles.description}>
            {description || 'Your page description will appear here. Make it compelling to increase engagement on social media.'}
          </p>
        </div>
      </div>
    </div>
  );
} 