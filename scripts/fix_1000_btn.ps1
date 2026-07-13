$f = 'e:\softstock\frontend\pages\01-response-index.html'
$c = Get-Content $f -Raw

# Find the 1000 referral card's Details link and insert purchase button after it
$anchor = '<a href="40-admin-dashboard-simple.html" class="btn-demo"><i class="fas fa-external-link-alt"></i> Live Demo</a>'
$idx = $c.IndexOf($anchor)
# Find the closing </div> of card-actions after this point
$actionsEnd = $c.IndexOf('</div>', $idx + $anchor.Length)

$btnHtml = "`n                        <button id=""pbtn-Admin Dashboard"" class=""btn-purchase-idx"" onclick=""openPM('Admin Dashboard',1000)""><i class=""fas fa-shopping-cart""></i> Purchase Referral Pack</button>"

$c = $c.Substring(0, $actionsEnd) + $btnHtml + "`n                    " + $c.Substring($actionsEnd)

Set-Content $f -Value $c -NoNewline
Write-Host 'done'
