function redirect(chosenLanguage){
    const currentUrl = window.location.href;
    const url = new URL(currentUrl);
    const newUrl = `${window.location.origin}/${chosenLanguage}/reservation/hotel`;
    console.log(newUrl)
    window.location.href = newUrl;
}
$(document).ready(function() {
    $('#en').on('click',()=>{redirect('en');})
    $('#ar').on('click',()=>{redirect('ar');})
    $('#de').on('click',()=>{redirect('de');})
    $('#fr').on('click',()=>{redirect('fr');})
    $('#es').on('click',()=>{ redirect('es');})
});