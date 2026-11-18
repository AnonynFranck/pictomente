"""
Motor de inferencia estilo Akinator.
- Mantiene una distribución de probabilidad sobre posibles intenciones.
- Cada selección del usuario actualiza las probabilidades (Bayes naive).
- Selecciona los próximos pictogramas que maximizan la información ganada.
- Tras suficiente confianza, genera un mensaje para el terapeuta.
"""

import math
from dataclasses import dataclass, field

# ---------------------------------------------------------------------------
# Grafo semántico: categorías → subcategorías → intenciones hoja
# ---------------------------------------------------------------------------
# Estructura: { nodo: { hijo: peso_de_relevancia } }
# Los nodos hoja son intenciones finales (lo que el usuario quiere expresar).

SEMANTIC_GRAPH: dict[str, dict[str, float]] = {
    # RAÍZ
    "raiz": {
        "alimentacion": 1.0,
        "actividades":  1.0,
        "emociones":    1.0,
        "entorno":      1.0,
    },

    # ALIMENTACIÓN
    "alimentacion": {
        "hambre":      1.0,
        "sed":         1.0,
        "dulce":       0.8,
        "salado":      0.8,
        "caliente":    0.7,
        "frio_comida": 0.7,
        "fruta":       0.9,
        "verdura":     0.9,
        "carne":       0.9,
        "pan":         0.8,
        "leche":       0.8,
        "agua":        0.9,
    },

    # ACTIVIDADES
    "actividades": {
        "jugar":     1.0,
        "descansar": 1.0,
        "banio":     0.9,
        "salir":     0.9,
        "dormir":    1.0,
        "caminar":   0.8,
        "leer":      0.8,
        "musica":    0.8,
    },

    # EMOCIONES
    "emociones": {
        "feliz":       1.0,
        "triste":      1.0,
        "dolor":       1.0,
        "cansado":     0.9,
        "enojado":     0.9,
        "asustado":    0.9,
        "aburrido":    0.8,
        "sorprendido": 0.7,
    },

    # ENTORNO
    "entorno": {
        "casa":       1.0,
        "colegio":    1.0,
        "doctor":     0.9,
        "parque":     0.8,
        "tienda":     0.8,
        "transporte": 0.7,
    },
}

# Mensajes de salida para el terapeuta
INTENTION_MESSAGES: dict[str, str] = {
    "hambre":       "El usuario tiene hambre y quiere comer algo.",
    "sed":          "El usuario tiene sed y quiere beber algo.",
    "dulce":        "El usuario quiere comer algo dulce.",
    "salado":       "El usuario quiere comer algo salado.",
    "caliente":     "El usuario quiere algo caliente para comer o beber.",
    "frio_comida":  "El usuario quiere algo frío para comer o beber.",
    "fruta":        "El usuario quiere comer fruta.",
    "verdura":      "El usuario quiere comer verduras.",
    "carne":        "El usuario quiere comer carne.",
    "pan":          "El usuario quiere comer pan.",
    "leche":        "El usuario quiere tomar leche.",
    "agua":         "El usuario quiere tomar agua.",
    "jugar":        "El usuario quiere jugar.",
    "descansar":    "El usuario quiere descansar un momento.",
    "banio":        "El usuario necesita ir al baño.",
    "salir":        "El usuario quiere salir.",
    "dormir":       "El usuario tiene sueño y quiere dormir.",
    "caminar":      "El usuario quiere salir a caminar.",
    "leer":         "El usuario quiere leer o que le lean algo.",
    "musica":       "El usuario quiere escuchar música.",
    "feliz":        "El usuario está expresando que se siente feliz.",
    "triste":       "El usuario está triste o necesita apoyo.",
    "dolor":        "El usuario siente dolor. Verificar zona afectada.",
    "cansado":      "El usuario está cansado.",
    "enojado":      "El usuario está enojado o frustrado.",
    "asustado":     "El usuario está asustado o ansioso.",
    "aburrido":     "El usuario está aburrido y quiere hacer algo.",
    "sorprendido":  "El usuario está sorprendido por algo.",
    "casa":         "El usuario quiere ir a casa.",
    "colegio":      "El usuario hace referencia al colegio.",
    "doctor":       "El usuario quiere o necesita ir al doctor.",
    "parque":       "El usuario quiere ir al parque.",
    "tienda":       "El usuario quiere ir a la tienda.",
    "transporte":   "El usuario quiere usar algún medio de transporte.",
}

# Todos los nodos hoja (intenciones finales)
LEAF_NODES = set(INTENTION_MESSAGES.keys())

# Nodos intermedios (categorías)
CATEGORY_NODES = {"raiz", "alimentacion", "actividades", "emociones", "entorno"}


# ---------------------------------------------------------------------------
# Motor de inferencia
# ---------------------------------------------------------------------------

