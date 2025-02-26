import React from 'react'

export default function Guide() {
  return (
    <div className="prose prose-indigo max-w-none">
      <h1>User Guide</h1>
      
      <h2>Getting Started</h2>
      <p>
        Welcome to IP Blocker! This guide will help you set up and use the platform effectively
        to protect your website from unwanted traffic.
      </p>

      <h2>Connecting Your Website</h2>
      <ol>
        <li>Go to the Settings page</li>
        <li>Enter your website domain</li>
        <li>Click "Add Website"</li>
      </ol>

      <h2>Blocking IP Addresses</h2>
      <p>
        You can block up to 200 IP addresses per month. To block an IP:
      </p>
      <ol>
        <li>Navigate to the Block List page</li>
        <li>Enter the IP address in the input field</li>
        <li>Click "Block IP"</li>
      </ol>

      <h2>Country Blocking</h2>
      <p>
        You can block up to 20 countries. To block a country:
      </p>
      <ol>
        <li>Go to the Block List page</li>
        <li>Enter the country code (e.g., US, GB)</li>
        <li>Click "Block Country"</li>
      </ol>

      <h2>Analytics</h2>
      <p>
        The Analytics page provides insights about your website traffic:
      </p>
      <ul>
        <li>Total visits</li>
        <li>Bot attempts</li>
        <li>Blocked attempts</li>
        <li>Visit trends over time</li>
      </ul>

      <h2>Best Practices</h2>
      <ul>
        <li>Regularly review your blocked IPs</li>
        <li>Monitor analytics for unusual patterns</li>
        <li>Keep your block lists updated</li>
        <li>Enable email notifications for important events</li>
      </ul>

      <h2>Need Help?</h2>
      <p>
        If you need assistance or have questions, please contact our support team.
      </p>
    </div>
  )
}