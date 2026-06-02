$map = @(
  @('*mullvad*','Mullvad'),
  @('*nord*','NordVPN'),
  @('*nordlynx*','NordVPN'),
  @('*expressvpn*','ExpressVPN'),
  @('*protonvpn*','ProtonVPN'),
  @('*proton*','ProtonVPN'),
  @('*surfshark*','Surfshark'),
  @('*cyberghost*','CyberGhost'),
  @('*pia*','PIA'),
  @('*windscribe*','Windscribe'),
  @('*vyprvpn*','VyprVPN'),
  @('*vypr*','VyprVPN'),
  @('*ipvanish*','IPVanish'),
  @('*tunnelbear*','TunnelBear'),
  @('*hotspot*','Hotspot Shield'),
  @('*openvpn*','OpenVPN'),
  @('*wireguard*','WireGuard'),
  @('*tailscale*','Tailscale'),
  @('*cloudflare*','Cloudflare WARP'),
  @('*warp*','Cloudflare WARP'),
  @('*private internet access*','PIA'),
  @('*tun*','Generic VPN (TUN)'),
  @('*tap*','Generic VPN (TAP)'),
  @('*wintun*','WireGuard/Wintun'),
  @('*virtual*','Generic VPN'),
  @('*vpn*','Generic VPN')
)

try {
  $adapters = Get-NetAdapter -ErrorAction Stop | Where-Object { $_.Status -eq 'Up' }

  # Method 1: match known VPN adapter names
  $found = $null
  foreach ($entry in $map) {
    $match = $adapters | Where-Object { $_.Name -like $entry[0] }
    if ($match) { $found = $entry[1]; break }
  }
  if ($found) { "connected:$found"; exit }

  # Method 2: any non-physical "Up" adapter with an IPv4 address is likely a VPN tunnel
  $physicalPatterns = @('*ethernet*','*wi-fi*','*wifi*','*bluetooth*','*loopback*')
  $candidate = $adapters | Where-Object {
    $n = $_.Name.ToLower()
    $phys = $false
    foreach ($p in $physicalPatterns) { if ($n -like $p) { $phys = $true; break } }
    -not $phys
  } | Select-Object -First 1
  if ($candidate) {
    $ip = Get-NetIPAddress -InterfaceIndex $candidate.ifIndex -AddressFamily IPv4 -ErrorAction SilentlyContinue | Select-Object -First 1
    if ($ip) { "connected:VPN ($($candidate.Name))"; exit }
  }

  "disconnected"
} catch { "disconnected" }
