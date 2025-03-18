// Wait for the DOM to load
document.addEventListener('DOMContentLoaded', () => {
  const fileInput = document.getElementById('file-input');
  const uploadBtn = document.getElementById('upload-btn');
  const resultsSection = document.getElementById('results');
  const spinner = document.getElementById('spinner');

  // When "Choose File" button is clicked, trigger the file input
  uploadBtn.addEventListener('click', (e) => {
      e.preventDefault(); // Prevent default button behavior
      fileInput.click(); // Open the file explorer
  });

  // When a file is selected, start the upload process
  fileInput.addEventListener('change', () => {
      // Check if a file is selected
      if (!fileInput.files.length) {
          alert('Please select a PDF file!');
          return;
      }

      // Get the selected PDF file
      const pdfFile = fileInput.files[0];

      // Create FormData object to send the file
      const formData = new FormData();
      formData.append('pdf', pdfFile);

      // Show spinner while processing
      spinner.classList.remove('hidden');
      resultsSection.classList.remove('hidden');

      // Send the PDF to Laravel backend
      fetch('http://localhost:8000/api/process-pdf', {
          method: 'POST',
          body: formData
      })
      .then(response => {
          if (!response.ok) {
              throw new Error('Network response was not ok');
          }
          return response.json(); // Parse JSON response from Laravel
      })
      .then(data => {
          // Hide spinner
          spinner.classList.add('hidden');

          // Display a simple success message (we’ll expand this later)
          resultsSection.innerHTML = '<p>PDF uploaded successfully! Processing...</p>';
          console.log(data); // Log the response for now
      })
      .catch(error => {
          // Hide spinner and show error
          spinner.classList.add('hidden');
          resultsSection.innerHTML = `<p>Error: ${error.message}</p>`;
          console.error('Upload failed:', error);
      });
  });
});