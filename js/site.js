/* OPSMAP site.js - Dec. 2017 - CartONG */



swal({
  title: 'Loading',
  html: '<i class="glyphicon glyphicon-hourglass" style="font-size: 40px;color:#286090"></i>',
  showConfirmButton: false
});

$(function() {
//    $('.typeahead').hide();
//    $('#left_of_map').hide();
//    $('#analysis').hide();
    
    // Variable used to filter sites by site cluster
    var siteLayers = [];

    $('title').html(config.appConfig.Title);
    $('#appTitle').html(config.appConfig.Title);
    
                  // RUN ZOOM INTERACTION - Set zoom interaction at start to avoid shivers behaviour (along with lines below).
                  var defaultZoom = (function() {
                    if (config.appConfig.MapMinZoom) {
                      if (config.appConfig.DefaultZoom>config.appConfig.MapMinZoom) {
                        return config.appConfig.DefaultZoom - 1;
                      } else {
                        return config.appConfig.DefaultZoom;
                      }
                    } else {
                      return config.appConfig.DefaultZoom;
                    }
                  })();

                  //map
                  var map = L.map('map', {
                    minZoom: config.appConfig.MapMinZoom ? config.appConfig.MapMinZoom : '',
                    maxZoom: config.appConfig.MapMaxZoom ? config.appConfig.MapMaxZoom : ''
                  }).setView(config.appConfig.DefaultCenter, defaultZoom);

                  if (config.appConfig.MapMaxBounds) {
                    var bounds = map.getBounds();
                    $.each(bounds, function(k, v) {
                      $.each(v, function(i, w) {
                        w += 0.1;
                      });
                    });
                    map.setMaxBounds(bounds);
                  }    
    
                      //scalebar
                  L.control.scale().addTo(map);

                  //basemaps
                  var mapnik = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
                    maxZoom: 18,
                    crossOrigin: true
                  });
                  var osm_HOT = L.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
                    attribution: '&copy; <a href="https://openstreetmap.org">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Tiles courtesy of <a href="http://hot.openstreetmap.org/" target="_blank">Humanitarian OpenStreetMap Team</a>',
                    crossOrigin: true
                  });
                  var esri_satellite = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
                    attribution: '&copy; <a href="http://www.esri.com/">Esri</a>, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
                    maxZoom: 18,
                    crossOrigin: true
                  });
                  var esri_lightGrey = L.tileLayer('https://server.arcgisonline.com/arcgis/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}', {
                    attribution: '&copy; <a href="http://www.esri.com/">Esri</a>,  HERE, DeLorme, MapmyIndia, © OpenStreetMap contributors, and the GIS user community ',
                    maxZoom: 18,
                    crossOrigin: true
                  });
                  var esri_street = L.tileLayer('https://server.arcgisonline.com/arcgis/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}', {
                    attribution: '&copy; <a href="http://www.esri.com/">Esri</a>',
                    maxZoom: 18,
                    crossOrigin: true
                  });
                  osm_HOT.addTo(map);

                  var selectionArray = [];
                  if (config.appConfig.MapClustering) {
                    var selectionLayer = L.layerGroup();
                    selectionLayer.addTo(map);
                  }

                  // adding markers from CSV to map + to search fonction
                  var csv_markers;
                  if (!config.appConfig.MapClustering) {
                    csv_markers = new L.featureGroup().addTo(map);
                  } else {
                    csv_markers = L.markerClusterGroup({
                      chunkedLoading: true,
                      showCoverageOnHover: false,
                      // maxClusterRadius - FUNCTION : Defines cluster radius (catching area in pixels [INTEGER]) accordingly with z as zoomLevel [INTEGER].
                      maxClusterRadius: function(z) {
                        if (z<5) {
                          return 80;
                        } else if (z === 5) {
                          return 40;
                        } else if (z === 6) {
                          return 70;
                        } else if (z === 7) {
                          return 65;
                        } else if (z === 8) {
                          return 60;
                        } else if (z === 9) {
                          return 55;
                        } else if (z === 10) {
                          return 50;
                        } else if (z === 11) {
                          return 45;
                        } else if (z === 12) {
                          return 40;
                        } else if (z === 13) {
                          return 35;
                        } else if (z === 14) {
                          return 30;
                        } else if (z === 15) {
                          return 25;
                        } else if (z === 16) {
                          return 20;
                        }
                        else {
                          return 1;
                        }
                      }
                    });
                    map.addLayer(csv_markers);
                  }
                  var marker_list = [];
    
                      // animationend event : avoids hovered markers to get 'trapped' into a cluster (and hence keep the hovered style) on zoom change.
                  csv_markers.on('animationend', function(a) {
                    $.each(a.target.getLayers(), function(i, v) {
                      if (v.options.icon === v.options.iconSet.iconHovered) {
                        v.setIcon(v.options.iconSet.icon);
                        v.closePopup();
                      }
                    })
                  });

                  $('.js-loading-bar').hide();
                  $('.container').show();

    $.each(config.data.categories, function(i, v) {
        var url = 'img/ocha_icon/' + v.icon + '.png';
        toDataURL(url, function(dataUrl) {
            v['dataUrl'] = dataUrl;
        });
    });

    // Add config-defined rules to global traffic lights rules object.
    OPSMAP_AddCustomTlRules(config.tlRules);

    var cfgD = config.data;

    // http://www.ietf.org/rfc/rfc2781.txt
    function decodeUtf16(w) {
      var i = 0;
      var len = w.length;
      var w1, w2;
      var charCodes = [];
      while (i < len) {
        var w1 = w[i++];
        if ((w1 & 0xF800) !== 0xD800) { // w1 < 0xD800 || w1 > 0xDFFF
          charCodes.push(w1);
          continue;
        }
        if ((w1 & 0xFC00) === 0xD800) { // w1 >= 0xD800 && w1 <= 0xDBFF
          throw new RangeError('Invalid octet 0x' + w1.toString(16) + ' at offset ' + (i - 1));
        }
        if (i === len) {
          throw new RangeError('Expected additional octet');
        }
        w2 = w[i++];
        if ((w2 & 0xFC00) !== 0xDC00) { // w2 < 0xDC00 || w2 > 0xDFFF)
          throw new RangeError('Invalid octet 0x' + w2.toString(16) + ' at offset ' + (i - 1));
        }
        charCodes.push(((w1 & 0x3ff) << 10) + (w2 & 0x3ff) + 0x10000);
      }
      return String.fromCharCode.apply(String, charCodes);
    }

    function OPSMAP_loadCSV(url, callback){
        Papa.parse(url, {
            download: true,
            header: true,
            delimiter: true,
            complete: function(result){
              callback(result.data);
            }
        });
    }

    function OPSMAP_loadDataset(url, callback) {
      $.ajax(url, { success: callback, dataType: 'text' })
    }

    function removeHeaderPrefixes (headers, prefixesToRemove) {
      return headers.map(function (header) {
        prefixesToRemove.forEach(function (prefix) {
          if (header.startsWith(prefix)) { header = header.replace(prefix, ''); }
        })
        return header.toLowerCase();
      })
    }

    function getColumnsToRemove (headers, toRemove) {
      var columnsToRemove = []
      headers.forEach(function (header) {
        toRemove.forEach(function (col) {
          if (header.startsWith(col)) {
            columnsToRemove.push(header);
          }
        })
      })
      return columnsToRemove
    }

    function getCleanedCSV (data, newHeaders, columnsToRemove) {
      var split = data.split('\n');
      split[0] = newHeaders.join(',');

      var objects = Papa.parse(split.join('\n'), { header: true, skipEmptyLines: true }).data;

      var cleanedObjects = objects.map(function (row) {
        var props = Object.keys(row);
        props.forEach(function (prop) {
          if (columnsToRemove.indexOf(prop) > -1) { delete row[prop]; }
        })
        row['geopoint_latitude'] = row['gps_coordinates'].split(',')[0];
        row['geopoint_longitude'] = row['gps_coordinates'].split(',')[1];
        return row;
      })

      return Papa.unparse(cleanedObjects);
    }

    function formatData (data) {
      var parsing = Papa.parse(data).data;
      parsing[0] = parsing[0].map(function(field) { return field.replace('\n', '') }); 
      var newData = Papa.unparse(parsing);

      var split = newData.split('\n');
      var headers = split[0].replace(/^"|"$/g, '').split(',');

      var newHeaders = removeHeaderPrefixes(headers, cfgD.datasetPrefixesToRemove)
      var columnsToRemove = getColumnsToRemove(newHeaders, cfgD.datasetColumnsToRemove)      
      var cleanedCSV = getCleanedCSV(newData, newHeaders, columnsToRemove)
    
      return cleanedCSV;
    }

    var OPSMAP_remainingSources = (function(){
        var nb = 2;
        if (cfgD.loadChoices){nb += 1;}
        if (cfgD.loadExternal){nb += 1;}
        if (cfgD.loadRelevance){nb += 1;}
        if (cfgD.ckan){nb += 1;}
        return nb;
    })();

    var OPSMAP_fields, OPSMAP_choices, OPSMAP_dataset, OPSMAP_externalChoices, OPSMAP_relevance;

    if (cfgD.ckan) {
      var getURL = cfgD.ckanURL + '/api/3/action/package_show?id=' + cfgD.dataset
      $.getJSON(getURL, function (data) {
        OPSMAP_remainingSources--;
        // Get the url of the last uploaded dataset
        var url = data.result.resources
          .filter(function (r) { return r.position === 0; })
          // .sort(function (r1, r2) { return new Date(r1.last_modified) < new Date(r2.last_modified) ? -1 : 1; })
          .map(function (r) { return r.url; })
          .shift();

        OPSMAP_loadDataset(url, function(data) {
          var csv = formatData(data)
          OPSMAP_dataset = Papa.parse(csv, { header: true, delimiter: true }).data;
          OPSMAP_remainingSources--;
          if (!OPSMAP_remainingSources) {
              OPSMAP_processData(OPSMAP_fields, OPSMAP_dataset, OPSMAP_choices, OPSMAP_externalChoices, OPSMAP_relevance);
          }    
        });
      })

    } else {
      OPSMAP_loadDataset(cfgD.dataset, function(data){
        var csv = formatData(data)
        OPSMAP_dataset = Papa.parse(csv, { header: true, delimiter: true }).data;
        OPSMAP_remainingSources--;
        if (!OPSMAP_remainingSources) {
            OPSMAP_processData(OPSMAP_fields, OPSMAP_dataset, OPSMAP_choices, OPSMAP_externalChoices, OPSMAP_relevance);
        }    
      });  
    }

    if (cfgD.loadExternal) {
        OPSMAP_loadCSV(cfgD.externalChoices, function(data){
            OPSMAP_externalChoices = data;
            OPSMAP_remainingSources--;
            if (!OPSMAP_remainingSources) {
                OPSMAP_processData(OPSMAP_fields, OPSMAP_dataset, OPSMAP_choices, OPSMAP_externalChoices, OPSMAP_relevance);
            }    
        });
    }

    OPSMAP_loadCSV(cfgD.fields, function(data){
        OPSMAP_fields = data;
        OPSMAP_remainingSources--;
        if (!OPSMAP_remainingSources) {
            OPSMAP_processData(OPSMAP_fields, OPSMAP_dataset, OPSMAP_choices, OPSMAP_externalChoices, OPSMAP_relevance);
        }    
    });

    if (cfgD.loadChoices) {
        OPSMAP_loadCSV(cfgD.choices, function(data){
            OPSMAP_choices = data;
            OPSMAP_remainingSources--;
            if (!OPSMAP_remainingSources) {
                OPSMAP_processData(OPSMAP_fields, OPSMAP_dataset, OPSMAP_choices, OPSMAP_externalChoices, OPSMAP_relevance);
            }    
        });
    }

    if (cfgD.loadRelevance) {
        OPSMAP_loadCSV(cfgD.relevance, function(data){
            OPSMAP_relevance = data.reduce(function(acc, curr) {
              acc[curr.name] = curr.condition
              return acc;
            });
            OPSMAP_remainingSources--;
            if (!OPSMAP_remainingSources) {
                OPSMAP_processData(OPSMAP_fields, OPSMAP_dataset, OPSMAP_choices, OPSMAP_externalChoices, OPSMAP_relevance);
            }    
        });
    }

    function getClusterOptions(dataset) {
      var object = dataset.reduce(function(acc, curr) {
        acc[curr["cluster "]] = true;
        return acc;
      }, {});

      var clusters = Object.keys(object).sort(function(o1, o2) { return o1 < o2 ? -1 : 1 })

      var options = clusters
        .map(function(cluster) { return '<option value="' + cluster.split('/')[0] + '">' + cluster + '</option>'; });
      
      options.unshift('<option value="all">All</option>')
      
      return  options.join('');
    }

    function OPSMAP_processData(fields, dataset, choices, externalChoices, relevance) {       
      var select = document.querySelector('#cluster-select')
      select.innerHTML = getClusterOptions(dataset)

      select.addEventListener('change', function (ev) {
        var cluster = ev.target.value;

        // siteLayers.forEach(function(layer) { console.log(layer.options.icon.options) })

        var layers = (cluster === 'all') ? siteLayers
          : siteLayers.filter(function(layer) {
            return layer.options.obj["cluster "].split('/')[0] === cluster; // || /selected/.test(layer.options.icon.options.iconUrl)
          });
        
        csv_markers.clearLayers();
        csv_markers.addLayers(layers);

        map.fitBounds(csv_markers.getBounds(), { maxZoom: 10, padding: [15, 15], duration: 500 })

        marker_list = layers.map(function(layer) {
          var v = layer.options.obj;
          return {
            'name': toProperCase(v[config.data.name]),
            'coordo': [parseFloat(v[config.data.lat]), parseFloat(v[config.data.lon])],
            'properties': v   
          };
        })

        $('.typeahead').data('typeahead').source = marker_list;
      })

      processDataset(fields, dataset, choices, externalChoices, relevance);
    }

    function processDataset(fields, dataset, choices, externalChoices, relevance) {

                $.each(dataset, function(i, v) {
                    if (v[config.data.lat] && v[config.data.lon]) {
                      var tValues = config.data.expectedTypes;
                      var t = v[config.data.type];
                      t = t.toLowerCase();
                      var icon = L.icon({
                        iconUrl: tValues.indexOf(t) !== -1 ? 'img/markers_icon/' + t + '.svg' : 'img/markers_icon/default.svg',
                        iconSize: [20, 20],
                        iconAnchor: [10, 10],
                        popupAnchor: [0, -10]
                      });
                      var iconHovered = L.icon({
                        iconUrl: tValues.indexOf(t) !== -1 ? 'img/markers_icon/' + t + '_hovered.svg' : 'img/markers_icon/default_hovered.svg',
                        iconSize: [22, 22],
                        iconAnchor: [11, 11],
                        popupAnchor: [0, -11]
                      });
                      var iconSelected = L.icon({
                        iconUrl: tValues.indexOf(t) !== -1 ? 'img/markers_icon/' + t + '_selected.svg' : 'img/markers_icon/default_selected.svg',
                        iconSize: [22, 22],
                        iconAnchor: [11, 11],
                        popupAnchor: [0, -11]
                      });
                      var marker = new L.marker([parseFloat(v[config.data.lat]), parseFloat(v[config.data.lon])], {
                        icon: icon,
                        riseOnHover: true,
                        obj: v
                      }).bindPopup(toProperCase(v[config.data.name]), { autoPan: false });
                      marker.options.iconSet = {};
                      marker.options.iconSet.icon = icon;
                      marker.options.iconSet.iconHovered = iconHovered;
                      marker.options.iconSet.iconSelected = iconSelected;
                      marker.on('mouseover', function(e) {
                        this.openPopup();
                        if (this.options.icon !== this.options.iconSet.iconSelected) {
                          this.setIcon(this.options.iconSet.iconHovered);
                        }
                      });
                      marker.on('mouseout', function(e) {
                        this.closePopup();
                        if (this.options.icon !== this.options.iconSet.iconSelected) {
                          this.setIcon(this.options.iconSet.icon);
                        }
                      });
                      if (config.appConfig.MapClustering) {
                        marker.on('click', function(e) {
                          this.setIcon(this.options.iconSet.iconSelected);
                          this.setZIndexOffset(1000);
                          if (selectionArray.length) {
                            selectionArray[0].setIcon(selectionArray[0].options.iconSet.icon);
                            if (selectionLayer.getLayers().length) {
                              selectionLayer.removeLayer(selectionArray[0]);
                              // csv_markers.addLayer(selectionArray[0]);
                            }
                            selectionArray.splice(0, 1);
                          }
                          selectionArray.push(this);
                          info(this.options.obj, fields, ch, map, relevance);
                          $('.typeahead').val('');
                        });
                      } else {
                        marker.on('click', function(e) {
                          this.setIcon(this.options.iconSet.iconSelected);
                          this.setZIndexOffset(1000);
                          if (selectionArray.length) {
                            selectionArray[0].setIcon(selectionArray[0].options.iconSet.icon);
                            selectionArray.splice(0, 1);
                          }
                          selectionArray.push(this);
                          info(this.options.obj, fields, ch, map, relevance);
                          $('.typeahead').val('');
                        });
                      }

                      csv_markers.addLayer(marker);
                      siteLayers.push(marker);
                      marker_list.push({
                        'name': toProperCase(v[config.data.name]),
                        'coordo': [parseFloat(v[config.data.lat]), parseFloat(v[config.data.lon])],
                        'properties': v
                      });
                    }
                  });
        
                  // RUN ZOOM INTERACTION - Part of action described above.
                  if (config.appConfig.MapMaxZoom) {
                    if (map.getZoom()<config.appConfig.MapMaxZoom) {
                      map.setZoom(map.getZoom() + 1);
                    }
                  }        
        
                  //LEGEND GLOBALS
                  var legend = new Leaflet_mapLegend('bottomright', csv_markers, config.data.expectedTypes, config.dictionary, config.appConfig.Language, true, dataset, config.data.type, true);
                  legend.addTo(map);

                  if (config.appConfig.MapClustering) {
                    map.on('zoomstart', function() {
                      if (selectionArray.length) {
                        csv_markers.removeLayer(selectionArray[0]);
                        selectionArray[0].addTo(selectionLayer);
                      }
                    });

                    map.on('movestart',  function() {
                      if (selectionArray.length) {
                        csv_markers.removeLayer(selectionArray[0]);
                        selectionArray[0].addTo(selectionLayer);
                      }
                    });

                    map.on('click', function() {
                      $('#left_of_map').empty();
                      $('#below_map').empty();
                      if (selectionArray.length) {
                        selectionArray[0].setIcon(selectionArray[0].options.iconSet.icon);
                        if (selectionLayer.getLayers().length) {
                          selectionLayer.removeLayer(selectionArray[0]);
                          // csv_markers.addLayer(selectionArray[0]);
                        }
                        selectionArray.splice(0, 1);
                      }
                      $('.typeahead').val('');
                    });
                  } else {
                    map.on('click', function() {
                      $('#left_of_map').empty();
                      $('#below_map').empty();
                      if (selectionArray.length) {
                        selectionArray[0].setIcon(selectionArray[0].options.iconSet.icon);
                        selectionArray.splice(0, 1);
                      }
                    });
                  }

                  $('.typeahead').typeahead({
                    source: marker_list,
                    afterSelect: function(item) {
                      info(item.properties, fields, ch, map, relevance);
                      function interaction(obj) {
                        csv_markers.zoomToShowLayer(obj);
                        obj.setIcon(obj.options.iconSet.iconSelected);
                        obj.setZIndexOffset(1000);
                        var run = true;
                        if (selectionArray.length) {
                          if (toProperCase(selectionArray[0].options.obj[config.data.name]) !== item.name) {
                            selectionArray[0].setIcon(selectionArray[0].options.iconSet.icon);
                            if (config.appConfig.MapClustering) {
                              if (selectionLayer.getLayers().length) {
                                selectionLayer.removeLayer(selectionArray[0]);
                                // csv_markers.addLayer(selectionArray[0]);
                              }
                            }
                            selectionArray.splice(0, 1);
                          } else {
                            run = false;
                          }

                        }
                        if (run) {
                          selectionArray.push(obj);
                          obj.openPopup();
                        }
                      }

                      var found = false;
                      $.each(csv_markers.getLayers(), function(i, v) {
                        if (item.name === toProperCase(v.options.obj[config.data.name])) {
                          interaction(v);
                          found = true;
                          return false;
                        }
                      });
                      if (!found) {
                        $('.mapLegendCh:checkbox:not(:checked)').click();
                        $.each(csv_markers.getLayers(), function(i, v) {
                          if (item.name === toProperCase(v.options.obj[config.data.name])) {
                            interaction(v);
                            found = true;
                            return false;
                          }
                        });
                      }
                      $('.typeahead').val('');
                    }
                  });

                  //layer switcher
                  var baseMaps = {
                    'OSM': mapnik,
                    'OSM_HOT': osm_HOT,
                    'Esri Satellite': esri_satellite,
                    'Esri Light Grey': esri_lightGrey,
                    'Esri Streets': esri_street
                  };
                  var overlayMaps = {
                    'Sites': csv_markers
                  };
                  L.control.layers(baseMaps, overlayMaps).addTo(map);

                  $('.typeahead').show();
                  $('.typeahead').val('');
                  $('#left_of_map').show();

                  var c = config.data.categories;

                  //map analysis
                  for (var i in c) {
                    $('#dropdown-list').append('<li class="dropdown-submenu"><a href="#"><img height="15px" src="img/ocha_icon/' + c[i].icon + '.png">&nbsp;' + c[i].alias + '</a><ul class="dropdown-menu" id="submenu_' + c[i].name + '"></ul></li>')
                  }
                  for (var i in fields) {
                    $('#submenu_' + fields[i].category + '').append('<li><a href="#">' + fields[i].alias + '</a></li>')
                  }

                  //$('#analysis').show();

                  //********  when clicking on a marker  ********//
//									$('.progress-bar').css('width', '100%');
                  swal.close();        
        
        
               // Create dictionary for choices    -- TODO : Simplify
        var ch = {};
        $.each(choices, function(i, v) {
            if (!ch[v.list_name]) {
              ch[v.list_name] = {};
            }
            // ch[v.list_name][v.name] = v['label::English'];

            ch[v.list_name][v.name] = v['label'];
            // Problem des labels ==> tout mettre en anglais ou juste rajouter label::English ?
        });

        


        // Create dictionary for external choices   -- TODO : Simplify
        var ext = {};
        $.each(externalChoices, function(i, v) {
            if (!ext[v.list_name]) {
              ext[v.list_name] = {};
            }
            ext[v.list_name][v.name] = v['label'];
        });
        
        // Merge dictionaries   -- TODO : Simplify
        $.each(ext, function(k, v) {
            if (!ch[k]) {
              ch[k] = v;
            }
        });   
        
        
    }

    var circleMarker = new L.circleMarker([0, 0], {
      radius: 20,
      weight: 5,
      opacity: 1,
      color: '#286090',
      fillOpacity: 0.2,
      fillColor: '#286090'
    });

    map.on('startprint', function(e) {
      $.each(csv_markers.getLayers(), function(i, v) {
        if (e.camp === toProperCase(v.options.obj[config.data.name])) {
          circleMarker.setLatLng(v.getLatLng());
          map.addLayer(circleMarker);
        }
      });
    }, this);

    map.on('endprint', function() {
      map.removeLayer(circleMarker);
    }, this);

                      
});