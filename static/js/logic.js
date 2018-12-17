function buildMetadata(newzipcode) {

  // Use `d3.json` to fetch the metadata for a newzipcode
  var metaDataURL = `/zipcodedata/${newzipcode}`;
  // Use d3 to select the panel with id of `#zipcode-metadata`
  var zipcodeMetaData = d3.select("#zipcode-metadata");

  //d3.json(metaDataURL).then(function(data){

    d3.json(metaDataURL, function(error, data){
    // Use `.html("") to clear any existing metadata
    zipcodeMetaData.html("");

  // Use `Object.entries` to add each key and value pair to the panel
  Object.entries(data).forEach(([key, value]) => {
    //console.log(key);
    switch(key){
      case "marketindex":
        key = "Market Index";
        break;
      case "rankStars":
        key = "School Rating";
        break;
      case "saleprice":
        key = "Sales Price";
        break;
      default:
        key = key;
    }
    if (value==null){
      value = "NA";
    }
    var li = zipcodeMetaData.append("tr").append("td").text(`${key.charAt(0).toUpperCase() + key.slice(1).toLowerCase()}: ${value}`);
  });
  
  //Build the Gauge Chart
  buildGauge(newzipcode);
    
  });
}

function buildCharts(factor) {
  // Use `d3.json` to fetch the sample data for the plots
  var sampleDataURL = `/toptenzipcodedata/${factor}`;

  //d3.json(sampleDataURL).then(function(data){
    d3.json(sampleDataURL, function(error, data){

    var passedFactor = factor;
  // Build a Pie Chart
  if (factor == "Sales Price"){
    factor = "saleprice"
  }
  if (factor == "Total Crime"){
    factor = "totalcrime"
  }
  if (factor == "School Rating"){
    factor = "rankStars"
  }
  if (factor == "Rent"){
    factor = "rent"
  }
  if(factor == "Market Health Index"){
    factor = "marketindex"
  }
  if (factor == "Total Income"){
    factor = "totalincome"
  }
    
    var zipcode = data.zipcode;
    var sample_values = data[factor].reverse();;
    //console.log(zipcode);


    var traceBar = {
      x: sample_values,
      y: zipcode,
      text: zipcode,
      name: "Zip",
      type: "bar",
      orientation: "h"
    };

    var layout = {
      title: `Topmost zip codes by ${passedFactor}`,
      margin: {
        l: 100,
        r: 100,
        t: 100,
        b: 100
      },
      yaxis:{
        type:'category',
        autotick: false,
        ticks: 'outside',
        tick0: 0,
        dtick: 0.25,
        ticklen: 8,
        tickwidth: 4,
        tickcolor: '#000',
        title : 'Zipcodes'
      },
      xaxis: {
        title: passedFactor
      }
    };
    
    var dataBar = [traceBar];
    Plotly.newPlot("bar", dataBar, layout);
  });

}



function buildGauge(newzipcode){

var mhiURL = `/zipcodedata/${newzipcode}`;

  //d3.json(mhiURL).then(function(data){
    d3.json(mhiURL, function(error, data){
    // Enter a speed between 0 and 180
    var level = Number(data["marketindex"]);

    // Trig to calc meter point
    var degrees = 180 - level*18,
        radius = .5;
    var radians = degrees * Math.PI / 180;
    var x = radius * Math.cos(radians);
    var y = radius * Math.sin(radians);

    // Path: may have to change to create a better triangle
    var mainPath = 'M -.0 -0.025 L .0 0.025 L ',
        pathX = String(x),
        space = ' ',
        pathY = String(y),
        pathEnd = ' Z';
    var path = mainPath.concat(pathX,space,pathY,pathEnd);

    var data = [{ type: 'scatter',
      x: [0], y:[0],
        marker: {size: 28, color:'850000'},
        showlegend: false,
        name: 'speed',
        text: level,
        hoverinfo: 'text+name'},
      { values: [50/10, 50/10, 50/10, 50/10, 50/10, 50/10, 50/10, 50/10, 50/10, 50/10, 50],
      rotation: 90,
      text: ['9-10', '8-9', '7-8', '6-7', '5-6','4-5', '3-4', '2-3', '1-2', '0-1', ''],
      textinfo: 'text',
      textposition:'inside',
      marker: {colors:[     'rgba(0, 127, 0, 0.5)',
                            'rgba(80, 127, 0, .5)', 
                            'rgba(110, 154, 22, .5)',
                            'rgba(170, 202, 42, .5)', 
                            'rgba(202, 209, 95, .5)', 
                            'rgba(213, 229, 153, .5)',
                            'rgba(229, 232, 177, .5)',
                            'rgba(233, 230, 201, .5)', 
                            'rgba(244, 241, 229, .5)',
                            'rgba(250, 243, 235, .5)',
                            'rgba(255, 255, 255, 0)']},
      labels: ['9-10', '8-9', '7-8', '6-7', '5-6', '4-5', '3-4', '2-3', '1-2', '0-1', ''],
      hoverinfo: 'label',
      hole: .5,
      type: 'pie',
      showlegend: false
    }];

    var layout = {
      shapes:[{
          type: 'path',
          path: path,
          fillcolor: '850000',
          line: {
            color: '850000'
          }
        }],
      title: `<b>Zillow Market Health Index</b> <br> Zip: ${newzipcode}`,
      height: 500,
      width: 500,
      xaxis: {zeroline:false, showticklabels:false,
                showgrid: false, range: [-1, 1]},
      yaxis: {zeroline:false, showticklabels:false,
                showgrid: false, range: [-1, 1]}
    };

    Plotly.newPlot('gauge', data, layout);
  });

};


function init() {
// Grab a reference to the dropdown select element
var selector = d3.select("#selDataset");

// Use the list of zipcode names to populate the select options
//d3.json("/allzipcodes").then((zipcodeNames) => {
  d3.json("/allzipcodes", function(error, zipcodeNames){

  zipcodeNames.forEach((zipcode) => {
    selector
      .append("option")
      .text(zipcode)
      .property("value", zipcode);
  });

  // Use the first zipcode from the list to build the initial plots
  const firstzipcode = zipcodeNames[0];
  //console.log(firstzipcode);
  buildMetadata(firstzipcode);
});


var factorSelector = d3.select("#selFactor")
d3.json("/names", function(error, factors){

  factors.forEach((factor) => {
    factorSelector
      .append("option")
      .text(factor)
      .property("value", factor);
  });
  const firstfactor = factors[0];
  buildCharts(firstfactor);
});

}

function optionChanged(newzipcode) {
// Fetch new data each time a new sample is selected
buildMetadata(newzipcode);
}

function factorChanged(newfactor) {
  // Fetch new data each time a new sample is selected
  buildCharts(newfactor);
  }

  
// Initialize the dashboard
init();
