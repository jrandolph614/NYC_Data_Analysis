
var svgWidth = 1200;
var svgHeight = 700;

var margin ={
    top: 40,
    right: 70,
    bottom: 50,
    left: 140
};

var width = svgWidth - margin.right - margin.left;
var height = svgHeight - margin.left - margin.right;

// Create an SVG wrapper, append an SVG group that will hold our chart,
// and shift the latter by left and top margins.
var svg = d3
    .select(".chart")
    .append("svg")
    .attr("width", svgWidth)
    .attr("height", svgHeight);

// append SVG group
var chartGroup = svg.append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

// intial params
var chosenXAxis = "saleprice";
var chosenYAxis = "totalincome";

// function used to update x-scale upon click on axis label
function xScale(zipdata, chosenXAxis) {
    var xLinearScale = d3.scaleLinear()
    .domain([d3.min(zipdata, d => d[chosenXAxis]) * 0.9,
        d3.max(zipdata, d=> d[chosenXAxis]) * 1.1
    ])
    .range([0,width]);

    return xLinearScale;
}

// function used to update y-scale upon click on axis label
function yScale(zipdata, chosenYAxis) {
    var yLinearScale = d3.scaleLinear()
    .domain([d3.min(zipdata, d =>d[chosenYAxis]) * 0.88,
        d3.max(zipdata, d=> d[chosenYAxis]) * 1.1
    ])
    .range([height,0]);

    return yLinearScale;
}

//function used for updating xAxis upon click on axis label
function renderXAxis(newXScale, xAxis) {
    var bottomAxis = d3.axisBottom(newXScale);

    xAxis.transition()
        .duration(1000)
        .call(bottomAxis);
    
    return xAxis;
}

//function used for updating yAxis upon click on axis label
function renderYAxis(newYScale, yAxis) {
    var leftAxis = d3.axisLeft(newYScale);

    yAxis.transition()
        .duration(1000)
        .call(leftAxis);
    
    return yAxis;
}

// function used for updating circle group with a transition to new 
function renderXCircles(circleGroup, newXScale, chosenXAxis, circletext) {

    circleGroup.transition()
        .duration(1000)
        .attr("cx", d => newXScale(d[chosenXAxis]))
        ;

    circletext.transition()
      .duration(1000)
      .attr("x", d => newXScale(d[chosenXAxis])-13);

    return circleGroup;
}

// function used for updating circle group with a transition to new 
function renderYCircles(circleGroup, newYScale, chosenYAxis, circletext) {

    circleGroup.transition()
        .duration(1000)
        .attr("cy", d => newYScale(d[chosenYAxis]));
    
    circletext.transition()
      .duration(1000)
      .attr("y", d => newYScale(d[chosenYAxis]));

    return circleGroup;
}

