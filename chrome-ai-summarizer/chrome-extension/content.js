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
 // console.log("Extension installed");
  chrome.contextMenus.create({
    id: "summarizeText",
    title: "AI 总结所选文本",
    contexts: ["selection"]
  });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
 // console.log("Context menu clicked");
  if (info.menuItemId === "summarizeText") {
    const selectedText = info.selectionText;
  //  console.log("Selected text:", selectedText);
    
    fetch('http://localhost:5000/summarize', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ text: selectedText })
    })
    .then(response => response.json())
    .then(data => {
    //  console.log("Summary received:", data.summary);
      alert(data.summary);
    })
    .catch(error => {
      console.error('Error:', error);
      alert('总结失败：' + error);
    });
  }
});

// 监听来自 popup.js 的消息
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
 // console.log("Message received in background.js:", request);
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