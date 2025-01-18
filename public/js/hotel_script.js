var selected = undefined;
var clicked = false;
let errorTimeout;

function selectHotel(card,hotelID) {
  const allCards = document.querySelectorAll('#hotels-container > div');
  allCards.forEach(c => c.classList.remove('selected'));
  card.classList.add('selected');
  selected = hotelID;
}

(function(){
  const selectedElement = document.querySelector('#hotels-container .selected');
  if (selectedElement) {selected= selectedElement.id;}
})();

function Confirm(){
  if(!clicked && selected){
    clicked = true;
    $('#loader').show();
    $('#notloader').hide()
    $('#pointerAbsorber').show();
    fetch(`/api/v1/savehotel`, {
      method: 'POST',
      headers: {'Content-Type': 'application/json','Cache-Control': 'no-cache'},
      body: JSON.stringify({'hotelID': selected})
    }).then(response => {
      if (!response.ok) {throw new Error(`HTTP error! Status: ${response.status}`);}
      return response.json(); 
    }).then(result => {
      window.location.href = '/reservation/room'
      $('#loader').hide();
      $('#notloader').show()
      $('#pointerAbsorber').hide();
      clicked = false;
    })
    .catch(error => {
      console.error('Error:', error);
      alert('Failed to submit data.');
    });
  }else{
    if (errorTimeout) {clearTimeout(errorTimeout);}
    $('#selecterror').fadeIn();
    setTimeout(function () {
      $('#selecterror').fadeOut();
  }, 3000);
  }
}

$(document).ready(function() {
  $('#confirm').on('click',()=> Confirm())
})