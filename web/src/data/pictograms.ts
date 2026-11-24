import ids from './pictogram-ids.json'

/** IDs de ARASAAC resueltos de antemano: la web no depende de la API de búsqueda. */
const PICTOGRAM_IDS = ids as Readonly<Record<string, number>>

const CDN = 'https://static.arasaac.org/pictograms'

export function pictogramUrl(key: string, size: 300 | 500 = 300): string | null {
  const id = PICTOGRAM_IDS[key]
  return id === undefined ? null : `${CDN}/${id}/${id}_${size}.png`
}
