// ref-tracker.js
// Runs on any project demo page.
// When a client opens a referral link (?ref=IAM-XXX), records the visit
// in Supabase referrals table with status='pending'.
// Uses sessionStorage dedup so it only fires once per browser session per page.

(async function () {
    const params  = new URLSearchParams(window.location.search);
    const refCode = params.get('ref');
    const project = params.get('project') || document.title;
    const earn    = parseInt(params.get('earn') || '0', 10);

    if (!refCode) return;  // not a referral link — do nothing

    const dedupKey = 'ref_tracked_' + refCode + '_' + window.location.pathname;
    if (sessionStorage.getItem(dedupKey)) return;  // already recorded this session

    const SURL = 'https://gkckyyyaoqsaouemjnxl.supabase.co';
    const SKEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdrY2t5eXlhb3FzYW91ZW1qbnhsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcyMzA3OTEsImV4cCI6MjA3MjgwNjc5MX0.0z5c-3P1fMSW2qiWg7IT3Oqv-65B3lZ8Lsq2aDvMYQk';

    // Wait for Supabase CDN to load (max 5s)
    async function getSB() {
        if (window.supabaseClient) return window.supabaseClient;
        if (window.supabase?.createClient) {
            window.supabaseClient = window.supabase.createClient(SURL, SKEY);
            return window.supabaseClient;
        }
        return new Promise(resolve => {
            let tries = 0;
            const t = setInterval(() => {
                if (window.supabase?.createClient) {
                    window.supabaseClient = window.supabase.createClient(SURL, SKEY);
                    clearInterval(t);
                    resolve(window.supabaseClient);
                } else if (++tries > 25) {
                    clearInterval(t);
                    resolve(null);
                }
            }, 200);
        });
    }

    try {
        const sb = await getSB();
        if (!sb) return;

        // Find referrer's user id from their ref_code
        const { data: matchedUsers } = await sb
            .from('users')
            .select('id')
            .eq('ref_code', refCode)
            .limit(1);

        const referrerId = matchedUsers?.[0]?.id ?? null;

        const { error } = await sb.from('referrals').insert([{
            referrer_id:  referrerId,
            project_name: project,
            project_page: window.location.pathname,
            commission:   earn,
            ref_code:     refCode,
            status:       'pending'
        }]);

        if (!error) {
            sessionStorage.setItem(dedupKey, '1');
            console.log('✅ Referral visit recorded:', refCode, '→', project, '₹' + earn);
        }
    } catch (e) {
        console.warn('ref-tracker:', e);
    }
}());
