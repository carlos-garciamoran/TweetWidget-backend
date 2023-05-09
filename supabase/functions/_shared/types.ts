export type Tweet = {
  id: string;
  username: string;
  text: string;
  like_count: number;
  reply_count: number;
  retweet_count: number;
  timestamp: string;
};

export type User = {
  id: string;
  username: string;
};
