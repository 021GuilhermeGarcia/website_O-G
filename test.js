const selects = document.querySelectorAll(".fruit");

selects.forEach((select, index) => {
  select.addEventListener("change", () => {
    console.log("Select number:", index);
    console.log("Selected value:", select.value);
  });
});

console.log(document.getElementById("other_fruit").selectedOptions[0]);