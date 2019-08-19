require([
  "esri/views/MapView",
  "esri/Map",
  "esri/layers/FeatureLayer",
  "esri/widgets/Expand"
], function(MapView, Map, FeatureLayer, Expand) {

  let min = -40;
  let mid = 0;
  let max = 40;
  filter = true;
  hide = true;
  let layerView;

  function getRenderer(min, mid, max, filter = false) {
    filters = [
      { value: min - 0.0001, color: "#ffffff", opacity: ".05" },
      { value: max + 0.0001, color: "#ffffff", opacity: "0.5" }
    ];

    stops = [
      { value: min, color: "#ff0000" },
      { value: mid, color: "#ffff00" },
      { value: max, color: "0000ff" }
    ];

    if (filter) {
      stops.unshift(filters[0]);
      stops.push(filters[1]);
    }

    return {
      type: "simple", //autocasts
      symbol: {
        type: "simple-marker", //autocasts
        size: 12,
        color: "white",
        outline: {
          width: 0.5,
          color: "black"
        }
      },
      visualVariables: [{
        type: "color",
        field: "value",
        stops: stops
      }]
    };
  }

  const labelClass = {
    symbol: {
      type: "text",
      font: { family: "Playfair Display", size: 9 }
    },
    labelPlacement: "above-center",
    labelExpression: '[value]',
    minScale: 3000
  };

  const layer = new FeatureLayer({
    url: "https://services8.arcgis.com/vVBb77z9fDbXITgG/ArcGIS/rest/services/SamplePoints/FeatureServer/0",
    outFields: ["value"],
    renderer: getRenderer(min, mid, max, filter),
    labelingInfo: [labelClass]
  });

  const map = new Map({
    basemap: "gray-vector",
    layers: [layer]
  });

  const view = new MapView({
    map: map,
    container: "viewDiv",
    center: [-123.8, 49.5],
    zoom: 11
  });

  view.ui.add("filter", "bottom-right");

  view.when(function() {
    console.log("View is loaded. adding filter..");
    // set up UI items: 

    const inputItems = document.querySelectorAll('.item');
    const min = document.getElementById("min");
    min.addEventListener("change", () => { update("min", parseInt(event.target.value)) });

    const mid = document.getElementById("mid");
    mid.addEventListener("change", () => { update("mid", parseInt(event.target.value)) });

    const max = document.getElementById("max");
    max.addEventListener("change", () => { update("max", parseInt(event.target.value)) });

    inputItems.addEventListener("focusout", updateSymbols)

  });

  view.on("layerview-create", function(event) {
    console.log(event.layer.id);
    console.log(event.layerView);
  });

  view.whenLayerView(layer).then(function(lyrView) {
    layerView = lyrView;
  })

  layer.when(function() {
    view.extent = layer.fullExtent;
    if (hide) {
      //filter out records outside of query:
      console.log("we are filtering!");
      layer.filter = {
        where: "value >= " + min + " && " + "value <= " + max
      }

    }
  });

  function update(type, value) {
    if (type === "min") {
      min = value;
    }
    else if (type === "mid") {
      mid = value;
    }
    else if (type === "max") {
      max = value;
    }
    layer.renderer = getRenderer(min, mid, max, filter);

    if (layerView && hide) {
      layerView.filter = {
        where: "value >= " + min + " and " + "value <= " + max
      }
    }
  };

});