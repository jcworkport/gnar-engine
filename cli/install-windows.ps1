$PackageName = "@gnar-engine/cli"
$TargetDir = "$env:USERPROFILE\.gnarengine"

Write-Host "Installing $PackageName..."

# Create the directory and install
New-Item -ItemType Directory -Force -Path $TargetDir | Out-Null
Set-Location $TargetDir

npm install $PackageName --no-audit --no-fund

# Get the bin path
$BinPath = "$TargetDir\node_modules\.bin"

# Add to PATH permanently if not already there
$CurrentPath = [Environment]::GetEnvironmentVariable("PATH", "User")

if ($CurrentPath -notlike "*$BinPath*") {
    [Environment]::SetEnvironmentVariable("PATH", "$CurrentPath;$BinPath", "User")
    Write-Host "Added $BinPath to PATH"
}

# Create config.json
$ConfigPath = "$TargetDir\config.json"
if (-not (Test-Path $ConfigPath)) {
    New-Item -Path $ConfigPath -Value "{`n}" | Out-Null
    Write-Host "Created config.json in $TargetDir"
}

Write-Host "G n a r  E n g i n e - Installation complete! Please restart your terminal and run 'gnar --help' to verify."
