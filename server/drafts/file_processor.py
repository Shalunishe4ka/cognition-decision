import pathlib
import shutil
import pandas as pd
import json
import sys
import subprocess
import re

# Определяем базовую директорию относительно текущего скрипта
BASE_DIR = pathlib.Path(__file__).parent.resolve()

def convert_excel_to_txt(input_file, output_file):
    """
    Преобразует Excel-файл в текстовый файл, совместимый с Fortran, с возможностью задания
    damping factor, ограничений и влияния вершин.
    """
    try:
        df = pd.read_excel(input_file, index_col=0)
        # Индексация строк и столбцов начинается с 1
        df.index = range(1, len(df.index) + 1)
        df.columns = range(1, len(df.columns) + 1)

        with open(output_file, "w") as f:
            # Записываем заголовок с количеством столбцов, damping factor и фиксированным значением 0.2
            f.write(f"{len(df.columns)}\n")

            # Ввод параметров для вершин (ограничения, демпинг и т.д.)
            vertices = []
            vertices_influence = [0, 0, 0]
            while True:
                vertex_selection = input(f"Введите номер вершины (от 1 до {len(df.columns)}) или 0 для завершения: ")
                if vertex_selection == "0":
                    # Форматируем списки для записи
                    vertices_str = re.sub(r'[\[\]]', '', str(vertices)).replace(", ", " ")
                    influence_str = re.sub(r'[\[\]]', '', str(vertices_influence)).replace(", ", "\t")
                    f.write(influence_str + "\n")
                    f.write(vertices_str + "\n")
                    break
                try:
                    vertex_num = int(vertex_selection)
                except ValueError:
                    print("Введите корректное числовое значение.")
                    continue
                if vertex_num < 1 or vertex_num > len(df.columns):
                    print(f"Введите число от 1 до {len(df.columns)}.")
                    continue
                if vertex_num in vertices:
                    print("Это значение уже было введено!")
                    continue
                vertices.append(vertex_num)
                vertex_impact = input("Какое влияние на вершину оказываем: 1)N(0) 2)N(+) 3)N(-): ")
                if vertex_impact == "1":
                    vertices_influence = [x + y for x, y in zip(vertices_influence, [1, 1, 1])]
                elif vertex_impact == "2":
                    vertices_influence = [x + y for x, y in zip(vertices_influence, [0, 1, 1])]
                elif vertex_impact == "3":
                    vertices_influence = [x + y for x, y in zip(vertices_influence, [0, 0, 1])]
                else:
                    print("Неверный выбор влияния, попробуйте снова.")

            # Собираем список ребер (значения, отличные от нуля)
            result = []
            for row_index, row in df.iterrows():
                for col_index in df.columns:
                    value = row[col_index]
                    if value != 0:
                        result.append((row_index, col_index, 0, value))
            # Записываем данные ребер
            for i, entry in enumerate(result):
                if i < len(result) - 1:
                    f.write(f"{entry[0]}\t{entry[1]}\t{entry[2]}\t{entry[3]}\n")
                else:
                    f.write(f"{entry[0]}\t{entry[1]}\t{entry[2]}\t{entry[3]}")

        print(f"[INFO] Преобразован файл: {input_file} -> {output_file}")
    except Exception as e:
        print(f"[ERROR] Не удалось обработать файл {input_file}: {e}")


