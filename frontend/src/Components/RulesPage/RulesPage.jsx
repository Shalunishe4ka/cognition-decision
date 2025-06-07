import React from "react";
import "./RulesPage.css";
import { Link } from "react-router-dom";
import crimeImg from "../Science/images/C_P.png";

export const RulesPage = ({ setHeaderShow }) => {
  setHeaderShow = true;
  return (
    <div className="container Rules-div">
      <h1 className="Start-End-Phrase">Meet the Equilibrium!</h1>

      <h2 id="sub-topic">Game Objective</h2>
      <p>
        <span id="sub-paragraph">Score</span> as many points as possible out of
        100 in a single game. This represents the degree to which you improve
        the situation through your strategic actions. The game ends when the
        player has no moves left. A <span id="video-span">VIDEO</span> showing
        the corresponding actions is available in the{" "}
        <button
          style={{
            borderRadius: "10px",
            color: "white",
            backgroundColor: "#4F75FF",
            fontSize: "0.6em",
            padding: "5px",
            cursor: "pointer"
          }}
          href="/"
        >
          GUIDE
        </button>
        .
      </p>

      <h2 id="sub-topic">Gameplay Overview</h2>
      <p id="sub-paragraph">The game has two phases:</p>
      <ol type="A" id="letter-sublist-uncolored">
        <li>
          <p>Familiarization and exploration of the scenario.</p>
        </li>
        <li>
          <p>Applying control actions to the scenario.</p>
        </li>
      </ol>

      <ol type="A" id="letter-list-uncolored">
        <li>
          <h2 id="list-header-h2">
            Familiarization and Exploration of the Scenario
          </h2>
          <br />
          <div id="sub-list-colored-div">
            <span id="sub-list-colored-span">A.1.</span>
            <p id="spanned-list-header-p">
              Scenario Model Description
            </p>
          </div>
          <br />
          <p>
            The player reviews a representation of a real-world situation.
          </p>
          <p>Situation representation:</p>
          <ol id="num-list-uncolored">
            <li>
              <p>
                The <strong>model</strong> of the situation is presented as a
                directed, signed, weighted graph with deterministic causality on
                its edges.
              </p>
            </li>
            <li>
              <p>
                <strong>Nodes</strong> are numbered and named, representing
                complex institutional factors in the real-world system.
              </p>
            </li>
            <li>
              <p>
                <strong>Edges</strong> (arrows) represent causal links between
                nodes, with weights ranging from –1 to +1.
              </p>
            </li>
            <li>
              <p>
                <strong>Identify and highlight</strong> (per the task) the target
                node—i.e., the node that should achieve the maximum response
                when other nodes are influenced.
              </p>
            </li>
            <li>
              <p>
                <strong>Shade</strong> nodes that cannot be directly influenced.
                These forbidden nodes are colored{" "}
                <span style={{ color: "gray" }}>gray</span>.
              </p>
            </li>
          </ol>
          <br />
          <h3 style={{ fontSize: "1.75rem" }}>
            <span
              style={{
                fontStyle: "italic",
                fontSize: "1.75rem"
              }}
            >
              Example
            </span>
            . The <span style={{ fontStyle: "italic" }}>“Crime and Punishment”</span>{" "}
            model
          </h3>
          <br />
          <ol id="num-list-uncolored">
            <li>
              <p>
                The <span style={{ fontStyle: "italic" }}>“Crime and Punishment”</span>{" "}
                model depicts the regulation of theft in society.
              </p>
            </li>
            <li>
              <p>The model contains 7 nodes:</p>
            </li>
          </ol>
          <div className="Example-crime-div">
            <img src={crimeImg} id="crime-img" alt="Crime and Punishment Model" />
            <ol className="num-list-unordered">
              <li>
                <p>
                  <strong>Node 1:</strong> Availability of property (visibility
                  of desirable goods to thieves).
                </p>
              </li>
              <li>
                <p>
                  <strong>Node 2:</strong> Opportunity (physical access to
                  property, tools for breaking in, etc.).
                </p>
              </li>
              <li>
                <p>
                  <strong>Node 3:</strong> Theft (actual acquisition of the
                  property).
                </p>
              </li>
              <li>
                <p>
                  <strong>Node 4:</strong> Public participation (neighborhood
                  watch, community communication, local news crime reports).
                </p>
              </li>
              <li>
                <p>
                  <strong>Node 5:</strong> Criminal intent (presence of
                  individuals planning theft).
                </p>
              </li>
              <li>
                <p>
                  <strong>Node 6:</strong> Punishment (certainty and severity of
                  legal consequences).
                </p>
              </li>
              <li>
                <p>
                  <strong>Node 7:</strong> Police presence (visible presence of
                  officers in uniform).
                </p>
              </li>
            </ol>
          </div>
          <ol start={3} id="num-list-uncolored">
            <li>
              <p>
                The nodes are connected by edges (arrows) with weights.
              </p>
            </li>
            <li>
              <p>
                The target node in this model is node 3, “Theft.” The goal is
                to maximize node 3’s response by influencing other nodes,
                without directly affecting node 3.
              </p>
            </li>
          </ol>
          <p>
            For example, a weight of –0.8 (causal decrease) on the edge from{" "}
            <span style={{ fontStyle: "italic" }}>Police Presence</span> to{" "}
            <span style={{ fontStyle: "italic" }}>Theft</span> means that
            increasing <span style={{ fontStyle: "italic" }}>Police Presence</span>{" "}
            reduces <span style={{ fontStyle: "italic" }}>Theft</span> (and
            vice versa).
          </p>
          <br />
          <br />
          <div id="sub-list-colored-div">
            <span id="sub-list-colored-span">A.2.</span>
            <p id="spanned-list-header-p">
              Actions During Scenario Exploration
            </p>
          </div>
        </li>
        <br />
        <br />
        <p>The player can:</p>
        <br />
        <ul id="listik">
          <li>
            <p>
              <strong>Present the scenario.</strong> Understand the importance
              of institutional nodes (factors) and causal links between them.
              Hovering over an element reveals:
            </p>
            <br />
            <ul type="circle" id="players-capabilities-list">
              <li>
                <p>the list of model nodes;</p>
              </li>
              <li>
                <p>each node’s name;</p>
              </li>
              <li>
                <p>the description of the causal link between nodes.</p>
              </li>
            </ul>
          </li>
          <br />
          <li>
            <p>
              <strong>Identify the target node.</strong> Highlight the node
              expected to have the highest response.
            </p>
          </li>
          <br />
          <li>
            <p>
              <strong>Trace paths</strong> (highlight). Follow any continuous
              sequence of edges from one node to another to see how influence
              propagates.
            </p>
          </li>
        </ul>
        <br />
        <br />
        <p>
          There is <strong>no time limit</strong> for scenario exploration.
        </p>
        <br />
        <br />

        <li>
          <p id="list-header-h2">Applying Control Actions</p>
          <br />
          <div id="sub-list-colored-div">
            <span id="sub-list-colored-span">B.1.</span>
            <p id="spanned-list-header-p">Player’s Task</p>
          </div>
          <br />
          <p>
            Atlas Strategos is an experienced influencer whose behavior
            reflects wisdom and calculated intelligence.
          </p>
          <br />
          <p>
            As a strategist and influencer, you are tasked with understanding
            the nuances of the institutional complex.
          </p>
          <br />
          <p>
            You can influence the scenario by applying control actions to nodes
            to maximize the model’s response. Society typically cannot
            influence all nodes at once.
          </p>
          <br />
          <p>
            Therefore, on your first move, choose the nodes you deem most
            significant. Your first move—selecting three nodes—accounts for
            nearly 50% of the total influence potential. Subsequent moves
            complement your strategy.
          </p>
          <br />
          <p style={{ fontWeight: "bold", color: "rgb(255, 215, 0)" }}>
            Try to maximize your first move—it will set the course for your
            entire strategy!
          </p>
          <br />
          <br />
          <p>
            The <strong>maximum response</strong> is the highest achievable
            model response oriented toward the target node, achieved by crafting
            the optimal control strategy.
          </p>
          <br />
          <br />
          <p>
            A <strong>control strategy</strong> is the sequence of nodes you
            choose to influence.
          </p>
          <p>
            <br />
            The <strong>optimal response</strong> is computed by the game’s
            mathematical algorithm—{" "}
            <Link to={"/algorithm"}>
              <button
                style={{
                  borderRadius: "10px",
                  color: "white",
                  backgroundColor: "#4F75FF",
                  fontSize: "0.6em",
                  cursor: "pointer"
                }}
              >
                Algorithm
              </button>
            </Link>
            .
          </p>
          <br />
          <br />
          <div id="sub-list-colored-div">
            <span id="sub-list-colored-span">B.2.</span>
            <p id="spanned-list-header-p">Game Rules</p>
          </div>
          <br />
          <br />
          <p style={{ textDecoration: "underline" }}>Player Moves:</p>
          <br />
          <ol id="num-list-uncolored">
            <li>
              <p>
                A move consists of selecting a sequence of nodes to influence
                in that turn.
              </p>
            </li>
            <li>
              <p>
                You must select at least three nodes each turn.
              </p>
            </li>
            <li>
              <p>
                You may choose more than three nodes.{" "}
                <span style={{ color: "rgb(255, 215, 0)", fontWeight: "bold" }}>
                  However, the sequence order is crucial!
                </span>
              </p>
            </li>
            <li>
              <p>
                The order ranks nodes by their influence strength, from highest
                to lowest.
              </p>
            </li>
          </ol>
          <br />
          <br />
          <span
            style={{
              fontStyle: "italic",
              backgroundColor: "rgb(114, 144, 255)",
              fontSize: "1.7rem"
            }}
          >
            Example
          </span>
          <p>
            The <span style={{ fontStyle: "italic" }}>“Crime and Punishment”</span>{" "}
            model has 7 nodes.
          </p>
          <br />
          <p>
            <span style={{ fontStyle: "italic", fontWeight: 700 }}>
              First move
            </span>{" "}
            – choose your initial sequence (e.g., three nodes). If you choose
            [2, 7, 4], you believe these three nodes will yield the greatest
            influence. Node 2 is ranked first, node 7 second, and node 4 third.
          </p>
          <br />
          <p>
            <span style={{ fontStyle: "italic", fontWeight: 700 }}>
              Second move
            </span>{" "}
            – choose a second sequence (three or four nodes).
          </p>
          <br />
          <p>
            <span style={{ fontStyle: "italic", fontWeight: 700 }}>
              Third move
            </span>{" "}
            – the remaining one node (if you chose three nodes on move two).
          </p>
          <br />
          <br />
          <p style={{ textDecoration: "underline" }}>Game Time:</p>
          <ol id="num-list-uncolored">
            <li>
              <p>
                The <strong>total time</strong> is 600 seconds.
              </p>
            </li>
            <li>
              <p>
                There is <strong>no time limit</strong> per move.
              </p>
            </li>
            <li>
              <p>
                A <strong>timer</strong> counts down the remaining game time.
              </p>
            </li>
            <li>
              <p>
                The timer ends the game when time runs out.
              </p>
            </li>
            <li>
              <p>
                A <strong>progress bar</strong> shows the remaining time.
              </p>
            </li>
            <li>
              <p>
                A <strong>cosmic cat</strong> will alert you at key time
                milestones.
              </p>
            </li>
          </ol>
          <br />
          <br />
          <div id="sub-list-colored-div">
            <span id="sub-list-colored-span">B.3.</span>
            <p id="spanned-list-header-p">Scoring</p>
          </div>
          <br />
          <p style={{ textDecoration: "underline" }}>
            Scoring Rules
          </p>
          <p>You earn points on a 100-point scale each turn:</p>
          <ol id="num-list-uncolored">
            <li>
              <p>
                For correct node rankings—calculated by the game’s mathematical
                algorithm (see <strong>B.1.</strong>).
              </p>
            </li>
            <li>
              <p>
                For incorrect rankings—minus 10% of the points from point 1.
              </p>
            </li>
            <li>
              <p>
                For near-correct rankings—plus 20–50% of the points from point 1.
              </p>
            </li>
            <li>
              <p>
                For correctly ranking the first two nodes—plus 50% of the points
                from point 1.
              </p>
            </li>
          </ol>
          <br />
          <p>Points are awarded per node and then summed.</p>
          <br />
          <p style={{ textDecoration: "underline" }}>Scoreboard:</p>
          <ul type="disc" id="disc-list-uncolored">
            <li>
              <p>Turn number</p>
            </li>
            <li>
              <p>Sequence of nodes selected each turn</p>
            </li>
            <li>
              <p>Time taken</p>
            </li>
            <li>
              <p>Points earned</p>
            </li>
          </ul>
          <br />
          <div id="sub-list-colored-div">
            <span id="sub-list-colored-span">B.4.</span>
            <p id="spanned-list-header-p">End of Game</p>
          </div>
          <br />
          <p>The game ends immediately after the last possible move.</p>
        </li>
      </ol>

      <h1 className="Start-End-Phrase">
        Good luck to you!
      </h1>
    </div>
  );
};
