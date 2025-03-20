// Wait for the DOM to load
document.addEventListener('DOMContentLoaded', () => {
    const fileInput = document.getElementById('file-input');
    const uploadBtn = document.getElementById('upload-btn');
    const resultsSection = document.getElementById('results');
    const spinner = document.getElementById('spinner');
    let aiResponse = null; // Store the AI response
  
    // Trigger file input on button click
    uploadBtn.addEventListener('click', (e) => {
      e.preventDefault();
      fileInput.click();
    });
  
    // Handle file selection and upload
    fileInput.addEventListener('change', () => {
      if (!fileInput.files.length) {
        alert('Please select a PDF file!');
        return;
      }
  
      const pdfFile = fileInput.files[0];
      const formData = new FormData();
      formData.append('pdf', pdfFile);
  
      spinner.classList.remove('hidden');
      resultsSection.classList.remove('hidden');
  
      fetch('http://localhost:8000/api/process-pdf', {
        method: 'POST',
        body: formData
      })
      .then(response => {
        if (!response.ok) throw new Error('Network response was not ok');
        return response.json();
      })
      .then(data => {
        spinner.classList.add('hidden');
        aiResponse = data.ai_response; // Store the structured JSON
  
        // Show user choice buttons
        showChoiceButtons();

        // Function to show choice buttons
        function showChoiceButtons() {
          resultsSection.innerHTML = `
            <div class="glass-card">
              <h3>PDF Processed!</h3>
              <p>What would you like to see?</p>
              <button class="btn-primary" id="show-summary">Show Summary</button>
              <button class="btn-primary" id="show-questions">Show Questions</button>
            </div>
          `;

          // Event listeners for buttons
          document.getElementById('show-summary').addEventListener('click', () => {
            resultsSection.innerHTML = `
              <div class="glass-card">
                <h3>Summary</h3>
                <p>${aiResponse.summary}</p>
                <button class="btn-primary" id="back-btn">Back to Menu</button>
              </div>
            `;
            document.getElementById('back-btn').addEventListener('click', showChoiceButtons);
          });

          document.getElementById('show-questions').addEventListener('click', () => {
            displayQuestions(aiResponse.questions);
          });
        }
      })
      .catch(error => {
        spinner.classList.add('hidden');
        resultsSection.innerHTML = `<p>Error: ${error.message}</p>`;
        console.error('Upload failed:', error);
      });
    });
  
    // Display questions as a test
    function displayQuestions(questions) {
      let html = '<div class="glass-card"><h3>Test Your Knowledge</h3>';
      questions.forEach((q, index) => {
        html += `
          <div class="question" id="question-${index}">
            <p><strong>Question ${index + 1}:</strong> ${q.question}</p>
            <div class="options-grid">
              ${q.options.map((option, i) => `
                <label class="option-label">
                  <input type="radio" name="q${index}" value="${option}">
                  ${option}
                </label>
              `).join('')}
            </div>
            <button type="button" class="btn-primary" onclick="checkAnswer(${index}, '${q.correct_answer}')">Submit Answer</button>
            <div id="feedback-${index}" class="feedback"></div>
          </div>
        `;
      });
      html += `<button class="btn-primary" id="back-btn">Back to Menu</button></div>`;
      resultsSection.innerHTML = html;
      
      // Add event listener to back button
      const backBtn = document.getElementById('back-btn');
      if (backBtn) {
        backBtn.addEventListener('click', () => {
          showChoiceButtons();
        });
      }
    }
  
    // Check user answer and provide feedback
    window.checkAnswer = function(questionIndex, correctAnswer) {
      const questionDiv = document.getElementById(`question-${questionIndex}`);
      const selected = questionDiv.querySelector(`input[name="q${questionIndex}"]:checked`);
      const feedback = document.getElementById(`feedback-${questionIndex}`);
      const allOptions = questionDiv.querySelectorAll('.option-label');
      
      // Reset all options to default state
      allOptions.forEach(option => {
        option.style.background = '#F3F4F6';
        option.style.color = '#000';
      });

      if (!selected) {
        feedback.className = 'feedback warning';
        feedback.innerHTML = 'Please select an answer!';
        return;
      }

      const userAnswer = selected.value;
      const selectedLabel = selected.closest('.option-label');
      
      if (userAnswer === correctAnswer) {
        feedback.className = 'feedback success';
        feedback.innerHTML = '<strong>Correct!</strong> Well done! 🎉';
        selectedLabel.style.background = '#DEF7EC';
        selectedLabel.style.color = '#03543F';
      } else {
        feedback.className = 'feedback error';
        feedback.innerHTML = `<strong>Not quite right.</strong> The correct answer is: ${correctAnswer}`;
        selectedLabel.style.background = '#FDE8E8';
        selectedLabel.style.color = '#9B1C1C';
        
        // Highlight correct answer
        allOptions.forEach(option => {
          if (option.textContent.trim() === correctAnswer) {
            option.style.background = '#DEF7EC';
            option.style.color = '#03543F';
          }
        });
      }
    };
  });
