import React from 'react'
import { useCustomStates } from './CustomStates'
import InfoIcon from '@mui/icons-material/Info';

export const Buttons = () => {
    const {
        handleOpenModal, isRunning, loadUserCoordinates
    } = useCustomStates();
    return (
        <div style={{ position: "relative", flex: "1", paddingRight: "20px" }}>
            <ul
                className="Button-Group"
                id="pills-tab"
                role="tablist"
                style={{ top: "-30px", position: "absolute", zIndex: 1, left: "10%" }}
            >
                <li>
                    <button
                        className="game-button"
                        variant="primary"
                        style={{
                            display: "flex",
                            flexDirection: "row",
                            zIndex: 1000,
                            alignItems: "center",
                            justifyContent: "center",
                            gap: "10px",
                        }}
                        onClick={handleOpenModal}
                    >
                        <InfoIcon /> Details
                    </button>
                </li>
                <li>
                    <Link to={"/science"} state={{ selectedPlanet, selectedCardIndex }}>
                        <button
                            className="game-button"
                            disabled={isRunning}
                            title={isRunning ? "Not available during the game" : ""}
                        >
                            Science
                        </button>
                    </Link>
                </li>
                <li className="nav-item" role="presentation">
                    <button
                        className="game-button active"
                        id="pills-graph-tab"
                        data-bs-toggle="pill"
                        data-bs-target="#pills-graph"
                        type="button"
                        role="tab"
                        aria-controls="pills-graph"
                        aria-selected="true"
                    >
                        Graph
                    </button>
                </li>
                <li className="nav-item" role="presentation">
                    <button
                        className="game-button"
                        id="profile-tab"
                        data-bs-toggle="pill"
                        data-bs-target="#profile"
                        type="button"
                        role="tab"
                        aria-controls="profile"
                        aria-selected="false"
                        disabled={isRunning}
                        title={isRunning ? "Not available during the game" : ""}
                    >
                        Profile
                    </button>
                </li>
                <li>
                    <button className="game-button" onClick={saveGraphSettings}>
                        Save View
                    </button>
                </li>
                <li>
                    <button className="game-button" onClick={resetNodeCoordinates}>
                        Reset
                    </button>
                </li>
                <li>
                    <button
                        className="game-button"
                        onClick={loadUserCoordinates}
                        title="Загружает последний сохранённый вид графа"
                    >
                        Load Last View
                    </button>
                </li>
            </ul>
        </div>
    )
}
