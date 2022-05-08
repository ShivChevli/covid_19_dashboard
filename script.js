function csvToArray(str, delimiter = ",") {
    // slice from start of text to the first \n index
    // use split to create an array from string by delimiter
    const headers = str.slice(0, str.indexOf("\n")).split(delimiter);

    // slice from \n index + 1 to the end of the text
    // use split to create an array of each csv value row
    const rows = str.slice(str.indexOf("\n") + 1).split("\n");

    // Map the rows
    // split values from each row into an array
    // use headers.reduce to create an object
    // object properties derived from headers:values
    // the object passed as an element of the array
    const arr = rows.map(function (row) {
        const values = row.split(delimiter);
        const el = headers.reduce(function (object, header, index) {
            object[header] = values[index];
            return object;
        }, {});
        return el;
    });

    // return the array
    return arr;
}
var country = Array();
var geoData = Array();
var OverView = {};
var mainData;
fetch('Data/full_grouped.csv').then(respons => respons.text())
    .then(data => {
        mainData = csvToArray(data);
        console.log(mainData);

        let back = mainData[0]["Country/Region"];

        //Extrack Country Name from dataset
        country.push(mainData[0]["Country/Region"])
        for (i = 1; i < mainData.length; i++) {
            if (back == mainData[i]["Country/Region"]) {
                break;
            }
            country.push(mainData[i]["Country/Region"])
        }


        //Get average activate data
        OverView = overViewData(mainData);

        console.log("OverView");
        console.log(OverView);

        geoData.push(['Country', 'Active Case On Average']);
        function FindataFromGeo() {
            for (const key in OverView) {
                geoData.push([key, (OverView[key].activte_case / mainData.length)]);
            }
        }
        FindataFromGeo();
        console.log(geoData);

        console.log(mainData[0]["Country/Region"]);
        setCountry(country);
        updateChart("India");
        document.querySelector("#country_name").innerHTML = "India";


        google.charts.load('current', {
            'packages': ['geochart'],
        });

        google.charts.setOnLoadCallback(drawRegionsMap);

        function drawRegionsMap() {
            var data = google.visualization.arrayToDataTable(geoData);

            var options = {
                tooltip: { trigger: 'selection' },
                colorAxis: { colors: ["#10af0d", "#fff", "#fff", "#950101"] },
            };

            var chart = new google.visualization.GeoChart(document.getElementById('geo-chart'));
            chart.draw(data, options);
            google.visualization.events.addListener(chart, 'select', myalret);

            async function myalret(e) {
                console.log(e);
                var selection = chart.getSelection();
                console.log(selection);
                // console.log(selection[0]);
                // console.log(selection[0].row);
                // console.log(data[selection[0].row]);
                if (selection[0].row != null) {
                    console.log(geoData[selection[0].row]);
                    console.log(geoData[selection[0].row][0]);
                    updateChart(geoData[selection[0].row][0]);
                    setTimeout(() => {
                        let count = 0;
                        let tm = undefined;
                        while (true) {
                            tm = document.querySelector(".google-visualization-tooltip");
                            if (tm != undefined || count == 500) {
                                break;
                            }
                            count++;
                        }
                        tm = tm.children;
                        console.log(tm);
                        console.log(tm[1].children[0].innerHTML);
                        document.querySelector("#country_name").innerHTML = tm[1].children[0].innerHTML;
                    },
                        1000);

                }

                // chart.setSelection("")
            }


        }

        document.querySelectorAll("#countryList li").forEach(li => {
            li.onclick = function () {
                console.log(this.dataset.name);
                document.querySelector("#country_name").innerHTML = this.dataset.name;
                updateChart(this.dataset.name);
                if (document.querySelector(".active") != null) {
                    document.querySelector(".active").classList.remove("active");
                }
                this.classList.add("active");

                document.querySelectorAll("#countryList li").forEach(li => {
                    li.style.display = "list-item";
                })
                document.querySelector("#find_country").value = "";
            }
        })
    })
    .catch(error => {
        console.log("Error : ");
        console.log(error);
    })

