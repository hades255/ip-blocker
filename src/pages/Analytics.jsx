import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import { Line } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
)

export default function Analytics() {
  const [timeRange, setTimeRange] = useState('7d')

  const { data: visits } = useQuery({
    queryKey: ['visits', timeRange],
    queryFn: async () => {
      const { data } = await supabase
        .from('visits')
        .select('*')
        .order('created_at', { ascending: true })
      return data || []
    }
  })

  const { data: stats } = useQuery({
    queryKey: ['visit-stats', timeRange],
    queryFn: async () => {
      const { data } = await supabase
        .from('visits')
        .select('is_bot, is_blocked')
        .eq('is_bot', true)
        .count()
      
      const botCount = data?.[0]?.count || 0
      
      const { data: blockedData } = await supabase
        .from('visits')
        .select('is_blocked')
        .eq('is_blocked', true)
        .count()
      
      const blockedCount = blockedData?.[0]?.count || 0
      
      return {
        totalVisits: visits?.length || 0,
        botAttempts: botCount,
        blockedAttempts: blockedCount
      }
    },
    enabled: !!visits
  })

  const chartData = {
    labels: visits?.map(v => new Date(v.created_at).toLocaleDateString()) || [],
    datasets: [
      {
        label: 'Total Visits',
        data: visits?.map((_, i) => i + 1) || [],
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1
      }
    ]
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-semibold text-gray-900">Analytics</h2>
        
        <div className="mt-4">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="block w-48 rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
          </select>
        </div>

        <dl className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-3">
          <div className="overflow-hidden rounded-lg bg-white px-4 py-5 shadow sm:p-6">
            <dt className="truncate text-sm font-medium text-gray-500">Total Visits</dt>
            <dd className="mt-1 text-3xl font-semibold tracking-tight text-gray-900">{stats?.totalVisits || 0}</dd>
          </div>
          <div className="overflow-hidden rounded-lg bg-white px-4 py-5 shadow sm:p-6">
            <dt className="truncate text-sm font-medium text-gray-500">Bot Attempts</dt>
            <dd className="mt-1 text-3xl font-semibold tracking-tight text-gray-900">{stats?.botAttempts || 0}</dd>
          </div>
          <div className="overflow-hidden rounded-lg bg-white px-4 py-5 shadow sm:p-6">
            <dt className="truncate text-sm font-medium text-gray-500">Blocked Attempts</dt>
            <dd className="mt-1 text-3xl font-semibold tracking-tight text-gray-900">{stats?.blockedAttempts || 0}</dd>
          </div>
        </dl>

        <div className="mt-8 rounded-lg bg-white p-6 shadow">
          <h3 className="text-lg font-medium text-gray-900">Visit Trends</h3>
          <div className="mt-4 h-96">
            <Line data={chartData} options={{ maintainAspectRatio: false }} />
          </div>
        </div>
      </div>
    </div>
  )
}