import styles from './TwitterPreview.module.css';

interface TwitterPreviewProps {
  title: string;
  description: string;
  url: string;
  image?: string;
  cardType?: 'summary' | 'summary_large_image';
}

export default function TwitterPreview({
  title,
  description,
  url,
  image = 'https://via.placeholder.com/1200x600',
  cardType = 'summary_large_image'
}: TwitterPreviewProps) {
  const formattedUrl = url
    ? new URL(url).hostname
    : 'example.com';

  return (
    <div className={styles.preview}>
      <div className={`${styles.card} ${styles[cardType]}`}>
        <div className={styles.image}>
          <img src={image} alt={title} />
        </div>
        <div className={styles.content}>
          <div className={styles.domain}>{formattedUrl}</div>
          <h3 className={styles.title}>
            {title || 'Your Page Title'}
          </h3>
          <p className={styles.description}>
            {description || 'Your page description will appear here. Make it compelling to increase engagement on Twitter.'}
          </p>
        </div>
      </div>
    </div>
  );
} 