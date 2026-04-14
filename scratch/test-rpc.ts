import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

dotenv.config()

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing env vars')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function testRpc() {
  console.log('Testing RPC get_chat_context with conversationId: 207c056b-117f-4fa6-9440-ff3e1d3c25a9')
  const { data, error } = await supabase
    .rpc('get_chat_context', { p_conversation_id: '207c056b-117f-4fa6-9440-ff3e1d3c25a9' })
    .single()

  if (error) {
    console.error('RPC Error:', error)
  } else {
    console.log('RPC Success:', data)
  }
}

testRpc()
