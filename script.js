const accounts = [
  { name: "Meridian Studio", email: "hello@meridian.studio", plan: "Scale", mrr: 1280, renewal: "2026-12-18", status: "Active", initials: "MS", color: "#e7eee1", ink: "#53704a" },
  { name: "Orchid Labs", email: "team@orchidlabs.io", plan: "Growth", mrr: 840, renewal: "2026-11-28", status: "Active", initials: "OL", color: "#eee6f3", ink: "#765b8a" },
  { name: "Common Ground", email: "ops@commonground.co", plan: "Scale", mrr: 1650, renewal: "2026-11-24", status: "Past due", initials: "CG", color: "#f4e7db", ink: "#9b6847" },
  { name: "Pine & Palm", email: "studio@pinepalm.design", plan: "Starter", mrr: 320, renewal: "2026-11-21", status: "Active", initials: "PP", color: "#deeeea", ink: "#47796b" },
  { name: "Civic Works", email: "finance@civicworks.org", plan: "Growth", mrr: 760, renewal: "2026-11-19", status: "Trial", initials: "CW", color: "#f1ebd7", ink: "#8a7740" },
  { name: "Fieldwork Health", email: "care@fieldwork.health", plan: "Scale", mrr: 2240, renewal: "2026-11-16", status: "Active", initials: "FH", color: "#e3eaf2", ink: "#54718f" },
  { name: "Little Rituals", email: "hi@littlerituals.com", plan: "Starter", mrr: 410, renewal: "2026-11-13", status: "Paused", initials: "LR", color: "#f2e2df", ink: "#9b6258" },
  { name: "Good Company", email: "hello@goodcompany.work", plan: "Growth", mrr: 920, renewal: "2026-11-09", status: "Active", initials: "GC", color: "#e5e8d9", ink: "#697249" }
];

const rowsElement = document.querySelector("#account-rows");
const searchInput = document.querySelector("#account-search");
const pageSizeSelect = document.querySelector("#page-size");
const emptyState = document.querySelector("#empty-state");
const tableElement = document.querySelector(".account-table");
let activeStatus = "all";
let searchTerm = "";
let currentPage = 1;
let pageSize = Number(pageSizeSelect.value);
let sortKey = "renewal";
let sortDirection = "asc";

const formatMoney = (amount) => `$${amount.toLocaleString("en-US")}`;
const formatDate = (date) => new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" }).format(new Date(`${date}T00:00:00Z`));
const statusClass = (status) => `status-${status.toLowerCase().replaceAll(" ", "-")}`;

function visibleAccounts() {
  const normalizedQuery = searchTerm.trim().toLowerCase();
  return accounts
    .filter((account) => activeStatus === "all" || account.status === activeStatus)
    .filter((account) => !normalizedQuery || `${account.name} ${account.email} ${account.plan}`.toLowerCase().includes(normalizedQuery))
    .sort((first, second) => {
      const firstValue = first[sortKey];
      const secondValue = second[sortKey];
      const comparison = typeof firstValue === "number" ? firstValue - secondValue : String(firstValue).localeCompare(String(secondValue));
      return comparison * (sortDirection === "asc" ? 1 : -1);
    });
}

function renderRows(results) {
  const start = (currentPage - 1) * pageSize;
  const pageAccounts = results.slice(start, start + pageSize);
  rowsElement.innerHTML = pageAccounts.map((account) => `
    <tr>
      <td data-label="Account"><div class="account-cell"><span class="company-mark" style="background:${account.color};color:${account.ink}">${account.initials}</span><span><span class="company-name d-block">${escapeHtml(account.name)}</span><span class="company-email d-block">${escapeHtml(account.email)}</span></span></div></td>
      <td data-label="Plan"><span><span class="plan-name d-block">${escapeHtml(account.plan)}</span><span class="plan-caption d-block">${account.plan === "Scale" ? "Annual billing" : "Monthly billing"}</span></span></td>
      <td data-label="Monthly spend"><span class="money-cell">${formatMoney(account.mrr)}<span class="text-muted"> / mo</span></span></td>
      <td data-label="Next invoice"><span class="date-cell">${formatDate(account.renewal)}</span></td>
      <td data-label="Status"><span class="status-badge ${statusClass(account.status)}">${escapeHtml(account.status)}</span></td>
    </tr>`).join("");

  tableElement.classList.toggle("d-none", results.length === 0);
  emptyState.classList.toggle("d-none", results.length !== 0);
  document.querySelector("#reset-search").classList.toggle("d-none", !searchTerm);

  const end = Math.min(start + pageSize, results.length);
  document.querySelector("#result-count").innerHTML = results.length
    ? `Showing <strong>${start + 1}–${end}</strong> of <strong>${results.length}</strong> accounts`
    : "Showing <strong>0</strong> accounts";
  const pageCount = Math.max(1, Math.ceil(results.length / pageSize));
  document.querySelector("#page-indicator").textContent = `Page ${Math.min(currentPage, pageCount)} of ${pageCount}`;
  document.querySelector("#previous-page").disabled = currentPage <= 1;
  document.querySelector("#next-page").disabled = currentPage >= pageCount;
}

