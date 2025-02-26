import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import QRCode from 'qrcode'

export default function MFASetup({ onComplete }) {
  const [qrCode, setQrCode] = useState('')
  const [secret, setSecret] = useState('')
  const [token, setToken] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    async function setupMFA() {
      try {
        const { data: { secret, qr } } = await supabase.functions.invoke('generate-mfa-secret')
        setSecret(secret)
        const qrDataUrl = await QRCode.toDataURL(qr)
        setQrCode(qrDataUrl)
      } catch (err) {
        setError('Failed to setup MFA')
      }
    }
    setupMFA()
  }, [])

  const verifyToken = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('verify-mfa-token', {
        body: { token, secret }
      })
      
      if (error) throw error
      
      if (data.valid) {
        await supabase.auth.updateUser({
          data: { mfa_enabled: true, mfa_secret: secret }
        })
        onComplete()
      } else {
        setError('Invalid token')
      }
    } catch (err) {
      setError('Failed to verify token')
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-medium text-gray-900">Setup Two-Factor Authentication</h2>
        <p className="mt-1 text-sm text-gray-500">
          Scan the QR code with your authenticator app and enter the token to enable 2FA.
        </p>
      </div>

      {qrCode && (
        <div className="flex justify-center">
          <img src={qrCode} alt="QR Code" className="w-48 h-48" />
        </div>
      )}

      <div>
        <label htmlFor="token" className="block text-sm font-medium text-gray-700">
          Verification Token
        </label>
        <div className="mt-1">
          <input
            type="text"
            id="token"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            placeholder="Enter 6-digit token"
          />
        </div>
      </div>

      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}

      <button
        onClick={verifyToken}
        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
      >
        Verify and Enable 2FA
      </button>
    </div>
  )
}