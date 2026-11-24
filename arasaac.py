"""
Módulo para obtener pictogramas de ARASAAC.
- Busca IDs dinámicamente via API de ARASAAC (bestsearch en español).
- Cachea IDs y imágenes localmente para no repetir descargas.
- Fallback a placeholder de color si no hay conexión.
"""

import io
import json
import os

import pygame
import requests

ARASAAC_SEARCH_URL = "https://api.arasaac.org/api/pictograms/es/bestsearch/{word}"
ARASAAC_IMG_URL    = "https://api.arasaac.org/api/pictograms/{id}?download=false"
CACHE_DIR  = os.path.join(os.path.dirname(__file__), "assets", "cache")
ID_CACHE   = os.path.join(CACHE_DIR, "_id_cache.json")
os.makedirs(CACHE_DIR, exist_ok=True)

# Término de búsqueda en español para cada clave del juego.
# Usamos el término más específico para obtener el mejor resultado.
SEARCH_TERMS = {
    # Categorías raíz
    "alimentacion": "comida",
    "actividades":  "actividad",
    "emociones":    "emoción",
    "entorno":      "lugar",
    # Alimentación
    "hambre":       "hambre",
    "sed":          "sed",
    "dulce":        "dulce",
    "salado":       "salado",
    "caliente":     "caliente",
    "frio_comida":  "frío",
    "fruta":        "fruta",
    "verdura":      "verdura",
    "carne":        "carne",
    "pan":          "pan",
    "leche":        "leche",
    "agua":         "agua",
    # Actividades
    "jugar":        "jugar",
    "descansar":    "descansar",
    "banio":        "baño",
    "salir":        "salir",
    "dormir":       "dormir",
    "caminar":      "caminar",
    "leer":         "leer",
    "musica":       "música",
    # Emociones
    "feliz":        "feliz",
    "triste":       "triste",
    "dolor":        "dolor",
    "cansado":      "cansado",
    "enojado":      "enfadado",
    "asustado":     "miedo",
    "aburrido":     "aburrido",
    "sorprendido":  "sorpresa",
    # Entorno
    "casa":         "casa",
    "colegio":      "colegio",
    "doctor":       "médico",
    "parque":       "parque",
    "tienda":       "tienda",
    "transporte":   "autobús",
}

# Caché de IDs en memoria (persistido en _id_cache.json)
_id_cache: dict[str, int] = {}

def _load_id_cache():
    global _id_cache
    if os.path.exists(ID_CACHE):
        try:
            with open(ID_CACHE) as f:
                _id_cache = json.load(f)
        except Exception:
            _id_cache = {}

def _save_id_cache():
    with open(ID_CACHE, "w") as f:
        json.dump(_id_cache, f)

_load_id_cache()


def _resolve_id(key: str) -> int | None:
    """Obtiene el ID de ARASAAC para una clave, usando caché o buscando en la API."""
    if key in _id_cache:
        return _id_cache[key]

    term = SEARCH_TERMS.get(key, key)
    url  = ARASAAC_SEARCH_URL.format(word=requests.utils.quote(term))
    try:
        resp = requests.get(url, timeout=8)
        if resp.status_code == 200:
            data = resp.json()
            if data:
                pic_id = data[0]["_id"]
                _id_cache[key] = pic_id
                _save_id_cache()
                return pic_id
    except Exception:
        pass
    return None


# IDs de pictogramas que ya sabemos son incorrectos (para forzar re-búsqueda)
PICTOGRAM_IDS: dict[str, int] = {}  # se llena dinámicamente

