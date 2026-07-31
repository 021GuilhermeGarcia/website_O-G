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
            this.modify_param_var();
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

        modify_param_var(frequency, activityID, productID, countryRegionId, unit){
            this.param = {
                api_key: "TdKM7xeD3jRTzMCABJif9UzWCfvsyBgErTN4YaMy",
                frequency: frequency,
                "data[0]": "value",
                "facets[activityId][]": activityID,
                "facets[productId][]": productID,
                "facets[countryRegionId][]": countryRegionId,
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
                    this.modify_param_var("monthly", "1", "53",this.countryRegionID,"TBPD");
                    break;
                case 'option2':
                    this.modify_param_var("monthly", "1", "53",this.countryRegionID,"TBPD");
                    break;
                case 'option3':
                    this.modify_param_var("annual", "2", "5",this.countryRegionID,"TBPD");
                    break;
                case 'option5':
                    this.modify_param_var("annual", "1", "26",this.countryRegionID, "BCF");
                    break;
                case 'option6':
                    this.modify_param_var("annual", "2", "26",this.countryRegionID,"BCF");
                    break;
                case 'option8':
                    this.modify_param_var("annual", "1", "7",this.countryRegionID, "TST");
                    break;
                case 'option9':
                    this.modify_param_var("annual", "2", "7",this.countryRegionID,"TST");
                    break;
                case 'option11':
                    this.modify_param_var("annual", "12", "2",this.countryRegionID,"BKWH");
                    break;
                case 'option12':
                    this.modify_param_var("annual", "2", "2",this.countryRegionID,"BKWH");
                    break;

            }
            
        }
        
        async define_first_and_last_date_API() {
            try {
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

            console.log("Selected: ", Number(this.date_end.split("-")[0]));
            yearSelects.forEach(select => {
                select.value = Number(this.date_end.split("-")[0]);
            });
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

                for (const select of this.select_month){
                    select.addEventListener("change", () => {
                        
                        const selectedOption = select.options[select.selectedIndex];
                        const value = Number(selectedOption.value);
                        const selectedYear = Number(this.select_year.value);

                        console.log(selectedYear);

                        if (value > Number(this.date_end.split("-")[0])) {
                            alert("No data available.");
                        }
                        
                        if (selectedYear === Number(this.date_end.split("-")[0]) && value > Number(this.date_end.split("-")[1])){
                            
                            for (const option of select.options){
                                const optionValue = Number(option.value);
                                if (optionValue > Number(this.date_end.split("-")[1]) && !option.textContent.endsWith("❌")) {
                                    option.textContent += " ❌";
                                }   

                            }
                        }
                    });
                }
                this.select_month.forEach(select => {
                    select.value = Number(this.date_end.split("-")[1]);
                });
            }
        }

        populate_container2_by_querying_API(last_one = false){
            
            const count = document.querySelectorAll(".country").length;
            
            for (let x=1; x<=count; x++){
                console.log("country.value: ",country1.value);
                console.log("year.value: ",year1.value);
                console.log("month.value: ",month1.value);

                const country = document.getElementById(`country${x}`);
                const year = document.getElementById(`year${x}`);
                const month = document.getElementById(`month${x}`);

                if (month1 != ""){
                        if (country.value != "Select Country"  && year.value != "" && month.value != ""){
                            //console.log("Condition entered 45");
                            this.modify_param_var();
                            
                        }
                    else{
                        if (country.value != "Select Country"  && year.value != ""){
                            //console.log("Condition entered 45");

                        }
                    }
                }

                console.log(document.getElementById(`country${x}`));// It works
                document.getElementById(`country${x}`).addEventListener("change", () => {
                    
                    const country = document.getElementById(`country${x}`);
                    const year = document.getElementById(`year${x}`);
                    const month = document.getElementById(`month${x}`);
                    
                    console.log("country.value: ",country.value);
                    console.log("year.value: ",year.value);
                    console.log("month.value: ",month.value);

                    if (month1 != ""){
                        if (country.value != "Select Country"  && year.value != "" && month.value != ""){
                            console.log("Condition entered2");
                            
                        }
                    else{
                        if (country.value != "Select Country"  && year.value != ""){
                            console.log("Condition entered2");

                        }
                    }
                    }
                })
            }
            
        }
    }

    const s = new Select(
        "container",
        "container2",
        "mySelect",
        "BRA"
    )