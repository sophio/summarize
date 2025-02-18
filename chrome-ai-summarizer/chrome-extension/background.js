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
    
    fetch('http://127.0.0.1:5000/summarize', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ text: selectedText })
    })
    .then(response => response.json())
    .then(data => {
      chrome.notifications.create('', {
        type: 'basic',
        iconUrl: 'icon.png', // Ensure the icon file exists in the extension
        title: 'AI Summary Result',
        message: data.summary
      });
    })
    .catch(error => {
      console.error('Error:', error);
      chrome.notifications.create('', {
        type: 'basic',
        iconUrl: 'icon.png',
        title: 'Summary Failed',
        message: error.toString()
      });
    });
  }
});

