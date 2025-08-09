import type { APIRoute } from 'astro';

export const GET: APIRoute = async ({ url }) => {
  const targetUrl = url.searchParams.get('url');

  if (!targetUrl) {
    return new Response(JSON.stringify({ error: 'URL parameter is required' }), {
      status: 400,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }

  try {
    const targetUrlObj = new URL(targetUrl);
    const baseUrl = `${targetUrlObj.protocol}//${targetUrlObj.host}`;
    
    // Check robots.txt
    let robotsTxtExists = false;
    let disallowRules: string[] = [];
    let allowRules: string[] = [];
    let sitemapUrls: string[] = [];
    let robotsTxtContent = '';
    let userAgents: string[] = [];
    
    try {
      const robotsResponse = await fetch(`${baseUrl}/robots.txt`);
      if (robotsResponse.ok) {
        robotsTxtExists = true;
        robotsTxtContent = await robotsResponse.text();
        
        // Parse robots.txt for rules
        const lines = robotsTxtContent.split('\n');
        let currentUserAgent = '*';
        
        for (const line of lines) {
          const trimmedLine = line.trim().toLowerCase();
          
          if (trimmedLine.startsWith('user-agent:')) {
            currentUserAgent = trimmedLine.substring(11).trim();
            if (!userAgents.includes(currentUserAgent)) {
              userAgents.push(currentUserAgent);
            }
          } else if (trimmedLine.startsWith('disallow:')) {
            const rule = trimmedLine.substring(9).trim();
            if (rule) {
              disallowRules.push(`${currentUserAgent}: ${rule}`);
            }
          } else if (trimmedLine.startsWith('allow:')) {
            const rule = trimmedLine.substring(6).trim();
            if (rule) {
              allowRules.push(`${currentUserAgent}: ${rule}`);
            }
          } else if (trimmedLine.startsWith('sitemap:')) {
            // Get the raw value without lowercase conversion for the URL
            const sitemapUrl = line.substring(8).trim();
            if (sitemapUrl && !sitemapUrls.includes(sitemapUrl)) {
              sitemapUrls.push(sitemapUrl);
            }
          }
        }
      }
    } catch (error) {
      console.error('Error fetching robots.txt:', error);
    }

    // Sitemap type definitions
    type SitemapType = 'standard' | 'index' | 'news' | 'image' | 'video' | 'mobile' | 'hreflang' | 'unknown';
    
    // Interface for sitemap information
    interface SitemapInfo {
      url: string;
      type: SitemapType;
      urlCount: number;
      hasLastmod: boolean;
      hasPriority: boolean;
      hasChangefreq: boolean;
      isCompressed: boolean;
      size: number; // in bytes
      errors: string[];
      nested: string[];
    }
    
    // Check sitemaps
    let sitemapExists = false;
    let allSitemapUrls: string[] = [...sitemapUrls]; // Start with sitemaps from robots.txt
    let discoveredSitemapUrls: string[] = []; // Sitemaps discovered during the check
    let totalUrlCount = 0;
    let checkedSitemapUrls = new Set<string>(); // Track which sitemaps we've already checked
    const sitemapDetails: SitemapInfo[] = []; // Store detailed information about each sitemap
    
    // Common sitemap patterns to check if none found in robots.txt
    const commonSitemapPatterns = [
      '/sitemap.xml',
      '/sitemap_index.xml',
      '/sitemap-index.xml',
      '/sitemap-0.xml',
      '/sitemap_0.xml',
      '/sitemap-posts.xml',
      '/sitemap-pages.xml',
      '/sitemap-products.xml',
      '/sitemap-categories.xml',
      '/sitemap-news.xml',
      '/sitemap-video.xml',
      '/sitemap-image.xml',
      '/sitemap/sitemap.xml',
      '/wp-sitemap.xml', // WordPress
      '/sitemapindex.xml' // Magento and others
    ];
    
    // Identify sitemap type based on content
    function identifySitemapType(url: string, content: string): SitemapType {
      if (content.includes('<sitemapindex')) return 'index';
      if (content.includes('news:news') || url.includes('news-sitemap')) return 'news';
      if (content.includes('image:image') || url.includes('image-sitemap')) return 'image';
      if (content.includes('video:video') || url.includes('video-sitemap')) return 'video';
      if (content.includes('mobile:mobile') || url.includes('mobile-sitemap')) return 'mobile';
      if (content.includes('hreflang') || content.includes('alternate') && content.includes('hreflang')) return 'hreflang';
      if (content.includes('<urlset')) return 'standard';
      return 'unknown';
    }
    
    // Check for sitemap quality issues
    function analyzeSitemapQuality(content: string, type: SitemapType): string[] {
      const issues: string[] = [];
      
      // Check for XML syntax errors (basic check)
      if (!content.includes('<?xml') || !content.includes('</urlset>') && !content.includes('</sitemapindex>')) {
        issues.push('Potential XML syntax errors detected');
      }
      
      // Check if lastmod dates are present
      if (!content.includes('<lastmod>')) {
        issues.push('Missing lastmod dates');
      }
      
      // Check for very large sitemap
      if (content.length > 50 * 1024 * 1024) { // 50MB
        issues.push('Sitemap exceeds recommended 50MB size limit');
      }
      
      // Check URL count for standard sitemaps
      if (type === 'standard') {
        const urlCount = (content.match(/<url>/g) || []).length;
        if (urlCount > 50000) {
          issues.push('Exceeds 50,000 URL limit, consider splitting into multiple sitemaps');
        }
      }
      
      return issues;
    }
    
    // Generate improvement recommendations based on sitemap type
    function getSitemapImprovementRecommendations(info: SitemapInfo): string[] {
      const improvements: string[] = [];
      
      // Add recommendations based on sitemap type
      switch (info.type) {
        case 'standard':
          if (!info.hasLastmod) {
            improvements.push('Add lastmod dates to help search engines identify updated content');
          }
          if (!info.hasPriority || !info.hasChangefreq) {
            improvements.push('Consider adding priority and changefreq attributes for better crawl guidance');
          }
          break;
          
        case 'index':
          if (info.nested.length < 2) {
            improvements.push('Your sitemap index contains few child sitemaps. Consider organizing content into more specific sitemaps');
          }
          break;
          
        case 'news':
          if (!info.hasLastmod) {
            improvements.push('News sitemaps require lastmod dates for all entries');
          }
          improvements.push('Ensure news sitemaps contain articles published in the last 48 hours');
          break;
          
        case 'image':
          improvements.push('Ensure all images have descriptive captions and titles for better image SEO');
          break;
          
        case 'video':
          improvements.push('Add thumbnail, title, description and duration for all video entries');
          break;
          
        case 'hreflang':
          improvements.push('Ensure hreflang annotations correctly reference all language/region variants');
          break;
      }
      
      // Add general recommendations based on quality
      if (info.errors.length > 0) {
        improvements.push(`Fix detected issues: ${info.errors.join(', ')}`);
      }
      
      if (!info.isCompressed && info.size > 1024 * 1024) {
        improvements.push('Consider compressing your sitemap with gzip for faster processing');
      }
      
      return improvements;
    }
    
    // Function to check a specific sitemap URL
    async function checkSitemap(sitemapUrl: string): Promise<{
      exists: boolean;
      urlCount: number;
      nestedSitemaps: string[];
      info?: SitemapInfo;
    }> {
      if (checkedSitemapUrls.has(sitemapUrl)) {
        return { exists: true, urlCount: 0, nestedSitemaps: [] };
      }
      
      checkedSitemapUrls.add(sitemapUrl);
      let urlCount = 0;
      let nestedSitemaps: string[] = [];
      
      try {
        const response = await fetch(sitemapUrl);
        if (response.ok) {
          const text = await response.text();
          const contentSize = text.length;
          const isCompressed = response.headers.get('content-encoding') === 'gzip';
          
          // Count URLs in sitemap
          urlCount = (text.match(/<url>/g) || []).length;
          
          // Determine sitemap type
          const type = identifySitemapType(sitemapUrl, text);
          
          // Check for quality issues
          const qualityIssues = analyzeSitemapQuality(text, type);
          
          // Check for specific elements
          const hasLastmod = text.includes('<lastmod>');
          const hasPriority = text.includes('<priority>');
          const hasChangefreq = text.includes('<changefreq>');
          
          // Check if this is a sitemap index
          const sitemapIndexMatches = text.match(/<sitemap>[\s\S]*?<\/sitemap>/g) || [];
          for (const match of sitemapIndexMatches) {
            const locMatch = match.match(/<loc>(.*?)<\/loc>/);
            if (locMatch && locMatch[1]) {
              nestedSitemaps.push(locMatch[1]);
              if (!allSitemapUrls.includes(locMatch[1])) {
                allSitemapUrls.push(locMatch[1]);
              }
            }
          }
          
          // Create sitemap info
          const sitemapInfo: SitemapInfo = {
            url: sitemapUrl,
            type,
            urlCount,
            hasLastmod,
            hasPriority,
            hasChangefreq,
            isCompressed,
            size: contentSize,
            errors: qualityIssues,
            nested: nestedSitemaps
          };
          
          // Store the sitemap info
          sitemapDetails.push(sitemapInfo);
          
          return { 
            exists: true, 
            urlCount, 
            nestedSitemaps,
            info: sitemapInfo
          };
        }
      } catch (error) {
        console.error(`Error checking sitemap ${sitemapUrl}:`, error);
      }
      
      return { exists: false, urlCount: 0, nestedSitemaps: [] };
    }
    
    // Check sitemaps from robots.txt first
    if (sitemapUrls.length > 0) {
      for (const sitemapUrl of sitemapUrls) {
        const result = await checkSitemap(sitemapUrl);
        if (result.exists) {
          sitemapExists = true;
          totalUrlCount += result.urlCount;
          discoveredSitemapUrls.push(...result.nestedSitemaps);
        }
      }
    }
    
    // If no sitemaps found in robots.txt or no robots.txt, check common patterns
    if (!sitemapExists) {
      for (const pattern of commonSitemapPatterns) {
        const result = await checkSitemap(`${baseUrl}${pattern}`);
        if (result.exists) {
          sitemapExists = true;
          totalUrlCount += result.urlCount;
          discoveredSitemapUrls.push(...result.nestedSitemaps);
          allSitemapUrls.push(`${baseUrl}${pattern}`);
          break; // Stop checking patterns once we find a valid sitemap
        }
      }
    }
    
    // Check for numbered sitemap patterns if we found a main sitemap
    if (sitemapExists) {
      // Check for numbered sitemaps from 0-5 to avoid too many requests
      const numericPatterns = [
        { base: `${baseUrl}/sitemap-`, extension: '.xml' },
        { base: `${baseUrl}/sitemap_`, extension: '.xml' }
      ];
      
      for (const pattern of numericPatterns) {
        for (let i = 0; i <= 5; i++) {
          const numberedSitemapUrl = `${pattern.base}${i}${pattern.extension}`;
          // Only check if it's not already in our checked list
          if (!checkedSitemapUrls.has(numberedSitemapUrl)) {
            const result = await checkSitemap(numberedSitemapUrl);
            if (result.exists) {
              totalUrlCount += result.urlCount;
              discoveredSitemapUrls.push(...result.nestedSitemaps);
              allSitemapUrls.push(numberedSitemapUrl);
            } else {
              // If we don't find a sitemap at this number, stop incrementing
              break;
            }
          }
        }
      }
    }
    
    // Check nested sitemaps
    const checkedNested = new Set<string>();
    for (const nestedUrl of discoveredSitemapUrls) {
      if (!checkedNested.has(nestedUrl)) {
        checkedNested.add(nestedUrl);
        const result = await checkSitemap(nestedUrl);
        if (result.exists) {
          totalUrlCount += result.urlCount;
        }
      }
    }
    
    // Analyze sitemap structure and generate type-specific recommendations
    let sitemapTypeBreakdown: Record<SitemapType, number> = {
      'standard': 0,
      'index': 0, 
      'news': 0,
      'image': 0,
      'video': 0,
      'mobile': 0,
      'hreflang': 0,
      'unknown': 0
    };
    
    // Count sitemap types
    sitemapDetails.forEach(sitemap => {
      sitemapTypeBreakdown[sitemap.type]++;
    });
    
    // Generate type-specific improvement recommendations
    const sitemapImprovements: string[] = [];
    sitemapDetails.forEach(sitemap => {
      const improvements = getSitemapImprovementRecommendations(sitemap);
      sitemapImprovements.push(...improvements);
    });
    
    // Remove duplicate improvement recommendations
    const uniqueSitemapImprovements = [...new Set(sitemapImprovements)];

    // Generate recommendations based on findings
    const recommendations: string[] = [];
    
    if (!robotsTxtExists) {
      recommendations.push('Create a robots.txt file to guide search engine crawlers.');
    } else if (disallowRules.length === 0) {
      recommendations.push('Consider adding specific disallow rules to prevent crawling of non-essential pages.');
    }
    
    if (!sitemapExists) {
      recommendations.push('Create a sitemap.xml file to help search engines discover your content.');
    } else if (totalUrlCount < 10 && discoveredSitemapUrls.length === 0) {
      recommendations.push('Your sitemap contains few URLs. Make sure all important pages are included.');
    }
    
    if (sitemapExists && robotsTxtExists && !sitemapUrls.length) {
      recommendations.push('Add your sitemap URL to your robots.txt file for better discovery.');
    }
    
    // Add sitemap-specific recommendations
    recommendations.push(...uniqueSitemapImprovements);
    
    // Check for commonly missing sitemap types
    if (sitemapExists) {
      if (sitemapTypeBreakdown.image === 0) {
        recommendations.push('Consider adding an image sitemap if your site contains important images.');
      }
      if (sitemapTypeBreakdown.news === 0 && sitemapDetails.some(s => s.url.includes('blog') || s.url.includes('news'))) {
        recommendations.push('Consider adding a news sitemap for timely content like blog posts or news articles.');
      }
      if (sitemapTypeBreakdown.hreflang === 0 && userAgents.some(ua => ua.includes('googlebot-mobile'))) {
        recommendations.push('Consider adding hreflang annotations if your site targets multiple languages or regions.');
      }
    }

    // Check for canonical URL
    let hasCanonical = false;
    let canonicalUrl = '';
    
    try {
      const pageResponse = await fetch(targetUrl);
      if (pageResponse.ok) {
        const pageText = await pageResponse.text();
        const canonicalMatch = pageText.match(/<link[^>]*rel=["']canonical["'][^>]*href=["']([^"']*)["'][^>]*>/i);
        if (canonicalMatch && canonicalMatch[1]) {
          hasCanonical = true;
          canonicalUrl = canonicalMatch[1];
        }
      }
    } catch (error) {
      console.error('Error checking canonical URL:', error);
    }
    
    if (!hasCanonical) {
      recommendations.push('Add canonical tags to prevent duplicate content issues.');
    }

    const result = {
      robotsTxtExists,
      disallowRules,
      allowRules,
      sitemapExists,
      sitemapUrls: allSitemapUrls,
      urlCount: totalUrlCount,
      hasCanonical,
      canonicalUrl,
      userAgents,
      recommendations,
      sitemapDetails: sitemapDetails.map(sitemap => ({
        url: sitemap.url,
        type: sitemap.type,
        urlCount: sitemap.urlCount,
        hasLastmod: sitemap.hasLastmod,
        errors: sitemap.errors,
        improvements: getSitemapImprovementRecommendations(sitemap)
      })),
      sitemapTypeBreakdown,
      crawlabilityScore: calculateCrawlabilityScore({
        robotsTxtExists,
        sitemapExists,
        hasCanonical,
        hasSitemapInRobots: sitemapUrls.length > 0,
        sitemapUrlCount: allSitemapUrls.length,
        totalUrlCount,
        sitemapTypes: Object.keys(sitemapTypeBreakdown).filter(
          type => sitemapTypeBreakdown[type as SitemapType] > 0
        ).length
      })
    };

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    console.error('Crawlability Check Error:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to check crawlability' }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
  }
};

function calculateCrawlabilityScore(data: {
  robotsTxtExists: boolean;
  sitemapExists: boolean;
  hasCanonical: boolean;
  hasSitemapInRobots: boolean;
  sitemapUrlCount?: number;
  totalUrlCount?: number;
  sitemapTypes?: number;
}): number {
  let score = 0;
  
  if (data.robotsTxtExists) score += 25;
  if (data.sitemapExists) score += 25;
  if (data.hasCanonical) score += 15;
  if (data.hasSitemapInRobots) score += 10;
  
  // Bonus points for multiple sitemaps and good URL count
  if (data.sitemapUrlCount && data.sitemapUrlCount > 1) {
    score += Math.min(5, data.sitemapUrlCount);
  }
  
  if (data.totalUrlCount && data.totalUrlCount > 50) {
    score += 5;
  }
  
  // Bonus for diverse sitemap types
  if (data.sitemapTypes && data.sitemapTypes > 1) {
    score += Math.min(15, data.sitemapTypes * 3);
  }
  
  return Math.min(100, score);
} 