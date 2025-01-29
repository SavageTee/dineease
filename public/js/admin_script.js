(async function(){
    fetch('/api/v1/state')
    .then(response => {
        if (!response.ok) {throw new Error(`HTTP error! Status: ${response.status}`);}
        return response.json();
    }).then(result => {
        console.log(result)
        if(result['state'] === 'language') fetchLanguage();
        if(result['state'] === 'hotel') fetchHotel();
        if(result['state'] === 'room') fetchRoom();
        if(result['state'] === 'time') fetchTime();
        if(result['state'] === 'qrcode') fetchConfirm();
    }).catch(error => {
        console.error('Error fetching HTML:', error);
    });
})();