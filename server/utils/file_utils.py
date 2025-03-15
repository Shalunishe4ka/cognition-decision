import pandas as pd

def read_matrix_file(file_path, matrix_name):
    """
    Читает матрицу из файла и возвращает её представление в виде графа.
    Пропускает рёбра с нулевыми значениями.
    """
    try:
        # Читаем матрицу
        matrix_df = pd.read_csv(file_path, sep='\t', index_col=0)

        # Создаем узлы
        nodes = [{'id': i + 1, 'name': str(node_name)} for i, node_name in enumerate(matrix_df.columns)]

        # Создаем рёбра
        edges = []
        for source_node_name, row in matrix_df.iterrows():
            source_node_id = matrix_df.columns.get_loc(str(source_node_name)) + 1
            for target_node_name, value in row.items():
                target_node_id = matrix_df.columns.get_loc(str(target_node_name)) + 1
                if pd.notna(value) and value != 0:  # Условие: значение должно быть не NaN и не равно 0
                    edges.append({
                        'from': source_node_id,
                        'to': target_node_id,
                        'value': float(value)
                    })

        # Возвращаем результат
        return {
            'matrix_name': matrix_name,
            'nodes': nodes,
            'edges': edges,
            'description': f"Matrix '{matrix_name}' parsed successfully. Zero values ignored."
        }

    except FileNotFoundError:
        print(f"Error: File '{file_path}' not found.")
        return None
    except Exception as e:
        print(f"Error processing the matrix: {e}")
        return None