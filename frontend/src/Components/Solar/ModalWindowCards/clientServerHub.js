// clientServerHub.js

const BASE_URL = "http://localhost:8000";

/**
 * Утилита для fetch-запросов. 
 * Можно доработать её (добавить заголовки Authorization, обработку токенов и т.д.)
 */
async function fetchJson(url, options = {}) {
  const res = await fetch(url, {
    ...options,
    headers: { "Content-Type": "application/json", ...(options.headers || {}) },
  });
  if (!res.ok) {
    throw new Error(`Ошибка fetch: ${res.status} ${res.statusText}`);
  }
  return res.json();
}

/**
 * 1. Получить список матриц (GET /matrices).
 * Сервер возвращает объект вида: { matrices: [{ matrix_id, matrix_name, ...}, ...] }
 */
export async function getAllMatrices() {
  return await fetchJson(`${BASE_URL}/matrices`);
}

export async function getMatrixByCardId(cardId) {
  return fetchJson(`${BASE_URL}/matrix_by_card/${cardId}`);
}

/**
 * 2. Получить конкретную матрицу по её ID (GET /matrix/{id}).
 * Сервер вернёт: { matrix_info: { matrix_name }, nodes, edges }
 */
export async function getMatrixById(matrixId) {
  return await fetchJson(`${BASE_URL}/matrix/${matrixId}`);
}

/**
 * 3. Рассчитать очки (POST /calculate_score).
 * Ожидает { selectedNodes, matrixName } в теле запроса.
 * Возвращает { turn_score, total_score, turns }.
 */
export async function calculateScore(selectedNodes, matrixName) {
  const body = { selectedNodes, matrixName };
  return await fetchJson(`${BASE_URL}/calculate_score`, {
    method: "POST",
    body: JSON.stringify(body),
  });
}

/**
 * 4. Запустить / прочитать научную обработку (POST /science_table).
 * Ожидает { matrixName } в теле.
 * Возвращает, например: { x, u, normalized_x, normalized_u, sorted_true_seq, ...}
 */
export async function getScienceTable(matrixName) {
  const body = { matrixName };
  return await fetchJson(`${BASE_URL}/science_table`, {
    method: "POST",
    body: JSON.stringify(body),
  });
}

/**
 * 5. Получить матрицу по UUID карточки (GET /matrix_by_uuid/{uuid}).
 * Сервер вернёт: { matrix_info: { matrix_name }, nodes, edges }
 */
export async function getMatrixByUUID(uuid) {
  return await fetchJson(`${BASE_URL}/matrix_by_uuid/${uuid}`);
}

export async function load(params) {
  
}


/**
 * Загрузить дефолтные настройки для графа (без учёта userUuid).
 * Ожидается эндпоинт: GET /load-graph-settings/{matrix_uuid}
 * Возвращает объект: { graph_settings, node_coordinates }
 */
export async function loadDefaultCoordinatesAPI(uuid) {
  return fetchJson(`${BASE_URL}/load-graph-settings/${uuid}`);
}

/**
 * Загрузить пользовательские настройки (учитывая userUuid).
 * Ожидается эндпоинт: GET /{user_id}/load-graph-settings/{matrix_uuid}
 */
export async function loadUserCoordinatesAPI(uuid, userUuid) {
  return fetchJson(`${BASE_URL}/${userUuid}/load-graph-settings/${uuid}`);
}

/**
 * Сохранить дефолтные настройки (POST /save-graph-settings/{matrix_uuid}).
 * Принимает объект { graph_settings, node_coordinates }
 */
export async function saveGraphSettingsDefaultAPI(uuid, settings) {
  return fetchJson(`${BASE_URL}/save-graph-settings/${uuid}`, {
    method: "POST",
    body: JSON.stringify(settings),
  });
}

/**
 * Сохранить пользовательские настройки (POST /{user_id}/save-graph-settings/{matrix_uuid})
 */
export async function saveUserGraphSettingsAPI(uuid, userUuid, settings) {
  return fetchJson(`${BASE_URL}/${userUuid}/save-graph-settings/${uuid}`, {
    method: "POST",
    body: JSON.stringify(settings),
  });
}