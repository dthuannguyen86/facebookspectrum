		
		function constructPartialCsv(obj, start, end) {
			var c = '';
			var count = 0;
		   	for(var i in obj){
		   		if(count<start) {
		   			count++;
		   			continue;
		   		}
		   		else if(count>=end) {
		   			break;
		   		}
		   		else if (obj.hasOwnProperty(i)){
		   			c+=(i+',');
		   			count++;
		   		}
		   	};
		   	return c.substring(0,c.length-1);
		}
		
		function captureActivityMetrics() {
			log('Start of captureActivityMetrics');
			var today = new Date();
			var then = today.setDate(today.getDate()-30);
			
			var total = countItems(friends);
			
			var current = 0;
			while(current<total) {
				var friendsList = constructPartialCsv(friends, current, current+20);
				var func = function(list, time) {
					return function() {
						retrieveActivityInfo(list, parseInt(time/1000, 10));					
					};				
				}(friendsList, then);
				
				activityloadcount++;
				window.setTimeout(func, current*100);
				
				current += 20;								
			}

			refreshActivityChart();
			
		}

		function refreshActivityChart() {
			if(activityloadcount==0) {
				//document.getElementById('activityLog').innerHTML += 'Done loading ('+activityloadcount+'). Rendering chart now..<br>';
				displayActivityChart();
				document.getElementById('activityincompletemsg').innerHTML = '';
			} else {
				//document.getElementById('activityLog').innerHTML += 'Still loaing ('+activityloadcount+')..<br>';
				window.setTimeout("refreshActivityChart()", 1000);
			}		
		}


		function displayActivityChart() {
			activityoptions.xAxis.categories = [];
			activityoptions.series[0].data = [];
			activityoptions.series[1].data = [];
			activityoptions.series[2].data = [];
			activityoptions.series[3].data = [];
			activityoptions.series[4].data = [];
			
			for(var obj in activityData) {
				if(!activityData.hasOwnProperty(obj))
					continue;
					
				activityoptions.xAxis.categories.push(friends[obj]);
				activityoptions.series[0].data.push(activityData[obj]['V']);
				activityoptions.series[1].data.push(activityData[obj]['S']);
				activityoptions.series[2].data.push(activityData[obj]['L']);
				activityoptions.series[3].data.push(activityData[obj]['P']);
				activityoptions.series[4].data.push(activityData[obj]['O']);
			}
			
			var t = new Highcharts.Chart(activityoptions);	
		}

		var retrieveActivityInfo = function (user, sinceTime) {
			//document.getElementById('activityLog').innerHTML += 'Call made ('+new Date()+')..<br>';
			log('<br>retrieveActivityInfo with offset : '+sinceTime);
			
			var opts = {};
			opts['limit'] = 100;
			if(sinceTime)	
				opts['since'] = sinceTime;

			url = '/feed?ids='+user+'&fields=id,type,message,likes,comments,from';

			FB.api(url, opts, function(response) {
				activityloadcount--;
				var out = [''];
				if(response.error) {
					return;
				}
				var nextUrl = '';
				for(var k in response) {
					if(!response.hasOwnProperty(k))
						continue;
					var data = response[k].data;
					var statuscount=0, videocount=0, linkcount=0, othercount=0, photocount=0; 
					for(var i in data) {
						if(data[i].type=='status') {
							statuscount++;
						} else if(data[i].type=='video') {
							videocount++;
						} else if(data[i].type=='link') {
							linkcount++;
						} else if(data[i].type=='photo') {
							photocount++;
						} else if(data[i].type){
							othercount++;
						}
					}
					//Add a category and series data
					if(videocount!=0 || statuscount!=0 || linkcount!=0 || photocount!=0 || othercount!=0) {
						var tempObj = {};
						tempObj['V'] = videocount;
						tempObj['S'] = statuscount;
						tempObj['L'] = linkcount;
						tempObj['P'] = photocount;
						tempObj['O'] = othercount;
						activityData[k] = tempObj;
					}
					
					//out.push('<b>', friends[k], '</b> : ', data.length ,' - S:', statuscount ,' - V:', videocount,' - L:', linkcount,' - O:', othercount,' - P:', photocount,'<br>');
					
				}
				
				//document.getElementById('activityLog').innerHTML += out.join('');
				
				displayActivityChart();
			});
		}
		
		

	var activityoptions = {
		chart: {
		   renderTo: 'highactivity',
		   defaultSeriesType: 'column'
		},
		title: {
		   text: 'Profile Activity Chart'
		},
		subtitle: {
			text: '(Whose profile is the most active in the last 30 days?)'
		},		
		credits: {
			enabled : false
		},
		xAxis: {
			labels: {
				enabled: false
			},		
			categories: []
		},
		yAxis: {
		   min: 0,
		   title: {
		      text: 'Number of posts'
		   }
		},
		tooltip: {
		   formatter: function() {
		   		if(this.point.stackTotal==100)
		   			total = '100+';
		   		else
		   			total = this.point.stackTotal;
		      return '<b>'+ this.x +'</b><br/>'+
		          this.series.name +': '+ this.y +'<br/>'+
		          'Total: '+ total;
		   }
		},
		plotOptions: {
		   column: {
		      stacking: 'normal'
		   }
		},
		series: [{
		   name: 'Videos',
		   data: []
		}, {
		   name: 'Status',
		   data: []
		}, {
		   name: 'Links',
		   data: []
		}, {
		   name: 'Photos',
		   data: []
		}, {
		   name: 'Others',
		   data: []
		}]
	}		