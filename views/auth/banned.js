<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Account Banned | BattleArena</title>
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet"/>
  <link href="https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&family=Share+Tech+Mono&family=DM+Sans:wght@300;400;500&display=swap" rel="stylesheet"/>
  <link rel="stylesheet" href="/css/style.css"/>
</head>
<body class="ba-bg">
  <div class="container d-flex align-items-center justify-content-center" style="min-height:100vh;">
    <div class="text-center" style="max-width:480px;">
      <div style="font-family:'Orbitron',monospace; font-size:5rem; font-weight:900; color:#ef4444; line-height:1; text-shadow: 0 0 40px rgba(239,68,68,0.4);">
        BAN
      </div>
      <div style="font-family:'Share Tech Mono',monospace; font-size:0.65rem; color:#ef4444; letter-spacing:0.3em; margin: 10px 0 24px;">
        // ACCOUNT SUSPENDED
      </div>
      <div style="border:1px solid rgba(239,68,68,0.3); padding:24px; margin-bottom:28px; background:rgba(239,68,68,0.04);">
        <p style="font-family:'Share Tech Mono',monospace; font-size:0.65rem; color:#ef4444; letter-spacing:0.2em; margin-bottom:10px;">
          REASON
        </p>
        <p style="color:#94a3b8; font-size:0.9rem; margin:0;">
          <%= decodeURIComponent(query && query.reason ? query.reason : 'Violation of platform rules.') %>
        </p>
      </div>
      <p style="font-size:0.8rem; color:#475569; margin-bottom:24px;">
        Your account has been suspended by a BattleArena admin. If you believe this is a mistake, contact support.
      </p>
      <a href="/" style="font-family:'Share Tech Mono',monospace; font-size:0.68rem; color:var(--cyber-blue); border:1px solid rgba(56,189,248,0.3); padding:10px 24px; text-decoration:none; letter-spacing:0.12em; display:inline-block; transition:all 0.2s;">
        BACK TO HOME
      </a>
    </div>
  </div>
</body>
</html>