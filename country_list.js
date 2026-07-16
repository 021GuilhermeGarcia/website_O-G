import { getNames } from "https://cdn.jsdelivr.net/npm/country-list/+esm";

const selects = document.querySelectorAll(".country");

selects.forEach(select => {
  getNames()
    .sort()
    .forEach(country => {
      const option = document.createElement("option");
      option.value = country;
      option.textContent = country;
      select.appendChild(option);
    });
});

const value1 = 200;
const value2 = 50;

const labels = ["Value 1", "Value 2"];

const data = {
    labels: labels,
    datasets: [{
        label: "Values",
        data: [value1, value2],
        backgroundColor: [
            "#4CAF50",
            "#2196F3"
        ],
        borderColor: "#ffffff",
        borderWidth: 2
    }]
};

const chartTypes = [
    "pie",
    "bar",
    "doughnut"
];

let current = 0;

const ctx = document.getElementById("myChart");

let chart = new Chart(ctx,{
    type: chartTypes[current],
    data: data,
    options:{
        responsive:true,
        animation:{
            duration:700
        },
        plugins:{
            legend:{
                position:"bottom"
            }
        }
    }
});

ctx.addEventListener("click",function(){

    current++;

    if(current >= chartTypes.length)
        current = 0;

    chart.destroy();

    chart = new Chart(ctx,{
        type: chartTypes[current],
        data:data,
        options:{
            responsive:true,
            animation:{
                duration:700
            },
            plugins:{
                legend:{
                    position:"bottom"
                }
            }
        }
    });

});

const url = "https://api.eia.gov/v2/international/data/";

const params = new URLSearchParams({
  api_key: "TdKM7xeD3jRTzMCABJif9UzWCfvsyBgErTN4YaMy",
  frequency: "monthly",
  "data[0]": "value",
  "facets[activityId][]": "1",
  "facets[productId][]": "55",
  "facets[countryRegionId][]": "ALB",
  "facets[unit][]": "TBPD",
  "sort[0][column]": "period",
  "sort[0][direction]": "desc",
  length: 5000,
});

fetch(`${url}?${params.toString()}`)
  .then((res) => {
    if (!res.ok) {
      throw new Error(`HTTP error ${res.status}`);
    }
    return res.json();
  })
  .then((json) => {
    const rows = json.response.data;

    // Print all data (optional)
    rows.forEach((row) => {
      console.log(row.period, row.value, row.unit);
    });

    // Find earliest period
    const earliestPeriod = rows.reduce(
      (earliest, row) =>
        row.period < earliest ? row.period : earliest,
      rows[0].period
    );

    console.log("Earliest period:", earliestPeriod);

    // Extract earliest year
    const earliestYear = parseInt(earliestPeriod.split("-")[0], 10);

    // Current year
    const currentYear = new Date().getFullYear();

    // Fill every year dropdown
    const yearSelects = document.querySelectorAll(".year");

    yearSelects.forEach((select) => {
      select.innerHTML = "";

      // Default option
      const defaultOption = document.createElement("option");
      defaultOption.textContent = "Select Year";
      defaultOption.value = "";
      defaultOption.selected = true;
      defaultOption.disabled = true;
      select.appendChild(defaultOption);

      // Years
      for (let year = currentYear; year >= earliestYear; year--) {
        const option = document.createElement("option");
        option.value = year;
        option.textContent = year;
        select.appendChild(option);
        }
    });
  })
  .catch((err) => {
    console.error("EIA API error:", err);
  });

const monthSelects = document.querySelectorAll(".month");

monthSelects.forEach((select) => {
  

  // Months 1-12
  for (let month = 1; month <= 12; month++) {
    const option = document.createElement("option");
    option.value = month;
    option.textContent = month;
    select.appendChild(option);
  }
});