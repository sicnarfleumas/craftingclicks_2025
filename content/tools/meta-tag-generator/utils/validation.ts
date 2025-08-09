import { willBeTruncated } from './pixelWidth';

interface ValidationResult {
  isValid: boolean;
  message: string;
  type: 'success' | 'warning' | 'error';
}

interface MetaTagValidation {
  title: ValidationResult[];
  description: ValidationResult[];
  keywords: ValidationResult[];
}

/**
 * Validate meta title
 */
export function validateTitle(title: string, keywords: string): ValidationResult[] {
  const results: ValidationResult[] = [];
  
  // Length validation
  if (title.length === 0) {
    results.push({
      isValid: false,
      message: 'Meta title is required',
      type: 'error'
    });
  } else if (title.length < 50) {
    results.push({
      isValid: false,
      message: 'Meta title is too short (minimum 50 characters recommended)',
      type: 'warning'
    });
  } else if (title.length > 60) {
    results.push({
      isValid: false,
      message: 'Meta title is too long (maximum 60 characters recommended)',
      type: 'warning'
    });
  } else {
    results.push({
      isValid: true,
      message: 'Meta title length is optimal',
      type: 'success'
    });
  }
  
  // Truncation check
  if (willBeTruncated(title, 'title')) {
    results.push({
      isValid: false,
      message: 'Title may be truncated in search results',
      type: 'warning'
    });
  }
  
  // Keyword usage
  if (keywords) {
    const keywordList = keywords.split(',').map(k => k.trim().toLowerCase());
    const titleLower = title.toLowerCase();
    
    const hasKeyword = keywordList.some(keyword => titleLower.includes(keyword));
    if (!hasKeyword) {
      results.push({
        isValid: false,
        message: 'Title does not contain any focus keywords',
        type: 'warning'
      });
    } else {
      results.push({
        isValid: true,
        message: 'Title contains focus keywords',
        type: 'success'
      });
    }
  }
  
  return results;
}

/**
 * Validate meta description
 */
export function validateDescription(description: string, keywords: string): ValidationResult[] {
  const results: ValidationResult[] = [];
  
  // Length validation
  if (description.length === 0) {
    results.push({
      isValid: false,
      message: 'Meta description is required',
      type: 'error'
    });
  } else if (description.length < 150) {
    results.push({
      isValid: false,
      message: 'Meta description is too short (minimum 150 characters recommended)',
      type: 'warning'
    });
  } else if (description.length > 160) {
    results.push({
      isValid: false,
      message: 'Meta description is too long (maximum 160 characters recommended)',
      type: 'warning'
    });
  } else {
    results.push({
      isValid: true,
      message: 'Meta description length is optimal',
      type: 'success'
    });
  }
  
  // Truncation check
  if (willBeTruncated(description, 'description')) {
    results.push({
      isValid: false,
      message: 'Description may be truncated in search results',
      type: 'warning'
    });
  }
  
  // Keyword usage
  if (keywords) {
    const keywordList = keywords.split(',').map(k => k.trim().toLowerCase());
    const descriptionLower = description.toLowerCase();
    
    const hasKeyword = keywordList.some(keyword => descriptionLower.includes(keyword));
    if (!hasKeyword) {
      results.push({
        isValid: false,
        message: 'Description does not contain any focus keywords',
        type: 'warning'
      });
    } else {
      results.push({
        isValid: true,
        message: 'Description contains focus keywords',
        type: 'success'
      });
    }
  }
  
  // Call to action check
  const ctaPatterns = [
    'learn more',
    'read more',
    'discover',
    'find out',
    'get',
    'shop',
    'buy',
    'order',
    'download',
    'sign up',
    'register',
    'contact'
  ];
  
  const hasCallToAction = ctaPatterns.some(cta => 
    description.toLowerCase().includes(cta)
  );
  
  if (!hasCallToAction) {
    results.push({
      isValid: false,
      message: 'Consider adding a call-to-action phrase',
      type: 'warning'
    });
  } else {
    results.push({
      isValid: true,
      message: 'Description includes a call-to-action',
      type: 'success'
    });
  }
  
  return results;
}

/**
 * Validate keywords
 */
export function validateKeywords(keywords: string): ValidationResult[] {
  const results: ValidationResult[] = [];
  
  if (!keywords) {
    results.push({
      isValid: false,
      message: 'Focus keywords are recommended',
      type: 'warning'
    });
    return results;
  }
  
  const keywordList = keywords.split(',').map(k => k.trim());
  
  // Check keyword count
  if (keywordList.length > 5) {
    results.push({
      isValid: false,
      message: 'Too many focus keywords (maximum 5 recommended)',
      type: 'warning'
    });
  }
  
  // Check keyword length
  keywordList.forEach(keyword => {
    if (keyword.length < 3) {
      results.push({
        isValid: false,
        message: `Keyword "${keyword}" is too short`,
        type: 'warning'
      });
    }
  });
  
  // Check for duplicates
  const uniqueKeywords = new Set(keywordList);
  if (uniqueKeywords.size !== keywordList.length) {
    results.push({
      isValid: false,
      message: 'Duplicate keywords found',
      type: 'warning'
    });
  }
  
  return results;
}

/**
 * Validate all meta tags
 */
export function validateMetaTags(
  title: string,
  description: string,
  keywords: string
): MetaTagValidation {
  return {
    title: validateTitle(title, keywords),
    description: validateDescription(description, keywords),
    keywords: validateKeywords(keywords)
  };
} 