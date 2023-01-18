// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

import { getRandomUserTweet } from '../_shared/helpers.ts'
import { supabaseClient } from '../_shared/supabaseAdmin.ts'

console.log("Hello from Functions!")

serve(async (req) => {
  const { id, username } = await req.json()
  const resp = {
    error: '',
    tweet: '',
  }

  const randomTweet = await getRandomUserTweet(id)

  if (randomTweet) {
    resp.tweet = randomTweet

    const { error: dbError } = await supabaseClient
      .from('daily_tweets')
      .insert({
        tweet: randomTweet,
        username: username,
      })

    console.error(dbError)
  }
  else  resp.error = 'No tweets found'

  return new Response(
    JSON.stringify(resp),
    { headers: { "Content-Type": "application/json" } },
  )
})

// To invoke:
// curl -i --location --request POST 'http://localhost:54321/functions/v1/' \
//   --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
//   --header 'Content-Type: application/json' \
//   --data '{"id":"12", "username":"jack"}'