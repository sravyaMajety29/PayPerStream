export interface Video {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  videoUrl: string; // URL to the actual video file
  duration: string;
  uploadDate: Date;
  views: number;
  totalWatchTime: number;
  averageWatchTime: number;
  uniqueViewers: number;
  tokensEarned: number;
  ratePerSecond: number; // Using per-second as it's more precise for streaming
}