def convert_txt_to_fortran(input_file, output_file):
    """
    Преобразует текстовый файл в формат, совместимый с Fortran, с возможностью задания
    damping factor и параметров для вершин.
    """
    try:
        # Чтение входного текстового файла
        with open(input_file, "r") as f:
            lines = f.readlines()

        # Извлекаем заголовки (колонки), пропуская первую колонку
        headers = lines[0].strip().split("\t")[1:]

        with open(output_file, "w") as f:
            # Записываем заголовок: размерность матрицы, damping factor, фиксированное значение 0.2
            f.write(f"{len(headers)+1}\n")

            # Ввод параметров для вершин
            vertices = []
            vertices_influence = [0, 0, 0]
            while True:
                vertex_selection = input(f"Введите номер вершины (от 1 до {len(headers)+1}) или 0 для завершения: ")
                if vertex_selection == "0":
                    vertices_str = re.sub(r'[\[\]]', '', str(vertices)).replace(", ", " ")
                    influence_str = re.sub(r'[\[\]]', '', str(vertices_influence)).replace(", ", "\t")
                    f.write(influence_str + "\n")
                    f.write(vertices_str + "\n")
                    break
                try:
                    vertex_num = int(vertex_selection)
                except ValueError:
                    print("Введите корректное числовое значение.")
                    continue
                if vertex_num < 1 or vertex_num > len(headers):
                    print(f"Введите число от 1 до {len(headers)}.")
                    continue
                if vertex_num in vertices:
                    print("Это значение уже было введено!")
                    continue
                vertices.append(vertex_num)
                vertex_impact = input("Какое влияние на вершину оказываем: 1)N(0) 2)N(+) 3)N(-): ")
                if vertex_impact == "1":
                    vertices_influence = [x + y for x, y in zip(vertices_influence, [1, 1, 1])]
                elif vertex_impact == "2":
                    vertices_influence = [x + y for x, y in zip(vertices_influence, [0, 1, 1])]
                elif vertex_impact == "3":
                    vertices_influence = [x + y for x, y in zip(vertices_influence, [0, 0, 1])]
                else:
                    print("Неверный выбор влияния, попробуйте снова.")

            # Обработка входных данных для формирования матрицы
            matrix = []
            for i, line in enumerate(lines[1:]):
                values = line.strip().split("\t")[1:]
                for j, value in enumerate(values):
                    try:
                        weight = float(value)
                    except ValueError:
                        continue
                    if weight != 0:
                        matrix.append((i + 1, j + 1, 0, weight))
            # Записываем данные ребер в файл
            for row in matrix:
                f.write("\t".join(map(str, row)) + "\n")

        print(f"[INFO] Преобразован файл: {input_file} -> {output_file}")
    except Exception as e:
        print(f"[ERROR] Ошибка при обработке файла {input_file}: {e}")




def process_fortran_output(file_name):
    """
    Обрабатывает выходные данные Fortran-программы и сохраняет результаты.
    """
    try:
        # Убедитесь, что путь к файлу report.txt правильный
        report_file_path = BASE_DIR / "report.txt"
        
        if report_file_path.exists():
            x = []
            u = []
            with open(report_file_path, "r") as report:
                for i in report.readlines():
                    if len(i) <= 23:
                        x.append(float(i[1:10]))
                        u.append(float(i[12:-1]))

            sq_x = [num ** 2 for num in x]
            sq_u = [num ** 2 for num in u]

            sum_u = sum(sq_u)

            normalized_u = [round(value / sum_u, 4) for value in sq_u]

            sorted_list_u = {i + 1: value for i, value in enumerate(normalized_u)}

            # Создание пар (индекс, sq_x, sorted_list_u)
            # Создаем пары (id, sq_x)
            pairs = list(enumerate(sq_x, start=1))
        
            # Сортируем пары по значениям sq_x в порядке убывания
            sorted_pairs = sorted(pairs, key=lambda pair: pair[1], reverse=True)
        
            # Преобразуем в словарь с id как ключами и sq_x как значениями
            result_dict = {str(pair[0]): pair[1] for pair in sorted_pairs}
        
            # Сохраняем результат в JSON-файл
            result_file_path = BASE_DIR / "../data/processed_files/True_Seq" / f"{file_name}_result.json"
            with open(result_file_path, "w") as json_file:
                json.dump(result_dict, json_file, indent=4)

            # Чтение Maximal_Eigen_Value.txt и создание нового файла с использованием имени матрицы
            max_eigen_value_path = BASE_DIR / "Maximal_Eigen_Value.txt"
            if pathlib.Path(max_eigen_value_path).exists():
                max_eigen_value = open(max_eigen_value_path, "r").read().strip()
            else:
                print(f"[WARNING] Файл {max_eigen_value_path} не найден. Пропускаем его обработку.")
                max_eigen_value = "Не найдено"

            # Копирование Maximal_Eigen_Value.txt в Vadimka с новым именем
            max_eigen_value_file = BASE_DIR / "../data/processed_files/MEVs" / f"{file_name}_MEV.txt"
            with open(max_eigen_value_file, "w") as f:
                f.write(f"Maximal Eigen Value: {max_eigen_value}\n")

            # Копирование отчета в Vadimka с новым именем
            report_file_copy_path = BASE_DIR / "../data/processed_files/Reports" / f"{file_name}_report.txt"
            shutil.copy(str(BASE_DIR / "report.txt"), str(report_file_copy_path))

            print(f"[INFO] Обработан файл: {file_name}. Результат: {result_file_path}, {max_eigen_value_file}, {report_file_copy_path}")
        else:
            print(f"[WARNING] Файл report.txt не найден для {file_name}")

    except Exception as e:
        print(f"[ERROR] Ошибка при обработке выходных данных Fortran для файла {file_name}: {e}")




