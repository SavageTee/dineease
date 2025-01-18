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
        if(result['state'] === 'room') fetchRoom();
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
        releaseLoading();
    }else{
        fetch(`/api/v1/report`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json','Cache-Control': 'no-cache'},
            body: JSON.stringify({'error': error})
        }).then(response => {
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
const hideError = ()=>{$('#errorAlert').text(); $('#selectError').fadeOut();}


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
                fetchRoom();
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
    function Confirm(){
            beginLoading();
            hideError();
            let input = document.getElementById('code');
            fetch(`/api/v1/checkroom`, {
                method: 'POST',
                headers: {'Content-Type': 'application/json','Cache-Control': 'no-cache'},
                body: JSON.stringify({ 'roomNumber': input.value })
            }).then(response =>  {
                if (!response.ok) {throw new Error(`HTTP error! Status: ${response.status}`);}
                return response.json();
            }).then(result => {
                if(result['status'] === 'noRoom'){return showError(result);}
                if(result['result']["verification_type"] === 0){
                    $('#verification_modal p').text(result['verification']['verificationBD'])
                }else{
                    $('#verification_modal p').text(result['verification']['verificationDD'])
                }
                $('#verification_modal').modal('show')
                releaseLoading();
            })
            .catch(error => {
                showError(error.details)
                releaseLoading();
            });
    }    
    $('#date_input').on('input', (e) => {
        if(!isDigit(e.target.value.charAt(e.target.value.length -1 ))){ $('#date_input').val(e.target.value.substring(0,  e.target.value.length - 1));}
        if(e.target.value.length == 4 || e.target.value.length == 7){$('#date_input').val( $('#date_input').val() + "-" )}
        if(e.target.value.length >= 10){
            const regex = /^\d{4}-\d{2}-\d{2}$/;
            if(regex.test(e.target.value)){
                const [year, month, day] = e.target.value.split('-').map(Number);
                const isValidFormat = month >= 1 && month <= 12 && day >= 1 && day <= 31;
                if (isValidFormat) {
                    const lastDayOfMonth = new Date(year, month, 0).getDate();
                    const isValidDate = day <= lastDayOfMonth;
                    if (isValidDate) {
                        $('#date_input').blur();
                        $('#loader_text_modal').hide()
                        $('#loader_modal').show()
                        $('#pointerAbsorber').show()
                        confirmDate(e.target.value)
                    }else{ $('#date_input').val('') }
                }else{ $('#date_input').val('') }
            }else{ $('#date_input').val('') }
        }
    });
    const confirmDate = (date)=>{
        hideError();
        fetch(`/api/v1/verifyroom`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json','Cache-Control': 'no-cache'},
            body: JSON.stringify({ 'date': date, })
        }).then(response =>  {
            if (!response.ok) {throw new Error(`HTTP error! Status: ${response.status}`);}
            return response.json();
        }).then(result => {
            if(result['status'] === 'success'){
                hideError();
                $("#alert-text").empty();
                var newContent;
                console.log(result)
                if(Number(result['result']) !== 0){
                    newContent = `
                        <div class="tw-flex tw-items-center tw-mb-2">
                            <span class="tw-text-gray-600" > ${result['transelations']['freeReservation']}</span>
                        </div>                   
                        <div class="tw-flex tw-items-center tw-mb-2">
                            <span> ${result['transelations']['remainingReservations']}  ${result['result']}</span>
                        </div>                 
                        <div class="tw-flex tw-items-center tw-mb-2">
                            <span> ${result['transelations']['pressContinue']}</span>
                        </div>
                    `;
                }else{
                    newContent = `
                        <div class="tw-flex tw-items-center tw-mb-2">
                            <span class="tw-text-red-700" >${result['transelations']['paidReservation']}</span>
                        </div>
                        <div class="tw-flex tw-items-center tw-mb-2">
                            <span>${result['transelations']['remainingReservations']}  ${result['result']}</span>
                        </div>
                        <div class="tw-flex tw-items-center tw-mb-2">
                            <span>${result['transelations']['pressContinue']}</span>
                        </div>
                    `;
                }
                $("#alert-text").append(newContent);
            }else{
                showError(result);
                $('#verification_modal').modal('hide');
                $('#date_input').val('')
                $('#code').val('')
                return;
            }
            $('#verification_modal').modal('hide')
            $('#keypad').hide()
            $('#pointerAbsorber').hide()
            $('#alert-text').text()
            $('#confirm').show()
            hideError();
        })
        .catch(error => {
            showError(error.details)
            clicked = false;
        });
    
    }
    $('#go').on('click',()=> Confirm())
    $('#confirm').on('click',()=> goToRestaurants());
    releaseLoading();
}
function isDigit(char) {return /^\d$/.test(char);}
const handleButtonsClick = (digit) => {
    let input = document.getElementById('code');
    if(input){ input.value = input.value + digit;}
}
const handleBackClick = () => {
    let input = document.getElementById('code');
    input.value = input.value.slice(0, -1);
}
function goToRestaurants(){
    beginLoading();
    fetchRestaurant()
}

const fetchRestaurant = async ()=>{
    fetch('/reservation/restaurant')
    .then(async response => {
        if (!response.ok) {throw new Error(await response.text());}
        return response.text();
    }).then(result => {
        $('#main').empty();
        $('#main').append(result);
        activateDynamicRestaurantFunctions();
    }).catch(error => {
        console.log(error.message)
        showError(error.message);
    });
}

function activateDynamicRestaurantFunctions(){

}