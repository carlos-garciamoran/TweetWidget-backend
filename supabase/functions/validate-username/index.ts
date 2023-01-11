import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

import { supabaseClient } from '../_shared/supabaseAdmin.ts'
import { twitterClient } from '../_shared/twitterClient.ts'

serve(async (req) => {
  const { username } = await req.json()
  const resp: {
    error: string|undefined,
    isValid: boolean,
  } = {
    error: '',
    isValid: false,
  }

  console.log(`Validating username "${username}"...`)

  try {
    const { data, errors } = await twitterClient.users.findUserByUsername(username)

    // Check if the username is legit.
    if (data) {
      resp.isValid = true

      const { error } = await supabaseClient
        .from('tracked_users')
        .insert({
          id: data.id,
          username: username,
        })

      // Supabase DB error
      if (error)    resp.error = error.details
    } else if (errors) {  // Twitter error
      resp.error = errors[0].detail
    }
  } catch (_error) {
    resp.error = 'Unknown Twitter error'
  }

  return new Response(
    JSON.stringify(resp),
    { headers: { "Content-Type": "application/json" } },
  )
})

// To invoke:
// curl -i --location --request POST 'http://localhost:54321/functions/v1/' \
//   --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
//   --header 'Content-Type: application/json' \
//   --data '{"username":"paulg"}'
