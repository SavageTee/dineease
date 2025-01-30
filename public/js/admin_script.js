var loginButton = false;
var errorTimeout;

(async function(){
    fetch('/api/v1/adminstate')
    .then(response => {
        if (!response.ok) {throw new Error(`HTTP error! Status: ${response.status}`);}
        return response.json();
    }).then(result => {
        console.log(result)
        if(result['state'] === 'login') fetchLogin();
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
            headers: {'Content-Type': 'application/json','Cache-Control': 'no-cache'},
            body: JSON.stringify({'error':error.toString()})
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

const fetchLogin = async ()=>{
    fetch('/de-admin/login')
    .then(async response => {
        if (!response.ok) {throw (await response.json());}
        return response.text();
    }).then(async result => {
        $('#main').append(result);
        activateDynamicsForLoginFunctions();
    }).catch(error => {
        showError(error);
    });
}

const activateDynamicsForLoginFunctions =() => { 

    $('#loginForm').on('submit', function (event) {
        event.preventDefault(); 
        if(!loginButton){
            $('#loader').show();
            $('#notloader').hide();
            loginButton = true;
            hideError();
            const email = $('#email').val();
            const password = $('#password').val();  
            fetch(`/api/v1/login`, {
                method: 'POST',
                headers: {'Content-Type': 'application/json','Cache-Control': 'no-cache'},
                body: JSON.stringify({'username': email, 'password':password })
            }).then(response => {
                if (!response.ok) {throw new Error(`HTTP error! Status: ${response.status}`);}
                return response.json(); 
            }).then(result => {
                console.log(result)
                if(result["status"] === "error") {
                    showError(result);
                }
                if(result['status'] === "success"){}
                $('#loader').hide();
                $('#notloader').show()
                loginButton = false;
            })
            .catch(error => {
                $('#loader').hide();
                $('#notloader').show();
                loginButton = false;
                showError(error);
            });
        }
    })
    releaseLoading();
}
