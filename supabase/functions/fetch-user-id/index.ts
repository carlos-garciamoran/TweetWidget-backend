import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';

import { supabaseClient } from '../_shared/supabaseAdmin.ts';
import { twitterClient } from '../_shared/twitterClient.ts';

serve(async req => {
  const { username } = await req.json();
  const resp: {
    id: string | null;
    error: string | null;
  } = {
    id: null,
    error: null,
  };

  // TODO: when getting a twitter error, check to see if related to rate limit.
  try {
    const { data: user, errors: twitterError } =
      await twitterClient.users.findUserByUsername(username);

    if (user) {
      resp.id = user.id;

      const { error: dbError } = await supabaseClient
        .from('twitter_users')
        .insert({
          id: user.id,
          username: username,
        });

      if (dbError) resp.error = dbError.details;
    } else if (twitterError) {
      resp.error = twitterError[0].detail ?? 'Unknown Twitter error';
    }
  } catch (_error) {
    resp.error = 'Unknown Twitter error';
  }

  return new Response(JSON.stringify(resp), {
    headers: { 'Content-Type': 'application/json' },
  });
});

// To invoke:
// curl -i --location --request POST 'http://localhost:54321/functions/v1/fetch-user-id' \
//   --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
//   --header 'Content-Type: application/json' \
//   --data '{"username":"jack"}'
