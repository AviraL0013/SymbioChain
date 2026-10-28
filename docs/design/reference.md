# Landing page reference

Reference: https://ctrl.xyz/ and the supplied 68.87-second desktop recording. Use spacious white/off-white surfaces, oversized black sans-serif type, pastel cards, outlined illustrations, rounded controls, and a bright green CTA. SymbioChain's supplied logo contributes the lime accent. Scaffold colors are provisional, not measured reference values.

The user's reference takes precedence over generic presets. Do not turn the landing page into a dark cockpit or neon gradient dashboard. Application pages can be designed separately when requested.

## Observed sequence

1. Header: logo left, compact navigation center, black pill CTA right. Logo and CTA persist while scrolling.
2. Hero: oversized progressively revealed headline, inline symbol, whitespace, green CTA. The headline moves upward and fades as the demonstration enters.
3. Demonstration: tall outlined panel stays pinned while blue, yellow, and pink side cards progress. Previous cards collapse into labeled strips; supporting text and product screens change.
4. Chains: text/search left, vertical list and circular icons right. List items fade at the top and bottom.
5. Features: huge multiline headings, spacious blocks, then three tall pastel proof cards with animated illustrations.
6. Security: pale cards with horizontal movement during scrolling.
7. FAQ: outlined rounded pale rows, circular plus controls, expanding answers, dark hover state.
8. Footer: rounded input, black button, huge cycling headline, pointer-driven stickers, small links, final green CTA.

The green CTA contracts into an icon pill during the journey and expands near the bottom. Blue cursor glow is separate from the sticker trail. The reference's shutdown announcement is not SymbioChain content.

## Footer motion

Pointer movement spawns repeated stickers along its recent path, with varied rotation and overlapping instances. Older stickers shrink and fade. Stopping clears the trail. Horizontal motion forms rows; turns form curved clusters. Reference subjects include lightning coins, hands, controllers, characters, and blue semicircles. Create original SymbioChain artwork rather than copying those assets.

The headline cycles independently. Letters progressively disappear/reveal horizontally; a period remains visible through parts of the transition. The subscribe button turns from black to green on hover. Form controls must remain usable above decorations; decorative elements must not capture pointer events.

The recording was sampled every 0.2 seconds from 54 to 61 seconds for this effect. Exact easing, spawn distance, lifetime, font family, touch behavior, and mobile breakpoints remain unmeasured. Some reference media failed to load live. Do not claim these values are verified.

## Design principles

- Write original SymbioChain content about EYE, BRAIN, HAND, metabolism, TEE proofs, and supported cross-chain execution. Never invent user counts, revenue, audits, or completed trades.
- Preserve the reference's hierarchy and motion pacing while using original copy and artwork.
- Use semantic headings, native controls, visible keyboard focus, and accessible disclosure state.
- Respect reduced motion and disable pointer effects for coarse pointers. Content stays readable without decorative animation.
- Avoid whole-page rerenders on pointer movement. Bound sticker instances, animate transforms/opacity, and clean up listeners and animation loops.
- Verify phone layouts, keyboard behavior, reduced motion, and desktop scrolling before claiming visual completion.

## Logo

The original PNG is 612 by 408 pixels, RGBA. Visible bounds are `(103, 90)` to `(510, 295)`. Preserve the original and account for transparent padding. White lettering needs a contrast/placement decision for the white landing page; do not silently recolor it.

## Scope

Structure and analysis only. Landing composition, animations, stickers, and dashboard design are not implemented.
