import assert from 'node:assert/strict'
import { test } from 'node:test'
import { removeThinkBlocks } from '../../../src/utils/remove-think-blocks.mjs'

test('removeThinkBlocks removes a single think block', () => {
  assert.equal(removeThinkBlocks('<think>hidden reasoning</think>Final answer'), 'Final answer')
})

test('removeThinkBlocks removes multiple think blocks', () => {
  assert.equal(
    removeThinkBlocks('First <think>hidden one</think>middle<think>hidden two</think> last'),
    'First middle last',
  )
})

test('removeThinkBlocks removes multiline think blocks', () => {
  assert.equal(
    removeThinkBlocks('Intro\n<think>line one\nline two\nline three</think>\nAnswer'),
    'Intro\n\nAnswer',
  )
})

test('removeThinkBlocks removes think blocks with attributes and uppercase tags', () => {
  assert.equal(
    removeThinkBlocks('Before <THINK data-source="model">hidden</THINK> after'),
    'Before  after',
  )
})

test('removeThinkBlocks preserves incomplete think blocks', () => {
  assert.equal(removeThinkBlocks('Before <think>unfinished'), 'Before <think>unfinished')
})

test('removeThinkBlocks does not treat think-like tags as think blocks', () => {
  const text = 'Before <thinking>visible</thinking> after'

  assert.equal(removeThinkBlocks(text), text)
})

test('removeThinkBlocks handles many incomplete think blocks without backtracking', () => {
  const text = `${'<think>'.repeat(1000)}visible`

  assert.equal(removeThinkBlocks(text), text)
})

test('removeThinkBlocks preserves normal text', () => {
  const text = 'Plain answer with <strong>markdown</strong> and no thinking block.'

  assert.equal(removeThinkBlocks(text), text)
})
