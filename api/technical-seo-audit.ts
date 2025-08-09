import type { APIRoute } from 'astro';

/**
 * Combined Technical SEO Audit API endpoint
 * This endpoint proxies to individual technical SEO endpoints and combines their results
 */
export const POST: APIRoute = async ({ request }) => {
  try {
    const requestData = await request.json();
    const { url } = requestData;

    if (!url) {
      return new Response(JSON.stringify({ message: 'URL is required' }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json'
        }
      });
    }

    console.log(`[technical-seo-audit] Starting audit for URL: ${url}`);
    
    // Get the request origin to make absolute API calls
    const requestUrl = request.url;
    const origin = new URL(requestUrl).origin;
    
    // Call each API endpoint individually with absolute URLs
    const performancePromise = fetch(`${origin}/api/technical-seo/performance?url=${encodeURIComponent(url)}`)
      .then(async res => {
        if (!res.ok) {
          const text = await res.text();
          console.error(`[technical-seo-audit] Performance API error: ${res.status} ${res.statusText}`, text);
          return { error: `Performance API error: ${res.status} ${res.statusText}` };
        }
        return res.json();
      })
      .catch(err => {
        console.error(`[technical-seo-audit] Performance API exception:`, err);
        return { error: `Failed to fetch performance data: ${err.message}` };
      });

    const mobileFriendlyPromise = fetch(`${origin}/api/technical-seo/mobile-friendly?url=${encodeURIComponent(url)}`)
      .then(async res => {
        if (!res.ok) {
          const text = await res.text();
          console.error(`[technical-seo-audit] Mobile Friendly API error: ${res.status} ${res.statusText}`, text);
          return { error: `Mobile Friendly API error: ${res.status} ${res.statusText}` };
        }
        return res.json();
      })
      .catch(err => {
        console.error(`[technical-seo-audit] Mobile Friendly API exception:`, err);
        return { error: `Failed to fetch mobile-friendly data: ${err.message}` };
      });

    const crawlabilityPromise = fetch(`${origin}/api/technical-seo/crawlability?url=${encodeURIComponent(url)}`)
      .then(async res => {
        if (!res.ok) {
          const text = await res.text();
          console.error(`[technical-seo-audit] Crawlability API error: ${res.status} ${res.statusText}`, text);
          return { error: `Crawlability API error: ${res.status} ${res.statusText}` };
        }
        return res.json();
      })
      .catch(err => {
        console.error(`[technical-seo-audit] Crawlability API exception:`, err);
        return { error: `Failed to fetch crawlability data: ${err.message}` };
      });

    const securityPromise = fetch(`${origin}/api/technical-seo/security?url=${encodeURIComponent(url)}`)
      .then(async res => {
        if (!res.ok) {
          const text = await res.text();
          console.error(`[technical-seo-audit] Security API error: ${res.status} ${res.statusText}`, text);
          return { error: `Security API error: ${res.status} ${res.statusText}` };
        }
        return res.json();
      })
      .catch(err => {
        console.error(`[technical-seo-audit] Security API exception:`, err);
        return { error: `Failed to fetch security data: ${err.message}` };
      });

    // Run all requests in parallel
    console.log(`[technical-seo-audit] Waiting for all API responses...`);
    const [performance, mobileFriendly, crawlability, security] = await Promise.all([
      performancePromise,
      mobileFriendlyPromise,
      crawlabilityPromise,
      securityPromise
    ]);
    
    console.log(`[technical-seo-audit] All API responses received`, { 
      hasPerformance: !!performance, 
      hasMobileFriendly: !!mobileFriendly, 
      hasCrawlability: !!crawlability, 
      hasSecurity: !!security 
    });

    // Combine all results
    const result = {
      performance,
      mobileFriendly,
      crawlability,
      security,
      timestamp: Date.now(),
      url
    };

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    console.error('Technical SEO Audit failed:', error);
    return new Response(
      JSON.stringify({ 
        message: error instanceof Error ? error.message : 'An unexpected error occurred'
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
  }
}; 