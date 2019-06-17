

"use strict";
//calling variables used within the the JS
var mapElement= undefined;
var geoLocationViewer=null;
var geolocationOptions={enableHighAccuracy: true};
var curLatLng =undefined;
var map=undefined;
var marker= undefined;
var latLoc= undefined;
var lngLoc= undefined;
//Array of Rooms
var locationSpecifics = [];
var locationsList=[];



  var db_server   = "sql.wpc-is.online";    // mySQL server
    var db_username = "ifarias";        // login name
    var db_password = "ifar2260";         // login password
    var db_table  = "db_test_ifarias";    // database to use

    //---------------------------------------------------------------------
    // the following functions will show and hide divs based on the button clicked
    // these functions will control the <div>s based on buttons clicked
    // makes the DOM a one page app
    function showDiv(id)
    {
      document.getElementById(id).style.visibility = "visible";
      document.getElementById(id).style.enabled = "true";
      document.getElementById(id).style.display = "block";
    }

    function hideDiv(id)
    {
      document.getElementById(id).style.visibility = "hidden";
      document.getElementById(id).style.enabled = "true";
      document.getElementById(id).style.display = "none";
    }

    //---------------------------------------------------------------------

    // the functions below will assist in grabbing values in the DOM

    function getIdValue(id)
    {
      return document.getElementById(id).value;
    }

    function getBoolValue(id)
    {
      return document.getElementById(id).checked;
    }

    function q (string)
    {
      return '"' + string + '"';
    }

    //---------------------------------------------------------------------

    
    //This function initializes the entire app and varifies proper information is set
    function initialize()
    {
      
      //hides advanced search & shows home
      hideDiv("studySpotMapDiv");
      hideDiv("roomDetailsAdvancedSearchDiv");
      showDiv("homePageDiv");
      hideDiv("backButton");


    loadScript('initMap');
    mapElement= document.getElementById('mapDiv');
    var details=document.getElementById('details');
    var title = document.getElementById('detailTitle');
    locationSpecifics[0]= new spotDetails(33.416805, -111.933605, "Leaders Academy Center",   "TRUE",  "TRUE", "FALSE", "TRUE", "20-30 People", "Inside");
    locationSpecifics[1]= new spotDetails(33.416689, -111.934492, "BA Study Center (2nd Floor)", "FALSE", "TRUE", "TRUE",  "TRUE",  "20-30 People", "Inside");
    locationSpecifics[2]= new spotDetails(33.416602, -111.933992, "BAC Lounge",           "FALSE", "FALSE","FALSE", "TRUE", "10-20 People", "Inside");
    locationSpecifics[3]= new spotDetails(33.417171, -111.934364, "MU Outside Patio",       "FALSE", "TRUE", "FALSE", "TRUE", "10-20 People", "Outside");
    locationSpecifics[4]= new spotDetails(33.416467, -111.934085, "BAC Starbucks Lounge",     "FALSE", "TRUE", "FALSE", "TRUE", "30-40 People", "Outside");
    locationSpecifics[5]= new spotDetails(33.416694, -111.933231, "McCord Hall Outside Patio",  "FALSE", "TRUE", "FALSE", "TRUE", "20-30 People", "Outside");
    locationSpecifics[6]= new spotDetails(33.417948, -111.934453, "MU Study Lounge (Basement)",   "FALSE", "TRUE", "FALSE", "TRUE", "30-40 People", "Inside");
    for (var i=0; i < locationSpecifics.length; i++) {
      locationsList.push(locationSpecifics[i].nameLoc);
}
    }

    //Function clicks back to homepage when click
    function advancedPageBackClick()
    {
      // when back button is clicked, hides advanced and shows home again
      hideDiv("roomDetailsAdvancedSearchDiv");
      hideDiv('studySpotMapDiv');
      showDiv("homePageDiv");
      hideDiv("backButton");
    }

    function studySpotPageBackClick()
    {
      // when back button is clicked, hides advanced and shows home again and sets the map back to geolocation
      hideDiv("studySpotMapDiv");
      showDiv("homePageDiv");
      hideDiv("backButton");
      detailTitle.innerHTML="Room Details";
      details.innerHTML="~DETAILS OF ROOM~";
      initMap();

    }



    function findASpotClick()
    {
      // hides the home page and shows the map
      hideDiv("homePageDiv");
      hideDiv("roomDetailsAdvancedSearchDiv");
      showDiv("studySpotMapDiv");
      showDiv("backButton");

      //hide details
      var temp = document.getElementById('bottom-panel');
      temp.style.display = 'none'; //or
      temp.style.visibility = 'hidden';
    }

    function advancedSearchClick()
    {
      // hides the home page and shows the advanced search
      hideDiv("homePageDiv");
      hideDiv("studySpotMapDiv");
      showDiv("roomDetailsAdvancedSearchDiv");
      showDiv("backButton");
    }

    //---------------------------------------------------------------------

    // when the locate button in the advanced search is clicked, SQL server will be contacted
    // and if the search returns results, those results will flow through to the map
    function advancedSearchLocateClick()
    {
     
      executeQuery();
      
      //show details
      var temp = document.getElementById('bottom-panel');
      temp.style.display = 'inline-block'; //or
      temp.style.visibility = 'visible';
    }

    //---------------------------------------------------------------------

    // the following three functions relate to grabbing the SQL data and returning to the map

    // this function will set the variables and prepare the query for the SQL database
    function advancedSearchSQLSetup()
    {

      // sets the variables declared in the DOM, to be used in the query as fields om the search
      var computers, deskChair, tutors, wifi;
      var distance = "";
      var size = "";
      var location = "";
      var queryStatement = "";

      // converts each variable into the appropriate format for a SQL query
      computers = q(getBoolValue("computerCheckBox"));
      deskChair = q(getBoolValue("deskCheckBox"));
      tutors = q(getBoolValue("tutorsCheckBox"));
      wifi = q(getBoolValue("wifiCheckBox"));
      size = q(getIdValue("sizeDropDown"));
      location = q(getIdValue("locationDropDown"));

      // the query statement concatenates query syntax with the search variables used
      queryStatement = 

        "SELECT latitude, longitude                               \
         FROM StudySpots                                    \
         WHERE computers = " + computers + " AND desksAndChairs = " + deskChair + " AND tutors = " + tutors + " AND wifi =" + wifi + " AND size = " + size + " AND location = " + location + ";";   

      console.log(queryStatement);    

      // query statement is returned and will eventually be called by 'executeQuery()'
      return queryStatement;

    }

    // this function will execute the query concatenated in the previous function
    // once fully queried, the data will flow into the app
    function executeQuery()
    {

      // declares the query statment variable and grabs the string by calling advancedSearchSQLSetup()
      var queryStatement = advancedSearchSQLSetup();

      // mySQL will execute the query, using the login info given at the start of the JS
      // will contact the server and (if successful) will pull GPS values through to the map
      MySql.Execute(db_server, db_username, db_password, db_table, queryStatement, function process (data)
        {
          // if the query is not successful will display the error
           if(!data.Success)
           {
            alert(data.Error);
           }
           // if the query is successful and the values are not null
           // will call sendToGPS and send the coordinates to the map
           else if (data.Result[0] != null)
           {
            console.log(data);

            // declaring variables to store both latitude and longitude
              var latitude = data.Result[0].latitude;
              var longitude = data.Result[0].longitude;

              sendGPSToMap(latitude, longitude);
              hideDiv("roomDetailsAdvancedSearchDiv");
              showDiv("studySpotMapDiv");
           }
           // if the query displays results that are NULL, will notify user that the
           // query did not return any results that matched the criteria
           else
           {
            console.log("Your search did not return any results");
            alert("Your search did not return any results");

            sendGPSToMap(null,null);  
           }

        }
      );

    
    } 

    // this function will send the GPS coordinates to the map
    function sendGPSToMap(latitude, longitude)
    {
      details.innerHTML="";

      //Loop and if variables compare lat and lng given by the user and then sends them to the map if it matches
      for (var i = 0; i < locationSpecifics.length; i++){
        if (latitude==locationSpecifics[i].latitudeLoc && longitude==locationSpecifics[i].longitudeLoc) {
          detailTitle.innerHTML=locationSpecifics[i].nameLoc;

          if(locationSpecifics[i].computers=="TRUE"){details.innerHTML+="Computers"+"<br />"};
          if(locationSpecifics[i].deskChairs=="TRUE"){details.innerHTML+="Desk & Chairs"+ "<br />"};
          if(locationSpecifics[i].tutors=="TRUE"){details.innerHTML+="Tutors"+ "<br />"};
          if(locationSpecifics[i].wifi=="TRUE"){details.innerHTML+="WIFI" + "<br />"};
          details.innerHTML+=locationSpecifics[i].sizeLoc + "<br />";
          details.innerHTML+=locationSpecifics[i].location + "<br />";

          latLoc=locationSpecifics[i].latitudeLoc;
          lngLoc=locationSpecifics[i].longitudeLoc;
          curLatLng = new google.maps.LatLng({lat: Number(latLoc), lng: Number(lngLoc)});
    
          var mapOptions    = {zoom: 18, center: curLatLng};
    
          map= new google.maps.Map(mapElement, mapOptions);
    
          var markerOptions   = {position: curLatLng, map: map};
          marker = new google.maps.Marker(markerOptions);
    
           break;

        }
      }

      console.log(latitude);
      console.log(longitude);
    } 
   

