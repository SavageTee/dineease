console.log('kola')

function selectCard(card) {
  // Remove green border from previously selected cards
  document.querySelectorAll('#hotels-container .tw-border-green-500').forEach(selectedCard => {
    selectedCard.classList.remove('tw-border-green-500');
  });
  card.classList.add('tw-border-green-500');
}




$(document).ready(function() {

 


})