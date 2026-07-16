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

//This is data of entire data
/*
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
*/

// This is data with earliest year
fetch(`${url}?${params.toString()}`)
  .then((res) => {
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    return res.json();
  })
  .then((json) => {
    const rows = json.response.data;
    const earliestPeriod = rows.reduce(
    (earliest, row) => (row.period < earliest ? row.period : earliest),
    rows[0].period
    );

    console.log("Earliest period:", earliestPeriod);
  })
  .catch((err) => console.error("EIA API error:", err));

//Now this is only the earliest date

