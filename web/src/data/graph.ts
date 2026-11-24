/** Grafo semántico: categorías raíz → intenciones hoja (con su peso de relevancia). */

export type CategoryId = 'alimentacion' | 'actividades' | 'emociones' | 'entorno'

export const SEMANTIC_GRAPH: Readonly<Record<string, Readonly<Record<string, number>>>> = {
  raiz: { alimentacion: 1, actividades: 1, emociones: 1, entorno: 1 },
  alimentacion: {
    hambre: 1, sed: 1, dulce: 0.8, salado: 0.8, caliente: 0.7, frio_comida: 0.7,
    fruta: 0.9, verdura: 0.9, carne: 0.9, pan: 0.8, leche: 0.8, agua: 0.9,
  },
  actividades: {
    jugar: 1, descansar: 1, banio: 0.9, salir: 0.9, dormir: 1, caminar: 0.8, leer: 0.8, musica: 0.8,
  },
  emociones: {
    feliz: 1, triste: 1, dolor: 1, cansado: 0.9, enojado: 0.9, asustado: 0.9, aburrido: 0.8, sorprendido: 0.7,
  },
  entorno: { casa: 1, colegio: 1, doctor: 0.9, parque: 0.8, tienda: 0.8, transporte: 0.7 },
}

export const ROOT_CATEGORIES = Object.keys(SEMANTIC_GRAPH['raiz'] ?? {}) as CategoryId[]

/** Mensaje para el terapeuta según la intención inferida. */
export const INTENTION_MESSAGES: Readonly<Record<string, string>> = {
  hambre: 'El usuario tiene hambre y quiere comer algo.',
  sed: 'El usuario tiene sed y quiere beber algo.',
  dulce: 'El usuario quiere comer algo dulce.',
  salado: 'El usuario quiere comer algo salado.',
  caliente: 'El usuario quiere algo caliente para comer o beber.',
  frio_comida: 'El usuario quiere algo frío para comer o beber.',
  fruta: 'El usuario quiere comer fruta.',
  verdura: 'El usuario quiere comer verduras.',
  carne: 'El usuario quiere comer carne.',
  pan: 'El usuario quiere comer pan.',
  leche: 'El usuario quiere tomar leche.',
  agua: 'El usuario quiere tomar agua.',
  jugar: 'El usuario quiere jugar.',
  descansar: 'El usuario quiere descansar un momento.',
  banio: 'El usuario necesita ir al baño.',
  salir: 'El usuario quiere salir.',
  dormir: 'El usuario tiene sueño y quiere dormir.',
  caminar: 'El usuario quiere salir a caminar.',
  leer: 'El usuario quiere leer o que le lean algo.',
  musica: 'El usuario quiere escuchar música.',
  feliz: 'El usuario está expresando que se siente feliz.',
  triste: 'El usuario está triste o necesita apoyo.',
  dolor: 'El usuario siente dolor. Verificar zona afectada.',
  cansado: 'El usuario está cansado.',
  enojado: 'El usuario está enojado o frustrado.',
  asustado: 'El usuario está asustado o ansioso.',
  aburrido: 'El usuario está aburrido y quiere hacer algo.',
  sorprendido: 'El usuario está sorprendido por algo.',
  casa: 'El usuario quiere ir a casa.',
  colegio: 'El usuario hace referencia al colegio.',
  doctor: 'El usuario quiere o necesita ir al doctor.',
  parque: 'El usuario quiere ir al parque.',
  tienda: 'El usuario quiere ir a la tienda.',
  transporte: 'El usuario quiere usar algún medio de transporte.',
}

/** Intenciones finales (hojas del grafo). */
export const LEAF_NODES: readonly string[] = Object.keys(INTENTION_MESSAGES)

/** Etiquetas en español bajo cada pictograma. */
export const LABELS: Readonly<Record<string, string>> = {
  alimentacion: 'Comida', actividades: 'Actividades', emociones: 'Emociones', entorno: 'Entorno',
  hambre: 'Hambre', sed: 'Sed', dulce: 'Dulce', salado: 'Salado', caliente: 'Caliente',
  frio_comida: 'Frío', fruta: 'Fruta', verdura: 'Verdura', carne: 'Carne', pan: 'Pan',
  leche: 'Leche', agua: 'Agua', jugar: 'Jugar', descansar: 'Descansar', banio: 'Baño',
  salir: 'Salir', dormir: 'Dormir', caminar: 'Caminar', leer: 'Leer', musica: 'Música',
  feliz: 'Feliz', triste: 'Triste', dolor: 'Dolor', cansado: 'Cansado', enojado: 'Enojado',
  asustado: 'Asustado', aburrido: 'Aburrido', sorprendido: 'Sorprendido', casa: 'Casa',
  colegio: 'Colegio', doctor: 'Doctor', parque: 'Parque', tienda: 'Tienda', transporte: 'Transporte',
}

/** Categoría a la que pertenece cada pictograma (una categoría se pertenece a sí misma). */
export function categoryOf(key: string): CategoryId | null {
  if ((ROOT_CATEGORIES as string[]).includes(key)) return key as CategoryId
  for (const cat of ROOT_CATEGORIES) {
    if (key in (SEMANTIC_GRAPH[cat] ?? {})) return cat
  }
  return null
}

export function getLabel(key: string): string {
  return LABELS[key] ?? key.charAt(0).toUpperCase() + key.slice(1)
}
