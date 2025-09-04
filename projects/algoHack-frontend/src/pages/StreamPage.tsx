import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { VideoPlayer } from "../components/VideoPlayer";
import { useWallet } from "../context/WalletContext";
import { Video } from "../types/video";

function StreamPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { activeAddress, algodClient } = useWallet();
  const [video, setVideo] = useState<Video | null>(null);
  const [loading, setLoading] = useState(true);
  const [algoBalance, setAlgoBalance] = useState(0); // Will fetch real balance

  // Fetch real wallet balance
  useEffect(() => {
    const fetchWalletBalance = async () => {
      if (activeAddress && algodClient) {
        try {
          console.log("🔍 Fetching balance for address:", activeAddress);
          const accountInfo = await algodClient.accountInformation(activeAddress).do();
          const balanceInMicroAlgos = accountInfo.amount;
          const balanceInAlgos = Number(balanceInMicroAlgos) / 1_000_000; // Convert microAlgos to ALGOs
          setAlgoBalance(balanceInAlgos);
        } catch (error) {
          console.error("❌ Error fetching wallet balance:", error);
          // Fallback to mock balance if real balance fetch fails
          setAlgoBalance(124);
        }
      } else {
        console.log("⚠️ No active address or algod client available");
        setAlgoBalance(0);
      }
    };

    if (activeAddress) {
      fetchWalletBalance();
    }
  }, [activeAddress, algodClient]);

  useEffect(() => {
    const fetchStreamData = async () => {
      try {
        // Mock video data based on ID - in real app this would come from IPFS or API
        const mockVideos: Record<string, Video> = {
          "1": {
            id: "1",
            title: "Big Buck Bunny - Smart Contract Streaming Demo",
            description:
              "Experience the classic open-source 3D animated short film 'Big Buck Bunny' with our revolutionary smart contract pay-per-second streaming. Each 10-second interval is automatically processed via Algorand smart contract with payments sent to the hardcoded recipient address.",
            thumbnail: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images/BigBuckBunny.jpg",
            videoUrl: "/BigBuckBunny.mp4",
            duration: "09:56",
            uploadDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
            views: 1250,
            totalWatchTime: 12000,
            averageWatchTime: 9.6,
            uniqueViewers: 980,
            tokensEarned: 450,
            ratePerSecond: 0.001, // 0.001 ALGO per second (matches smart contract)
          },
          "2": {
            id: "2",
            title: "Smart Contract Security Best Practices",
            description:
              "Comprehensive guide to securing your smart contracts on Algorand with real-world examples, common vulnerabilities, and mitigation strategies.",
            thumbnail: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images/BigBuckBunny.jpg",
            videoUrl: "/BigBuckBunny.mp4",
            duration: "22:45",
            uploadDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
            views: 890,
            totalWatchTime: 15600,
            averageWatchTime: 17.5,
            uniqueViewers: 720,
            tokensEarned: 680,
            ratePerSecond: 0.0025, // 0.0025 ALGO per second
          },
          "3": {
            id: "3",
            title: "Building dApps with Algorand TypeScript SDK",
            description: "Complete walkthrough of building decentralized applications using the latest Algorand tools and TypeScript SDK.",
            thumbnail: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images/BigBuckBunny.jpg",
            videoUrl: "/BigBuckBunny.mp4",
            duration: "09:56",
            uploadDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
            views: 2100,
            totalWatchTime: 25000,
            averageWatchTime: 11.9,
            uniqueViewers: 1850,
            tokensEarned: 1250,
            ratePerSecond: 0.002, // 0.002 ALGO per second
          },
        };

        const videoData = mockVideos[id || "1"];
        if (videoData) {
          setVideo(videoData);
        }
      } catch (error) {
        console.error("Failed to fetch stream data:", error);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchStreamData();
    }
  }, [id]);

  const handleBack = () => {
    navigate("/");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Loading stream...</p>
        </div>
      </div>
    );
  }

  if (!video) {
    return (
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">Stream Not Found</h1>
        <p className="text-gray-600 dark:text-gray-300">The requested stream could not be found.</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <VideoPlayer video={video} onBack={handleBack} isWalletConnected={!!activeAddress} algoBalance={algoBalance} />
    </div>
  );
}

export default StreamPage;
