$f = 'e:\softstock\frontend\pages\01-response-index.html'
$c = Get-Content $f -Raw

# ── 1. CSS before </style> ──
$css = "
        .btn-purchase-idx { display:block; width:100%; margin-top:0.5rem; background:linear-gradient(135deg,#f0c040,#e0a800); color:#1a1a2e; border:none; padding:0.5rem; border-radius:7px; font-size:0.78rem; font-weight:700; cursor:pointer; font-family:'Inter',sans-serif; transition:opacity 0.2s; text-align:center; }
        .btn-purchase-idx:hover { opacity:0.88; }
        .btn-purchased-idx { display:block; width:100%; margin-top:0.5rem; background:rgba(0,200,100,0.12); color:#00c864; border:1px solid rgba(0,200,100,0.3); padding:0.5rem; border-radius:7px; font-size:0.78rem; font-weight:700; font-family:'Inter',sans-serif; text-align:center; cursor:default; }
        .btn-pending-idx  { display:block; width:100%; margin-top:0.5rem; background:rgba(240,192,64,0.1); color:#f0c040; border:1px solid rgba(240,192,64,0.3); padding:0.5rem; border-radius:7px; font-size:0.78rem; font-weight:700; font-family:'Inter',sans-serif; text-align:center; cursor:default; }
        #pmModal { display:none; position:fixed; inset:0; background:rgba(0,0,0,0.75); z-index:9999; align-items:center; justify-content:center; }
        #pmModal.open { display:flex; }
        .pm-box { background:#1c2128; border:1px solid rgba(255,255,255,0.08); border-radius:16px; padding:1.8rem; width:90%; max-width:400px; }
        .pm-title { font-size:1rem; font-weight:700; color:#f0c040; margin-bottom:1.2rem; }
        .pm-field { margin-bottom:1rem; }
        .pm-field label { display:block; font-size:0.72rem; color:#7d8590; font-weight:600; margin-bottom:0.35rem; }
        .pm-field input { width:100%; background:#0d1117; border:1px solid rgba(255,255,255,0.08); border-radius:7px; color:#e6edf3; padding:0.55rem 0.9rem; font-size:0.84rem; outline:none; }
        .pm-field input:focus { border-color:#f0c040; }
        .pm-field input[readonly] { opacity:0.6; cursor:default; }
        .pm-actions { display:flex; gap:0.7rem; margin-top:1.2rem; }
        .pm-submit { flex:1; background:#f0c040; color:#1a1a2e; border:none; padding:0.65rem; border-radius:8px; font-weight:700; cursor:pointer; font-size:0.88rem; }
        .pm-cancel { background:#161b22; color:#7d8590; border:1px solid rgba(255,255,255,0.08); padding:0.65rem 1rem; border-radius:8px; cursor:pointer; font-size:0.88rem; }
        #pmToast { position:fixed; bottom:1.5rem; right:1.5rem; background:#1c2128; border:1px solid rgba(255,255,255,0.08); border-radius:10px; padding:0.75rem 1.2rem; font-size:0.84rem; z-index:99999; opacity:0; transition:opacity 0.3s; pointer-events:none; color:#e6edf3; }
        #pmToast.show { opacity:1; }
"
$c = $c.Replace('</style>', $css + '</style>')

# ── 2. Purchase button on each card ──
# Banking
$c = $c.Replace(
    '<a href="Banking.html" class="btn-demo"><i class="fas fa-external-link-alt"></i> Live Demo</a>',
    '<a href="Banking.html" class="btn-demo"><i class="fas fa-external-link-alt"></i> Live Demo</a>' + "`n                        <button id=""pbtn-Aksh Finance"" class=""btn-purchase-idx"" onclick=""openPM('Aksh Finance',100)""><i class=""fas fa-shopping-cart""></i> Purchase Referral Pack</button>"
)
# iCall Messenger
$c = $c.Replace(
    '<a href="34-icalluser-messenger.html" class="btn-demo"><i class="fas fa-external-link-alt"></i> Live Demo</a>',
    '<a href="34-icalluser-messenger.html" class="btn-demo"><i class="fas fa-external-link-alt"></i> Live Demo</a>' + "`n                        <button id=""pbtn-iCall Messenger"" class=""btn-purchase-idx"" onclick=""openPM('iCall Messenger',300)""><i class=""fas fa-shopping-cart""></i> Purchase Referral Pack</button>"
)
# Analytics
$c = $c.Replace(
    '<a href="29-analytics_dashboard.html" class="btn-demo"><i class="fas fa-external-link-alt"></i> Live Demo</a>',
    '<a href="29-analytics_dashboard.html" class="btn-demo"><i class="fas fa-external-link-alt"></i> Live Demo</a>' + "`n                        <button id=""pbtn-Analytics Dashboard"" class=""btn-purchase-idx"" onclick=""openPM('Analytics Dashboard',200)""><i class=""fas fa-shopping-cart""></i> Purchase Referral Pack</button>"
)
# Cockroach AI
$c = $c.Replace(
    '<a href="42-robo.html" class="btn-demo"><i class="fas fa-external-link-alt"></i> Live Demo</a>',
    '<a href="42-robo.html" class="btn-demo"><i class="fas fa-external-link-alt"></i> Live Demo</a>' + "`n                        <button id=""pbtn-Cockroach AI"" class=""btn-purchase-idx"" onclick=""openPM('Cockroach AI',400)""><i class=""fas fa-shopping-cart""></i> Purchase Referral Pack</button>"
)

# ── 3. Modal HTML before </body> ──
$modal = "
    <div id=""pmModal"">
        <div class=""pm-box"">
            <div class=""pm-title"">🛒 Purchase Referral Pack — <span id=""pmName""></span></div>
            <div class=""pm-field"">
                <label>Your Name</label>
                <input type=""text"" id=""pmUserName"" placeholder=""Your full name"">
            </div>
            <div class=""pm-field"">
                <label>Referred By (Ref Code of person who referred you)</label>
                <input type=""text"" id=""pmRefBy"" placeholder=""e.g. REF123456"" autocomplete=""off"">
            </div>
            <div class=""pm-field"">
                <label>Transaction ID / UTR Number</label>
                <input type=""text"" id=""pmTxnId"" placeholder=""e.g. UTR123456789012"" autocomplete=""off"">
            </div>
            <div class=""pm-field"">
                <label>Plan Price</label>
                <input type=""text"" id=""pmPriceDisp"" readonly>
            </div>
            <div class=""pm-actions"">
                <button class=""pm-cancel"" onclick=""closePM()"">Cancel</button>
                <button class=""pm-submit"" onclick=""submitPM()"">Submit Request</button>
            </div>
        </div>
    </div>
    <div id=""pmToast""></div>
"
$c = $c.Replace('</body>', $modal + '</body>')

# ── 4. JS before </body> (already added modal above, add script) ──
$js = "
<script>
const _SURL = 'https://gkckyyyaoqsaouemjnxl.supabase.co';
const _SKEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdrY2t5eXlhb3FzYW91ZW1qbnhsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcyMzA3OTEsImV4cCI6MjA3MjgwNjc5MX0.0z5c-3P1fMSW2qiWg7IT3Oqv-65B3lZ8Lsq2aDvMYQk';
let _sb, _pmPlan = '', _pmPrice = 0;

function getSBIdx() {
    if (!_sb && window.supabase) _sb = window.supabase.createClient(_SURL, _SKEY);
    return _sb;
}

function openPM(plan, price) {
    _pmPlan = plan; _pmPrice = price;
    document.getElementById('pmName').textContent = plan + ' — Rs.' + price;
    document.getElementById('pmPriceDisp').value = 'Rs.' + price;
    document.getElementById('pmUserName').value = '';
    document.getElementById('pmRefBy').value = '';
    document.getElementById('pmTxnId').value = '';
    document.getElementById('pmModal').classList.add('open');
}

function closePM() { document.getElementById('pmModal').classList.remove('open'); }

async function submitPM() {
    const userName = document.getElementById('pmUserName').value.trim();
    const refBy    = document.getElementById('pmRefBy').value.trim();
    const txnId    = document.getElementById('pmTxnId').value.trim();
    if (!userName) { pmToast('Please enter your name'); return; }
    if (!refBy)    { pmToast('Please enter the referral code'); return; }
    if (!txnId)    { pmToast('Please enter Transaction ID / UTR'); return; }

    const sb = getSBIdx();
    if (!sb) { pmToast('Connection error. Try again.'); return; }

    const uid = localStorage.getItem('iamcalling_uid') || localStorage.getItem('uid') || ('guest_' + Date.now());

    const { error } = await sb.from('purchase_requests').insert({
        user_id: uid, user_name: userName,
        plan_name: _pmPlan, plan_price: _pmPrice,
        referred_by: refBy, txn_id: txnId, status: 'pending'
    });

    if (error) { pmToast('Error: ' + error.message); return; }
    closePM();
    pmToast('Request submitted! Admin will verify and approve.');
    const btn = document.getElementById('pbtn-' + _pmPlan);
    if (btn) { btn.className = 'btn-pending-idx'; btn.innerHTML = '⏳ Pending Approval'; btn.onclick = null; }
}

function pmToast(msg) {
    const t = document.getElementById('pmToast');
    t.textContent = msg; t.classList.add('show');
    setTimeout(() => t.classList.remove('show'), 3000);
}

// Check purchase status on load
async function checkPurchaseStatus() {
    const uid = localStorage.getItem('iamcalling_uid') || localStorage.getItem('uid');
    if (!uid) return;
    const sb = getSBIdx();
    if (!sb) return;
    const { data } = await sb.from('purchase_requests').select('plan_name,status').eq('user_id', uid);
    if (!data) return;
    data.forEach(r => {
        const btn = document.getElementById('pbtn-' + r.plan_name);
        if (!btn) return;
        if (r.status === 'approved') { btn.className = 'btn-purchased-idx'; btn.innerHTML = '✅ Purchased for Life'; btn.onclick = null; }
        else if (r.status === 'pending') { btn.className = 'btn-pending-idx'; btn.innerHTML = '⏳ Pending Approval'; btn.onclick = null; }
    });
}

document.addEventListener('DOMContentLoaded', checkPurchaseStatus);
</script>
"
$c = $c.Replace('</body>', $js + '</body>')

Set-Content $f -Value $c -NoNewline
Write-Host 'done'
