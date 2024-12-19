import "./Card.css";

interface CardInfoProps {
  ATK: number;
  DEF: number;
  Attribute: string;
  CardID: string;
  CardImages: any[];
  CardPrices: any[];
  CardSets: any[];
  Description: string;
  FrameType: string;
  Level: number;
  Name: string;
  Race: string;
  Type: string;
}

interface CardProps {
  cardInfo: CardInfoProps;
}

export const Card: React.FC<CardProps> = ({ cardInfo }) => {
  const {
    ATK,
    DEF,
    Attribute,
    // CardID,
    CardImages,
    // CardPrices,
    // CardSets,
    // Description,
    // FrameType,
    Level,
    Name,
    Race,
    // Type,
  } = cardInfo;
  console.log(CardImages[0].image_url_cropped);

  const CardLevel = () => {
    const cardLevel = Level;

    const imgPath = "src\\assets\\yugioh_star2.PNG";

    return (
      <>
        {Array.from({ length: cardLevel }).map((_, index) => (
          <img
            key={index}
            src={imgPath}
            alt={`Image ${index + 1}`}
            style={{ margin: "0px", width: "25px", height: "25px" }}
          />
        ))}
      </>
    );
  };

  return (
    <div className="card">
      <div className="card-top">{Name}</div>
      <div className="card-level">{CardLevel()}</div>
      <div className="card-artwork">
        <img src={CardImages[0].image_url_cropped}></img>
      </div>
      <div className="card-stats">
        <div className="card-stats-type">
          <span>{Race}</span>
          <span>{Attribute}</span>
        </div>
        <div className="card-stats-AD">
          <span>A: {ATK}</span>
          <span>D: {DEF}</span>
        </div>
      </div>
    </div>
  );
};
