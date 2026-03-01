const DEFAULT_CATEGORIES = {
  expense: [
    { id: "food", name: "餐饮", icon: "🍜", color: "#ef4444", isDefault: true },
    {
      id: "transport",
      name: "交通",
      icon: "🚗",
      color: "#f59e0b",
      isDefault: true,
    },
    {
      id: "shopping",
      name: "购物",
      icon: "🛒",
      color: "#ec4899",
      isDefault: true,
    },
    {
      id: "entertainment",
      name: "娱乐",
      icon: "🎮",
      color: "#8b5cf6",
      isDefault: true,
    },
    {
      id: "housing",
      name: "住房",
      icon: "🏠",
      color: "#6366f1",
      isDefault: true,
    },
    {
      id: "health",
      name: "医疗",
      icon: "💊",
      color: "#10b981",
      isDefault: true,
    },
    {
      id: "education",
      name: "教育",
      icon: "📚",
      color: "#3b82f6",
      isDefault: true,
    },
    {
      id: "other_expense",
      name: "其他",
      icon: "💸",
      color: "#6b7280",
      isDefault: true,
    },
  ],
  income: [
    {
      id: "salary",
      name: "工资",
      icon: "💰",
      color: "#10b981",
      isDefault: true,
    },
    {
      id: "bonus",
      name: "奖金",
      icon: "🎁",
      color: "#3b82f6",
      isDefault: true,
    },
    {
      id: "investment",
      name: "理财",
      icon: "📈",
      color: "#f59e0b",
      isDefault: true,
    },
    {
      id: "parttime",
      name: "兼职",
      icon: "💼",
      color: "#8b5cf6",
      isDefault: true,
    },
    { id: "gift", name: "红包", icon: "🧧", color: "#ef4444", isDefault: true },
    {
      id: "refund",
      name: "退款",
      icon: "🔄",
      color: "#06b6d4",
      isDefault: true,
    },
    {
      id: "other_income",
      name: "其他",
      icon: "💵",
      color: "#6b7280",
      isDefault: true,
    },
  ],
};

const PAYMENT_METHODS = {
  cash: "现金",
  wechat: "微信",
  alipay: "支付宝",
  bank: "银行卡",
  credit: "信用卡",
};

let CATEGORIES = loadCategories();
let records = JSON.parse(localStorage.getItem("accountBookRecords") || "[]");
let charts = { expense: null, income: null, trend: null };
let currentType = "expense";
let selectedCategory = null;
let currentManageType = "expense";

function loadCategories() {
  const saved = localStorage.getItem("accountBookCategories");
  if (saved) {
    return JSON.parse(saved);
  }
  return JSON.parse(JSON.stringify(DEFAULT_CATEGORIES));
}

function saveCategories() {
  localStorage.setItem("accountBookCategories", JSON.stringify(CATEGORIES));
}

document.addEventListener("DOMContentLoaded", () => {
  initApp();
});

function initApp() {
  initEventListeners();
  renderCategories();
  renderRecords();
  updateBalance();
  updateCategoryFilter();
  setDefaultDate();
}

