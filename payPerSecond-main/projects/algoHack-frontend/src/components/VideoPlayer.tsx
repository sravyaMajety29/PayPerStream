import { useState, useEffect, useRef, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Progress } from "./ui/progress";
import { toast } from "sonner";
import { ArrowLeft, Clock, Eye, Calendar, BarChart3, DollarSign, Zap } from "lucide-react";
import { Video } from "../types/video";
import { useWallet } from "../context/WalletContext";
import { useStreamContract } from "../hooks/useStreamContract";

interface VideoPlayerProps {
  video: Video;
  onBack: () => void;
  isWalletConnected: boolean;
  algoBalance: number;
}

export function VideoPlayer({ video, onBack, isWalletConnected, algoBalance }: VideoPlayerProps) {
  // Get detailed wallet information and stream contract
  const wallet = useWallet();
  const streamContract = useStreamContract();

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [watchStartTime, setWatchStartTime] = useState<Date | null>(null);
  const [totalWatchedTime, setTotalWatchedTime] = useState(0);
  const [sessionCost, setSessionCost] = useState(0);
  const playerRef = useRef<HTMLVideoElement>(null);

  // Convert duration string to seconds for calculations
  const durationInSeconds = video.duration.split(":").reduce((acc, time) => 60 * acc + +time, 0);

  // Get rate information from stream contract or fallback to video rate
  const ratePerSecond = Number(streamContract.streamInfo?.pricePerSecond ?? 0) / 1000000 || video.ratePerSecond;
  const ratePerMinute = useMemo(() => ratePerSecond * 60, [ratePerSecond]);
  const costPer10Seconds = useMemo(() => ratePerSecond * 10, [ratePerSecond]);

  // Log wallet details when connection status changes
  useEffect(() => {
    if (isWalletConnected && streamContract.streamInfo) {
      // Reduced logging - only essential info
      console.log("💰 Wallet Connected:", wallet.activeAddress);
    } else if (!isWalletConnected) {
      console.log("❌ Wallet Disconnected");
    }
    // Only log when wallet connection status changes, not on every render
  }, [isWalletConnected, wallet.activeAddress]); // Removed objects that change on every render

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isPlaying && watchStartTime) {
      interval = setInterval(() => {
        if (playerRef.current) {
          const newTime = playerRef.current.currentTime;
          setCurrentTime(newTime);
          setTotalWatchedTime(newTime);

          const watchedSeconds = newTime;
          const cost = watchedSeconds * ratePerSecond;
          setSessionCost(cost);

          // Simulate sending tracking data to backend
          if (Math.floor(newTime) % 10 === 0 && Math.floor(newTime) > 0) {
            // Every 10 seconds - reduced logging
            // console.log("📊 Tracking data:", {
            //   videoId: video.id,
            //   userId: wallet.activeAddress,
            //   watchTime: newTime,
            //   timestamp: new Date(),
            //   tokensSpent: cost,
            //   contractTotalPaid: streamContract.totalPaid,
            // });
          }
        }
      }, 1000); // Update every second for smoother UI
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isPlaying, watchStartTime, video.id, ratePerSecond, wallet.activeAddress, streamContract.totalPaid]);

  const startWatching = async () => {
    if (!isWalletConnected) {
      toast.error("Please connect your wallet to start streaming");
      return;
    }

    if (!streamContract.isWalletConnected) {
      toast.error("Stream contract not ready. Please wait...");
      return;
    }

    if (algoBalance < costPer10Seconds) {
      toast.error(`Insufficient balance. Need at least ${costPer10Seconds.toFixed(3)} ALGO for 10 seconds`);
      return;
    }

    try {
      // Start streaming session with smart contract
      const success = await streamContract.startStreaming();

      if (success) {
        setWatchStartTime(new Date());
        setIsPlaying(true);

        // Auto-play video
        if (playerRef.current) {
          playerRef.current.play();
        }

        console.log("🎬 Video streaming started with smart contract");
      }
    } catch (error) {
      console.error("Failed to start streaming:", error);
      toast.error("Failed to start streaming session");
    }
  };

  const handleStop = async () => {
    setIsPlaying(false);

    if (watchStartTime && totalWatchedTime > 0) {
      try {
        // Stop streaming session with smart contract
        await streamContract.stopStreaming();

        const totalMinutes = totalWatchedTime / 60;
        const finalCost = totalMinutes * ratePerMinute;

        toast.success(
          `Session ended. Watched: ${Math.floor(totalWatchedTime / 60)}m ${Math.floor(
            totalWatchedTime % 60
          )}s • Total cost: ${finalCost.toFixed(3)} ALGO`
        );

        console.log("🏁 Session ended:", {
          videoId: video.id,
          totalWatchTime: totalWatchedTime,
          totalCost: finalCost,
          contractTotalPaid: streamContract.totalPaid,
          startTime: watchStartTime,
          endTime: new Date(),
          ratePerMinute: ratePerMinute,
        });
      } catch (error) {
        console.error("Failed to stop streaming:", error);
        toast.error("Failed to stop streaming session");
      }
    }

    // Pause video
    if (playerRef.current) {
      playerRef.current.pause();
    }

    // Reset tracking
    setCurrentTime(0);
    setTotalWatchedTime(0);
    setWatchStartTime(null);
    setSessionCost(0);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const progressPercentage = (currentTime / durationInSeconds) * 100;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Back Button */}
      <Button variant="ghost" onClick={onBack} className="mb-4">
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Videos
      </Button>

      {/* Wallet Balance Display */}
      {isWalletConnected && (
        <div className="bg-gradient-to-r from-blue-50 to-green-50 dark:from-blue-900/20 dark:to-green-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-green-600 rounded-full flex items-center justify-center">
                <DollarSign className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold">Wallet Balance</h3>
                <p className="text-sm">Available for streaming</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-green-600 dark:text-green-900">{algoBalance.toFixed(3)} ALGO</div>
              <div className="text-xs text-gray-600 dark:text-gray-900">≈ {Math.floor(algoBalance / ratePerMinute)} minutes available</div>
            </div>
          </div>
        </div>
      )}

      {/* Smart Contract Status */}
      {isWalletConnected && streamContract.streamInfo && (
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg p-4 border border-purple-200 dark:border-purple-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center">
                <Zap className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold">Smart Contract Status</h3>
                <p className="text-sm">10-second interval payments</p>
              </div>
            </div>
            <div className="text-right">
              {streamContract.isStreaming ? (
                <div className="text-green-600 font-semibold">ACTIVE</div>
              ) : (
                <div className="text-gray-600">READY</div>
              )}
              <div className="text-xs text-gray-600">
                {(Number(streamContract.streamInfo.tenSecondCost) / 1000000).toFixed(3)} ALGO per 10s
              </div>
            </div>
          </div>

          {streamContract.isStreaming && streamContract.totalPaid > 0 && (
            <div className="mt-3 pt-3 border-t border-purple-200 dark:border-purple-700">
              <div className="flex justify-between text-sm">
                <span>Contract Total Paid:</span>
                <span className="font-medium">{streamContract.totalPaid.toFixed(3)} ALGO</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Stream Title:</span>
                <span className="font-medium">{streamContract.streamInfo.title}</span>
              </div>
            </div>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Video Player */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardContent className="p-0">
              {/* Video Container */}
              <div className="relative aspect-video bg-black rounded-t-lg overflow-hidden">
                {/* Native HTML5 Video Player */}
                {isWalletConnected ? (
                  <video
                    ref={playerRef}
                    className="w-full h-full"
                    controls
                    preload="metadata"
                    poster={video.thumbnail}
                    onTimeUpdate={() => {
                      if (playerRef.current) {
                        const currentTime = playerRef.current.currentTime;
                        setCurrentTime(currentTime);
                        setTotalWatchedTime(currentTime);
                      }
                    }}
                    onPlay={() => {
                      if (!streamContract.isStreaming) {
                        // If not streaming via contract, start it
                        startWatching();
                      } else {
                        setIsPlaying(true);
                      }
                    }}
                    onPause={() => {
                      setIsPlaying(false);
                    }}
                    onEnded={() => {
                      setIsPlaying(false);
                      handleStop();
                    }}
                    onError={(error) => {
                      console.error("Video error:", error);
                      toast.error("Failed to load video");
                    }}
                  >
                    <source src="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4" type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>
                ) : (
                  /* Wallet Not Connected Overlay */
                  <div className="w-full h-full flex items-center justify-center bg-gray-900">
                    <div className="text-center space-y-4 p-8">
                      <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-10 h-10 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                          />
                        </svg>
                      </div>
                      <h3 className="text-xl font-semibold text-white mb-2">Wallet Required for Smart Contract</h3>
                      <p className="text-gray-300 text-sm max-w-md mb-3">
                        Connect your Algorand wallet to start streaming with automatic 10-second interval payments via smart contract.
                      </p>
                      <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3 mt-4">
                        <p className="text-yellow-200 text-xs">
                          <strong>Smart Contract Rate:</strong> {costPer10Seconds.toFixed(3)} ALGO per 10 seconds
                        </p>
                        <p className="text-yellow-200 text-xs mt-1">
                          <strong>Stream Title:</strong> {streamContract.streamInfo?.title || "TapToStream"}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
                {/* Progress and cost overlay (when playing) */}
                {watchStartTime && isPlaying && (
                  <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-sm rounded-lg p-2">
                    <div className="text-xs text-white space-y-1">
                      <div>
                        Watched: {formatTime(totalWatchedTime)} / {video.duration}
                      </div>
                      <div>Cost: {sessionCost.toFixed(3)} ALGO</div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Video Info */}
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <CardTitle className="text-xl">{video.title}</CardTitle>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Eye className="h-4 w-4" />
                      <span>{video.views.toLocaleString()} views</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      <span>{formatDate(video.uploadDate)}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      <span>{video.duration}</span>
                    </div>
                  </div>
                </div>

                {watchStartTime && (
                  <Button onClick={handleStop} variant="outline" size="sm">
                    End Session
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-base leading-relaxed">{video.description}</CardDescription>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Smart Contract Session Stats */}
          {streamContract.isStreaming && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  Smart Contract Session
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-2xl font-bold">{streamContract.totalPaid.toFixed(3)}</div>
                    <p className="text-xs text-muted-foreground">Contract Paid (ALGO)</p>
                  </div>
                  <div>
                    <div className="text-2xl font-bold">{formatTime(totalWatchedTime)}</div>
                    <p className="text-xs text-muted-foreground">Time Watched</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Session Started</span>
                    <span>{streamContract.sessionStartTime?.toLocaleTimeString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Payment Rate</span>
                    <span>{costPer10Seconds.toFixed(3)} ALGO/10s</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Stream Status</span>
                    <span className="font-mono text-xs">{streamContract.streamInfo?.active ? "Active" : "Inactive"}</span>
                  </div>
                </div>

                <Button onClick={handleStop} variant="outline" size="sm" className="w-full" disabled={!streamContract.isStreaming}>
                  End Contract Session
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Current Session Stats */}
          {watchStartTime && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Current Session
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-2xl font-bold">{formatTime(totalWatchedTime)}</div>
                    <p className="text-xs text-muted-foreground">Time Watched</p>
                  </div>
                  <div>
                    <div className="text-2xl font-bold">${sessionCost.toFixed(4)}</div>
                    <p className="text-xs text-muted-foreground">Session Cost</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Progress</span>
                    <span>{Math.round(progressPercentage)}%</span>
                  </div>
                  <Progress value={progressPercentage} />
                </div>

                <div className="text-xs text-muted-foreground">Rate: {ratePerMinute} ALGO/minute</div>
              </CardContent>
            </Card>
          )}

          {/* Video Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Video Statistics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Total Views</span>
                  <span className="font-medium">{video.views.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Unique Viewers</span>
                  <span className="font-medium">{video.uniqueViewers.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Total Watch Time</span>
                  <span className="font-medium">
                    {Math.floor(video.totalWatchTime / 60)}h {video.totalWatchTime % 60}m
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Avg Watch Time</span>
                  <span className="font-medium">
                    {Math.floor(video.averageWatchTime / 60)}m {video.averageWatchTime % 60}s
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Future Monetization Preview */}
          <Card className="border-dashed">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Monetization Ready
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-3">
                This video is ready for pay-per-minute monetization. Viewers will be charged based on actual watch time.
              </p>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Total Earned</span>
                  <span className="font-medium">{video.tokensEarned} ALGO</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Rate per Minute</span>
                  <span className="font-medium">{ratePerMinute} ALGO</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
