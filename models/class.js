//TODO: .addEventListener are actually duplicating, find a way to not duplicate, that should be the last thing to do on this project
//TODO: verificar pq a demora pra chamada de API e desenvolver solução para rapidez do processo
class Select{
    constructor(id_container1, id_container2, id_container3, select_option_id, countryRegionID ){
        this.first_time_calling = true;
        this.id_container1 = id_container1;
        this.id_container2 = id_container2;
        this.id_container3 = id_container3;
        this.countryRegionID = countryRegionID;
        this.select_option_id = select_option_id;
        this.url = "https://api.eia.gov/v2/international/data/";
        this.param = "";
        this.tooltip = "";
        this.actual_year = new Date().getFullYear();
        this.date_beginning;
        this.date_end;
        this.list_of_info = [];
        this.production_data = null;
        this.consumption_data = null;
        this.wipe_elements_from_previous_select_class_call();
        this.populate_container1_by_creating_html();
        this.populate_country();
        this.set_API_parameter();
        this.starter_async_fun = this.init().then(() => {
            this.populate_container2_by_querying_API();
            this.put_listener_on_select();
        }); 

    }

    wipe_elements_from_previous_select_class_call(){

        const info_class = document.getElementsByClassName("info");
        if (info_class.length >= 1){
            for (let x = 0; x < info_class.length; x++){

                if (info_class[x].textContent != ""){
                    info_class[x].textContent = "";
                }
            }
        }

        const existingChart = Chart.getChart(document.getElementById("container3"));

        if (existingChart) {
            existingChart.destroy();
        }

        document.getElementById('table_country')?.remove()
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

        const month =
        (actual_option.value === "option1" || actual_option.value === "option2")
            ? `
                <select class="month">
                    <option>Select Month</option>
                </select>
            `
        : "";

        const only_one_country_and_one_year = ["option5", "option8", "option11", "option14"]
        .includes(actual_option.value);

        const comparisonHTML = !only_one_country_and_one_year ? `
        <div class="comparison">
            <div>
                <label class="label_country">Country:</label>
                <select class="country">
                    <option>Select Country</option>
                </select>

                <select class="year" id="year1">
                    <option>Select Country</option>
                </select>

                ${month}
            </div>

            <div>
                <label class="label_country">Country:</label>
                <select  class="country">
                    <option>Select Country</option>
                </select>

                <select class="year" id="year2">
                    <option>Select Year</option>
                </select>

                ${month}
            </div>

            <div id="country_to_be_added"></div>

            <button id="addBtn">Add country</button>
            <button id="removeBtn">Remove</button>
            <button id="compareBtn">Compare</button>
            <span id="info">ⓘ</span>
            
        </div>
        ` :`
        <div class="comparison">
        <div>
            <label>Country:</label>
            <select class="country">
                <option>Select Country</option>
            </select>

            <select class="year" id="year1">
                <option>Select Country</option>
            </select>

            <button id="compareBtn">Compare</button>
            <span id="info">ⓘ</span>
            
        </div>`;

        const container = document.getElementById(this.id_container1);
        container.innerHTML = comparisonHTML;

        document.getElementById("compareBtn")?.addEventListener("click", () => {
            
            if (this.list_of_info.length === 0){
                alert("At least two countries required with all fields fulfilled!");
                return;
            }
            
            const unit_to_be_selected = this.production_data ? this.production_data["facets[unit][]"] : this.param["facets[unit][]"];
            this.make_graph_and_table("container3", this.list_of_info, unit_to_be_selected);
        });

        document.getElementById("addBtn")?.addEventListener("click", () => {
            this.add_country();

        })

        document.getElementById("removeBtn")?.addEventListener("click", () => {
            if (this.select_country.length > 2){

                if (this.list_of_info.length === this.select_country.length){
                    this.list_of_info.pop();

                }

                this.select_country[this.select_country.length - 1]?.remove();
                this.select_year[this.select_year.length - 1]?.remove();
                this.select_month[this.select_month.length - 1]?.remove();
                this.div_info[this.div_info.length -1]?.remove();
                this.lable_country[this.lable_country.length -1]?.remove();

            }

        })

        this.hover_mouse_info_icon("info");

        document.getElementById("info")?.addEventListener("mouseenter", () => {
            this.tooltip.style.display = "inline";
        });

        document.getElementById("info")?.addEventListener("mouseleave", () => {
            this.tooltip.style.display = "none";
        });

        document.getElementById("info")?.addEventListener("mousemove", (event) => {
            this.tooltip.style.left = event.clientX + 10 + "px";
            this.tooltip.style.top = event.clientY + 10 + "px";
        });
        
        this.info
        this.select_country = document.getElementsByClassName("country");
        this.select_year = document.getElementsByClassName("year");
        this.select_month = document.getElementsByClassName("month");
        this.lable_country = document.getElementsByClassName("label_country");
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

            for (let i = 0; i < this.select_country.length; i++){
                const select = this.select_country[i];

                if (select.options.length > 1) continue
                
                for (let c = 0; c < countryDetails.length; c++){
                    const option = document.createElement("option");
                    option.value = countryDetails[c].iso3;
                    option.textContent = countryDetails[c].name;
                    select.appendChild(option);

                }
            }

            if (this.countryRegionID && typeof this.countryRegionID === "string"){
                this.select_country[0].value = this.countryRegionID;
            } else if(Array.isArray(this.countryRegionID)){
                for(let x= 0; x<this.countryRegionID.length; x++){
                    
                    this.select_country[x].value = this.countryRegionID[x];

                } 
            }
        });
    }

    modify_param_var(frequency, activityID, productID, unit, desire_return=false){
        const param = {
        api_key: "TdKM7xeD3jRTzMCABJif9UzWCfvsyBgErTN4YaMy",
        frequency: frequency,
        "data[0]": "value",
        "facets[activityId][]": activityID,
        "facets[productId][]": productID,
        "facets[countryRegionId][]": "This one should be modified when needed",
        "facets[unit][]": unit,
        "sort[0][column]": "period",
        "sort[0][direction]": "desc",
        length: 5000
        };

        if (desire_return) {
            return param;
        }

        this.param = param;
        
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
                this.production_data = this.modify_param_var("annual", "1", "54", "TBPD", true);;
                this.consumption_data = this.modify_param_var("annual", "2", "54", "TBPD", true);;
                // production and consumption
                break;
            case 'option6'://
                this.modify_param_var("annual", "1", "26", "BCF");
                break;
            case 'option7':
                this.modify_param_var("annual", "2", "26", "BCF");
                break;
            case 'option8':
                this.production_data = this.modify_param_var("annual", "1", "26", "BCF",true);
                this.consumption_data = this.modify_param_var("annual", "2", "26", "BCF",true);
                // production and consumption
                break;
            case 'option9':
                this.modify_param_var("annual", "1", "7", "TST");
                break;
            case 'option10':
                this.modify_param_var("annual", "2", "7", "TST");
                break;
            case 'option11':
                this.production_data = this.modify_param_var("annual", "1", "7", "TST",true);
                this.consumption_data = this.modify_param_var("annual", "2", "7", "TST",true);
                // production and consumption
                break;
            case 'option12':
                this.modify_param_var("annual", "12", "2", "BKWH");
                break;
            case 'option13':
                this.modify_param_var("annual", "2", "2", "BKWH");
                break;
            case 'option14':
                console.log("Option14 entered");
                this.production_data = this.modify_param_var("annual", "12", "2", "BKWH",true);
                this.consumption_data = this.modify_param_var("annual", "2", "2", "BKWH",true);
                // production and consumption
                break;
        }
        
    }
    
    async define_first_and_last_date_API(){
        self = this;
        async function define_first_and_last_date(standard_param = self.param){
            standard_param["facets[countryRegionId][]"] = "WORL";
            const param = new URLSearchParams(standard_param);

            const res = await fetch(`${self.url}?${param.toString()}`);

            if (!res.ok) {
                throw new Error(`HTTP error ${res.status}`);
            }

            const json = await res.json();
            const rows = json.response.data;

            if (!rows.length) return null;

            let period;

            const date_beginning = rows.reduce(
                (earliest, row) => row.period < earliest ? row.period : earliest,
                rows[0].period
            );
            self.date_beginning = date_beginning;

            const date_end = rows.reduce(
                (latest, row) => row.period > latest ? row.period : latest,
                rows[0].period
            );
            self.date_end = date_end;

            if (standard_param != self.param){
                return [self.date_beginning, self.date_end];

            }
        }

        try {
            if (!this.production_data){
                await define_first_and_last_date();

            }else{
                
                const period_date_production = await define_first_and_last_date(this.production_data);
                const period_date_consumption = await define_first_and_last_date(this.consumption_data);

                this.date_beginning = period_date_production[0] > period_date_consumption[0] ? period_date_production[0] : period_date_consumption[0];
                this.date_end = period_date_production[1] < period_date_consumption[1] ? period_date_production[1] : period_date_consumption[1];

                return;
            }
            

        } catch (err) {
            console.error(err);
            return null;
        }
    }

    async extract_quantity_and_unit_of_resources(countryIsoId, targetPeriod, param = this.param){

        param["facets[countryRegionId][]"] = countryIsoId;

        const apiKey = "TdKM7xeD3jRTzMCABJif9UzWCfvsyBgErTN4YaMy";

        const params = new URLSearchParams(param);

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
  
        for (let i = 0; i < this.select_year.length; i++) {
            const select = this.select_year[i];

            if (select.options.length > 1){
                continue
            }

            select.innerHTML = "";

            const defaultOption = document.createElement("option");
            defaultOption.textContent = "Select Year";
            defaultOption.value = "";
            defaultOption.selected = true;
            defaultOption.disabled = true;
            select.appendChild(defaultOption);

            for (let year = this.actual_year; year >= Number(this.date_beginning.split("-")[0]); year--) {
                const option = document.createElement("option");
                option.value = year;
                option.textContent = year;
                select.appendChild(option);
            }
        }

        for (let i = 0; i < this.select_year.length; i++) {
            const select = this.select_year[i];

            select.addEventListener("change", () => {
                const selectedOption = select.options[select.selectedIndex];
                const value = Number(selectedOption.value);

                for (let j = 0; j < select.options.length; j++) {
                    const option = select.options[j];
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

                if(select.options.length > 1){
                    continue;
                }

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

                        if (
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

    populate_container2_by_querying_API(){
        const self = this;

        let data;
        let info;

        const check_if_actual_option_is_production_and_consumption = this.production_data ? 2 : this.select_country.length
        for (let x = 0; x < check_if_actual_option_is_production_and_consumption; x++){
            if (!document.getElementsByClassName("info")[x]){
                info = document.createElement("div");
                info.className = "info";

                document.getElementById(self.id_container2).appendChild(info);
            }
               
        }
        this.div_info = document.getElementsByClassName("info");

        async function listener(actual_select){
            let period;
            let data_production;
            let data_consumption;


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

                self.div_info[actual_select].textContent = data;
                if (self.list_of_info.length ===0){
                    // nothing
                }else if(self.list_of_info.length === 1){
                    self.list_of_info.splice(actual_select);
                }else{
                    self.list_of_info.splice(actual_select, actual_select);
                }
                

            }else{
                if (document.querySelector(".month")){
                    period = `${year.value}-${String(month.value).padStart(2, "0")}`;

                } else {
                    period = year.value

                }
                
                if (!self.production_data){
                    // TODO: Implementar uma tela de loading
                    data = await self.extract_quantity_and_unit_of_resources(country.value, period);
                    self.div_info[actual_select].textContent = data;
                    const country_ = country.selectedOptions[0].textContent;
                    const quantity_ = Number(data.split(" ")[0]);

                    if (self.list_of_info[actual_select] != undefined){
                        
                        if (!Number.isNaN(quantity_)){
                            self.list_of_info[actual_select] = [country_, quantity_];
                        }else{
                            console.log("Quantity is actually Nan")
                            self.list_of_info[actual_select] = [];
                        }

                    }else{
                        if (!Number.isNaN(quantity_)){
                            self.list_of_info.push([country_, quantity_]);
                        }

                    }
                }else{
                    //TODO: implementar uma tela de loading

                    console.log("Entered here");
                    data_production = await self.extract_quantity_and_unit_of_resources(country.value, period, self.production_data);
                    data_consumption = await self.extract_quantity_and_unit_of_resources(country.value, period, self.consumption_data);

                    self.div_info[0].textContent = data_production;
                    self.div_info[1].textContent = data_consumption;

                    console.log("data_production: ", data_production);
                    console.log("data_consumption ", data_consumption);

                    if (!Number.isNaN(data_production) && !Number.isNaN(data_consumption)){
                        if (self.list_of_info[0] != undefined){
                        self.list_of_info[0] = ["production", Number(data_production.split(" ")[0])];
                        }else{  
                            self.list_of_info.push(["production", Number(data_production.split(" ")[0])]);
                        }

                        if (self.list_of_info[1] != undefined){
                            self.list_of_info[1] = ["consumption", Number(data_consumption.split(" ")[0])];
                        }else{  
                            self.list_of_info.push(["consumption", Number(data_consumption.split(" ")[0])]);
                        }
                    }
                    
                    console.log(self.list_of_info);
                }   
            }

        }

        function set_listeners_for_selects(actual_select){
            self.select_country[actual_select]?.addEventListener("change", () => {
                listener(actual_select);
                
            })
            self.select_year[actual_select]?.addEventListener("change", () => {
                listener(actual_select);

            })

            if (document.querySelector(".month")){
                self.select_month[actual_select]?.addEventListener("change", () => {
                    listener(actual_select);
                
                })
            }
        }
        
        for (let x=0; x<this.select_country.length; x++){
            set_listeners_for_selects(x);
            
        }

    }  

    make_graph_and_table(container, list, measure) {
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

        const header = this.production_data ? "" : "Country";
        // Create the table header
        table.innerHTML = `
            <thead>
                <tr>
                    <th>Position</th>
                    <th>${header}</th>
                    <th>${measure}</th>
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

            if (document.getElementById("country1")){
                const count = document.querySelectorAll(".country").length;
                for (let x = 1; x<=count ; x++){
                    list_of_selected_countries.push(document.getElementById(`country${x}`).value);
                }

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

        const month =
        (document.querySelector(".month"))
            ? `
                <select class="month">
                    <option>Select Month</option>
                </select>
            `
        : "";

        const comparisonHTML = `
        <div class="comparison">
            <div>
                <label class="label_country">Country:</label>
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
        container.insertAdjacentHTML('beforeend', comparisonHTML);
        this.populate_country();
        this.populate_year();
        if (document.querySelector(".month")){
            this.populate_month();
        }
        this.populate_container2_by_querying_API();

    }

    hover_mouse_info_icon(info_id){
        const info = document.getElementById(info_id);
        info.style.cursor = "default";

        this.tooltip = document.createElement("span");

        this.tooltip.style.position = "fixed";
        this.tooltip.style.pointerEvents = "none";
        this.tooltip.style.display = "none";

        const question = document.createElement("span");
        question.textContent = "  ?";

        const text = document.createElement("span");
        text.textContent =
            "\nThe totalitarian info of these countries' data are defined through " +
            "the website 'eia.gov'.\n" +
            "To check them, go to 'Geography > International > Data'.";

        text.style.whiteSpace = "pre-line";
        this.tooltip.appendChild(question);
        this.tooltip.appendChild(text);

        document.body.appendChild(this.tooltip);
    }

}


const s = new Select(
    "container",
    "container2",
    "container3",
    "mySelect",
    "BRA"
)