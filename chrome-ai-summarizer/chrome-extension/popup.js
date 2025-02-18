document.addEventListener('DOMContentLoaded', function() {
  const btn = document.getElementById('summarizeBtn');
  const summaryDiv = document.getElementById('summary');
  
  btn.addEventListener('click', function() {
    summaryDiv.textContent = "Generating summary, please wait...";
    // Get the current active tab
    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
      const activeTab = tabs[0];
      // Get the entire page's text content from the active page
      chrome.scripting.executeScript({
        target: { tabId: activeTab.id },
        function: () => document.body.innerText
      }, async (results) => {
        if (chrome.runtime.lastError) {
          summaryDiv.textContent = "Failed to get page content: " + chrome.runtime.lastError.message;
          return;
        }
        const pageText = results[0].result;
        try {
          const response = await fetch('http://127.0.0.1:5000/summarize', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ text: pageText })
          });
          if (!response.ok) {
            throw new Error('Network response was not ok');
          }
          const data = await response.json();
          summaryDiv.textContent = data.summary || 'No summary generated';
        } catch (error) {
          summaryDiv.textContent = 'Failed to generate summary: ' + error.message;
        }
      });
    });
  });
});
