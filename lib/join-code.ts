const CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789' // no I,O,0,1 to avoid confusion

export function generateJoinCode(): string {
  let code = ''
  for (let i = 0; i < 6; i++) {
    const idx = Math.floor(Math.random() * CHARS.length)
    code += CHARS[idx] ?? 'A'
  }
  return code
}
