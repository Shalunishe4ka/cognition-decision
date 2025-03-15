import { supabase } from "../UserCredsPage/supabaseClient";
import React from 'react'
async function saveGameResult(score, duration) {
  const { data: { user } } = await supabase.auth.getUser(); // Получаем текущего пользователя

  if (!user) {
    console.error("Пользователь не авторизован");
    return;
  }

  const { error } = await supabase
    .from("game_history")
    .insert([{ user_id: user.id, score, duration }]);

  if (error) {
    console.error("Ошибка сохранения игры:", error.message);
  } else {
    console.log("Результат игры сохранён!");
  }
}



export const TEST1 = () => {
  return (
    <div>
        <p></p>
    </div>
  )
}
