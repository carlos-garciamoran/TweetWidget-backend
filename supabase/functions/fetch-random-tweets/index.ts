import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { getRandomUserTweet, getTrackedUsers } from './helpers.ts'
import { supabaseClient } from '../_shared/supabaseAdmin.ts'

serve(async (_req) => {
  const resp = {
    error: '',
  }

  const randomTweets : {
    username: string,
    tweet: string|null,
  }[] = []

  const users = await getTrackedUsers()

  if (users) {
    for (const user of users) {
      const randomTweet = await getRandomUserTweet(user)

      randomTweets.push({
        username: user.username,
        tweet: randomTweet,
      })
    }
  }

  console.log(randomTweets)

  // TODO: store in dailyTweets table
  // const { data, errors } = supabaseClient
  //   .from('daily_tweets')
  //   .upsert(randomTweets)
  //   .select()

  // console.log(data)
  // console.log(errors)

  return new Response(
    JSON.stringify(resp),
    { headers: { "Content-Type": "application/json" } },
  )
})

// To invoke:
// curl -i --location --request POST 'http://localhost:54321/functions/v1/' \
//   --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0'
