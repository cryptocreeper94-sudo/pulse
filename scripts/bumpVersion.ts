import * as fs from 'fs'
import * as path from 'path'

const VERSION_FILES = [
  'src/system/version.json',
  'darkwave-web/src/data/version.json',
]

interface VersionData {
  version: string
  major: number
  minor: number
  patch: number
  releaseGate: boolean
  lastUpdated: string
  notes: string
}

async function hashToSolana(version: string): Promise<string | null> {
  try {
    const response = await fetch('http://localhost:3001/api/audit/stamp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        eventType: 'SYSTEM_VERSION_STAMP',
        payload: {
          version,
          timestamp: new Date().toISOString(),
          environment: process.env.NODE_ENV || 'development',
        },
      }),
    })
    
    if (response.ok) {
      const data = await response.json()
      console.log(`✅ Solana hash created: ${data.signature || data.txHash || 'success'}`)
      return data.signature || data.txHash || null
    } else {
      console.log('⚠️ Solana hash skipped (API unavailable)')
      return null
    }
  } catch (error) {
    console.log('⚠️ Solana hash skipped (server not running)')
    return null
  }
}

async function bumpVersion(type: 'patch' | 'minor' | 'major' | 'v2launch' = 'patch') {
  const primaryFile = VERSION_FILES[0]
  
  if (!fs.existsSync(primaryFile)) {
    console.error(`❌ Version file not found: ${primaryFile}`)
    process.exit(1)
  }
  
  const data: VersionData = JSON.parse(fs.readFileSync(primaryFile, 'utf-8'))
  
  if (type === 'v2launch') {
    if (!data.releaseGate) {
      console.log('🚀 LAUNCHING v2.0.0 - DWAV Token Release!')
      data.major = 2
      data.minor = 0
      data.patch = 0
      data.releaseGate = true
      data.notes = 'DWAV Token Launch - February 14, 2026'
    } else {
      console.error('❌ v2.0.0 has already been launched!')
      process.exit(1)
    }
  } else if (data.releaseGate) {
    if (type === 'patch') {
      data.patch++
    } else if (type === 'minor') {
      data.minor++
      data.patch = 0
    } else if (type === 'major') {
      data.major++
      data.minor = 0
      data.patch = 0
    }
  } else {
    if (type === 'major') {
      console.error('❌ Cannot bump major version before token launch!')
      console.error('   Use "v2launch" on Feb 14, 2026 to release v2.0.0')
      process.exit(1)
    } else if (type === 'minor') {
      if (data.minor >= 99) {
        console.error('❌ Minor version limit reached. Contact admin.')
        process.exit(1)
      }
      data.minor++
      data.patch = 0
    } else {
      data.patch++
    }
  }
  
  data.version = `${data.major}.${data.minor}.${data.patch}`
  data.lastUpdated = new Date().toISOString()
  
  for (const file of VERSION_FILES) {
    const dir = path.dirname(file)
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true })
    }
    fs.writeFileSync(file, JSON.stringify(data, null, 2) + '\n')
    console.log(`📝 Updated: ${file}`)
  }
  
  console.log(`\n🎉 Version bumped to v${data.version}`)
  
  await hashToSolana(data.version)
  
  console.log('\n✅ Version bump complete!')
  console.log(`   New version: v${data.version}`)
}

const arg = process.argv[2] as 'patch' | 'minor' | 'major' | 'v2launch' | undefined
bumpVersion(arg || 'patch')
