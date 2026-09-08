export interface TiktokAuthor {
  id: string;
  unique_id: string;
  nickname: string;
  avatar: string;
}

export interface TiktokVideoData {
  id: string;
  title: string;
  cover: string;
  duration: number;
  play: string;
  music: string;
  author: TiktokAuthor;
}

export interface TiktokResponse {
  code: number;
  msg: string;
  data: TiktokVideoData;
}
