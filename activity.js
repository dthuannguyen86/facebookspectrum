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
				
				window.setTimeout(func, current*100);
				
				current += 20;				
				activityloadcount++;
			}

			displayActivityChart();
			
		}


		function displayActivityChart() {
			if(activityloadcount==0) {
				//document.getElementById('activityLog').innerHTML += 'Done loading ('+activityloadcount+'). Rendering chart now..<br>';
				var t = new Highcharts.Chart(activityoptions);	
			} else {
				//document.getElementById('activityLog').innerHTML += 'Still loaing ('+activityloadcount+')..<br>';
				window.setTimeout("displayActivityChart()", 1000);
			}
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
						activityoptions.xAxis.categories.push(friends[k]);
						activityoptions.series[0].data.push(videocount);
						activityoptions.series[1].data.push(statuscount);
						activityoptions.series[2].data.push(linkcount);
						activityoptions.series[3].data.push(photocount);
						activityoptions.series[4].data.push(othercount);
					}
					
					//out.push('<b>', friends[k], '</b> : ', data.length ,' - S:', statuscount ,' - V:', videocount,' - L:', linkcount,' - O:', othercount,' - P:', photocount,'<br>');
					
				}
				
				//document.getElementById('activityLog').innerHTML += out.join('');
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