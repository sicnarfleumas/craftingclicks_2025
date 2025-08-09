import type { APIRoute } from 'astro';
import axios from 'axios';

export const post: APIRoute = async ({ request }) => {
  try {
    const { url, userAgent } = await request.json();

    if (!url) {
      return new Response(
        JSON.stringify({ error: 'URL is required' }),
        { status: 400 }
      );
    }

    const response = await axios.get(url, {
      maxRedirects: 10,
      validateStatus: null,
      headers: userAgent ? { 'User-Agent': userAgent } : undefined
    });

    const result = {
      url,
      finalUrl: response.request.res.responseUrl || url,
      statusCode: response.status,
      redirectChain: response.request.res.req._redirectable._redirects.map((r: any) => ({
        url: r.url,
        statusCode: r.statusCode
      }))
    };

    return new Response(JSON.stringify(result), {
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