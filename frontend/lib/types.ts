// lib/types.ts

export type User = {
  id: number;
  githubId: string;
  username: string;
  email: string;
  avatarUrl: string;
  accessToken: string;
  lastLogin: string; // ISO datetime
};

export type Organization = {
  id: number;
  name: string;
  plan: "PIRATES" | "SUPERNOVA" | "WARLORD";
  logoUrl: string;
  createdDate: string; // ISO datetime
  createdBy: User;
  users: User[];
};

export type OrganizationDTO = {
  name: string;
  plan: "PIRATES" | "SUPERNOVA" | "WARLORD";
};

export type ProjectDTO = {
  name: string;
  projectLocation?: string;
  cloudProviderName?: string;
  organizationId: number;
};

export type ApplicationDTO = {
  name: string;
  description: string;
  environment: string;
  organizationId: number;
  projectId: number;
};

export type Logs = {
  id: string;
  clientTimestamp?: string;
  serverTimestamp?: string;
  projectId: number;
  applicationId: number;
  traceId: string;
  level: string;
  type?: string;
  message: string;
  timestamp: string; // ISO datetime
};

export type Trace = {
  id: string;
  clientTimestamp?: string;
  serverTimestamp?: string;
  projectId: number;
  applicationId: number;
  timestamp: string;
  requestMethod: string;
  requestURL: string;
  responseStatus: number;
  traceId: string;
  spanType?: string;
  spanId: string;
  durationMs: number;
  parentSpanId: string;
  meta?: Record<string, string>;
};

export type Metrics = {
  id: string;
  projectId: number;
  applicationId: number;
  timestamp: string;
  requestCount: number;
  errorCount: number;
  avgLatency: number;
  maxLatency: number;
  minLatency: number;
};

export type TenantDTO = {
  name: string;
  organizationId: number;
};

export type Project = {
  id: number;
  name: string;
  projectLocation?: string;
  cloudProviderName?: string;
  organizationId?: number;
};

export type Application = {
  id: number;
  name: string;
  description: string;
  environment: string;
  organizationId: number;
  projectId: number;
};

export type UptimeMonitor = {
  id: number;
  url: string;
  projectId: number;
  applicationId: number;
  organizationId: number;
  currentStatus: string;
  active?: boolean;
  lastCheckAt?: string;
  createdAt: string;
  updatedAt: string;
};

export type UptimeCheckResult = {
  id: string;
  monitorId: string;
  projectId: number;
  url: string;
  timestamp: string;
  responseMs: number;
  statusCode: number;
  success: boolean;
  error?: string;
};

export type AlertEvent = {
  id: string;
  subject?: string;
  source?: string;
  kind?: string;
  severity?: string;
  title?: string;
  message?: string;
  projectId?: number;
  applicationId?: number;
  monitorId?: number;
  detectedAt?: string;
  createdAt?: string;
  metadata?: Record<string, unknown>;
};

export type PaginationMetadata = {
  totalElements: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
  hasNext: boolean;
  hasPrevious: boolean;
};

export type PaginatedResponse<T> = {
  data: T[];
  totalElements: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
  hasNext: boolean;
  hasPrevious: boolean;
};