// function used for updating circles group with new tooltip
function updateToolTip(chosenXAxis, chosenYAxis, circlesGroup, circletext) {

    if (chosenXAxis === "saleprice") {
      var xlabel = "Price: ";
    }
    else if (chosenXAxis === "rent"){
      var xlabel = "Rent: ";
    }
    else {
        var xlabel = "MHI: ";
    }
    
    if (chosenYAxis === "rankStars") {
      var ylabel = "School: ";
    }
    else if (chosenYAxis === "totalcrime"){
      var ylabel = "Crime: ";
    }
    else {
        var ylabel = "Income: ";
    }

    var toolTip = d3.tip()
      .attr("class", "tooltip")
      .style("background", "black")
      .style("color", "white")
      .style("font-size", "11px")
      .attr("opacity", ".5")
      .style("text-align", "center")
      .style("padding","4px")
      .style("opacity", .2)
      .style("border-radius","5px")
      .offset([80, -80])
      .html(function(d) {
        return (`${d.zipcode}<br>Lat: ${d.latitude}<br>Lon: ${d.longitude}<br>${xlabel} ${d[chosenXAxis]=="0" ? "NA" : d[chosenXAxis]}${chosenXAxis=="saleprice" ? "":""} <br>${ylabel} ${d[chosenYAxis]=="0" ? "NA" : d[chosenYAxis]}`);
      });
  
    circlesGroup.call(toolTip);
    circletext.call(toolTip);
  
    circlesGroup.on("mouseover", function(data) {
      toolTip.show(data);
    })
      // onmouseout event
      .on("mouseout", function(data, index) {
        toolTip.hide(data);
      });
    
      circletext.on("mouseover", function(data) {
        toolTip.show(data);
      })
        // onmouseout event
        .on("mouseout", function(data, index) {
          toolTip.hide(data);
        });
  
    return circlesGroup;
  }
  
  // Retrieve data from the CSV file and execute everything below

  var allDataURL = '/alldata';

  //d3.json(allDataURL).then(function(zipdata){
    d3.json(allDataURL, function(error, zipdata){

        console.log(zipdata);
    // parse data
    zipdata.forEach(function(data) {
      data.saleprice = +data.saleprice;
      data.rent = +data.rent;
      data.marketindex = Math.round(+data.marketindex * 100) / 100;
      data.totalincome = +data.totalincome;
      data.totalcrime = +data.totalcrime;
      data.rankStars = Math.round(+data.rankStars * 100) / 100;
    });
  
    console.log(zipdata);
    // xLinearScale function above csv import
    var xLinearScale = xScale(zipdata, chosenXAxis);

    // yLinearScale function above csv import
    var yLinearScale = yScale(zipdata, chosenYAxis);
  
    // Create initial axis functions
    var bottomAxis = d3.axisBottom(xLinearScale);
    var leftAxis = d3.axisLeft(yLinearScale);
  
    // append x axis
    var xAxis = chartGroup.append("g")
      .classed("x-axis", true)
      .attr("transform", `translate(0, ${height})`)
      .call(bottomAxis);
  
    // append y axis
    var yAxis = chartGroup.append("g")
      .call(leftAxis);

    // append initial circles
    var circlesGroup = chartGroup.selectAll("circle")
      .data(zipdata)
      .enter()
      .append("circle")
      .attr("cx", d => xLinearScale(d[chosenXAxis]))
      .attr("cy", d => yLinearScale(d[chosenYAxis]))
      .attr("r", 10)
      .attr("fill", "salmon") //#37778b
      .attr("opacity", ".7");

    var circletext = chartGroup.selectAll("cxtext")
      .data(zipdata)
      .enter()
      .append("text")
      .attr("x", d => xLinearScale(d[chosenXAxis]) -13 )
      .attr("y", d => yLinearScale(d[chosenYAxis]) )
      .text(function(d) { return "";//d.zipcode;
    })
      .style("font-size", 10)
      .attr("fill", "white")
      .attr("font-weight", "bold")
      .attr("dy", ".35em");

    // Create group for  2 x- axis labels
    var labelsGroup = chartGroup.append("g")
      .attr("transform", `translate(${width / 2}, ${height + 20})`);
  
    var salepriceLabel = labelsGroup.append("text")
      .attr("x", 0)
      .attr("y", 20)
      .attr("value", "saleprice") // value to grab for event listener
      .classed("active", true)
      .text("Sales Price (Median)")
      .style("font-size", "14px")
      .style("font-weight", "bold");
    
    var rentLabel = labelsGroup.append("text")
      .attr("x", 0)
      .attr("y", 40)
      .attr("value", "rent") // value to grab for event listener
      .classed("inactive", true)
      .text("Rent (Median)")
      .style("font-size", "14px")
      .style("font-weight", "bold");

    var marketindexLabel = labelsGroup.append("text")
      .attr("x", 0)
      .attr("y", 60)
      .attr("value", "marketindex") // value to grab for event listener
      .classed("inactive", true)
      .text("Market Health Index")
      .style("font-size", "14px")
      .style("font-weight", "bold");

    var totalincomeLabel = labelsGroup.append("text")
       .attr("y", 0 -(svgWidth/2)+46)
       .attr("x", svgHeight/2)
      .attr("transform", "rotate(-90)")
      .attr("value", "totalincome") // value to grab for event listener
      .classed("active", true)
      .text("Total Income($ Thousands)")
      .style("font-size", "14px")
      .style("font-weight", "bold");

    var totalcrimeLabel = labelsGroup.append("text")
      .attr("y", 0 - (svgWidth / 2) +27 )
      .attr("x", svgHeight/2 )
      .attr("transform", "rotate(-90)")
      .attr("value", "totalcrime") // value to grab for event listener
      .classed("inactive", true)
      .text("Total Crime")
      .style("font-size", "14px")
      .style("font-weight", "bold");

    var rankStarsLabel = labelsGroup.append("text")
    .attr("y", 0 - (svgWidth / 2) +10 )
    .attr("x", svgHeight/2 )
    .attr("transform", "rotate(-90)")
      .attr("value", "rankStars") // value to grab for event listener
      .classed("inactive", true)
      .text("School Rating (1-5)")
      .style("font-size", "14px")
      .style("font-weight", "bold");

    // updateToolTip function above csv import
    var circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup, circletext);
  
    // x axis labels event listener
    labelsGroup.selectAll("text")
      .on("click", function() {
        // get value of selection
        var value = d3.select(this).attr("value");
        if (value === "saleprice" || value === "rent" || value === "marketindex") {
  
            console.log("X axis clicked");
            console.log(value);
          // replaces chosenXAxis with value
          chosenXAxis = value;

          // updates x scale for new data
          xLinearScale = xScale(zipdata, chosenXAxis);
  
          // updates x axis with transition
          xAxis = renderXAxis(xLinearScale, xAxis);
  
          // updates circles with new x values
          circlesGroup = renderXCircles(circlesGroup, xLinearScale, chosenXAxis, circletext);
  
          // updates tooltips with new info
          circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup, circletext);
  
          // changes classes to change bold text
          if (chosenXAxis === "saleprice") {
            salepriceLabel
              .classed("active", true)
              .classed("inactive", false);
            rentLabel
              .classed("active", false)
              .classed("inactive", true);
            marketindexLabel
              .classed("active", false)
              .classed("inactive", true);
          }
          else if (chosenXAxis === "rent") {
            salepriceLabel
              .classed("active", false)
              .classed("inactive", true);
            rentLabel
              .classed("active", true)
              .classed("inactive", false);
            marketindexLabel
              .classed("active", false)
              .classed("inactive", true);
          }

          else {
            salepriceLabel
            .classed("active", false)
            .classed("inactive", true);
          rentLabel
            .classed("active", false)
            .classed("inactive", true);
          marketindexLabel
            .classed("active", true)
            .classed("inactive", false);
          }
        }

        if (value === "rankStars" || value === "totalcrime" || value === "totalincome") {
            console.log("*************");
            console.log(value);

            // replaces chosenXAxis with value
            chosenYAxis = value;

            // updates x scale for new data
            yLinearScale = yScale(zipdata, chosenYAxis);
    
            // updates x axis with transition
            yAxis = renderYAxis(yLinearScale, yAxis);
    
            // updates circles with new x values
            circlesGroup = renderYCircles(circlesGroup, yLinearScale, chosenYAxis, circletext);
    
            // updates tooltips with new info
            circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup, circletext);
    
            // changes classes to change bold text
            if (chosenYAxis === "rankStars") {
                rankStarsLabel
                  .classed("active", true)
                  .classed("inactive", false);
                totalcrimeLabel
                  .classed("active", false)
                  .classed("inactive", true);
                totalincomeLabel
                  .classed("active", false)
                  .classed("inactive", true);
              }
              else if (chosenYAxis === "totalcrime") {
                rankStarsLabel
                  .classed("active", false)
                  .classed("inactive", true);
                totalcrimeLabel
                  .classed("active", true)
                  .classed("inactive", false);
                totalincomeLabel
                  .classed("active", false)
                  .classed("inactive", true);
              }
    
              else {
                rankStarsLabel
                .classed("active", false)
                .classed("inactive", true);
                totalcrimeLabel
                .classed("active", false)
                .classed("inactive", true);
                totalincomeLabel
                .classed("active", true)
                .classed("inactive", false);
              }
            
        }
      });

  });
  