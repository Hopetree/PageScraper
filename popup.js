// Tab切换逻辑
document.getElementById('homeTab').addEventListener('click', () => {
  switchTab('homePage', 'homeTab');
});
document.getElementById('manageTab').addEventListener('click', () => {
  switchTab('managePage', 'manageTab');
});

function switchTab(pageId, tabId) {
  document.getElementById('homePage').style.display = pageId === 'homePage' ? 'block' : 'none';
  document.getElementById('managePage').style.display = pageId === 'managePage' ? 'block' : 'none';
  document.getElementById('homeTab').classList.toggle('active', tabId === 'homeTab');
  document.getElementById('manageTab').classList.toggle('active', tabId === 'manageTab');
}

// 加载已保存的正则表达式到下拉列表
function loadSavedRegex() {
  const savedRegex = JSON.parse(localStorage.getItem('savedRegex')) || [];
  const regexSelect = document.getElementById('savedRegexSelect');
  regexSelect.innerHTML = '<option value="">选择一个正则表达式...</option>'; // 清空当前的选项

  savedRegex.forEach(({
    name,
    pattern
  }) => {
    const option = document.createElement('option');
    option.value = pattern;
    option.textContent = name;
    regexSelect.appendChild(option);
  });
}

// 选择下拉框中的正则表达式时填充到输入框
document.getElementById('savedRegexSelect').addEventListener('change', (event) => {
  document.getElementById('regexInput').value = event.target.value;
});

// 保存新的正则表达式
document.getElementById('saveRegexButton').addEventListener('click', () => {
  const regexName = document.getElementById('newRegexName').value.trim();
  const regexPattern = document.getElementById('newRegexInput').value.trim();

  if (!regexName || !regexPattern) {
    alert('请输入名称和正则表达式。');
    return;
  }

  // 测试正则表达式的有效性
  try {
    new RegExp(regexPattern); // 如果无法创建正则对象，抛出错误
  } catch {
    alert('请输入有效的正则表达式。');
    return;
  }

  // 获取已保存的正则表达式
  const savedRegex = JSON.parse(localStorage.getItem('savedRegex')) || [];

  // 检查是否有重复的名称
  if (savedRegex.some(item => item.name === regexName)) {
    alert('名称已存在，请使用其他名称。');
    return;
  }

  // 新的正则表达式对象
  savedRegex.push({
    name: regexName,
    pattern: regexPattern
  });

  // 保存正则表达式到 localStorage
  localStorage.setItem('savedRegex', JSON.stringify(savedRegex));

  alert(`正则 "${regexName}" 已保存！`);
  loadSavedRegex(); // 重新加载下拉框中的选项
  updateRegexList(); // 更新管理页面的正则表达式列表
});

// 更新管理页面中的正则表达式列表
function updateRegexList() {
  const savedRegex = JSON.parse(localStorage.getItem('savedRegex')) || [];
  const regexList = document.getElementById('regexList');
  regexList.innerHTML = ''; // 清空现有列表

  // 填充已保存的正则表达式
  savedRegex.forEach(({
    name,
    pattern
  }, index) => {
    const li = document.createElement('li');
    li.textContent = `${name}: ${pattern}`;

    // 创建删除按钮
    const deleteButton = document.createElement('button');
    deleteButton.textContent = '删除';
    deleteButton.style.marginLeft = '10px';

    // 删除按钮的事件处理
    deleteButton.addEventListener('click', () => {
      savedRegex.splice(index, 1); // 从数组中删除正则表达式
      localStorage.setItem('savedRegex', JSON.stringify(savedRegex)); // 更新 localStorage
      alert(`正则 "${name}" 已删除！`);
      loadSavedRegex(); // 重新加载下拉框
      updateRegexList(); // 更新列表
    });

    li.appendChild(deleteButton);
    regexList.appendChild(li);
  });
}

// 提取并匹配页面内容
document.getElementById('extractButton').addEventListener('click', () => {
  const regexInput = document.getElementById('regexInput').value;

  // 在当前标签页执行脚本
  chrome.tabs.query({
    active: true,
    currentWindow: true
  }, (tabs) => {
    chrome.scripting.executeScript({
      target: {
        tabId: tabs[0].id
      },
      func: extractContentAndMatch,
      args: [regexInput]
    }, (results) => {
      const resultElement = document.getElementById('result');
      const matchCountElement = document.getElementById('matchCount');

      // 如果有匹配结果，显示匹配的内容
      if (results && results[0] && results[0].result) {
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
  const html = document.documentElement.outerHTML;
  const regex = new RegExp(regexInput, 'gi');
  const matches = [];
  let match;

  while ((match = regex.exec(html)) !== null) {
    if (match.length > 1) {
      matches.push(match.slice(1).join(' '));
    } else {
      matches.push(match[0]);
    }

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
    navigator.clipboard.writeText(resultText)
      .then(() => {
        const copySuccess = document.getElementById('copySuccess');
        copySuccess.style.display = 'block';
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

// 初始化加载
loadSavedRegex();
updateRegexList();