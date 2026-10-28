export type AgentName = "EYE" | "BRAIN" | "HAND" | "SYSTEM";

export interface SwarmHealth {
  nearBalance: string;
  computeCostPerHour: string;
  survivalHours: number;
  status: "ALIVE" | "STARVING" | "DEAD";
  lastPulseTimestamp: number;
}

export interface DecisionLog {
  id: string;
  timestamp: number;
  agent: AgentName;
  action: string;
  details: string;
  teeAttestation?: string;
}

export interface TransactionLog {
  id: string;
  timestamp: number;
  txHash: string;
  chain: "NEAR" | "ETHEREUM" | "SOLANA";
  amount: string;
  asset: string;
  status: "PENDING" | "SUCCESS" | "FAILED";
  explorerUrl: string;
}

export interface ServerToClientEvents {
  health_update: (health: SwarmHealth) => void;
  new_decision: (decision: DecisionLog) => void;
  new_transaction: (transaction: TransactionLog) => void;
}
