		Highcharts.setOptions({
			colors: ['#4572A7', '#AA4643', '#89A54E', '#80699B', '#3D96AE', '#DB843D', '#919400', '#92A8CD', '#A47D7C', '#B5CA92'],
			credits: {
				text: 'Spectrum on Facebook',
				href: 'http://www.facebook.com/apps/application.php?id=132839880113484&sk=wall'
			}
		});
		
		var highlikeoptions = {
			chart: {
				renderTo: 'highlikes'
			},
			title: {
				text: 'Mutual Likes'
			},  
			subtitle: {
				text: '(How many of your friends like what you like)'
			},
			xAxis: {
				labels: {
					enabled: false
				},
				categories: []
			},
			yAxis: {
				title: {
					text: null
				}			
			},
			tooltip: {
				formatter: function() {
					return '<b>'+this.x+'</b><br>'+this.y + ' friends like it too';
				}
			},
			series: [{
				type: 'column',
				name: 'Number of friends'
			}]
		};
		
		
		var highfriendoptions = {
			chart: {
				renderTo: 'highfriends'
			},
			title: {
				text: 'Mutual Friends'
			},  
			subtitle: {
				text: '(How many friends do you have in common)'
			},
			xAxis: {
				labels: {
					enabled: false
				},			
				categories: []
			},
			yAxis: {
				title: {
					text: null
				}			
			},
			tooltip: {
				formatter: function() {
					return '<b>'+this.x+'</b><br>'+this.y + ' mutual friends';
				}
			},
			series: [{
				type: 'column',
				name: 'Number of friends'
			}]
		};
		
		var highalbumoptions = {
			chart: {
				renderTo: 'highalbums',
				plotShadow: true
			},
			title: {
				text: 'Top 10 friends with most number of albums'
			},
			legend : {
				labelFormatter: function() {
					return friends[this.name]
				},			
				layout: 'vertical',
				align: 'right',
				verticalAlign: 'top',
				x: 0,
				y: 50,
				borderWidth: 0
			},
			tooltip: {
				formatter: function() {
					return '<b>'+ friends[this.point.name] +'</b><br>'+ this.y +' albums';
				}
			},
			plotOptions: {
				pie: {
					allowPointSelect: true,
					cursor: 'pointer',
					dataLabels: {
						enabled: false
					},
					showInLegend: true,
					point: {
						events: {
							click: function(event) {
								//alert(this.name);
								getAlbumsForUser(this.name);
							}
						}
					}					
				}
			},
			series: [{
				type: 'pie',
				name: 'Number of Albums'
			}]
		}		

		var highphotooptions = {
			chart: {
				renderTo: 'highphotos',
				plotShadow: true
			},
			title: {
				text: 'Top 10 friends with most number of photos'
			},
			legend : {
				labelFormatter: function() {
					return friends[this.name]
				},			
				layout: 'vertical',
				align: 'right',
				verticalAlign: 'top',
				x: 0,
				y: 50,
				borderWidth: 0
			},
			tooltip: {
				formatter: function() {
					return '<b>'+ friends[this.point.name] +'</b><br>'+ this.y +' photos';
				}
			},
			plotOptions: {
				pie: {
					allowPointSelect: true,
					cursor: 'pointer',
					dataLabels: {
						enabled: false
					},
					showInLegend: true,
					point: {
						events: {
							click: function(event) {
								getPhotosForUser(this.name);
							}
						}
					}					
				}
			},
			series: [{
				type: 'pie',
				name: 'Number of Photos'
			}]
		}	
		

		var highgenderoptions = {
			chart: {
				renderTo: 'highgender',
				plotShadow: true
			},
			title: {
				text: 'Gender distribution of your friends'
			},
			legend : {
				layout: 'vertical',
				align: 'right',
				verticalAlign: 'top',
				x: 0,
				y: 50,
				borderWidth: 0
			},
			tooltip: {
				formatter: function() {
					return '<b>'+ this.point.name +'</b> : '+ this.y;
				}
			},
			plotOptions: {
				pie: {
					allowPointSelect: true,
					cursor: 'pointer',
					dataLabels: {
						enabled: false
					},
					showInLegend: true
				}
			},
			series: [{
				type: 'pie',
				name: 'Gender'
			}]
		}	

		var higheducationoptions = {
			chart: {
				renderTo: 'higheducation',
				plotShadow: true
			},
			title: {
				text: 'Education distribution of your friends'
			},
			legend : {
				layout: 'vertical',
				align: 'right',
				verticalAlign: 'top',
				x: 0,
				y: 50,
				borderWidth: 0
			},
			tooltip: {
				formatter: function() {
					return '<b>'+ this.point.name +'</b> : '+ this.y;
				}
			},
			plotOptions: {
				pie: {
					allowPointSelect: true,
					cursor: 'pointer',
					dataLabels: {
						enabled: false
					},
					showInLegend: true
				}
			},
			series: [{
				type: 'pie',
				name: 'Education'
			}]
		}			