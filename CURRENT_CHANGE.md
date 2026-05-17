## Changes

### Fixes

- Fix DeepSeek V4 Pro streaming thinking output being split into many separate thinking blocks.
- Consecutive OpenAI-compatible `reasoning_content` chunks now stay in the same `<think>` block while final answer content remains outside the block.

### Validation

- `npm test -- tests/unit/services/apis/openai-api-compat.test.mjs`
- `npm test`
- `npm run lint`
- `npm run build`
