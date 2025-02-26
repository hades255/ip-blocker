import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'

export default function Settings() {
  const [domain, setDomain] = useState('')
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

  const addWebsite = useMutation({
    mutationFn: async (domain) => {
      const { error } = await supabase
        .from('websites')
        .insert({ domain })
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['website'] })
      setDomain('')
    }
  })

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-semibold text-gray-900">Website Settings</h2>
        
        {!website ? (
          <div className="mt-4">
            <div className="flex gap-4">
              <input
                type="text"
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                placeholder="Enter your website domain"
                className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
              />
              <button
                onClick={() => addWebsite.mutate(domain)}
                className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
              >
                Add Website
              </button>
            </div>
          </div>
        ) : (
          <div className="mt-4">
            <p className="text-sm text-gray-500">Connected Website:</p>
            <p className="mt-1 text-lg font-medium text-gray-900">{website.domain}</p>
          </div>
        )}
      </div>

      <div>
        <h2 className="text-xl font-semibold text-gray-900">Protection Settings</h2>
        <div className="mt-4 space-y-4">
          <div className="flex items-center">
            <input
              type="checkbox"
              id="blockBots"
              className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600"
            />
            <label htmlFor="blockBots" className="ml-3 text-sm font-medium text-gray-900">
              Automatically block detected bots
            </label>
          </div>
          
          <div className="flex items-center">
            <input
              type="checkbox"
              id="blockRepeat"
              className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600"
            />
            <label htmlFor="blockRepeat" className="ml-3 text-sm font-medium text-gray-900">
              Block IP addresses with excessive requests
            </label>
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-xl font-semibold text-gray-900">Email Notifications</h2>
        <div className="mt-4 space-y-4">
          <div className="flex items-center">
            <input
              type="checkbox"
              id="emailBlocked"
              className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600"
            />
            <label htmlFor="emailBlocked" className="ml-3 text-sm font-medium text-gray-900">
              Receive email notifications for blocked attempts
            </label>
          </div>
          
          <div className="flex items-center">
            <input
              type="checkbox"
              id="emailSummary"
              className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600"
            />
            <label htmlFor="emailSummary" className="ml-3 text-sm font-medium text-gray-900">
              Receive daily summary reports
            </label>
          </div>
        </div>
      </div>
    </div>
  )
}