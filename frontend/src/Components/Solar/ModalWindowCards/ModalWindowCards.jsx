import React, { useState, useEffect } from "react";
import { Modal } from "react-bootstrap";
import CloseIcon from "@mui/icons-material/Cancel";
import { Link } from "react-router-dom";
// Импорт локальных карточек на случай, если данные будут отсутствовать
import { cards, cardcreds } from "./cards";
import "./ModalWindowCards.css";
import "./mobileVersion.css";
// Импорт функции-хаба для объединения карточек с данными модели
import { parseCardsAndModels } from "./cleintServerHub";

export const PlanetCardModal = ({ selectedPlanet, setSelectedPlanet }) => {
  const [selectedCardIndex, setSelectedCardIndex] = useState(null);
  const [isClosing, setIsClosing] = useState(false);
  const [isZoomed, setIsZoomed] = useState(false);
  // Новый state для объединённых карточек, полученных через хаб
  const [unifiedCards, setUnifiedCards] = useState([]);

  // Если selectedPlanet меняется, загружаем соответствующие карточки через хаб
  useEffect(() => {
    if (selectedPlanet && selectedPlanet.name) {
      // Можно передать mapping, если требуется сопоставление индексов;
      // здесь для примера используем пустой mapping, т.е. card.index = vertex index
      parseCardsAndModels({}).then((cardsData) => {
        // Если требуется выбрать карточки по категории, можно фильтровать по selectedPlanet.name
        // Здесь, например, если selectedPlanet.name совпадает с ключом в cards, то используем его
        setUnifiedCards(cardsData);
      }).catch((error) => {
        console.error("Ошибка загрузки карточек через хаб:", error);
        // На случай ошибки можно использовать локальные карточки как запасной вариант
        setUnifiedCards(cards[selectedPlanet.name] || []);
      });
    }
  }, [selectedPlanet]);

  // Если unifiedCards не загрузились, можно использовать локальные данные
  const currentCards = unifiedCards.length > 0 ? unifiedCards : cards[selectedPlanet.name];

  const handleZoomWindow = (index) => {
    setIsZoomed(true);
    setTimeout(() => setSelectedCardIndex(index), 300);
  };

  const handleZoomOut = () => {
    setIsZoomed(false);
    setIsClosing(false);
    setTimeout(() => setSelectedCardIndex(null), 300);
  };

  const handleCardClick = (event) => {
    if (isZoomed) {
      event.stopPropagation();
    }
  };

  return (
    <Modal
      show={true}
      onHide={() => setSelectedPlanet(null)}
      centered
      dialogClassName="modal-dialog"
      contentClassName="modal-content-custom"
    >
      <Modal.Header className="modal-header-custom">
        <Modal.Title>
          <div className="modal-header-content">
            <img
              src={cardcreds[selectedPlanet.name].src}
              className="planet-image"
            />
            <div>
              <h1
                className="selected-planet-name"
                style={{ color: cardcreds[selectedPlanet.name].color }}
              >
                {selectedPlanet.name}
              </h1>
              <h3 className="life-strategy">
                <span id="life-strategy-span" style={{ color: cardcreds[selectedPlanet.name].color }}>Стратегия жизни: </span>
                {selectedPlanet.description}
              </h3>
            </div>
          </div>
        </Modal.Title>
        <button
          className="close-cardList-modal-window"
          onClick={() => setSelectedPlanet(null)}
        >
          <CloseIcon
            fontSize="large"
            style={{ color: cardcreds[selectedPlanet.name].color }}
          />
        </button>
      </Modal.Header>
      <Modal.Body className="modal-body-custom">
        <div className="cards-container">
          {currentCards.map((segment, index) => (
            <div
              key={segment.id}
              className={`card-item ${isZoomed && index === selectedCardIndex
                ? "card-item-zoomed"
                : "card-item-normal"
                }`}
            >
              <div className="card-header">
                <p>{segment.title}</p>
                {isZoomed && index === selectedCardIndex && (

                  <button className="close-card-modal-window">
                    <CloseIcon
                      fontSize="large"
                      style={{ color: cardcreds[selectedPlanet.name].color }}
                      onClick={handleZoomOut}
                    />
                  </button>
                )}
              </div>
              <div className="card-body">
                <img
                  src={segment.image}
                  alt={segment.title}
                  className={index === selectedCardIndex ? 'card-img-zoomed' : 'card-img'}
                />
                {isZoomed && index === selectedCardIndex && (
                  <>
                    <div className="card-description">
                      <p>{segment.description}</p>
                    </div>
                    <div className="card-footer">
                      <button
                        className="modal-cards-buttons choose-card-in-modal-window"
                        onClick={() => handleZoomWindow(index)}
                        style={{
                          borderColor: cardcreds[selectedPlanet.name].color,
                          cursor: "pointer",
                          width: "150px",
                          height: "40px"
                        }}
                      >
                        <Link
                          to={`/matrix/${selectedCardIndex + 1}`}
                          state={{ selectedPlanet, selectedCardIndex }}
                          style={{ color: cardcreds[selectedPlanet.name].color, fontSize: "1.5rem" }}
                        >
                          Играть
                        </Link>
                      </button>
                    </div>
                  </>
                )}
              </div>
              <div className="card-action">
                {!isZoomed && (
                  <button
                    className="modal-cards-buttons choose-card-in-modal-window"
                    onClick={() => handleZoomWindow(index)}
                    style={{
                      color: cardcreds[selectedPlanet.name].color,
                      borderColor: cardcreds[selectedPlanet.name].color,
                      cursor: "pointer"
                    }}
                  >
                    Pick
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </Modal.Body>
    </Modal>
  );
}