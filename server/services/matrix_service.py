import pandas as pd
import os
from config.settings import STATIC_MODELS_DIR, STATIC_MODELS_META_DIR
from utils.file_utils import read_matrix_file

# Глобальные переменные
matrix_ids = {}  # ключ = int ID, значение = matrix_name
matrix_name_to_id = {}  # для обратного поиска

# === Новый способ инициализации matrix_ids ===
def initialize_matrix_ids():
    files = sorted([f for f in os.listdir(STATIC_MODELS_DIR) if f.endswith(".txt")])
    for idx, filename in enumerate(files, start=1):
        matrix_name = filename[:-4]
        matrix_ids[idx] = matrix_name
        matrix_name_to_id[matrix_name] = idx

initialize_matrix_ids()  # Запускаем инициализацию при загрузке модуля


def get_all_matrices():
    matrices = []
    for matrix_id, matrix_name in matrix_ids.items():
        matrix_data = get_matrix_data_by_name(matrix_name)
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


def get_matrix_data_by_name(matrix_name):
    matrix_file_path = os.path.join(STATIC_MODELS_DIR, f"{matrix_name}.txt")
    matrix_data = read_matrix_file(matrix_file_path, matrix_name)
    meta_file_path = os.path.join(STATIC_MODELS_META_DIR, f"{matrix_name}.json")

    if os.path.exists(meta_file_path):
        try:
            with open(meta_file_path, 'r', encoding='utf-8') as meta_file:
                meta_data = pd.read_json(meta_file).to_dict()
                matrix_data['meta'] = meta_data
        except Exception as e:
            print(f"Ошибка чтения метафайла для {matrix_name}: {e}")
    return matrix_data


def get_matrix_data(matrix_id):
    """
    Извлекает данные матрицы по её ID.
    """
    matrix_name = matrix_ids.get(matrix_id)
    if not matrix_name:
        return None

    return get_matrix_data_by_name(matrix_name)


def get_meta_data(matrix_name):
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
    report_path = f"./data/f90_calcs/{matrix_name}_report.txt"
    if not os.path.exists(report_path):
        return {}

    try:
        with open(report_path, 'r') as report:
            u = []
            for line in report.readlines():
                if len(line) <= 23:
                    u.append(float(line[12:-1]))
            sq_u = [num ** 2 for num in u]
            sum_u = sum(sq_u)
            normalized = [val / sum_u for val in sq_u]
            indexes = range(1, len(normalized) + 1)
            result = {idx: round(val, 4) for idx, val in zip(indexes, normalized)}
            return dict(sorted(result.items(), key=lambda item: item[1], reverse=True))
    except Exception as e:
        print(f"Ошибка обработки отчёта для {matrix_name}: {e}")
        return {}
