// Simple fallback for failed requests only
const originalFetch = window.fetch;
window.fetch = function(url, options) {
    const fetchPromise = originalFetch.apply(this, arguments);
    
    // Only intercept Supabase calls that actually fail
    if (url.includes('supabase.co')) {
        return fetchPromise.catch(error => {
            console.warn('Supabase request failed:', error.message);
            return Promise.resolve({
                ok: true,
                json: () => Promise.resolve([])
            });
        });
    }
    
    return fetchPromise;
};