//Function starts the document and prepares it similar to onload function sets up variables and adds specific details to array from new spotDetails
//This helps log all of the spot information together
document.addEventListener("deviceready", onDeviceReady, false);
function onDeviceReady(){
  StatusBar.overlaysWebView(false);
  StatusBar.backgroundColorByName("Black");

}


//Takes only arguement and saves the details regarding the spot information together
function spotDetails(latitudeLoc,longitudeLoc, nameLoc, computers, deskChairs,tutors , wifi, sizeLoc, location){
	this.latitudeLoc=latitudeLoc;
	this.longitudeLoc=longitudeLoc;
	this.nameLoc=nameLoc;
	this.computers=computers;
	this.deskChairs=deskChairs;
	this.tutors=tutors;
	this.wifi=wifi;
	this.sizeLoc=sizeLoc;
	this.location=location;


}

//Loads the API details using the API Key Code
function loadScript(callback) {
	var script 		 = undefined;
	var googleAPIKey = "AIzaSyBUSnwC_9g-pSasmhceqHTqotTNp54QSj4";
	var googleAPIUrl = "https://maps.googleapis.com/maps/api/js";

	var srcURL 		 = googleAPIUrl + '?key=' + googleAPIKey 
							+ '&callback=' + callback;

	script 			 = document.createElement('script');
	script.type 	 = "text/javascript";
	script.async 	 = true;
	script.defer 	 = true;
	script.src 		 = srcURL;

	document.body.appendChild(script);
}
  

  


