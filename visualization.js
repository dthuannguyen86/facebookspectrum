function drawBirthdayTable() {
	var data = new google.visualization.DataTable();
	data.addColumn('number', 'Month');
	data.addColumn('number', 'Birthdays');
	data.addColumn('string', 'Friends');
	for (var month in birthdayInfo) {
		var monkey = month;
		if(!birthdayInfo.hasOwnProperty(month))
			continue;
		var monthObj = birthdayInfo[month];
		if(month!='Unknown') {
			month = MONTHS[month-1];
		}	
		var htmlContent='';total=0;
		for (var day in monthObj) {
			if(!monthObj.hasOwnProperty(day)) {
				continue;
			}
			for(var c=0;c<monthObj[day].length;c++) {
				//htmlContent += ('<img src="'+pictureInfo[monthObj[day][c]]+'" title="'+friends[monthObj[day][c]]+'">&nbsp;');
				if(day=='Unknown')
					htmlContent += (friends[monthObj[day][c]]+'<br>');
				else
					htmlContent += ('<b>'+day+'</b> - '+friends[monthObj[day][c]]+'<br>');
				total++;
			}
		}
		if(month!='Unknown')
			data.addRow([{v:parseInt(monkey,10), f:month},total,htmlContent]);
	}
	
	var table = new google.visualization.Table(document.getElementById('calendar_div_table'));

	/*
	var formatter = new google.visualization.PatternFormat('<img src="{0}">');
	formatter.format(data, [1], 1); // Apply formatter and set the formatted value of the first column.  

	data.setProperty(0, 1,'style', 'text-align:center;width: 50px');

	var view = new google.visualization.DataView(data);
	view.setColumns([1,0]); // Create a view with the first column only.
	*/
	
	table.draw(data, {allowHtml: true});
}

function drawLocationTable() {
	var data = new google.visualization.DataTable();
	data.addColumn('string', 'Location');
	data.addColumn('number', 'Count');
	data.addColumn('string', 'Friends');
	
	for (var key in locationInfo) {
		if(!locationInfo.hasOwnProperty(key))
			continue;
		var info = locationInfo[key];
		var total = info.length;
		var htmlContent = '';
		for(var c=0;c<info.length;c++) {
			if(c==0)
				htmlContent += friends[info[c]];
			else
				htmlContent += (', '+friends[info[c]]);
		}
		if(key!='Unknown')
			data.addRow([key,total,htmlContent]);		
	}
	
	var table = new google.visualization.Table(document.getElementById('location_div_table'));
	table.draw(data, {allowHtml: true});	
}

