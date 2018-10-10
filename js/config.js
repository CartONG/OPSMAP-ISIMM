/* OPSMAP config.js - Dec. 2017 - CartONG */

var config = {};
config.appConfig = {
// General
    // Title - STRING.
    Title : "ISIMM Plus (OPSMAP)",
    
    // Language - STRING : Works only for the dictionary.
    Language : "en",

// Map options
    // MapClustering - BOOLEAN : Enable clustering on markers (Cluster radius per zoom level to be defined below [cf:"maxClusterRadius"]).
    MapClustering: true,

    // MapMaxBounds - BOOLEAN : Enable bounds constraint on default map's view.
    MapMaxBounds: true,

    // MapMinZoom - INTEGER : Default map's min zoom (the min zoom has the largest extent), set to 'false' (BOOLEAN) for leaflet's default setup.
    MapMinZoom: 4,

    // MapMaxZoom - INTEGER : Default map's max zoom (the max zoom has the smallest extent), set to 'false' (BOOLEAN) for leaflet's default setup.
    MapMaxZoom: 22,

    // DefaultZoom - INTEGER : Default map's zoom level on start.
    DefaultZoom: 8,

    // DefaultCenter - ARRAY : Array of FLOATs, coordinates for init map centre [y, x].
    DefaultCenter: [36.40, 37.50]
};

// config.dictionary : set a dictionnary for dataset values - each value listed from the dataset as property of the dictionnary object holds an object containing matching aliases for given languages.
config.dictionary = {
    IS: {
        en: "Informal Settlement"
    },
    PC: {
        en: "Planned Camp"
    }    
};

