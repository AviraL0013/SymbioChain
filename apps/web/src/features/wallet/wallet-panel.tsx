"use client";
import { Dialog } from "@/components/ui/dialog";
import { useWallet } from "./wallet-provider";
import { useDeployment } from "@/features/mainnet/deployment-provider";
import { formatNear } from "@/features/mainnet/format";
export function WalletPanel({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const wallet = useWallet();
  const { runtime } = useDeployment();
  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={wallet.account ? "Connected NEAR wallet" : "Connect a NEAR wallet"}
    >
      <p>
        Mainnet connection. Signing keys stay in your wallet. Connecting does
        not grant backend operator access or authorize a payment.
      </p>
      {wallet.error && <p role="status">{wallet.error}</p>}
      {wallet.account ? (
        <>
          <p>
            <strong>{wallet.account.accountId}</strong>
          </p>
          <p>
            Total balance:{" "}
            {wallet.balance
              ? formatNear(wallet.balance.balanceYocto) + " NEAR"
              : "Loading mainnet balance…"}
          </p>
          <p>
            Spendable after on-chain storage:{" "}
            {wallet.balance
              ? formatNear(wallet.balance.availableYocto) + " NEAR"
              : "Unavailable"}
          </p>
          <a
            href={
              "https://nearblocks.io/address/" +
              encodeURIComponent(wallet.account.accountId)
            }
            target="_blank"
            rel="noopener noreferrer"
          >
            View account on NEAR Explorer ↗
          </a>
          <button
            className="sc-button sc-button-dark sc-dialog-primary"
            disabled={wallet.pending}
            onClick={() => void wallet.disconnect()}
          >
            Disconnect wallet
          </button>
        </>
      ) : runtime?.mode === "LIVE" ? (
        <>
          <button
            className="sc-button sc-button-dark sc-dialog-primary"
            disabled={wallet.pending}
            onClick={() => {
              onClose();
              void wallet.connect("meteor-wallet");
            }}
          >
            Connect Meteor
          </button>
          <button
            className="sc-button sc-dialog-primary"
            disabled={wallet.pending}
            onClick={() => {
              onClose();
              void wallet.connect("mynearwallet");
            }}
          >
            Connect MyNearWallet
          </button>
          <p>
            No access key, deposit or transaction is requested during
            connection.
          </p>
        </>
      ) : (
        <p>
          The PAPER environment uses simulated balances. Mainnet wallet
          connections become available with the LIVE deployment.
        </p>
      )}
    </Dialog>
  );
}
