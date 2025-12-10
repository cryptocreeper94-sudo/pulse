import * as fs from 'fs'

const VERSION_FILE = 'src/system/version.json'

interface VersionData {
  version: string
  major: number
  minor: number
  patch: number
  releaseGate: boolean
  lastUpdated: string
  notes: string
}

async function promoteToV2() {
  console.log('='.repeat(50))
  console.log('🚀 DWAV TOKEN LAUNCH - VERSION 2.0.0 RELEASE')
  console.log('='.repeat(50))
  console.log('')
  
  const today = new Date()
  const launchDate = new Date('2026-02-14')
  
  if (today < launchDate) {
    console.log(`⚠️  WARNING: Launch date is February 14, 2026`)
    console.log(`   Today is ${today.toDateString()}`)
    console.log('')
    console.log('   Are you sure you want to launch early?')
    console.log('   Run with --force to proceed anyway.')
    
    if (!process.argv.includes('--force')) {
      process.exit(1)
    }
  }
  
  if (!fs.existsSync(VERSION_FILE)) {
    console.error(`❌ Version file not found: ${VERSION_FILE}`)
    process.exit(1)
  }
  
  const data: VersionData = JSON.parse(fs.readFileSync(VERSION_FILE, 'utf-8'))
  
  if (data.releaseGate) {
    console.error('❌ v2.0.0 has already been launched!')
    console.error(`   Current version: v${data.version}`)
    process.exit(1)
  }
  
  console.log(`📊 Current version: v${data.version}`)
  console.log('')
  
  data.major = 2
  data.minor = 0
  data.patch = 0
  data.version = '2.0.0'
  data.releaseGate = true
  data.lastUpdated = new Date().toISOString()
  data.notes = 'DWAV Token Launch - February 14, 2026'
  
  const files = [
    'src/system/version.json',
    'darkwave-web/src/data/version.json',
  ]
  
  for (const file of files) {
    fs.writeFileSync(file, JSON.stringify(data, null, 2) + '\n')
    console.log(`📝 Updated: ${file}`)
  }
  
  console.log('')
  console.log('🎉 VERSION 2.0.0 RELEASED!')
  console.log('')
  console.log('   Next steps:')
  console.log('   1. Publish the application')
  console.log('   2. Deploy DWAV token contract')
  console.log('   3. Announce on social media')
  console.log('')
  console.log('='.repeat(50))
  
  try {
    const response = await fetch('http://localhost:3001/api/audit/stamp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        eventType: 'TOKEN_LAUNCH_V2',
        payload: {
          version: '2.0.0',
          timestamp: new Date().toISOString(),
          milestone: 'DWAV Token Launch',
        },
      }),
    })
    
    if (response.ok) {
      const result = await response.json()
      console.log(`✅ Solana launch hash: ${result.signature || result.txHash || 'created'}`)
    }
  } catch {
    console.log('⚠️ Solana hash will be created on next server start')
  }
}

promoteToV2()
