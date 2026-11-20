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
    "hambre":       "Quiere comer algo.",
    "sed":          "Quiere beber algo.",
    "dulce":        "Quiere algo dulce.",
    "salado":       "Quiere algo salado.",
    "caliente":     "Quiere algo caliente.",
    "frio_comida":  "Quiere algo frío.",
    "fruta":        "Quiere fruta.",
    "verdura":      "Quiere verduras.",
    "carne":        "Quiere carne.",
    "pan":          "Quiere pan.",
    "leche":        "Quiere leche.",
    "agua":         "Quiere agua.",
    "jugar":        "Quiere jugar.",
    "descansar":    "Quiere descansar.",
    "banio":        "Necesita ir al baño.",
    "salir":        "Quiere salir.",
    "dormir":       "Quiere dormir.",
    "caminar":      "Quiere salir a caminar.",
    "leer":         "Quiere leer o que le lean algo.",
    "musica":       "Quiere escuchar música.",
    "feliz":        "Se siente feliz.",
    "triste":       "Se siente triste.",
    "dolor":        "Siente dolor — verificar zona afectada.",
    "cansado":      "Está cansado.",
    "enojado":      "Está enojado.",
    "asustado":     "Está asustado.",
    "aburrido":     "Está aburrido.",
    "sorprendido":  "Está sorprendido.",
    "casa":         "Quiere ir a casa.",
    "colegio":      "Quiere ir al colegio.",
    "doctor":       "Quiere o necesita ir al doctor.",
    "parque":       "Quiere ir al parque.",
    "tienda":       "Quiere ir a la tienda.",
    "transporte":   "Quiere usar un medio de transporte.",
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
    CONFIDENCE_THRESHOLD: float = 0.65    # antes: 0.55
    MIN_ROUNDS: int = 2                   # mínimo de rondas antes de concluir

    def __post_init__(self):
        # Inicializar distribución uniforme sobre hojas
        n = len(LEAF_NODES)
        self.probs = {leaf: 1.0 / n for leaf in LEAF_NODES}

    def get_pictograms_for_round(self, n: int = 6) -> list[str]:
        if self.round_num == 0:
            return list(SEMANTIC_GRAPH["raiz"].keys())

        shown = {key for key, _ in self.history}
        dominant = self._get_dominant_category(threshold=0.40)

        if dominant:
            pool = [
                leaf for leaf in SEMANTIC_GRAPH[dominant]
                if leaf in LEAF_NODES and leaf not in shown
            ]
        else:
            pool = [leaf for leaf in LEAF_NODES if leaf not in shown]

        candidates = [(leaf, self._expected_info_gain(leaf)) for leaf in pool]
        candidates.sort(key=lambda x: x[1], reverse=True)
        return [c[0] for c in candidates[:n]]

    def _get_dominant_category(self, threshold: float = 0.40) -> str | None:
        for cat in ("alimentacion", "actividades", "emociones", "entorno"):
            leaves = [l for l in SEMANTIC_GRAPH[cat] if l in LEAF_NODES]
            cat_prob = sum(self.probs.get(l, 0) for l in leaves)
            if cat_prob >= threshold:
                return cat
        return None

    def _semantic_weight(self, leaf: str, category: str | None) -> float:
        """Peso semántico del grafo para un nodo hoja — modula el factor de update."""
        if category and category in SEMANTIC_GRAPH:
            return SEMANTIC_GRAPH[category].get(leaf, 0.5)
        for cat in ("alimentacion", "actividades", "emociones", "entorno"):
            if leaf in SEMANTIC_GRAPH.get(cat, {}):
                return SEMANTIC_GRAPH[cat][leaf]
        return 0.5

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
        self.history.append((pictogram, selected))
        related = self._get_related_leaves(pictogram)
        dominant = self._get_dominant_category(threshold=0.35)

        new_probs = {}
        for leaf, prob in self.probs.items():
            if leaf in related:
                if selected:
                    weight = self._semantic_weight(leaf, dominant)
                    factor = 2.0 + weight * 2.0  # rango 2.4 → 4.0
                    new_probs[leaf] = prob * factor
                else:
                    new_probs[leaf] = prob * 0.3
            else:
                new_probs[leaf] = prob * (0.5 if selected else 1.2)

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
        related = self._get_related_leaves(pictogram)
        dominant = self._get_dominant_category(threshold=0.35)

        new_probs = {}
        for leaf, prob in self.probs.items():
            if leaf in related:
                if selected:
                    weight = self._semantic_weight(leaf, dominant)
                    factor = 2.0 + weight * 2.0
                    new_probs[leaf] = prob * factor
                else:
                    new_probs[leaf] = prob * 0.3
            else:
                new_probs[leaf] = prob * (0.5 if selected else 1.2)

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
        if self.round_num < self.MIN_ROUNDS:
            return False
        _, top_prob = self.get_top_prediction()
        return top_prob >= self.CONFIDENCE_THRESHOLD

    def get_message(self) -> str:
        """Genera el mensaje final para el encargado — simple y accionable."""
        best_key, _ = self.get_top_prediction()
        return INTENTION_MESSAGES.get(best_key, best_key)

    def advance_round(self):
        self.round_num += 1
