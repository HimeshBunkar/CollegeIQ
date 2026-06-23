# CollegeIQ Quick Setup
Set-Location $PSScriptRoot
Copy-Item .env.example .env.local -ErrorAction SilentlyContinue
Write-Host "Installing dependencies..."
npm install
Write-Host "Pushing database schema..."
npm run db:push
Write-Host "Seeding sample data..."
npm run db:seed
Write-Host "Done! Run: npm run dev"
Write-Host "Demo login: demo@collegeiq.in / password123"
