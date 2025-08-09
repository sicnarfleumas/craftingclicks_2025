import type { APIRoute } from 'astro';

export const GET: APIRoute = async ({ url }) => {
  const targetUrl = url.searchParams.get('url');
  const apiKey = import.meta.env.PUBLIC_GOOGLE_SAFE_BROWSING_API_KEY;

  if (!targetUrl) {
    return new Response(JSON.stringify({ error: 'URL parameter is required' }), {
      status: 400,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }

  try {
    // Parse the URL to get components
    const urlObj = new URL(targetUrl);
    const securityResults = {
      hasHttps: urlObj.protocol === 'https:',
      hasValidCert: false,
      hasMixedContent: false,
      hasSecurityHeaders: {
        contentSecurityPolicy: false,
        strictTransportSecurity: false,
        xContentTypeOptions: false,
        xFrameOptions: false,
        referrerPolicy: false,
        permissionsPolicy: false
      },
      securityScore: 0,
      threats: [] as string[],
      isSafe: true,
      recommendations: [] as string[]
    };

    // First try a simple DNS lookup to verify the domain exists
    try {
      const headResponse = await fetch(`${urlObj.protocol}//${urlObj.hostname}`, { 
        method: 'HEAD',
        redirect: 'follow'
      });
      
      // Check for HTTPS redirect
      if (urlObj.protocol === 'http:' && headResponse.url.startsWith('https://')) {
        securityResults.recommendations.push('Your site redirects to HTTPS, but users should access it directly via HTTPS.');
      }
      
      // Check security headers
      const headers = headResponse.headers;
      
      if (headers.get('content-security-policy')) {
        securityResults.hasSecurityHeaders.contentSecurityPolicy = true;
      } else {
        securityResults.recommendations.push('Implement Content-Security-Policy header to prevent XSS attacks.');
      }
      
      if (headers.get('strict-transport-security')) {
        securityResults.hasSecurityHeaders.strictTransportSecurity = true;
      } else if (urlObj.protocol === 'https:') {
        securityResults.recommendations.push('Implement Strict-Transport-Security header to enforce HTTPS.');
      }
      
      if (headers.get('x-content-type-options')) {
        securityResults.hasSecurityHeaders.xContentTypeOptions = true;
      } else {
        securityResults.recommendations.push('Add X-Content-Type-Options: nosniff header to prevent MIME type sniffing.');
      }
      
      if (headers.get('x-frame-options')) {
        securityResults.hasSecurityHeaders.xFrameOptions = true;
      } else {
        securityResults.recommendations.push('Implement X-Frame-Options header to prevent clickjacking.');
      }
      
      if (headers.get('referrer-policy')) {
        securityResults.hasSecurityHeaders.referrerPolicy = true;
      } else {
        securityResults.recommendations.push('Add Referrer-Policy header to control information in the Referer header.');
      }
      
      if (headers.get('permissions-policy') || headers.get('feature-policy')) {
        securityResults.hasSecurityHeaders.permissionsPolicy = true;
      } else {
        securityResults.recommendations.push('Implement Permissions-Policy to limit browser features.');
      }
      
      // Check for valid SSL certificate
      if (urlObj.protocol === 'https:') {
        securityResults.hasValidCert = true; // If we can fetch, cert is valid
      } else {
        securityResults.recommendations.push('Implement HTTPS to secure your website.');
      }
      
      // Check for mixed content by fetching the HTML
      if (urlObj.protocol === 'https:') {
        try {
          const pageResponse = await fetch(targetUrl);
          const html = await pageResponse.text();
          
          // Simple check for http: in src or href attributes
          const mixedContentRegex = /src=["']http:\/\/|href=["']http:\/\//i;
          securityResults.hasMixedContent = mixedContentRegex.test(html);
          
          if (securityResults.hasMixedContent) {
            securityResults.recommendations.push('Fix mixed content issues by ensuring all resources are loaded over HTTPS.');
          }
        } catch (e) {
          console.warn('Error checking for mixed content:', e);
        }
      }
    } catch (error) {
      securityResults.isSafe = false;
      securityResults.threats.push('Unable to reach domain');
      return new Response(JSON.stringify(securityResults), {
        status: 200,
        headers: {
          'Content-Type': 'application/json'
        }
      });
    }

    // Calculate security score
    let score = 0;
    if (securityResults.hasHttps) score += 30;
    if (securityResults.hasValidCert) score += 20;
    if (!securityResults.hasMixedContent) score += 10;
    
    // Add points for each security header
    Object.values(securityResults.hasSecurityHeaders).forEach(hasHeader => {
      if (hasHeader) score += 5;
    });
    
    securityResults.securityScore = Math.min(100, score);

    // If Safe Browsing API fails, we'll return our basic check result
    try {
      if (apiKey) {
        const response = await fetch(
          `https://safebrowsing.googleapis.com/v4/threatMatches:find?key=${apiKey}`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              client: {
                clientId: 'crafting-clicks',
                clientVersion: '1.0.0'
              },
              threatInfo: {
                threatTypes: [
                  'MALWARE',
                  'SOCIAL_ENGINEERING',
                  'UNWANTED_SOFTWARE',
                  'POTENTIALLY_HARMFUL_APPLICATION'
                ],
                platformTypes: ['ANY_PLATFORM'],
                threatEntryTypes: ['URL'],
                threatEntries: [{ url: targetUrl }]
              }
            })
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error?.message || 'Failed to fetch security data');
        }

        const threatDescriptions: Record<string, string> = {
          'MALWARE': 'The site contains malicious software that may harm your computer or steal information.',
          'SOCIAL_ENGINEERING': 'The site may trick users into revealing sensitive information.',
          'UNWANTED_SOFTWARE': 'The site contains software that may change your browsing experience without adequate disclosure.',
          'POTENTIALLY_HARMFUL_APPLICATION': 'The site contains applications that may compromise your device security.'
        };

        if (data.matches && data.matches.length > 0) {
          securityResults.isSafe = false;
          data.matches.forEach((match: any) => {
            securityResults.threats.push(match.threatType);
            securityResults.recommendations.push(`Remove ${match.threatType.toLowerCase()} from your site. ${threatDescriptions[match.threatType] || ''}`);
          });
        }
      } else {
        securityResults.recommendations.push('For a complete security check, configure the Google Safe Browsing API.');
      }
    } catch (error) {
      // If Safe Browsing API fails, we still have our basic check results
      console.warn('Safe Browsing API Error:', error);
      securityResults.recommendations.push('For a complete security check, ensure the Google Safe Browsing API is properly configured.');
    }

    return new Response(JSON.stringify(securityResults), {
      status: 200,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    console.error('Security Check Error:', error);
    return new Response(
      JSON.stringify({ 
        isSafe: true,
        threats: [],
        recommendations: ['Unable to perform full security check. Please verify the URL is correct.'],
        securityScore: 0
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
  }
}; 