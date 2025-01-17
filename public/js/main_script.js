var errorTimeout;
var selectedHotel;

(async function(){
    fetch('/api/v1/state')
    .then(response => {
        if (!response.ok) {throw new Error(`HTTP error! Status: ${response.status}`);}
        return response.json();
    }).then(result => {
        console.log(result)
        if(result['state'] === 'language') fetchLanguage();
    }).catch(error => {
        console.error('Error fetching HTML:', error);
    });
})();

const beginLoading = ()=> $('#pointerAbsorber').show()
const releaseLoading = ()=> $('#pointerAbsorber').hide()
const showError = (error) => {
    if (errorTimeout) {clearTimeout(errorTimeout);}
    if(error.hasOwnProperty('errorText')){
        $('#errorAlert').text(error['errorText'])
        $('#selectError').fadeIn();
    }else{
        fetch(`/api/v1/report`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json','Cache-Control': 'no-cache'},
            body: JSON.stringify({'error': error})
        }).then(response => {
            console.log(response.body)
            if (!response.ok) {throw new Error(`HTTP error! Status: ${response.json()}`);}
            return response.json(); 
        }).then(result => {
            $('#errorAlert').text(result['errorText'])
            $('#selectError').fadeIn();
            releaseLoading();
        })
        .catch(error => {
            alert(error);
        });
    }
}
const hideError = ()=>{$('#errorAlert').text(); $('#selecterror').fadeOut();}


$(document).ready(function(){
 
})


const fetchLanguage = async ()=>{
    fetch('/reservation/language')
    .then(response => {
        if (!response.ok) {throw new Error(`HTTP error! Status: ${response.status}`);}
        return response.text();
    }).then(result => {
        $('#main').append(result);
        activateDynamicLanguageFunctions();
    }).catch(error => {
        console.error('Error fetching HTML:', error);
    });
}

const activateDynamicLanguageFunctions = () => {
    function redirect(chosenLanguage){
        beginLoading();
        const currentUrl = window.location.href;
        const updatedUrl = currentUrl.replace(/\/[a-z]{2}\//, `/${chosenLanguage}/`)
        const hotelUrl = updatedUrl.replace('/reservation','/reservation/hotel');
        history.pushState(null, '', updatedUrl);
        fetchHotel(hotelUrl)
    }
    const isDarkMode = localStorage.getItem('darkMode') === 'true';
    if (isDarkMode) {
        $('html').addClass('tw-dark');
        $('#sun-icon').show()
        $('#moon-icon').hide()
    } else {
        $('html').removeClass('tw-dark');  
        $('#sun-icon').hide()
        $('#moon-icon').show()
    }
    $('#theme-toggle').click(function() {
        $('html').toggleClass('tw-dark');
        $('#sun-icon').toggle()
        $('#moon-icon').toggle()
        const darkModeEnabled = $('html').hasClass('tw-dark');
        localStorage.setItem('darkMode', darkModeEnabled);
    });  
    $('#en').on('click',()=>{redirect('en');})
    $('#ar').on('click',()=>{redirect('ar');})
    $('#de').on('click',()=>{redirect('de');})
    $('#fr').on('click',()=>{redirect('fr');})
    $('#es').on('click',()=>{ redirect('es');})
    releaseLoading();
}


const fetchHotel = async (url)=>{
    fetch('/reservation/hotel')
    .then(response => {
        if (!response.ok) {throw new Error(`HTTP error! Status: ${response.status}`);}
        return response.text();
    }).then(result => {
        $('#main').empty();
        $('#main').append(result);
        activateDynamicHotelFunctions();
    }).catch(error => {
        console.error('Error fetching HTML:', error);
    });
}

const activateDynamicHotelFunctions = () => {
    function ConfirmHotel(){
          if(selectedHotel){
            beginLoading();
            $('#loader').show();
            $('#notloader').hide()
            fetch(`/api/v1/savehotel`, {
                method: 'POST',
                headers: {'Content-Type': 'application/json','Cache-Control': 'no-cache'},
                body: JSON.stringify({'hotelID': selectedHotel})
            }).then(response => {
                if (!response.ok) {throw new Error(`HTTP error! Status: ${response.status}`);}
                return response.json(); 
            }).then(result => {
               console.log(result)
            })
            .catch(error => {
            $('#loader').hide();
            $('#notloader').show()
            showError(error);
            });
        }
    }
    $('#confirm_hotel').on('click',()=> ConfirmHotel());
    releaseLoading();
}

function selectHotel(card,hotelID) {
    const allCards = document.querySelectorAll('#hotels-container > div');
    allCards.forEach(c => c.classList.remove('selected_hotel'));
    card.classList.add('selected_hotel');
    selectedHotel = hotelID;
}



const fetchRoom = async ()=>{
    fetch('/reservation/room')
    .then(response => {
        if (!response.ok) {throw new Error(`HTTP error! Status: ${response.status}`);}
        return response.text();
    }).then(result => {
        $('#main').empty();
        $('#main').append(result);
        activateDynamicRoomFunctions();
    }).catch(error => {
        console.error('Error fetching HTML:', error);
    });
}

function activateDynamicRoomFunctions(){
    function isDigit(char) {return /^\d$/.test(char);}

    

    releaseLoading();
}