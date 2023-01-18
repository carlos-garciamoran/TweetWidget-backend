import { supabaseClient } from './supabaseAdmin.ts'
import { twitterClient } from './twitterClient.ts'
import { User } from './types.ts'

// TODO: move to .env
const MAX_RETRIES = 15
const MIN_DATE = new Date(2010, 11, 6)  // As specified by the API
const MONTH_INTERVAL = 6

export async function getTrackedUsers(): Promise<User[]|null> {
  const { data, error } = await supabaseClient
    .from('tracked_users')
    .select('id, username')

  if (error) {
    console.error(error)
    return null
  }

  return data
}

// TODO: get tweet date, likes, and retweets.
export async function getRandomUserTweet(id: string): Promise<string|null> {
  const data = undefined
  let tries = 0

  console.log(`[*] Getting tweets for ${id}...`)

  while (data === undefined && tries < MAX_RETRIES) {
    const [start, end] = generateRandomDates()

    console.log(`\t[*] Searching between ${start.split('T')[0]} and ${end.split('T')[0]}...`)

    try {
      const { data, meta } = await twitterClient.tweets.usersIdTweets(id, {
        exclude: ['replies', 'retweets'],
        start_time: start,
        end_time: end,
        max_results: 5,
      })

      if (data && meta?.result_count) {
        console.log(`\t[+] Got tweet!\n`)

        const randomIndex = Math.floor(Math.random() * meta.result_count)

        return data[randomIndex].text
      } else {
        console.log(`\t[${tries}] Got no tweets, retrying...\n`)
        tries += 1
      }
    } catch ({ error }) {
      console.error(`\t[!] Errored with: ${error}`)
    }
  }

  return null
}

function generateRandomDates(): string[] {
  const now = new Date()

  // Get a random date from MIN_DATE til now.
  const randomStartDate = new Date(
    MIN_DATE.getTime() + Math.random() * (now.getTime() - MIN_DATE.getTime())
  )
  const start_month = randomStartDate.getMonth()

  // Add MONTH_INTERVAL month to the start date.
  const randomEndDate = new Date(randomStartDate.setMonth(start_month + MONTH_INTERVAL))

  // Increase year by 1 if there's a month carry.
  if (start_month + MONTH_INTERVAL >= 12)
    randomEndDate.setFullYear(randomEndDate.getFullYear() + 1)

  // setMonth() overwrites the value of randomStartDate, so we need to set it back.
  randomStartDate.setMonth(start_month)

  // Return both dates converting them to '2010-11-06T00:00:00Z' format.
  return [
    randomStartDate.toISOString().split('.')[0] + 'Z',
    randomEndDate.toISOString().split('.')[0] + 'Z',
  ]
}

async function _getTweetById(id: string) {
  const tweet = await twitterClient.tweets.findTweetById(id);

  console.log(tweet)
}
