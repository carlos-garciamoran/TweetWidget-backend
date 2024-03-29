import { supabaseClient } from './supabaseAdmin.ts';
import { twitterClient } from './twitterClient.ts';
import { Tweet, User } from './types.ts';

// TODO: move to .env
const MAX_RETRIES = 10;
const MIN_DATE = new Date(2020, 1, 1);
const MONTH_INTERVAL = 2; // Interval between start and end date
const MONTHS_BEHIND = 3;

export async function getTrackedUsers(): Promise<User[] | null> {
  const { data, error } = await supabaseClient
    .from('twitter_users')
    .select('id, username');

  if (error) {
    console.error(`\t[!] getTrackedUsers: ${error}`);
    return null;
  }

  return data;
}

export async function getRandomTweetFromUser(
  id: string,
  username: string
): Promise<Tweet | null> {
  const data = undefined;
  let tries = 0;

  while (data === undefined && tries < MAX_RETRIES) {
    const [start, end] = generateRandomDates();

    // console.log(
    //   `\t[*] Searching ${start.split('T')[0]} to ${end.split('T')[0]}...`
    // );

    try {
      const { data, meta } = await twitterClient.tweets.usersIdTweets(id, {
        exclude: ['replies', 'retweets'],
        start_time: start,
        end_time: end,
        max_results: 5,
        'tweet.fields': ['created_at', 'public_metrics'],
      });

      if (data && meta?.result_count) {
        // console.log(`[+] Got tweet!\n`, data);
        const randomIndex = Math.floor(Math.random() * meta.result_count);

        const { id, created_at, public_metrics, text } = data[randomIndex];

        if (created_at && public_metrics) {
          const tweet: Tweet = {
            id: id,
            username: username,
            text: text,
            like_count: public_metrics.like_count,
            reply_count: public_metrics.reply_count,
            retweet_count: public_metrics.retweet_count,
            timestamp: created_at,
          };

          return tweet;
        }
      }
    } catch ({ error }) {
      console.error(`[${tries}] getRandomTweetFromUser: ${error.detail}`);
    }

    tries += 1;
  }

  return null;
}

function generateRandomDates(): string[] {
  const now = new Date();

  now.setMonth(now.getMonth() - MONTHS_BEHIND);

  // Get a random date from MIN_DATE till now minus MONTHS_BEHIND.
  const randomStartDate = new Date(
    MIN_DATE.getTime() + Math.random() * (now.getTime() - MIN_DATE.getTime())
  );
  const start_month = randomStartDate.getMonth();

  // Add MONTH_INTERVAL month to the start date.
  const randomEndDate = new Date(
    randomStartDate.setMonth(start_month + MONTH_INTERVAL)
  );

  // Increase year by 1 if there's a month carry.
  if (start_month + MONTH_INTERVAL >= 12)
    randomEndDate.setFullYear(randomEndDate.getFullYear() + 1);

  // setMonth() overwrites the value of randomStartDate, so we need to set it back.
  randomStartDate.setMonth(start_month);

  // Return both dates converting them to '2010-11-06T00:00:00Z' format.
  return [
    randomStartDate.toISOString().split('.')[0] + 'Z',
    randomEndDate.toISOString().split('.')[0] + 'Z',
  ];
}
