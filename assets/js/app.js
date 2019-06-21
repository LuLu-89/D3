// SVG dimensions
var svgWidth = 960;
var svgHeight = 500;

// Define the chart's margins as an object
var margin = {
    top: 30,
    right: 40,
    bottom: 80,
    left: 100
};

// Define dimensions of the chart area
var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;

// Select body, append SVG area to it, and set the dimensions
var svg = d3
    .select("#scatter")
    .append("svg")
    .attr("height", svgHeight)
    .attr("width", svgWidth);

// Append a group to the SVG area and shift ('translate') it to the right and down to adhere
// to the margins set in the "chartMargin" object.
var chartGroup = svg.append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);


// Load data from csv
d3.csv("assets/js/data.csv")
    .then(healthData => {
        console.log(healthData);
        // Parse data
        healthData.forEach(function (data) {
            data.poverty = +data.poverty;
            data.healthcare = +data.healthcare;
        });

        // Create scale functions
        var xLinearScale = d3.scaleLinear()
            .domain([d3.min(healthData, d => d.poverty), d3.max(healthData, d => d.poverty)])
            .range([0, width]);

        var yLinearScale = d3.scaleLinear()
            .domain([0, d3.max(healthData, d => d.healthcare)])
            .range([height, 0]);

        // Create axis functions
        var bottomAxis = d3.axisBottom(xLinearScale);
        var leftAxis = d3.axisLeft(yLinearScale);

        // Append axis to chart
        chartGroup.append("g")
            .attr("transform", `translate(0, ${height})`)
            .call(bottomAxis);

        chartGroup.append("g")
            .call(leftAxis);

        // Create circles
        var circlesGroup = chartGroup.selectAll("circle")
            .data(healthData)
            .enter()
            .append("circle")
            .attr("cx", d => xLinearScale(d.poverty))
            .attr("cy", d => yLinearScale(d.healthcare))
            .attr("r", "10")
            .attr("fill", "teal")
            .attr("opacity", "0.60")
            .classed("circles", true);

        var stateAbbrGroup = chartGroup.selectAll("text.circle-text")
            .data(healthData)
            .enter()
            .append("text")
            .classed("circles", true)
            .attr("x", d => xLinearScale(d.poverty) - 8)
            .attr("y", d => yLinearScale(d.healthcare) + 5)
            .attr("fill", "white")
            .text(d => d.abbr)
            .attr("font-size", "10");

        // Iniialize tooltip
        var toolTip = d3.tip()
            .attr("class", "tooltip")
            .offset([80, -60])
            .html(function (d) {
                return (`${d.state}<br>In Poverty (%): ${d.poverty}<br>Lacks Healthcare (%): ${d.healthcare}`);
            });


        // Create tooltip in chart
        chartGroup.call(toolTip);

        // Create event listeners to display and hide the tooltip
        circlesGroup.on("mouseover", function (data) {
            toolTip.show(data, this)
                .style("display", "block")
                .style("background-color", "white")
                .style("left", d3.event.pageX + "px")
                .style("top", d3.event.pageY + "px");
        })

            .on("mouseout", function (data, index) {
                toolTip.hide(data);
            });

        // Create axis label
        chartGroup.append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", 0 - margin.left + 40)
            .attr("x", 0 - (height / 2))
            .attr("dy", "1em")
            .attr("class", "axisText")
            .text("Lacks Healthcare (%)");

        chartGroup.append("text")
            .attr("transform", `translate(${width / 2}, ${height + margin.top + 30})`)
            .attr("class", "axisText")
            .text("In Poverty (%)");
    });
