function redirect(chosenLanguage){
    const currentUrl = window.location.href;
    const url = new URL(currentUrl);
    const newUrl = `${window.location.origin}/${chosenLanguage}/reservation/hotel`;
    console.log(newUrl)
    window.location.href = newUrl;
}
const isDarkMode = localStorage.getItem('darkMode') === 'true';
if (isDarkMode) {
    $('html').addClass('tw-dark');  // Apply dark mode
    $('#sun-icon').show()
    $('#moon-icon').hide()
} else {
    $('html').removeClass('tw-dark');  // Apply light mode
    $('#sun-icon').hide()
    $('#moon-icon').show()
}


$(document).ready(function() {
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
});