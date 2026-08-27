declare module 'cloudflare:workers' {
  export const env: Record<string, string | undefined> & {
    GG_DEALS_API_KEY?: string
  }
}
