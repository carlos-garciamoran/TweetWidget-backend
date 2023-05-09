import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';

import { getRandomTweetFromUser } from '../_shared/helpers.ts';
import { supabaseClient } from '../_shared/supabaseAdmin.ts';
import { Tweet } from '../_shared/types.ts';

serve(async req => {
  const { id, username } = await req.json();
  const resp: { error: null | string; tweet: null | Tweet } = {
    error: null,
    tweet: null,
  };

  const tweet = await getRandomTweetFromUser(id, username);

  if (tweet) {
    resp.tweet = tweet;

    const { error: dbError } = await supabaseClient
      .from('tweets')
      .upsert(tweet);

    if (dbError) {
      console.error(`[!] serve`, dbError);
    }
  } else {
    resp.error = 'No tweets found';
  }

  return new Response(JSON.stringify(resp), {
    headers: { 'Content-Type': 'application/json' },
  });
});

// To invoke:
// curl -i --location --request POST 'http://localhost:54321/functions/v1/fetch-random-tweet-from-user' \
//   --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
//   --header 'Content-Type: application/json' \
//   --data '{"id":"12", "username":"jack"}'
