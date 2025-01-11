var searching = false;
var errorTimeout;

const showError = (error) => {
    if (errorTimeout) {clearTimeout(errorTimeout);}
    $('#errorAlert').text(error['errorText'])
    $('#selecterror').fadeIn();
}

const hideError = ()=> { $('#errorAlert').text(); $('#selecterror').fadeOut();}

function stateFormatter(value, row) {
    console.log(row)
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

function priceFormatterFree(data,row){
    return `<p style="color: green;" >${data}</p>`
}

function priceFormatter(data,row){
    return `<p>${data} ${row['currency']}</p>`
}

function perPersonFormatter(data,row){
    if(data === 1){
       return `<i class="fa-solid fa-2x fa-circle-check text-success"></i>`
    }else{
       return `<i class="fa-solid fa-2x fa-circle-xmark text-danger"></i>`
    }
}

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
            body: JSON.stringify({ 'desiredDate': $('#datepicker').val() })
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
            result['data'].map(item=> item['free'] = result['free']);
            if(result['data'].length > 0){
                $('#datepricetable').bootstrapTable('destroy').bootstrapTable().bootstrapTable('load',result['data'])
                const columns = $('#datepricetable').bootstrapTable('getVisibleColumns');
                columns.forEach((column) => {
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


$(document).ready(function(){
    $('#search').on('click', ()=> searchDate());
})

