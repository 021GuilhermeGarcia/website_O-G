class Select{
    constructor(id_container1, id_container2, id_container3, select_option_id, countryRegionID ){
        this.id_container1 = id_container1;
        this.id_container2 = id_container2;
        this.id_container3 = id_container3;
        this.countryRegionID = countryRegionID;
        this.select_option_id = select_option_id;
        this.url = "https://api.eia.gov/v2/international/data/";
        this.param = "";
        this.actual_year = new Date().getFullYear();
        this.date_beginning;
        this.date_end;
        this.list_of_info = []
        this.populate_container1_by_creating_html();
        this.populate_country();
        this.set_API_parameter();
        this.starter_async_fun = this.init().then(() => {
            this.populate_container2_by_querying_API();
            this.populate_container3_graph();
            this.put_listener_on_select();
        }); 

    }

    async init(){
        await this.define_first_and_last_date_API();
        this.populate_year();
        this.populate_month();

    }
    
    populate_container1_by_creating_html(){

        const actual_option = document.getElementById(this.select_option_id).selectedOptions[0];

        if (actual_option.value == "option1" && this.countryRegionID != null && this.countryRegionID.trim() !== ""){
            document.getElementById(this.select_option_id).value = "option2";
        }

        console.log(this.select_option_id.value);
        const month1 =
        (actual_option.value === "option1" || actual_option.value === "option2")
            ? `
                <select class="month">
                    <option>Select Month</option>
                </select>
            `
        : "";

        const month2 =
        (actual_option.value === "option1" || actual_option.value === "option2")
            ? `
                <select class="month">
                    <option>Select Month</option>
                </select>
            `
        : "";

        globalThis.month1 = month1;
        globalThis.month2 = month2;

        const comparisonHTML = `
        <div class="comparison">
            <div>
                <label>Country:</label>
                <select class="country">
                    <option>Select Country</option>
                </select>

                <select class="year" id="year1">
                    <option>Select Country</option>
                </select>

                ${month1}
            </div>

            <button id="compareBtn">Compare</button>

            <div>
                <label>Country:</label>
                <select  class="country">
                    <option>Select Country</option>
                </select>

                <select class="year" id="year2">
                    <option>Select Year</option>
                </select>

                ${month2}
            </div>

            <div id="country_to_be_added"></div>

            <button id="addBtn">Add country</button>
        </div>
        `;

        const container = document.getElementById(this.id_container1);
        container.innerHTML = comparisonHTML;

        document.getElementById("compareBtn").addEventListener("click", () => {
            console.log("button clicked");
            console.log(this.list_of_info);
            
            if (this.list_of_info.length === 0){
                alert("All fields should be fullfilled!");
                return;
            }
            
            this.make_graph_and_table("container3", this.list_of_info, this.param["facets[unit][]"]);
        });

        document.getElementById("addBtn").addEventListener("click", () => {
            this.add_country();

        })

        this.select_country = document.getElementsByClassName("country");
        this.select_year = document.getElementsByClassName("year");
        this.select_month = document.getElementsByClassName("month");
    }

    populate_country(){
        //TODO: verificar pq funciona o "d3."
        Promise.all([
            d3.json("https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json"),
            d3.json("https://cdn.jsdelivr.net/gh/lukes/ISO-3166-Countries-with-Regional-Codes@master/slim-3/slim-3.json")
            ]).then(([world, isoData]) => {
            const countries = topojson.feature(world, world.objects.countries).features;

            const isoLookup = new Map(
                isoData.map(d => [+d["country-code"], d["alpha-3"]])
            );

            const countryDetails = countries
            .map(d => ({
            name: d.properties.name || "Unknown",
            iso3: isoLookup.get(+d.id) || "Unknown"
            }))
            .sort((a, b) => a.name.localeCompare(b.name));

            countryDetails.forEach(country => {
                for (let i = 0; i < this.select_country.length; i++) {
                    const select = this.select_country[i];
                    const option = document.createElement("option");
                    option.value = country.iso3;
                    option.textContent = country.name;
                    select.appendChild(option);
                }
                if (this.select_country.length <= 0){
                    console.log("contents of countries not loaded");
                    return;
                } else if (this.countryRegionID && typeof this.countryRegionID === "string") {
                    this.select_country[0].value = this.countryRegionID;
                } else if (Array.isArray(this.countryRegionID)){
                    for(let x= 0; x<this.countryRegionID.length; x++){
                        console.log(x);
                        console.log(this.select_country[x].value);
                        this.select_country[x].value = this.countryRegionID[x];

                    }
                }
            })
    });
    }

    modify_param_var(frequency, activityID, productID, unit){
        this.param = {
            api_key: "TdKM7xeD3jRTzMCABJif9UzWCfvsyBgErTN4YaMy",
            frequency: frequency,
            "data[0]": "value",
            "facets[activityId][]": activityID,
            "facets[productId][]": productID,
            "facets[countryRegionId][]": "This one should be modified when needed, call this.param and modify it",
            "facets[unit][]": unit,
            "sort[0][column]": "period",
            "sort[0][direction]": "desc",
            length: 5000
        };
    }
    
    set_API_parameter(){
        const select = document.getElementById(this.select_option_id);
        switch (select.value){
            case 'option1':
                this.modify_param_var("monthly", "1", "53", "TBPD");
                break;
            case 'option2':
                this.modify_param_var("monthly", "1", "53", "TBPD");
                break;
            case 'option3':
                this.modify_param_var("annual", "1", "54", "TBPD");
                break;
            case 'option4':
                this.modify_param_var("annual", "2", "54", "TBPD");
                break;
            case 'option5':
                // production and consumption
                break;
            case 'option6'://
                this.modify_param_var("annual", "1", "26", "BCF");
                break;
            case 'option7':
                this.modify_param_var("annual", "2", "26", "BCF");
                break;
            case 'option8':
                // production and consumption
                break;
            case 'option9':
                this.modify_param_var("annual", "1", "7", "TST");
                break;
            case 'option10':
                this.modify_param_var("annual", "2", "7", "TST");
                break;
            case 'option11':
                // production and consumption
                break;
            case 'option12':
                this.modify_param_var("annual", "12", "2", "BKWH");
                break;
            case 'option13':
                this.modify_param_var("annual", "2", "2", "BKWH");
                break;
            case 'option14':
                // production and consumption
                break;


        }
        
    }
    
    async define_first_and_last_date_API(){
        try {
            this.param["facets[countryRegionId][]"] = "WORL";
            const param = new URLSearchParams(this.param);

            const res = await fetch(`${this.url}?${param.toString()}`);

            if (!res.ok) {
                throw new Error(`HTTP error ${res.status}`);
            }

            const json = await res.json();
            const rows = json.response.data;

            if (!rows.length) return null;

            let period;

            period = rows.reduce(
                (earliest, row) => row.period < earliest ? row.period : earliest,
                rows[0].period
            );
            this.date_beginning = period;

            period = rows.reduce(
                (latest, row) => row.period > latest ? row.period : latest,
                rows[0].period
            );
            this.date_end = period;

        } catch (err) {
            console.error(err);
            return null;
        }
    }

    async extract_quantity_and_unit_of_resources(countryIsoId, targetPeriod){


        console.log("countryIsoId: ",countryIsoId);
        console.log("targetPeriod: ",targetPeriod);
        this.param["facets[countryRegionId][]"] = countryIsoId;

        const apiKey = "TdKM7xeD3jRTzMCABJif9UzWCfvsyBgErTN4YaMy";

        const params = new URLSearchParams(this.param);

        //TODO ver se o parâmetro this.param se encaixa aqui
        const url = `https://api.eia.gov/v2/international/data/?${params}`;

        try {
            const response = await fetch(url);

            if (!response.ok) {
                throw new Error(`${response.status} ${response.statusText}`);
            }

            const result = await response.json();

            const records = result.response?.data ?? [];

            const record = records.find(r => r.period === targetPeriod);

            if (!record) {

                console.log("No record found.");
                return "No data available";
            }

            return `${record.value} ${record.unit}`;

        } catch (err) {
            console.error(err);
        }
    }

    populate_year(){

        const yearSelects = document.querySelectorAll(".year");

        yearSelects.forEach((select) => {
            select.innerHTML = "";

            const defaultOption = document.createElement("option");
            defaultOption.textContent = "Select Year";
            defaultOption.value = "";
            defaultOption.selected = true;
            defaultOption.disabled = true;
            select.appendChild(defaultOption);

            for (let year = this.actual_year; year >= Number(this.date_beginning.split("-")[0]); year--){
                const option = document.createElement("option");
                option.value = year;
                option.textContent = year;
                select.appendChild(option);
            }
        });
    

        for (const select of yearSelects) {
            select.addEventListener("change", () => {
                const selectedOption = select.options[select.selectedIndex];
                const value = Number(selectedOption.value);

                for (const option of select.options) {
                    const optionValue = Number(option.value);

                    if (optionValue > Number(this.date_end.split("-")[0]) && !option.textContent.endsWith("❌")) {
                        option.textContent += " ❌";
                    }
                }
            });
        }
        
    }
    
    populate_month(){
        if (document.querySelector(".month")){

            for (let i = 0; i < this.select_month.length; i++) {
                const select = this.select_month[i];

                select.innerHTML = "";

                const defaultOption = document.createElement("option");
                defaultOption.textContent = "Select Month";
                defaultOption.value = "";
                defaultOption.selected = true;
                defaultOption.disabled = true;
                select.appendChild(defaultOption);

                for (let j = 1; j <= 12; j++) {
                    const option = document.createElement("option");
                    option.value = j;
                    option.textContent = j;
                    select.appendChild(option);
                }
            }

            for (let index = 0; index < this.select_month.length; index++) {
                const select = this.select_month[index];

                select.addEventListener("change", () => {

                    const value = Number(select.value);
                    const selectedYear = Number(this.select_year[index].value);

                    if (
                        selectedYear === Number(this.date_end.split("-")[0]) &&
                        value > Number(this.date_end.split("-")[1])
                    ) {

                        for (const option of select.options) {
                            const optionValue = Number(option.value);

                            if (
                                optionValue > Number(this.date_end.split("-")[1]) &&
                                !option.textContent.endsWith("❌")
                            ) {
                                option.textContent += " ❌";
                            }
                        }
                    }
                });
            }

            for (let index = 0; index < this.select_country.length; index++) {
                const select = this.select_country[index];

                select.addEventListener("change", () => {
                    
                    const selectedCountry = this.select_country[index].selectedOptions[0].textContent;
                    const selectedYear = this.select_year[index].selectedOptions[0].textContent;
                    const selectedMonth = this.select_month[index].selectedOptions[0].textContent;

                    if (
                        selectedCountry != "Select" &&
                        selectedYear != "Select" &&
                        selectedMonth != "Select" &&
                        Number(selectedMonth) > this.date_end.split("-")[1]
                    ) {
                        for (const option of this.select_month[index]) {
                            const optionValue = option.value;

                            if (
                                optionValue != "Select Month" &&
                                Number(optionValue) > Number(this.date_end.split("-")[1]) &&
                                !option.textContent.endsWith("❌")
                            ) {
                                option.textContent += " ❌";
                            }
                        }
                    }
                });
            }

            for (let index = 0; index < this.select_year.length; index++) {
                const select = this.select_year[index];

                select.addEventListener("change", () => {
                    const selectedYear = Number(select.selectedOptions[0].value);
                    const endYear = Number(this.date_end.split("-")[0]);
                    const endMonth = Number(this.date_end.split("-")[1]);

                    if (selectedYear > endYear) {
                        for (const option of select.options) {
                            if (!option.textContent.endsWith("❌")) {
                                option.textContent += " ❌";
                            }
                        }

                    } else if (selectedYear === endYear) {
                        const selectedMonth = this.select_month[index].selectedOptions[0].textContent;
                        const selectedCountry = this.select_country[index].selectedOptions[0].textContent;

                        if (
                            selectedCountry !== "Select Country" &&
                            selectedMonth !== "Select Month" &&
                            Number(selectedMonth) > endMonth &&
                            !selectedMonth.endsWith("❌")
                        ) {
                            for (const option of this.select_month[index].options) {
                                const optionValue = Number(option.value);

                                if (
                                    option.value !== "Select Month" &&
                                    optionValue > endMonth &&
                                    !option.textContent.endsWith("❌")
                                ) {
                                    option.textContent += " ❌";
                                }
                            }
                        }

                    } else {
                        for (const option of this.select_month[index].options) {
                            if (option.textContent.endsWith("❌")) {
                                option.textContent = option.textContent.replace(" ❌", "");
                            }
                        }
                    }
                });
            }
        }
    }

    populate_container2_by_querying_API(populate_only_last_one = false){
        const self = this;

        let data;
        for (let x = 1; x <= this.select_country.length; x++){
            let info = document.getElementById(`info${x}`);

            if (!info) {
                info = document.createElement("div");
                info.className = "info";

                document.getElementById(self.id_container2).appendChild(info);
            }
            info.textContent = "";
        }
        this.div_info = document.getElementsByClassName("info");

        async function listener(actual_select){
            let period;

            let country = document.getElementsByClassName("country")[actual_select]
            let year = document.getElementsByClassName("year")[actual_select]
            let month = document.getElementsByClassName("month")[actual_select] 

            let notSelected;
            if (document.querySelector(".month")){
                notSelected = [country, year, month].filter(
                element => element.selectedOptions[0].textContent.startsWith("Select")  
                );
            }else{
                notSelected = [country, year].filter(
                element => element.selectedOptions[0].textContent.startsWith("Select")  
                );
            }
            

            if (notSelected.length >= 1) {
                const names = notSelected.map(element => element.className);

                data = "Not selected: " + (
                    names.length === 1
                        ? names[0]
                        : names.length === 2
                        ? names.join(" and ")
                        : names.slice(0, -1).join(", ") + ", and " + names.at(-1)
                );
            }else{
                if (document.querySelector(".month")){
                    period = `${year.value}-${String(month.value).padStart(2, "0")}`;

                } else {
                    period = year.value

                }
                data = await self.extract_quantity_and_unit_of_resources(country.value, period);
                
            }

            //console.log("This is data",data);
            self.div_info[actual_select].textContent = data
        }

        function set_listeners_for_selects(actual_select){
            self.select_country[actual_select].addEventListener("change", () => {
                listener(actual_select);
                
            })
            self.select_year[actual_select].addEventListener("change", () => {
                listener(actual_select);

            })

            if (document.querySelector(".month")){
                self.select_month[actual_select].addEventListener("change", () => {
                    listener(actual_select);
                
                })
            }
        }
        
        for (let x=0; x<this.select_country.length; x++){
            set_listeners_for_selects(x);
            
        }

    }

    populate_container3_graph(add_one_more = false){
        
        self = this;
        const observer = new MutationObserver(check_if_all_info_div_has_actual_data);

        for (let x=0; x<this.div_info.length; x++){
            observer.observe(this.div_info[x], {
            childList: true,
            subtree: true,
            characterData: true
        });
        }

        function check_if_all_info_div_has_actual_data(){
            
            let has_data;
            
            for (let x=0; x<self.div_info.length; x++){
                if (!isNaN(self.div_info[x].textContent)){
                    has_data = true;
                }else{
                    has_data = false;
                }
            }

            if (has_data === true){
                for (let x=0; x<self.div_info.length; x++){
                    const country = self.select_country[x].selectedOptions[0].textContent;
                    const quantiny = self.select_country[x].textContent.split(" ")[0];

                    if (self.list_of_info.length <= self.div_info.length){
                        self.list_of_info.push([country, Number(quantiny)]);
                    }else{
                        self.list_of_info = [];
                        for (let x=0; x<self.div_info.length; x++){
                            const country = self.select_country[x].selectedOptions[0].textContent;
                            const quantiny = self.select_country[x].textContent.split(" ")[0];
                            self.list_of_info.push([country, Number(quantiny)]);
                        }
                        
                    }

                }
            }else{
                self.list_of_info = [];

            };

            console.log(self.list_of_info);
        }
    }

    make_graph_and_table(container, list, measure = "test") {
        const ctx = document.getElementById(container);

        const existingChart = Chart.getChart(ctx);

        if (existingChart) {
            existingChart.destroy();
        }

        const labels = list.map(item => item[0]);
        const data = list.map(item => item[1]);

        const types = ['pie', 'doughnut', 'bar', 'radar'];
        let typeIndex = 0;

        let chart = new Chart(ctx, {
            type: types[typeIndex],
            data: {
                labels: labels,
                datasets: [{
                    label: 'Units',
                    data: data,
                    borderWidth: 1
                }]
            },
            options: {
                responsive: false,
                plugins: {
                    legend: {
                        position: 'bottom'
                    }
                }
            }
        });

        // Cycle chart type on click
        ctx.onclick = function() {
            typeIndex = (typeIndex + 1) % types.length;
            chart.destroy();
            chart = new Chart(ctx, {
                type: types[typeIndex],
                data: {
                    labels: labels,
                    datasets: [{
                        label: measure,
                        data: data,
                        borderWidth: 1
                    }]
                },
                options: {
                    responsive: false,
                    plugins: {
                        legend: {
                            position: 'bottom'
                        }
                    }
                }
            });
        };

        // Create the div
        const div = document.createElement('div');
        document.getElementById('table_country')?.remove();
        div.id = 'table_country';

        // Create the table
        const table = document.createElement('table');

        // Create the table header
        table.innerHTML = `
            <thead>
                <tr>
                    <th>Position</th>
                    <th>Country</th>
                    <th>Unit</th>
                </tr>
            </thead>
        `;

        // Sort the list by units
        const rows = [...list]
            .sort((a, b) => b[1] - a[1]);

        // Create the table body
        const tbody = document.createElement('tbody');

        rows.forEach((country, index) => {
            const tr = document.createElement('tr');

            tr.innerHTML = `
                <td>${index + 1}</td>
                <td>${country[0]}</td>
                <td>${country[1]}</td>
            `;

            tbody.appendChild(tr);
        });

        table.appendChild(tbody);
        div.appendChild(table);

        // Insert the div into the page
        document.body.appendChild(div);
    }

    put_listener_on_select(){

        let list_of_selected_countries = [];
        document.getElementById("mySelect").addEventListener("change", () => {
            console.log("value changed");

            if (document.getElementById("country1")){
                console.log("Entered");
                const count = document.querySelectorAll(".country").length;
                for (let x = 1; x<=count ; x++){
                    list_of_selected_countries.push(document.getElementById(`country${x}`).value);
                }
                console.log(list_of_selected_countries);

                new Select(
                "container",
                "container2",
                "container3",
                "mySelect",
                list_of_selected_countries
                )
            }else{
                new Select(
                "container",
                "container2",
                "container3",
                "mySelect",
                ""
                )
            }
        });
    }

    add_country(){
        const actual_option = document.getElementById(this.select_option_id).selectedOptions[0];

        if (actual_option.value == "option1" && this.countryRegionID != null && this.countryRegionID.trim() !== ""){
            document.getElementById(this.select_option_id).value = "option2";
        }

        console.log(this.select_option_id.value);
        const month =
        (actual_option.value === "option1" || actual_option.value === "option2")
            ? `
                <select class="month">
                    <option>Select Month</option>
                </select>
            `
        : "";

        const comparisonHTML = `
        <div class="comparison">
            <div>
                <label>Country:</label>
                <select class="country">
                    <option>Select Country</option>
                </select>

                <select class="year">
                    <option>Select Country</option>
                </select>

                ${month}
            </div>
        </div>
        `;

        const container = document.getElementById("country_to_be_added");
        container.innerHTML += comparisonHTML;
        this.populate_country();

    }
}


const s = new Select(
    "container",
    "container2",
    "container3",
    "mySelect",
    "BRA"
)