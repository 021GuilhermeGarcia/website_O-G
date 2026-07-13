import requests

url = "https://api.eia.gov/v2/international/data/"
params = {
    "api_key": "TdKM7xeD3jRTzMCABJif9UzWCfvsyBgErTN4YaMy",
    "frequency": "monthly",
    "data[0]": "value",
    "facets[activityId][]": "1",
    "facets[productId][]": "55",
    "facets[countryRegionId][]": "ALB",
    "facets[unit][]": "TBPD",
    "sort[0][column]": "period",
    "sort[0][direction]": "desc",
    "length": 5000,
}

r = requests.get(url, params=params)
data = r.json()["response"]["data"]
for row in data:
    print(row["period"], row["value"], row["unit"])