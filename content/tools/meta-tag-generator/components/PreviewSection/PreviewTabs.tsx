import { useState } from 'react';
import styles from './PreviewTabs.module.css';
import GooglePreview from './GooglePreview';
import FacebookPreview from './FacebookPreview';
import TwitterPreview from './TwitterPreview';

interface PreviewTabsProps {
  title: string;
  description: string;
  url: string;
  image?: string;
}

type PreviewType = 'google' | 'facebook' | 'twitter';

export default function PreviewTabs({
  title,
  description,
  url,
  image
}: PreviewTabsProps) {
  const [activeTab, setActiveTab] = useState<PreviewType>('google');
  const [twitterCardType, setTwitterCardType] = useState<'summary' | 'summary_large_image'>('summary_large_image');

  return (
    <div className={styles.previewTabs}>
      <div className={styles.tabs}>
        <button
          className={`${styles.tab} ${activeTab === 'google' ? styles.active : ''}`}
          onClick={() => setActiveTab('google')}
        >
          Google
        </button>
        <button
          className={`${styles.tab} ${activeTab === 'facebook' ? styles.active : ''}`}
          onClick={() => setActiveTab('facebook')}
        >
          Facebook
        </button>
        <button
          className={`${styles.tab} ${activeTab === 'twitter' ? styles.active : ''}`}
          onClick={() => setActiveTab('twitter')}
        >
          Twitter
        </button>
      </div>

      <div className={styles.preview}>
        {activeTab === 'google' && (
          <GooglePreview
            title={title}
            description={description}
            url={url}
          />
        )}
        {activeTab === 'facebook' && (
          <FacebookPreview
            title={title}
            description={description}
            url={url}
            image={image}
          />
        )}
        {activeTab === 'twitter' && (
          <div>
            <div className={styles.cardTypeSelector}>
              <label>
                <input
                  type="radio"
                  name="cardType"
                  value="summary_large_image"
                  checked={twitterCardType === 'summary_large_image'}
                  onChange={(e) => setTwitterCardType(e.target.value as 'summary_large_image')}
                />
                Large Image Card
              </label>
              <label>
                <input
                  type="radio"
                  name="cardType"
                  value="summary"
                  checked={twitterCardType === 'summary'}
                  onChange={(e) => setTwitterCardType(e.target.value as 'summary')}
                />
                Summary Card
              </label>
            </div>
            <TwitterPreview
              title={title}
              description={description}
              url={url}
              image={image}
              cardType={twitterCardType}
            />
          </div>
        )}
      </div>
    </div>
  );
} 