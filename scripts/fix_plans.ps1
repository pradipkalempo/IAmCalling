$f = 'e:\softstock\frontend\pages\01-response-index.html'
$c = Get-Content $f -Raw

# 1. Replace 250 referral with 1000
$c = $c.Replace('&#8377;250 referral', '&#8377;1000 referral')

# 2. Add purchase button to 500 plan (IAMCALLING - after admin-portfolio Details link)
$old = '<a href="admin-portfolio.html" class="btn-code"><i class="fas fa-info-circle"></i> Details</a>' + "`n" + '                    </div>' + "`n" + '                </div>' + "`n" + '            </div>' + "`n`n" + '            <!-- Project 2: Banking'
$new = '<a href="admin-portfolio.html" class="btn-code"><i class="fas fa-info-circle"></i> Details</a>' + "`n" + '                        <button id="pbtn-IAMCALLING Platform" class="btn-purchase-idx" onclick="openPM(''IAMCALLING Platform'',500)"><i class="fas fa-shopping-cart"></i> Purchase Referral Pack</button>' + "`n" + '                    </div>' + "`n" + '                </div>' + "`n" + '            </div>' + "`n`n" + '            <!-- Project 2: Banking'
$c = $c.Replace($old, $new)

# 3. Add purchase button to 1000 plan (Admin Dashboard - after admin-portfolio Details link, second occurrence)
$old2 = '<a href="admin-portfolio.html" class="btn-code"><i class="fas fa-info-circle"></i> Details</a>' + "`n" + '                    </div>' + "`n`n" + '                </div>' + "`n" + '            </div>' + "`n`n`n" + '            <!-- Project 4'
$new2 = '<a href="admin-portfolio.html" class="btn-code"><i class="fas fa-info-circle"></i> Details</a>' + "`n" + '                        <button id="pbtn-Admin Dashboard" class="btn-purchase-idx" onclick="openPM(''Admin Dashboard'',1000)"><i class="fas fa-shopping-cart"></i> Purchase Referral Pack</button>' + "`n" + '                    </div>' + "`n`n" + '                </div>' + "`n" + '            </div>' + "`n`n`n" + '            <!-- Project 4'
$c = $c.Replace($old2, $new2)

Set-Content $f -Value $c -NoNewline
Write-Host 'done'
