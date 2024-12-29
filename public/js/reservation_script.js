console.log('kola')

function selectCard(card) {
  document.querySelectorAll('#hotels-container .border-3').forEach(selectedCard => {
    selectedCard.classList.remove('border-3');
    selectedCard.classList.remove('border-success');
  });
  card.classList.add('border-3');
  card.classList.add('border-success');
}




$(document).ready(function() {

 


})