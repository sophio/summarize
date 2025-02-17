console.log("Background script loaded");

chrome.runtime.onInstalled.addListener(() => {
  console.log("Extension installed");
  chrome.contextMenus.create({
    id: "summarizeText",
    title: "AI 总结所选文本",
    contexts: ["selection"]
  });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  console.log("Context menu clicked");
  if (info.menuItemId === "summarizeText") {
    const selectedText = info.selectionText;
    console.log("Selected text:", selectedText);
    
    fetch('http://127.0.0.1:5000/summarize', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ text: selectedText })
    })
    .then(response => response.json())
    .then(data => {
      console.log("Summary received:", data.summary);
      chrome.notifications.create('', {
        type: 'basic',
        iconUrl: 'icon.png',// 请确保图标文件存在于扩展中
        title: 'AI 总结结果',
        message: data.summary
      });
    })
    .catch(error => {
      console.error('Error:', error);
      chrome.notifications.create('', {
        type: 'basic',
        iconUrl: 'icon.png',
        title: '总结失败',
        message: error.toString()
      });
    });
  }
});

