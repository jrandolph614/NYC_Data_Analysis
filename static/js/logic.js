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
    var li = zipcodeMetaData.append("tr").append("td").text(`${key.charAt(0).toUpperCase() + key.slice(1).toLowerCase()}: ${value}`);
  });
  
  //Build the Gauge Chart
  buildGauge(newzipcode);
    
  });
}

function buildCharts(sample) {

  // Use `d3.json` to fetch the sample data for the plots
  var sampleDataURL = `/samples/${sample}`;

  //d3.json(sampleDataURL).then(function(data){
    d3.json(sampleDataURL, function(error, data){
  // Build a Bubble Chart using the sample data
  var traceBubble = {
    x: data["otu_ids"],
    y: data["sample_values"],
    text: data["otu_labels"],
    mode: 'markers',
    marker: {
      size: data["sample_values"],
      color: data["otu_ids"]
    }
  };
  
  var dataBubble = [traceBubble];
  
  var layoutBubble = {
    showlegend: false,
    height: 600,
    width: 1200,
    xaxis: {title: "OTU ID"}
  };
  
  Plotly.newPlot('bubble', dataBubble, layoutBubble);

  // Build a Pie Chart

    var minLength = Math.min(data["otu_ids"].length, data["sample_values"].length,data["otu_labels"].length );
    var merge_data_set = [];

    //console.log(minLength);
    for(i=0; i< minLength; i++)
    {
      var dict = {};
      dict["otu_ids"] = data["otu_ids"][i];
      dict["sample_values"] = data["sample_values"][i];
      dict["otu_labels"] = data["otu_labels"][i];
      merge_data_set.push(dict);
    };

    var sortedData = merge_data_set.sort((first, second) => second.sample_values - first.sample_values);

    var top10Data = sortedData.slice(0,10);

    var otu_ids = top10Data.map(row => row.otu_ids);
    var sample_values = top10Data.map(row => row.sample_values);
    var otu_labels = top10Data.map(row => row.otu_labels.replace(/(([^;]*;){2}[^;]*);/g, '$1<br>   '));


    var tracePie = {
      labels: otu_ids,
      values: sample_values,
      type :'pie',
      hovertext: otu_labels,
      hoverinfo: 'label+text+value+percent'
    };


    var dataPie = [tracePie];

    //console.log(dataPie);

    Plotly.newPlot("pie", dataPie);
  });

}


function buildGauge(newzipcode){

var mhiURL = `/zipcodedata/${newzipcode}`;

  //d3.json(mhiURL).then(function(data){
    d3.json(mhiURL, function(error, data){
    // Enter a speed between 0 and 180
    var level = Number(data["marketindex"]);

    // Trig to calc meter point
    var degrees = 180 - level*20,
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
      { values: [50/9, 50/9, 50/9, 50/9, 50/9, 50/9, 50/9, 50/9, 50/9, 50],
      rotation: 90,
      text: ['8-9', '7-8', '6-7', '5-6','4-5', '3-4', '2-3', '1-2', '0-1', ''],
      textinfo: 'text',
      textposition:'inside',
      marker: {colors:[     'rgba(14, 127, 0, .5)', 
                            'rgba(110, 154, 22, .5)',
                            'rgba(170, 202, 42, .5)', 
                            'rgba(202, 209, 95, .5)', 
                            'rgba(213, 229, 153, .5)',
                            'rgba(229, 232, 177, .5)',
                            'rgba(233, 230, 201, .5)', 
                            'rgba(244, 241, 229, .5)',
                            'rgba(250, 243, 235, .5)',
                            'rgba(255, 255, 255, 0)']},
      labels: ['8-9', '7-8', '6-7', '5-6', '4-5', '3-4', '2-3', '1-2', '0-1', ''],
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
  //buildCharts(firstzipcode);
  buildMetadata(firstzipcode);
});
}

function optionChanged(newzipcode) {
// Fetch new data each time a new sample is selected
//buildCharts(newzipcode);
buildMetadata(newzipcode);
}

// Initialize the dashboard
init();