config.data = {
	 
    // In case data comes from CKAN
    ckan: true,
    
    // URL of the CKAN
    ckanURL: "https://ckanviz.swige.unhcr.org",

		// URL of the dataset or CKAN dataset ID if data comes from CKAN
		dataset: "syr-cccm-ismi-camps",
    
    // Columns prefixes to remove from dataset
    datasetPrefixesToRemove: [
      'group_general_info/',
      'group_demographics/',
      'group_population_movement/',
      'group_camp_management/',
      'group_infrastructure/',
      'group_protection/',
      'group_food/',
      'group_shelter/',
      'group_nfi/',
      'group_wash/',
      'group_health/',
      'group_education/'
    ],

    // Columns to remove from dataset
    datasetColumnsToRemove: [
      'what_are_the_reasons_of_displacement/',
      'type_of_the_committee/',
      'what_type_power_source_available/',
      'what_type_power_source_needed/',
      'main_safety_concerns_for_idps/',
      'type_of_food_distributed/',
      'frequency_of_food_distribution/',
      'what_meals_provided_in_a_day/',
      'idps_mainly_get_their_food_from/',
      'type_and_number_of_shelters/',
      'what_type_fuel_distributed/',
      'what_is_fuel_used_for/',
      'main_sources_of_drinking_water/',
      'main_means_of_solid_waste_disposal/'
    ],

		// URL of the fields definition
		fields : "data/fields.csv",
    
    // Load choices, set to false if no choices requested
    loadChoices : true,

    // URL of the choices
    choices : "data/choices.csv",

    // Load external choices, set to false if no external choices requested
    loadExternal : true,

    // URL of the external choices
    externalChoices : "data/external_choices.csv",    
		
    // Load relevance, set to false if there is no relevance file
    loadRelevance : true, 

    // URL of relevance file
    relevance : "data/relevance.csv",

		// Latitude field
		lat : "geopoint_latitude",
		
		// longitude field
		lon : "geopoint_longitude",
		
		// Name field
		name : "site_name",
		
		// Unique identifier field
		uid : "site_name",
		
		// Last update field
		last_update : "last update",
    
        // Date parser : function that get a date as string from the dataset as parameters and returns it properly formatted for display
        dateParser : function(rawDate){
              return getJsDateFromExcel(rawDate);
        },
		
		// Type (field for icon)
		type : "site_type",
		
		// Expected types (array of expected values for types - values associated with icon set)
		expectedTypes : ["IS", "PC"],	
		
		// Categories of attributes
		categories : [
			/*
      {
				name: "Key_informant_information",
				alias: "Key informant information",
				icon: "activity_meeting_60px_bluebox",
				col: 0
			},
      */
      {
        name: "General",
        alias: "General",
        icon: "camp_idp_refugee_camp_60px_bluebox",
        col: 0
      },
      /*
			{
				name: "Geographic_Information",
				alias: "Geographic Information",
				icon: "socioeconomic_urban_rural_60px_bluebox",
				col: 1
			},
      */
			{
				name: "Protection",
				alias: "Protection",
				icon: "cluster_protection_60px_bluebox",
				col: 2
			},						
			{
				name: "Displacement",
				alias: "Displacement",
				icon: "activity_deployment_60px_bluebox",
				col: 3
			},
			{
				name: "Camp_Management",
				alias: "Camp Management",
				icon: "camp_idp_refugee_camp_60px_bluebox",
				col: 1
			},
			{
				name: "Shelter",
				alias: "Shelter",
				icon: "cluster_shelter_60px_bluebox",
				col: 2
			},		
			{
				name: "WASH",
				alias: "Water, sanitation and hygiene",
				icon: "wash_sanitation_60px_bluebox",
				col: 2
			},
			{
				name: "Food_Security",
				alias: "Food security",
				icon: "food_NFI_food_60px_bluebox",
				col: 3
			},
			{
				name: "Health",
				alias: "Health",
				icon: "cluster_health_60px_bluebox",
				col: 3
			},			
			{
				name: "Education",
				alias: "Education",
				icon: "activity_learning_60px_bluebox",
				col: 3
			},
      /*
			{
				name: "Nutrition",
				alias: "Nutrition",
				icon: "cluster_nutrition_60px_bluebox",
				col: 2
			},
			{
				name : "Communication",
				alias : "Communication",
				icon : "activity_public_information_60px_bluebox",
				col: 3
			},
			{
				name : "Validation",
				alias : "Validation",
				icon : "activity_preparedness_60px_bluebox",
				col: 3
			},
      */
      {
        name: 'Demographics',
        alias: 'Demographics',
        icon: 'activity_leadership_60px_bluebox',
        col: 1
      },
      {
        name: 'Infrastructure',
        alias: 'Infrastructure',
        icon: 'infrastructure_building_60px_bluebox',
        col: 1
      }
		],
		
		
		//Charts
		charts : [
			// Vulnerable type
//			{
//				name: "vulnerable_type",
//				height: "200",
//				category: "vulnerable",
//				config: {
//					type: "pie",
//					data:{
//						datasets:[
//							{
//								data:[],
//								backgroundColor: []
//							}
//						],
//						labels:[]
//					},
//					options: {
//						title:{
//							display:true,
//							text:"Vulnerable population"
//						},
//						responsive: true,
//						legend:{
//							position:'bottom',
//							labels: {
//								padding:4,
//								boxWidth:10
//							}
//						}
//					}
//				}	
//			},
			
			// Shelter type
			
			//keep only the 4 biggest + others
			
			// {
				// name: "shelter_type",
				// height: "150",
				// category: "shelter",
				// config: {
					// type: "pie",
					// data:{
						// datasets:[
							// {
								// data:[],
								// backgroundColor: []
							// }
						// ],
						// labels:[]
					// },
					// options: {
						// title:{
							// display:true,
							// text:"Shelters"
						// },
						// responsive: true,
						// legend:{
							// position:'bottom',
							// labels: {
								// padding:4,
								// boxWidth:10
							// }
						// }
					// }
				// }	
			// },
			
			// age_pyramid
			
			{
				name: "age_pyramid",
				height: "200",
				category: "Demographics",
				config: {
					type: "horizontalBar",
					data:{
						datasets: [{
							label: "Female",
							backgroundColor: '#f37788',
							data:[]
						}, 
						{
							label:"Male",
							backgroundColor: '#4095cd',
							data:[]
						}],
						// labels: ["0-7m", "7m-4", "5-12", "13-17", "18-35","+60"]
					 labels:['+60', '18-35', '13-17', '5-12', '7m-4', '0-6m']
          },
					options: {
              // Elements options apply to all of the options unless overridden in a dataset
              // In this case, we are setting the border of each horizontal bar to be 2px wide
              responsive: true,
              legend: {
                  position: 'top',
  	  	  				reverse: true
              },
              title: {
                  display: true,
                  text: 'Age Pyramid'
              },
					    scales: {
						      xAxes: [{
                      ticks: {
                          callback: function(label, index, labels) {
                              if (label < 0){
                                  return 0-label;
                              } else {
                                  return label
                              }
                          }
                      }
                  }],
                  yAxes: [{
                      stacked: true,
							        barThickness: 15
                  }]
					    }
          }
				}
    }]
};

// list of colors for graphs
var color_list = ['#0072bc','#4095cd','#7fb8dd','#bfdcee','#bfbfbf'];


