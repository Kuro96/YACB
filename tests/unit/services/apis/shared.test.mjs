import assert from 'node:assert/strict'
import { test } from 'node:test'
import {
  appendStreamAnswer,
  createStreamAnswerState,
  pushRecord,
  setAbortController,
} from '../../../../src/services/apis/shared.mjs'
import { createFakePort } from '../../helpers/port.mjs'

test('pushRecord appends a new record in normal mode', () => {
  const session = {
    isRetry: false,
    conversationRecords: [],
  }

  pushRecord(session, 'Q1', 'A1')

  assert.deepEqual(session.conversationRecords, [{ question: 'Q1', answer: 'A1' }])
})

test('pushRecord overwrites last answer when retrying same question', () => {
  const session = {
    isRetry: true,
    conversationRecords: [{ question: 'Q1', answer: 'Old' }],
  }

  pushRecord(session, 'Q1', 'New')

  assert.equal(session.conversationRecords.length, 1)
  assert.deepEqual(session.conversationRecords[0], { question: 'Q1', answer: 'New' })
})

test('pushRecord appends when retry question differs from last one', () => {
  const session = {
    isRetry: true,
    conversationRecords: [{ question: 'Q1', answer: 'A1' }],
  }

  pushRecord(session, 'Q2', 'A2')

  assert.equal(session.conversationRecords.length, 2)
  assert.deepEqual(session.conversationRecords[1], { question: 'Q2', answer: 'A2' })
})

test('appendStreamAnswer keeps reasoning state separate from content chunks', () => {
  const state = createStreamAnswerState()

  assert.equal(
    appendStreamAnswer(state, { delta: { reasoning_content: 'Think' } }),
    '<think>Think</think>',
  )
  assert.equal(
    appendStreamAnswer(state, { delta: { reasoning_content: ' more' } }),
    '<think>Think more</think>',
  )
  assert.equal(
    appendStreamAnswer(state, { delta: { content: 'Final' } }),
    '<think>Think more</think>Final',
  )
  assert.deepEqual(state, { reasoning: 'Think more', content: 'Final' })
})

test('appendStreamAnswer does not infer thinking state from rendered answer text', () => {
  const state = createStreamAnswerState('Literal </think> marker')

  assert.equal(
    appendStreamAnswer(state, { delta: { reasoning_content: 'Hidden' } }),
    '<think>Hidden</think>Literal </think> marker',
  )
})

test('appendStreamAnswer treats message.content as a full answer', () => {
  const state = createStreamAnswerState()

  appendStreamAnswer(state, { delta: { reasoning_content: 'Hidden' } })
  assert.equal(
    appendStreamAnswer(state, { message: { content: 'Final content' } }),
    'Final content',
  )
  assert.deepEqual(state, { reasoning: '', content: 'Final content' })
})

test('setAbortController aborts and cleans listeners on stop message', (t) => {
  t.mock.method(console, 'debug', () => {})
  const port = createFakePort()
  let onStopCalled = 0

  const { controller } = setAbortController(port, () => {
    onStopCalled += 1
  })

  assert.equal(controller.signal.aborted, false)
  assert.deepEqual(port.listenerCounts(), { onMessage: 1, onDisconnect: 1 })

  port.emitMessage({ stop: true })

  assert.equal(controller.signal.aborted, true)
  assert.equal(onStopCalled, 1)
  assert.deepEqual(port.postedMessages, [{ done: true }])
  assert.deepEqual(port.listenerCounts(), { onMessage: 0, onDisconnect: 1 })
})

test('setAbortController aborts on disconnect and removes disconnect listener', (t) => {
  t.mock.method(console, 'debug', () => {})
  const port = createFakePort()
  let onDisconnectCalled = 0

  const { controller } = setAbortController(port, null, () => {
    onDisconnectCalled += 1
  })

  assert.equal(controller.signal.aborted, false)
  assert.deepEqual(port.listenerCounts(), { onMessage: 1, onDisconnect: 1 })

  port.emitDisconnect()

  assert.equal(controller.signal.aborted, true)
  assert.equal(onDisconnectCalled, 1)
  assert.deepEqual(port.listenerCounts(), { onMessage: 1, onDisconnect: 0 })
})

test('setAbortController ignores non-stop messages', (t) => {
  t.mock.method(console, 'debug', () => {})
  const port = createFakePort()
  let onStopCalled = 0

  const { controller } = setAbortController(port, () => {
    onStopCalled += 1
  })

  port.emitMessage({ stop: false })
  port.emitMessage({ foo: 'bar' })

  assert.equal(controller.signal.aborted, false)
  assert.equal(onStopCalled, 0)
  assert.deepEqual(port.postedMessages, [])
  assert.deepEqual(port.listenerCounts(), { onMessage: 1, onDisconnect: 1 })
})

test('setAbortController cleanController removes listeners safely', (t) => {
  t.mock.method(console, 'debug', () => {})
  const port = createFakePort()
  const { cleanController } = setAbortController(port)

  assert.deepEqual(port.listenerCounts(), { onMessage: 1, onDisconnect: 1 })

  cleanController()
  cleanController()

  assert.deepEqual(port.listenerCounts(), { onMessage: 0, onDisconnect: 0 })
})
