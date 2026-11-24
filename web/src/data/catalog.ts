/**
 * Catálogo de pictogramas: única fuente de verdad del juego.
 * Cada categoría agrupa intenciones hoja con su peso de relevancia semántica
 * (0-1) y el mensaje breve que se le entrega al adulto acompañante.
 */

export interface LeafDef {
  readonly id: string
  readonly label: string
  /** Relevancia semántica dentro de su categoría. */
  readonly weight: number
  readonly message: string
}

export interface CategoryDef {
  readonly id: 'alimentacion' | 'actividades' | 'emociones' | 'entorno' | 'personas' | 'juguetes'
  readonly label: string
  /** Frase del guía cuando el niño elige esta categoría. */
  readonly cheer: string
  readonly leaves: ReadonlyArray<LeafDef>
}

const leaf = (id: string, label: string, weight: number, message: string): LeafDef => ({
  id, label, weight, message,
})

export const CATALOG: ReadonlyArray<CategoryDef> = [
  {
    id: 'alimentacion',
    label: 'Comida',
    cheer: '¡Ñam! Hablemos de comida.',
    leaves: [
      leaf('hambre', 'Hambre', 1, 'Quiere comer algo.'),
      leaf('sed', 'Sed', 1, 'Quiere beber algo.'),
      leaf('dulce', 'Dulce', 0.8, 'Quiere algo dulce.'),
      leaf('salado', 'Salado', 0.8, 'Quiere algo salado.'),
      leaf('caliente', 'Comida caliente', 0.7, 'Quiere algo caliente.'),
      leaf('frio_comida', 'Comida fría', 0.7, 'Quiere algo frío.'),
      leaf('fruta', 'Fruta', 0.9, 'Quiere fruta.'),
      leaf('verdura', 'Verdura', 0.9, 'Quiere verduras.'),
      leaf('carne', 'Carne', 0.9, 'Quiere carne.'),
      leaf('pan', 'Pan', 0.8, 'Quiere pan.'),
      leaf('leche', 'Leche', 0.8, 'Quiere leche.'),
      leaf('agua', 'Agua', 0.9, 'Quiere agua.'),
      leaf('galleta', 'Galleta', 0.8, 'Quiere una galleta.'),
      leaf('helado', 'Helado', 0.8, 'Quiere helado.'),
      leaf('jugo', 'Jugo', 0.8, 'Quiere jugo.'),
      leaf('huevo', 'Huevo', 0.7, 'Quiere huevo.'),
      leaf('arroz', 'Arroz', 0.7, 'Quiere arroz.'),
      leaf('sopa', 'Sopa', 0.7, 'Quiere sopa.'),
      leaf('platano', 'Plátano', 0.8, 'Quiere plátano.'),
      leaf('queso', 'Queso', 0.7, 'Quiere queso.'),
    ],
  },
  {
    id: 'actividades',
    label: 'Actividades',
    cheer: '¡Qué divertido! Vamos a jugar y hacer cosas.',
    leaves: [
      leaf('jugar', 'Jugar', 1, 'Quiere jugar.'),
      leaf('descansar', 'Descansar', 1, 'Quiere descansar.'),
      leaf('banio', 'Baño', 0.9, 'Necesita ir al baño.'),
      leaf('salir', 'Salir', 0.9, 'Quiere salir.'),
      leaf('dormir', 'Dormir', 1, 'Quiere dormir.'),
      leaf('caminar', 'Caminar', 0.8, 'Quiere salir a caminar.'),
      leaf('leer', 'Leer', 0.8, 'Quiere leer o que le lean algo.'),
      leaf('musica', 'Música', 0.8, 'Quiere escuchar música.'),
      leaf('pintar', 'Pintar', 0.8, 'Quiere pintar.'),
      leaf('bailar', 'Bailar', 0.8, 'Quiere bailar.'),
      leaf('correr', 'Correr', 0.7, 'Quiere correr.'),
      leaf('television', 'Tele', 0.7, 'Quiere ver la tele.'),
      leaf('lavar_manos', 'Lavar manos', 0.8, 'Quiere lavarse las manos.'),
      leaf('cepillar_dientes', 'Dientes', 0.8, 'Quiere cepillarse los dientes.'),
      leaf('vestirse', 'Vestirse', 0.7, 'Quiere vestirse.'),
    ],
  },
  {
    id: 'emociones',
    label: 'Emociones',
    cheer: 'Cuéntame cómo te sientes.',
    leaves: [
      leaf('feliz', 'Feliz', 1, 'Se siente feliz.'),
      leaf('triste', 'Triste', 1, 'Se siente triste.'),
      leaf('dolor', 'Dolor', 1, 'Siente dolor — verificar zona afectada.'),
      leaf('cansado', 'Cansado', 0.9, 'Está cansado.'),
      leaf('enojado', 'Enojado', 0.9, 'Está enojado.'),
      leaf('asustado', 'Asustado', 0.9, 'Está asustado.'),
      leaf('aburrido', 'Aburrido', 0.8, 'Está aburrido.'),
      leaf('sorprendido', 'Sorprendido', 0.7, 'Está sorprendido.'),
      leaf('enfermo', 'Enfermo', 0.9, 'Se siente enfermo — avisar a un adulto.'),
      leaf('calor', 'Tengo calor', 0.7, 'Tiene calor.'),
      leaf('frio_cuerpo', 'Tengo frío', 0.7, 'Tiene frío.'),
      leaf('abrazo', 'Abrazo', 0.8, 'Quiere un abrazo.'),
    ],
  },
  {
    id: 'entorno',
    label: 'Lugares',
    cheer: '¿A dónde vamos? ¡Elige un lugar!',
    leaves: [
      leaf('casa', 'Casa', 1, 'Quiere ir a casa.'),
      leaf('colegio', 'Colegio', 1, 'Quiere ir al colegio.'),
      leaf('doctor', 'Doctor', 0.9, 'Quiere o necesita ir al doctor.'),
      leaf('parque', 'Parque', 0.8, 'Quiere ir al parque.'),
      leaf('tienda', 'Tienda', 0.8, 'Quiere ir a la tienda.'),
      leaf('transporte', 'Transporte', 0.7, 'Quiere usar un medio de transporte.'),
      leaf('cuarto', 'Mi cuarto', 0.8, 'Quiere ir a su cuarto.'),
      leaf('cocina', 'Cocina', 0.7, 'Quiere ir a la cocina.'),
      leaf('playa', 'Playa', 0.7, 'Quiere ir a la playa.'),
      leaf('restaurante', 'Restaurante', 0.7, 'Quiere ir a un restaurante.'),
    ],
  },
  {
    id: 'personas',
    label: 'Personas',
    cheer: '¡Qué lindo! Hablemos de las personas que quieres.',
    leaves: [
      leaf('mama', 'Mamá', 1, 'Quiere estar con mamá.'),
      leaf('papa', 'Papá', 1, 'Quiere estar con papá.'),
      leaf('abuela', 'Abuela', 0.9, 'Quiere estar con la abuela.'),
      leaf('hermano', 'Hermano', 0.9, 'Quiere estar con su hermano o hermana.'),
      leaf('amigo', 'Amigo', 0.9, 'Quiere estar con un amigo.'),
      leaf('profesor', 'Profe', 0.9, 'Quiere hablar con su profesor.'),
    ],
  },
  {
    id: 'juguetes',
    label: 'Juguetes',
    cheer: '¡Wow, juguetes! ¿Con cuál jugamos?',
    leaves: [
      leaf('pelota', 'Pelota', 1, 'Quiere jugar con la pelota.'),
      leaf('muneca', 'Muñeca', 0.9, 'Quiere jugar con la muñeca.'),
      leaf('carro', 'Carro', 0.9, 'Quiere jugar con el carro.'),
      leaf('tableta', 'Tableta', 0.9, 'Quiere usar la tableta.'),
      leaf('bloques', 'Bloques', 0.8, 'Quiere jugar con bloques.'),
      leaf('peluche', 'Peluche', 0.9, 'Quiere su peluche.'),
    ],
  },
]
