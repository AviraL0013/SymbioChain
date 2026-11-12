"use client";
import { Dialog } from "@/components/ui/dialog";
import { useWallet } from "./wallet-provider";
import { useDeployment } from "@/features/mainnet/deployment-provider";
import { formatNear } from "@/features/mainnet/format";
import { ArrowUpRight, LockKeyhole, Wallet } from "lucide-react";
import { Identifier } from "@/components/ui/data-display";
import "./wallet-panel.css";
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
      <p>Connect to inspect your NEAR account and balance.</p>
      {wallet.error && (
        <p className="app-field-error" role="status">
          {wallet.error}
        </p>
      )}
      {wallet.account ? (
        <>
          <div className="wallet-account">
            <span>NEAR mainnet account</span>
            <Identifier
              value={wallet.account.accountId}
              label="connected account"
            />
            <dl>
              <div>
                <dt>Total balance</dt>
                <dd>
                  {wallet.balance
                    ? formatNear(wallet.balance.balanceYocto) + " NEAR"
                    : "Loading…"}
                </dd>
              </div>
              <div>
                <dt>Available after storage</dt>
                <dd>
                  {wallet.balance
                    ? formatNear(wallet.balance.availableYocto) + " NEAR"
                    : "Unavailable"}
                </dd>
              </div>
            </dl>
          </div>
          <a
            href={
              "https://nearblocks.io/address/" +
              encodeURIComponent(wallet.account.accountId)
            }
            target="_blank"
            rel="noopener noreferrer"
            className="wallet-explorer"
          >
            View account on NEAR Explorer <ArrowUpRight size={14} />
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
            <Wallet size={16} /> Connect Meteor <ArrowUpRight size={14} />
          </button>
          <button
            className="sc-button sc-dialog-primary"
            disabled={wallet.pending}
            onClick={() => {
              onClose();
              void wallet.connect("mynearwallet");
            }}
          >
            <Wallet size={16} /> Connect MyNearWallet <ArrowUpRight size={14} />
          </button>
        </>
      ) : (
        <p>
          The PAPER environment uses simulated balances. Mainnet wallet
          connections become available with the LIVE deployment.
        </p>
      )}
      <div className="wallet-connection-note">
        <LockKeyhole size={15} />
        <p>
          Read-only connection. Keys stay in your wallet. No access key,
          deposit, transaction, or operator access is requested.
        </p>
      </div>
    </Dialog>
  );
}
