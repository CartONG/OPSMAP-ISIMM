/* OPSMAP displayInfos.js - Dec. 2017 - CartONG */

function isRelevant(fieldName, relevanceConditions, fieldValues) {

    if(!relevanceConditions
        || relevanceConditions[fieldName] === undefined
        || relevanceConditions[fieldName] === '') {
        return true;
    }

    var condition = relevanceConditions[fieldName];
    var regex1 = /^\${.*} = '.*'$/;
    var regex2 = /^selected\(\${.*}, '.*'\)$/;

    if(regex1.test(condition)) {
        var split = condition.split(' = ');
        var otherField = split[0].replace(/\${|}/g, '');
        var otherFieldValue = split[1].replace(/'/g, '');
        return fieldValues[otherField] === otherFieldValue;
    }

    if(regex2.test(condition)) {
        var split = condition.split(', ');
        var otherField = split[0].replace(/selected\(\${|}/g, '');
        var otherFieldValue = split[1].replace(/'|\)/g, '');
        return fieldValues[otherField].indexOf(otherFieldValue) > -1;
    }

    return true;
}

function info(h, fields, ch, map, relevance){

    // Get an object with csv field names as properties, to be used for relevance process
    var fieldValuesByName = fields.reduce(function(acc, curr) {
        acc[curr.csv_field] = h[curr.csv_field];
        return acc;
    });

    //emptying divs   
    $('#left_of_map').empty();
    $('#below_map').empty();

    var c = config.data.categories;

    /*
    var dpHtml = '<div class="dropdown">';
    dpHtml += '<button id="buttonExport" class="btn btn-primary dropdown-toggle" type="button" data-toggle="dropdown"><span class="glyphicon glyphicon-file"></span> Export as PDF</button>';
    dpHtml += '<ul class="dropdown-menu">';
    dpHtml += '<li><a class="exportB" data-export="page">Export full page</a></li>';
    dpHtml += '<li><a class="exportB" data-export="doc">Export multi-page document</a></li>';
    dpHtml += '</ul>';
    dpHtml += '</div>';
    */

    var dpHtml = '<button id="buttonExport" class="btn btn-primary" data-export="doc" type="button"><span class="glyphicon glyphicon-file"></span> Export as PDF</button>';
    
    var csvData = JSON.parse(JSON.stringify(h))
    delete csvData['geopoint_latitude'];
    delete csvData['geopoint_longitude'];

    var csv = Papa.unparse([csvData]);
    var now = new Date();
    var exportDate = now.toISOString().split('T')[0].split('-').reverse().join('_');
    var campName = /\//.test(h[config.data.name]) ? h[config.data.name].split('/')[0] : h[config.data.name]

    console.log(campName);

    var CSVExportHtml = '<a \
        id="csv-export-link" \
        href="' + encodeURI('data:text/csv;charset=utf-8,' + csv) + '" \
        download="' + campName + '_' + exportDate + '.csv" \
        class="btn btn-primary">\
            <span class="glyphicon glyphicon-th-list"></span> Export Camp Data\
    </a>';

    $('#left_of_map').append(dpHtml);
    $('#left_of_map').append('<br />');
    $('#left_of_map').append(CSVExportHtml);
    $('#left_of_map').append('<h3><span id="itemTitle">' + toProperCase(h[config.data.name]) + '</span><br><small id="itemDate">Last Update: ' + config.data.dateParser(h[config.data.last_update]) + '</small></h3>');

    //recreating divs								
    var cl = c.length;
        if (cl > 0){
            $('#left_of_map').append("<div><h4 class='categoryTitle' data-cat='" + c[0].name + "'><img class='catImage'  height='30px' data-cat='" + c[0].name + "' data-dataurl='" + c[0].dataUrl + "' src='img/ocha_icon/"+c[0].icon+".png'>&nbsp;"+c[0].alias+"</h4><div  id='"+c[0].name+"'></div></div>");

            ///
            var nb_col = 3;
            var rcl = cl-1;
            for (var i = 1; i < nb_col+1; i++){
                $('#below_map').append('<div id="col_'+i+'" class="col-md-'+12/nb_col+'"></div>')
            }
            for (var i = 1; i <= rcl; i++){
                var y = i%nb_col;
                if (y==0){y=nb_col}
                $('#col_'+ c[i].col).append("<div class='row categories'><h4 class='categoryTitle' data-cat='" + c[i].name + "'><img class='catImage' height='30px' data-cat='" + c[i].name + "' data-dataurl='" + c[i].dataUrl + "' src='img/ocha_icon/"+c[i].icon+".png'>&nbsp;"+c[i].alias+"</h4><div id='"+c[i].name+"'></div></div>")
            }
            ///
        }

    var relevant = true;

    //looping on fields and populating
    for (var i in fields){
        var f = fields[i];
        if (h[f.csv_field]){
            relevant = isRelevant(f.csv_field, relevance, fieldValuesByName);
            if (f.chart){	
            } //if it's a chart we add nothing here
            else { // if it's not a chart
                var tl = getTrafficLight(f.traffic_light,h[f.csv_field]);
                var htmlStr = "";
                if (f.type === "list"){
                    if(h[f.csv_field] !== " "){
                        var array = h[f.csv_field].split(' ');
                        var list = [];
                        if (ch[f.choices]){
                            $.each(array, function(i, v){
                                if(ch[f.choices][v]){
                                    list.push(ch[f.choices][v]);
                                } else {
                                    list.push(v);
                                }
                            });
                        } else {
                            $.each(array, function(i, v){
                                list.push(v);
                            });
                        }
                        if (list.length > 1){
                            htmlStr += '<p>';
                            if(tl !== "N/A"){
                                htmlStr += '<img class="tl" data-field="' + f.csv_field + '" data-tlight="' + tl + '" src="img/tl/tl-' + tl + '.svg">&nbsp;';							
                            }
                            htmlStr += '<span class="infoEl" data-field="' + f.csv_field + '" data-cat="' + f.category + '" data-chart="false">' + f.alias + ' : </span>';
                            htmlStr += '<ul id="list_'+i+'"></ul></p>';
                            $("#"+f.category).append(htmlStr);
                            for (var y in list){
                                if (list[y] !== ""){
                                    valToDisplay = relevant ? list[y] : '-'
                                    $("#list_"+i).append('<li><b class="infoVal" style="color:#4095cd" data-field="' + f.csv_field + '">' + (relevant ? list[y] : '-') + '</b></li>');
                                }
                            }
                        }
                        else {
                            htmlStr += '<p>';
                            if(tl !== "N/A"){
                                htmlStr += '<img class="tl" data-field="' + f.csv_field + '" data-tlight="' + tl + '" src="img/tl/tl-'+tl+'.svg">&nbsp;';														
                            }
                            htmlStr += '<span class="infoEl" data-field="' + f.csv_field + '" data-cat="' + f.category + '" data-chart="false">' + f.alias + ' : </span>';
                            htmlStr += '<b class="infoVal" style="color:#4095cd" data-field="' + f.csv_field + '">' + (relevant ? list[0] : '-') + '</b></p>';				
                            $("#"+f.category).append(htmlStr);
                        }
                    }
                } else if (f.type === "date"){
                    if (h[f.csv_field] !== "" && h[f.csv_field] !== " "){
                        htmlStr += '<p>';
                        if(tl !== "N/A"){
                            htmlStr += '<img class="tl" data-field="' + f.csv_field + '" data-tlight="' + tl + '" src="img/tl/tl-'+tl+'.svg">&nbsp;';														
                        }
                        htmlStr += '<span class="infoEl" data-field="' + f.csv_field + '" data-cat="' + f.category + '" data-chart="false">' + f.alias + ' : </span>';
                        htmlStr += '<b class="infoVal" style="color:#4095cd" data-field="' + f.csv_field + '">' + (relevant ? config.data.dateParser(h[f.csv_field]) : '-') + '</b></p>';			
                        $("#"+f.category).append(htmlStr);									
                    }
                } else if (f.type === "exception"){

                }
                else {
                    var val;

                    if (f.choices){
                        val = ch[f.choices][h[f.csv_field]];																						
                    } else {
                        val = h[f.csv_field];
                    }

                    if (h[f.csv_field] !== "" && h[f.csv_field] !== " "){
                        htmlStr += '<p>';
                        if(tl !== "N/A"){
                            htmlStr += '<img class="tl" data-field="' + f.csv_field + '" data-tlight="' + tl + '" src="img/tl/tl-'+tl+'.svg">&nbsp;';														
                        }
                        htmlStr += '<span class="infoEl" data-field="' + f.csv_field + '" data-cat="' + f.category + '" data-chart="false">' + f.alias + ' : </span>';
                        htmlStr += '<b class="infoVal" style="color:#4095cd" data-field="' + f.csv_field + '">'+(relevant ? val : '-')+'</b></p>';							
                        $("#"+f.category).append(htmlStr);									
                    }
                }
            }
        }
    }

    /* Chart definition.
     * Might be customised along with config.data Object in config.js.
     */
    
    // charts
    for (var i in config.data.charts){
        var chartValidation = true;

        //create the graphs config
        var g = config.data.charts[i];

        //filter fields on "chart IS NOT NULL"
        var chartFields = fields.filter(function(obj){
            return obj.chart;
        });

        if (g.name === "age_pyramid"){  // si le graph est la pyramide des ages
            g.config.data.datasets[0].data = [];
            g.config.data.datasets[1].data = [];
            for (var y in chartFields){
                var f = chartFields[y];
                if(h[f.csv_field] === "" || h[f.csv_field] === " "){
                    chartValidation = false;
                }
                if (g.name == f.chart){
                    if (h[f.csv_field] > 0){
                        if (f.chart_details == "f"){
                            // g.config.data.datasets[0].data.push(Number(h[f.csv_field]))
                            g.config.data.datasets[0].data.unshift(Number(h[f.csv_field]))
                        }
                        else if (f.chart_details == "m"){
                            // g.config.data.datasets[1].data.push(Number(0-h[f.csv_field]))
                            g.config.data.datasets[1].data.unshift(Number(0-h[f.csv_field]))
                        }
                    }
                }

            }
            g.config.options.tooltips = {
                    callbacks: {
                        obj: function(t,d){
                            return d.datasets[t[0].datasetIndex].label+": "+d.labels[t[0].index];
                        },
                        label: function(t,d) {
                            if (t.datasetIndex == 1){
                                var invert = Number(0-d.datasets[1].data[t.index])
                                return invert;
                            }
                            else {
                                return d.datasets[0].data[t.index];
                            }
                        }
                    }
                }
        }
        else { // autres graphs
            g.config.data.datasets[0].data = [];
            g.config.data.datasets[0].backgroundColor = [];
            g.config.data.labels = [];
            var data_list = [];
            for (var y in chartFields){
                var f = chartFields[y]
                if (g.name == f.chart){
                    if (h[f.csv_field] > 0){
                        data_list.push({"a":f.alias+" ("+Number(h[f.csv_field])+")","v": Number(h[f.csv_field])})
                    }
                }
            }

            data_list.sort(function(a, b) {
                return parseFloat(b.v) - parseFloat(a.v);
            });
            var other_label = ["Others:"];
            if (data_list.length > 5){
                for (var i in data_list){
                    if (i > 4){
                        data_list[4].v = (data_list[4].v)+(data_list[i].v);
                    }
                    if (i > 3){
                        var t = data_list[i].a;
                        other_label.push(t);
                    }
                }
                data_list[4].a = "Others"
                var de = data_list.length - 5;
                data_list.splice(5,de);
                var lb = other_label;
                g.config.options.tooltips = {
                    callbacks: {
                        label: function(t,d) {
                            if (t.index == 4){
                            return  lb;
                            }
                            else{
                                return d.labels[t.index];
                            }
                        }
                    }
                }
            }
            for (var i in data_list){
                g.config.data.datasets[0].data.push(data_list[i].v);
                g.config.data.datasets[0].backgroundColor.push(color_list[i]);
                g.config.data.labels.push(data_list[i].a);
            }
        }

        if(chartValidation){
            //creates the graphs div
            $("#"+g.category).append('<div class="canvas-holder" style="width:100%"><canvas height="'+g.height+'" id="chart_'+g.name+'" /></div>');										
            //generates the graphs
            var ctx = document.getElementById("chart_"+g.name).getContext("2d");
            var chart = new Chart(ctx, g.config);
            $("#chart_" + g.name)
              .addClass('infoEl')
              .attr('data-cat', f.category)
              .attr('data-chart', true);
        } else {
            $("#"+g.category).append("<p><img class='tl' src='img/tl/tl-null.svg'>&nbsp;<b style='color:#808080'><i>Data not available for age pyramid chart</i></b></p>")
        }

    }
    // $('.exportB').on('click', function(){
    $('#buttonExport').on('click', function(){
        console.log(this)


        var e = this.dataset.export;
        if (e === "page") {
            exportPdf(map);
        } else if (e === "doc") {
            exportPdfDoc(map);
        }
    });		
}
