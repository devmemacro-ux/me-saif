#!/usr/bin/env node
import { spawn, execSync, ChildProcess } from 'child_process'
import { existsSync, readdirSync } from 'fs'
import { createInterface } from 'readline'
import { networkInterfaces } from 'os'
import path from 'path'

// Colors
const c = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  dim: '\x1b[2m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  red: '\x1b[31m',
  bgGreen: '\x1b[42m',
  bgBlue: '\x1b[44m',
  bgMagenta: '\x1b[45m',
}

const log = {
  info: (msg: string) => console.log(`${c.blue}ℹ${c.reset} ${msg}`),
  success: (msg: string) => console.log(`${c.green}✔${c.reset} ${msg}`),
  warn: (msg: string) => console.log(`${c.yellow}⚠${c.reset} ${msg}`),
  error: (msg: string) => console.log(`${c.red}✖${c.reset} ${msg}`),
  step: (num: number, msg: string) => console.log(`\n${c.bgBlue}${c.bold} ${num} ${c.reset} ${c.bold}${msg}${c.reset}`),
}

const sleep = (ms: number) => new Promise(r => setTimeout(r, ms))

// Spinner
class Spinner {
  private frames = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏']
  private i = 0
  private interval: NodeJS.Timeout | null = null
  private text = ''

  start(text: string) {
    this.text = text
    this.interval = setInterval(() => {
      process.stdout.write(`\r${c.cyan}${this.frames[this.i]}${c.reset} ${this.text}`)
      this.i = (this.i + 1) % this.frames.length
    }, 80)
  }

  stop(success = true) {
    if (this.interval) clearInterval(this.interval)
    process.stdout.write(`\r${success ? c.green + '✔' : c.red + '✖'}${c.reset} ${this.text}\n`)
  }

  update(text: string) { this.text = text }
}

// Get external IP
function getExternalIP(): string {
  const nets = networkInterfaces()
  for (const name of Object.keys(nets)) {
    for (const net of nets[name] || []) {
      if (net.family === 'IPv4' && !net.internal) return net.address
    }
  }
  return 'localhost'
}

// Check if port is in use
function isPortInUse(port: number): boolean {
  try {
    execSync(`lsof -i:${port}`, { stdio: 'ignore' })
    return true
  } catch { return false }
}

// Kill process on port
function killPort(port: number) {
  try {
    execSync(`fuser -k ${port}/tcp 2>/dev/null`, { stdio: 'ignore' })
  } catch {}
}

// Find project root
function findProjectRoot(): string {
  let dir = process.cwd()
  while (dir !== '/') {
    if (existsSync(path.join(dir, 'client')) && existsSync(path.join(dir, 'server'))) return dir
    dir = path.dirname(dir)
  }
  return process.cwd()
}

// Check if node_modules exists
function hasNodeModules(dir: string): boolean {
  return existsSync(path.join(dir, 'node_modules'))
}

// Install dependencies
async function installDeps(dir: string, name: string): Promise<boolean> {
  const spinner = new Spinner()
  spinner.start(`Installing ${name} dependencies...`)
  
  return new Promise(resolve => {
    const proc = spawn('npm', ['install'], { cwd: dir, stdio: 'pipe' })
    proc.on('close', code => {
      spinner.stop(code === 0)
      resolve(code === 0)
    })
  })
}

// Start a service
function startService(dir: string, name: string, port: number): ChildProcess {
  const proc = spawn('npm', ['run', 'dev'], {
    cwd: dir,
    stdio: ['ignore', 'pipe', 'pipe'],
    detached: false
  })
  
  proc.stdout?.on('data', (data) => {
    const line = data.toString().trim()
    if (line && !line.includes('VITE') && !line.includes('hmr')) {
      console.log(`${c.dim}[${name}]${c.reset} ${line}`)
    }
  })
  
  proc.stderr?.on('data', (data) => {
    const line = data.toString().trim()
    if (line && !line.includes('ExperimentalWarning') && !line.includes('VITE')) {
      console.log(`${c.dim}[${name}]${c.reset} ${c.yellow}${line}${c.reset}`)
    }
  })
  
  return proc
}

// Wait for port to be ready
async function waitForPort(port: number, timeout = 30000): Promise<boolean> {
  const start = Date.now()
  while (Date.now() - start < timeout) {
    if (isPortInUse(port)) return true
    await sleep(500)
  }
  return false
}

// Main menu
function showBanner() {
  console.clear()
  console.log(`
${c.cyan}╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║   ${c.bold}${c.magenta}🚀 FAYEZ STORE - Setup Manager${c.cyan}                        ║
║                                                           ║
║   ${c.dim}Smart CLI tool for managing your development server${c.cyan}     ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝${c.reset}
`)
}

function showMenu() {
  console.log(`
${c.bold}Choose an option:${c.reset}

  ${c.green}[1]${c.reset} 🚀 ${c.bold}Setup & Start${c.reset}     - Install deps & start all services
  ${c.blue}[2]${c.reset} ▶️  ${c.bold}Start Only${c.reset}        - Start services (skip install)
  ${c.yellow}[3]${c.reset} 📦 ${c.bold}Install Only${c.reset}      - Install dependencies only
  ${c.red}[4]${c.reset} 🛑 ${c.bold}Stop All${c.reset}          - Stop all running services
  ${c.magenta}[5]${c.reset} 🔄 ${c.bold}Restart${c.reset}           - Restart all services
  ${c.dim}[0]${c.reset} 🚪 ${c.bold}Exit${c.reset}

`)
}

