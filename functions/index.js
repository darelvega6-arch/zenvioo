import { uploadImage } from './upload-image.js';
import { uploadNote } from './upload-note.js';
import { getStories } from './get-stories.js';
import { getNotes } from './get-notes.js';

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname;

    // CORS headers
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    try {
      let response;

      switch (path) {
        case '/upload-image':
          response = await uploadImage(request, env);
          break;
        case '/upload-note':
          response = await uploadNote(request, env);
          break;
        case '/get-stories':
          response = await getStories(request, env);
          break;
        case '/get-notes':
          response = await getNotes(request, env);
          break;
        default:
          response = new Response('Not Found', { status: 404 });
      }

      // Add CORS headers to response
      Object.keys(corsHeaders).forEach(key => {
        response.headers.set(key, corsHeaders[key]);
      });

      return response;
    } catch (error) {
      console.error('Error:', error);
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
  }
};
