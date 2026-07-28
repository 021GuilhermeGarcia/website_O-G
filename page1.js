const svg = d3.select("#map");
const width = window.innerWidth, height = window.innerHeight;
const g = svg.append("g");

const projection = d3.geoNaturalEarth1()
  .scale(width / 5.8)
  .translate([width / 2, height / 2]);

const path = d3.geoPath().projection(projection);

const zoom = d3.zoom()
  .scaleExtent([1, 12])
  .on("zoom", (event) => g.attr("transform", event.transform));

svg.call(zoom);

const msgbox = document.getElementById("msgbox");
const msgtext = document.getElementById("msgtext");
let hideTimer = null;

function showMessage(name){
  msgtext.textContent = name;
  msgbox.classList.add("show");
  clearTimeout(hideTimer);
  hideTimer = setTimeout(() => msgbox.classList.remove("show"), 3000);
}

d3.json("https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json").then(world => {
  const countries = topojson.feature(world, world.objects.countries).features;

  g.selectAll("path.country")
    .data(countries)
    .join("path")
    .attr("class", "country")
    .attr("d", path)
    .on("click", function(event, d){
      g.selectAll("path.country").classed("selected", false);
      d3.select(this).classed("selected", true);
      const name = d.properties.name || "Unknown";
      showMessage(`${name} selected`);
    });
});

document.getElementById("zoomIn").onclick = () => svg.transition().call(zoom.scaleBy, 1.5);
document.getElementById("zoomOut").onclick = () => svg.transition().call(zoom.scaleBy, 1/1.5);
document.getElementById("reset").onclick = () => svg.transition().call(zoom.transform, d3.zoomIdentity);