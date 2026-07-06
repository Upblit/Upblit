'use client';

import { useEffect, useState } from 'react';
import { ServiceStatus, ServiceStatusType } from '@/components/ServiceStatus';

interface ServiceData {
  name: string;
  url: string;
  status: ServiceStatusType;
}

interface StatusResponse {
  systemStatus: 'operational' | 'degraded' | 'outage';
  services: ServiceData[];
  timestamp: string;
}

export default function Home() {
  const [data, setData] = useState<StatusResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const fetchStatus = async () => {
    try {
      const res = await fetch('/api/status', { cache: 'no-store' });
      if (!res.ok) throw new Error('Failed to fetch');
      const json = await res.json();
      setData(json);
      setError(false);
    } catch (err) {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 30000); // Poll every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const getSystemStatusDisplay = (status?: string) => {
    switch (status) {
      case 'operational':
        return {
          title: 'All Systems Operational',
          desc: 'All services are running smoothly with no reported issues.',
        };
      case 'degraded':
        return {
          title: 'Degraded Performance',
          desc: 'Some services are currently experiencing issues or are unavailable.',
        };
      case 'outage':
        return {
          title: 'Major System Outage',
          desc: 'Most or all services are currently unavailable.',
        };
      default:
        return {
          title: 'Checking System Status...',
          desc: 'Please wait while we fetch the latest health data.',
        };
    }
  };

  const display = getSystemStatusDisplay(data?.systemStatus);

  return (
    <main className="container animate-slide-up">
      <header className="header">
        <h1 className="title">Upblit Status</h1>
        <p className="subtitle">Real-time health monitoring of all Upblit services</p>
      </header>

      {loading && !data ? (
        <section>
          <div className="skeleton skeleton-banner" />
          <div className="services-grid">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="skeleton skeleton-card" />
            ))}
          </div>
        </section>
      ) : error && !data ? (
        <section>
          <div className="status-banner outage">
            <div className="status-banner-content">
              <h2>Failed to Load Status</h2>
              <p>We couldn't connect to the health monitoring API. Please try again later.</p>
            </div>
          </div>
        </section>
      ) : (
        <section>
          <div className={`status-banner ${data?.systemStatus}`}>
            <div className="status-banner-content">
              <h2>{display.title}</h2>
              <p>{display.desc}</p>
              {data?.timestamp && (
                <p style={{ marginTop: '12px', fontSize: '0.8rem', opacity: 0.7 }}>
                  Last updated: {new Date(data.timestamp).toLocaleTimeString()}
                </p>
              )}
            </div>
          </div>

          <div className="services-grid">
            {data?.services.map((service, idx) => (
              <ServiceStatus
                key={idx}
                name={service.name}
                url={service.url}
                status={service.status}
              />
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
