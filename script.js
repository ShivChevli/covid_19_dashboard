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
var mainData;
fetch('Data/full_grouped.csv').then(respons => respons.text())
    .then(data => {
        mainData = csvToArray(data);
        console.log(mainData);
        let back = mainData[0]["Country/Region"];
        country.push(mainData[0]["Country/Region"])

        for (i = 1; i < mainData.length; i++) {
            if (back == mainData[i]["Country/Region"]) {
                break;
            }
            country.push(mainData[i]["Country/Region"])
        }
        console.log(mainData[0]["Country/Region"]);
        setCountry(country);
        updateChart("Afghanistan");

        document.querySelectorAll("#countryList li").forEach(li => {
            li.onclick = function () {
                console.log(this.dataset.name);
                updateChart(this.dataset.name);
                if (document.querySelector(".active") != null) {
                    document.querySelector(".active").classList.remove("active");
                }
                this.classList.add("active");

                document.querySelectorAll("#countryList li").forEach(li => {
                    li.style.display = "block";
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
            confirm.push(mainData[i]["Confirmed"]);
            actvate_case.push(mainData[i]["Active"]);
            deaths.push(mainData[i]["Deaths"]);
            new_case.push(mainData[i]["New cases"]);
            new_death.push(mainData[i]["New deaths"]);
            new_recover.push(mainData[i]["New recovered"]);
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


function updateChart(conName) {

    let obj = extrextData(conName);
    document.querySelector(".chart-div").innerHTML = "";
    document.querySelector("#max_case").innerHTML = obj.max_case;
    document.querySelector("#max_case_date").innerHTML = obj.max_case_date;
    document.querySelector("#country_name").innerHTML = conName;
    document.querySelector("#avg_case").innerHTML = parseInt(obj.total / obj.date.length);
    // console.log(document.querySelector("#country_name"));

    var options = {
        chart: {
            height: 350,
            type: "line",
        },
        dataLabels: {
            enabled: false,
            hover: {
                enabled: true
            }
        },
        // colors: ["#0f0f0f", "#ff0000", "orange", "#ff0000", "#0000ff"],
        series: [
            {
                name: "Confirmed Case",
                data: obj.confirm
            },
            {
                name: "Actvate case",
                data: obj.actvate_case
            },
            {
                name: "New case",
                data: obj.new_case
            },
            {
                name: "New Death",
                data: obj.new_death
            },
            {
                name: "New Recovre",
                data: obj.new_recover
            }
        ],
        stroke: {
            width: [2, 2, 2, 2, 2]
        },
        theme: {
            mode: 'light',
            palette: 'palette8',
            monochrome: {
                enabled: false,
                color: '#255aee',
                shadeTo: 'light',
                shadeIntensity: 0.65
            },
        },
        plotOptions: {
            // bar: {
            //     columnWidth: "20%"
            // }
        },
        xaxis: {
            // type: "datetime",
            labels: {
                datetimeFormatter: {
                    year: 'yyyy',
                    month: 'MMM \'yy',
                    day: 'dd MMM',
                    hour: 'HH:mm'
                }
            },
            categories: obj.date,
            hideOverlappingLabels: true,
            // min: new Date(2021),
            // max: new Date(2021, 7, 25)
        },
        yaxis: [
            // {
            //     axisTicks: {
            //         show: true
            //     },
            //     axisBorder: {
            //         show: true,
            //         color: "#FF1654"
            //     },
            //     labels: {
            //         style: {
            //             colors: "#FF1654"
            //         }
            //     },
            //     title: {
            //         text: "Series A",
            //         style: {
            //             color: "#FF1654"
            //         }
            //     }
            // },
        ],
        tooltip: {
            shared: false,
            intersect: true,
            x: {
                show: true
            }
        },
        legend: {
            horizontalAlign: "center",
        }
    };

    var chart = new ApexCharts(document.querySelector(".chart-div"), options);

    chart.render();

}


document.querySelector("#find_country").addEventListener("keyup", function () {

    let val = this.value;
    console.log(val);
    if (val != "") {

        document.querySelectorAll("#countryList li").forEach(li => {
            let temp = li.innerHTML;
            if (temp.indexOf(val) > -1) {
                li.style.display = "block";
            }
            else {
                li.style.display = "none";
            }
        })
    }
    else {
        document.querySelectorAll("#countryList li").forEach(li => {
            li.style.display = "block";
        })
    }

})