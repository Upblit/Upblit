import { NextResponse } from 'next/server';

const SERVICES = [
  { name: 'API Service', url: 'https://api.upblit.dev/health' },
  { name: 'Ingest Service', url: 'https://ingest.upblit.dev/health' },
  { name: 'Pinger Service', url: 'https://pinger.upblit.dev/health' },
  { name: 'Email Service', url: 'https://email.upblit.dev/health' },
  { name: 'Codily API Service', url: 'https://codilyapi.upblit.dev/health' }
];

export async function GET() {
  const fetchWithTimeout = async (url: string, timeout = 5000) => {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);
    try {
      const response = await fetch(url, { signal: controller.signal, cache: 'no-store' });
      clearTimeout(id);
      return response.ok;
    } catch (error) {
      clearTimeout(id);
      return false;
    }
  };

  const results = await Promise.allSettled(
    SERVICES.map(async (service) => {
      const isHealthy = await fetchWithTimeout(service.url);
      return {
        ...service,
        status: isHealthy ? 'healthy' : 'degraded',
      };
    })
  );

  const statuses = results.map((result, index) => {
    if (result.status === 'fulfilled') {
      return result.value;
    }
    // If the promise itself rejected (which shouldn't happen with our try/catch, but just in case)
    return {
      ...SERVICES[index],
      status: 'degraded'
    };
  });

  const total = statuses.length;
  const healthy = statuses.filter(s => s.status === 'healthy').length;

  let systemStatus = 'operational';
  if (healthy === 0) systemStatus = 'outage';
  else if (healthy < total) systemStatus = 'degraded';

  return NextResponse.json({
    systemStatus,
    services: statuses,
    timestamp: new Date().toISOString()
  });
}