function updateSummary() {
  const activeAccounts = accounts.filter((account) => account.status === "Active");
  const sortedRenewals = activeAccounts.toSorted((first, second) => first.renewal.localeCompare(second.renewal));
  document.querySelector("#total-count").textContent = accounts.length;
  document.querySelector("#nav-account-count").textContent = accounts.length;
  document.querySelector("#active-count").textContent = activeAccounts.length;
  document.querySelector("#revenue-total").textContent = formatMoney(activeAccounts.reduce((sum, account) => sum + account.mrr, 0));
  document.querySelector("#next-renewal").textContent = sortedRenewals.length ? formatDate(sortedRenewals[0].renewal).replace(", 2026", "") : "—";
  document.querySelector("#next-renewal-name").textContent = sortedRenewals[0]?.name ?? "No active renewals";
  document.querySelector("#count-all").textContent = accounts.length;
  document.querySelector("#count-active").textContent = activeAccounts.length;
  document.querySelector("#count-trial").textContent = accounts.filter((account) => account.status === "Trial").length;
  document.querySelector("#count-past-due").textContent = accounts.filter((account) => account.status === "Past due").length;
  document.querySelector("#count-paused").textContent = accounts.filter((account) => account.status === "Paused").length;
}

function render() {
  const results = visibleAccounts();
  const pageCount = Math.max(1, Math.ceil(results.length / pageSize));
  currentPage = Math.min(currentPage, pageCount);
  renderRows(results);
  updateSummary();
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[character]);
}

document.querySelectorAll(".filter-tab").forEach((button) => {
  button.addEventListener("click", () => {
    activeStatus = button.dataset.status;
    currentPage = 1;
    document.querySelectorAll(".filter-tab").forEach((tab) => {
      const isActive = tab === button;
      tab.classList.toggle("active", isActive);
      tab.setAttribute("aria-pressed", String(isActive));
    });
    render();
  });
});

searchInput.addEventListener("input", () => {
  searchTerm = searchInput.value;
  currentPage = 1;
  render();
});

document.addEventListener("keydown", (event) => {
  if (event.key === "/" && document.activeElement !== searchInput && !["INPUT", "TEXTAREA"].includes(document.activeElement.tagName)) {
    event.preventDefault();
    searchInput.focus();
  }
});

document.querySelectorAll(".sort-button").forEach((button) => {
  button.addEventListener("click", () => {
    if (sortKey === button.dataset.sort) sortDirection = sortDirection === "asc" ? "desc" : "asc";
    else { sortKey = button.dataset.sort; sortDirection = "asc"; }
    document.querySelectorAll(".sort-button").forEach((sortButton) => {
      const selected = sortButton === button;
      sortButton.setAttribute("aria-pressed", String(selected));
      sortButton.querySelector("i").className = selected ? `bi bi-arrow-${sortDirection === "asc" ? "up" : "down"}` : "bi bi-arrow-down-up";
    });
    currentPage = 1;
    render();
  });
});

pageSizeSelect.addEventListener("change", () => {
  pageSize = Number(pageSizeSelect.value);
  currentPage = 1;
  render();
});
document.querySelector("#previous-page").addEventListener("click", () => { currentPage--; render(); });
document.querySelector("#next-page").addEventListener("click", () => { currentPage++; render(); });
document.querySelector("#reset-search").addEventListener("click", () => {
  searchInput.value = "";
  searchTerm = "";
  render();
  searchInput.focus();
});

document.querySelector("#export-button").addEventListener("click", () => {
  const results = visibleAccounts();
  const fields = ["name", "email", "plan", "mrr", "renewal", "status"];
  const csv = [fields.join(","), ...results.map((account) => fields.map((field) => `"${String(account[field]).replaceAll('"', '""')}"`).join(","))].join("\r\n");
  const download = document.createElement("a");
  download.href = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
  download.download = "fieldnotes-accounts.csv";
  download.click();
  URL.revokeObjectURL(download.href);
});

document.querySelector("#add-account-form").addEventListener("submit", (event) => {
  event.preventDefault();
  const formData = new FormData(event.currentTarget);
  const name = String(formData.get("name")).trim();
  const colors = [["#e7eee1", "#53704a"], ["#eee6f3", "#765b8a"], ["#deeeea", "#47796b"], ["#f1ebd7", "#8a7740"]];
  const [color, ink] = colors[accounts.length % colors.length];
  accounts.unshift({
    name,
    email: String(formData.get("email")).trim(),
    plan: String(formData.get("plan")),
    mrr: Number(formData.get("mrr")),
    renewal: String(formData.get("renewal")),
    status: String(formData.get("status")),
    initials: name.split(/\s+/).slice(0, 2).map((part) => part[0]).join("").toUpperCase(),
    color,
    ink
  });
  event.currentTarget.reset();
  document.querySelector("#new-mrr").value = "250";
  bootstrap.Modal.getInstance(document.querySelector("#addAccountModal")).hide();
  activeStatus = "all";
  searchTerm = "";
  searchInput.value = "";
  currentPage = 1;
  document.querySelectorAll(".filter-tab").forEach((tab) => {
    const isActive = tab.dataset.status === "all";
    tab.classList.toggle("active", isActive);
    tab.setAttribute("aria-pressed", String(isActive));
  });
  render();
});

render();