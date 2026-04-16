import { useState } from "react";
import { Card, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";
import { Play } from "lucide-react";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { Video } from "../types/video";

interface VideoFeedProps {
  videos: Video[];
  onVideoSelect: (video: Video) => void;
  isWalletConnected: boolean;
}

export function VideoFeed({ videos, onVideoSelect, isWalletConnected }: VideoFeedProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<"recent" | "popular" | "duration">("recent");

  const filteredAndSortedVideos = videos
    .filter(
      (video) =>
        video.title.toLowerCase().includes(searchTerm.toLowerCase()) || video.description.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      switch (sortBy) {
        case "popular":
          return b.views - a.views;
        case "duration":
          return parseInt(b.duration.split(":")[0]) - parseInt(a.duration.split(":")[0]);
        case "recent":
        default:
          return b.uploadDate.getTime() - a.uploadDate.getTime();
      }
    });

  const formatDate = (date: Date) => {
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks ago`;
    return `${Math.ceil(diffDays / 30)} months ago`;
  };

  const formatViews = (views: number) => {
    if (views >= 1000000) return `${(views / 1000000).toFixed(1)}M`;
    if (views >= 1000) return `${(views / 1000).toFixed(1)}K`;
    return views.toString();
  };

  // Featured video (first video)
  const featuredVideo = filteredAndSortedVideos[0];
  const recommendedVideos = filteredAndSortedVideos.slice(1);

  return (
    <div className="space-y-8">
      {/* Featured Video Section */}
      {featuredVideo && (
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold">Video title</h2>

          <div
            className="relative aspect-video bg-gray-200 rounded-lg overflow-hidden cursor-pointer group"
            onClick={(e) => {
              console.log("🎬 VideoFeed: Featured video clicked:", featuredVideo.id, featuredVideo.title);
              onVideoSelect(featuredVideo);
            }}
          >
            <ImageWithFallback src={featuredVideo.thumbnail} alt={featuredVideo.title} className="w-full h-full object-cover" />

            {/* Play Button Overlay */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-20 h-20 bg-black/80 rounded-full flex items-center justify-center group-hover:bg-black/90 transition-colors">
                <Play className="h-8 w-8 text-white fill-white ml-1" />
              </div>
            </div>

            {/* Duration Badge */}
            <Badge variant="secondary" className="absolute bottom-4 right-4 bg-black/80 text-white hover:bg-black/80">
              {featuredVideo.duration}
            </Badge>

            {/* Token Rate */}
            {isWalletConnected && (
              <Badge variant="secondary" className="absolute top-4 left-4 bg-teal-600 text-white hover:bg-teal-600">
                {(featuredVideo.ratePerSecond * 60).toFixed(3)} ALGO/min
              </Badge>
            )}
          </div>
        </div>
      )}

      {/* Recommended Videos */}
      {recommendedVideos.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-xl font-semibold">Recommended videos</h3>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {recommendedVideos.slice(0, 4).map((video) => (
              <div
                key={video.id}
                className="relative aspect-video bg-gray-200 rounded-lg overflow-hidden cursor-pointer group"
                onClick={() => {
                  console.log("🎥 VideoFeed: Card clicked for video:", video.id, video.title);
                  onVideoSelect(video);
                }}
              >
                <ImageWithFallback
                  src={video.thumbnail}
                  alt={video.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                />

                {/* Play Button Overlay */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/20">
                  <div className="w-12 h-12 bg-black/80 rounded-full flex items-center justify-center">
                    <Play className="h-5 w-5 text-white fill-white ml-0.5" />
                  </div>
                </div>

                {/* Duration Badge */}
                <Badge variant="secondary" className="absolute bottom-2 right-2 bg-black/80 text-white hover:bg-black/80 text-xs">
                  {video.duration}
                </Badge>

                {/* Token Rate */}
                {isWalletConnected && (
                  <Badge variant="secondary" className="absolute top-2 left-2 bg-teal-600 text-white hover:bg-teal-600 text-xs">
                    {(video.ratePerSecond * 60).toFixed(3)} ALGO/min
                  </Badge>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Wallet Connection Prompt */}
      {!isWalletConnected && (
        <Card className="border-dashed border-2 border-teal-200 bg-teal-50">
          <CardContent className="text-center py-8">
            <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Play className="h-8 w-8 text-teal-600" />
            </div>
            <h3 className="font-semibold mb-2 text-teal-900">Connect Your Wallet to Start Earning</h3>
            <p className="text-teal-700 mb-4">
              Connect your Algorand wallet to start earning ALGO tokens while viewers watch your content.
            </p>
            <Badge variant="outline" className="border-teal-300 text-teal-700">
              Crypto-Powered Video Platform
            </Badge>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
