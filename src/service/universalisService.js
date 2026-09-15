
    export function getMarketPrice(itemId) {

        const url =`https://universalis.app/api/v2/Raiden/${itemId}`;
        return fetch(url)
        .then((response)=>{
           return response.json();
        })
    } 