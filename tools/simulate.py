"""
tools/simulate.py
Simula N sesiones del motor de inferencia y reporta métricas.
El "usuario simulado" tiene una intención objetivo y selecciona
pictogramas relacionados con ella.

Uso: python tools/simulate.py
     python tools/simulate.py --rounds 500
"""

import sys
import os
import random
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from inference import InferenceEngine, LEAF_NODES, SEMANTIC_GRAPH

MAX_ROUNDS = 8
N_SIMULATIONS = int(next((sys.argv[i+1] for i, a in enumerate(sys.argv) if a == "--rounds"), 300))

def get_category(leaf: str) -> str:
    for cat, children in SEMANTIC_GRAPH.items():
        if leaf in children:
            return cat
    return "desconocido"

def simulate_session(target: str) -> tuple[bool, int]:
    engine = InferenceEngine()
    target_category = get_category(target)

    for _ in range(MAX_ROUNDS):
        pictos = engine.get_pictograms_for_round(6)

        for picto in pictos:
            is_related = (picto == target or picto == target_category)
            prob_select = 0.85 if is_related else 0.05
            selected = random.random() < prob_select
            engine.update(picto, selected)

        engine.advance_round()

        if engine.is_confident():
            predicted, _ = engine.get_top_prediction()
            return predicted == target, engine.round_num

    predicted, _ = engine.get_top_prediction()
    return predicted == target, MAX_ROUNDS

# ── Correr simulaciones ──────────────────────────────────────────────────────
print(f"\n{'─'*55}")
print(f"  Simulando {N_SIMULATIONS} sesiones  |  MAX_ROUNDS={MAX_ROUNDS}")
print(f"{'─'*55}\n")

results_by_category: dict[str, list] = {}
total_success = 0
total_rounds  = 0

for _ in range(N_SIMULATIONS):
    target = random.choice(list(LEAF_NODES))
    cat    = get_category(target)
    success, rounds = simulate_session(target)

    if cat not in results_by_category:
        results_by_category[cat] = {"success": 0, "total": 0, "rounds": []}
    results_by_category[cat]["success"] += int(success)
    results_by_category[cat]["total"]   += 1
    results_by_category[cat]["rounds"].append(rounds)

    total_success += int(success)
    total_rounds  += rounds

print(f"  {'Categoría':<16} {'Éxito':>8} {'Promedio rondas':>18}")
print(f"  {'─'*44}")
for cat, data in sorted(results_by_category.items()):
    rate    = data["success"] / data["total"] * 100
    avg_r   = sum(data["rounds"]) / len(data["rounds"])
    print(f"  {cat:<16} {rate:>7.1f}%  {avg_r:>14.1f}")

print(f"  {'─'*44}")
print(f"  {'TOTAL':<16} {total_success/N_SIMULATIONS*100:>7.1f}%  {total_rounds/N_SIMULATIONS:>14.1f}")
print(f"\n  Sesiones simuladas: {N_SIMULATIONS}")
print(f"  Sesiones exitosas:  {total_success}")
print(f"{'─'*55}\n")
