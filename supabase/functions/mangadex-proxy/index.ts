import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';

// Proxy for the MangaDex API to bypass browser CORS restrictions.
// Usage: GET /functions/v1/mangadex-proxy?path=/manga?limit=12&...
//   - `path` is the MangaDex API path + query string (URL-encoded once).
Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const path = url.searchParams.get('path');
    if (!path || !path.startsWith('/')) {
      return new Response(
        JSON.stringify({ error: 'Missing or invalid "path" query param (must start with /).' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    const target = `https://api.mangadex.org${path}`;
    const upstream = await fetch(target, {
      headers: {
        'User-Agent': 'lovable-mangadex-proxy/1.0',
        Accept: 'application/json',
      },
    });

    const body = await upstream.text();
    return new Response(body, {
      status: upstream.status,
      headers: {
        ...corsHeaders,
        'Content-Type': upstream.headers.get('content-type') ?? 'application/json',
        'Cache-Control': 'public, max-age=60',
      },
    });
  } catch (err) {
    return new Response(
      JSON.stringify({ error: 'Upstream fetch failed', detail: String(err) }),
      { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  }
});