function initEventListeners() {
  document.getElementById("addBtn").addEventListener("click", openAddModal);
  document
    .getElementById("closeModal")
    .addEventListener("click", closeAddModal);
  document.getElementById("syncBtn").addEventListener("click", openSyncModal);
  document
    .getElementById("closeSyncModal")
    .addEventListener("click", closeSyncModal);
  document
    .getElementById("recordForm")
    .addEventListener("submit", handleSubmit);

  document
    .getElementById("exportDataBtn")
    .addEventListener("click", exportData);
  document
    .getElementById("importDataBtn")
    .addEventListener("click", () =>
      document.getElementById("backupFileInput").click(),
    );
  document
    .getElementById("backupFileInput")
    .addEventListener("change", importData);

  document
    .getElementById("categoryManageBtn")
    .addEventListener("click", openCategoryModal);
  document
    .getElementById("closeCategoryModal")
    .addEventListener("click", closeCategoryModal);
  document
    .getElementById("addCategoryBtn")
    .addEventListener("click", addCategory);

  document.querySelectorAll(".type-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      currentType = btn.dataset.type;
      document
        .querySelectorAll(".type-btn")
        .forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      renderCategories();
    });
  });

  document.querySelectorAll(".cat-tab-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      currentManageType = btn.dataset.type;
      document
        .querySelectorAll(".cat-tab-btn")
        .forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      renderCategoryManageList();
    });
  });

  document.querySelectorAll(".tab-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const tab = btn.dataset.tab;
      document
        .querySelectorAll(".tab-btn")
        .forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      document
        .querySelectorAll(".tab-content")
        .forEach((c) => c.classList.remove("active"));
      document.getElementById(tab + "Tab").classList.add("active");
      if (tab === "stats") {
        renderCharts();
      }
    });
  });

  document
    .getElementById("typeFilter")
    .addEventListener("change", renderRecords);
  document
    .getElementById("categoryFilter")
    .addEventListener("change", renderRecords);
  document
    .getElementById("timeFilter")
    .addEventListener("change", renderRecords);

  document.getElementById("addModal").addEventListener("click", (e) => {
    if (e.target === e.currentTarget) closeAddModal();
  });
  document.getElementById("syncModal").addEventListener("click", (e) => {
    if (e.target === e.currentTarget) closeSyncModal();
  });
  document.getElementById("categoryModal").addEventListener("click", (e) => {
    if (e.target === e.currentTarget) closeCategoryModal();
  });
}

function renderCategories() {
  const grid = document.getElementById("categoryGrid");
  const categories = CATEGORIES[currentType];
  selectedCategory = null;

  grid.innerHTML = categories
    .map(
      (cat) => `
        <div class="category-item" data-id="${cat.id}">
            <span class="category-icon">${cat.icon}</span>
            <span class="category-name">${cat.name}</span>
        </div>
    `,
    )
    .join("");

  grid.querySelectorAll(".category-item").forEach((item) => {
    item.addEventListener("click", () => {
      grid
        .querySelectorAll(".category-item")
        .forEach((i) => i.classList.remove("selected"));
      item.classList.add("selected");
      selectedCategory = item.dataset.id;
    });
  });
}

function openAddModal() {
  document.getElementById("addModal").classList.add("active");
  currentType = "expense";
  selectedCategory = null;
  document.querySelectorAll(".type-btn").forEach((btn) => {
    btn.classList.remove("active");
    if (btn.dataset.type === "expense") btn.classList.add("active");
  });
  document.getElementById("amountInput").value = "";
  document.getElementById("noteInput").value = "";
  document.getElementById("paymentMethod").value = "cash";
  setDefaultDate();
  renderCategories();
}

function closeAddModal() {
  document.getElementById("addModal").classList.remove("active");
}

function openSyncModal() {
  document.getElementById("syncModal").classList.add("active");
}

function closeSyncModal() {
  document.getElementById("syncModal").classList.remove("active");
}

function openCategoryModal() {
  document.getElementById("categoryModal").classList.add("active");
  currentManageType = "expense";
  document.querySelectorAll(".cat-tab-btn").forEach((btn) => {
    btn.classList.remove("active");
    if (btn.dataset.type === "expense") btn.classList.add("active");
  });
  renderCategoryManageList();
}

function closeCategoryModal() {
  document.getElementById("categoryModal").classList.remove("active");
}

function renderCategoryManageList() {
  const list = document.getElementById("categoryManageList");
  const categories = CATEGORIES[currentManageType];

  list.innerHTML = categories
    .map(
      (cat) => `
        <div class="category-manage-item" data-id="${cat.id}">
            <div class="cat-icon" style="background: ${cat.color}20;">${cat.icon}</div>
            <span class="cat-name">${cat.name}</span>
            <div class="cat-actions">
                <button class="cat-action-btn edit" onclick="editCategory('${cat.id}')" title="编辑">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                    </svg>
                </button>
                <button class="cat-action-btn delete" onclick="deleteCategory('${cat.id}')" title="删除">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="3 6 5 6 21 6"></polyline>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                    </svg>
                </button>
            </div>
        </div>
    `,
    )
    .join("");
}

