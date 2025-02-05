var loginButton = false;
var errorTimeout;
var saveChangeUserBool = false;
var staticsPageBool = false;
var hotelsPageBool = false;
const csrfToken = document.querySelector('meta[name="csrf-token"]').getAttribute('content');
console.log(csrfToken);

function loadingTemplate(loadingMessage) {
    return '<div class="spinner-grow table-dark" role="status"></div><div class="spinner-grow" role="status"></div><div class="spinner-grow" role="status"></div>'
}


(async function(){
    fetch('/api/v1/adminstate',{headers:{'X-CSRF-Token': csrfToken}})
    .then(async response => {
        if (!response.ok) {throw (await response.json());}
        return response.json();
    }).then(result => {
        console.log(result)
        if(result['state'] === 'login') fetchLogin();
        if(result['state'] === 'dashboard') fetchDashboard();
    }).catch(error => {
        showError(error);
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
            headers: {'Content-Type': 'application/json','Cache-Control': 'no-cache', 'X-CSRF-Token': csrfToken},
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

const fetchLogin = async ()=>{
    fetch('/de-admin/login',{headers:{'X-CSRF-Token': csrfToken}})
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
    darkModeFunctions();
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
                headers: {'Content-Type': 'application/json','Cache-Control': 'no-cache','X-CSRF-Token': csrfToken},
                body: JSON.stringify({'username': email, 'password':password })
            }).then(async response => {
                if (!response.ok) {throw (await response.json());}
                return response.json(); 
            }).then(result => {
                console.log(result)
                if(result["status"] === "error") {
                    showError(result);
                }
                if(result['status'] === "success"){
                    beginLoading();
                    fetchDashboard();
                    return;
                }
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

const fetchDashboard = async ()=>{
    fetch('/de-admin/dashboard',{headers:{'X-CSRF-Token': csrfToken}})
    .then(async response => {
        if (!response.ok) {throw (await response.json());}
        return response.text();
    }).then(async result => {
        $('#main').empty();
        $('#main').append(result);
        activateDynamicsForDashboardFunctions();
    }).catch(error => {
        showError(error);
    });
}

const ToggleSideBar = ()=>{
    if($('#sidebar').width() <= 0){
        $('#sidebar').css('width', 'calc(10vw + 20vh)');
    }else{
        $('#sidebar').css('width', '0px');
    }
}

const activateDynamicsForDashboardFunctions =() => {
    darkModeFunctions();
    $(document).ready(function () {
    $('#navToggle').on('click',()=>{ToggleSideBar();})})
   
    const LoaderForDashBoard = ()=>{
        $('#main_content_dashboard').empty();
        $('#main_content_dashboard').append(`
            <div class="tw-flex tw-justify-center tw-items-center tw-my-auto">
                <span class="spinner-grow spinner-grow-sm text-light mx-1" role="status" aria-hidden="true"></span>
                <span class="spinner-grow spinner-grow-sm text-light mx-1" role="status" aria-hidden="true"></span>
                <span class="spinner-grow spinner-grow-sm text-light mx-1" role="status" aria-hidden="true"></span>
            </div>
        `);
    }

    const saveChagesToUser = ()=>{
        console.log('heere')
        if(!saveChangeUserBool){
            saveChangeUserBool = true;
            $('#userSaveNotLoader').show()
            $('#userSaveLoader').hide()
            fetch(`/api/v1/saveuserchanges`, {
                method: 'POST',
                headers: {'Content-Type': 'application/json','Cache-Control': 'no-cache','X-CSRF-Token': csrfToken},
                body: JSON.stringify({'displayName':$('#displayName').val(), 'email': $('#email').val(), 'phone': $('#phone').val(),})
            }).then(async response => {
                if (!response.ok) {throw (await response.json());}
                return response.json(); 
            }).then(result => {
                if(result["status"] === "error") {
                    showError(result);
                }
                if(result['status'] === "success"){             
                    $('#displayName').val(result['data'][0][0]['display_name'])
                    $('#email').val(result['data'][0][0]['email'])
                    $('#phone').val(result['data'][0][0]['phone'])
                }
                console.log('her')
                $('#userSaveLoader').show();
                $('#userSaveNotLoader').hide()
                saveChangeUserBool = false;
            })
            .catch(error => {
                $('#userSaveLoader').show();
                $('#userSaveNotLoader').hide()
                saveChangeUserBool = false;
                showError(error);
            });
        }
    }
    $('#save_changes').on('click',()=> saveChagesToUser());
    $('#statics_page').on('click',()=> {
        if(!staticsPageBool){
            ToggleSideBar();
            staticsPageBool = true;
            LoaderForDashBoard();
            fetchStatics();
        }
    })
    $('#hotels_page').on('click',()=> {
        if(!hotelsPageBool){
            ToggleSideBar();
            hotelsPageBool = true;
            LoaderForDashBoard();
            fetchHotels();
        }
    })
    
    let sidebarOpen = true;
    $('toggle-sidebar').on("click", () => {
      sidebarOpen = !sidebarOpen;
      if (sidebarOpen) {
        document.getElementById("logo-sidebar").classList.remove("-tw-translate-x-full");
        document.getElementById("main-content").classList.add("tw-ml-64");
      } else {
        document.getElementById("logo-sidebar").classList.add("-tw-translate-x-full");
        document.getElementById("main-content").classList.remove("tw-ml-64");
        document.getElementById("logo-sidebar").classList.add("-tw-w-0");
      }
    });
  releaseLoading();
}

//hotels_page

const fetchStatics = async ()=>{
    fetch('/de-admin/statics',{headers:{'X-CSRF-Token': csrfToken}})
    .then(async response => {
        if (!response.ok) {throw (await response.json());}
        return response.text();
    }).then(async result => {
        $('#main_content_dashboard').empty();
        $('#main_content_dashboard').append(result);
        activateDynamicsForStaticsFunctions();
    }).catch(error => {
        staticsPageBool = false;
        showError(error);
    });
}

const activateDynamicsForStaticsFunctions = ()=>{
    staticsPageBool = false;
}

const fetchHotels = async ()=>{
    fetch('/de-admin/hotels',{headers:{'X-CSRF-Token': csrfToken}})
    .then(async response => {
        if (!response.ok) {throw (await response.json());}
        return response.text();
    }).then(async result => {
        $('#main_content_dashboard').empty();
        $('#main_content_dashboard').append(result);
        activateDynamicsForHotelsFunctions();
    }).catch(error => {
        hotelsPageBool = false;
        showError(error);
    });
}

const activateDynamicsForHotelsFunctions = ()=>{
    hotelsPageBool = false;
}