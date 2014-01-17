/* HEPL RIA 2013 - Cours
 *
 * JS Document - /js/script.js
 *
 * coded by Jérémy
 * started at 08/01/2014
 */

/* jshint boss: true, curly: true, eqeqeq: true, eqnull: true, immed: true, latedef: true, newcap: true, noarg: true, browser: true, jquery: true, noempty: true, sub: true, undef: true, unused: true, white: false */

(function( $ ){

  var oMyPosition,
		gMap,
		aMarkers = [],
		gGeocoder,
		sType,
		sTitle,
		$banksHolder,
		$dataHolder,
		$bankDetailsHolder,
		$banksNumber,
		aLiBanks = [],
		$buttonBank,
    oBank,
		iRadius = 0,
		directionsDisplay,
		directionsService = new google.maps.DirectionsService(),
		iIndex;
  
	var style_map = [
      {
        "featureType": "administrative",
        "stylers": [
          { "visibility": "on" }
        ]
      },{
        "featureType": "poi",
        "stylers": [
          { "visibility": "on" }
        ]
      },{
        "featureType": "transit",
        "stylers": [
          { "visibility": "on" }
        ]
      },{
        "featureType": "road",
        "stylers": [
        { "visibility": "simplified" }
        ]
      },{
        "featureType": "road",
        "elementType": "geometry.fill",
        "stylers": [
          { "color": "#A6ACA9" }
        ]
      },{
          "featureType": "water",
          "stylers":[
              {"visibility": "on"}
          ]
      },
      {
          "featureType": "landscape",
          "elementType": "geometry.fill",
          "stylers":[
              {"visibility": "on"},
              {"color": "#FFFFFF"}
          ]
      }
    ];

	var styled_map = new google.maps.StyledMapType(style_map, {name: "Map style"});


	var getPositionSuccess = function(oPosition){
		oMyPosition = oPosition.coords;
		updateGoogleMapPosition();
		getBanks();
	};

	var getPositionError = function(oError){
		console.error(oError);
	};

	var updateGoogleMapPosition = function(){
		var gMyPosition = new google.maps.LatLng( oMyPosition.latitude,oMyPosition.longitude );
		gMap.panTo( gMyPosition );
		sType = "vous";
		sTitle = "votre position";
		generateMarker(gMyPosition, sType, sTitle);
	};

	var generateMarker = function(position, sType, sTitle){
		aMarkers.push( new google.maps.Marker( {
			position:position,
			map:gMap,
			title: sTitle,
			icon:{
                url: 'styles/img/'+sType+'.png',
                size: new google.maps.Size(25,30),
                //The point on the image to measure the anchor from. 0, 0 is the top left.
                origin: new google.maps.Point(0, 0),
                //The x y coordinates of the anchor point on the marker. e.g. If your map marker was a drawing pin then the anchor would be the tip of the pin.
                anchorPoint: new google.maps.Point(30,12.5)
            }
		} ));

	};

	var bankDetail = function(iIndex){
		$('#interactive').css( 'z-index', '10' );
		$('#list').css( 'z-index', '1' );
		$banksHolder.children().remove();
		$banksNumber.text( '' );
		$bankDetailsHolder.children().remove();
		$buttonBank.find( "#reload" ).removeClass( "index" );
		$('<div><h2 style="color:#'+ aLiBanks[iIndex].bank.color +';"><img src="" alt="" /><strong></strong><span></span></h2></div>')
				.find("img")
					.attr("src", aLiBanks[iIndex].bank.icon)
					.end()
				.find("h2 strong")
					.text(aLiBanks[iIndex].bank.name)
					.end()
				.find("h2 span")
					.text( " " + aLiBanks[iIndex].distance + "m")
					.end()
				.hide()
				.appendTo($bankDetailsHolder)
				.slideDown();
		for( var i = 0; i<= aMarkers.length-1 ; i++ ){
			if( i !== 0 && i !== iIndex +1 ){
				aMarkers[i].setMap(null);
			}
		}
	};

	var bankList = function(){
		var i = -1;
		$banksNumber.text(aLiBanks.length + " banques à proximité");
		$banksHolder.children().remove();
		$buttonBank.find( "#reload" ).addClass( "index" );
		$bankDetailsHolder.children().remove();
		for( ; oBank = aLiBanks[++i] ; ){
			aMarkers[i+1].setMap(gMap);
			google.maps.event.addListener(aMarkers[i+1], 'click', showBankFromMarker);
			$('<li class="bank"><h4 style="color:#'+ oBank.bank.color +';" ><img src="" alt="" /><strong></strong></h4><p></p><div class="index"></div></li>')
				.find("img")
					.attr("src", oBank.bank.icon)
					.end()
				.find("h4 strong")
					.text(oBank.bank.name)
					.end()//revient au filtre précédent
				.find("p")
					.text(oBank.distance + "m")
					.end()
				.find("div.index")
					.text(i)
					.end()
				.hide()
				.appendTo($banksHolder)
				.slideDown();
		}
	};

	var generateBanks = function(iIndex){
		if(iIndex != null){
			bankDetail(iIndex);
		}else{
			bankList();
		}
	};

	var reload = function(){
		$('#interactive').css( 'z-index', '1' );
		$('#list').css( 'z-index', '10' );
		directionsDisplay.setMap(null);
		directionsDisplay.setPanel(null);
		gMap.setZoom(13);
		generateBanks();
	};

	var getBanks = function(){
		$.ajax({
			url: "http://ccapi.superacid.be/terminals?latitude=" + oMyPosition.latitude + "&longitude=" + oMyPosition.longitude + "&radius=" + iRadius,
			method: "GET",
			dataType: "json",
			success: function(aBanks){
				if(aBanks.error){
					//error
					console.log(aBanks);
				}else{
					if(aBanks.data.length < 20){
						iRadius++;
						getBanks();
					}else{
						aLiBanks = aBanks.data;
								
						i = -1;
						for( ; oBank = aLiBanks[++i] ; ){
							if( oBank.bank === null ){
								aLiBanks.splice(i, 1);
							}
						}

						for( i = 0; i< aLiBanks.length ; i++ ){
							sType = "cash";
							sTitle = aLiBanks[i].bank.name;
							generateMarker(new google.maps.LatLng( aLiBanks[i].latitude, aLiBanks[i].longitude), sType, sTitle);
						}
						generateBanks();
					}
				}
			}
		});
	};

	var generateGoogleMap = function(){
		gMap = new google.maps.Map( document.getElementById( "gmap" ), {
			center: new google.maps.LatLng( 50.846686,4.352425 ),//Bruxelles
			zoom:13,
			disableDefaultUI:true,
			zoomControl:true,
			mapTypeId: 'map_styles'

		} );
		gMap.mapTypes.set('map_styles', styled_map);
	};

	var generateDirection = function(start, end){
		var request = {
			origin: start,
			destination: end,
			travelMode: google.maps.TravelMode.WALKING
		};

		directionsDisplay.setMap(gMap);
		directionsDisplay.setPanel(document.getElementById('directions-panel'));

		directionsService.route(request, function(response, status) {
			if (status === google.maps.DirectionsStatus.OK) {
			directionsDisplay.setDirections(response);
			}
		});

	};

	var showBankFromLink = function(e){
		iIndex =  parseFloat($(this).find("div.index").text());
		generateBanks(iIndex);

        var start = aMarkers[0].position;
		var end = aMarkers[iIndex+1].position;
		generateDirection(start, end);
	};


	var showBankFromMarker = function(e){
		console.log(e);
		pos = e.latLng;
		var i = -1;


		for( ; oBank = aLiBanks[++i] ; ){
			if(pos.b === oBank.latitude | pos.d === oBank.longitude ){
				console.log(i);
				iIndex =  i;
			}
		}
		generateBanks(iIndex);
        var start = aMarkers[0].position;
		var end = pos;
		generateDirection(start, end);
	};

	var hideBar = function(e){
		e.preventDefault();
		$dataHolder.find( "#barWrapper" ).css( 'top', '80%' );
		$dataHolder.find( ".displayBar" ).css( 'top', '80%' );
		$dataHolder.find( ".displayBar #show" ).css( 'display', 'block' );
		$dataHolder.find( ".displayBar #hide" ).css( 'display', 'none' );
	};

	var showBar = function(e){
		e.preventDefault();
		$dataHolder.find( "#barWrapper" ).css( 'top', '10%' );
		$dataHolder.find( ".displayBar" ).css( 'top', '10%' );
		$dataHolder.find( ".displayBar #show" ).css( 'display', 'none' );
		$dataHolder.find( ".displayBar #hide" ).css( 'display', 'block' );
	};



	$( function(){
		$banksHolder = $(".banks");
		$dataHolder = $("#wrapper");
		$bankDetailsHolder = $("#bankDetails");
		$buttonBank = $("#interactive");
		$banksNumber = $(".banksNumber");
		directionsDisplay = new google.maps.DirectionsRenderer({
			polylineOptions: {
          strokeColor: "#006175",
          strokeWeight: 10,
          strokeOpacity: 0.8
			}

		});
		gGeocoder = new google.maps.Geocoder();
		//call at page loading
		generateGoogleMap();
		
		if( navigator.geolocation ){
			navigator.geolocation.getCurrentPosition(getPositionSuccess, getPositionError);
		}
		// oMyPosition = {latitude:50.846686, longitude:4.352425};
		// updateGoogleMapPosition();
		// getBanks();
		$banksHolder.on("click", "li.bank", showBankFromLink);
		$buttonBank.on("click", "#reload" , reload);
		$dataHolder.on("click", "#hide" , hideBar);
		$dataHolder.on("click", "#show" , showBar);
		console.log(aLiBanks);
	});

}).call( this, jQuery);
