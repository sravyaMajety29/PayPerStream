import { Dashboard } from "../components/Dashboard";
import { useWallet } from "../context/WalletContext";

function DashboardPage() {
  const { activeAddress } = useWallet();

  const mockConnectedServices = ["Algorand Wallet", "IPFS", "Stream Analytics"];

  return (
    <div className="max-w-7xl mx-auto">
      <Dashboard isWalletConnected={!!activeAddress} connectedServices={mockConnectedServices} isTracking={!!activeAddress} />
    </div>
  );
}

export default DashboardPage;
