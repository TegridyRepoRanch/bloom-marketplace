import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://bqglrepbhjxmbgggdqal.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJxZ2xyZXBiaGp4bWJnZ2dkcWFsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk5ODk4NzcsImV4cCI6MjA4NTU2NTg3N30.f9CdQ43T2_Fj2aurV2wUjuIESqjygBCnSZaIxYZzgCA';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