def process_input_files(input_folder, output_folder, fortran_file):
    """
    Обрабатывает все входные файлы, преобразует их в совместимый формат и запускает Fortran.
    """
    input_path = pathlib.Path(input_folder)
    output_path = pathlib.Path(output_folder)

    # Создаем выходную папку, если её нет
    if not output_path.exists():
        output_path.mkdir(parents=True)

    input_files = [file for file in input_path.glob("*") if file.is_file()]
    print(f"[DEBUG] Найдено файлов для обработки: {len(input_files)}")
    if not input_files:
        print("[WARNING] Нет файлов для обработки.")
        return

    for file in input_files:
        try:
            print(f"[DEBUG] Обрабатываем файл: {file}")

            # Преобразование в формат TXT
            if file.suffix == ".xlsx":
                temp_txt_file = output_path / f"{file.stem}_converted.txt"
                print(f"[DEBUG] Преобразуем Excel -> TXT: {temp_txt_file}")
                convert_excel_to_txt(file, temp_txt_file)
                input_file = temp_txt_file
            elif file.suffix == ".txt":
                temp_txt_file = output_path / f"{file.stem}_converted.txt"
                print(f"[DEBUG] Преобразуем TXT -> Fortran: {temp_txt_file}")
                convert_txt_to_fortran(file, temp_txt_file)
                input_file = temp_txt_file
            else:
                print(f"[WARNING] Неподдерживаемый формат файла: {file.name}")
                continue

            # Копируем файлы в папку Fortran
            shutil.copy(input_file, BASE_DIR / "matrica.txt")

            # Компиляция Fortran-программы
            result = subprocess.run(
                ["gfortran", str(fortran_file), "-o", str(BASE_DIR / "edited_mils.out"), "-O3"],
                text=True
            )
            print(f"[DEBUG] Результат компиляции: {result.returncode}")
            if result.returncode != 0:
                print(f"[ERROR] Ошибка компиляции: {result.stderr}")
                continue

            # Выполнение Fortran-программы
            result = subprocess.run(
                [str(BASE_DIR / "edited_mils.out")],
                text=True,
                cwd=BASE_DIR  # Указание рабочей директории
            )
            print(f"[DEBUG] Результат выполнения: {result.returncode}")
            print(f"[DEBUG] Стандартный вывод: {result.stdout}")
            print(f"[DEBUG] Стандартная ошибка: {result.stderr}")

            if result.returncode != 0:
                print(f"[ERROR] Ошибка выполнения Fortran: {result.stderr}")
                continue

            process_fortran_output(file.stem)

        except Exception as e:
            print(f"[ERROR] Ошибка при обработке файла {file.name}: {e}")

        finally:
            for temp_file in ["matrica.txt", "edited_mils.out", "report.txt", "Maximal_Eigen_Value.txt"]:
                temp_path = BASE_DIR / temp_file
                if temp_path.exists():
                    temp_path.unlink()


if __name__ == "__main__":
    # Папки для входных и выходных файлов
    INPUT_FOLDER = BASE_DIR / "../data/models"
    FORTRAN_FILE = BASE_DIR / "edited_mils.f90"
    OUTPUT_FOLDER = BASE_DIR / "../data/processed_files/Models"  # Указываем папку для выходных данных

    if len(sys.argv) > 1:
        matrix_file_name = sys.argv[1]
        print(f"[INFO] Обрабатываем только файл: {matrix_file_name}")
        process_input_files(INPUT_FOLDER, OUTPUT_FOLDER, FORTRAN_FILE)
    else:
        print("[INFO] Обрабатываем все файлы в папке")
        process_input_files(INPUT_FOLDER, OUTPUT_FOLDER, FORTRAN_FILE)
