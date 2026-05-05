
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
      // Use absolute URL from origin to ensure it hits the right place regardless of path depth
      const origin = typeof window !== 'undefined' ? window.location.origin : '';
      const apiUrl = import.meta.env.VITE_API_URL || origin;
      
      const headers: Record<string, string> = { 
        'Content-Type': 'application/json'
      };
      
      if (this.apiKey) {
        headers['Authorization'] = `Bearer ${this.apiKey}`;
      }
      
      // Ensure no double slashes and correct path
      const baseApiUrl = apiUrl.endsWith('/') ? apiUrl.slice(0, -1) : apiUrl;
      const endpoint = `${baseApiUrl}/api/gemini/generateContent`;
      
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
          console.error(`[ProxyGoogleGenAI] Non-JSON response (Status ${resp.status}):`, text.substring(0, 200));
          throw new Error(`Server returned invalid response (${resp.status}). If you are on a personal domain, ensure /api/ routes are correctly forwarded to the backend.`);
        }

        const data = await resp.json();
        if (!resp.ok) {
          console.error('[ProxyGoogleGenAI] API Error:', data);
          throw new Error(data.error || data.message || `AI Error (${resp.status})`);
        }
        return data;
      } catch (error: any) {
        console.error('[ProxyGoogleGenAI] Request failed:', error);
        throw error;
      }
    }
  };
}
