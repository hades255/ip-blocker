import { Reader } from 'maxmind'

let geoReader = null

export async function initGeoReader() {
  if (!geoReader) {
    const response = await fetch('/GeoLite2-Country.mmdb')
    const buffer = await response.arrayBuffer()
    geoReader = await Reader.open(buffer)
  }
  return geoReader
}

export async function getCountryCode(ip) {
  const reader = await initGeoReader()
  const result = reader.get(ip)
  return result?.country?.iso_code
}