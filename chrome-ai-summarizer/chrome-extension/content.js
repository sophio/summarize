(async () => {
  try {
    const textContent = document.body.innerText;
    const summary = await summarizeText(textContent);
    alert(`Summary: ${summary}`);
  } catch (error) {
    alert(`Error summarizing text: ${error.message}`);
  }
})();

async function summarizeText(text) {
  const response = await fetch('http://127.0.0.1:5000/summarize', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ text })
  });

  if (!response.ok) {
    throw new Error('Network response was not ok');
  }

  const data = await response.json();
  return data.summary || 'No summary available';
}

chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "summarizeText",
    title: "AI Summarize Selected Text",
    contexts: ["selection"]
  });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "summarizeText") {
    const selectedText = info.selectionText;
    
    fetch('http://localhost:5000/summarize', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ text: selectedText })
    })
    .then(response => response.json())
    .then(data => {
      alert(data.summary);
    })
    .catch(error => {
      console.error('Error:', error);
      alert('Summary failed:' + error);
    });
  }
});

// Listen for messages from popup.js
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "executeScript") {
    chrome.scripting.executeScript({
      target: { tabId: sender.tab.id },
      files: ['content.js']
    }, () => {
      if (chrome.runtime.lastError) {
        console.error(chrome.runtime.lastError);
      } else {
        console.log("Script executed");
      }
    });
  }
}); 