import { Routes, Route } from 'react-router-dom'
import { Elements } from '@stripe/react-stripe-js'
import { loadStripe } from '@stripe/stripe-js'
import Dashboard from './pages/Dashboard'
import Layout from './components/Layout'
import Settings from './pages/Settings'
import BlockList from './pages/BlockList'
import Analytics from './pages/Analytics'
import Guide from './pages/Guide'
import Admin from './pages/Admin'
import PaymentForm from './components/PaymentForm'
import { useAuth } from './hooks/useAuth'

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY)

function App() {
  const { user, loading } = useAuth()

  if (loading) {
    return <div>Loading...</div>
  }

  if (false && !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
              Sign in to your account
            </h2>
          </div>
          {/* Add your sign-in form here */}
        </div>
      </div>
    )
  }

  return (
    <Elements stripe={stripePromise}>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="settings" element={<Settings />} />
          <Route path="blocklist" element={<BlockList />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="guide" element={<Guide />} />
          <Route path="admin" element={<Admin />} />
          <Route path="payment" element={<PaymentForm />} />
        </Route>
      </Routes>
    </Elements>
  )
}

export default App