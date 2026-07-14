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