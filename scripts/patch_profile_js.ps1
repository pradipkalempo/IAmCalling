$f = 'e:\softstock\frontend\pages\18-profile.html'
$c = Get-Content $f -Raw

# Fix broken referProject — remove the leftover fragment after the closing brace
$broken = "}/" + '${demoPage}?ref=${refCode}&project=${encodeURIComponent(name)}&earn=${price}`' + ";" + "`n        navigator.clipboard.writeText(link).then(() => {`n            showToast(" + '`' + "✅ Link copied! Share it to earn ₹" + '${price}' + " when client visits." + '`' + ");`n            // ─ referral is recorded on the destination page when client opens the link ─`n        });`n    }"
$fixed = "}"
$c = $c.Replace($broken, $fixed)

# Add purchase JS before closing </script> that contains referProject
$js = "
    // ── PURCHASE FLOW ──
    let _pmPlan = '', _pmPrice = 0;

    function openPurchaseModal(plan, price) {
        _pmPlan = plan; _pmPrice = price;
        document.getElementById('pmPlanName').textContent = plan + ' — Rs.' + price;
        document.getElementById('pmPrice').value = 'Rs.' + price;
        document.getElementById('pmRefBy').value = '';
        document.getElementById('pmTxnId').value = '';
        document.getElementById('purchaseModal').classList.add('open');
    }

    function closePurchaseModal() {
        document.getElementById('purchaseModal').classList.remove('open');
    }

    async function submitPurchase() {
        const refBy = document.getElementById('pmRefBy').value.trim();
        const txnId = document.getElementById('pmTxnId').value.trim();
        if (!refBy) { showToast('Please enter the referral code of who referred you', 'var(--gold)'); return; }
        if (!txnId) { showToast('Please enter Transaction ID / UTR', 'var(--gold)'); return; }

        const uid  = getUid();
        const name = document.getElementById('profileName').textContent.trim();
        const sb   = await getSB();
        if (!sb || !uid) { showToast('Session error. Please login again.', 'var(--red)'); return; }

        const { error } = await sb.from('purchase_requests').insert({
            user_id: uid, user_name: name,
            plan_name: _pmPlan, plan_price: _pmPrice,
            referred_by: refBy, txn_id: txnId, status: 'pending'
        });

        if (error) { showToast('Error: ' + error.message, 'var(--red)'); return; }
        closePurchaseModal();
        showToast('Request submitted! Admin will verify and approve.');
        markPending(_pmPlan);
    }

    function markPending(plan) {
        const btn = document.getElementById('pbtn-' + plan);
        if (btn) { btn.className = 'btn-pending'; btn.innerHTML = '⏳ Pending Approval'; btn.onclick = null; }
    }

    function markPurchased(plan) {
        const btn = document.getElementById('pbtn-' + plan);
        if (btn) { btn.className = 'btn-purchased'; btn.innerHTML = '✅ Purchased for Life'; btn.onclick = null; }
    }

    async function loadPurchaseStatus() {
        const uid = getUid();
        if (!uid) return;
        const sb = await getSB();
        if (!sb) return;
        const { data } = await sb.from('purchase_requests').select('plan_name,status').eq('user_id', uid);
        if (!data) return;
        data.forEach(r => {
            if (r.status === 'approved') markPurchased(r.plan_name);
            else if (r.status === 'pending') markPending(r.plan_name);
        });
    }
"

# Insert JS before the closing script tag that has referProject
$anchor = '    function referProject(name, price, demoPage) {'
$c = $c.Replace($anchor, $js + $anchor)

Set-Content $f -Value $c -NoNewline
Write-Host 'JS done'
