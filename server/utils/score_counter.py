import numpy as np

def calculate_order_score(user_order, matrix_order):
    """
    Функция для расчета очков в зависимости от порядка вершин.
    Чем ближе порядок пользователя к порядку словаря, тем больше очков.
    Максимум баллов за ИГРУ - 100.
    """
    try:
        # Создаем отображение индексов для каждой вершины в matrix_order
        matrix_order_sorted = sorted(matrix_order.items(), key=lambda x: x[1], reverse=True)
        matrix_order_list = [x[0] for x in matrix_order_sorted]

        # Для каждого хода считаем отклонение от правильного порядка
        order_diff = np.array([abs(matrix_order_list.index(node) - idx) for idx, node in enumerate(user_order)])
        max_diff = len(user_order) - 1

        # Нормализуем очки
        score = (1 - np.sum(order_diff) / (max_diff * len(user_order))) * 100

        # Проверка на корректность результата
        if not isinstance(score, (int, float)) or np.isnan(score) or score < 0:
            score = 0

        return round(score, 2)

    except Exception as e:
        print(f"Error in calculate_order_score: {e}")
        return 0  # Возвращаем 0 в случае ошибки