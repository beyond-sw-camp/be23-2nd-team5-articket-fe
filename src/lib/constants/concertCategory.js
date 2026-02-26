/**
 * ConcertCategory - 백엔드 Enum 매핑
 */
export const CONCERT_CATEGORY = {
  MUSICAL: 'MUSICAL',
  CONCERT: 'CONCERT',
  THEATRE: 'THEATRE',
  CLASSIC: 'CLASSIC',
  SPORTS: 'SPORTS',
  EXHIBITION: 'EXHIBITION',
  FAMILY: 'FAMILY',
  OTHER: 'OTHER',
}

export const CONCERT_CATEGORY_LABELS = {
  [CONCERT_CATEGORY.MUSICAL]: '뮤지컬',
  [CONCERT_CATEGORY.CONCERT]: '콘서트',
  [CONCERT_CATEGORY.THEATRE]: '연극',
  [CONCERT_CATEGORY.CLASSIC]: '클래식/오페라',
  [CONCERT_CATEGORY.SPORTS]: '스포츠',
  [CONCERT_CATEGORY.EXHIBITION]: '전시/행사',
  [CONCERT_CATEGORY.FAMILY]: '가족/아동',
  [CONCERT_CATEGORY.OTHER]: '기타',
}

export const CONCERT_CATEGORY_OPTIONS = Object.entries(CONCERT_CATEGORY_LABELS).map(([value, label]) => ({
  value,
  label,
}))

export function getCategoryLabel(category) {
  return CONCERT_CATEGORY_LABELS[category] ?? category ?? '-'
}
