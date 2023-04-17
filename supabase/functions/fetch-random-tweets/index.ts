import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

import { getRandomUserTweet, getTrackedUsers } from '../_shared/helpers.ts'
import { supabaseClient } from '../_shared/supabaseAdmin.ts'
import { Tweet, User } from '../_shared/types.ts'

serve(async (_req) => {
  const resp: { error: null|string; } = {
    error: null,
  }
  const randomTweets : Tweet[] = []
  const users: User[]|null = await getTrackedUsers()

  /** New Strategy:
   * TODO: instead of fetching a fresh tweet from the iOS client through the Twitter API directly,
   *       fetch a random tweet from the Supabase `tweets` table. If there's none, fetch a fresh one. 
   * 
   *       Then, have a cron job fetching and saving new tweets from added users every 24 hours or so.
  */
  if (users) {
    for (const user of users) {
      const tweet = await getRandomUserTweet(user.id, user.username)

      if (tweet)
        randomTweets.push(tweet)
    }
  }

  const { error } = await supabaseClient
    .from('tweets')
    .upsert(randomTweets)
    .select()

  if (error)
    resp.error = error.message

  return new Response(
    JSON.stringify(resp),
    { headers: { "Content-Type": "application/json" } },
  )
})

// To invoke:
// curl -i --location --request POST 'http://localhost:54321/functions/v1/' \
//   --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0'
