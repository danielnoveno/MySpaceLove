import { createBrowserClient } from '@supabase/ssr'
import type { SupabaseClient } from '@supabase/supabase-js'

let client: SupabaseClient | null = null

export function createClient(): SupabaseClient {
  if (client) return client
  
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  
  if (!url || !key) {
    // During SSR/prerender when env vars aren't available, create a mock
    // This prevents crashes during static generation of pages like _not-found
    return new Proxy({}, {
      get(_target, prop) {
        if (prop === 'auth') {
          return new Proxy({}, {
            get() {
              return async () => ({ data: { user: null, session: null }, error: null })
            }
          })
        }
        return async () => ({ data: null, error: null })
      }
    }) as unknown as SupabaseClient
  }
  
  client = createBrowserClient(url, key)
  return client
}
