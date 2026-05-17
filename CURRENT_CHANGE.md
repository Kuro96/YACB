## Changes

### Fixes

- Keep DeepSeek V4 Pro thinking content out of default answer output.
- Collapse rendered thinking blocks by default so reasoning is not shown before the final answer.
- Strip `<think>...</think>` blocks from answer copy, read-aloud, and saved Markdown output.
- Use a linear scanner for stripping thinking blocks to avoid regex backtracking on malformed model output.

### Validation

- `npm test -- tests/unit/utils/remove-think-blocks.test.mjs tests/unit/services/apis/openai-api-compat.test.mjs`
- `npm test`
- `npm run lint`
- `npm run build`
