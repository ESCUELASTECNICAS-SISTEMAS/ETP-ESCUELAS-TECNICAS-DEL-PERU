#!/usr/bin/env node
const { execSync } = require('child_process')
const fs = require('fs')
const path = require('path')

function safeEnvPrint() {
  console.log('--- Filtered environment variables ---')
  const keys = Object.keys(process.env).sort()
  for (const k of keys) {
    if (/KEY|SECRET|TOKEN|PASSWORD|AUTH|CERT|PRIVATE/i.test(k)) continue
    // avoid printing large CI variables that may be present
    if (k.length > 120) continue
    console.log(`${k}=${process.env[k]}`)
  }
}

function printNodeInfo() {
  console.log('Node version:', process.version)
  try {
    const npmv = execSync('npm -v', { stdio: ['pipe', 'pipe', 'ignore'] }).toString().trim()
    console.log('npm version:', npmv)
  } catch (e) { console.log('npm version: (error)') }
}

function listNodeModules() {
  console.log('--- node_modules (first 200 entries) ---')
  const nmPath = path.join(process.cwd(), 'node_modules')
  try {
    if (!fs.existsSync(nmPath)) { console.log('node_modules not present') ; return }
    const entries = fs.readdirSync(nmPath).slice(0, 200)
    console.log(entries.join(', '))
  } catch (e) { console.log('error listing node_modules:', e.message) }
}

function printPackageScripts() {
  console.log('--- package.json scripts ---')
  try {
    const pkg = require(path.join(process.cwd(), 'package.json'))
    console.log(Object.keys(pkg.scripts || {}).map(k => `${k}: ${pkg.scripts[k]}`).join('\n'))
  } catch (e) { console.log('error reading package.json:', e.message) }
}

function main(){
  console.log('\n=== Build info script (print-build-info.js) ===')
  printNodeInfo()
  safeEnvPrint()
  printPackageScripts()
  listNodeModules()
  console.log('=== End build info ===\n')
}

main()
