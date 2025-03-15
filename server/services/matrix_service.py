import pandas as pd
import os
from config.settings import STATIC_MODELS_DIR, STATIC_MODELS_META_DIR
from utils.file_utils import read_matrix_file

# Глобальные переменные
matrix_ids = {}
matrix_id_counter = 1

# Инициализация матриц
for filename in os.listdir(STATIC_MODELS_DIR):
    if filename.endswith(".txt"):
        matrix_name = filename[:-4]  # Убираем ".txt"
        matrix_ids[matrix_id_counter] = matrix_name
        matrix_id_counter += 1


def get_all_matrices():
    matrices = []
    for matrix_id, matrix_name in matrix_ids.items():
        matrix_data = get_matrix_data(matrix_id)
        meta_data = get_meta_data(matrix_name)
        if matrix_data:
            matrices.append({
                'matrix_id': matrix_id,
                'matrix_name': matrix_name,
                'node_count': len(matrix_data['nodes']),
                'edge_count': len(matrix_data['edges']),
                'meta': meta_data
            })
    return matrices


def get_matrix_data(matrix_id):
    """
    Извлекает данные матрицы из файла и дополняет метаданными.
    """
    matrix_name = matrix_ids.get(matrix_id)
    if not matrix_name:
        return None

    # Путь к файлу матрицы
    matrix_file_path = os.path.join(STATIC_MODELS_DIR, f"{matrix_name}.txt")
    matrix_data = read_matrix_file(matrix_file_path, matrix_name)

    # Путь к метафайлу
    meta_file_path = os.path.join(STATIC_MODELS_META_DIR, f"{matrix_name}.json")
    meta_data = None

    if os.path.exists(meta_file_path):
        try:
            with open(meta_file_path, 'r', encoding='utf-8') as meta_file:
                meta_data = pd.read_json(meta_file).to_dict()
        except Exception as e:
            print(f"Ошибка чтения метафайла для {matrix_name}: {e}")

    # Добавляем метаданные, если они есть
    if meta_data:
        matrix_data['meta'] = meta_data

    return matrix_data


def get_meta_data(matrix_name):
    """
    Читает информацию из метафайлов.
    """
    meta_file_path = os.path.join(STATIC_MODELS_META_DIR, f"{matrix_name}.json")
    if not os.path.exists(meta_file_path):
        return None

    try:
        with open(meta_file_path, 'r', encoding='utf-8') as meta_file:
            meta_data = pd.read_json(meta_file)
            return meta_data.to_dict()
    except Exception as e:
        print(f"Ошибка чтения метафайла для {matrix_name}: {e}")
        return None


def get_response_strength(matrix_name):
    """
    Возвращает словарь откликов для заданной матрицы.
    """
    report_path = f"./data/f90_calcs/{matrix_name}_report.txt"
    if not os.path.exists(report_path):
        return {}

    try:
        with open(report_path, 'r') as report:
            u = []
            for i in report.readlines():
                if len(i) <= 23:
                    u.append(float(i[12:-1]))
            sq_u = [float(num) ** 2 for num in u]
            sum_u = sum(sq_u)
            sorted_list_u = []
            for f in sq_u:
                sorted_list_u.append(f / sum_u)
            indexes = [q for q in range(1, len(sorted_list_u) + 1)]
            result = {index: round(value, 4) for index, value in zip(indexes, sorted_list_u)}
            sorted_result_desc = dict(sorted(result.items(), key=lambda item: item[1], reverse=True))
            print(sorted_result_desc)
            return sorted_result_desc
    except Exception as e:
        print(f"Ошибка обработки файла откликов для {matrix_name}: {e}")
        return {}
