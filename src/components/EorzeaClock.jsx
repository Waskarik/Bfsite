import { useEffect, useState } from "react";
import { getEorzeaTime } from "../util/eorzeaTime";

function EorzeaClock() {
  const [time, setTime] = useState(getEorzeaTime());

  useEffect(() => {
    const intervalId = setInterval(() => {
      setTime(getEorzeaTime());
    }, 1000);

    return () => clearInterval(intervalId);
  }, []);

  return <p className="fw-semibold mb-3">Eorzea Time: {time} ET</p>;
}

export default EorzeaClock;
