import { Client } from 'https://deno.land/x/twi@1.2.2/mod.ts'

export const twitterClient = new Client(Deno.env.get('TWITTER_BEARER_TOKEN') ?? '')
