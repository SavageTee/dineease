var searching = false;
var errorTimeout;
var clicked = false;
var noSelectedGuestsError= '';
var noSelectedTimeError= '';
var desiredDate = null;

const showError = (error) => {
    if (errorTimeout) {clearTimeout(errorTimeout);}
    $('#errorAlert').text(error['errorText'])
    $('#selecterror').fadeIn();
}

const hideError = ()=> { $('#errorAlert').text(); $('#selecterror').fadeOut();}

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

function timeFormatter(data,row){
    console.log(row)
    return `<div>${data} <div style="color: black" class="tw-text-sm">${row['meal_type'] !== null ? `(${JSON.parse(row['meal_type_array'])[row['meal_type']]})` : ''}</div> </div>`
}

function priceFormatterFree(data,row){
    return `<div style="color: green;" >${data}</div>`
}

function priceFormatter(data,row){
    return `<div style="color: green">${data} ${row['currency']} <div style="color: black" class="tw-text-sm"> ${row['per_person'] === 1 ? `(${row['per_person_ident']})` : ''} </div>  </div>`
}

function perPersonFormatter(data,row){
    if(data === 1){
       return `<i class="fa-solid fa-2x fa-circle-check text-success"></i>`
    }else{
       return `<i class="fa-solid fa-2x fa-circle-xmark text-danger"></i>`
    }
}

$('#datepicker').on('change',()=> {
    desiredDate = $('#datepicker').val()
    console.log(desiredDate)
})


function searchDate(){
    if(!searching){
        searching = true;
        $('#search_spinner').show();
        $('#search_normal').hide();
        $('#datepicker').attr('disabled', true);
        hideError();
        $('#table_show_hide').hide();
        fetch(`/api/v1/getavailabledate`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json','Cache-Control': 'no-cache'},
            body: JSON.stringify({ 'desiredDate': desiredDate })
        }).then(response =>  {
            if (!response.ok) {
                return response.json().then(errorDetails => {
                    const error = new Error('HTTP error occurred');
                    error.status = response.status; 
                    error.details = errorDetails; 
                    throw error;
                });
            }
            return response.json();
        }).then(async (result)=>{
            noSelectedGuestsError = result['noSelectedGuestsError'];
            noSelectedTimeError = result['noSelectedTimeError'];
            result['data'].map(item=> {item['free'] = result['free']; item['meal_type_array'] = result['table']['meal_type'];  item['per_person_ident'] = result['table']['per_person'];});
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
            searching = false;
            $('#search_spinner').hide();
            $('#search_normal').show();
            $('#datepicker').removeAttr('disabled');
            
        })
        .catch(error => {
            console.log(error)
            showError(error.details)
            $(`#loader_modal_${restaurantID}`).hide()
            $(`#view_menu_${restaurantID}`).show()
            clicked = false;
        });
    }
}

function confirm(){
    if(!clicked){
        clicked = true;
        hideError();
        $('#pointerAbsorber').show()
        $('#loader').show()
        $('#notloader').hide()
        const selectedRow = $('#datepricetable').bootstrapTable('getSelections');
        if( selectedRow === null || selectedRow === undefined || selectedRow.length === 0){
            showError({ errorText: noSelectedTimeError })
            clicked = false;
            $('#pointerAbsorber').hide()
            $('#loader').hide()
            $('#notloader').show()
            return;
        }
        const checkboxes = document.querySelectorAll('#names_list input[type="checkbox"]:checked');
        const selectedNames = Array.from(checkboxes).map(checkbox => {const label = checkbox.closest('li').querySelector('label');return label ? label.textContent.trim() : null;}).filter(name => name !== null);
        if( selectedNames === null || selectedNames === undefined || selectedNames.length === 0){
            showError({ errorText: noSelectedGuestsError })
            clicked = false;
            $('#pointerAbsorber').hide()
            $('#loader').hide()
            $('#notloader').show()
            return;
        }
        console.log(selectedRow[0]['restaurant_pricing_times_id'])
        fetch(`/api/v1/validate`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json','Cache-Control': 'no-cache'},
            body: JSON.stringify({ 'selectedTime':selectedRow[0]['restaurant_pricing_times_id'], "selectedNames":selectedNames, "desiredDate":desiredDate })
        }).then(response =>  {
            if (!response.ok) {
                return response.json().then(errorDetails => {
                    const error = new Error('HTTP error occurred');
                    error.status = response.status; 
                    error.details = errorDetails; 
                    throw error;
                });
            }
            return response.json();
        }).then(async (result)=>{
            console.log(result.status)
            if(result.status === "error") return window.location.href='/api/v1/cancelreservation';
            if(result.status === "alreadyReserved" || result.status === "notEnough") showError(result);
            if(result.status === "success") window.location.href = '/reservation/confirm'
            clicked = false;
            $('#pointerAbsorber').hide()
            $('#loader').hide()
            $('#notloader').show()
        }).catch(error => {
            console.log(error)
            clicked = false;
            hideError();
            $('#pointerAbsorber').hide()
            $('#loader').hide()
            $('#notloader').show()
        });
    }
}


$(document).ready(function(){
    $('#search').on('click', ()=> searchDate());
    $('#confirm').on('click',()=> confirm())
})

