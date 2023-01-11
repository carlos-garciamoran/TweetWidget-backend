import { Client } from 'https://deno.land/x/twi@1.2.2/mod.ts'

const TWITTER_BEARER_TOKEN = Deno.env.get('TWITTER_BEARER_TOKEN')

if (!TWITTER_BEARER_TOKEN)  {
  console.error('TWITTER_BEARER_TOKEN not found, exiting...')
  Deno.exit(1)
}

export const twitterClient = new Client(TWITTER_BEARER_TOKEN)
