import { useParams } from "react-router-dom"
import fishData from "../data/fish.json"

    function FishDetailsPage(){
        const {fishId} = useParams ();
        const fish = fishData.fish.find(
            (oneFish) => String(oneFish.id) === fishId);

            if(!fish)return <h1>Fish not found</h1>
        return(
            <h1>Details Here</h1>
        )
    }
    export default FishDetailsPage;