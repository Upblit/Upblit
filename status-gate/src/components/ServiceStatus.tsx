import React from 'react';

export type ServiceStatusType = 'healthy' | 'degraded';

interface ServiceStatusProps {
  name: string;
  url: string;
  status: ServiceStatusType;
}

export const ServiceStatus: React.FC<ServiceStatusProps> = ({ name, url, status }) => {
  return (
    <div className="glass-panel service-card animate-slide-up">
      <div className="service-info">
        <h3>{name}</h3>
        <div className="service-url">{url}</div>
      </div>
      <div className={`status-badge ${status}`}>
        <div className={`status-dot ${status}`}></div>
        <span>{status === 'healthy' ? 'Operational' : 'Degraded'}</span>
      </div>
    </div>
  );
};