config.tlRules = {
    "percentagegreen" : function(v){
        if (v === "more_75%" || v === "more 75%" || v === "More than 75%") {
            return "success";
        }
        else if (v === "btw_50%_75%" || v === "btw 50% 75%" || v === "Between 50% and 75%") {
            return "warning";
        }
        else {
            return "danger";
        }
    },
    "percentagered" : function(v) {
        if (v === "more_75%" || v === "more 75%" || v === "More than 75%") {
            return "danger";
        }
        else if (v === "btw_50%_75%" || v === "btw 50% 75%" || v === "btw 25% 50%" || v === "btw_25%_50%" || v === "Between 50% and 75%" || v === "Between 25% and 50%") {
            return "warning";
        }
        else {
            return "success";
        }
    },
    "distance" : function(v) {
        var Vn = parseInt(v);
        if (Vn > 30){
            return "danger";
        }
        else if (Vn <= 30 && Vn > 20) {
            return "warning";
        }
        else if (Vn <= 20 && Vn > 10) {
            return "mid";
        }
        else {
            return "success";
        }       
    },
    "distanceWater" : function(v) {
        var Vn = parseInt(v);
        if (Vn > 10){
            return "danger";
        }
        else if (Vn <= 10 && Vn > 5) {
            return "warning";
        }
        else {
            return "success";
        }
    },
    "waterDays" : function(v) {
        var Vn = parseInt(v);
        if (Vn < 4) {
            return "danger";
        }
        else if (Vn >= 5 && Vn < 7) {
            return "warning";
        }
        else {
            return "success";
        }
    },
    "wasteDisposal" : function(v){
        if (v === "daily" || v === "weekly") {
            return "success";
        }
        else if (v === "monthly"){
            return "warning";
        }
        else {
            return "danger";
        }
    },
    "foodDist" : function(v){
        if (v === "daily" || v === "twice daily"){
            return "success";
        }
        else if (v === "weekly"){
            return "warning";
        }
        else {
            return "danger";
        }
    },
    "nonegreendnk" : function(v){
        if (v === "none" || v === "unknown" || v === "None" || v === "Unknown" || v === "No" || v === "no"){
            return "success";
        }
        else if (v === "dnk"){
            return "unknown";
        }
        else {
            return "danger";
        }
    },
    "yesgreenManagement" : function(v){
        if (v === "no_management"){
            return "danger";
        }
        else {
            return "success";
        }
    },
    "forcered" : function(v){
        return "danger";
    },
    "committees" : function(v){
        return /women_committee/.test(v) ? 'success' : 'danger';
    },
    "percentage_committee" : function(v) {
      return handlePercentageRules(
        ['100_percent','76_99_percent','51_75_percent','26_50_percent'],
        ['1_25_percent'],
        ['0_percent'],
        v
      );
    },
    "percentage_nfis" : function(v) {
      return handlePercentageRules(
        ['100_percent','76_99_percent'],
        ['51_75_percent'],
        ['26_50_percent','1_25_percent','0_percent'],
        v
      );
    },
    "percentage_health" : function(v) {
      return handlePercentageRules(
        ['0_percent'],
        ['1_25_percent'],
        ['100_percent','76_99_percent','51_75_percent','26_50_percent'],
        v
      );
    },
    "percentage_infrastructure" : function(v) {
      return handlePercentageRules(
        ['100_percent','76_99_percent'],
        ['51_75_percent','26_50_percent'],
        ['1_25_percent','0_percent'],
        v
      );
    },
    "percentage_mob_internet" : function(v) {
      return handlePercentageRules(
        ['100_percent','76_99_percent'],
        ['51_75_percent','26_50_percent'],
        ['1_25_percent','0_percent'],
        v
      );
    },
    "percentage_food" : function(v) {
      return handlePercentageRules(
        ['100_percent'],
        ['76_99_percent'],
        ['51_75_percent','26_50_percent','1_25_percent','0_percent'],
        v
      );
    },
    "percentage_edu" : function(v) {
      return handlePercentageRules(
        ['100_percent','76_99_percent'],
        ['51_75_percent'],
        ['26_50_percent','1_25_percent','0_percent'],
        v
      );
    },
    "rentpayment" : function(v) {
      return v === 'no_rent_no_services' ? 'success'
        : /pay_rent|perform_services|pay_rent_and_perform_services/.test(v) ? 'danger'
        : 'unknown'
    },
    "powersourceavailable" : function(v) {
      return v === 'not_available' ? 'danger'
        : /national_grid|generator|solar_energy/.test(v) ? 'success'
        : 'unknown'
    },
    "safetyconcerns": function(v) {
      return v === '' ? 'success' : 'danger';
    },
    "fooddistribution": function(v) {
      return v === 'daily' ? 'success'
        : /weekly|monthly/.test(v) ? 'warning'
        : /longer_than_a_month|other_specify/.test(v) ? 'danger'
        : 'unknown'
    },
    "wastedisposal": function(v) {
      return /piled_up_on_main_road|burn|dump_outside_in_open_field|river_ravine/.test(v) ? 'danger'
        : /nearby_dump_site/.test(v) ? 'warning'
        : /collective_bin|rubbish_pit/.test(v) ? 'success'
        : 'unknown'
    }
};
