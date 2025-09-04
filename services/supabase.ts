
import { createClient } from '@supabase/supabase-js'
import type { Database } from './database.types.ts'

// Live Supabase configuration
const supabaseUrl = 'https://ymxkmfjogretzgqjuagv.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlteGttZmpvZ3JldHpncWp1YWd2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQzMTE2NDksImV4cCI6MjA2OTg4NzY0OX0.vwOgflin-bLvL4O-iut58-MZJOCrWl0c3nxoz1TyCc4'

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Supabase URL and/or Anon Key are missing. Please check your environment variables. This is a critical error for the app to function.');
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)