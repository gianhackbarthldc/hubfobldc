import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const key = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!url || !key) {
  throw new Error(
    'Variáveis de ambiente ausentes. Crie o arquivo hub_fob_web/.env.local com:\n' +
    'VITE_SUPABASE_URL=https://<projeto>.supabase.co\n' +
    'VITE_SUPABASE_ANON_KEY=<chave-anon>'
  )
}

export const supabase = createClient(url, key)
