import { generateAnswersWithOpenAiApiCompat } from './openai-api.mjs'
import { apiModeToModelName } from '../../utils/model-name-convert.mjs'

// DeepSeek V4 flash/chat models stay explicit disabled by default to avoid
// unexpected reasoning_content payloads; pro/reasoner opt into thinking.
const deepSeekRequestBodies = {
  'deepseek-v4-flash': { thinking: { type: 'disabled' } },
  deepseek_chat: { thinking: { type: 'disabled' } },
  'deepseek-v4-pro': { thinking: { type: 'enabled' }, reasoning_effort: 'high' },
  deepseek_reasoner: { thinking: { type: 'enabled' }, reasoning_effort: 'high' },
}

function getDeepSeekRequestBody(modelName) {
  return deepSeekRequestBodies[modelName] ?? { thinking: { type: 'disabled' } }
}

/**
 * @param {Browser.Runtime.Port} port
 * @param {string} question
 * @param {Session} session
 * @param {string} apiKey
 */
export async function generateAnswersWithDeepSeekApi(port, question, session, apiKey) {
  const baseUrl = 'https://api.deepseek.com'
  const modelName = session.apiMode ? apiModeToModelName(session.apiMode) : session.modelName
  return generateAnswersWithOpenAiApiCompat(
    baseUrl,
    port,
    question,
    session,
    apiKey,
    getDeepSeekRequestBody(modelName),
  )
}