function addCategory() {
  const name = document.getElementById("newCategoryName").value.trim();
  const icon = document.getElementById("newCategoryIcon").value.trim();
  const color = document.getElementById("newCategoryColor").value;

  if (!name) {
    alert("请输入分类名称");
    return;
  }

  if (!icon) {
    alert("请选择图标");
    return;
  }

  const id = "custom_" + Date.now();
  CATEGORIES[currentManageType].push({
    id,
    name,
    icon,
    color,
    isDefault: false,
  });

  saveCategories();
  renderCategoryManageList();
  updateCategoryFilter();

  document.getElementById("newCategoryName").value = "";
  document.getElementById("newCategoryIcon").value = "📝";
}

function editCategory(id) {
  const categories = CATEGORIES[currentManageType];
  const cat = categories.find((c) => c.id === id);
  if (!cat) return;

  const item = document.querySelector(`.category-manage-item[data-id="${id}"]`);
  item.innerHTML = `
        <div class="edit-category-form active" style="flex: 1;">
            <div class="form-row">
                <input type="text" id="editName_${id}" value="${cat.name}" placeholder="名称">
                <input type="text" id="editIcon_${id}" value="${cat.icon}" placeholder="图标" maxlength="2">
                <input type="color" id="editColor_${id}" value="${cat.color}">
            </div>
            <div class="btn-row">
                <button class="save-btn" onclick="saveCategory('${id}')">保存</button>
                <button class="cancel-btn" onclick="renderCategoryManageList()">取消</button>
            </div>
        </div>
    `;
}

function saveCategory(id) {
  const name = document.getElementById(`editName_${id}`).value.trim();
  const icon = document.getElementById(`editIcon_${id}`).value.trim();
  const color = document.getElementById(`editColor_${id}`).value;

  if (!name || !icon) {
    alert("请填写完整信息");
    return;
  }

  const categories = CATEGORIES[currentManageType];
  const cat = categories.find((c) => c.id === id);
  if (cat) {
    cat.name = name;
    cat.icon = icon;
    cat.color = color;
    saveCategories();
    renderCategoryManageList();
    updateCategoryFilter();
  }
}

function deleteCategory(id) {
  const categories = CATEGORIES[currentManageType];
  const cat = categories.find((c) => c.id === id);

  if (cat && cat.isDefault) {
    alert("默认分类不能删除");
    return;
  }

  if (confirm("确定要删除这个分类吗？")) {
    CATEGORIES[currentManageType] = categories.filter((c) => c.id !== id);
    saveCategories();
    renderCategoryManageList();
    updateCategoryFilter();
  }
}

function setDefaultDate() {
  const today = new Date().toISOString().split("T")[0];
  document.getElementById("dateInput").value = today;
}

function handleSubmit(e) {
  e.preventDefault();

  if (!selectedCategory) {
    alert("请选择分类");
    return;
  }

  const amount = parseFloat(document.getElementById("amountInput").value);
  if (!amount || amount <= 0) {
    alert("请输入有效金额");
    return;
  }

  const record = {
    id: Date.now(),
    type: currentType,
    category: selectedCategory,
    amount: amount,
    date: document.getElementById("dateInput").value,
    note: document.getElementById("noteInput").value,
    payment: document.getElementById("paymentMethod").value,
    createdAt: new Date().toISOString(),
  };

  records.unshift(record);
  saveRecords();
  renderRecords();
  updateBalance();
  updateCategoryFilter();
  closeAddModal();
}

function saveRecords() {
  localStorage.setItem("accountBookRecords", JSON.stringify(records));
}

function getFilteredRecords() {
  const typeFilter = document.getElementById("typeFilter").value;
  const categoryFilter = document.getElementById("categoryFilter").value;
  const timeFilter = document.getElementById("timeFilter").value;

  let filtered = [...records];

  if (typeFilter !== "all") {
    filtered = filtered.filter((r) => r.type === typeFilter);
  }

  if (categoryFilter !== "all") {
    filtered = filtered.filter((r) => r.category === categoryFilter);
  }

  if (timeFilter !== "all") {
    const now = new Date();
    filtered = filtered.filter((r) => {
      const date = new Date(r.date);
      if (timeFilter === "thisMonth") {
        return (
          date.getMonth() === now.getMonth() &&
          date.getFullYear() === now.getFullYear()
        );
      } else if (timeFilter === "lastMonth") {
        const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        return (
          date.getMonth() === lastMonth.getMonth() &&
          date.getFullYear() === lastMonth.getFullYear()
        );
      } else if (timeFilter === "thisYear") {
        return date.getFullYear() === now.getFullYear();
      }
      return true;
    });
  }

  return filtered;
}

