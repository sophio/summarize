document.addEventListener('DOMContentLoaded', function() {
  const btn = document.getElementById('summarizeBtn');
  const summaryDiv = document.getElementById('summary');
  
  btn.addEventListener('click', function() {
    summaryDiv.textContent = "正在生成摘要，请稍候……";
    // 获取当前活动标签页
    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
      const activeTab = tabs[0];
      // 在活动页面中获取整个页面的文本内容
      chrome.scripting.executeScript({
        target: { tabId: activeTab.id },
        function: () => document.body.innerText
      }, async (results) => {
        if (chrome.runtime.lastError) {
          summaryDiv.textContent = "获取页面内容失败: " + chrome.runtime.lastError.message;
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
            throw new Error('网络响应异常');
          }
          const data = await response.json();
          summaryDiv.textContent = data.summary || '没有生成摘要';
        } catch (error) {
          summaryDiv.textContent = '生成摘要失败: ' + error.message;
        }
      });
    });
  });
});
