
function exportContentsToPdf() {
	
	if($("input[name='exportitems']:checked").length==0) {
		return;
	}
	
	//Wrapper object for all kinds of information
	var exportJsonObj = {};
	
	//Check what options are selected	
	var exportusers = [];
	for(var p in pictureInfo) {
		var obj = {};
		obj["id"] = p;
		obj["name"] = friends[p];
		obj["imageUrl"] = pictureInfo[p];
		exportusers.push(obj);
	}
	
	var exporteducations = [];
	for (var key in educationInfo) {
		if (educationInfo.hasOwnProperty(key)) {
			var obj = {};
			obj["education"] = key;
			obj["count"] = educationInfo[key].length;
			exporteducations.push(obj);			
		}
	}
	
	var exportgenders = [];
	for (var key in genderInfo) {
		if (genderInfo.hasOwnProperty(key)) {
			var obj = {};
			obj["gender"] = key;
			obj["count"] = genderInfo[key].length;
			exportgenders.push(obj);			
		}
	}
	
	var exportalbums = [];
	var sortable = [];
	for (var key in albumInfo) {
		if (albumInfo.hasOwnProperty(key))
			sortable.push([key, albumInfo[key]])
	}
	sortable.sort(function(a, b) {return b[1] - a[1]});	
	for (var i=0;i<sortable.length;i++) {
		if(i==10)
			break;
		var obj = {};
		obj["album"] = friends[sortable[i][0]];
		obj["count"] = sortable[i][1];
		exportalbums.push(obj);			
	}
	
	var exportphotos = [];
	var sortable = [];
	for (var key in photosInfo) {
		if (photosInfo.hasOwnProperty(key))
			sortable.push([key, photosInfo[key]])
	}
	sortable.sort(function(a, b) {return b[1] - a[1]});	
	for (var i=0;i<sortable.length;i++) {
		if(i==10)
			break;
		var obj = {};
		obj["photo"] = friends[sortable[i][0]];
		obj["count"] = sortable[i][1];
		exportphotos.push(obj);			
	}
	
	//var actualUrl = "http://localhost:8080/Apps/export.pdf";
	var actualUrl = "http://facebookspectrum.appspot.com/export.pdf";
	//var actualUrl = "http://127.0.0.1:9999/export.pdf";
	
	var form = document.createElement("form");
    form.setAttribute("method", "post");
    form.setAttribute("id", "exportform");
    form.setAttribute("action", actualUrl);

	$.each($("input[name='exportitems']:checked"), function() {
		log('Checked '+$(this).val());
		var selectedvalue = $(this).val();
		
		var hiddenField = document.createElement("input");
		hiddenField.setAttribute("type", "hidden");
		hiddenField.setAttribute("name", selectedvalue);
		hiddenField.setAttribute("value", "1");
		form.appendChild(hiddenField);
		
		switch(selectedvalue) {
			case "user":
				exportJsonObj["user"] = exportusers;
				break;
			case "education":
				exportJsonObj["education"] = exporteducations;
				break;
			case "gender":
				exportJsonObj["gender"] = exportgenders;
				break;
			case "album":
				exportJsonObj["album"] = exportalbums;
				break;
			case "photo":
				exportJsonObj["photo"] = exportphotos;
				break;	
			default :
				log("Invalid selection");
		}		
	});
	

/*
    hiddenField = document.createElement("input");
    hiddenField.setAttribute("type", "hidden");
    hiddenField.setAttribute("name", "education");
    hiddenField.setAttribute("value", "1");
    form.appendChild(hiddenField);
    exportJsonObj["education"] = exporteducations;

    hiddenField = document.createElement("input");
    hiddenField.setAttribute("type", "hidden");
    hiddenField.setAttribute("name", "gender");
    hiddenField.setAttribute("value", "1");
    form.appendChild(hiddenField);
    exportJsonObj["gender"] = exportgenders;

    hiddenField = document.createElement("input");
    hiddenField.setAttribute("type", "hidden");
    hiddenField.setAttribute("name", "album");
    hiddenField.setAttribute("value", "1");
    form.appendChild(hiddenField);
    exportJsonObj["album"] = exportalbums;

    hiddenField = document.createElement("input");
    hiddenField.setAttribute("type", "hidden");
    hiddenField.setAttribute("name", "photo");
    hiddenField.setAttribute("value", "1");
    form.appendChild(hiddenField);
    exportJsonObj["photo"] = exportphotos;
*/
	
    var jsonStr = JSON.stringify(exportJsonObj);
    
    hiddenField = document.createElement("input");
    hiddenField.setAttribute("type", "hidden");
    hiddenField.setAttribute("name", "data");
    hiddenField.setAttribute("value", jsonStr);
    form.appendChild(hiddenField);
 
    hiddenField = document.createElement("input");
    hiddenField.setAttribute("type", "hidden");
    hiddenField.setAttribute("name", "name");
    hiddenField.setAttribute("value", loggedInUserName);
    form.appendChild(hiddenField);
    
    document.body.appendChild(form);
    
    $("#exportmsg").show();
    window.setTimeout('$("#exportmsg").hide()', 20000);
    
    //$("#exportbutton").attr("disabled", true);
    
    form.submit();    
}