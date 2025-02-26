import DeviceDetector from 'device-detector-js'

const deviceDetector = new DeviceDetector()

export function detectDevice(userAgent) {
  const device = deviceDetector.parse(userAgent)
  return {
    type: device.device?.type || 'unknown',
    browser: device.client?.name || 'unknown',
    isBot: device.bot !== null
  }
}