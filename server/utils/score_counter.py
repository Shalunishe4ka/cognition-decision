def calculate_step_score(current_nodes: list[str], used_nodes: list[str], matrix_order: dict[int, float]) -> dict:
    """
    Считает очки за конкретный шаг (current_nodes) с учётом глобального порядка used_nodes.
    - current_nodes: список узлов, выбранных в текущем ходу
    - used_nodes: все узлы, которые уже были до этого (чтобы знать глобальную позицию)
    - matrix_order: словарь {node_id: controllability}

    Возвращает: dict с очками, деталями, и суммой
    """

    try:
        # Правильный порядок (убывание по controllability)
        used_nodes = [str(n) for n in used_nodes]
        true_order = [str(k) for k, _ in sorted(matrix_order.items(), key=lambda x: x[1], reverse=True)]
        controllabilities = {str(k): float(v) for k, v in matrix_order.items()}

        total_score = 0.0
        total_penalty = 0.0
        total_bonus = 0.0
        step_details = []

        # Определяем глобальную позицию текущих узлов
        for i, node_raw in enumerate(current_nodes):
            node = str(node_raw)  # <--- Вот это ключ
            global_rank = len(used_nodes) + i
            try:
                correct_rank = true_order.index(node)
            except ValueError:
                correct_rank = -1

            controllability = controllabilities.get(node, 0.0)
            base_points = controllability * 100

            if correct_rank == -1:
                score = 0
                penalty = 0
                bonus = 0
            else:
                rank_diff = abs(global_rank - correct_rank)
                discount = 0.25 * rank_diff
                score = base_points * max(0, 1 - discount)

                bonus = 5 if rank_diff == 0 else 2 if rank_diff == 1 else 0
                penalty = base_points * discount * 0.1

            total_score += score
            total_penalty += penalty
            total_bonus += bonus

            step_details.append({
                "node": node,
                "global_rank": global_rank,
                "correct_rank": correct_rank,
                "base_points": base_points,
                "score": round(score, 2),
                "penalty": round(penalty, 2),
                "bonus": round(bonus, 2)
            })

        final_score = round(max(0, min(100, total_score - total_penalty + total_bonus)), 2)

        return {
            "step_score": final_score,
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
