// 提取并匹配页面内容
document.getElementById('extractButton').addEventListener('click', () => {
  const regexInput = document.getElementById('regexInput').value;
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.scripting.executeScript({
      target: { tabId: tabs[0].id },
      func: extractContentAndMatch,
      args: [regexInput]
    }, (results) => {
      const resultElement = document.getElementById('result');
      const matchCountElement = document.getElementById('matchCount');
      if (results && results[0] && results[0].result) {
        // 去重匹配结果
        const uniqueResults = [...new Set(results[0].result)];
        resultElement.textContent = uniqueResults.join('\n') || '未找到匹配项。';
        matchCountElement.textContent = uniqueResults.length;
      } else {
        resultElement.textContent = '未找到匹配项。';
        matchCountElement.textContent = '0';
      }
    });
  });
});

  
// 提取页面内容并用正则匹配
function extractContentAndMatch(regexInput) {
  const html = document.documentElement.outerHTML; // 获取页面的完整HTML源代码
  const regex = new RegExp(regexInput, 'gi'); // 使用传入的正则表达式
  const matches = [];
  let match;
  while ((match = regex.exec(html)) !== null) {
    // 如果有捕获组，提取捕获组内容；否则，提取整个匹配项
    if (match.length > 1) {
      matches.push(match.slice(1).join(' ')); // 将所有捕获组的内容拼接成一个字符串
    } else {
      matches.push(match[0]);
    }
    // 防止零宽度匹配导致无限循环
    if (match.index === regex.lastIndex) {
      regex.lastIndex++;
    }
  }
  return matches;
}
  
// 复制匹配结果到剪贴板
document.getElementById('copyButton').addEventListener('click', () => {
  const resultElement = document.getElementById('result');
  const resultText = resultElement.textContent;

  if (resultText.trim()) {
    // 使用 Clipboard API 复制文本到剪贴板
    navigator.clipboard.writeText(resultText)
      .then(() => {
        // 显示复制成功提示
        const copySuccess = document.getElementById('copySuccess');
        copySuccess.style.display = 'block';
        // 3秒后隐藏提示
        setTimeout(() => {
          copySuccess.style.display = 'none';
        }, 3000);
      })
      .catch(err => {
        console.error("复制失败:", err);
        alert("复制失败，请重试！");
      });
  } else {
    alert("没有匹配结果可复制。");
  }
});
  