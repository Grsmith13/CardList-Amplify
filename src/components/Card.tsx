import "./Card.css";
interface CardInfoProps {
  atk: number;
  def: number;
  attribute: string;
  card_images: any[]; // you might want to create more specific types here
  card_prices: any[];
  card_sets: any[];
  desc: string;
  frameType: string;
  level: number;
  name: string;
  race: string;
  type: string;
}

interface CardProps {
  cardInfo: CardInfoProps;
}

export const Card: React.FC<CardProps> = ({ cardInfo }) => {
  // Destructure and rename the properties from the JSON to match your interface
  const {
    atk: ATK,
    def: DEF,
    attribute: Attribute,
    card_images: CardImages,
    level: Level,
    name: Name,
    race: Race,
    // Optionally include more fields with renaming if needed:
    // desc: Description,
    // frameType: FrameType,
    // type: Type,
    // etc.
  } = cardInfo;
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