async function setup(skipInstall = false) {
  const root = findProjectRoot()
  const clientDir = path.join(root, 'client')
  const serverDir = path.join(root, 'server')
  
  console.log(`\n${c.cyan}📁 Project root: ${c.bold}${root}${c.reset}\n`)
  
  // Check directories
  if (!existsSync(clientDir) || !existsSync(serverDir)) {
    log.error('Could not find client/ and server/ directories!')
    return
  }
  
  // Install dependencies
  if (!skipInstall) {
    log.step(1, 'Checking dependencies')
    
    if (!hasNodeModules(serverDir)) {
      await installDeps(serverDir, 'Backend')
    } else {
      log.success('Backend dependencies already installed')
    }
    
    if (!hasNodeModules(clientDir)) {
      await installDeps(clientDir, 'Frontend')
    } else {
      log.success('Frontend dependencies already installed')
    }
  }
  
  // Kill existing processes
  log.step(skipInstall ? 1 : 2, 'Preparing ports')
  
  if (isPortInUse(3001)) {
    log.warn('Port 3001 in use, killing process...')
    killPort(3001)
    await sleep(1000)
  }
  log.success('Port 3001 ready (Backend)')
  
  if (isPortInUse(5173)) {
    log.warn('Port 5173 in use, killing process...')
    killPort(5173)
    await sleep(1000)
  }
  log.success('Port 5173 ready (Frontend)')
  
  // Start services
  log.step(skipInstall ? 2 : 3, 'Starting services')
  
  const spinner = new Spinner()
  spinner.start('Starting Backend server...')
  const backendProc = startService(serverDir, 'Backend', 3001)
  
  if (await waitForPort(3001)) {
    spinner.stop(true)
  } else {
    spinner.stop(false)
    log.error('Backend failed to start!')
    return
  }
  
  spinner.start('Starting Frontend server...')
  const frontendProc = startService(clientDir, 'Frontend', 5173)
  
  if (await waitForPort(5173)) {
    spinner.stop(true)
  } else {
    spinner.stop(false)
    log.error('Frontend failed to start!')
    return
  }
  
  // Show success
  const ip = getExternalIP()
  
  console.log(`
${c.green}═══════════════════════════════════════════════════════════${c.reset}
${c.bold}${c.green}  ✅ All services are running!${c.reset}
${c.green}═══════════════════════════════════════════════════════════${c.reset}

  ${c.bold}🌐 Access URLs:${c.reset}

  ${c.cyan}Local:${c.reset}      http://localhost:5173
  ${c.cyan}Network:${c.reset}    http://${ip}:5173

  ${c.bold}📡 API:${c.reset}

  ${c.cyan}Backend:${c.reset}    http://localhost:3001

${c.dim}─────────────────────────────────────────────────────────────${c.reset}
  ${c.dim}Press ${c.bold}Ctrl+C${c.reset}${c.dim} to stop all services${c.reset}
${c.dim}─────────────────────────────────────────────────────────────${c.reset}
`)

  // Handle exit
  const cleanup = () => {
    console.log(`\n${c.yellow}🛑 Stopping services...${c.reset}`)
    backendProc.kill()
    frontendProc.kill()
    killPort(3001)
    killPort(5173)
    console.log(`${c.green}✔ All services stopped${c.reset}\n`)
    process.exit(0)
  }
  
  process.on('SIGINT', cleanup)
  process.on('SIGTERM', cleanup)
}

async function stopAll() {
  const spinner = new Spinner()
  spinner.start('Stopping all services...')
  killPort(3001)
  killPort(5173)
  await sleep(1000)
  spinner.stop(true)
  log.success('All services stopped!')
}

async function installOnly() {
  const root = findProjectRoot()
  const clientDir = path.join(root, 'client')
  const serverDir = path.join(root, 'server')
  
  log.step(1, 'Installing dependencies')
  await installDeps(serverDir, 'Backend')
  await installDeps(clientDir, 'Frontend')
  log.success('All dependencies installed!')
}

// Main
async function main() {
  const rl = createInterface({ input: process.stdin, output: process.stdout })
  const ask = (q: string): Promise<string> => new Promise(r => rl.question(q, r))
  
  showBanner()
  showMenu()
  
  const choice = await ask(`${c.cyan}Enter choice [1-5]:${c.reset} `)
  
  switch (choice.trim()) {
    case '1':
      await setup(false)
      break
    case '2':
      await setup(true)
      break
    case '3':
      await installOnly()
      rl.close()
      break
    case '4':
      await stopAll()
      rl.close()
      break
    case '5':
      await stopAll()
      await sleep(1000)
      await setup(true)
      break
    case '0':
      console.log(`\n${c.cyan}👋 Goodbye!${c.reset}\n`)
      rl.close()
      break
    default:
      log.error('Invalid choice!')
      rl.close()
  }
}

main().catch(console.error)
