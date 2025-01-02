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
            console.log(error)
            showError(error.details)
            clicked = false;
        });
    }
}

const confirmDate = (date)=>{
    console.log(date)

    fetch(`/api/v1/verifyroom`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json','Cache-Control': 'no-cache'},
        body: JSON.stringify({ 'roomNumber': input.value,  })
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
        console.log(result['result'][0][0]["verification_type"] === 0)
        console.log(result['verification']['verificationBD'])
        if(result['result'][0][0]["verification_type"] === 0){
            $('#verification_modal p').text(result['verification']['verificationBD'])
        }else{
            $('#verification_modal p').text(result['verification']['verificationDD'])
        }
        $('#verification_modal').modal('show')
        clicked = false;
    })
    .catch(error => {
        console.log(error)
        showError(error.details)
        clicked = false;
    });

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
})