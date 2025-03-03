import CloseIcon from "@mui/icons-material/Cancel";
import { cards, cardcreds } from "./cards";
import { Link } from "react-router-dom";
import { Button } from "react-bootstrap";
import { useState } from "react";

export const PlanetCard = ({ selectedPlanet, setSelectedPlanet }) => {
  const [selectedCardIndex, setSelectedCardIndex] = useState(null); // Хранилище для индексов
  const [isClosing, setIsClosing] = useState(false); // Для работы анимации
  const [isZoomed, setIsZoomed] = useState(false); // State for zoom effect




  const handleZoomWindow = (index) => {
    setIsZoomed(true); // Set zoom state
    setTimeout(() => {
      setSelectedCardIndex(index);
    }, 700); // Delay to allow zoom animation to complete
  };

  const handleZoomOut = () => {
    console.log(isClosing)
    setIsZoomed(false);
    setIsClosing(false);
    setTimeout(() => {
      setSelectedCardIndex(null);
    }, 700);
  };

  const handleCardClick = (event) => {
    if (isZoomed) {
      event.stopPropagation(); // Prevent the click from propagating to the parent
    }
  };

  const currentCards = cards[selectedPlanet.name];

  return (
    <div className="planet-cardcard text-white bg-dark mb-3">
      <div className="segment-domen">
        <div className="segment-domen-header">
          <div className="segment-domen-planet">
            <img
              className="planet-image"
              alt="planet-image"
              src={cardcreds[selectedPlanet.name].src}
            />
            <div>
              <h1
                className="planet-name"
                style={{
                  fontSize: "80px",
                  color: cardcreds[selectedPlanet.name].color,
                }}
              >
                {cardcreds[selectedPlanet.name].name}
              </h1>
              <h3>
                <span style={{ color: cardcreds[selectedPlanet.name].color }}>
                  Стратегия жизни:
                </span>{" "}
                {cardcreds[selectedPlanet.name].desc}
              </h3>
            </div>
          </div>
          <div className="Button-Group-Modal">
            <Link
              to="/"
              className="return-main"
              style={{
                color: cardcreds[selectedPlanet.name].color,
                borderColor: cardcreds[selectedPlanet.name].color,
              }}
            >
              Main
            </Link>
            <Button
              variant="secondary"
              onClick={() => setSelectedPlanet(null)}
              size="lg"
              style={{
                position: "relative",
                backgroundColor: "transparent",
                border: "none",
                color: cardcreds[selectedPlanet.name].color,
              }}
            >
              <CloseIcon sx={{ width: "2rem", height: "2rem" }} />
            </Button>
          </div>
        </div>

        <div className="segment-cards">
          {currentCards.map((segment, index) => (
            <div
              key={segment.index}
              className={`card text-white bg-secondary mb-3 segment-card segment-card-${index} ${isZoomed && index === selectedCardIndex ? "zoomed" : "unzoomed"
                }`}
              onClick={
                isZoomed && index === selectedCardIndex
                  ? handleZoomOut
                  : () => { }
              }
            >
              <div className="card-header">
                <p>{segment.title}</p>
              </div>
              <div className="card-body" onClick={handleCardClick}>
                <img
                  width={isZoomed && index === selectedCardIndex ? "250" : 180}
                  height={isZoomed && index === selectedCardIndex ? "250px" : 180}
                  src={segment.image}
                  alt={segment.title}
                />
                {isZoomed && index === selectedCardIndex && (
                  <div>
                    <div className="card-description">
                      <p>{segment.description}</p>
                    </div>
                    <div className="card-footer"  >
                      <Link
                        id="buttonPlayZoommedCard"
                        style={{ backgroundColor: cardcreds[selectedPlanet.name].color }}
                        to={`/matrix/${selectedCardIndex + 1}`} state={{ selectedPlanet, selectedCardIndex }}
                      >
                        <p>Play</p>
                      </Link>
                    </div>
                  </div>

                )}
                <div className="text-center">
                  {isZoomed && index === selectedCardIndex ? (
                    <button
                      className="btn-CLOSE"
                      style={{
                        color: cardcreds[selectedPlanet.name].color,

                        border: 'none',
                        backgroundColor: "transparent",
                        borderRadius: "10px",
                      }}
                      onClick={handleZoomOut}
                    >
                      <CloseIcon />

                    </button>
                  ) : (
                    <button
                      className="btn-CHECK"
                      style={{
                        color: cardcreds[selectedPlanet.name].color,
                        borderColor: cardcreds[selectedPlanet.name].color,
                      }}
                      onClick={() => handleZoomWindow(index)} // Open modal on button click
                    >
                      pick
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
};
