/**
 * Central API configuration.
 *
 * All medical-domain traffic (records, consultations, MMSE results, AI summary) goes through the
 * Spring Cloud API Gateway on :8093, which routes to the right microservice via Eureka:
 *   /api/medical-records/**  -> medical-service
 *   /api/consultations/**    -> medical-service
 *   /api/mmse/**             -> mmse-service
 *
 * Keeping the base URL here means the frontend never needs to know individual service ports.
 *
 * Same-origin by design: GATEWAY_URL is '' so calls become relative ('/api/...'). In production the
 * frontend's nginx reverse-proxies '/api' to the api-gateway Service (see nginx.conf); for `ng serve`
 * the dev proxy (proxy.conf.json) forwards '/api' to http://localhost:8093. This also removes CORS.
 */
export const GATEWAY_URL = '';

/** Standard envelope returned by the backend services. */
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  error?: string;
  timestamp?: string;
}
