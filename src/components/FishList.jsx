import FishCard from "./FishCard";

function FishList({ fish, setSelectedFish, currentHour }) {
  if (fish.length === 0) {
    return <p className="text-secondary">No fish match this search/filter.</p>;
  }

  return (
    <div className="row g-3">
      {fish.map((oneFish) => (
        <div className="col-12 col-md-6 col-lg-4" key={oneFish.id}>
          <FishCard
            fish={oneFish}
            setSelectedFish={setSelectedFish}
            currentHour={currentHour}
          />
        </div>
      ))}
    </div>
  );
}

export default FishList;
