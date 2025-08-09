import type { APIRoute } from 'astro';

export const GET: APIRoute = async ({ url }) => {
  const targetUrl = url.searchParams.get('url');
  const apiKey = import.meta.env.PUBLIC_GOOGLE_PAGESPEED_API_KEY;

  if (!targetUrl) {
    return new Response(JSON.stringify({ error: 'URL parameter is required' }), {
      status: 400,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }

  try {
    const response = await fetch(
      `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(targetUrl)}&key=${apiKey}&strategy=mobile&category=performance`
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error?.message || 'Failed to fetch performance data');
    }

    // Extract Core Web Vitals and other important metrics
    const audits = data.lighthouseResult.audits;
    const lcpValue = audits['largest-contentful-paint'].numericValue / 1000;
    const clsValue = audits['cumulative-layout-shift'].numericValue;
    const fidValue = audits['total-blocking-time'].numericValue;
    const ttfbValue = audits['server-response-time'].numericValue / 1000;
    const speedIndexValue = audits['speed-index'].numericValue / 1000;
    
    // Get detailed recommendations with impact values
    const opportunities = Object.values(audits)
      .filter((audit: any) => 
        audit.details?.type === 'opportunity' && 
        typeof audit.numericValue === 'number' && 
        audit.score < 0.9
      )
      .map((audit: any) => ({
        title: audit.title,
        description: audit.description,
        impact: audit.numericValue,
        score: audit.score,
        url: audit.details?.items?.[0]?.url || null
      }))
      .sort((a: any, b: any) => b.impact - a.impact)
      .slice(0, 5);
    
    // Get diagnostics for additional insights
    const diagnostics = Object.values(audits)
      .filter((audit: any) => 
        audit.details?.type === 'diagnostic' && 
        audit.score < 0.9
      )
      .map((audit: any) => ({
        title: audit.title,
        description: audit.description
      }))
      .slice(0, 3);

    // Get passed audits for positive feedback
    const passedAudits = Object.values(audits)
      .filter((audit: any) => audit.score >= 0.9)
      .map((audit: any) => audit.title)
      .slice(0, 3);

    const result = {
      score: Math.round(data.lighthouseResult.categories.performance.score * 100),
      lcp: lcpValue,
      cls: clsValue,
      fid: fidValue,
      ttfb: ttfbValue,
      speedIndex: speedIndexValue,
      recommendations: opportunities.map((opp: any) => opp.title),
      detailedRecommendations: opportunities,
      diagnostics: diagnostics,
      passedAudits: passedAudits,
      metrics: {
        firstContentfulPaint: audits['first-contentful-paint'].numericValue / 1000,
        interactive: audits['interactive'].numericValue / 1000,
        totalBlockingTime: fidValue,
        cumulativeLayoutShift: clsValue,
        largestContentfulPaint: lcpValue
      }
    };

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    console.error('Performance API Error:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to fetch performance data' }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
  }
}; 