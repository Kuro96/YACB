import assert from 'node:assert/strict'
import { test } from 'node:test'
import {
  hasFinalAnswerAfterThinkBlock,
  shouldExpandThinkBlock,
} from '../../../src/components/MarkdownRender/think-display.mjs'

test('hasFinalAnswerAfterThinkBlock detects content after a think block', () => {
  assert.equal(hasFinalAnswerAfterThinkBlock('<think>plan</think>answer'), true)
  assert.equal(hasFinalAnswerAfterThinkBlock('<think>plan</think>   '), false)
  assert.equal(hasFinalAnswerAfterThinkBlock('answer only'), false)
})

test('shouldExpandThinkBlock supports collapsed and expanded modes', () => {
  assert.equal(shouldExpandThinkBlock('collapsed', '<think>plan</think>'), false)
  assert.equal(shouldExpandThinkBlock('expanded', '<think>plan</think>answer', true), true)
})

test('shouldExpandThinkBlock expands only while reasoning in thinkingExpanded mode', () => {
  assert.equal(shouldExpandThinkBlock('thinkingExpanded', '<think>plan</think>', false), true)
  assert.equal(
    shouldExpandThinkBlock('thinkingExpanded', '<think>plan</think>answer', false),
    false,
  )
  assert.equal(shouldExpandThinkBlock('thinkingExpanded', '<think>plan</think>', true), false)
})
