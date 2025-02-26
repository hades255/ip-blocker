import http from 'k6/http'
import { check, sleep } from 'k6'

export const options = {
  stages: [
    { duration: '30s', target: 20 }, // Ramp up to 20 users
    { duration: '1m', target: 20 },  // Stay at 20 users
    { duration: '30s', target: 0 },  // Ramp down to 0 users
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'], // 95% of requests must complete below 500ms
    http_req_failed: ['rate<0.01'],   // Less than 1% of requests can fail
  },
}

export default function () {
  const BASE_URL = 'http://localhost:3000'

  // Test homepage load
  const homeRes = http.get(BASE_URL)
  check(homeRes, {
    'homepage status is 200': (r) => r.status === 200,
  })

  // Test API endpoints
  const apiRes = http.get(`${BASE_URL}/api/stats`)
  check(apiRes, {
    'api status is 200': (r) => r.status === 200,
    'api returns json': (r) => r.headers['Content-Type'].includes('application/json'),
  })

  sleep(1)
}