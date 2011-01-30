    	var DEBUG = false;

		var userLoggedIn = false;

    	var friends = {};
		var albumInfo = {};
		var photosInfo = {};
		var locationInfo = {};
		var geocodeInfo = {};
		var birthdayInfo = {};
		var pictureInfo = {};
		var genderInfo = {};
		var educationInfo = {};
		var MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
		var map;
		var infowindow;
		var geocoder = new google.maps.Geocoder();
		var lat_min = 90;
		var lat_max = -90;
		var lng_min = 180;
		var lng_max = -180;
		var FeedInfo = true;
		var AlbumsLoaded = false;
		
		var albumsLoading = false;
		
		var progressbarobj = new UProgressBar({"elid":"waiting","min":0,"max":0,"value":0});

		var revealAlbumInfo = function (url) {
			//document.getElementById('resp').innerHTML += '<br>Entering revealAlbumInfo with url : '+url;

			if(!url) {
				var friendsList = constructCsv(friends);
				//document.getElementById('album_charts').innerHTML += '<br>FriendList CSV = '+friendsList;
				url = '/albums?ids='+friendsList+'&fields=id,name,count,link';
			}
			FB.api(url, { limit: 25 }, function(response) {
				if(response.error) {
					AlbumsLoaded = true;
					return;
				}
				var nextUrl = '';
				var friendsList = constructCsv(friends);
				for(var k in response) {
					if(!response.hasOwnProperty(k))
						continue;
					var data = response[k].data;
					if(response[k].paging)
						nextUrl = response[k].paging.next;
					var numAlbums=0, numPictures=0;
					if(data && data.length) {
						numAlbums = data.length;
						for(var p in data) {
							if(!data.hasOwnProperty(p))
								continue;
							var tempCount = (data[p].count)?parseInt(data[p].count):0;
							numPictures = numPictures+tempCount;
						}
					}
					albumInfo[k] = (albumInfo[k]?parseInt(albumInfo[k]):0)+numAlbums;
					photosInfo[k] = (photosInfo[k]?parseInt(photosInfo[k]):0)+numPictures;

					if(nextUrl!='') {
						//nextUrl = unescape(nextUrl);
						nextUrl = nextUrl.substring(nextUrl.indexOf("/albums"));
						nextUrl = nextUrl.replace(escape(friendsList), k);
						//nextUrl = escape(nextUrl);
						revealAlbumInfo(nextUrl);
					} else {
						AlbumsLoaded = true;
					}
				}

			});
		}

		function getAlbumsForDropdown() {
			var who = document.getElementById('friendsalbumselect').value;
			if(!who||who==''||who=='-1')
				who = 'me';
			getAlbumsForUser(who);
		}
		
		var getAlbumsForUser = function (user, url) {
			//document.getElementById('resp').innerHTML += '<br>Entering getAlbumsForUser with url : '+url;
			if(albumsLoading)
				return;
			albumsLoading = true;
			var htmlText = '<br><br>Loading '+friends[user]+'&apos;s Albums<br><br>';
			document.getElementById('album_detail').innerHTML = htmlText;
			
			if(!url) {
				url = '/'+user+'/albums?fields=id,name,count,link,from,description,created_time,location,comments';
			}
			FB.api(url, { limit: 25 }, function(response) {
				var out = [''];
				if(response.error) {
					albumsLoading = false;				
					return;
				}
				var nextUrl = '';
				var data = response.data;
				if(response.paging)
					nextUrl = response.paging.next;
				var user = '';
				if(data && data.length) {
					for(var p in data) {
						if(!data.hasOwnProperty(p))
							continue;
						var albumId = data[p].id;
						user = data[p].from.id;
						var title = data[p].name;
						var link = data[p].link;
						var created_time = data[p].created_time;
						if(created_time) {
							created_time = created_time.getDateFromfacebookFormat().getFormattedDate()
						} else {
							created_time = '';
						}

						var count = data[p].count;
						var location = data[p].location;
						var description = data[p].description;
						var comments = 0;
						if(data[p].comments)
							comments = data[p].comments.data.length;
						
						//Get the access token here
						var accessToken = nextUrl;
						accessToken = accessToken.substring(accessToken.indexOf('access_token')+13);
						accessToken = accessToken.substring(0, (accessToken.indexOf('&')==-1)?accessToken.length:accessToken.indexOf('&'));
						
						out.push('<div class="albumbox"><a href="', link, '" target="new">');
						out.push('<div class="bold">', title, '</div>');
						out.push('<div class="albumimage" style="background-image:url(https://graph.facebook.com/', albumId, '/picture?access_token=', accessToken, ');"></div>');
						out.push('</a><div class="albumtext"><span>', created_time, '<br>Photos:', count);
						if(location)
							out.push('<br>Location: ', location);						
						out.push('<br>Comments: ', comments);
						if(description)	
							out.push('<br><br>', description);
						out.push('</span></div>');
						out.push('</div>');
					}
				}
				
				//var htmlText = '<b>'+friends[user]+'&apos;s Albums</b><br>';
				htmlText = '<br>';
				
				if(albumsLoading) {
					document.getElementById('album_detail').innerHTML = htmlText + out.join('');
					albumsLoading = false;
				}
				
				/*
				if(nextUrl!='') {
					nextUrl = nextUrl.substring(nextUrl.indexOf("/albums"));
					nextUrl = nextUrl.replace(escape(friendsList), k);
					getAlbumsForUser(user, nextUrl);
				}
				*/
			});
		}

		var getPhotosForUser = function (user, url) {
			if(albumsLoading)
				return;
			albumsLoading = true;
			var htmlText = '<br><br>Loading '+friends[user]+'&apos;s Photos<br><br>';
			document.getElementById('album_detail').innerHTML = htmlText;
			if(!url) {
				url = '/'+user+'/albums?fields=id';
			}
			FB.api(url, { limit: 25 }, function(response) {
				var out = [''];
				if(response.error) {
					albumsLoading = false;
					return;
				}
				var nextUrl = '';
				var data = response.data;
				if(response.paging)
					nextUrl = response.paging.next;
				var user = '';
				if(data && data.length) {
					for(var p in data) {
						if(!data.hasOwnProperty(p))
							continue;
						var albumId = data[p].id;
						out.push(albumId, ',');
					}
				}
				var albumIds = out.join('');
				window.setTimeout('getPhotosForAlbums("'+albumIds.substring(0,albumIds.length-1)+'")', 200);				
			});
		}
		
		var getPhotosForAlbums = function(albumIds) {
			url = '/photos?ids='+albumIds+'&fields=id,link,picture,icon,from';
			FB.api(url, { limit: 25 }, function(response) {
				var parentObj = document.getElementById('album_detail');
				var out = [''];
				if(response.error) {
					albumsLoading = false;
					return;
				}
				var nextUrl = '';
				var data = response.data;
				if(response.paging)
					nextUrl = response.paging.next;
				var user = '';
				var numPictures=0;
				for(var k in response) {
					if(!response.hasOwnProperty(k))
						continue;
					var data = response[k].data;
					if(response[k].paging)
						nextUrl = response[k].paging.next;
					var numPicturesInThisAlbum=0;
					if(data && data.length) {
						numPicturesInThisAlbum = data.length;
						for(var p in data) {
							if(!data.hasOwnProperty(p))
								continue;
							var photoId = data[p].id;
							user = data[p].from.id;
							var picture = data[p].picture;
							var link = data[p].link;
							var icon = data[p].icon;
							var comments = 0;
							if(data[p].comments)
								comments = data[p].comments.length;
							
							//TODO : probably a good idea to paint the images one by one on the fly instead of waiting for the entire bunch
							//var anchorObj = document.createElement('a');
							//anchorObj.setAttribute('href', link);
							//anchorObj.setAttribute('target', 'new');
							
							//var boxObj = document.createElement('div');
							//boxObj.setAttribute('class', 'picturebox');
							//boxObj.setAttribute('style', 'background-image:url('+picture+')');
							
							//anchorObj.appendChild(boxObj);							
							//parentObj.appendChild(anchorObj);
							out.push('<a href="', link, '" target="new"><div class="picturebox" style="background-image:url(', picture ,');"></div></a>');
							numPictures++;
							if(numPictures>500) {
								out.push('<br><div style="clear:both;color:#999999">(Only 500 photos displayed)</div>');
								break;
								//var messageBoxObj = document.createElement('div');
								//messageBoxObj.setAttribute('style', 'clear:both;color:#999999');
								//messageBoxObj.appendChild(document.createTextNode("(Only 500 photos displayed)"));
								//boxObj.appendChild(messageBoxObj);
							}
						}
					}
					
					if(numPictures>500) {
						break;
					}
					/*
					if(nextUrl!='') {
						//nextUrl = unescape(nextUrl);
						nextUrl = nextUrl.substring(nextUrl.indexOf("/albums"));
						nextUrl = nextUrl.replace(escape(friendsList), k);
						//nextUrl = escape(nextUrl);
						revealAlbumInfo(nextUrl);
					}
					*/
				}			
				//var htmlText = '<b>'+friends[user]+'&apos;s Photos</b><br>';				
				htmlText = '<br>';
				document.getElementById('album_detail').innerHTML = htmlText + out.join('');
				albumsLoading = false;
			});			
		}
		
		var displayAlbumInfo = function() {
			$('#friendsalbumselect').change(getAlbumsForDropdown);
			var htmlContent = 'Album and Photo information of all your '+countItems(friends)+' friends on Facebook'+'<br>';
			htmlContent += '<table class="orange"><thead><tr><th>ID</th><th>Name</th><th>Albums</th><th>Photos</th></tr></thead>'
			var cls = 'odd';
			for (var key in albumInfo) {
				if(!albumInfo.hasOwnProperty(key))
					continue;
				cls = (cls=='odd')?'':'odd';
				htmlContent += ('<tr class="'+cls+'"><td><img src="'+pictureInfo[key]+'"></td><td>'+friends[key]+'</td><td>'+albumInfo[key]+'</td><td>'+photosInfo[key]+'</td></tr>');
			}
			htmlContent += '</table>'
			//document.getElementById('album_charts').innerHTML = '<div style="float:left" id="album_chart_div"></div>'+'<div style="float:left" id="photo_chart_div"></div><div style="clear:both"></div><br>'+htmlContent;
			document.getElementById('album_charts').innerHTML = '<div id="album_chart_div"></div>'+'<div id="photo_chart_div"></div><div style="clear:both"></div><br>';
			drawAlbumChart();
			drawPhotoChart();
		}

		var displayLocationInfo = function() {
			var locationcount = countItems(locationInfo);
			var geocodecount = countItems(geocodeInfo);
			//log('countItems(geocodeInfo):'+countItems(geocodeInfo));
			//log('countItems(locationInfo):'+countItems(locationInfo));
			if(geocodecount+1!=locationcount) {
				progressbarobj.setMaxValue(locationcount);
				progressbarobj.setValue(geocodecount);
				log('Still waiting for the address geocoding.. Waiting..');
				setTimeout("displayLocationInfo()", 1000);				
				return;
			}
			
			dropMarkers();
			drawLocationTable();
			/*
			var htmlContent = 'Location information of all your '+countItems(friends)+' friends on Facebook'+'<br>';
			htmlContent += '<table class="orange"><thead><tr><th>Location</th><th>Number of friends</th></tr></thead>'
			var cls = 'odd';
			for (var key in locationInfo) {
				if(!locationInfo.hasOwnProperty(key))
					continue;
				cls = (cls=='odd')?'':'odd';
				var info = locationInfo[key];
				htmlContent += ('<tr class="'+cls+'"><td>'+key+'</td><td><b>'+info.length+'</b> - ');
				for(var c=0;c<info.length;c++) {
					htmlContent += (friends[info[c]]+', ');
				}
				htmlContent = htmlContent.substring(0,htmlContent.length-2);
				htmlContent += ('</td></tr>');
			}
			htmlContent += '</table>'
			document.getElementById('location_div').innerHTML = htmlContent;			
			*/
		}

		var displayBirthdayInfo = function() {
			/*
				var htmlContent = 'Birthday information of all your '+countItems(friends)+' friends on Facebook'+'<br>';
				htmlContent += '<table class="orange"><thead><tr><th>Month</th><th>Number of friends</th></tr></thead>'
				var cls = 'odd';
				for (var month in birthdayInfo) {
					if(!birthdayInfo.hasOwnProperty(month))
						continue;
					cls = (cls=='odd')?'':'odd';
					var monthObj = birthdayInfo[month];
					if(month!='Unknown') {
						month = MONTHS[month-1];
					}
					htmlContent += ('<tr class="'+cls+'"><td>'+month+'</td><td><b>'+countItems(monthObj)+' days </b> : ');
					for (var day in monthObj) {
						if(!monthObj.hasOwnProperty(day)) {
							continue;
						}
						for(var c=0;c<monthObj[day].length;c++) {
							htmlContent += (day+'-'+friends[monthObj[day][c]]+', ');
						}
					}
					htmlContent = htmlContent.substring(0,htmlContent.length-2);
					htmlContent += ('</td></tr>');
				}
				htmlContent += '</table>'
				document.getElementById('resp').innerHTML = htmlContent;
			*/			
			displayCurrentYear('2011');
			displayUpcomingBirthdays();
			drawBirthdayTable();
		}

		function drawAlbumChart() {
			var sortable = [];
			for (var key in albumInfo) {
				if (albumInfo.hasOwnProperty(key))
					sortable.push([key, albumInfo[key]])
			}
			sortable.sort(function(a, b) {return b[1] - a[1]});

			var data = new google.visualization.DataTable();
			data.addColumn('string', 'Name');
			data.addColumn('number', 'Albums');
			data.addColumn('string', 'ID');
			data.addRows(10);
			for (var i=0;i<sortable.length;i++) {
				if(i==10)
					break;
				log('Adding '+friends[sortable[i][0]]+' and '+sortable[i][1]+' to the album list');
				data.setValue(i, 0, friends[sortable[i][0]]);
				data.setValue(i, 1, sortable[i][1]);
				data.setValue(i, 2, sortable[i][0]);
			}

			var chart = new google.visualization.PieChart(document.getElementById('album_chart_div'));
			chart.draw(data, {width: 600, height: 400, title: 'Top 10 friends with most number of albums'});

			google.visualization.events.addListener(chart, 'select', function() {
				var selection = chart.getSelection();
				var userid = data.getValue(selection[0].row, 2);
				//alert(userid);
				getAlbumsForUser(userid);
			});  			
		}

		function drawPhotoChart() {
			var sortable = [];
			for (var key in photosInfo) {
				if (photosInfo.hasOwnProperty(key))
					sortable.push([key, photosInfo[key]])
			}
			sortable.sort(function(a, b) {return b[1] - a[1]});

			var data = new google.visualization.DataTable();
			data.addColumn('string', 'Name');
			data.addColumn('number', 'Photos');
			data.addColumn('string', 'ID');
			data.addRows(10);
			for (var i=0;i<sortable.length;i++) {
				if(i==10)
					break;
				log('Adding '+friends[sortable[i][0]]+' and '+sortable[i][1]+' to the photo list');
				data.setValue(i, 0, friends[sortable[i][0]]);
				data.setValue(i, 1, sortable[i][1]);
				data.setValue(i, 2, sortable[i][0]);
			}

			var chart = new google.visualization.PieChart(document.getElementById('photo_chart_div'), {is3D:true});
			chart.draw(data, { width: 600, height: 400, title: 'Top 10 friends with most number of photos'});

			google.visualization.events.addListener(chart, 'select', function() {
				var selection = chart.getSelection();
				var userid = data.getValue(selection[0].row, 2);
				//alert(userid);
				getPhotosForUser(userid);
			}); 			
		}

		function drawGenderChart() {
			var data = new google.visualization.DataTable();
			data.addColumn('string', 'Gender');
			data.addColumn('number', 'Friends');
			data.addRows(countItems(genderInfo));
			var i=0;
			for (var key in genderInfo) {
				if (genderInfo.hasOwnProperty(key)) {
					data.setValue(i, 0, key);
					data.setValue(i, 1, genderInfo[key].length);
					i++;
				}
			}
			var chart = new google.visualization.PieChart(document.getElementById('gender_chart_div'));
			chart.draw(data, {width: 600, height: 400, title: 'Gender distribution of your friends'});
		}

		function drawEducationChart() {
			var data = new google.visualization.DataTable();
			data.addColumn('string', 'Education');
			data.addColumn('number', 'Friends');
			data.addRows(countItems(educationInfo));
			var i=0;
			for (var key in educationInfo) {
				if (educationInfo.hasOwnProperty(key)) {
					data.setValue(i, 0, key);
					data.setValue(i, 1, educationInfo[key].length);
					i++;
				}
			}
			var chart = new google.visualization.PieChart(document.getElementById('education_chart_div'));
			chart.draw(data, {width: 600, height: 400, title: 'Education distribution of your friends'});
		}

		function initialize() {
			var latlng = new google.maps.LatLng(17.4, 78.6);
    		var myOptions = {
				zoom: 8,
				center: latlng,
				mapTypeId: google.maps.MapTypeId.ROADMAP
	    	};

			map = new google.maps.Map(document.getElementById("map_canvas"),myOptions);
			infowindow = new google.maps.InfoWindow();
			google.maps.event.addListener(map, 'click', function() {
				hideInfoWindow();
			});
		}

		function dropMarkers() {
			initialize();
			var i=0;
			for (var key in locationInfo) {
				if(!locationInfo.hasOwnProperty(key) || key=='Unknown')
					continue;
				(function(tempAddr, ids) {
					setTimeout(function() {
						displayOnMap(tempAddr, ids);
					}, i++ * 0);
				})(key, locationInfo[key]);

			}
		}

		//This has to be done in the background to avoid time lag
		function geocodeAllAddresses() {
			var i=0;
			for (var key in locationInfo) {
				if(!locationInfo.hasOwnProperty(key) || key=='Unknown')
					continue;
				log('Geocode '+key+' request created');
				(function(tempAddr) {
					setTimeout(function() {
						geocodeAddress(tempAddr);
					}, i++ * 700);
				})(key);
			}
		}

		function geocodeAddress(address) {
			geocoder.geocode( { 'address': address}, function(results, status) {
				if (status == google.maps.GeocoderStatus.OK) {
					geocodeInfo[address] = results[0].geometry.location;
					log('Geocoded '+address+' to '+results[0].geometry.location.toString());
				} else {
					geocodeInfo[address] = null;
					alert("Could not geocode "+address+" - Reason: " + status);
				}
			});
		}

		function displayOnMap(address, ids) {
			var latlang = geocodeInfo[address];
			if(!latlang)
				return;
			map.setCenter(latlang);
			var curLat = latlang.lat();
			var curLng = latlang.lng();
			if(curLat<lat_min)
				lat_min = curLat;
			if(curLat>lat_max)
				lat_max = curLat;
			if(curLng<lng_min)
				lng_min = curLng;
			if(curLng>lng_max)
				lng_max = curLng;
			for(var i=0;i<ids.length;i++) {
				var marker = new google.maps.Marker({
					map: map,
					icon: 'faceicon.ico',
					position: latlang,
					animation: google.maps.Animation.DROP,
					draggable: false,
					clickable: true
				});
				google.maps.event.addListener(marker, 'click', function() {
					moreDetail(latlang, ids, address);
				});
			}
			map.fitBounds(new google.maps.LatLngBounds(
			  new google.maps.LatLng(lat_min, lng_min),
			  new google.maps.LatLng(lat_max, lng_max)
			));
		}

		function hideInfoWindow() {
			infowindow.close();
		}

		function moreDetail(loc, ids, city) {
			infowindow.setPosition(loc);
			var infoWindowContent = '';
			infoWindowContent += ('<b>'+ids.length+' friend'+(ids.length==1?'':'s')+' in '+city+'</b><br>');
			for(var p=0;p<ids.length;p++) {
				infoWindowContent += '<img src="'+pictureInfo[ids[p]]+'" title="'+friends[ids[p]]+'">&nbsp;';
			}
			infowindow.setContent(infoWindowContent);
			infowindow.open(map);
		}

		function countItems(obj) {
			var c = 0;
		   	for(var i in obj){if(obj.hasOwnProperty(i)){c++;}};
		   	return c;
		}
		function constructCsv(obj) {
			var c = '';
		   	for(var i in obj){if (obj.hasOwnProperty(i)){c+=(i+',');}};
		   	return c.substring(0,c.length-1);
		}

		function displayBirthdays(y,m,d) {			
			var bdaylist=[], out = ['<div style="width:100%">'];
			var count=0;
			for (var month in birthdayInfo) {
				if(month=='Unknown'||!birthdayInfo.hasOwnProperty(month))
					continue;
				if(month!=m)
					continue;
				var monthObj = birthdayInfo[month];
				var htmlContent='';total=0;
				for (var day in monthObj) {
					if(!monthObj.hasOwnProperty(day)) {
						continue;
					}
					if((day=='Unknown')||(d && d!=day))
						continue;
					for(var c=0;c<monthObj[day].length;c++) {
						bdaylist[bdaylist.length]=monthObj[day][c];
						count++;
						out.push('<div class="userbox"><img src="' , pictureInfo[monthObj[day][c]], '" align="left">&nbsp;', MONTHS[m-1], '&nbsp;', day, '<br>&nbsp;<b>', friends[monthObj[day][c]], '</b></div>');
					}
				}
			}
			out.push('<div style="clear:both"></div>');
			out.push('</div>');
			var html = '<br><b>'+(count==0?'No':count) +' friends with birthdays '+(d?'on ':'in ')+MONTH_NAMES[m-1]+' '+(d?d:'')+'</b><br><br>';
			document.getElementById('calendar_div_detail').innerHTML = html + out.join('');
		}

		function displayUpcomingBirthdays() {		
			var count = 0, monthcount=0;
			var today = new Date();
			
			var m = today.getMonth(); //0-11
			var d = today.getDate();
		
			var out = ['<div style="width:350px">'];
			out.push('<span class="bold"><u>Upcoming birthdays</u>:</span>');
		
			if(countItems(birthdayInfo)!=0) {
				var month = m+1;
				do {
					var monthObj = birthdayInfo[month];
					for (var day in monthObj) {
						if(!monthObj.hasOwnProperty(day)) {
							continue;
						}
						if(day=='Unknown' || (parseInt(day,10)<parseInt(d,10) && month==(m+1)))
							continue;
						for(var c=0;c<monthObj[day].length;c++) {				
							count++;										
							if(c==0) {
								out.push('<br><b>', MONTHS[month-1], '&nbsp;', day, '</b>&nbsp;-&nbsp;',  friends[monthObj[day][c]]);						
							} else {
								out.push(',&nbsp;',  friends[monthObj[day][c]]);
							}
							if(count>5)
								break;
						}
						if(count>5)
							break;
					}
					if(count>5)
						break;
					month++;
					monthcount++;
					if(month>12)
						month = 1;
				} while(count<5 || monthcount>1);
			} else {
				out.push('None in the next 2 months');
			}
			
			out.push('</div><br>');			
			document.getElementById('upcoming_div_detail').innerHTML = out.join('');
		}
		
		function displayAllFriends() {
			var out = [''];
			for(var p in pictureInfo) {
				if(friends[p])
					out.push('<div class="userbox"><img src="' , pictureInfo[p], '" align="left">&nbsp;<b>', friends[p],'</b></div>');
				else
					out.push('<div class="userbox"><img src="' , pictureInfo[p], '" align="left">&nbsp;<b>', 'You','</b></div>');
			}
			document.getElementById('friendsBlock').innerHTML += out.join('');
		}

		function initCaps(str) {
			if(str && str.length>0)
				str = str.substr(0, 1).toUpperCase() + str.substring(1, str.length);
			return str;
		}

		function log(s) {
			if(DEBUG) {
				document.getElementById('debugLog').innerHTML = '=> '+s+'<br>'+document.getElementById('debugLog').innerHTML;
				document.getElementById('debugLog').scrollTop=9999;
			}
		}

		function formatData(s) {
			//TODO : Format this for quotes and double quotes
			return s;
		}

		function reloadTimeline() {
			var who = document.getElementById('friendselect').value;
			if(!who||who==''||who=='-1')
				who = 'me';
			displayTimeline(who);
		}
		
		function displayTimeline(user) {
			$('#friendselect').change(reloadTimeline);
			if(FeedInfo) {
				FeedInfo = false;
				clearTimeline();
				retrieveFeedInfo(user);
			}
		}

		var retrieveFeedInfo = function (user, url) {

			log('<br>retrieveFeedInfo with url : '+url);
			if(!user)
				user = 'me';
			if(!url) {
				url = '/'+user+'/feed?fields=id,type,message,likes,comments,from';
			} else {
				url = '/'+user+'/feed?'+url;
			}
			url = url + '';

			FB.api(url, { limit: 25 }, function(response) {
				if(response.error) {
					FeedInfo = true;
					return;
				}
				var nextUrl = '', objs = [];
				if(response.paging)
					nextUrl = response.paging.next;
				if(response.data) {
					var data = response.data;
					if(data && data.length) {
						log(data.length+' posts retrieved');
						for(var p in data) {
							if(!data.hasOwnProperty(p))
								continue;
							var id = data[p].id;
							var postid = id.substring(id.indexOf('_')+1);
							var friendid = id.substring(0,id.indexOf('_'));
							var message = formatData(data[p].message);
							var createdtime = data[p].created_time;
							var title = 'Status Update';
							var user = friendid;
							if(data[p].from && data[p].from.id!=friendid) {
								user = friendid;
								friendid = data[p].from.id;
								title = 'Posted by '+data[p].from.name;
							}
							if(data[p].type=='link') {
								continue;
							}
							if(data[p].type=='video') {
								data[p].name;;
							}
							var tempobjarr = [];
							if(data[p].comments) {
								if(message && message!='') {
									tempobjarr.push({'postid':postid, 'user': user, 'friendid':friendid, 'title':title, 'message':message, 'createdtime':createdtime});
								}
								//Write as many objects as there are mesages
								var mdata = data[p].comments.data;
								for(var m=0;m<mdata.length;m++) {
									var mobj = mdata[m];
									friendid = mobj.from.id;
									//postid = '';
									message = mobj.message;
									//Use the same created time to stack the messages
									//createdtime = obj.created_time;
									if(message && message!='') {
										tempobjarr.push({'postid':postid, 'user': user, 'friendid':friendid, 'title':title, 'message':message, 'createdtime':createdtime});
									}
								}
								tempobjarr.reverse();
							} else {
								/*
								if(data[p].likes || data[p].comments)
									message += '[';
								if(data[p].likes){
									message += (data[p].likes.count+' Likes ');
								}
								if(data[p].comments) {
									message += (data[p].comments.count+' Comments');
								}
								if(data[p].likes || data[p].comments)
									message += ']';
								*/
								tempobjarr.push({'postid':postid, 'friendid':friendid, 'title':title, 'message':message, 'createdtime':createdtime});
							}
							objs = objs.concat(tempobjarr);
						}
					}
				}

				//Udate the timeline here
				if(objs.length>0) {
					updateTimeline(objs);
				}

				if(nextUrl!='') {
					nextUrl = nextUrl.substring(nextUrl.indexOf('?')+1);
					FeedInfo = false;
					retrieveFeedInfo(user, nextUrl);
				} else {
					FeedInfo = true;
				}
			});
		}
		
		function createFriendsDropdown() {

			var tempArr = [];
			for(var k in friends) {
				if(!friends.hasOwnProperty(k))
					continue;
				tempArr.push([k, friends[k]]);	
			}	
			tempArr.sort(function(a, b){
							var val1 = a[1];
							var val2 = b[1];
							if (val1 == val2)
								return 0;
							if (val1 > val2)
								return 1;
							if (val1 < val2)
								return -1;
						});

			var friendsDropdown = document.createElement('select');
			friendsDropdown.setAttribute('id', 'friendselect');	
			//friendsDropdown.setAttribute('onChange', 'reloadTimeline();');
			friendsDropdown.options[friendsDropdown.options.length] = new Option('You', 'me', true, true);
			
			var friendsDropdown2 = document.createElement('select');
			friendsDropdown2.setAttribute('id', 'friendsalbumselect');	
			//friendsDropdown2.setAttribute('onChange', 'getAlbumsForDropdown();');
			friendsDropdown2.options[friendsDropdown2.options.length] = new Option('You', 'me', true, true);

			for(var i=0;i<tempArr.length;i++) {
				friendsDropdown.options[friendsDropdown.length] = new Option(tempArr[i][1], tempArr[i][0], false, false);
				friendsDropdown2.options[friendsDropdown2.length] = new Option(tempArr[i][1], tempArr[i][0], false, false);
			}	
			document.getElementById('friendsList').appendChild(friendsDropdown);
			document.getElementById('friendsAlbumList').appendChild(friendsDropdown2);			
		}
		
		String.prototype.getDateFromfacebookFormat = function() {
			var d    = this.split(/[-:T+]/); d[1] -= 1; d.pop();
			var date = new Date(Date.UTC.apply(Date, d));		
			return date;
		}

		Date.prototype.getFormattedDate = function() {
			return this.getDate()+' '+MONTHS[this.getMonth()]+' '+this.getFullYear();
		}

		Date.prototype.getFormattedDateTime = function() {
			var ap = "PM";
			var hours = this.getHours();
			if(hours<12)
				ap = "AM";
			if(hours==0)
				hours = 12;
			else if(hours>12) {
				hours = hours-12;
			}
			var minutes = ""+this.getMinutes();
			if(minutes.length==1)
				minutes = "0"+minutes;
			var seconds = ""+this.getSeconds();
			if(seconds.length==1)
				seconds = "0"+seconds;
			return this.getDate()+' '+MONTHS[this.getMonth()]+' '+this.getFullYear()+' '+hours+':'+minutes+':'+seconds+' '+ap;
		}

		if(!Array.indexOf){
		  Array.prototype.indexOf = function(obj){
				  for(var i=0; i<this.length; i++){
					  if(this[i]==obj){
						  return i;
					  }
				  }
			  return -1;
		  }
		}		