$f = 'e:\softstock\frontend\pages\18-profile.html'
$c = Get-Content $f -Raw

# ── 1. CSS ──
$css = "
        .btn-purchase { width:100%; background:linear-gradient(135deg,#f0c040,#e0a800); color:#1a1a2e; border:none; padding:0.5rem 0.9rem; border-radius:7px; font-size:0.78rem; font-weight:700; cursor:pointer; font-family:'Inter',sans-serif; transition:opacity 0.2s; }
        .btn-purchase:hover { opacity:0.88; }
        .btn-purchased { width:100%; background:rgba(0,200,100,0.12); color:#00c864; border:1px solid rgba(0,200,100,0.3); padding:0.5rem 0.9rem; border-radius:7px; font-size:0.78rem; font-weight:700; font-family:'Inter',sans-serif; cursor:default; }
        .btn-pending { width:100%; background:rgba(240,192,64,0.1); color:var(--gold); border:1px solid rgba(240,192,64,0.3); padding:0.5rem 0.9rem; border-radius:7px; font-size:0.78rem; font-weight:700; font-family:'Inter',sans-serif; cursor:default; }
        #purchaseModal { display:none; position:fixed; inset:0; background:rgba(0,0,0,0.7); z-index:9999; align-items:center; justify-content:center; }
        #purchaseModal.open { display:flex; }
        .pm-box { background:var(--card); border:1px solid var(--border); border-radius:16px; padding:1.8rem; width:90%; max-width:420px; }
        .pm-title { font-size:1rem; font-weight:700; color:var(--gold); margin-bottom:1.2rem; }
        .pm-field { margin-bottom:1rem; }
        .pm-field label { display:block; font-size:0.72rem; color:var(--muted); font-weight:600; margin-bottom:0.35rem; }
        .pm-field input { width:100%; background:var(--bg2); border:1px solid var(--border); border-radius:7px; color:var(--text); padding:0.55rem 0.9rem; font-size:0.84rem; font-family:'Fira Code',monospace; outline:none; }
        .pm-field input:focus { border-color:var(--gold); }
        .pm-actions { display:flex; gap:0.7rem; margin-top:1.2rem; }
        .pm-submit { flex:1; background:var(--gold); color:#1a1a2e; border:none; padding:0.65rem; border-radius:8px; font-weight:700; cursor:pointer; font-size:0.88rem; }
        .pm-cancel { background:var(--bg2); color:var(--muted); border:1px solid var(--border); padding:0.65rem 1rem; border-radius:8px; cursor:pointer; font-size:0.88rem; }
"
$c = $c.Replace('        .btn-refer-sm.gold {', $css + '        .btn-refer-sm.gold {')

# ── 2. Purchase button on each card footer ──
$c = $c.Replace(
    "<button class=`"btn-refer-sm`" onclick=`"referProject('Aksh Finance', 100, 'Banking.html')`"><i class=`"fas fa-share-alt`"></i> Copy Referral Link</button>",
    "<button class=`"btn-refer-sm`" onclick=`"referProject('Aksh Finance', 100, 'Banking.html')`"><i class=`"fas fa-share-alt`"></i> Copy Referral Link</button>`n                    <button id=`"pbtn-Aksh Finance`" class=`"btn-purchase`" onclick=`"openPurchaseModal('Aksh Finance',100)`"><i class=`"fas fa-shopping-cart`"></i> Purchase Pack</button>"
)
$c = $c.Replace(
    "<button class=`"btn-refer-sm`" onclick=`"referProject('Analytics Dashboard', 200, '29-analytics_dashboard.html')`"><i class=`"fas fa-share-alt`"></i> Copy Referral Link</button>",
    "<button class=`"btn-refer-sm`" onclick=`"referProject('Analytics Dashboard', 200, '29-analytics_dashboard.html')`"><i class=`"fas fa-share-alt`"></i> Copy Referral Link</button>`n                    <button id=`"pbtn-Analytics Dashboard`" class=`"btn-purchase`" onclick=`"openPurchaseModal('Analytics Dashboard',200)`"><i class=`"fas fa-shopping-cart`"></i> Purchase Pack</button>"
)
$c = $c.Replace(
    "<button class=`"btn-refer-sm`" onclick=`"referProject('iCall Messenger', 300, '34-icalluser-messenger.html')`"><i class=`"fas fa-share-alt`"></i> Copy Referral Link</button>",
    "<button class=`"btn-refer-sm`" onclick=`"referProject('iCall Messenger', 300, '34-icalluser-messenger.html')`"><i class=`"fas fa-share-alt`"></i> Copy Referral Link</button>`n                    <button id=`"pbtn-iCall Messenger`" class=`"btn-purchase`" onclick=`"openPurchaseModal('iCall Messenger',300)`"><i class=`"fas fa-shopping-cart`"></i> Purchase Pack</button>"
)
$c = $c.Replace(
    "<button class=`"btn-refer-sm`" onclick=`"referProject('Cockroach AI', 400, '42-robo.html')`"><i class=`"fas fa-share-alt`"></i> Copy Referral Link</button>",
    "<button class=`"btn-refer-sm`" onclick=`"referProject('Cockroach AI', 400, '42-robo.html')`"><i class=`"fas fa-share-alt`"></i> Copy Referral Link</button>`n                    <button id=`"pbtn-Cockroach AI`" class=`"btn-purchase`" onclick=`"openPurchaseModal('Cockroach AI',400)`"><i class=`"fas fa-shopping-cart`"></i> Purchase Pack</button>"
)
$c = $c.Replace(
    "<button class=`"btn-refer-sm gold`" onclick=`"referProject('IAMCALLING Platform', 500, '01-response-index.html')`"><i class=`"fas fa-share-alt`"></i> Copy Referral Link</button>",
    "<button class=`"btn-refer-sm gold`" onclick=`"referProject('IAMCALLING Platform', 500, '01-response-index.html')`"><i class=`"fas fa-share-alt`"></i> Copy Referral Link</button>`n                    <button id=`"pbtn-IAMCALLING Platform`" class=`"btn-purchase`" onclick=`"openPurchaseModal('IAMCALLING Platform',500)`"><i class=`"fas fa-shopping-cart`"></i> Purchase Pack</button>"
)

# ── 3. Purchase Modal HTML before </body> ──
$modal = "
    <!-- PURCHASE MODAL -->
    <div id=`"purchaseModal`">
        <div class=`"pm-box`">
            <div class=`"pm-title`">🛒 Purchase Pack — <span id=`"pmPlanName`"></span></div>
            <div class=`"pm-field`">
                <label>Referred By (Referral Code of person who referred you)</label>
                <input type=`"text`" id=`"pmRefBy`" placeholder=`"e.g. REF123456`" autocomplete=`"off`">
            </div>
            <div class=`"pm-field`">
                <label>Transaction ID / UTR Number</label>
                <input type=`"text`" id=`"pmTxnId`" placeholder=`"e.g. UTR123456789012`" autocomplete=`"off`">
            </div>
            <div class=`"pm-field`">
                <label>Plan Price</label>
                <input type=`"text`" id=`"pmPrice`" readonly style=`"opacity:0.6;cursor:default;`">
            </div>
            <div class=`"pm-actions`">
                <button class=`"pm-cancel`" onclick=`"closePurchaseModal()`">Cancel</button>
                <button class=`"pm-submit`" onclick=`"submitPurchase()`">Submit Request</button>
            </div>
        </div>
    </div>
"
$c = $c.Replace('</body>', $modal + '</body>')

Set-Content $f -Value $c -NoNewline
Write-Host 'HTML done'