function renderRecords() {
  const list = document.getElementById("recordsList");
  const filtered = getFilteredRecords();

  if (filtered.length === 0) {
    list.innerHTML = `
            <div class="empty-state">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                    <line x1="9" y1="9" x2="15" y2="15"></line>
                    <line x1="15" y1="9" x2="9" y2="15"></line>
                </svg>
                <p>暂无记录</p>
            </div>
        `;
    return;
  }

  list.innerHTML = filtered
    .map((record) => {
      const category = getCategory(record.type, record.category);
      return `
            <div class="record-item" data-id="${record.id}">
                <div class="record-icon" style="background: ${category.color}20;">
                    ${category.icon}
                </div>
                <div class="record-info">
                    <div class="record-category">${category.name}</div>
                    <div class="record-note">${record.note || "无备注"}</div>
                </div>
                <div class="record-meta">
                    <div class="record-amount ${record.type}">
                        ${record.type === "income" ? "+" : "-"}¥${record.amount.toFixed(2)}
                    </div>
                    <div class="record-date">${record.date}</div>
                    <span class="record-payment">${PAYMENT_METHODS[record.payment]}</span>
                </div>
            </div>
        `;
    })
    .join("");

  list.querySelectorAll(".record-item").forEach((item) => {
    item.addEventListener("contextmenu", (e) => {
      e.preventDefault();
      deleteRecord(parseInt(item.dataset.id));
    });
  });
}

function getCategory(type, id) {
  const categories = CATEGORIES[type];
  return (
    categories.find((c) => c.id === id) || {
      name: "未知",
      icon: "❓",
      color: "#6b7280",
    }
  );
}

function deleteRecord(id) {
  if (confirm("确定要删除这条记录吗？")) {
    records = records.filter((r) => r.id !== id);
    saveRecords();
    renderRecords();
    updateBalance();
    updateCategoryFilter();
  }
}

function updateBalance() {
  const income = records
    .filter((r) => r.type === "income")
    .reduce((sum, r) => sum + r.amount, 0);
  const expense = records
    .filter((r) => r.type === "expense")
    .reduce((sum, r) => sum + r.amount, 0);
  const net = income - expense;

  document.getElementById("totalIncome").textContent = `¥${income.toFixed(2)}`;
  document.getElementById("totalExpense").textContent =
    `¥${expense.toFixed(2)}`;
  document.getElementById("netBalance").textContent = `¥${net.toFixed(2)}`;
}

function updateCategoryFilter() {
  const select = document.getElementById("categoryFilter");
  const allCategories = [...CATEGORIES.expense, ...CATEGORIES.income];
  const usedCategories = new Set(records.map((r) => r.category));

  select.innerHTML =
    '<option value="all">全部分类</option>' +
    allCategories
      .filter((c) => usedCategories.has(c.id))
      .map((c) => `<option value="${c.id}">${c.icon} ${c.name}</option>`)
      .join("");
}

function renderCharts() {
  const expenseByCategory = aggregateByCategory("expense");
  const incomeByCategory = aggregateByCategory("income");
  const monthlyTrend = getMonthlyTrend();

  renderPieChart("expenseChart", expenseByCategory, "支出");
  renderPieChart("incomeChart", incomeByCategory, "收入");
  renderLineChart("trendChart", monthlyTrend);
}

function aggregateByCategory(type) {
  const typeRecords = records.filter((r) => r.type === type);
  const aggregated = {};

  typeRecords.forEach((r) => {
    if (!aggregated[r.category]) {
      aggregated[r.category] = 0;
    }
    aggregated[r.category] += r.amount;
  });

  return Object.entries(aggregated)
    .map(([id, amount]) => {
      const category = getCategory(type, id);
      return {
        label: category.name,
        value: amount,
        color: category.color,
        icon: category.icon,
      };
    })
    .sort((a, b) => b.value - a.value);
}

