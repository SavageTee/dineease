var clicked = false;
let errorTimeout;

const handleButtonsClick = (digit) => {
    let input = document.getElementById('code');
    if(input){ input.value = input.value + digit;}
}

const handleBackClick = () => {
    let input = document.getElementById('code');
    input.value = input.value.slice(0, -1);
}

const showError = (error) => {
    if (errorTimeout) {clearTimeout(errorTimeout);}
    $('#errorAlert').text(error['errorText'])
    $('#selecterror').fadeIn();
}

const hideError = ()=> { $('#errorAlert').text(); $('#selecterror').fadeOut();}

function isDigit(char) {return /^\d$/.test(char);}

function Confirm(){
    if(!clicked){
        clicked = true;
        hideError();
        let input = document.getElementById('code');
        fetch(`/api/v1/checkroom`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json','Cache-Control': 'no-cache'},
            body: JSON.stringify({ 'roomNumber': input.value })
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
        }).then(result => {
            if(result['status'] === 'noRoom'){ clicked = false; return showError(result);}
            if(result['result']["verification_type"] === 0){
                $('#verification_modal p').text(result['verification']['verificationBD'])
            }else{
                $('#verification_modal p').text(result['verification']['verificationDD'])
            }
            $('#verification_modal').modal('show')
            clicked = false;
        })
        .catch(error => {
            showError(error.details)
            clicked = false;
        });
    }
}

const confirmDate = (date)=>{
    fetch(`/api/v1/verifyroom`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json','Cache-Control': 'no-cache'},
        body: JSON.stringify({ 'date': date,  })
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
    }).then(result => {
        if(result['status'] === 'success'){
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
        }
        $('#verification_modal').modal('hide')
        $('#keypad').hide()
        $('#pointerAbsorber').hide()
        $('#alert-text').text()
        $('#confirm').show()
    })
    .catch(error => {
        showError(error.details)
        clicked = false;
    });

}

function goToRestaurants(){
    if(!clicked){
        clicked = true;
        hideError();
        $('#notloader').hide()
        $('#pointerAbsorber').show();
        $('#loader').show();
        window.location.href = '/reservation/restaurant'
        setTimeout(() => {
            clicked = false;
            $('#notloader').show()
            $('#pointerAbsorber').hide();
            $('#loader').hide();
        }, 10000); 
    }
}

$(document).ready(function() {    
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
    $('#go').on('click',()=> Confirm())
    $('#confirm').on('click',()=> goToRestaurants());
})