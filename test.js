async function getEIABarrelsForPeriod(targetPeriod) {
    const apiKey = 'TdKM7xeD3jRTzMCABJif9UzWCfvsyBgErTN4YaMy';
    
    // EIA API v2 endpoint for international petroleum data
    const url = `https://api.eia.gov/v2/international/data/?api_key=${apiKey}`;

    // Your query parameters
    const params = {
        "frequency": "monthly",
        "data": [
            "value"
        ],
        "facets": {
            "activityId": [
                "1"
            ],
            "productId": [
                "53"
            ],
            "countryRegionId": [
                "WORL"
            ],
            "unit": [
                "TBPD"
            ]
        },
        "start": null,
        "end": null,
        "sort": [
            {
                "column": "period",
                "direction": "desc"
            }
        ],
        "offset": 0,
        "length": 5000
    };

    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'X-Params': JSON.stringify(params),
                'Accept': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP Error! Status: ${response.status} - ${response.statusText}`);
        }

        const result = await response.json();
        const records = result.response?.data || [];

        // Find the record for the specific period (e.g., '2026-03')
        const targetRecord = records.find(item => item.period === targetPeriod);

        if (targetRecord) {
            console.log(`Period: ${targetRecord.period}`);
            console.log(`Value: ${targetRecord.value} ${targetRecord.unit || 'TBPD'}`);
            return targetRecord.value;
        } else {
            console.log(`No data found for period: ${targetPeriod}`);
            return null;
        }
    } catch (error) {
        console.error('Error fetching data from EIA API:', error.message);
    }
}

// Execute the request for 2026-03
getEIABarrelsForPeriod('2026-03');