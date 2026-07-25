import { createBrowserClient } from '@supabase/ssr'

let client: any = null

export function createClient() {
  if (client) return client
  
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  
  if (!url || !key) {
    // During SSR/prerender when env vars aren't available, create a mock
    // This prevents crashes during static generation of pages like _not-found
    return new Proxy({} as any, {
      get(_target, prop) {
        if (prop === 'auth') {
          return new Proxy({} as any, {
            get() {
              return async () => ({ data: { user: null, session: null }, error: null })
            }
          })
        }
        return async () => ({ data: null, error: null })
      }
    })
  }
  
  client = createBrowserClient(url, key)
  return client
}
