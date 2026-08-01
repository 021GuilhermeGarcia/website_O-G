async function getEIABarrelsForPeriod(targetPeriod) {
    const apiKey = "TdKM7xeD3jRTzMCABJif9UzWCfvsyBgErTN4YaMy";

    const params = new URLSearchParams({
        api_key: apiKey,
        frequency: "monthly",
        "data[0]": "value",
        "facets[activityId][]": "1",
        "facets[productId][]": "53",
        "facets[countryRegionId][]": "WORL",
        "facets[unit][]": "TBPD",
        "sort[0][column]": "period",
        "sort[0][direction]": "desc",
        length: "5000"
    });

    const url = `https://api.eia.gov/v2/international/data/?${params}`;

    try {
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`${response.status} ${response.statusText}`);
        }

        const result = await response.json();

        console.log(result);

        const records = result.response?.data ?? [];

        const record = records.find(r => r.period === targetPeriod);

        if (!record) {
            console.log("No record found.");
            return null;
        }

        console.log(record);

        return record.value;
    } catch (err) {
        console.error(err);
    }
}

getEIABarrelsForPeriod("2026-03");