function setCountry(list) {

    let listUL = document.querySelector("#countryList");
    listUL.innerHTML = "";
    for (i = 0; i < list.length; i++) {
        let li = document.createElement("li");
        li.innerHTML = list[i];
        li.dataset.name = list[i];
        listUL.appendChild(li);
    }
}


function extrextData(conName) {
    let max_case = 0;
    let max_case_date = "";
    let total = 0;
    let actvate_case = Array();
    let new_case = Array();
    let confirm = Array();
    let deaths = Array();
    let new_recover = Array();
    let new_death = Array();
    let date = Array();
    for (i = 0; i < mainData.length; i++) {
        if (mainData[i]["Country/Region"] == conName) {
            // if (mainData[i]["Confirmed"] < 2000) {
            //     continue;
            // }
            if (max_case < parseInt(mainData[i]["Confirmed"])) {
                max_case = parseInt(mainData[i]["Confirmed"]);
                max_case_date = mainData[i]["Date"];
            }
            total += parseInt(mainData[i]["Confirmed"]);
            date.push(mainData[i]["Date"]);
            confirm.push(checkNegative(mainData[i]["Confirmed"]));
            actvate_case.push(checkNegative(mainData[i]["Active"]));
            deaths.push(checkNegative(mainData[i]["Deaths"]));
            new_case.push(checkNegative(mainData[i]["New cases"]));
            new_death.push(checkNegative(mainData[i]["New deaths"]));
            new_recover.push(checkNegative(mainData[i]["New recovered"]));
        }
    }
    let obj = {
        "date": date,
        "confirm": confirm,
        "deaths": deaths,
        "actvate_case": actvate_case,
        "new_case": new_case,
        "new_death": new_death,
        "new_recover": new_recover,
        "max_case": max_case,
        "max_case_date": max_case_date,
        "total": total,
    }
    return obj;
}

function checkNegative(num) {
    if (parseInt(num) < 0) {
        return 0;
    }
    else {
        return num;
    }
}


function updateChart(conName) {

    let obj = extrextData(conName);
    document.querySelector(".chart-div").innerHTML = `
        <div class="chart-container" id="activate-case"></div>
        <div class="chart-container" id="confiremed-case"></div>
        <div class="chart-container" id="new-case"></div>
        <div class="chart-container" id="new-death"></div>
        <div class="chart-container" id="new-recover"></div>
    `;
    document.querySelector("#max_case").innerHTML = obj.max_case;
    document.querySelector("#max_case_date").innerHTML = obj.max_case_date;
    document.querySelector("#avg_case").innerHTML = parseInt(obj.total / obj.date.length);
    // console.log(document.querySelector("#country_name"));

    window.Apex = {
        chart: {
            width: 400,
            height: 150,
            type: "bar",
        },
        dataLabels: {
            enabled: false
        },
        xaxis: {
            type: "datetime",
            labels: {
                datetimeFormatter: {
                    year: 'yyyy',
                    month: 'MMM \'yy',
                    day: 'dd MMM',
                    hour: 'HH:mm'
                }
            },
            categories: obj.date,
        },
        legend: {
            horizontalAlign: "center",
        },
        tooltip: {
            enabled: true,
            intersect: false,
            inverseOrder: false,
            custom: undefined,
            fillSeriesColor: true,
            theme: false,
            style: {
                fontSize: '12px',
                fontFamily: undefined
            },
            onDatasetHover: {
                highlightDataSeries: true,
            },
            marker: {
                show: true,
            },
            items: {
                display: "flex",
            },
            fixed: {
                enabled: true,
                position: 'topright',
                offsetX: 0,
                offsetY: '13px',
            },
            x: {
                show: false,
            },
        }

    }

    // createChart("Confirmed Case", obj.confirm, obj.date, document.querySelector("#confiremed-case"));
    // createChart("Actvate case", obj.actvate_case, obj.date, document.querySelector("#activate-case"));

    createChart("New case", obj.new_case, obj.date, document.querySelector("#new-case"));
    createChart("New Recoverd", obj.new_recover, obj.date, document.querySelector("#new-recover"));
    createChart("New Death", obj.new_death, obj.date, document.querySelector("#new-death"));

    // createChart("New Recovre", obj.new_recover, obj.date, document.querySelector("#new-recover"));

    // var options = {
    //     chart: {
    //         height: 350,
    //         type: "bar",
    //     },
    //     // colors: ["#0f0f0f", "#ff0000", "orange", "#ff0000", "#0000ff"],
    //     series: [
    //         {
    //             name: "Confirmed Case",
    //             data: obj.confirm
    //         },
    //         {
    //             name: "Actvate case",
    //             data: obj.actvate_case
    //         },
    //         {
    //             name: "New case",
    //             data: obj.new_case
    //         },
    //         {
    //             name: "New Death",
    //             data: obj.new_death
    //         },
    //         {
    //             name: "New Recovre",
    //             data: obj.new_recover
    //         }
    //     ],
    //     stroke: {
    //         width: [2, 2, 2, 2, 2]
    //     },
    //     theme: {
    //         mode: 'light',
    //         palette: 'palette8',
    //         monochrome: {
    //             enabled: false,
    //             color: '#255aee',
    //             shadeTo: 'light',
    //             shadeIntensity: 0.65
    //         },
    //     },
    //     xaxis: {
    //         type: "datetime",
    //         labels: {
    //             datetimeFormatter: {
    //                 year: 'yyyy',
    //                 month: 'MMM \'yy',
    //                 day: 'dd MMM',
    //                 hour: 'HH:mm'
    //             }
    //         },
    //         categories: obj.date,
    //     },
    //     legend: {
    //         horizontalAlign: "center",
    //     }
    // };

    // var chart = new ApexCharts(document.querySelector(".chart-div"), options);
    // chart.render();


}

