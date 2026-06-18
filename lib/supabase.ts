import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://mhuauwovbtkccnnbrhft.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1odWF1d292YnRrY2NubmJyaGZ0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE3NjQ4MjcsImV4cCI6MjA5NzM0MDgyN30.ffkjmLqBA6MEKHnBWW9OqlGx78SdY6PrnyRBZ6JNoCo'
)

export default supabase