//Initializes the map with current location and marker of location
function initMap() {
  var infowindow = new google.maps.InfoWindow();
	//gets the current position of the user device and determines if it is capable of running Geo Location.
	navigator.geolocation.getCurrentPosition(geolocationSuccess, geolocationError, geolocationOptions);
	
  //sets up the map and the position on the application
  var mapOptions 		= {zoom: 18, center: curLatLng};
	map= new google.maps.Map(mapElement, mapOptions);


  //Loop will load the other markers for users to select
  for (var i = 0; i < locationSpecifics.length; i++){
  marker= new google.maps.Marker({position: new google.maps.LatLng(
      locationSpecifics[i].latitudeLoc,locationSpecifics[i].longitudeLoc), map:map})
    }            


  
  //sets the marker up in specific positions
    var markerOptions   = {position: curLatLng, map: map, icon: 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png'};
    marker = new google.maps.Marker(markerOptions);
  }



//If the application can take GEOLOCATION this function will execute
function geolocationSuccess(position){
latLoc=position.coords.latitude;
lngLoc=position.coords.longitude;
curLatLng = new google.maps.LatLng({lat: position.coords.latitude, lng: position.coords.longitude});
mapGeolocation();
}

//if the location does not take Geolocation this function will execute
function geolocationError(){
	alert("errors");
}

//This will  log the current location and its positions
function mapGeolocation() {
	curLatLng = new google.maps.LatLng({lat: Number(latLoc), lng: Number(lngLoc)});
	map.panTo(curLatLng);
	marker.setPosition(curLatLng);
}

 

//function creates the detail section by taking the information from a loop and checking if it matches the input section 
//It will loop till it finds a match
function locationDetials(){
        //show details
      var temp = document.getElementById('bottom-panel');
      temp.style.display = 'inline-block'; //or
      temp.style.visibility = 'visible';

  details.innerHTML="";
	for (var i = 0; i < locationSpecifics.length; i++) {
		if (document.getElementById("myInput").value==locationSpecifics[i].nameLoc) {
			detailTitle.innerHTML=locationSpecifics[i].nameLoc;

			if(locationSpecifics[i].computers=="TRUE"){details.innerHTML+="Computers"+"<br />"};
			if(locationSpecifics[i].deskChairs=="TRUE"){details.innerHTML+="Desk & Chairs"+ "<br />"};
			if(locationSpecifics[i].tutors=="TRUE"){details.innerHTML+="Tutors"+ "<br />"};
			if(locationSpecifics[i].wifi=="TRUE"){details.innerHTML+="WIFI" + "<br />"};
			details.innerHTML+=locationSpecifics[i].sizeLoc + "<br />";
			details.innerHTML+=locationSpecifics[i].location + "<br />";

      
      latLoc=locationSpecifics[i].latitudeLoc;
      lngLoc=locationSpecifics[i].longitudeLoc;
      curLatLng = new google.maps.LatLng({lat: Number(latLoc), lng: Number(lngLoc)});

      var mapOptions    = {zoom: 18, center: curLatLng};

      map= new google.maps.Map(mapElement, mapOptions);

      var markerOptions   = {position: curLatLng, map: map};
      marker = new google.maps.Marker(markerOptions);

      document.getElementById("myInput").value="";
			break;
			} 
	}
}


function autocomplete(inp, arr) {
  /*the autocomplete function takes two arguments,
  the text field element and an array of possible autocompleted values:*/
  var currentFocus;
  /*execute a function when someone writes in the text field:*/
  inp.addEventListener("input", function(e) {
      var a, b, i, val = this.value;
      /*close any already open lists of autocompleted values*/
      closeAllLists();
      if (!val) { return false;}
      currentFocus = -1;
      /*create a DIV element that will contain the items (values):*/
      a = document.createElement("DIV");
      a.setAttribute("id", this.id + "autocomplete-list");
      a.setAttribute("class", "autocomplete-items");
      /*append the DIV element as a child of the autocomplete container:*/
      this.parentNode.appendChild(a);
      /*for each item in the array...*/
      for (i = 0; i < arr.length; i++) {
        /*check if the item starts with the same letters as the text field value:*/
        if (arr[i].substr(0, val.length).toUpperCase() == val.toUpperCase()) {
          /*create a DIV element for each matching element:*/
          b = document.createElement("DIV");
          /*make the matching letters bold:*/
          b.innerHTML = "<strong>" + arr[i].substr(0, val.length) + "</strong>";
          b.innerHTML += arr[i].substr(val.length);
          /*insert a input field that will hold the current array item's value:*/
          b.innerHTML += "<input type='hidden' value='" + arr[i] + "'>";
          /*execute a function when someone clicks on the item value (DIV element):*/
          b.addEventListener("click", function(e) {
              /*insert the value for the autocomplete text field:*/
              inp.value = this.getElementsByTagName("input")[0].value;
              /*close the list of autocompleted values,
              (or any other open lists of autocompleted values:*/
              closeAllLists();
          });
          a.appendChild(b);
        }
      }
  });
  /*execute a function presses a key on the keyboard:*/
  inp.addEventListener("keydown", function(e) {
      var x = document.getElementById(this.id + "autocomplete-list");
      if (x) x = x.getElementsByTagName("div");
      if (e.keyCode == 40) {
        /*If the arrow DOWN key is pressed,
        increase the currentFocus variable:*/
        currentFocus++;
        /*and and make the current item more visible:*/
        addActive(x);
      } else if (e.keyCode == 38) { //up
        /*If the arrow UP key is pressed,
        decrease the currentFocus variable:*/
        currentFocus--;
        /*and and make the current item more visible:*/
        addActive(x);
      } else if (e.keyCode == 13) {
        /*If the ENTER key is pressed, prevent the form from being submitted,*/
        e.preventDefault();
        if (currentFocus > -1) {
          /*and simulate a click on the "active" item:*/
          if (x) x[currentFocus].click();
        }
      }
  });
  function addActive(x) {
    /*a function to classify an item as "active":*/
    if (!x) return false;
    /*start by removing the "active" class on all items:*/
    removeActive(x);
    if (currentFocus >= x.length) currentFocus = 0;
    if (currentFocus < 0) currentFocus = (x.length - 1);
    /*add class "autocomplete-active":*/
    x[currentFocus].classList.add("autocomplete-active");
  }
  function removeActive(x) {
    /*a function to remove the "active" class from all autocomplete items:*/
    for (var i = 0; i < x.length; i++) {
      x[i].classList.remove("autocomplete-active");
    }
  }
  function closeAllLists(elmnt) {
    /*close all autocomplete lists in the document,
    except the one passed as an argument:*/
    var x = document.getElementsByClassName("autocomplete-items");
    for (var i = 0; i < x.length; i++) {
      if (elmnt != x[i] && elmnt != inp) {
        x[i].parentNode.removeChild(x[i]);
      }
    }
  }
  /*execute a function when someone clicks in the document:*/
  document.addEventListener("click", function (e) {
      closeAllLists(e.target);
  });
}



/*initiate the autocomplete function on the "myInput" element, and pass along the countries array as possible autocomplete values:*/
autocomplete(document.getElementById("myInput"), locationsList);