function createChart(lable, ydata, xdata, elment) {
    var options = {
        chart: {
            id: 'line-1',
            group: 'social',
            type: 'line',
        },
        // colors: ["#0f0f0f", "#ff0000", "orange", "#ff0000", "#0000ff"],
        series: [
            {
                name: lable,
                data: ydata
            },
        ],
        stroke: {
            width: 1
        },
        yaxis: {
            labels: {
                minWidth: 40
            }
        },
        title: {
            text: lable,
            align: 'left',
            margin: 10,
            offsetX: 0,
            offsetY: 0,
            floating: false,
            style: {
                fontSize: '14px',
                fontWeight: 'bold',
                fontFamily: undefined,
                color: '#263238'
            },
        }
    };

    console.log(elment);
    var chart = new ApexCharts(elment, options);
    chart.render();

}


document.querySelector("#find_country").addEventListener("keyup", function () {

    let val = this.value.toLowerCase();
    console.log(val);
    if (val != "") {

        document.querySelectorAll("#countryList li").forEach(li => {
            let temp = li.innerHTML.toLowerCase();
            // console.log(temp);
            if (temp.indexOf(val) > -1) {
                li.style.display = "list-item;";
            }
            else {
                li.style.display = "none";
            }
        })
    }
    else {
        document.querySelectorAll("#countryList li").forEach(li => {
            li.style.display = "list-item";
        })
    }

})

function overViewData(mainData) {
    let OverView = {};

    for (i = 0; i < mainData.length; i++) {
        if (OverView[mainData[i]["Country/Region"]] == undefined) {
            OverView[mainData[i]["Country/Region"]] = {
                "activte_case": 0,
                "confirmed_case": 0,
                "death_case": 0,
                "recovered": 0,
            };
            console.log(OverView[mainData[i]["Country/Region"]]);
        }
        else {
            OverView[mainData[i]["Country/Region"]].confirmed_case = parseInt(OverView[mainData[i]["Country/Region"]].confirmed_case) + parseInt(mainData[i]["Confirmed"]);
            OverView[mainData[i]["Country/Region"]].activte_case = parseInt(OverView[mainData[i]["Country/Region"]].activte_case) + parseInt(mainData[i]["Active"]);
            OverView[mainData[i]["Country/Region"]].death_case = parseInt(OverView[mainData[i]["Country/Region"]].death_case) + parseInt(mainData[i]["Deaths"]);
            OverView[mainData[i]["Country/Region"]].recovered = parseInt(OverView[mainData[i]["Country/Region"]].recovered) + parseInt(mainData[i]["Recovered"]);

        }
    }
    return OverView;
}