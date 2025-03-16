document.addEventListener('DOMContentLoaded', () => {
    const fileInput = document.getElementById('file-input');
    const uploadBtn = document.getElementById('upload-btn');
    const resultsSection = document.getElementById('results');
    const spinner = document.getElementById('spinner');
    const uploadArea = document.querySelector('.upload-area');
  
    // Trigger file input when clicking the upload button
    uploadBtn.addEventListener('click', () => {
      fileInput.click();
    });
  
    // Handle file selection and show spinner
    fileInput.addEventListener('change', () => {
      if (fileInput.files.length > 0) {
        const file = fileInput.files[0];
        if (file.type !== 'application/pdf') {
          alert('Please upload a PDF file only!');
          fileInput.value = ''; // Clear the input
          return;
        }
  
        // Show results section and spinner
        resultsSection.classList.remove('hidden');
        spinner.classList.remove('hidden');
  
        // Hide spinner after 5 seconds
        setTimeout(() => {
          spinner.classList.add('hidden');
        }, 5000000);
      }
    });
  
    // Drag and drop functionality for the upload area
    uploadArea.addEventListener('dragover', (e) => {
      e.preventDefault();
      uploadArea.style.background = 'rgba(255, 255, 255, 0.7)';
      uploadArea.style.borderColor = '#FBBF24';
    });
  
    uploadArea.addEventListener('dragleave', (e) => {
      e.preventDefault();
      uploadArea.style.background = 'rgba(255, 255, 255, 0.5)';
      uploadArea.style.borderColor = '#1E3A8A';
    });
  
    uploadArea.addEventListener('drop', (e) => {
      e.preventDefault();
      uploadArea.style.background = 'rgba(255, 255, 255, 0.5)';
      uploadArea.style.borderColor = '#1E3A8A';
      const files = e.dataTransfer.files;
      if (files.length > 0) {
        fileInput.files = files; // Assign dropped files to the input
        fileInput.dispatchEvent(new Event('change')); // Trigger the change event
      }
    });
  
    // Sidebar toggle functionality
    const menuToggle = document.querySelector('.menu-toggle');
    const sidebar = document.querySelector('.sidebar');
    const overlay = document.querySelector('.overlay');
    const closeSidebar = document.querySelector('.close-sidebar');
  
    menuToggle.addEventListener('click', () => {
      sidebar.classList.add('active');
      overlay.classList.add('active');
    });
  
    closeSidebar.addEventListener('click', () => {
      sidebar.classList.remove('active');
      overlay.classList.remove('active');
    });
  
    overlay.addEventListener('click', () => {
      sidebar.classList.remove('active');
      overlay.classList.remove('active');
    });
  });