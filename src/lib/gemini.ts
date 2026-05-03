
/**
 * A proxy class for Gemini API that routes requests through the server-side proxy
 * This ensures API keys are hidden from the client and avoids CORS issues.
 */
export class ProxyGoogleGenAI {
  apiKey: string;
  
  constructor(options: { apiKey?: string } = {}) {
    this.apiKey = options.apiKey || '';
  }

  models = {
    generateContent: async (args: any) => {
      // Use relative path by default.
      // In development, this hits the Express server which proxies to Gemini.
      const apiUrl = import.meta.env.VITE_API_URL || '';
      const headers: Record<string, string> = { 
        'Content-Type': 'application/json'
      };
      
      if (this.apiKey) {
        // If profile has a custom key, pass it. 
        // Note: The server-side proxy handles the actual request to Google.
        headers['Authorization'] = `Bearer ${this.apiKey}`;
      }
      
      const endpoint = apiUrl 
        ? `${apiUrl.endsWith('/') ? apiUrl.slice(0, -1) : apiUrl}/api/gemini/generateContent` 
        : `${window.location.origin}/api/gemini/generateContent`;
      
      try {
        console.log(`[ProxyGoogleGenAI] Fetching from: ${endpoint}`);
        const resp = await fetch(endpoint, {
          method: 'POST',
          headers,
          body: JSON.stringify(args)
        });
        
        const contentType = resp.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
          const text = await resp.text();
          console.error(`[ProxyGoogleGenAI] Non-JSON response from server: ${text.substring(0, 100)}`);
          throw new Error('Server returned an invalid response (not JSON). Please check server logs.');
        }

        const data = await resp.json();
        if (!resp.ok) {
          console.error('[ProxyGoogleGenAI] Error response:', data);
          throw new Error(data.error || data.message || 'AI generation failed');
        }
        return data;
      } catch (error: any) {
        console.error('[ProxyGoogleGenAI] Fetch error:', error);
        if (error.message === 'Failed to fetch') {
          throw new Error('Connection to AI server failed. Please check if the server is running and accessible.');
        }
        throw error;
      }
    }
  };
}
