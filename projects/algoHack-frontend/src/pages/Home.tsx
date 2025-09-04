import { useNavigate } from "react-router-dom";
import { VideoFeed } from "../components/VideoFeed";
import { useWallet } from "../context/WalletContext";
import { Video } from "../types/video";

function Home() {
  const navigate = useNavigate();
  const { activeAddress } = useWallet();

  const mockVideos: Video[] = [
    {
      id: "1",
      title: "Big Buck Bunny - Open Source Animation",
      description: "Experience the classic open-source 3D animated short film 'Big Buck Bunny' in our pay-per-second streaming format",
      thumbnail: "https://m.media-amazon.com/images/M/MV5BNmZkNWNmYTgtNmYyMy00NTM0LThiOWYtY2FmMzBiNTRhNmZiXkEyXkFqcGc@._V1_.jpg",
      videoUrl: "/BigBuckBunny.mp4",
      duration: "09:56",
      uploadDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
      views: 1250,
      totalWatchTime: 12000,
      averageWatchTime: 9.6,
      uniqueViewers: 980,
      tokensEarned: 450,
      ratePerSecond: 0.001, // 0.001 ALGO per second
    },
    {
      id: "2",
      title: "Smart Contract Security Best Practices",
      description: "Comprehensive guide to securing your smart contracts on Algorand with real-world examples",
      thumbnail: "https://m.media-amazon.com/images/M/MV5BNmZkNWNmYTgtNmYyMy00NTM0LThiOWYtY2FmMzBiNTRhNmZiXkEyXkFqcGc@._V1_.jpg",
      videoUrl: "/BigBuckBunny.mp4", // Using same video for demo
      duration: "09:56",
      uploadDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
      views: 890,
      totalWatchTime: 15600,
      averageWatchTime: 17.5,
      uniqueViewers: 720,
      tokensEarned: 680,
      ratePerSecond: 0.0025, // 0.0025 ALGO per second
    },
    {
      id: "3",
      title: "Building dApps with Algorand TypeScript SDK",
      description: "Complete walkthrough of building decentralized applications using the latest Algorand tools",
      thumbnail: "https://m.media-amazon.com/images/M/MV5BNmZkNWNmYTgtNmYyMy00NTM0LThiOWYtY2FmMzBiNTRhNmZiXkEyXkFqcGc@._V1_.jpg",
      videoUrl: "/BigBuckBunny.mp4", // Using same video for demo
      duration: "09:56",
      uploadDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
      views: 2100,
      totalWatchTime: 25000,
      averageWatchTime: 11.9,
      uniqueViewers: 1850,
      tokensEarned: 1250,
      ratePerSecond: 0.002, // 0.002 ALGO per second
    },
  ];

  const handleVideoSelect = (video: Video) => {
    try {
      navigate(`/stream/${video.id}`);
      console.log("✅ Navigate call completed");

      // Check if navigation actually happened after a short delay
      setTimeout(() => {
        console.log("📍 Location after navigation:", window.location.href);
      }, 100);
    } catch (error) {
      console.error("❌ Navigation error:", error);
    }
  };

  return (
    <div>
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">TapToStream</h1>
        <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
          Pay-per-second video streaming powered by Algorand smart contracts. Watch what you want, pay only for what you consume.
        </p>
      </div>

      <VideoFeed videos={mockVideos} onVideoSelect={handleVideoSelect} isWalletConnected={!!activeAddress} />

      <div className="mt-12 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl p-8 border border-blue-100 dark:border-blue-800">
        <div className="text-center">
          <h3 className="text-2xl font-semibold text-blue-900 dark:text-blue-100 mb-6">How TapToStream Works</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-blue-700 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                <span className="text-white font-bold text-xl">1</span>
              </div>
              <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-3 text-lg">Connect Wallet</h4>
              <p className="text-blue-700 dark:text-blue-300 text-sm leading-relaxed">
                Connect your Algorand wallet to get started with secure, decentralized payments
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-purple-700 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                <span className="text-white font-bold text-xl">2</span>
              </div>
              <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-3 text-lg">Pay for Time</h4>
              <p className="text-blue-700 dark:text-blue-300 text-sm leading-relaxed">
                Purchase streaming time in seconds using ALGO with transparent, fair pricing
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-green-600 to-green-700 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                <span className="text-white font-bold text-xl">3</span>
              </div>
              <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-3 text-lg">Watch & Enjoy</h4>
              <p className="text-blue-700 dark:text-blue-300 text-sm leading-relaxed">
                Stream high-quality video for exactly the time you've purchased
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;
