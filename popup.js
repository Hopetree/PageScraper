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

  savedRegex.forEach(({ name, pattern }) => {
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

// 保存或更新正则表达式
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

  // 检查是否有同名的正则表达式
  const existingRegexIndex = savedRegex.findIndex(item => item.name === regexName);

  if (existingRegexIndex !== -1) {
    // 如果正则已存在，更新
    savedRegex[existingRegexIndex] = {
      name: regexName,
      pattern: regexPattern
    };
    localStorage.setItem('savedRegex', JSON.stringify(savedRegex));
    alert(`正则 "${regexName}" 已更新！`);
  } else {
    // 如果正则不存在，新增
    savedRegex.push({
      name: regexName,
      pattern: regexPattern
    });
    localStorage.setItem('savedRegex', JSON.stringify(savedRegex));
    alert(`正则 "${regexName}" 已保存！`);
  }

  loadSavedRegex(); // 重新加载下拉框中的选项
  updateRegexList(); // 更新管理页面的正则表达式列表
});

// 更新管理页面中的正则表达式列表
function updateRegexList() {
  const savedRegex = JSON.parse(localStorage.getItem('savedRegex')) || [];
  const regexList = document.getElementById('regexList');
  regexList.innerHTML = ''; // 清空现有列表

  // 填充已保存的正则表达式
  savedRegex.forEach(({ name, pattern }, index) => {
    const tr = document.createElement('tr');

    // 名称列
    const nameTd = document.createElement('td');
    nameTd.textContent = name;
    tr.appendChild(nameTd);

    // 正则表达式列
    const patternTd = document.createElement('td');
    patternTd.textContent = pattern;
    tr.appendChild(patternTd);

    // 操作列
    const actionTd = document.createElement('td');
    const editButton = document.createElement('button');
    editButton.classList.add('edit-btn');
    editButton.textContent = '编辑';
    editButton.addEventListener('click', () => {
      editRegex(index);
    });
    const deleteButton = document.createElement('button');
    deleteButton.classList.add('delete-btn');
    deleteButton.textContent = '删除';
    deleteButton.addEventListener('click', () => {
      deleteRegex(index, name);
    });
    actionTd.appendChild(editButton);
    actionTd.appendChild(deleteButton);
    tr.appendChild(actionTd);

    regexList.appendChild(tr);
  });
}

// 编辑正则表达式
function editRegex(index) {
  const savedRegex = JSON.parse(localStorage.getItem('savedRegex')) || [];
  const regexToEdit = savedRegex[index];

  const regexNameInput = document.getElementById('newRegexName');
  const regexPatternInput = document.getElementById('newRegexInput');

  // 填充输入框
  regexNameInput.value = regexToEdit.name;
  regexPatternInput.value = regexToEdit.pattern;

  // 在保存按钮事件中更新正则
  document.getElementById('saveRegexButton').onclick = function () {
    saveEditedRegex(index);
  };
}

// 保存编辑后的正则表达式
function saveEditedRegex(index) {
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

  // 更新正则表达式
  savedRegex[index] = {
    name: regexName,
    pattern: regexPattern
  };

  // 保存到 localStorage
  localStorage.setItem('savedRegex', JSON.stringify(savedRegex));

  alert(`正则 "${regexName}" 已更新！`);
  loadSavedRegex(); // 重新加载下拉框中的选项
  updateRegexList(); // 更新管理页面的正则表达式列表
}

// 删除正则表达式
function deleteRegex(index, name) {
  const savedRegex = JSON.parse(localStorage.getItem('savedRegex')) || [];
  savedRegex.splice(index, 1); // 从数组中删除正则表达式
  localStorage.setItem('savedRegex', JSON.stringify(savedRegex)); // 更新 localStorage
  alert(`正则 "${name}" 已删除！`);
  loadSavedRegex(); // 重新加载下拉框
  updateRegexList(); // 更新列表
}

// 提取并匹配页面内容
document.getElementById('extractButton').addEventListener('click', () => {
  const regexInput = document.getElementById('regexInput').value.trim();

  // 检查正则输入是否为空
  if (!regexInput) {
    alert('请输入正则表达式');
    return;
  }

  // 在当前标签页执行脚本
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.scripting.executeScript({
      target: { tabId: tabs[0].id },
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
  try {
    // 确保正则表达式被正确构造
    const regex = new RegExp(regexInput, 'gi'); 
    const html = document.documentElement.outerHTML;
    const matches = [];
    let match;

    while ((match = regex.exec(html)) !== null) {
      // 将所有捕获的组添加到结果
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
  } catch (error) {
    console.error('正则表达式无效:', error);
    return [];
  }
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
