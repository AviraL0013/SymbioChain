# Treasury contract source

The Rust NEAR treasury lives in [symbiochain-core/contracts/treasury](https://github.com/SuyashAlphaC/symbiochain-core/tree/main/contracts/treasury), alongside its sandbox integration checks. This frontend repository does not duplicate the contract.

The deployed treasury is [treasury.symbio-fcef733893.near](https://nearblocks.io/address/treasury.symbio-fcef733893.near). The frontend observes finalized mainnet state; automated execution remains disarmed. See [current verification](https://github.com/SuyashAlphaC/symbiochain-core/blob/main/docs/VERIFICATION.md) for owner-authorized transfers, spending limits and the distinction between actual network execution and PAPER/sandbox fixtures. [Operations](https://github.com/SuyashAlphaC/symbiochain-core/blob/main/docs/OPERATIONS.md) covers custody and recovery.
