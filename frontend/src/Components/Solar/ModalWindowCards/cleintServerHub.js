// parser.js
// Этот модуль отвечает за связь между моделью, полученной с сервера, и данными карточек на клиенте.

import { cards } from "./cards"; // импорт локальных карточек
import { v4 as uuidv4 } from "uuid";

/**
 * Функция для получения данных модели с сервера.
 * Предполагается, что сервер возвращает объект вида { matrices: [ { matrix_info, nodes, edges, ... } ] }
 */
async function fetchModelData() {
  try {
    const response = await fetch("/matrix_bp/matrices");
    if (!response.ok) {
      throw new Error(`Server error: ${response.status}`);
    }
    const data = await response.json();
    if (!data.matrices || data.matrices.length === 0) {
      throw new Error("No matrices returned from server");
    }
    // Для примера берем первую матрицу
    return data.matrices[0];
  } catch (error) {
    console.error("Error fetching model data:", error);
    throw error;
  }
}

/**
 * Функция объединения карточек с моделью.
 * @param {Object} mapping - необязательный объект сопоставления, где ключ — index карточки, значение — индекс вершины модели.
 * Если mapping не задан, используется прямая привязка: card.index === vertex index.
 */
async function parseCardsAndModels(mapping = {}) {
  try {
    const model = await fetchModelData();
    // Предполагаем, что в модели есть массив nodes (названия или объекты вершин)
    const vertices = model.nodes;
    // Выбираем локальный набор карточек (например, для определенной категории)
    // Здесь можно заменить "Orange" на нужный ключ или параметризовать выбор.
    const localCards = cards["Orange"];
    // Объединяем карточки с данными модели по сопоставлению:
    const unifiedCards = localCards.map((card) => {
      const vertexIndex = mapping.hasOwnProperty(card.index)
        ? mapping[card.index]
        : card.index;
      const modelVertex = vertices[vertexIndex] || null;
      return { ...card, modelVertex, id: uuidv4() };
    });
    return unifiedCards;
  } catch (error) {
    console.error("Error in parsing cards and models:", error);
    throw error;
  }
}

export { fetchModelData, parseCardsAndModels };
