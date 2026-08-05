    class Select{
        constructor(id_container1, id_container2, select_option_id, countryRegionID ){
            this.id_container1 = id_container1;
            this.id_container2 = id_container2;
            this.countryRegionID = countryRegionID;
            this.select_option_id = select_option_id;
            this.url = "https://api.eia.gov/v2/international/data/";
            this.param = "";
            this.date_beginning;
            this.date_end;
            this.populate_container1_by_creating_html();
            this.populate_country();
            //TODO verificar se esse comentario abaixo 
            // this.modify_param_var();
            this.set_API_parameter();
            this.starter_async_fun = this.init().then(() => {
                this.populate_container2_by_querying_API();
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
                    <select class="month" id="month1">
                        <option>Select Month</option>
                    </select>
                `
            : "";

            const month2 =
            (actual_option.value === "option1" || actual_option.value === "option2")
                ? `
                    <select class="month" id="month2">
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
                    <select class="country" id="country1">
                        <option>Select Country</option>
                    </select>

                    <select class="year" id="year1">
                        <option>r</option>
                    </select>

                    ${month1}
                </div>

                <button>Compare</button>

                <div>
                    <label>Country:</label>
                    <select  class="country" id="country2">
                        <option>Select Country</option>
                    </select>

                    <select class="year" id="year2">
                        <option>Select Year</option>
                    </select>

                    ${month2}
                </div>
            </div>
            `;

            const container = document.getElementById(this.id_container1);
            container.innerHTML = comparisonHTML;
            container.hidden = false;

            this.select_country = document.querySelectorAll(".country");
            this.select_year = document.querySelectorAll(".year");
            this.select_month = document.querySelectorAll(".month");
        }
        //idcontainer2 is about to be made

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
                this.select_country.forEach(select => {
                    const option = document.createElement("option");
                    option.value = country.iso3;
                    option.textContent = country.name;
                    select.appendChild(option);
                });

                if (this.select_country.length > 0 && this.countryRegionID) {
                    this.select_country[0].value = this.countryRegionID;
                }
            }); 
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
                this.param["facets[countryRegionId][]"] = this.countryRegionID;
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
                console.log("this_date_beggining: ", this.date_beginning);

                period = rows.reduce(
                    (latest, row) => row.period > latest ? row.period : latest,
                    rows[0].period
                );
                this.date_end = period;
                console.log("this.date_end: ", this.date_end);

            } catch (err) {
                console.error(err);
                return null;
            }
        }

        async extract_quantity_and_unit_of_resources(countryIsoId, targetPeriod){

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
                    return null;
                }

                console.log(`${record.value} ${record.unit}`);
                return `${record.value} ${record.unit}`;

                //return record.value;
            } catch (err) {
                console.error(err);
            }
        }

        populate_year(){

            const currentYear = new Date().getFullYear();
            const yearSelects = document.querySelectorAll(".year");

            yearSelects.forEach((select) => {
                select.innerHTML = "";

                const defaultOption = document.createElement("option");
                defaultOption.textContent = "Select Year";
                defaultOption.value = "";
                defaultOption.selected = true;
                defaultOption.disabled = true;
                select.appendChild(defaultOption);


                console.log("Printing:", this.date_beginning);
                for (let year = currentYear; year >= Number(this.date_beginning.split("-")[0]); year--){
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
                    
                    /*if (value > Number(this.date_end.split("-")[0])) {
                        alert("No data available");
                        
                    }*/

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
            if (month1 != "" && month2 != ""){

                this.select_month.forEach(select => {

                select.innerHTML = "";

                const defaultOption = document.createElement("option");
                defaultOption.textContent = "Select Month";
                defaultOption.value = "";
                defaultOption.selected = true;
                defaultOption.disabled = true;
                select.appendChild(defaultOption);

                for (let i = 1; i <= 12; i++) {
                    const option = document.createElement("option");
                    option.value = i;
                    option.textContent = i;
                    select.appendChild(option);
                }
                });

                this.select_month.forEach((select, index) => {

                    select.addEventListener("change", () => {

                        const value = Number(select.value);

                        const selectedYear = Number(this.select_year[index].value);

                        console.log(selectedYear);

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
                });
            }
        }

        populate_container2_by_querying_API(populate_only_last_one = false){
            const self = this;
            async function listener(actual_select){
                let period;
                if (document.getElementById(`country${actual_select}`).value != "Select Country"){
                    console.log(document.getElementById(`year${actual_select}`));

                    const year = document.getElementById(`year${actual_select}`).value;
                    
                    if (document.getElementById(`month${actual_select}`) != null){
                        const month = document.getElementById(`month${actual_select}`).value;
                        period = `${year}-${String(month).padStart(2, "0")}`;
                        
                    } else {
                        period = year;
                    
                    }
                    console.log(period);
                }

                console.log(document.getElementById(`country${actual_select}`).value);
                console.log(period);

                const data = await self.extract_quantity_and_unit_of_resources(document.getElementById(`country${actual_select}`).value,period);

                let info = document.getElementById(`info${actual_select}`);

                if (!info) {
                    info = document.createElement("div"); // or "span"
                    info.id = `info${actual_select}`;
                    document.getElementById(self.id_container2).appendChild(info);
                }

                info.textContent = data;
            }

            function set_listeners_for_selects(actual_select){
                document.getElementById(`country${actual_select}`).addEventListener("change", () => {
                    listener(actual_select);
                    
                })
                document.getElementById(`year${actual_select}`).addEventListener("change", () => {
                    listener(actual_select);

                })

                if (month1 != ""){
                    console.log("month1 exists, therefore entered.");
                    document.getElementById(`month${actual_select}`).addEventListener("change", () => {
                        console.log("entered month");
                        listener(actual_select);
                    
                    })
                }
            }
            
            const count = document.querySelectorAll(".country").length;
            
            for (let x=1; x<=count; x++){
                set_listeners_for_selects(x);
                
            }
        }
            
    }
    

    const s = new Select(
        "container",
        "container2",
        "mySelect",
        "BRA"
    )