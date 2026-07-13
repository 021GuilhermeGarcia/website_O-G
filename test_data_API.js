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
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    return res.json();
  })
  .then((json) => {
    const rows = json.response.data;
    rows.forEach((row) => {
      console.log(row.period, row.value, row.unit);
    });
  })
  .catch((err) => console.error("EIA API error:", err));