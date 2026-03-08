/**
 * 사용자 이름/닉네임 마스킹 (예: 김철수 → 김**)
 * @param {string} name - 원본 이름
 * @returns {string} 첫 글자 + '**'
 */
export function maskNickname(name) {
  if (name == null || typeof name !== 'string') return '**'
  const trimmed = name.trim()
  if (!trimmed) return '**'
  return trimmed[0] + '**'
}
