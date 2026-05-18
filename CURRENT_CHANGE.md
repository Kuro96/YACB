## Changes

### Fixes

- Track streaming reasoning and final content in separate state so DeepSeek thinking boundaries no longer depend on rendered `</think>` text.
- Add a Thinking Block setting with collapsed, expanded, and thinking-only expanded display modes.
- Collapse thinking blocks automatically once final answer content starts when the thinking-only mode is selected.

### Validation

- `npm test -- tests/unit/components/think-display.test.mjs tests/unit/config/user-config.test.mjs tests/unit/services/apis/shared.test.mjs`
- `npm test`
- `npm run lint`
- `npm run build`
- Playwright popup smoke test for the Thinking Block selector
