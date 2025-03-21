var errorTimeout;
var selectedHotel;

let pdfDoc = null;
let currentPage = 1;
let pageCount = 0;
let zoomScale = 1;
let renderTask = null; 
let selectedRestaurant = undefined;
let viewMenuClick = false;
let viewMenuModalClick = false;
let confirmRestaurantClick = false;

let timePageSearch = false;
let timeConfirm = false;

const getLanguage = ()=> {return localStorage.getItem('lng') || 'en';}

(async function(){
    fetch('/api/v1/state',{headers: {'Accept-Language': getLanguage()}})
    .then(response => {
        if (!response.ok) {throw new Error(`HTTP error! Status: ${response.status}`);}
        return response.json();
    }).then(result => {
        if(result['state'] === 'language') fetchLanguage();
        if(result['state'] === 'hotel') fetchHotel();
        if(result['state'] === 'room') fetchRoom();
        if(result['state'] === 'time') fetchTime();
        if(result['state'] === 'qrcode') fetchConfirm();
        if(result['state'] === 'restaurant') fetchRestaurant();
    }).catch(error => {
        console.error('Error fetching HTML:', error);
    });
})();

const darkModeFunctions = ()=>{
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
}

const beginLoading = ()=> $('#pointerAbsorber').show()
const releaseLoading = ()=> $('#pointerAbsorber').hide()
const showError = (error) => {
    if (errorTimeout) {clearTimeout(errorTimeout);}
    if(error && error.hasOwnProperty('errorText')){
        $('#errorAlert').text(error['errorText'])
        $('#selectError').fadeIn();
        releaseLoading();
    }else{
        fetch(`/api/v1/report`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json','Cache-Control': 'no-cache','Accept-Language': getLanguage()},
            body: JSON.stringify({'error':error.toString()})
        }).then(async response => {
            if (!response.ok) {throw (await response.json());}
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

const fetchLanguage = async ()=>{
    fetch('/reservation/language',{headers: {'Accept-Language': getLanguage()}})
    .then(async response => {
        if (!response.ok) {throw (await response.json());}
        return response.text();
    }).then(async result => {
        $('#main').append(result);
        activateDynamicLanguageFunctions();
    }).catch(error => {
        showError(error);
    });
}

const activateDynamicLanguageFunctions = () => {
    darkModeFunctions();
    function redirect(chosenLanguage){
        beginLoading();
        localStorage.setItem('lng', chosenLanguage);
        fetchHotel()
    }
    $('#en').on('click',()=>{redirect('en');})
    $('#ar').on('click',()=>{redirect('ar');})
    $('#de').on('click',()=>{redirect('de');})
    $('#fr').on('click',()=>{redirect('fr');})
    $('#es').on('click',()=>{redirect('es');})
    $(document).ready(function(){releaseLoading();});
}


const fetchHotel = async ()=>{
    fetch('/reservation/hotel',{headers: {'Accept-Language': getLanguage()}})
    .then(async response => {
        if (!response.ok) {throw (await response.json());}
        return response.text();
    }).then(result => {
        $('#main').empty();
        $('#main').append(result);
        activateDynamicHotelFunctions();
    }).catch(error => {
        showError(error);
    });
}

const activateDynamicHotelFunctions = () => {
    darkModeFunctions();
    function ConfirmHotel(){
          if(selectedHotel){
            beginLoading();
            $('#loader').show();
            $('#notloader').hide()
            fetch(`/api/v1/savehotel`, {
                method: 'POST',
                headers: {'Content-Type': 'application/json','Cache-Control': 'no-cache','Accept-Language': getLanguage()},
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
    fetch('/reservation/room',{headers: {'Accept-Language': getLanguage()}})
    .then(async response => {
        if (!response.ok) {throw (await response.json());}
        return response.text();
    }).then(result => {
        $('#main').empty();
        $('#main').append(result);
        activateDynamicRoomFunctions();
    }).catch(error => {
        showError(error);
    });
}

function activateDynamicRoomFunctions(){
    darkModeFunctions();

    function Confirm(){
            beginLoading();
            hideError();
            let input = document.getElementById('code');
            fetch(`/api/v1/checkroom`, {
                method: 'POST',
                headers: {'Content-Type': 'application/json','Cache-Control': 'no-cache', 'Accept-Language': getLanguage()},
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
                        $('#loader_spinner_modal').show()
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
            headers: {'Content-Type': 'application/json','Cache-Control': 'no-cache', 'Accept-Language': getLanguage()},
            body: JSON.stringify({ 'date': date, })
        }).then(async response =>  {
            if (!response.ok) {throw (await response.json());}
            return response.json(); 
        }).then(result => {
            if(result['status'] === 'success'){
                hideError();
                beginLoading();
                fetchRestaurant();
            }else{
                showError(result);
                $('#loader_text_modal').show();
                $('#loader_spinner_modal').hide();
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
            showError(error);
            $('#loader_text_modal').show();
            $('#loader_spinner_modal').hide();
            $('#verification_modal').modal('hide');
            $('#date_input').val('')
            $('#code').val('')
            releaseLoading();
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
    fetch('/reservation/restaurant',{headers: {'Accept-Language': getLanguage()}})
    .then(async response => {
        if (!response.ok) {throw (await response.json());}
        return response.text();
    }).then(result => {
        $('#main').empty();
        $('#main').append(result);
        activateDynamicRestaurantFunctions();
    }).catch(error => {
        showError(error);
    });
}

function actionsFormatter(row, data){
    console.log(data)
    return `
    <button ${data['is_menu_viewer'] === 1 ? `onclick="viewMenuViewer('${data['ref']}')"` : `onclick="viewMenu('${data['ref']}')"` }  class=" tw-w-full tw-justify-center tw-bg-red-300 hover:tw-bg-red-400 tw-text-gray-800 tw-font-bold tw-py-2 tw-px-2 tw-rounded tw-inline-flex tw-items-center">
        <div id="view_menu__${data['ref']}">
            <i class="tw-text-2xl fa-solid tw-px-1 fa-utensils"></i>
            <span class="tw-px-2">${data['viewMenuTranslation']}</span>
        </div>
        <div style="display: none;" id="loader_modal__${data['ref']}" class="spinner-border spinner-border-sm  text-light" role="status"></div>
    </button>
    `
}

function dateTimeFormatter(row, data){
    return `
    <div class="tw-block">
        <div>${row}</div>
        <div>${data['time']}</div>
    </div>
     `
}

function activateDynamicRestaurantFunctions(){
    darkModeFunctions();
    $('#zoom_percent').text(`${zoomScale * 100}%`)
    $(function() {pdfjsLib.GlobalWorkerOptions.workerSrc = '/js/pdf.worker.min.js';});
    function setZoom(scale) {
        if(scale < 0.1) return;
        if(scale > 5) return;
        zoomScale = scale;
        const canvas = document.getElementById('pdfCanvas');
        canvas.style.width = `${zoomScale * 100}%`;
        $('#zoom_percent').text(`${zoomScale * 100}%`)
        renderPage(currentPage);
    }
    function nextPage() {
    if (currentPage < pageCount) {
        currentPage++;
        renderPage(currentPage);
    }
    }
    function prevPage() {
    if (currentPage > 1) {
        currentPage--;
        renderPage(currentPage);
    }
    }
    document.getElementById('nextPage').addEventListener('click', nextPage);
    document.getElementById('prevPage').addEventListener('click', prevPage);
    $('#confirm_restaurant').on('click',()=> ConfirmRestaurant())
    document.getElementById('zoomIn').addEventListener('click', () => setZoom(zoomScale + 0.5));
    document.getElementById('zoomOut').addEventListener('click', () => setZoom(zoomScale - 0.5));
    releaseLoading();
}


function menuSelection(restaurantID){
    if(!viewMenuModalClick){
        viewMenuModalClick = true;
        $(`#loader_modal_${restaurantID}`).show()
        $(`#view_menu_${restaurantID}`).hide()
        fetch(`/api/v1/menuselection`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json','Cache-Control': 'no-cache', 'Accept-Language': getLanguage()},
            body: JSON.stringify({ 'restaurantID': restaurantID })
        }).then(async response =>  {
            if (!response.ok) {throw (await response.json());}
            return response.json();
        }).then(async (result)=>{
            result['data'].map(item=> {item['viewMenuTranslation'] = result['viewMenuTranslation']});
            $('#menu_table').bootstrapTable().bootstrapTable('load',result['data'])
            $('#viewMenuModal').modal('show')
            viewMenuModalClick = false;
            $(`#loader_modal_${restaurantID}`).hide()
            $(`#view_menu_${restaurantID}`).show()
        })
        .catch(error => {
            showError(error)
            $(`#loader_modal_${restaurantID}`).hide()
            $(`#view_menu_${restaurantID}`).show()
            viewMenuModalClick = false;
        });
        
    }
}

function viewMenuViewer(referenceID){
    if(!viewMenuClick){
        viewMenuClick = true;
        $(`#loader_modal__${referenceID}`).show()
        $(`#view_menu__${referenceID}`).hide()
        fetch(`/api/v1/menuviewer`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json','Cache-Control': 'no-cache', 'Accept-Language': getLanguage()},
            body: JSON.stringify({ 'referenceID': referenceID })
        }).then(async response =>  {
            if (!response.ok) {throw (await response.json());}
            return response.text();
        }).then(async (result)=>{
            $('#menuModalViewerBody').empty();
            $('#menuModalViewerBody').append(result);
            $('#menuModalViewer').modal('show')
            $(`#loader_modal__${referenceID}`).hide()
            $(`#view_menu__${referenceID}`).show()
            viewMenuClick = false;
        })
        .catch(error => {
            showError(error)
            $(`#loader_modal__${referenceID}`).hide()
            $(`#view_menu__${referenceID}`).show()
            viewMenuClick = false;
        });
    }
}

function viewMenu(referenceID){
    pdfDoc = null;
    currentPage = 1;
    pageCount = 0;
    zoomScale = 1;
    renderTask = null; 
    const canvas = document.getElementById('pdfCanvas');
    const context = canvas.getContext('2d');
    context.clearRect(0, 0, canvas.width, canvas.height);
    if(!viewMenuClick){
        viewMenuClick = true;
        $(`#loader_modal__${referenceID}`).show()
        $(`#view_menu__${referenceID}`).hide()
        fetch(`/api/v1/menu`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json','Cache-Control': 'no-cache', 'Accept-Language': getLanguage()},
            body: JSON.stringify({ 'referenceID': referenceID })
        }).then(async response =>  {
            if (!response.ok) {throw (await response.json());}
            return response.json();
        }).then(async (result)=>{
            if(result['status'] === "success" && result['menu']){
                loadPDF(result['menu']);
                $('#pdfModal').modal('show')
            }
            $(`#loader_modal__${referenceID}`).hide()
            $(`#view_menu__${referenceID}`).show()
            viewMenuClick = false;
        })
        .catch(error => {
            showError(error)
            $(`#loader_modal__${referenceID}`).hide()
            $(`#view_menu__${referenceID}`).show()
            viewMenuClick = false;
        });
    }
}

async function renderPage(pageNum) {
    try {
      if (renderTask) {renderTask.cancel();renderTask = null;}
      const page = await pdfDoc.getPage(pageNum);
      const viewport = page.getViewport({ scale: zoomScale  });
      const canvas = document.getElementById('pdfCanvas');
      canvas.style.width = `${zoomScale * 100}%`;
      $('#zoom_percent').text(`${zoomScale * 100}%`)
      const context = canvas.getContext('2d');
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      const renderContext = {canvasContext: context,viewport: viewport,};
      renderTask = page.render(renderContext);
      await renderTask.promise;
      document.getElementById('pageNum').textContent = currentPage;
    } catch (error) {console.error('Error rendering page:', error);}
}

async function loadPDF(pdfData) {
  try {
    console.log(pdfData)
    const pdf = await pdfjsLib.getDocument({data: atob(pdfData.split(',')[1])}).promise;
    pdfDoc = pdf;
    pageCount = pdf.numPages;
    document.getElementById('pageCount').textContent = pageCount;
    renderPage(currentPage);
  } catch (error) {console.error('Error loading PDF:', error);}
}

function SelectRestaurant(card,restaurantID) {
    const allCards = document.querySelectorAll('#restaurants-container > div');
    allCards.forEach(c => c.classList.remove('selected_restaurant'));
    card.classList.add('selected_restaurant');
    selectedRestaurant = restaurantID;
}


$(document).on('click', '#confirmation_modal_button', () => {
    $('#restaurant_confirmation_modal').modal('hide')
    beginLoading();
    fetchTime();
});

function ConfirmRestaurant(){
    if(!confirmRestaurantClick && selectedRestaurant){
      confirmRestaurantClick = true;
      $('#loader').show();
      $('#notloader').hide();
      beginLoading();
      fetch(`/api/v1/saverestaurant`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json','Cache-Control': 'no-cache', 'Accept-Language': getLanguage()},
        body: JSON.stringify({'restaurantID': selectedRestaurant})
    }).then(async response => {
        if (!response.ok) {throw (await response.json());}
        return response.json(); 
    }).then(result => {
        $('#confirmation_modal_body').empty();
        $('#confirmation_modal_button').show();
        if(result['status'] === 'success'){
            if(result.hasOwnProperty('remaining')){
                $('#confirmation_modal_body').append(
                    `
                    <div class="tw-flex tw-items-center tw-mb-2 tw-text-md">
                        <span class="tw-font-extrabold" > ${result['freeReservation']}</span>
                    </div>                   
                    <div class="tw-flex tw-mb-2">
                        <div class="tw-text-sm">  ${result['remainingReservations']}   <span style="color:white;" class="tw-font-bold tw-text-lg tw-border-b px-1 tw-border-b-white"> ${result['remaining']} </span> </div>          
                    </div>                 
                    <div class="tw-flex tw-justify-center tw-align-middle tw-items-center tw-mb-2">
                        <span> ${result['pressContinue']}</span>
                    </div>
                    `
                )            
            }
            if(result.hasOwnProperty('paidReservation')){
                $('#confirmation_modal_body').append(
                    `
                    <div class="tw-flex tw-items-center tw-mb-2">
                        <span class="tw-text-red-500 tw-text-md tw-text-justify tw-font-extrabold tw-justify-stretch" >${result['paidReservation']}</span>
                    </div>
                    <div class="tw-flex tw-justify-center tw-align-middle tw-items-center tw-mb-2">
                        <span>${result['pressContinue']}</span>
                    </div>
                    `
                )
            }
            if(result.hasOwnProperty('notice')){
                $('#confirmation_modal_body').append(
                    `
                    <div class="tw-flex tw-items-center tw-mb-2">
                        <span class="tw-text-red-500 tw-text-md tw-text-justify tw-font-extrabold tw-justify-stretch" >${result['notice']}</span>
                    </div>
                    <div class="tw-flex tw-justify-center tw-align-middle tw-items-center tw-mb-2">
                        <span>${result['pressContinue']}</span>
                    </div>
                    `
                )
            }
            if(result.hasOwnProperty('alwaysFreeNotice')){
                $('#confirmation_modal_body').append(
                    `
                    <div class="tw-flex tw-items-center tw-mb-2">
                        <span class="tw-text-green-500 tw-text-md tw-text-justify tw-font-extrabold tw-justify-stretch" >${result['alwaysFreeNotice']}</span>
                    </div>
                    <div class="tw-flex tw-justify-center tw-align-middle tw-items-center tw-mb-2">
                        <span>${result['pressContinue']}</span>
                    </div>
                    `
                )
            }
        }else{
            console.log(result)
            if(result.hasOwnProperty('notice')){
                $('#confirmation_modal_body').append(
                    `
                    <div class="tw-flex tw-items-center tw-mb-2">
                        <span class="tw-text-red-500 tw-text-md tw-text-justify tw-font-extrabold tw-justify-stretch" >${result['notice']}</span>
                    </div>
                    `
                )
                $('#confirmation_modal_button').hide();
            }
        }
        $('#restaurant_confirmation_modal').modal('show')
        confirmRestaurantClick = false;
        $('#loader').hide();
        $('#notloader').show();
        releaseLoading()
    })
    .catch(error => {
        showError(error)
        $('#loader').hide();
        $('#notloader').show();
        confirmRestaurantClick = false;
        beginLoading();
    });
    }
}

const fetchTime = async ()=>{
    fetch('/reservation/time',{headers: {'Accept-Language': getLanguage()}})
    .then(async response => {
        if (!response.ok) {throw (await response.json());}
        return response.text();
    }).then(result => {
        $('#main').empty();
        $('#main').append(result);
        activateDynamicTimeFunctions();
    }).catch(error => {
        showError(error);
    });
}

function activateDynamicTimeFunctions(){
    darkModeFunctions();
    $('#datepicker').on('change',()=> {
        desiredDate = $('#datepicker').val()
    })
    $('#search').on('click', ()=> searchDate());
    $('#confirm').on('click',()=> confirmTime())
    $('#datepricetable').on('check.bs.table', function (e, row) {
        $('#step_two').empty();
        if(row['reservation_by_room'] === 1){
            $('#step_two').append(`
                <hr class="py-0 mb-3" /> 
                <div class="tw-flex tw-py-0 pb-0">
                    <i class="fa-solid fa-2x fa-2 tw-px-4 tw-text-red-600"></i>
                    <h6 class="tw-mb-4 tw-font-semibold tw-text-gray-900 tw-inline-flex">${row['RoomBasedReservation']}<p class="tw-text-red-600 tw-px-2"> (${row['roomNumber']}) </p></h6>
                </div>
            `)
            $('#step_two').append(`
                <div id="names_list" class="tw-items-center tw-w-full tw-text-sm tw-font-medium tw-text-gray-900 tw-bg-gray-300 tw-border tw-border-gray-200 tw-rounded-lg sm:tw-flex">
                  ${row['names'].map((name) => `
                    <div class="tw-w-full tw-px-2 tw-border-b tw-border-gray-200 sm:tw-border-b-0 sm:tw-border-r">
                      <div class="tw-flex tw-items-center tw-ps-3"> 
                        <i class="fa-solid fa-1.5x fa-user"></i> 
                        <label for="${name}" class="tw-w-full tw-py-3 tw-ms-2 tw-text-sm tw-font-sans tw-font-bold tw-text-gray-900">${name}</label>                    
                        <input value="${name}" onchange="UpdateTotal()" hidden checked id="${name}" type="checkbox" value="" class="tw-w-6 tw-h-6 tw-text-blue-600 tw-bg-gray-100 tw-border-gray-300 tw-rounded focus:tw-ring-blue-500 focus:tw-ring-2"> 
                      </div>
                    </div>
                  `).join('')}
                </div>
            `);
        }else{
            $('#step_two').append(`
                <hr class="py-0 mb-3" /> 
                <div class="tw-flex tw-py-2 pb-0">
                    <i class="fa-solid fa-2x fa-2 tw-px-4 tw-text-red-600"></i>
                    <h6 class="tw-mb-4 tw-font-semibold tw-text-gray-900 tw-inline-flex">${row['paxBasedReservation']}<p class="tw-text-red-600 tw-px-2"> (${row['roomNumber']}) </p></h6>
                </div>
            `)
            $('#step_two').append(`
                <div id="names_list" class="tw-items-center tw-w-full tw-text-sm tw-font-medium tw-text-gray-900 tw-bg-gray-300 tw-border tw-border-gray-200 tw-rounded-lg sm:tw-flex">
                  ${row['names'].map((name) => `
                    <div class="tw-w-full tw-px-2 tw-border-b tw-border-gray-200 sm:tw-border-b-0 sm:tw-border-r">
                      <div class="tw-flex tw-items-center tw-ps-3"> 
                        <i class="fa-solid fa-1.5x fa-user"></i> 
                        <label for="${name}" class="tw-w-full tw-py-3 tw-ms-2 tw-text-sm tw-font-sans tw-font-bold tw-text-gray-900">${name}</label>                    
                        <input value="${name}" onchange="UpdateTotal()" checked id="${name}" type="checkbox" value="" class="tw-w-6 tw-h-6 tw-text-blue-600 tw-bg-gray-100 tw-border-gray-300 tw-rounded focus:tw-ring-blue-500 focus:tw-ring-2"> 
                      </div>
                    </div>
                  `).join('')}
                </div>
            `);
        }
        UpdateTotal();
        $('#step_two').show()
        $('#total_table').show();
    });  
    releaseLoading();
}

function UpdateTotal(){
    const selectedRow = $('#datepricetable').bootstrapTable('getSelections');
    const per_person = selectedRow[0]['per_person'];
    const price = selectedRow[0]['price'];
    const currency = selectedRow[0]['currency'];
    if(per_person === 1){
        let count = document.querySelectorAll('#names_list input[type="checkbox"]:checked').length;
        if(count === 0){document.querySelector('#names_list input[type="checkbox"]').checked = true; count = 1; }
        $('#totalAmmount').text(`${Number(count) * Number(price)} ${currency}`)
    }else{
        $('#totalAmmount').text(`${Number(price)} ${currency}`)
    }
}

function timeStyle(value, row, index) {
    return {
      css: {
        color: 'blue'
      }
    }
  }

function stateFormatter(value, row) {
    if (row['remaining'] === 0) {
      return {
        disabled: true
      }
    }
    return value
}

function rowStyle(row, index) {
    if(row['remaining'] === 0){
        return {
            classes: 'pen-marked',
        }
    }
}

function remainingFormatter(data,row){
      return `<div style="color: #005792;" >${data} <i class="fa-solid fa-user-group"></i> </div>`
}

function timeFormatter(data,row){
    return `<div>${data} <div style="color: black" class="tw-text-sm">${row['meal_type'] !== null ? `(${JSON.parse(row['meal_type_array'])[row['meal_type']]})` : ''}</div> </div>`
}

function priceFormatterFree(data,row){
    return `<div style="color: #38598b;" >${data}</div>`
}

function priceFormatter(data,row){
    return `<div style="color: #38598b">${data} ${row['currency']} <div style="color: black" class="tw-text-sm"> ${row['per_person'] === 1 ? `(${row['per_person_ident']})` : ''} </div>  </div>`
}

function perPersonFormatter(data,row){
    if(data === 1){
       return `<i class="fa-solid fa-2x fa-circle-check text-success"></i>`
    }else{
       return `<i class="fa-solid fa-2x fa-circle-xmark text-danger"></i>`
    }
}

function searchDate(){
    if(!timePageSearch){
        $('#totalAmmount').text('')
        timePageSearch = true;
        $('#search_spinner').show();
        $('#search_normal').hide();
        $('#datepicker').attr('disabled', true);
        hideError();
        $('#table_show_hide').hide();
        $('#step_two').hide();
        fetch(`/api/v1/getavailabledate`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json','Cache-Control': 'no-cache', 'Accept-Language': getLanguage()},
            body: JSON.stringify({ 'desiredDate': desiredDate })
        }).then(async response =>  {
            if (!response.ok) {throw (await response.json());}
            return response.json();
        }).then(async (result)=>{
            $('#total_table').hide();
            result['data'].map(item=> { item['names'] = result['names']; item['roomNumber'] = result['roomNumber']; item['RoomBasedReservation'] = result['RoomBasedReservation']; item['paxBasedReservation'] = result['paxBasedReservation']; item['free'] = result['free']; item['meal_type_array'] = result['table']['meal_type'];  item['per_person_ident'] = result['table']['per_person'];});
            if(result['data'].length > 0){
                $('#datepricetable').bootstrapTable('destroy').bootstrapTable().bootstrapTable('load',result['data'])
                const columns = $('#datepricetable').bootstrapTable('getVisibleColumns');
                columns.forEach((column, index)=>{    
                    $('#datepricetable').bootstrapTable('updateColumnTitle', {
                        field: column.field,
                        title: result['table'][`${column.field}`].toString()
                    })
                });
                $('#table_show_hide').show();
            }else{     
                showError({errorText: result['errorRestaurantNotAvailable']})    
                $('#table_show_hide').hide();
            }
            timePageSearch = false;
            $('#search_spinner').hide();
            $('#search_normal').show();
            $('#datepicker').removeAttr('disabled');
            
        })
        .catch(error => {
            showError(error)
            $('#search_spinner').hide();
            $('#search_normal').show();
            timePageSearch = false;
        });
    }
}

function confirmTime(){

    const selectedRow = $('#datepricetable').bootstrapTable('getSelections');
    if( !selectedRow[0] || selectedRow[0]['restaurant_pricing_times_id'] === null || selectedRow[0]['restaurant_pricing_times_id'] === undefined || selectedRow[0]['restaurant_pricing_times_id'].length === 0){
        showError({ errorText: noSelectedTimeError })
        timeConfirm = false;
        releaseLoading();
        $('#loader').hide()
        $('#notloader').show()
        return;
    }

    const checkedCheckboxes  = document.querySelectorAll('#names_list input[type="checkbox"]:checked');
    console.log(checkedCheckboxes)
    const selectedNames = Array.from(checkedCheckboxes).map(checkbox => checkbox.value);
    console.log(selectedNames)
    if( selectedNames === null || selectedNames === undefined || selectedNames.length === 0){
        showError({ errorText: noSelectedGuestsError })
        timeConfirm = false;
        releaseLoading();
        $('#loader').hide()
        $('#notloader').show()
        return;
    }

    if(!timeConfirm){
        timeConfirm = true;
        hideError();
        beginLoading();
        $('#loader').show()
        $('#notloader').hide()
        fetch(`/api/v1/validate`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json','Cache-Control': 'no-cache', 'Accept-Language': getLanguage()},
            body: JSON.stringify({ 'selectedTime':selectedRow[0]['restaurant_pricing_times_id'], "selectedNames":selectedNames, "desiredDate":desiredDate })
        }).then(async response =>  {
            if (!response.ok) {throw (await response.json());}
            return response.json();
        }).then(async (result)=>{
            if(result.status === "error") return window.location.href='/api/v1/cancelreservation';
            if(result.status === "alreadyReserved" || result.status === "notEnough") showError(result);
            if(result.status === "success") fetchConfirm();
            timeConfirm = false;
            releaseLoading();
            $('#loader').hide()
            $('#notloader').show()
        }).catch(error => {
            timeConfirm = false;
            showError(error);
            $('#loader').hide()
            $('#notloader').show()
            releaseLoading();
        });
    }
}

const fetchConfirm = async ()=>{
    fetch('/reservation/confirm',{headers: {'Accept-Language': getLanguage()}})
    .then(async response => {
        if (!response.ok) {throw (await response.json());}
        return response.text();
    }).then(result => {
        $('#main').empty();
        $('#main').append(result);
        activateDynamicConfirmFunctions();
    }).catch(error => {
        showError(error);
    });
}

function activateDynamicConfirmFunctions(){
    darkModeFunctions();
    releaseLoading();
}

  
    