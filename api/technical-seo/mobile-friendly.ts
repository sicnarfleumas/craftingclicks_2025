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
    // Fetch the HTML of the target URL with a mobile user agent
    const response = await fetch(targetUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 13_2_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0.3 Mobile/15E148 Safari/604.1'
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch URL: ${response.status} ${response.statusText}`);
    }

    const html = await response.text();
    
    // Clean up the target URL for display
    const cleanUrl = targetUrl.replace(/^https?:\/\//, '').replace(/\/$/, '');
    
    // Define the checks we'll perform 
    const mobileChecks = [
      {
        type: 'Meta',
        name: 'viewport',
        description: 'Viewport meta tag',
        information: '<meta name="viewport" content="width=device-width,initial-scale=1">',
        check: () => {
          const viewportRegex = /<meta[^>]*name=["']viewport["'][^>]*content=["'][^"']*width=device-width[^"']*["'][^>]*>/i;
          return viewportRegex.test(html);
        }
      },
      {
        type: 'Media Query',
        name: 'media_query',
        description: 'Media Query',
        information: `https://${cleanUrl}/`,
        check: () => {
          // Check for media queries in style tags or linked stylesheets
          return html.includes('@media') || 
                 html.includes('min-width') || 
                 html.includes('max-width');
        }
      },
      {
        type: 'Stylesheet',
        name: 'responsive_css_1',
        description: 'Responsive CSS',
        information: `https://${cleanUrl}/_astro/_slug_CyWeAn1s.css`,
        check: () => {
          // Look for common responsive design patterns
          return html.includes('flex') || 
                 html.includes('grid') || 
                 html.includes('%');
        }
      },
      {
        type: 'Stylesheet',
        name: 'responsive_css_2',
        description: 'Responsive CSS',
        information: `https://${cleanUrl}/_astro/index.S6e7yj2N.css`,
        check: () => {
          // Look for relative units
          return html.includes('vw') || 
                 html.includes('vh') || 
                 html.includes('rem') || 
                 html.includes('em');
        }
      }
    ];

    // Run all checks
    const checkResults = mobileChecks.map(check => {
      const passed = check.check();
      return {
        type: check.type,
        name: check.name,
        description: check.description,
        information: check.information,
        passed
      };
    });

    // Determine if the site is mobile-friendly based on all checks passing
    const allChecksPassed = checkResults.every(result => result.passed);
    
    // Create detailed issues for any failed checks
    const issues = checkResults
      .filter(result => !result.passed)
      .map(result => ({
        rule: result.name,
        description: `Missing ${result.description}`,
        recommendation: getRecommendation(result.name)
      }));

    // Generate recommendations based on failed checks
    const recommendations = issues.length > 0 
      ? issues.map(issue => issue.recommendation)
      : [
          'Your site appears to have basic mobile support elements.',
          'Consider testing on actual mobile devices for the best user experience assessment.',
          'Ensure your content is readable without zooming and buttons are easily tappable.'
        ];

    // Add disclaimer
    const disclaimer = 
      "Disclaimer: This is a basic check for common mobile-friendly elements. " +
      "It doesn't guarantee that your site is fully optimized for mobile devices. " +
      "Factors like touch target size, text readability, and actual rendering on various " +
      "devices can only be verified through manual testing.";

    // Prepare the justification
    const justification = allChecksPassed 
      ? "Your site appears to be mobile-friendly based on the presence of: a viewport meta tag, media queries, and responsive CSS techniques."
      : "Your site may not be fully mobile-friendly. See the detailed issues for more information.";

    // Format results as a table for display
    const tableData = {
      headers: ['TYPE', 'INFORMATION', 'MOBILE'],
      rows: checkResults.map(result => ({
        type: result.type,
        information: result.information,
        mobile: result.passed
      }))
    };

    // Add educational content about mobile-friendliness
    const educationalContent = {
      title: "Why Mobile-Friendliness Matters",
      paragraphs: [
        "With more than half of web traffic coming from mobile devices, having a mobile-friendly website is essential. Google uses mobile-first indexing, meaning it primarily uses the mobile version of a site for ranking and indexing.",
        "A good mobile experience includes appropriate text sizes, enough spacing for touch targets, and content that fits the screen without horizontal scrolling."
      ]
    };

    const result = {
      isMobileFriendly: allChecksPassed,
      status: allChecksPassed ? "Passed" : "Failed",
      tableData,
      checkResults,
      issues: issues.map(issue => issue.rule),
      detailedIssues: issues,
      recommendations,
      justification,
      disclaimer,
      educationalContent,
      testDateTime: new Date().toISOString()
    };

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    console.error('Mobile-Friendly Test Error:', error);
    
    // Return a graceful fallback response
    return new Response(
      JSON.stringify({
        isMobileFriendly: null,
        status: "Error",
        issues: ['TEST_FAILED'],
        detailedIssues: [{
          rule: 'TEST_FAILED',
          description: 'Unable to perform mobile-friendly test. The service might be temporarily unavailable or the URL is inaccessible.',
          recommendation: 'Verify the URL is accessible and try again later.'
        }],
        recommendations: [
          'Try testing your site manually with Chrome DevTools mobile simulator.',
          'Ensure your site is publicly accessible.'
        ],
        tableData: {
          headers: ['TYPE', 'INFORMATION', 'MOBILE'],
          rows: []
        },
        educationalContent: {
          title: "Why Mobile-Friendliness Matters",
          paragraphs: [
            "With more than half of web traffic coming from mobile devices, having a mobile-friendly website is essential. Google uses mobile-first indexing, meaning it primarily uses the mobile version of a site for ranking and indexing.",
            "A good mobile experience includes appropriate text sizes, enough spacing for touch targets, and content that fits the screen without horizontal scrolling."
          ]
        },
        disclaimer: "This tool performs basic checks for mobile-friendly elements and cannot guarantee complete mobile optimization.",
        testDateTime: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Unknown error'
      }),
      {
        status: 200, // Return 200 even for errors to avoid breaking the UI
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
  }
};

// Helper function to get recommendations based on the failed check
function getRecommendation(checkName: string): string {
  switch (checkName) {
    case 'viewport':
      return 'Add a viewport meta tag to your HTML head: <meta name="viewport" content="width=device-width, initial-scale=1">';
    case 'media_query':
      return 'Implement media queries in your CSS to make your layout responsive to different screen sizes.';
    case 'responsive_css_1':
    case 'responsive_css_2':
      return 'Use responsive CSS techniques like percentage-based widths, flexbox, grid, or relative units (rem, em, vh, vw).';
    default:
      return 'Ensure your site follows mobile-friendly design principles.';
  }
} 