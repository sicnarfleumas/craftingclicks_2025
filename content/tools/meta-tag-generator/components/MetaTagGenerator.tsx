import { useState } from 'react';
import styles from './MetaTagGenerator.module.css';
import PreviewTabs from './PreviewSection/PreviewTabs';
import Analysis from './AnalysisSection/Analysis';
import ToolHeader from '../../../../components/Tools/ToolHeader';

interface MetaData {
  title: string;
  description: string;
  keywords: string;
  url: string;
  image: string;
  author: string;
  language: string;
}

export default function MetaTagGenerator() {
  const [activeTab, setActiveTab] = useState<'editor' | 'preview' | 'analysis' | 'code'>('editor');
  
  const [metaData, setMetaData] = useState<MetaData>({
    title: '',
    description: '',
    keywords: '',
    url: '',
    image: '',
    author: '',
    language: 'en'
  });

  const [errors, setErrors] = useState<{[key: string]: string}>({});
  
  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState<string | null>(null);
  
  const generateMetaCode = () => {
    return `<!-- Basic Meta Tags -->
<title>${metaData.title}</title>
<meta name="description" content="${metaData.description}" />
<meta name="keywords" content="${metaData.keywords}" />
${metaData.author ? `<meta name="author" content="${metaData.author}" />` : ''}
${metaData.language ? `<meta http-equiv="content-language" content="${metaData.language}" />` : ''}

<!-- Open Graph Meta Tags (Facebook, LinkedIn) -->
<meta property="og:title" content="${metaData.title}" />
<meta property="og:description" content="${metaData.description}" />
${metaData.url ? `<meta property="og:url" content="${metaData.url}" />` : ''}
<meta property="og:type" content="website" />
${metaData.image ? `<meta property="og:image" content="${metaData.image}" />` : ''}

<!-- Twitter Card Meta Tags -->
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="${metaData.title}" />
<meta name="twitter:description" content="${metaData.description}" />
${metaData.image ? `<meta name="twitter:image" content="${metaData.image}" />` : ''}`;
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setMetaData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setMetaData(prev => ({
          ...prev,
          image: reader.result as string
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const getTitleStatus = (length: number) => {
    if (length === 0) return '';
    if (length < 30) return 'Too short';
    if (length <= 60) return 'Perfect length';
    if (length <= 70) return 'Getting long';
    return 'Too long';
  };

  const getTitleStatusClass = (status: string) => {
    switch(status) {
      case 'Perfect length': return styles.statusPerfect;
      case 'Getting long': return styles.statusWarning;
      case 'Too long': return styles.statusError;
      case 'Too short': return styles.statusWarning;
      default: return '';
    }
  };
  
  const getDescriptionStatus = (length: number) => {
    if (length === 0) return '';
    if (length < 70) return 'Too short';
    if (length <= 160) return 'Perfect length';
    if (length <= 180) return 'Getting long';
    return 'Too long';
  };
  
  const getDescriptionStatusClass = (status: string) => {
    switch(status) {
      case 'Perfect length': return styles.statusPerfect;
      case 'Getting long': return styles.statusWarning;
      case 'Too long': return styles.statusError;
      case 'Too short': return styles.statusWarning;
      default: return '';
    }
  };

  const navigateToTab = (nextTab: 'editor' | 'analysis' | 'code') => {
    if ((nextTab === 'analysis' || nextTab === 'code')) {
      let hasErrors = false;
      const newErrors: {[key: string]: string} = {};
      
      if (!metaData.title.trim()) {
        newErrors.title = 'Title is required';
        hasErrors = true;
      }
      
      if (!metaData.description.trim()) {
        newErrors.description = 'Description is required';
        hasErrors = true;
      }
      
      if (hasErrors) {
        setErrors(newErrors);
        return;
      }
    }
    
    setActiveTab(nextTab);
  };

  const isValidUrl = (url: string): boolean => {
    try {
      const parsedUrl = new URL(url);
      return parsedUrl.protocol === 'http:' || parsedUrl.protocol === 'https:';
    } catch (e) {
      return false;
    }
  };

  const copyToClipboard = () => {
    setCopyError(null);
    navigator.clipboard.writeText(generateMetaCode())
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      })
      .catch(err => {
        setCopyError('Unable to copy to clipboard. Please try selecting and copying the code manually.');
      });
  };

  const handleSampleImage = () => {
    setMetaData(prev => ({
      ...prev,
      image: 'https://via.placeholder.com/1200x630?text=Meta+Image+Preview'
    }));
  };

  const getFieldImportance = () => {
    const importance = {
      title: metaData.title.length > 0 ? 'high' : 'missing',
      description: metaData.description.length > 0 ? 'high' : 'missing',
      keywords: metaData.keywords.length > 0 ? 'medium' : 'missing',
      image: metaData.image.length > 0 ? 'medium' : 'missing',
      url: metaData.url.length > 0 ? 'medium' : 'missing',
      author: metaData.author.length > 0 ? 'low' : 'missing',
      language: metaData.language.length > 0 ? 'low' : 'missing'
    };
    
    return importance;
  };

  const getFieldImportanceClass = (fieldName: keyof MetaData) => {
    const importance = getFieldImportance();
    switch(importance[fieldName]) {
      case 'high': return styles.fieldImportanceHigh;
      case 'medium': return styles.fieldImportanceMedium;
      case 'low': return styles.fieldImportanceLow;
      default: return '';
    }
  };

  return (
    <div className={styles.container}>
      <ToolHeader 
        title="Meta Tag Generator" 
        description="Create optimized meta tags for better SEO performance and social media sharing"
      />

      <div className={styles.toolContainer}>
        <div className={styles.tabNavigation}>
          <button 
            className={`${styles.tabButton} ${activeTab === 'editor' ? styles.activeTab : ''}`}
            onClick={() => setActiveTab('editor')}
          >
            <span className={styles.tabIcon}>
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 20h9"></path>
                <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
              </svg>
            </span> 
            Editor
          </button>
          <button 
            className={`${styles.tabButton} ${activeTab === 'analysis' ? styles.activeTab : ''}`}
            onClick={() => navigateToTab('analysis')}
          >
            <span className={styles.tabIcon}>
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 3v18h18"></path>
                <path d="M18 17V9"></path>
                <path d="M13 17V5"></path>
                <path d="M8 17v-3"></path>
              </svg>
            </span> 
            Analysis
          </button>
          <button 
            className={`${styles.tabButton} ${activeTab === 'code' ? styles.activeTab : ''}`}
            onClick={() => navigateToTab('code')}
          >
            <span className={styles.tabIcon}>
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="16 18 22 12 16 6"></polyline>
                <polyline points="8 6 2 12 8 18"></polyline>
              </svg>
            </span> 
            Get Code
          </button>
        </div>

        <div className={styles.tabContent}>
          {activeTab === 'editor' && (
            <div className={styles.sideBySideLayout}>
              <div className={styles.editorSection}>
                <div className={styles.editorTab}>
                  <div className={styles.formGrid}>
                    <div className={styles.formSection}>
                      <h3 className={styles.sectionHeading}>Essential Information</h3>
                      
                      <div className={`${styles.inputGroup} ${errors.title ? styles.hasError : ''}`}>
                        <div className={styles.labelContainer}>
                          <label htmlFor="title">Meta Title</label>
                          <div className={`${styles.fieldImportance} ${getFieldImportanceClass('title')}`}>High importance</div>
                        </div>
                        <div className={styles.inputWithStatus}>
                          <input
                            type="text"
                            id="title"
                            name="title"
                            value={metaData.title}
                            onChange={handleInputChange}
                            placeholder="Your page title"
                            maxLength={100}
                            className={styles.fullWidthInput}
                          />
                          <div className={`${styles.characterCount} ${getTitleStatusClass(getTitleStatus(metaData.title.length))}`}>
                            {metaData.title.length} / 60 - {getTitleStatus(metaData.title.length)}
                          </div>
                        </div>
                        {errors.title && <div className={styles.errorMessage}>{errors.title}</div>}
                      </div>
                      
                      <div className={`${styles.inputGroup} ${errors.description ? styles.hasError : ''}`}>
                        <div className={styles.labelContainer}>
                          <label htmlFor="description">Meta Description</label>
                          <div className={`${styles.fieldImportance} ${getFieldImportanceClass('description')}`}>High importance</div>
                        </div>
                        <div className={styles.inputWithStatus}>
                          <textarea
                            id="description"
                            name="description"
                            value={metaData.description}
                            onChange={handleInputChange}
                            placeholder="Brief description of your page content"
                            maxLength={250}
                            rows={4}
                            className={styles.fullWidthInput}
                          />
                          <div className={`${styles.characterCount} ${getDescriptionStatusClass(getDescriptionStatus(metaData.description.length))}`}>
                            {metaData.description.length} / 160 - {getDescriptionStatus(metaData.description.length)}
                          </div>
                        </div>
                        {errors.description && <div className={styles.errorMessage}>{errors.description}</div>}
                      </div>
                    </div>
                    
                    <div className={styles.formSection}>
                      <h3 className={styles.sectionHeading}>Additional Information</h3>
                      
                      <div className={`${styles.inputGroup} ${errors.url ? styles.hasError : ''}`}>
                        <div className={styles.labelContainer}>
                          <label htmlFor="url">Page URL <span className={styles.optionalLabel}>(optional)</span></label>
                          <div className={`${styles.fieldImportance} ${getFieldImportanceClass('url')}`}>Medium importance</div>
                        </div>
                        <input
                          type="url"
                          id="url"
                          name="url"
                          value={metaData.url}
                          onChange={handleInputChange}
                          placeholder="https://example.com/page"
                          className={styles.fullWidthInput}
                        />
                        {errors.url && <div className={styles.errorMessage}>{errors.url}</div>}
                      </div>
                      
                      <div className={styles.inputGroup}>
                        <div className={styles.labelContainer}>
                          <label htmlFor="keywords">Meta Keywords <span className={styles.optionalLabel}>(optional)</span></label>
                          <div className={`${styles.fieldImportance} ${getFieldImportanceClass('keywords')}`}>Medium importance</div>
                        </div>
                        <input
                          type="text"
                          id="keywords"
                          name="keywords"
                          value={metaData.keywords}
                          onChange={handleInputChange}
                          placeholder="keyword1, keyword2, keyword3"
                          className={styles.fullWidthInput}
                        />
                      </div>
                      
                      <div className={styles.twoColumnInputs}>
                        <div className={styles.inputGroup}>
                          <div className={styles.labelContainer}>
                            <label htmlFor="author">Author <span className={styles.optionalLabel}>(optional)</span></label>
                            <div className={`${styles.fieldImportance} ${getFieldImportanceClass('author')}`}>Low importance</div>
                          </div>
                          <input
                            type="text"
                            id="author"
                            name="author"
                            value={metaData.author}
                            onChange={handleInputChange}
                            placeholder="Page author or content creator"
                            className={styles.fullWidthInput}
                          />
                        </div>
                        
                        <div className={styles.inputGroup}>
                          <div className={styles.labelContainer}>
                            <label htmlFor="language">Language <span className={styles.optionalLabel}>(optional)</span></label>
                            <div className={`${styles.fieldImportance} ${getFieldImportanceClass('language')}`}>Low importance</div>
                          </div>
                          <select
                            id="language"
                            name="language"
                            value={metaData.language}
                            onChange={handleInputChange}
                            className={styles.fullWidthInput}
                          >
                            <option value="en">English</option>
                            <option value="es">Spanish</option>
                            <option value="fr">French</option>
                            <option value="de">German</option>
                            <option value="it">Italian</option>
                            <option value="pt">Portuguese</option>
                            <option value="ru">Russian</option>
                            <option value="zh">Chinese</option>
                            <option value="ja">Japanese</option>
                            <option value="ar">Arabic</option>
                          </select>
                        </div>
                      </div>
                    </div>
                    
                    <div className={styles.formSection}>
                      <h3 className={styles.sectionHeading}>Social Media</h3>
                      
                      <div className={styles.inputGroup}>
                        <div className={styles.labelContainer}>
                          <label>Social Image <span className={styles.optionalLabel}>(optional)</span></label>
                          <div className={`${styles.fieldImportance} ${getFieldImportanceClass('image')}`}>Medium importance</div>
                        </div>
                        <div className={styles.imageInputGroup}>
                          <input
                            type="file"
                            id="image"
                            className={styles.fileInput}
                            accept="image/*"
                            onChange={handleImageChange}
                          />
                          <div className={styles.imageNote}>
                            <span>Recommended size: 1200x630 pixels</span>
                            <button type="button" className={styles.sampleImageButton} onClick={handleSampleImage}>
                              Use Sample Image
                            </button>
                          </div>
                        </div>
                        {metaData.image && (
                          <div className={styles.imagePreview}>
                            <img src={metaData.image} alt="Preview" />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Live preview section */}
              <div className={styles.previewSection}>
                <h3 className={styles.previewHeading}>Live Preview</h3>
                <div className={styles.previewContainer}>
                  <PreviewTabs
                    title={metaData.title || 'Your Page Title'}
                    description={metaData.description || 'Your page description will appear here. Make it compelling and informative.'}
                    url={metaData.url || 'https://example.com/page'}
                    image={metaData.image}
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'analysis' && (
            <Analysis metaData={metaData} />
          )}

          {activeTab === 'code' && (
            <div className={styles.codeContainer}>
              <div className={styles.codeHeader}>
                <h3>Generated Meta Tags</h3>
                <button 
                  className={styles.copyButton} 
                  onClick={copyToClipboard}
                  disabled={copied}
                >
                  {copied ? 'Copied!' : 'Copy to Clipboard'}
                </button>
              </div>
              {copyError && <div className={styles.copyError}>{copyError}</div>}
              <pre className={styles.codeBlock}>
                <code>{generateMetaCode()}</code>
              </pre>
              <div className={styles.implementationGuide}>
                <h4>How to Implement</h4>
                <p>
                  Copy the code above and paste it between the <code>&lt;head&gt;</code> and <code>&lt;/head&gt;</code> tags of your HTML document.
                </p>
                <div className={styles.implementationNote}>
                  <strong>Note:</strong> These meta tags replace any existing meta tags with the same attributes. Make sure to remove any duplicate tags.
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 