import React from "react";
import "./AlgoPage.css";
import crimeImg from "./images/C_P.png";
import influenceGraphImg from "./images/influence_graph.png"; // Нужно будет добавить эту картинку!

export const AlgoPage = ({ setHeaderShow }) => {
  setHeaderShow = true;
  return (
    <div className="AlgoPage-main-div">
      <div className="algoPage-submain-div">
        <h1>
          <span className="blue-text">НАУЧНЫЙ БАЗИС</span> <span id="Algorithm-span" className="blue-background italic">Algorithm</span>
        </h1>
        <div className="Description-text">
          <p>
            <strong>Решаемая проблема</strong> — разработка системы искусственного интеллекта,
            воспроизводящей процесс <span className="blue-text">принятия человеком стратегических решений</span> при управлении
            сложными социо-гуманитарными системами (политическими, социальными).
          </p>
          <p><strong>Примеры ситуаций принятия решений:</strong></p>
          <ul>
            <li><p>управленческие решения президента в период (финансового, социального, военного) кризиса;</p></li>
            <li><p>управленческие решения руководителя правительства во время институциональных реформ и т. п.</p></li>
          </ul>

          <p><strong>Объективные характеристики:</strong></p>
          <ul>
            <li><p><span style={{fontStyle: "italic"}}>уникальность и неповторяемость</span> ситуаций принятия решений;</p></li>
            <li><p>факторы и связи <span style={{fontStyle: "italic"}}>не поддаются наблюдению</span> и измерению; отсутствуют даже единичные экземпляры данных;</p></li>
            <li><p>картина взаимосвязей <span style={{fontStyle: "italic"}}>субъективна</span> и зависит от мировоззренческой позиции лица, принимающего решение (ЛПР).</p></li>
          </ul>

          <p>
            <strong>Исследуемая система</strong> представляется в виде <span className="blue-text">когнитивной причинной модели</span> —
            ориентированного взвешенного знакового графа с детерминированной причинностью на дугах. Узлы — институциональные факторы,
            дуги — каузальные связи с весами от -1 до +1.
          </p>

          <p><strong><span className="italic">Пример:</span></strong> Когнитивная причинная модель «Преступление и наказание»:</p>
          <img src={crimeImg} width={750} style={{ alignSelf: "center" }} alt="Crime and Punishment Model" />
          <p>Узлы — факторы, стрелки — связи, числа рядом — веса связей.</p>

          <p><strong>Основная идея:</strong> система установок и убеждений человека предопределяет его стратегическую реакцию на изменения ситуации.</p>

          <p><strong>Стратегическое решение</strong> — это <span className="blue-text">набор управляющих воздействий</span> на систему, приводящих к желаемому изменению состояния системы (отклика).</p>

          <br />
          <h1 style={{ alignSelf: "center" }}>
            <span id="Algorithm-span" className="blue-background italic">Algorithm</span>
          </h1>
          <h2 style={{ letterSpacing: "5px", fontWeight: "bold" }}>HIGHLIGHTS</h2>

          <ul>
            <li><p>Алгоритм находит вектор отклика, связанный с вектором воздействия в когнитивных причинных моделях.</p></li>
            <li><p>Продуктивность влияния выражает степень сонаправленности отклика относительно базового вектора.</p></li>
            <li><p>Метрики выбора и генерации набора управляющих воздействий четко формализованы.</p></li>
          </ul>

          <h1><span>ОСНОВНЫЕ ХАРАКТЕРИСТИКИ</span> <span id="Algorithm-span" className="blue-background italic">Algorithm</span></h1>
          <p>Алгоритм реализует модель управления, выражающую <span className="blue-text">направление развития</span> системы.</p>
          <p>Алгоритм основан на спектральных свойствах матрицы смежности графа, представляющего модель ситуации, и не накладывает ограничений на направление связей, знак или диапазон весов на связях.</p>
          <p>Сценарии оцениваются на основе их соответствия стратегической цели по степени сонаправленности вектора отклика относительно базового вектора модели.</p>

          <p>Методология имеет три особенности:</p>
          <ol type="i">
            <li><p>сценарный подход реализуется относительно набора управлений;</p></li>
            <li><p>не требуется агрегирование неоднородных факторов модели;</p></li>
            <li><p>четкая формализация процесса выбора, не требующая математической подготовки от пользователя.</p></li>
          </ol>

          <h1>МАТЕМАТИЧЕСКИЙ БАЗИС</h1>
          <p><strong>Графическая интерпретация передачи влияний по связям графа:</strong></p>
          <img src={influenceGraphImg} width={750} style={{ alignSelf: "center", marginTop: "20px" }} alt="Influence Transfer Diagram" />
          <br />
          <p style={{ marginTop: "15px" }}><strong>Легенда:</strong></p>
          <ul>
            <li><p>t — момент времени;</p></li>
            <li><p>x — приращение отклика узлы в момент t;</p></li>
            <li><p>u — управляющее воздействие на вершину v;</p></li>
            <li><p>a — вес дуги между вершинами;</p></li>
            <li><p>нижний индекс — номер узлы;</p></li>
            <li><p>верхний индекс — момент времени.</p></li>
          </ul>
          <div style={{ textAlign: "center", marginTop: "20px" }}>
            <p>
              <strong>Таблица 1.</strong> Пошаговые вычисления значений откликов <span style={{ fontStyle: "italic" }}>x</span> вершин
              <span style={{ fontStyle: "italic" }}> v<sub>1</sub></span>,
              <span style={{ fontStyle: "italic" }}> v<sub>2</sub></span>,
              <span style={{ fontStyle: "italic" }}> v<sub>3</sub> </span>
              при передаче причинных влияний по дугам графа
            </p>
          </div>
          <table className="algo-table">
            <thead>
              <tr>
                <th></th>
                <th>t₀</th>
                <th>t₁</th>
                <th>t₂</th>
                <th>t₃</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><i>v₁</i></td>
                <td><i>x₁<sup>(0)</sup></i></td>
                <td><i>x₁<sup>(1)</sup> = u₁<sup>(0)</sup></i></td>
                <td><i>x₁<sup>(2)</sup> = u₁<sup>(1)</sup></i></td>
                <td><i>x₁<sup>(3)</sup> = u₁<sup>(2)</sup></i></td>
              </tr>
              <tr>
                <td><i>v₂</i></td>
                <td><i>x₂<sup>(0)</sup></i></td>
                <td><i>x₂<sup>(1)</sup> = u₂<sup>(0)</sup> + a₁₂x₁<sup>(0)</sup></i></td>
                <td><i>x₂<sup>(2)</sup> = u₂<sup>(1)</sup> + a₁₂x₁<sup>(1)</sup></i></td>
                <td><i>x₂<sup>(3)</sup> = u₂<sup>(2)</sup> + a₁₂x₁<sup>(2)</sup></i></td>
              </tr>
              <tr>
                <td><i>v₃</i></td>
                <td><i>x₃<sup>(0)</sup></i></td>
                <td><i>x₃<sup>(1)</sup> = u₃<sup>(0)</sup> + a₂₃x₂<sup>(0)</sup></i></td>
                <td><i>x₃<sup>(2)</sup> = u₃<sup>(1)</sup> + a₂₃x₂<sup>(1)</sup></i></td>
                <td><i>x₃<sup>(3)</sup> = u₃<sup>(2)</sup> + a₂₃x₂<sup>(2)</sup></i></td>
              </tr>
            </tbody>
          </table>

          <br />
          <br />
          <p style={{ marginTop: "20px" }}><strong>Главные научные труды (журналы Q1), изложившие основы алгоритма:</strong></p>
          <ol>
            <li>
              <p>
                Tselykh, A., Vasilev, V., Tselykh, L., Ferreira, F.A.F. Influence control method on directed weighted signed graphs with deterministic causality.{" "}
                <span>Annals of Operations Research,</span> 2022, 311(2), pp. 1281–1305.{" "}
                <a href="https://doi.org/10.1007/s10479-020-03587-8" target="_blank" rel="noopener noreferrer">
                  https://doi.org/10.1007/s10479-020-03587-8
                </a>
              </p>
            </li>
            <li>
              <p>
                Tselykh, A., Vasilev, V., Tselykh, L. Assessment of influence productivity in cognitive models.{" "}
                <span>Artificial Intelligence Review,</span> 2020, 53(7), pp. 5383–5409.{" "}
                <a href="https://doi.org/10.1007/s10462-020-09823-8" target="_blank" rel="noopener noreferrer">
                  https://doi.org/10.1007/s10462-020-09823-8
                </a>
              </p>
            </li>
          </ol>
        </div>
      </div>
    </div>
  );
};
