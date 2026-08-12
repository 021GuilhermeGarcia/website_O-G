function make_graph_and_table(list, measure = "test") {
    const ctx = document.getElementById('myChart');

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

const list = [
    ["Brazil", 12.9],
    ["Argentina", 18.9],
    ["Portugal",25],
    ["Argelia",45]
];

make_graph_and_table(list);