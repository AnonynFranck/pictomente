"""
tools/verify_pictograms.py
Verifica que todos los términos de búsqueda de ARASAAC devuelvan
un pictograma válido. Corre una vez por el dev antes de cada release.

Uso: python tools/verify_pictograms.py
     python tools/verify_pictograms.py --fix   (borra caché de los que fallan)
"""

import sys
import os
import json
import requests

# Ajustar path para importar desde raíz del proyecto
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

ARASAAC_SEARCH_URL = "https://api.arasaac.org/api/pictograms/es/bestsearch/{word}"
CACHE_DIR = os.path.join(os.path.dirname(__file__), "..", "assets", "cache")
ID_CACHE  = os.path.join(CACHE_DIR, "_id_cache.json")

FIX_MODE = "--fix" in sys.argv

# Cargar caché actual
id_cache = {}
if os.path.exists(ID_CACHE):
    with open(ID_CACHE) as f:
        id_cache = json.load(f)

from arasaac import SEARCH_TERMS, LABELS

print(f"\n{'─'*60}")
print(f"  Verificando {len(SEARCH_TERMS)} pictogramas contra ARASAAC API")
print(f"  Modo fix: {'SÍ' if FIX_MODE else 'NO (pasa --fix para limpiar caché)'}")
print(f"{'─'*60}\n")

ok = []
fail = []
cached = []

for key, term in SEARCH_TERMS.items():
    # Si ya está en caché de IDs, reportar sin llamar API
    if key in id_cache:
        cached.append((key, term, id_cache[key]))
        print(f"  💾 {key:<20} → ya en caché  ID={id_cache[key]}  ({term})")
        continue

    url = ARASAAC_SEARCH_URL.format(word=requests.utils.quote(term))
    try:
        resp = requests.get(url, timeout=10)
        if resp.status_code == 200:
            data = resp.json()
            if data:
                pic_id   = data[0]["_id"]
                pic_name = data[0].get("keywords", [{}])[0].get("keyword", "?")
                ok.append((key, term, pic_id, pic_name))
                # Guardar en caché inmediatamente
                id_cache[key] = pic_id
                os.makedirs(CACHE_DIR, exist_ok=True)
                with open(ID_CACHE, "w") as f:
                    json.dump(id_cache, f, indent=2)
                print(f"  ✅ {key:<20} → ID={pic_id:<6} nombre='{pic_name}'  (buscado: '{term}')")
            else:
                fail.append((key, term))
                print(f"  ❌ {key:<20} → sin resultados  (buscado: '{term}')")
        else:
            fail.append((key, term))
            print(f"  ❌ {key:<20} → HTTP {resp.status_code}  (buscado: '{term}')")
    except Exception as e:
        fail.append((key, term))
        print(f"  ⚠️  {key:<20} → error de red: {e}")

print(f"\n{'─'*60}")
print(f"  ✅ OK nuevos:  {len(ok)}")
print(f"  💾 En caché:  {len(cached)}")
print(f"  ❌ Fallidos:  {len(fail)}")
print(f"{'─'*60}\n")

if fail:
    print("  Claves que fallan — edita SEARCH_TERMS en arasaac.py:")
    for key, term in fail:
        print(f"    \"{key}\": \"<nuevo término>\",  # falló con '{term}'")
    print()

if FIX_MODE and fail:
    # Borrar imágenes en caché de los que fallaron para forzar re-descarga
    borrados = 0
    for key, term in fail:
        # Borrar ID del caché JSON si estaba
        if key in id_cache:
            del id_cache[key]
        # Borrar imágenes PNG en caché
        for fname in os.listdir(CACHE_DIR):
            if fname.startswith(f"{key}_") and fname.endswith(".png"):
                os.remove(os.path.join(CACHE_DIR, fname))
                borrados += 1
    # Guardar caché limpio
    with open(ID_CACHE, "w") as f:
        json.dump(id_cache, f, indent=2)
    print(f"  🧹 Fix aplicado: {borrados} archivo(s) borrado(s) del caché.")
    print(f"  Edita los términos en arasaac.py y vuelve a correr sin --fix.\n")
