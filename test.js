/* ------------------------------------------------------------------
   1) DATA-READING FUNCTION
   Reads the [["Country", number], ...] format used by the whole
   program. Validates and normalizes it into {labels, values}.
------------------------------------------------------------------- */
function parseCountryData(rawList) {
  if (!Array.isArray(rawList) || rawList.length === 0) {
    throw new Error("Data must be a non-empty array of [country, number] pairs.");
  }
  const labels = [];
  const values = [];
  rawList.forEach((entry, i) => {
    if (!Array.isArray(entry) || entry.length !== 2) {
      throw new Error(`Entry ${i} is not a [country, number] pair.`);
    }
    const [country, value] = entry;
    if (typeof country !== "string" || !country.trim()) {
      throw new Error(`Entry ${i} has an invalid country name.`);
    }
    const num = typeof value === "number" ? value : parseFloat(value);
    if (Number.isNaN(num)) {
      throw new Error(`Entry ${i} ("${country}") has an invalid numeric value.`);
    }
    labels.push(country);
    values.push(num);
  });
  console.log(labels, values);
  return { labels, values };
  
}
 
/* ------------------------------------------------------------------
   2) COLOR PALETTE — scales to however many entries exist
------------------------------------------------------------------- */
const BASE_PALETTE = ["#D4A24C", "#5FB3A3", "#C6706B", "#7C9CBF", "#A98BC7", "#E0C15C", "#79A66B", "#C98F5E"];
 
function colorsFor(n) {
  const out = [];
  for (let i = 0; i < n; i++) {
    if (i < BASE_PALETTE.length) {
      out.push(BASE_PALETTE[i]);
    } else {
      const hue = (i * 47) % 360; // spread extra hues evenly
      out.push(`hsl(${hue}, 55%, 60%)`);
    }
  }
  return out;
}
 
/* ------------------------------------------------------------------
   3) STATE + CHART RENDERING
------------------------------------------------------------------- */
let currentData = { labels: [], values: [] };
let currentType = "pie";
let chartInstance = null;
 
const captionEl = document.getElementById("chartCaption");
const statusEl = document.getElementById("status");
const tableBody = document.getElementById("tableBody");
const canvas = document.getElementById("mainChart");
 
function buildChartConfig(type, data) {
  const colors = colorsFor(data.labels.length);
 
  if (type === "pie") {
    return {
      type: "pie",
      data: {
        labels: data.labels,
        datasets: [{ data: data.values, backgroundColor: colors, borderColor: "#0B1220", borderWidth: 2 }]
      },
      options: {
        maintainAspectRatio: false,
        plugins: {
          legend: { position: "right", labels: { color: "#EDE6D6", font: { family: "Inter" } } }
        }
      }
    };
  }
 
  if (type === "bar") {
    return {
      type: "bar",
      data: {
        labels: data.labels,
        datasets: [{
          label: "Value",
          data: data.values,
          backgroundColor: colors,
          borderRadius: 6,
          maxBarThickness: 56
        }]
      },
      options: {
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: { ticks: { color: "#8B93A5", font: { family: "IBM Plex Mono", size: 11 } }, grid: { color: "rgba(237,230,214,0.06)" } },
          y: { ticks: { color: "#8B93A5", font: { family: "IBM Plex Mono", size: 11 } }, grid: { color: "rgba(237,230,214,0.06)" } }
        }
      }
    };
  }
 
  // radar
  return {
    type: "radar",
    data: {
      labels: data.labels,
      datasets: [{
        label: "Value",
        data: data.values,
        backgroundColor: "rgba(212,162,76,0.18)",
        borderColor: "#D4A24C",
        pointBackgroundColor: colors,
        pointBorderColor: "#0B1220",
        pointRadius: 5
      }]
    },
    options: {
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        r: {
          angleLines: { color: "rgba(237,230,214,0.08)" },
          grid: { color: "rgba(237,230,214,0.08)" },
          pointLabels: { color: "#EDE6D6", font: { family: "Inter", size: 12 } },
          ticks: { color: "#8B93A5", backdropColor: "transparent" }
        }
      }
    }
  };
}
 
function renderChart(country_and_unit) {
  if (chartInstance) chartInstance.destroy();
  const config = buildChartConfig(currentType, currentData);
  chartInstance = new Chart(canvas, config);
 
  const names = { pie: "Pie", bar: "Bar", radar: "Radar" };
  captionEl.textContent = `${names[currentType]} · ${currentData.labels.length} ${currentData.labels.length === 1 ? "entry" : "entries"} plotted`;
}
 
function renderTable() {
  const colors = colorsFor(currentData.labels.length);
  tableBody.innerHTML = currentData.labels.map((label, i) => `
    <tr>
      <td>${i + 1}</td>
      <td><span class="swatch" style="background:${colors[i]}"></span>${label}</td>
      <td class="num">${currentData.values[i].toFixed(4)}</td>
    </tr>
  `).join("");
}
 
/* ------------------------------------------------------------------
   4) EVENT WIRING
------------------------------------------------------------------- */
document.querySelectorAll(".tab").forEach(tab => {
  tab.addEventListener("click", () => {
    document.querySelectorAll(".tab").forEach(t => t.classList.remove("active"));
    tab.classList.add("active");
    currentType = tab.dataset.chart;
    renderChart();
  });
});
 
document.getElementById("loadBtn").addEventListener("click", loadFromTextarea);
 
function loadFromTextarea() {
  const raw = document.getElementById("dataInput").value;
  try {
    const parsed = JSON.parse(raw);
    currentData = parseCountryData(parsed);
    statusEl.textContent = `Loaded ${currentData.labels.length} entries.`;
    statusEl.className = "ok"; 
    renderChart();
    renderTable();
  } catch (err) {
    statusEl.textContent = "Error: " + err.message;
    statusEl.className = "error";
  }
}
 

loadFromTextarea();