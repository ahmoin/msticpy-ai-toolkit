export type IocType = "ipv4" | "ipv6" | "dns" | "file_hash" | "url"

export interface EnrichedIoc {
  ioc_type: IocType
  value: string
  provider: string
  severity: string | null
  details: Record<string, unknown>
  raw_result_available: boolean
}

export interface EnrichedAlert {
  alert_id: string
  timestamp: string
  title: string
  severity: string
  host: string
  description: string
  enriched_iocs: EnrichedIoc[]
}

export interface IocLookupResult {
  value: string
  ioc_type: IocType | null
  error: string | null
  enriched: EnrichedIoc | null
}
