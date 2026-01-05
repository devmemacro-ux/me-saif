import crypto from 'crypto'
import { settingsRepo } from '../../database/repositories/settings.repo.js'
import { depositRepo } from '../../database/repositories/deposit.repo.js'
import { userRepo } from '../../database/repositories/user.repo.js'
import { notificationRepo } from '../../database/repositories/notification.repo.js'
import { decrypt } from '../utils/crypto.js'

let verificationInterval: NodeJS.Timeout | null = null

async function verifyDeposit(apiKey: string, apiSecret: string, txId: string, expectedAmount: number): Promise<boolean> {
  try {
    const timestamp = Date.now()
    const queryString = `timestamp=${timestamp}`
    const signature = crypto.createHmac('sha256', apiSecret).update(queryString).digest('hex')
    
    const response = await fetch(`https://api.binance.com/api/v3/depositHistory?${queryString}&signature=${signature}`, {
      headers: { 'X-MBX-APIKEY': apiKey }
    })
    
    if (!response.ok) return false
    
    const deposits = await response.json()
    return deposits.some((d: any) => d.txId === txId && parseFloat(d.amount) >= expectedAmount && d.status === 1)
  } catch {
    return false
  }
}

async function checkPendingDeposits() {
  const apiKeyEnc = settingsRepo.get('binance_api_key')
  const apiSecretEnc = settingsRepo.get('binance_api_secret')
  const enabled = settingsRepo.get('binance_auto_verify')
  
  if (!apiKeyEnc || !apiSecretEnc || enabled !== 'true') return
  
  const apiKey = decrypt(apiKeyEnc)
  const apiSecret = decrypt(apiSecretEnc)
  const pending = depositRepo.findPending()
  
  for (const deposit of pending) {
    const verified = await verifyDeposit(apiKey, apiSecret, deposit.transaction_id, deposit.amount)
    if (verified) {
      depositRepo.updateStatus(deposit.id, 'approved')
      userRepo.updateBalance(deposit.user_id, deposit.amount)
      notificationRepo.create({
        user_id: deposit.user_id,
        type: 'deposit',
        title: 'Deposit Auto-Approved',
        message: `Your deposit of $${deposit.amount} has been automatically verified and approved.`
      })
    }
  }
}

export function startAutoVerification() {
  if (verificationInterval) return
  verificationInterval = setInterval(checkPendingDeposits, 60000) // Check every minute
  checkPendingDeposits() // Run immediately
}

export function stopAutoVerification() {
  if (verificationInterval) {
    clearInterval(verificationInterval)
    verificationInterval = null
  }
}

export function isAutoVerificationRunning(): boolean {
  return verificationInterval !== null
}

export async function testBinanceConnection(apiKey: string, apiSecret: string): Promise<boolean> {
  try {
    const timestamp = Date.now()
    const queryString = `timestamp=${timestamp}`
    const signature = crypto.createHmac('sha256', apiSecret).update(queryString).digest('hex')
    
    const response = await fetch(`https://api.binance.com/api/v3/account?${queryString}&signature=${signature}`, {
      headers: { 'X-MBX-APIKEY': apiKey }
    })
    
    return response.ok
  } catch {
    return false
  }
}
