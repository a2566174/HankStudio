const menuBtn = document.getElementById('menuBtn');
const mobileMenu = document.getElementById('mobileMenu');
const packageSelect = document.getElementById('package');
const pagesInput = document.getElementById('pages');
const pagesValue = document.getElementById('pagesValue');
const addons = document.querySelectorAll('.addon');
const timelineInputs = document.querySelectorAll('input[name="timeline"]');
const quoteTotal = document.getElementById('quoteTotal');
const quoteBreakdown = document.getElementById('quoteBreakdown');

menuBtn?.addEventListener('click', () => {
  mobileMenu.classList.toggle('show');
});

mobileMenu?.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => mobileMenu.classList.remove('show'));
});

function formatCurrency(num) {
  return `NT$ ${num.toLocaleString('zh-TW')}`;
}

function getTimelineMultiplier() {
  const checked = document.querySelector('input[name="timeline"]:checked');
  return checked ? Number(checked.value) : 1;
}

function calculateQuote() {
  const base = Number(packageSelect.value);
  const pages = Number(pagesInput.value);
  const extraPages = Math.max(0, pages - 5) * 1800;

  let addonsTotal = 0;
  const selectedAddons = [];

  addons.forEach(item => {
    if (item.checked) {
      const value = Number(item.value);
      addonsTotal += value;
      selectedAddons.push(`${item.parentElement.textContent.trim()}：${formatCurrency(value)}`);
    }
  });

  const subtotal = base + extraPages + addonsTotal;
  const total = Math.round(subtotal * getTimelineMultiplier());

  pagesValue.textContent = pages;
  quoteTotal.textContent = formatCurrency(total);

  const breakdown = [
    `基礎方案：${formatCurrency(base)}`,
    `頁數調整：${formatCurrency(extraPages)}`,
    `功能加購：${formatCurrency(addonsTotal)}`,
    `交期係數：x${getTimelineMultiplier()}`,
  ];

  if (selectedAddons.length) {
    breakdown.push('<br><strong>已選加購：</strong>');
    breakdown.push(...selectedAddons);
  }

  quoteBreakdown.innerHTML = breakdown.join('<br>');
}

[packageSelect, pagesInput, ...addons, ...timelineInputs].forEach(el => {
  el.addEventListener('input', calculateQuote);
  el.addEventListener('change', calculateQuote);
});

calculateQuote();



// APP pricing extension
(function () {
  const typeSelect = document.querySelector('select[name="projectType"], #projectType, .quote-form select');
  const pageSelect = document.querySelector('select[name="pageCount"], #pageCount');
  const checkboxes = document.querySelectorAll('input[type="checkbox"]');
  const resultPrice = document.querySelector('#estimatedPrice, .estimated-price, [data-price-result]');
  const resultText = document.querySelector('#quoteSummary, .quote-summary, [data-quote-summary]');

  const basePriceMap = {
    "onepage": 12800,
    "one-page": 12800,
    "business": 36800,
    "business-site": 36800,
    "custom-site": 58000,
    "app-design": 8800,
    "app-dev": 28000,
    "custom-app": 65000
  };

  const addonPriceMap = {
    "seo": 3000,
    "form": 2000,
    "admin": 8000,
    "api": 6000,
    "uiux": 5000,
    "push": 5000,
    "login": 6000,
    "map": 7000
  };

  function fmt(n) {
    return "NT$ " + Number(n).toLocaleString("zh-TW");
  }

  function calculateQuote() {
    if (!typeSelect || !resultPrice) return;
    const type = typeSelect.value;
    let total = basePriceMap[type] || 0;

    if (pageSelect && ["onepage","one-page","business","business-site","custom-site"].includes(type)) {
      const pages = parseInt(pageSelect.value || "1", 10);
      if (type === "business" || type === "business-site") {
        if (pages > 5) total += (pages - 5) * 1800;
      }
      if (type === "custom-site") {
        if (pages > 5) total += (pages - 5) * 2200;
      }
    }

    const chosen = [];
    checkboxes.forEach(cb => {
      if (cb.checked) {
        const v = cb.value;
        if (addonPriceMap[v]) total += addonPriceMap[v];
        const labelText = cb.parentElement ? cb.parentElement.textContent.trim() : v;
        chosen.push(labelText);
      }
    });

    resultPrice.textContent = fmt(total);
    if (resultText) {
      const typeLabel = typeSelect.options[typeSelect.selectedIndex]?.textContent || "";
      resultText.textContent = chosen.length
        ? `目前估算為 ${typeLabel}，加上 ${chosen.join("、")}。`
        : `目前估算為 ${typeLabel} 基本方案。`;
    }
  }

  if (typeSelect) typeSelect.addEventListener("change", calculateQuote);
  if (pageSelect) pageSelect.addEventListener("change", calculateQuote);
  checkboxes.forEach(cb => cb.addEventListener("change", calculateQuote));
  calculateQuote();
})();