@dataclass
class InferenceEngine:
    """
    Mantiene el estado de una sesión de inferencia.
    Usa un modelo bayesiano naive sobre intenciones hoja.
    """
    # Probabilidad de cada intención hoja (uniforme al inicio)
    probs: dict[str, float] = field(default_factory=dict)
    # Historial de selecciones del usuario [(pictograma, seleccionado)]
    history: list[tuple[str, bool]] = field(default_factory=list)
    # Ronda actual (0-indexed)
    round_num: int = 0
    # Confianza umbral para dar una predicción
    CONFIDENCE_THRESHOLD: float = 0.55

    def __post_init__(self):
        # Inicializar distribución uniforme sobre hojas
        n = len(LEAF_NODES)
        self.probs = {leaf: 1.0 / n for leaf in LEAF_NODES}

    def get_pictograms_for_round(self, n: int = 6) -> list[str]:
        """
        Devuelve los n pictogramas más informativos para mostrar en esta ronda.
        Ronda 0: siempre las 4 categorías raíz.
        Rondas siguientes: hojas con mayor ganancia de información esperada.
        """
        if self.round_num == 0:
            return list(SEMANTIC_GRAPH["raiz"].keys())  # 4 categorías

        # Calcular ganancia de información para cada hoja no mostrada aún
        shown = {key for key, _ in self.history}
        candidates = [
            (leaf, self._expected_info_gain(leaf))
            for leaf in LEAF_NODES
            if leaf not in shown
        ]
        candidates.sort(key=lambda x: x[1], reverse=True)
        return [c[0] for c in candidates[:n]]

    def _expected_info_gain(self, pictogram: str) -> float:
        """
        Ganancia de información esperada si mostramos este pictograma.
        Aproximación: suma ponderada de la reducción de entropía.
        """
        # P(usuario selecciona este pictograma)
        # = suma de probs de hojas relacionadas semánticamente
        p_select = self._relevance(pictogram)
        p_no_select = 1.0 - p_select

        h_current = self._entropy()

        # Entropía si selecciona
        h_if_yes = self._entropy_if_update(pictogram, selected=True)
        # Entropía si no selecciona
        h_if_no = self._entropy_if_update(pictogram, selected=False)

        expected_h = p_select * h_if_yes + p_no_select * h_if_no
        return max(0.0, h_current - expected_h)

    def _relevance(self, pictogram: str) -> float:
        """Relevancia de un pictograma dado el estado actual."""
        # Es la probabilidad acumulada de las hojas que están bajo ese pictograma
        if pictogram in LEAF_NODES:
            return self.probs.get(pictogram, 0.0)
        # Para categorías, sumar hojas hijas
        children = SEMANTIC_GRAPH.get(pictogram, {})
        return sum(self.probs.get(child, 0.0) for child in children)

    def update(self, pictogram: str, selected: bool):
        """
        Actualiza las probabilidades basándose en la selección del usuario.
        Si selecciona una categoría, las hojas hijas suben; las demás bajan.
        Si selecciona una hoja, esa sube; las demás bajan.
        """
        self.history.append((pictogram, selected))

        # Obtener hojas relacionadas con el pictograma seleccionado
        related = self._get_related_leaves(pictogram)

        factor_up = 3.5 if selected else 0.3
        factor_down = 0.4 if selected else 1.8

        new_probs = {}
        for leaf, prob in self.probs.items():
            if leaf in related:
                new_probs[leaf] = prob * factor_up
            else:
                new_probs[leaf] = prob * factor_down

        # Normalizar
        total = sum(new_probs.values())
        if total > 0:
            self.probs = {k: v / total for k, v in new_probs.items()}

    def _get_related_leaves(self, pictogram: str) -> set[str]:
        """Devuelve las hojas relacionadas con un pictograma (directo o por categoría)."""
        if pictogram in LEAF_NODES:
            return {pictogram}
        # Si es categoría, devolver todas sus hojas
        children = SEMANTIC_GRAPH.get(pictogram, {})
        leaves = set()
        for child in children:
            if child in LEAF_NODES:
                leaves.add(child)
            else:
                # Sub-categoría: agregar sus hojas también
                leaves.update(
                    k for k in SEMANTIC_GRAPH.get(child, {})
                    if k in LEAF_NODES
                )
        return leaves

    def _entropy(self) -> float:
        return -sum(p * math.log2(p) for p in self.probs.values() if p > 0)

    def _entropy_if_update(self, pictogram: str, selected: bool) -> float:
        """Calcula la entropía hipotética si ocurre una actualización."""
        related = self._get_related_leaves(pictogram)
        factor_up = 3.5 if selected else 0.3
        factor_down = 0.4 if selected else 1.8

        new_probs = {}
        for leaf, prob in self.probs.items():
            if leaf in related:
                new_probs[leaf] = prob * factor_up
            else:
                new_probs[leaf] = prob * factor_down

        total = sum(new_probs.values())
        if total == 0:
            return 0.0
        normalized = [v / total for v in new_probs.values()]
        return -sum(p * math.log2(p) for p in normalized if p > 0)

    def get_top_prediction(self) -> tuple[str, float]:
        """Devuelve la intención más probable y su probabilidad."""
        top = max(self.probs, key=lambda k: self.probs[k])
        return top, self.probs[top]

    def get_top_n(self, n: int = 3) -> list[tuple[str, float]]:
        """Devuelve las n intenciones más probables."""
        sorted_probs = sorted(self.probs.items(), key=lambda x: x[1], reverse=True)
        return sorted_probs[:n]

    def is_confident(self) -> bool:
        """¿Hay suficiente confianza para dar una predicción?"""
        _, top_prob = self.get_top_prediction()
        return top_prob >= self.CONFIDENCE_THRESHOLD

    def get_message(self) -> str:
        """Genera el mensaje final para el terapeuta."""
        top_n = self.get_top_n(3)
        best_key, best_prob = top_n[0]

        msg = INTENTION_MESSAGES.get(best_key, f"El usuario quiere expresar: {best_key}.")

        # Si hay segunda opción cercana, mencionarla
        if len(top_n) > 1:
            second_key, second_prob = top_n[1]
            if second_prob > 0.20:
                second_msg = INTENTION_MESSAGES.get(second_key, second_key)
                msg += f"\n\nPosiblemente también: {second_msg}"

        confidence_pct = int(best_prob * 100)
        msg += f"\n\n(Confianza: {confidence_pct}%)"
        return msg

    def advance_round(self):
        self.round_num += 1
