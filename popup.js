let isEditing = false;
let editingIndex = -1; // 记录正在编辑的正则索引

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
  regexSelect.innerHTML = '<option value="">选择一个正则表达式...</option>';

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

// 保存或更新正则表达式
document.getElementById('saveRegexButton').addEventListener('click', () => {
  const regexName = document.getElementById('newRegexName').value.trim();
  const regexPattern = document.getElementById('newRegexInput').value.trim();

  if (!regexName || !regexPattern) {
    alert('请输入名称和正则表达式。');
    return;
  }

  try {
    new RegExp(regexPattern);
  } catch {
    alert('请输入有效的正则表达式。');
    return;
  }

  const savedRegex = JSON.parse(localStorage.getItem('savedRegex')) || [];
  const existingIndex = savedRegex.findIndex(item => item.name === regexName);

  if (isEditing || existingIndex !== -1) {
    const indexToUpdate = isEditing ? editingIndex : existingIndex;
    savedRegex[indexToUpdate] = {
      name: regexName,
      pattern: regexPattern
    };
    alert(`正则 "${regexName}" 已更新！`);
  } else {
    savedRegex.push({
      name: regexName,
      pattern: regexPattern
    });
    alert(`正则 "${regexName}" 已保存！`);
  }

  localStorage.setItem('savedRegex', JSON.stringify(savedRegex));
  loadSavedRegex();
  updateRegexList();
  isEditing = false;
  editingIndex = -1;
});

function updateRegexList() {
  const savedRegex = JSON.parse(localStorage.getItem('savedRegex')) || [];
  const regexList = document.getElementById('regexList');
  regexList.innerHTML = '';

  savedRegex.forEach(({
    name,
    pattern
  }, index) => {
    const tr = document.createElement('tr');
    const nameTd = document.createElement('td');
    nameTd.textContent = name;
    tr.appendChild(nameTd);

    const patternTd = document.createElement('td');
    patternTd.textContent = pattern;
    tr.appendChild(patternTd);

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

function editRegex(index) {
  const savedRegex = JSON.parse(localStorage.getItem('savedRegex')) || [];
  const regexToEdit = savedRegex[index];

  document.getElementById('newRegexName').value = regexToEdit.name;
  document.getElementById('newRegexInput').value = regexToEdit.pattern;

  isEditing = true;
  editingIndex = index;
}

function deleteRegex(index, name) {
  const savedRegex = JSON.parse(localStorage.getItem('savedRegex')) || [];
  savedRegex.splice(index, 1);
  localStorage.setItem('savedRegex', JSON.stringify(savedRegex));
  alert(`正则 "${name}" 已删除！`);
  loadSavedRegex();
  updateRegexList();
}

document.getElementById('extractButton').addEventListener('click', () => {
  const regexInput = document.getElementById('regexInput').value.trim();

  if (!regexInput) {
    alert('请输入正则表达式');
    return;
  }

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

function extractContentAndMatch(regexInput) {
  try {
    const regex = new RegExp(regexInput, 'gi');
    const html = document.documentElement.outerHTML;
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
  } catch (error) {
    console.error('正则表达式无效:', error);
    return [];
  }
}

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

loadSavedRegex();
updateRegexList();