const isThinkTagBoundary = (char) => !char || /[\s>/]/.test(char)

export function removeThinkBlocks(text) {
  let output = ''
  let pendingThinkBlock = ''
  let index = 0
  let inThinkBlock = false
  const lowerText = text.toLowerCase()

  while (index < text.length) {
    if (!inThinkBlock && lowerText.startsWith('<think', index)) {
      const boundary = text[index + 6]
      if (isThinkTagBoundary(boundary)) {
        const openTagEnd = text.indexOf('>', index + 6)
        if (openTagEnd === -1) {
          output += text.slice(index)
          return output
        }

        pendingThinkBlock = text.slice(index, openTagEnd + 1)
        index = openTagEnd + 1
        inThinkBlock = true
        continue
      }
    }

    if (inThinkBlock) {
      if (lowerText.startsWith('</think>', index)) {
        index += 8
        pendingThinkBlock = ''
        inThinkBlock = false
        continue
      }

      pendingThinkBlock += text[index]
      index += 1
      continue
    }

    output += text[index]
    index += 1
  }

  if (inThinkBlock) output += pendingThinkBlock

  return output
}
