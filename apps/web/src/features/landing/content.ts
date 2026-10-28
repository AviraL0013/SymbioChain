export const agents = [
  {
    name: "EYE",
    role: "The scout.",
    color: "blue",
    title: "Find the opportunity.",
    description:
      "Monitor cross-chain order flow and identify potential settlement spreads.",
    summary: "Watches order flow and surfaces candidate opportunities.",
    step: "01",
    screen: "An opportunity starts with a signal.",
    task: "Identify a candidate route",
  },
  {
    name: "BRAIN",
    role: "The assessor.",
    color: "yellow",
    title: "Think before acting.",
    description:
      "Assess the opportunity inside a TEE before deciding whether to proceed.",
    summary: "Evaluates risk, policies, and the cost of acting.",
    step: "02",
    screen: "Give every decision a second thought.",
    task: "Assess risk inside a TEE",
  },
  {
    name: "HAND",
    role: "The executor.",
    color: "pink",
    title: "Put the decision to work.",
    description:
      "Use Chain Signatures to prepare cross-chain execution from NEAR.",
    summary: "Prepares signing and execution after a decision.",
    step: "03",
    screen: "From a decision to a signing request.",
    task: "Prepare cross-chain execution",
  },
] as const;

export const faqs = [
  [
    "What is SymbioChain?",
    "An AI agent swarm being built on NEAR. Its three agents are designed to monitor opportunities, assess risk, and coordinate cross-chain execution while tracking the cost of their own compute.",
  ],
  [
    "How does the swarm fund itself?",
    "The proposed model uses settlement spread to pay inference and execution costs. Profitability depends on actual opportunities and costs; returns are not guaranteed.",
  ],
  [
    "What happens when funds run low?",
    "The planned metabolic rule compares available treasury with operating costs. Recovery and starvation behavior will be defined by the contract and agent implementation.",
  ],
  [
    "Why use a trusted execution environment?",
    "A TEE is intended to isolate risk inference and produce an attestation. The verifier must validate real evidence before the interface can report verification.",
  ],
  [
    "Which chains are involved?",
    "NEAR is the planned coordination and account layer. Ethereum and Solana are the planned execution destinations through Chain Signatures.",
  ],
  [
    "What are Proof of Metabolism NFTs?",
    "They are a planned record of swarm activity associated with the project's NFT design. Minting, liquidity ownership, and redemption behavior will be defined by the implemented contract.",
  ],
  [
    "Can I deposit or trade now?",
    "This prototype landing page does not accept deposits or execute trades. Those actions will be introduced when the application and contracts are ready.",
  ],
] as const;
