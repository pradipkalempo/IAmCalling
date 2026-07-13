$f = 'e:\softstock\frontend\pages\01-response-index.html'
$c = Get-Content $f -Raw

$old = '<li><a href="#contact" class="nav-cta" id="nav-auth-slot">Hire Me</a></li>'
$new = '<li><a href="#contact" class="nav-cta" id="nav-auth-slot">Hire Me</a></li>' + "`n" + '            <li><a href="15-login.html" style="background:var(--accent2);color:#1a1a2e;padding:0.4rem 1.1rem;border-radius:20px;font-weight:700;font-size:0.85rem;">Login</a></li>'

$c = $c.Replace($old, $new)
Set-Content $f -Value $c -NoNewline
Write-Host 'done'