function getMonthlyTrend() {
  const trend = {};
  records.forEach((r) => {
    const month = r.date.substring(0, 7);
    if (!trend[month]) {
      trend[month] = { income: 0, expense: 0 };
    }
    if (r.type === "income") {
      trend[month].income += r.amount;
    } else {
      trend[month].expense += r.amount;
    }
  });

  const months = Object.keys(trend).sort();
  return {
    labels: months.map((m) => m.replace("-", "年") + "月"),
    income: months.map((m) => trend[m].income),
    expense: months.map((m) => trend[m].expense),
  };
}

function renderPieChart(canvasId, data, title) {
  const canvas = document.getElementById(canvasId);
  const ctx = canvas.getContext("2d");

  if (charts[canvasId]) {
    charts[canvasId].destroy();
  }

  if (data.length === 0) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#9ca3af";
    ctx.font = "14px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("暂无" + title + "数据", canvas.width / 2, canvas.height / 2);
    return;
  }

  charts[canvasId] = new Chart(ctx, {
    type: "doughnut",
    data: {
      labels: data.map((d) => d.label),
      datasets: [
        {
          data: data.map((d) => d.value),
          backgroundColor: data.map((d) => d.color),
          borderWidth: 0,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        legend: {
          position: "bottom",
          labels: {
            padding: 12,
            usePointStyle: true,
          },
        },
        tooltip: {
          callbacks: {
            label: (context) => `${context.label}: ¥${context.raw.toFixed(2)}`,
          },
        },
      },
    },
  });
}

function renderLineChart(canvasId, data) {
  const canvas = document.getElementById(canvasId);
  const ctx = canvas.getContext("2d");

  if (charts[canvasId]) {
    charts[canvasId].destroy();
  }

  if (data.labels.length === 0) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#9ca3af";
    ctx.font = "14px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("暂无趋势数据", canvas.width / 2, canvas.height / 2);
    return;
  }

  charts[canvasId] = new Chart(ctx, {
    type: "line",
    data: {
      labels: data.labels,
      datasets: [
        {
          label: "收入",
          data: data.income,
          borderColor: "#10b981",
          backgroundColor: "rgba(16, 185, 129, 0.1)",
          fill: true,
          tension: 0.4,
        },
        {
          label: "支出",
          data: data.expense,
          borderColor: "#ef4444",
          backgroundColor: "rgba(239, 68, 68, 0.1)",
          fill: true,
          tension: 0.4,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        legend: {
          position: "bottom",
          labels: {
            padding: 12,
            usePointStyle: true,
          },
        },
        tooltip: {
          callbacks: {
            label: (context) =>
              `${context.dataset.label}: ¥${context.raw.toFixed(2)}`,
          },
        },
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            callback: (value) => "¥" + value,
          },
        },
      },
    },
  });
}

function exportData() {
  const data = {
    version: "1.0",
    exportDate: new Date().toISOString(),
    records: records,
    categories: CATEGORIES,
  };

  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  const date = new Date().toISOString().split("T")[0];
  a.href = url;
  a.download = `记账本备份_${date}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);

  alert("数据导出成功！");
}

function importData(e) {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (event) => {
    try {
      const data = JSON.parse(event.target.result);

      if (!data.records || !data.categories) {
        throw new Error("无效的备份文件格式");
      }

      if (
        !confirm(
          `确定要导入备份吗？\n\n备份时间: ${data.exportDate || "未知"}\n记录数量: ${data.records.length}条\n\n注意：导入将覆盖当前所有数据！`,
        )
      ) {
        return;
      }

      records = data.records;
      CATEGORIES = data.categories;

      saveRecords();
      saveCategories();

      renderRecords();
      renderCategories();
      updateBalance();
      updateCategoryFilter();

      alert("数据导入成功！");
    } catch (err) {
      alert("导入失败: " + err.message);
    }
  };
  reader.readAsText(file);
  e.target.value = "";
}
