export function hasFinalAnswerAfterThinkBlock(content = '') {
  const thinkEnd = content.indexOf('</think>')
  if (thinkEnd === -1) return false

  return content.slice(thinkEnd + '</think>'.length).trim().length > 0
}

export function shouldExpandThinkBlock(mode, answerContent = '', answerDone = false) {
  if (mode === 'expanded') return true
  if (mode === 'thinkingExpanded')
    return !answerDone && !hasFinalAnswerAfterThinkBlock(answerContent)
  return false
}
