def calculate_step_score(current_nodes: list[str], used_nodes: list[str], matrix_order: dict[int, float]) -> dict:
    """
    Считаем очки за текущий ход с учётом того, что вся игра должна дать в сумме 100 баллов.
    Каждому узлу заранее выделена "нормализованная доля" от 100.
    """

    try:
        used_nodes = [str(n) for n in used_nodes]
        true_order = [str(k) for k, _ in sorted(matrix_order.items(), key=lambda x: x[1], reverse=True)]
        controllabilities = {str(k): float(v) for k, v in matrix_order.items()}

        # --- ГЛОБАЛЬНАЯ НОРМАЛИЗАЦИЯ ---
        max_raw_per_node = {
            str(k): (v * 100 + 5) for k, v in matrix_order.items()
        }
        total_possible = sum(max_raw_per_node.values())

        node_normalization = {
            k: (v / total_possible) * 100 for k, v in max_raw_per_node.items()
        }

        step_score = 0.0
        total_penalty = 0.0
        total_bonus = 0.0
        step_details = []

        for i, node_raw in enumerate(current_nodes):
            node = str(node_raw)
            global_rank = len(used_nodes) + i
            correct_rank = true_order.index(node) if node in true_order else -1

            controllability = controllabilities.get(node, 0.0)
            base_points = controllability * 100

            if correct_rank == -1:
                raw_score = 0
                penalty = 0
                bonus = 0
            else:
                rank_diff = abs(global_rank - correct_rank)
                discount = 0.25 * rank_diff
                raw_score = base_points * max(0, 1 - discount)
                bonus = 5 if rank_diff == 0 else 2 if rank_diff == 1 else 0
                penalty = base_points * discount * 0.1

            raw_total = raw_score - penalty + bonus
            normalized_contribution = (raw_total / (base_points + 5)) if (base_points + 5) > 0 else 0
            final_contribution = node_normalization.get(node, 0) * normalized_contribution

            step_score += final_contribution
            total_penalty += penalty
            total_bonus += bonus

            step_details.append({
                "node": node,
                "global_rank": global_rank,
                "correct_rank": correct_rank,
                "base_points": round(base_points, 2),
                "normalized_unit_weight": round(node_normalization.get(node, 0), 4),
                "score_contribution": round(final_contribution, 4),
                "penalty": round(penalty, 2),
                "bonus": round(bonus, 2),
            })

        return {
            "step_score": round(step_score, 2),
            "step_penalty": round(total_penalty, 2),
            "step_bonus": round(total_bonus, 2),
            "details": step_details
        }

    except Exception as e:
        print(f"Error in calculate_step_score: {e}")
        return {
            "step_score": 0,
            "step_penalty": 0,
            "step_bonus": 0,
            "details": []
        }
