import { jwtDecode } from "jwt-decode";

const BASE_URL = `${window.location.protocol}//${window.location.hostname}:8000`;

// const BASE_URL = "http://localhost:8000"

/**
 * Утилита для fetch-запросов с обработкой ошибок.
 */
async function fetchJson(url, options = {}) {
  const token = localStorage.getItem("access_token"); // <-- твой токен
  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };
  if (token) {
    // Прокидываем авторизацию
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(url, {
    ...options,
    headers,
  });
  if (!res.ok) {
    // Ошибка - читаем и бросаем
    const errorData = await res.json().catch(() => ({}));
    throw new Error(
      errorData.error || `Ошибка fetch: ${res.status} ${res.statusText}`
    );
  }
  return res.json().catch(() => ({}));
}

// ========================= АВТОРИЗАЦИЯ ========================= //

/**
 * Декодирует JWT и возвращает user_uuid.
 * Если поле uuid отсутствует, пытается взять sub.
 */
export const getUserUuidFromToken = () => {
  try {
    const token = localStorage.getItem("access_token");
    if (!token) return null;
    const decoded = jwtDecode(token);
    // Попытка сначала взять decoded.uuid, а если его нет, то decoded.sub
    return decoded.uuid || decoded.sub || null;
  } catch (error) {
    console.error("Ошибка при декодировании токена:", error);
    return null;
  }
};

/**
 * Регистрирует пользователя.
 * Ожидается, что сервер вернёт JSON с { message, user_uuid }.
 */
export async function registerUser(username, email, password) {
  const body = { username, email, password };
  const response = await fetchJson(`${BASE_URL}/sign-up`, {
    method: "POST",
    body: JSON.stringify(body),
  });
  if (response.user_uuid) {
    localStorage.setItem("user_uuid", response.user_uuid);
  }
  return response;
}

/**
 * Входит в систему.
 * Ожидается, что сервер вернёт JSON с { message, access_token }.
 * После получения токена сохраняет его и user_uuid в localStorage.
 */
export async function loginUser(username, password) {
  const body = { username, password };
  const response = await fetchJson(`${BASE_URL}/sign-in`, {
    method: "POST",
    body: JSON.stringify(body),
  });
  const payload = Array.isArray(response) ? response[0] : response;
  // console.log("Ответ от сервера:", payload);
  if (payload.access_token) {
    localStorage.setItem("access_token", payload.access_token);
    const user_uuid = getUserUuidFromToken(payload.access_token);
    // console.log("user_uuid из токена:", user_uuid);
    if (user_uuid) {
      localStorage.setItem("user_uuid", user_uuid);
    }
  } else {
    console.warn("access_token отсутствует в ответе");
  }
  return payload;
}

// ========================= МАТРИЦЫ ========================= //

export async function getAllMatrices() {
  return await fetchJson(`${BASE_URL}/matrices`);
}

export async function getMatrixByCardId(cardId) {
  return fetchJson(`${BASE_URL}/matrix_by_card/${cardId}`);
}

export async function getMatrixById(matrixId) {
  return await fetchJson(`${BASE_URL}/matrix/${matrixId}`);
}

export async function getMatrixByUUID(uuid) {
  return await fetchJson(`${BASE_URL}/matrix_by_uuid/${uuid}`);
}

export async function calculateScore(selectedNodes, uuid) {
  const body = { selectedNodes, uuid };
  return await fetchJson(`${BASE_URL}/calculate_score`, {
    method: "POST",
    body: JSON.stringify(body),
  });
}

// ====== Сброс (reset-game) ======
export async function resetGame(uuid) {
  // uuid — это matrixInfo.matrix_info.uuid
  const body = { uuid };
  return await fetchJson(`${BASE_URL}/reset-game`, {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export async function fetchScienceDataByUUID(matrixUuid) {
  return fetchJson(`${BASE_URL}/science_table`, {
    method: "POST",
    body: JSON.stringify({ matrixUuid }),
  });
}

export async function logScienceQuery(matrixUuid, userUuid) {
  return fetchJson(`${BASE_URL}/log-science-query`, {
    method: "POST",
    body: JSON.stringify({ matrixUuid, userUuid }),
  });
}

// ========================= ГРАФ-НАСТРОЙКИ ========================= //

export async function loadDefaultCoordinatesAPI(uuid) {
  return fetchJson(`${BASE_URL}/load-graph-settings/${uuid}`);
}

export async function loadUserCoordinatesAPI(uuid, userUuid) {
  return fetchJson(`${BASE_URL}/${userUuid}/load-graph-settings/${uuid}`);
}

export async function saveGraphSettingsDefaultAPI(uuid, settings) {
  return fetchJson(`${BASE_URL}/save-graph-settings/${uuid}`, {
    method: "POST",
    body: JSON.stringify(settings),
  });
}

export async function saveUserGraphSettingsAPI(uuid, userUuid, settings) {
  return fetchJson(`${BASE_URL}/${userUuid}/save-graph-settings/${uuid}`, {
    method: "POST",
    body: JSON.stringify(settings),
  });
}

// ========================= Science ========================= //

export async function logScienceAttempt(matrixUuid) {
  // matrixUuid можно передавать, если нужно, но сервер получит user_uuid из токена
  return await fetchJson(`${BASE_URL}/science_attempt`, {
    method: "POST",
    body: JSON.stringify({ matrixUuid })
  });
}

export async function getScienceClicks() {
  return await fetchJson(`${BASE_URL}/science_clicks`);
}