# Etiquetas en español para mostrar bajo cada pictograma
LABELS = {
    "alimentacion": "Comida",
    "actividades":  "Actividades",
    "emociones":    "Emociones",
    "entorno":      "Entorno",
    "hambre":       "Hambre",
    "sed":          "Sed",
    "dulce":        "Dulce",
    "salado":       "Salado",
    "caliente":     "Caliente",
    "frio_comida":  "Frío",
    "fruta":        "Fruta",
    "verdura":      "Verdura",
    "carne":        "Carne",
    "pan":          "Pan",
    "leche":        "Leche",
    "agua":         "Agua",
    "jugar":        "Jugar",
    "descansar":    "Descansar",
    "banio":        "Baño",
    "salir":        "Salir",
    "dormir":       "Dormir",
    "caminar":      "Caminar",
    "leer":         "Leer",
    "musica":       "Música",
    "feliz":        "Feliz",
    "triste":       "Triste",
    "dolor":        "Dolor",
    "cansado":      "Cansado",
    "enojado":      "Enojado",
    "asustado":     "Asustado",
    "aburrido":     "Aburrido",
    "sorprendido":  "Sorprendido",
    "casa":         "Casa",
    "colegio":      "Colegio",
    "doctor":       "Doctor",
    "parque":       "Parque",
    "tienda":       "Tienda",
    "transporte":   "Transporte",
}


def get_image(key: str, size: tuple[int, int] = (120, 120)) -> pygame.Surface:
    """
    Devuelve un pygame.Surface con el pictograma.
    Busca el ID via API si no está en caché, luego descarga la imagen.
    Si falla, devuelve un placeholder de color.
    """
    cache_path = os.path.join(CACHE_DIR, f"{key}_{size[0]}.png")

    # 1. Imagen ya descargada en disco
    if os.path.exists(cache_path):
        try:
            return pygame.image.load(cache_path).convert_alpha()
        except Exception:
            pass

    # 2. Resolver ID (desde caché JSON o buscando en API)
    pic_id = _resolve_id(key)

    # 3. Descargar imagen desde ARASAAC
    if pic_id is not None:
        url = ARASAAC_IMG_URL.format(id=pic_id)
        try:
            resp = requests.get(url, timeout=8)
            if resp.status_code == 200:
                img_bytes = io.BytesIO(resp.content)
                surface = pygame.image.load(img_bytes).convert_alpha()
                surface = pygame.transform.smoothscale(surface, size)
                pygame.image.save(surface, cache_path)
                return surface
        except Exception:
            pass

    # 4. Fallback: placeholder con color y etiqueta
    return _make_placeholder(key, size)


def _make_placeholder(key: str, size: tuple[int, int]) -> pygame.Surface:
    """Genera un pictograma placeholder con color y texto."""
    colors = {
        "alimentacion": (255, 200, 100),
        "actividades":  (100, 200, 255),
        "emociones":    (255, 150, 150),
        "entorno":      (150, 220, 150),
    }
    # Determinar categoría por prefijo aproximado
    cat_color = (200, 200, 200)
    for cat, col in colors.items():
        if key in ("alimentacion", "hambre", "sed", "dulce", "salado",
                   "caliente", "frio_comida", "fruta", "verdura",
                   "carne", "pan", "leche", "agua"):
            cat_color = colors["alimentacion"]
        elif key in ("actividades", "jugar", "descansar", "banio", "salir",
                     "dormir", "caminar", "leer", "musica"):
            cat_color = colors["actividades"]
        elif key in ("emociones", "feliz", "triste", "dolor", "cansado",
                     "enojado", "asustado", "aburrido", "sorprendido"):
            cat_color = colors["emociones"]
        elif key in ("entorno", "casa", "colegio", "doctor", "parque",
                     "tienda", "transporte"):
            cat_color = colors["entorno"]

    surf = pygame.Surface(size, pygame.SRCALPHA)
    surf.fill((*cat_color, 220))
    pygame.draw.rect(surf, (80, 80, 80), surf.get_rect(), 3, border_radius=12)

    # Texto de la etiqueta centrado
    pygame.font.init()
    label = LABELS.get(key, key)
    font_size = max(12, size[0] // 7)
    font = pygame.font.SysFont("sans", font_size, bold=True)
    words = label.split()
    y = size[1] // 4
    for word in words:
        txt = font.render(word, True, (40, 40, 40))
        surf.blit(txt, txt.get_rect(centerx=size[0] // 2, centery=y))
        y += font_size + 4
    return surf


def get_label(key: str) -> str:
    return LABELS.get(key, key.capitalize())
