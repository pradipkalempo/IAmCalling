$f = 'e:\softstock\frontend\pages\01-response-index.html'
$c = Get-Content $f -Raw

$idx = $c.IndexOf('43-purchase-admin.html')
# find start of <a tag before it
$start = $c.LastIndexOf('<a ', $idx)
# find end of </a>
$end = $c.IndexOf('</a>', $idx) + 4

$correct = '<a href="43-purchase-admin.html" style="color:inherit;text-decoration:none;">All rights reserved.</a>'
$c = $c.Substring(0, $start) + $correct + $c.Substring($end)

Set-Content $f -Value $c -NoNewline
Write-Host 'done'
