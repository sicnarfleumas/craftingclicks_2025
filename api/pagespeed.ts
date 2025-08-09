import type { APIRoute } from 'astro';
import axios from 'axios';

const PAGESPEED_API_KEY = import.meta.env.PAGESPEED_API_KEY;

export const post: APIRoute = async ({ request }) => {
  try {
    const { url, strategy = 'mobile' } = await request.json();

    if (!url) {
      return new Response(
        JSON.stringify({ error: 'URL is required' }),
        { status: 400 }
      );
    }

    if (!PAGESPEED_API_KEY) {
      return new Response(
        JSON.stringify({ error: 'PageSpeed API key is not configured' }),
        { status: 500 }
      );
    }

    const response = await axios.get(
      'https://www.googleapis.com/pagespeedonline/v5/runPagespeed',
      {
        params: {
          url,
          key: PAGESPEED_API_KEY,
          strategy
        }
      }
    );

    return new Response(JSON.stringify(response.data), {
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