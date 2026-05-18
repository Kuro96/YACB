// custom api version

// There is a lot of duplicated code here, but it is very easy to refactor.
// The current state is mainly convenient for making targeted changes at any time,
// and it has not yet had a negative impact on maintenance.
// If necessary, I will refactor.

import { getUserConfig } from '../../config/index.mjs'
import { fetchSSE } from '../../utils/fetch-sse.mjs'
import { getConversationPairs } from '../../utils/get-conversation-pairs.mjs'
import { isEmpty } from 'lodash-es'
import {
  appendStreamAnswer,
  createStreamAnswerState,
  pushRecord,
  setAbortController,
} from './shared.mjs'
import { getChatCompletionsTokenParams } from './openai-token-params.mjs'

/**
 * @param {Browser.Runtime.Port} port
 * @param {string} question
 * @param {Session} session
 * @param {string} apiUrl
 * @param {string} apiKey
 * @param {string} modelName
 */
export async function generateAnswersWithCustomApi(
  port,
  question,
  session,
  apiUrl,
  apiKey,
  modelName,
) {
  const { controller, messageListener, disconnectListener } = setAbortController(port)

  const config = await getUserConfig()
  const prompt = getConversationPairs(
    session.conversationRecords.slice(-config.maxConversationContextLength),
    false,
  )
  prompt.push({ role: 'user', content: question })

  let answer = ''
  const streamAnswerState = createStreamAnswerState()
  let finished = false
  const finish = () => {
    finished = true
    pushRecord(session, question, answer)
    console.debug('conversation history', { content: session.conversationRecords })
    port.postMessage({ answer: null, done: true, session: session })
  }
  await fetchSSE(apiUrl, {
    method: 'POST',
    signal: controller.signal,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      messages: prompt,
      model: modelName,
      stream: true,
      ...getChatCompletionsTokenParams('custom', modelName, config.maxResponseTokenLength),
      temperature: config.temperature,
    }),
    onMessage(message) {
      console.debug('sse message', message)
      if (finished) return
      if (message.trim() === '[DONE]') {
        finish()
        return
      }
      let data
      try {
        data = JSON.parse(message)
      } catch (error) {
        console.debug('json error', error)
        return
      }

      if (typeof data.response === 'string') {
        streamAnswerState.reasoning = ''
        streamAnswerState.content = data.response
        answer = data.response
      } else {
        answer = appendStreamAnswer(streamAnswerState, data.choices?.[0])
      }
      port.postMessage({ answer: answer, done: false, session: null })

      if (data.choices?.[0]?.finish_reason) {
        finish()
        return
      }
    },
    async onStart() {},
    async onEnd() {
      port.postMessage({ done: true })
      port.onMessage.removeListener(messageListener)
      port.onDisconnect.removeListener(disconnectListener)
    },
    async onError(resp) {
      port.onMessage.removeListener(messageListener)
      port.onDisconnect.removeListener(disconnectListener)
      if (resp instanceof Error) throw resp
      const error = await resp.json().catch(() => ({}))
      throw new Error(!isEmpty(error) ? JSON.stringify(error) : `${resp.status} ${resp.statusText}`)
    },
  })
}
