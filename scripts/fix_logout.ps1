$f = 'e:\softstock\frontend\pages\18-profile.html'
$c = Get-Content $f -Raw

$idx = $c.IndexOf('function doLogout()')
$end = $c.IndexOf('}', $c.IndexOf('}', $idx) + 1) + 1  # find closing brace of else block

$newFn = "function doLogout() {
        if (!confirm('Logout?')) return;
        ['iamcalling_uid','uid','currentUser','userAuth','userData','persistentLogin','loginTimestamp','iamcalling_current_user','topbarUserData'].forEach(k => localStorage.removeItem(k));
        sessionStorage.clear();
        if (window.globalAuth && typeof window.globalAuth.logout === 'function') {
            window.globalAuth.logout();
        } else {
            window.location.href = '15-login.html';
        }
    }"

$c = $c.Substring(0, $idx) + $newFn + $c.Substring($end)
Set-Content $f -Value $c -NoNewline
Write-Host 'done'
