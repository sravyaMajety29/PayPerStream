import { useState } from "react";
import { createPortal } from "react-dom";
import { useWallet } from "../context/WalletContext";

function ConnectWallet() {
  const { wallets, activeAddress } = useWallet();
  const [showModal, setShowModal] = useState(false);

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const handleDisconnect = async () => {
    if (wallets) {
      const activeWallet = wallets.find((w) => w.isActive);
      if (activeWallet) {
        await activeWallet.disconnect();
      }
    }
    setShowModal(false);
  };

  if (activeAddress) {
    return (
      <div className="flex items-center space-x-2">
        <span className="text-sm text-gray-600">{formatAddress(activeAddress)}</span>
        <button onClick={handleDisconnect} className="btn-secondary text-sm">
          Disconnect
        </button>
      </div>
    );
  }

  return (
    <>
      <button onClick={() => setShowModal(true)} className="btn-primary text-sm">
        Connect Wallet
      </button>

      {showModal &&
        createPortal(
          <div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] p-4"
            style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0 }}
          >
            <div className="bg-white rounded-lg p-6 max-w-md w-full shadow-xl transform transition-all">
              <h3 className="font-bold text-xl mb-4">Select Wallet Provider</h3>

              <div className="space-y-2">
                {wallets?.map((wallet) => (
                  <button
                    key={`provider-${wallet.id}`}
                    className="w-full btn-secondary flex items-center space-x-3 p-3"
                    onClick={async () => {
                      try {
                        await wallet.connect();
                        setShowModal(false);
                      } catch (error) {
                        console.error("Failed to connect wallet:", error);
                      }
                    }}
                  >
                    {wallet.metadata.icon && <img alt={`wallet_icon_${wallet.id}`} src={wallet.metadata.icon} className="w-6 h-6" />}
                    <span>{wallet.metadata.name}</span>
                  </button>
                ))}
              </div>

              <div className="mt-6 flex justify-end">
                <button className="btn-secondary" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}
    </>
  );
}

export default ConnectWallet;
