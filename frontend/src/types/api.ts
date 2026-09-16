export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface ApiErrorResponse {
  error: string;
  message: string;
  details?: Record<string, unknown> | Array<unknown>;
}

export interface HealthCheckResponse {
  status: 'healthy' | 'degraded' | 'unhealthy';
  service: string;
  version: string;
  environment: string;
  database: string;
  timestamp: string;
}
