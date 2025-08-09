import type { APIRoute } from 'astro';
import axios from 'axios';

const MAX_URLS = 50; // Maximum number of URLs to process in bulk

export const post: APIRoute = async ({ request }) => {
  try {
    const { urls, userAgent } = await request.json();

    if (!Array.isArray(urls)) {
      return new Response(
        JSON.stringify({ error: 'Invalid request: urls must be an array' }),
        { status: 400 }
      );
    }

    if (urls.length > MAX_URLS) {
      return new Response(
        JSON.stringify({ error: `Maximum ${MAX_URLS} URLs allowed per request` }),
        { status: 400 }
      );
    }

    // Process URLs in parallel with a concurrency limit
    const results = await Promise.all(
      urls.map(async (url) => {
        try {
          const response = await axios.get(url, {
            maxRedirects: 10,
            validateStatus: null,
            headers: userAgent ? { 'User-Agent': userAgent } : undefined
          });

          return {
            url,
            finalUrl: response.request.res.responseUrl || url,
            statusCode: response.status,
            redirectChain: response.request.res.req._redirectable._redirects.map((r: any) => ({
              url: r.url,
              statusCode: r.statusCode
            }))
          };
        } catch (error: any) {
          return {
            url,
            error: error.message
          };
        }
      })
    );

    return new Response(JSON.stringify(results), {
      status: 200,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  } catch (error: any) {
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      { status: 500 }
    );
  }
}; 