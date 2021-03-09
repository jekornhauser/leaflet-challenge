var queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_month.geojson";

// Perform a GET request to the query URL
d3.json(queryUrl, function(data) {
    // Once we get a response, send the data.features object to the createFeatures function
    createFeatures(data.features);
    console.log(data.features);
   });

function createMap(earthquakes) {

    // Create the tile layer that will be the background of our map
    var lightmap = L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
      attribution: "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
      maxZoom: 18,
      zoomOffset: -1,
      id: "mapbox/streets-v11",
      accessToken: API_KEY
    });
  
    // Create a baseMaps object to hold the lightmap layer
    var baseMaps = {
      "Light Map": lightmap
    };
  
    // Create an overlayMaps object to hold the earthquake layer
    var overlayMaps = {
      "Earthquakes": earthquakes
    };
  
    // Create the map object with options
    var map = L.map("mapid", {
      center: [40.73, -74.0059],
      zoom: 12,
      layers: [lightmap, earthquakes]
    });
  
    // Create a layer control, pass in the baseMaps and overlayMaps. Add the layer control to the map
    L.control.layers(baseMaps, overlayMaps, {
      collapsed: false
    }).addTo(map);
    function getColor(d) {
        return d > 90 ? '#ff4d4d' :
               d > 70  ? '#e67300' :
               d > 50  ? '#ffa64d' :
               d > 30  ? '#ffcc66' :
               d > 10  ? '#ffff66"' :
                          '#c4ff4d';
            
      };

    // Add legend
    var legend = L.control({position: 'bottomleft'})
    //legend functionality
    legend.onAdd = function () {
        var div = L.DomUtil.create('div', 'info legend'),
            magnitudes = [-10, 10, 30, 50, 70, 90],
            labels = [];
        // loop through our density intervals and generate a label with a colored square for each interval
        for (var i = 0; i < magnitudes.length; i++) {
            div.innerHTML +=
                '<i style="background:' + getColor(magnitudes[i] + 1) + '"></i> ' +
                magnitudes[i] + (magnitudes[i + 1] ? '&ndash;' + magnitudes[i + 1] + '<br>' : '+');
        };
        return div;
    };
    legend.addTo(map);
}

  function createFeatures(earthquakeData) {
    function colorSel(depth){
        if (depth <10) {
        return "#c4ff4d";
        }
        else if (depth<30) {
        return  "#ffff66";
        }
        else if (depth < 50) {
        return  "#ffcc66";
        }
        else if (depth < 70) {
        return "#ffa64d";
        }
        else if (depth < 90) {
        return  "#e67300";
        }
        else {
        return  "#ff4d4d";
        }
      }
  
  
    function markerSize(magnitude) {
      return magnitude *3;
    };

    function createMarkers(feature) {
      return{
        stroke: false,
        fillOpacity: 0.75,
        fillColor: colorSel(feature.geometry.coordinates[2]),
        radius: markerSize(feature.properties.mag)
        }; 
    }

    var earthquakes =L.geoJson(earthquakeData, {
        // We turn each feature into a circleMarker on the map.
        pointToLayer: function(feature, latlng) {
          return L.circleMarker(latlng);
        },
        // We set the style for each circleMarker using our styleInfo function.
        style: createMarkers,
        // We create a popup for each marker to display the magnitude and location of the earthquake after the marker has been created and styled
        onEachFeature: function(feature, layer) {
          layer.bindPopup(
            "Magnitude: "
              + feature.properties.mag
              + "<br>Depth: "
              + feature.geometry.coordinates[2]
              + "<br>Location: "
              + feature.properties.place
          );
        }
      });

      createMap(earthquakes);
  };
