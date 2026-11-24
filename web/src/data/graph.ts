/** Grafo semántico derivado del catálogo: categorías raíz → intenciones hoja. */
import { CATALOG, type CategoryDef } from './catalog'

export type CategoryId = CategoryDef['id']

export const ROOT_CATEGORIES: ReadonlyArray<CategoryId> = CATALOG.map((c) => c.id)

export const SEMANTIC_GRAPH: Readonly<Record<string, Readonly<Record<string, number>>>> = {
  raiz: Object.fromEntries(ROOT_CATEGORIES.map((id) => [id, 1])),
  ...Object.fromEntries(
    CATALOG.map((c) => [c.id, Object.fromEntries(c.leaves.map((l) => [l.id, l.weight]))]),
  ),
}

/** Mensaje breve para el adulto según la intención inferida. */
export const INTENTION_MESSAGES: Readonly<Record<string, string>> = Object.fromEntries(
  CATALOG.flatMap((c) => c.leaves.map((l) => [l.id, l.message])),
)

/** Intenciones finales (hojas del grafo). */
export const LEAF_NODES: ReadonlyArray<string> = Object.keys(INTENTION_MESSAGES)

export const LABELS: Readonly<Record<string, string>> = Object.fromEntries([
  ...CATALOG.map((c) => [c.id, c.label]),
  ...CATALOG.flatMap((c) => c.leaves.map((l) => [l.id, l.label])),
])

/** Categoría de un pictograma (una categoría se pertenece a sí misma). */
export function categoryOf(key: string): CategoryId | null {
  const category = CATALOG.find((c) => c.id === key || c.leaves.some((l) => l.id === key))
  return category?.id ?? null
}

export function getLabel(key: string): string {
  return LABELS[key] ?? key.charAt(0).toUpperCase() + key.slice(1)
}

/** Frase del guía al elegir una categoría. */
export function getCheer(categoryId: string): string | null {
  return CATALOG.find((c) => c.id === categoryId)?.cheer ?? null
}
