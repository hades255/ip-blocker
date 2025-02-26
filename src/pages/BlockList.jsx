import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'

export default function BlockList() {
  const [newIp, setNewIp] = useState('')
  const [newCountry, setNewCountry] = useState('')
  const queryClient = useQueryClient()

  const { data: website } = useQuery({
    queryKey: ['website'],
    queryFn: async () => {
      const { data } = await supabase
        .from('websites')
        .select('*')
        .single()
      return data
    }
  })

  const { data: ipBlocks } = useQuery({
    queryKey: ['ip-blocks'],
    queryFn: async () => {
      const { data } = await supabase
        .from('ip_blocks')
        .select('*')
        .order('created_at', { ascending: false })
      return data || []
    }
  })

  const { data: countryBlocks } = useQuery({
    queryKey: ['country-blocks'],
    queryFn: async () => {
      const { data } = await supabase
        .from('country_blocks')
        .select('*')
        .order('created_at', { ascending: false })
      return data || []
    }
  })

  const addIpBlock = useMutation({
    mutationFn: async (ip) => {
      const { error } = await supabase
        .from('ip_blocks')
        .insert({ website_id: website.id, ip_address: ip })
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ip-blocks'] })
      setNewIp('')
    }
  })

  const addCountryBlock = useMutation({
    mutationFn: async (countryCode) => {
      const { error } = await supabase
        .from('country_blocks')
        .insert({ website_id: website.id, country_code: countryCode })
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['country-blocks'] })
      setNewCountry('')
    }
  })

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-semibold text-gray-900">Blocked IP Addresses</h2>
        <div className="mt-4">
          <div className="flex gap-4">
            <input
              type="text"
              value={newIp}
              onChange={(e) => setNewIp(e.target.value)}
              placeholder="Enter IP address"
              className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
            />
            <button
              onClick={() => addIpBlock.mutate(newIp)}
              className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            >
              Block IP
            </button>
          </div>
          <ul className="mt-4 divide-y divide-gray-100">
            {ipBlocks?.map((block) => (
              <li key={block.id} className="flex items-center justify-between py-4">
                <div>
                  <p className="text-sm font-medium text-gray-900">{block.ip_address}</p>
                  <p className="text-sm text-gray-500">Blocked on {new Date(block.created_at).toLocaleDateString()}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div>
        <h2 className="text-xl font-semibold text-gray-900">Blocked Countries</h2>
        <div className="mt-4">
          <div className="flex gap-4">
            <input
              type="text"
              value={newCountry}
              onChange={(e) => setNewCountry(e.target.value.toUpperCase())}
              placeholder="Enter country code (e.g., US)"
              className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
            />
            <button
              onClick={() => addCountryBlock.mutate(newCountry)}
              className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            >
              Block Country
            </button>
          </div>
          <ul className="mt-4 divide-y divide-gray-100">
            {countryBlocks?.map((block) => (
              <li key={block.id} className="flex items-center justify-between py-4">
                <div>
                  <p className="text-sm font-medium text-gray-900">{block.country_code}</p>
                  <p className="text-sm text-gray-500">Blocked on {new Date(block.created_at).toLocaleDateString()}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}