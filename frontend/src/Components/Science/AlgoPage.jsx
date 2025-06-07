import React from "react";
import "./AlgoPage.css";
import crimeImg from "./images/C_P.png";
import influenceGraphImg from "./images/influence_graph.png";

export const AlgoPage = ({ setHeaderShow }) => {
  setHeaderShow = true;
  return (
    <div className="AlgoPage-main-div">
      <div className="algoPage-submain-div">
        <h1>
          <span className="blue-text">SCIENTIFIC BASIS</span>{" "}
          <span id="Algorithm-span" className="blue-background italic">
            Algorithm
          </span>
        </h1>
        <div className="Description-text">
          <p>
            <strong>Problem Statement</strong> — developing an artificial
            intelligence system that reproduces the{" "}
            <span className="blue-text">
              human strategic decision-making process
            </span>{" "}
            when managing complex socio-humanitarian systems (political,
            social).
          </p>
          <p>
            <strong>Examples of decision-making scenarios:</strong>
          </p>
          <ul>
            <li>
              <p>
                executive decisions of a president during a (financial,
                social, military) crisis;
              </p>
            </li>
            <li>
              <p>
                administrative decisions of a head of government during
                institutional reforms, etc.
              </p>
            </li>
          </ul>

          <p>
            <strong>Objective characteristics:</strong>
          </p>
          <ul>
            <li>
              <p>
                <span style={{ fontStyle: "italic" }}>
                  uniqueness and unrepeatability
                </span>{" "}
                of decision-making situations;
              </p>
            </li>
            <li>
              <p>
                factors and connections{" "}
                <span style={{ fontStyle: "italic" }}>cannot be observed</span>{" "}
                or measured; no individual data samples exist;
              </p>
            </li>
            <li>
              <p>
                the network of interrelations is{" "}
                <span style={{ fontStyle: "italic" }}>subjective</span> and
                depends on the worldview of the decision maker (DM).
              </p>
            </li>
          </ul>

          <p>
            <strong>The system under study</strong> is represented as a{" "}
            <span className="blue-text">cognitive causal model</span> — a
            directed, weighted, signed graph with deterministic causality on
            its edges. Nodes are institutional factors; edges are causal
            connections with weights from –1 to +1.
          </p>

          <p>
            <strong>
              <span className="italic">Example:</span>
            </strong>{" "}
            Cognitive causal model “Crime and Punishment”:
          </p>
          <img
            src={crimeImg}
            width={750}
            style={{ alignSelf: "center" }}
            alt="Crime and Punishment Model"
          />
          <p>
            Nodes are factors, arrows are connections, numbers next to them are
            weights.
          </p>

          <p>
            <strong>Main idea:</strong> the system of a person’s attitudes and
            beliefs determines their strategic reaction to changes in the
            situation.
          </p>

          <p>
            <strong>Strategic decision</strong> — a{" "}
            <span className="blue-text">set of control actions</span> on the
            system that leads to the desired change in the system’s state
            (response).
          </p>

          <br />
          <h1 style={{ alignSelf: "center" }}>
            <span id="Algorithm-span" className="blue-background italic">
              Algorithm
            </span>
          </h1>
          <h2 style={{ letterSpacing: "5px", fontWeight: "bold" }}>HIGHLIGHTS</h2>

          <ul>
            <li>
              <p>
                the algorithm finds a response vector associated with a control
                vector in cognitive causal models;
              </p>
            </li>
            <li>
              <p>
                influence productivity measures the degree of alignment of the
                response relative to a baseline vector;
              </p>
            </li>
            <li>
              <p>
                metrics for selecting and generating sets of control actions are
                strictly formalized.
              </p>
            </li>
          </ul>

          <h1>
            <span>KEY FEATURES</span>{" "}
            <span id="Algorithm-span" className="blue-background italic">
              Algorithm
            </span>
          </h1>
          <p>
            the algorithm implements a management model expressing the{" "}
            <span className="blue-text">direction of system development</span>.
          </p>
          <p>
            the algorithm is based on spectral properties of the adjacency
            matrix of the graph representing the situation model and imposes no
            restrictions on edge direction, sign, or range of weights.
          </p>
          <p>
            scenarios are evaluated based on their alignment with the strategic
            objective by measuring the collinearity of the response vector
            relative to the model’s baseline vector.
          </p>

          <p>the methodology has three distinctive features:</p>
          <ol type="i">
            <li>
              <p>
                a scenario-based approach relative to sets of control actions;
              </p>
            </li>
            <li>
              <p>no need to aggregate heterogeneous model factors;</p>
            </li>
            <li>
              <p>
                clear formalization of the selection process requiring no
                mathematical background from the user.
              </p>
            </li>
          </ol>

          <h1>MATHEMATICAL BASIS</h1>
          <p>
            <strong>
              Graphical interpretation of the propagation of influence along
              graph edges:
            </strong>
          </p>
          <img
            src={influenceGraphImg}
            width={750}
            style={{ alignSelf: "center", marginTop: "20px" }}
            alt="Influence Transfer Diagram"
          />
          <br />
          <p style={{ marginTop: "15px" }}>
            <strong>Legend:</strong>
          </p>
          <ul>
            <li>
              <p>t — time moment;</p>
            </li>
            <li>
              <p>x — change in a node’s response at time t;</p>
            </li>
            <li>
              <p>u — control action on node v;</p>
            </li>
            <li>
              <p>a — weight of the edge between nodes;</p>
            </li>
            <li>
              <p>lower index — node number;</p>
            </li>
            <li>
              <p>upper index — time moment.</p>
            </li>
          </ul>
          <div style={{ textAlign: "center", marginTop: "20px" }}>
            <p>
              <strong>Table 1.</strong> Step-by-step computation of response
              values <span style={{ fontStyle: "italic" }}>x</span> for nodes{" "}
              <span style={{ fontStyle: "italic" }}>v<sub>1</sub></span>,{" "}
              <span style={{ fontStyle: "italic" }}>v<sub>2</sub></span>,{" "}
              <span style={{ fontStyle: "italic" }}>v<sub>3</sub></span> during
              the propagation of causal influences along graph edges
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
                <td><em>v₁</em></td>
                <td><em>x₁<sup>(0)</sup></em></td>
                <td><em>x₁<sup>(1)</sup> = u₁<sup>(0)</sup></em></td>
                <td><em>x₁<sup>(2)</sup> = u₁<sup>(1)</sup></em></td>
                <td><em>x₁<sup>(3)</sup> = u₁<sup>(2)</sup></em></td>
              </tr>
              <tr>
                <td><em>v₂</em></td>
                <td><em>x₂<sup>(0)</sup></em></td>
                <td>
                  <em>
                    x₂<sup>(1)</sup> = u₂<sup>(0)</sup> + a₁₂ x₁<sup>(0)</sup>
                  </em>
                </td>
                <td>
                  <em>
                    x₂<sup>(2)</sup> = u₂<sup>(1)</sup> + a₁₂ x₁<sup>(1)</sup>
                  </em>
                </td>
                <td>
                  <em>
                    x₂<sup>(3)</sup> = u₂<sup>(2)</sup> + a₁₂ x₁<sup>(2)</sup>
                  </em>
                </td>
              </tr>
              <tr>
                <td><em>v₃</em></td>
                <td><em>x₃<sup>(0)</sup></em></td>
                <td>
                  <em>
                    x₃<sup>(1)</sup> = u₃<sup>(0)</sup> + a₂₃ x₂<sup>(0)</sup>
                  </em>
                </td>
                <td>
                  <em>
                    x₃<sup>(2)</sup> = u₃<sup>(1)</sup> + a₂₃ x₂<sup>(1)</sup>
                  </em>
                </td>
                <td>
                  <em>
                    x₃<sup>(3)</sup> = u₃<sup>(2)</sup> + a₂₃ x₂<sup>(2)</sup>
                  </em>
                </td>
              </tr>
            </tbody>
          </table>

          <br />
          <br />
          <p style={{ marginTop: "20px" }}>
            <strong>
              Main scientific works (Q1 journals) outlining the foundations of
              the algorithm:
            </strong>
          </p>
          <ol>
            <li>
              <p>
                Tselykh, A., Vasilev, V., Tselykh, L., Ferreira, F.A.F. Influence
                control method on directed weighted signed graphs with
                deterministic causality. <em>Annals of Operations Research,</em>{" "}
                2022, 311(2), pp. 1281–1305.{" "}
                <a
                  href="https://doi.org/10.1007/s10479-020-03587-8"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  https://doi.org/10.1007/s10479-020-03587-8
                </a>
              </p>
            </li>
            <li>
              <p>
                Tselykh, A., Vasilev, V., Tselykh, L. Assessment of influence
                productivity in cognitive models.{" "}
                <em>Artificial Intelligence Review,</em> 2020, 53(7), pp.
                5383–5409.{" "}
                <a
                  href="https://doi.org/10.1007/s10462-020-09823-8"
                  target="_blank"
                  rel="noopener noreferrer"
                >
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
