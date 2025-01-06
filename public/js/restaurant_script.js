var clicked = false;
var errorTimeout;
let pdfDoc = null;
let currentPage = 1;
let pageCount = 0;
let zoomScale = 1;
let renderTask = null; 

$('#zoom_percent').text(`${zoomScale * 100}%`)
$(function() {
    pdfjsLib.GlobalWorkerOptions.workerSrc = '/js/pdf.worker.min.js';    
});

const showError = (error) => {
    if (errorTimeout) {clearTimeout(errorTimeout);}
    $('#errorAlert').text(error['errorText'])
    $('#selecterror').fadeIn();
}

const hideError = ()=> { $('#errorAlert').text(); $('#selecterror').fadeOut();}

function viewMenu(restaurantID){
    pdfDoc = null;
    currentPage = 1;
    pageCount = 0;
    zoomScale = 1;
    renderTask = null; 
    if(!clicked){
        clicked = true;
        $(`#loader_modal_${restaurantID}`).show()
        $(`#view_menu_${restaurantID}`).hide()
        fetch(`/api/v1/menu`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json','Cache-Control': 'no-cache'},
            body: JSON.stringify({ 'restaurantID': restaurantID })
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
            loadPDF(result['menu']['menu_pdf'].data);
            $('#pdfModal').modal('show')
            $(`#loader_modal_${restaurantID}`).hide()
            $(`#view_menu_${restaurantID}`).show()
            clicked = false;
        })
        .catch(error => {
            showError(error.details)
            $(`#loader_modal_${restaurantID}`).hide()
            $(`#view_menu_${restaurantID}`).show()
            clicked = false;
        });
    }
}

function setZoom(scale) {
  if(scale < 0.1) return;
  if(scale > 5) return;
  zoomScale = scale;
  const canvas = document.getElementById('pdfCanvas');
  canvas.style.width = `${zoomScale * 100}%`;
  $('#zoom_percent').text(`${zoomScale * 100}%`)
  renderPage(currentPage);
}

function nextPage() {
  if (currentPage < pageCount) {
    currentPage++;
    renderPage(currentPage);
  }
}
  
function prevPage() {
  if (currentPage > 1) {
    currentPage--;
    renderPage(currentPage);
  }
}

  async function renderPage(pageNum) {
    try {
      if (renderTask) {renderTask.cancel();renderTask = null;}
      const page = await pdfDoc.getPage(pageNum);
      const viewport = page.getViewport({ scale: zoomScale  });
      const canvas = document.getElementById('pdfCanvas');
      canvas.style.width = `${zoomScale * 100}%`;
      $('#zoom_percent').text(`${zoomScale * 100}%`)
      const context = canvas.getContext('2d');
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      const renderContext = {canvasContext: context,viewport: viewport,};
      renderTask = page.render(renderContext);
      await renderTask.promise;
      document.getElementById('pageNum').textContent = currentPage;
    } catch (error) {console.error('Error rendering page:', error);}
  }

  async function loadPDF(pdfData) {
    try {
      const pdf = await pdfjsLib.getDocument({ data: pdfData }).promise;
      pdfDoc = pdf;
      pageCount = pdf.numPages;
      document.getElementById('pageCount').textContent = pageCount; // Update total pages
      renderPage(currentPage); // Render the first page
    } catch (error) {console.error('Error loading PDF:', error);}
  }


$(document).ready(function() {
    document.getElementById('nextPage').addEventListener('click', nextPage);
    document.getElementById('prevPage').addEventListener('click', prevPage);

    document.getElementById('zoomIn').addEventListener('click', () => setZoom(zoomScale + 0.5));
    document.getElementById('zoomOut').addEventListener('click', () => setZoom(zoomScale - 0.5));

})