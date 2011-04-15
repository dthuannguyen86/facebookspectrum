    	var DEBUG = false;

		var userLoggedIn = false;
		var loggedInUserId;
		var userAccessToken;
		var friends = {};
		var likes = {};
		var albumInfo = {};
		var photosInfo = {};
		var locationInfo = {};
		var geocodeInfo = {};
		var birthdayInfo = {};
		var pictureInfo = {};
		var genderInfo = {};
		var mutualFriends = {};
		var mutualLikes = {};
		var educationInfo = {};
		var activityData = {};
		var MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
		var map;
		var infowindow;
		var geocoder = new google.maps.Geocoder();
		var lat_min = 90;
		var lat_max = -90;
		var lng_min = 180;
		var lng_max = -180;
		var FeedLoadComplete = true;
		var OFFSETCOUNT = 50;
		var AlbumsLoaded = false;
		var activityloadcount = 0;
		
		var albumsLoading = false;
		
		var progressbarobj = new UProgressBar({"elid":"waiting","min":0,"max":0,"value":0});

		var revealAlbumInfo = function (url) {
			//document.getElementById('resp').innerHTML += '<br>Entering revealAlbumInfo with url : '+url;
			
			log('Started loading album information');
			if(!url) {
				var friendsList = constructCsv(friends);
				//document.getElementById('album_charts').innerHTML += '<br>FriendList CSV = '+friendsList;
				url = '/albums?ids='+friendsList+'&fields=id,name,count,link';
			}
			FB.api(url, { limit: 50 }, function(response) {
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

					if(!userAccessToken) {
						var accessToken = nextUrl;
						accessToken = accessToken.substring(accessToken.indexOf('access_token')+13);
						accessToken = accessToken.substring(0, (accessToken.indexOf('&')==-1)?accessToken.length:accessToken.indexOf('&'));
						userAccessToken = accessToken;
					}

					/* 
					//Do not call again, comment this for now and increase the limit to 50..
					if(nextUrl!='') {
						nextUrl = nextUrl.substring(nextUrl.indexOf("/albums"));
						nextUrl = nextUrl.replace(escape(friendsList), k);						
						revealAlbumInfo(nextUrl);						
					} else {
						AlbumsLoaded = true;
					}
					*/
				}
				//Done loading all the album information
				AlbumsLoaded = true;
				log('Completed loading album information');
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
			FB.api(url, { limit: 50 }, function(response) {
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
			FB.api(url, { limit: 50 }, function(response) {
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
			FB.api(url, { limit: 50 }, function(response) {
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
			//document.getElementById('album_charts').innerHTML = '<div id="album_chart_div"></div>'+'<div id="photo_chart_div"></div><div style="clear:both"></div><br>';
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
			log('Drawing map complete');
		}

		var displayBirthdayInfo = function() {		
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
			
			var albumData = [];
			for (var i=0;i<sortable.length;i++) {
				if(i==10)
					break;
				log('Adding '+friends[sortable[i][0]]+' and '+sortable[i][1]+' to the album list');
				var temp = [];
				temp.push(sortable[i][0]);
				temp.push(sortable[i][1]);
				albumData.push(temp);
			}
			highalbumoptions.series[0].data = albumData;
			var t = new Highcharts.Chart(highalbumoptions);
		}

		function drawPhotoChart() {
			var sortable = [];
			for (var key in photosInfo) {
				if (photosInfo.hasOwnProperty(key))
					sortable.push([key, photosInfo[key]])
			}
			sortable.sort(function(a, b) {return b[1] - a[1]});

			var photoData = [];
			for (var i=0;i<sortable.length;i++) {
				if(i==10)
					break;
				log('Adding '+friends[sortable[i][0]]+' and '+sortable[i][1]+' to the photo list');
				var temp = [];
				temp.push(sortable[i][0]);
				temp.push(sortable[i][1]);
				photoData.push(temp);
			}
			highphotooptions.series[0].data = photoData;
			var t = new Highcharts.Chart(highphotooptions);			
		}

		function drawGenderChart() {
			var genderData = [];
			for (var key in genderInfo) {
				if (genderInfo.hasOwnProperty(key)) {
					var temp = [];
					temp.push(key);
					temp.push(genderInfo[key].length);
					genderData.push(temp);
				}
			}
			highgenderoptions.series[0].data = genderData;
			var t = new Highcharts.Chart(highgenderoptions);				
		}

		function drawEducationChart() {
			var educationData = [];
			for (var key in educationInfo) {
				if (educationInfo.hasOwnProperty(key)) {
					var temp = [];
					temp.push(key);
					temp.push(educationInfo[key].length);
					educationData.push(temp);
				}
			}
			higheducationoptions.series[0].data = educationData;
			var t = new Highcharts.Chart(higheducationoptions);			
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


 
		///////////////////////////////////////////////
		//Replace Geocoding API with Local Search API//
		///////////////////////////////////////////////
		var localSearch;
		var localSearchCounter = 0;
		var locationArray = [];

		function localSearchComplete() {
			if (localSearch.results && localSearch.results.length > 0) {
				var latlng = new google.maps.LatLng(localSearch.results[0].lat, localSearch.results[0].lng);
				geocodeInfo[locationArray[localSearchCounter]] = latlng;
			} else {
				geocodeInfo[locationArray[localSearchCounter]] = null;
			}
			localSearchCounter++;
			localSearchNextAddress();
		}

		function convertLocationToArray() {
			for (var key in locationInfo) {
				if(!locationInfo.hasOwnProperty(key) || key=='Unknown')
					continue;
				locationArray[locationArray.length] = key;
			}
		}

		function localSearchNextAddress() {

			if(localSearchCounter>=locationArray.length)
				return;
				
			var addr = locationArray[localSearchCounter]; 			

			localSearch = new google.search.LocalSearch();
			//localSearch.setCenterPoint(addr);
			localSearch.setSearchCompleteCallback(this, localSearchComplete, null);
			localSearch.execute(addr); 
			//google.search.Search.getBranding('branding');
		}
				
		function geocodeAllAddresses() {
			convertLocationToArray();
			localSearchNextAddress();
		}
		

		//This has to be done in the background to avoid time lag
		/*
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
		*/
		
		function geocodeAddress(address) {
			geocoder.geocode( { 'address': address}, function(results, status) {
				if (status == google.maps.GeocoderStatus.OK) {
					geocodeInfo[address] = results[0].geometry.location;
					log('Geocoded '+address+' to '+results[0].geometry.location.toString());
				} else {
					geocodeInfo[address] = null;
					//alert("Could not geocode "+address+" - Reason: " + status);
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
				document.getElementById('debugLog').innerHTML = (new Date())+' => '+s+'<br>'+document.getElementById('debugLog').innerHTML;
				//document.getElementById('debugLog').scrollTop=9999;
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
			if(FeedLoadComplete) {
				FeedLoadComplete = false;
				clearTimeline();
				retrieveFeedInfo(user);
			}
		}

		var retrieveFeedInfo = function (user, untilTime) {

			log('<br>retrieveFeedInfo with offset : '+untilTime);
			if(!user)
				user = 'me';
			
			var opts = {};
			opts['limit'] = OFFSETCOUNT;
			if(untilTime)	
				opts['until'] = untilTime;

			url = '/'+user+'/feed?fields=id,type,message,likes,comments,from';

			FB.api(url, opts, function(response) {
				if(response.error) {
					FeedLoadComplete = true;
					return;
				}
				var untilTime = '', objs = [];
				if(response.paging && response.paging.next) {
					untilTime = response.paging.next;
					untilTime = untilTime.substring(untilTime.indexOf('until=')+6);
					if(untilTime.indexOf('&')!=-1)
						untilTime = untilTime.substring(0,untilTime.indexOf('&'));					
				}
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
								message = '(video)';
								//data[p].name
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
								if(message && message!='') {
									tempobjarr.push({'postid':postid, 'user': user, 'friendid':friendid, 'title':title, 'message':message, 'createdtime':createdtime});
								}
							}
							objs = objs.concat(tempobjarr);
						}
					}
				}

				//Udate the timeline here
				if(objs.length>0) {
					updateTimeline(objs);
				}

				if(untilTime && untilTime!='') {
					untilTime = parseInt(untilTime,10)-1;
					FeedLoadComplete = false;
					retrieveFeedInfo(user, untilTime);
				} else {
					FeedLoadComplete = true;
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
			friendsDropdown.options[friendsDropdown.options.length] = new Option('You', 'me', true, true);
			
			var friendsDropdown2 = document.createElement('select');
			friendsDropdown2.setAttribute('id', 'friendsalbumselect');	
			friendsDropdown2.options[friendsDropdown2.options.length] = new Option('You', 'me', true, true);

			for(var i=0;i<tempArr.length;i++) {
				friendsDropdown.options[friendsDropdown.length] = new Option(tempArr[i][1], tempArr[i][0], false, false);
				friendsDropdown2.options[friendsDropdown2.length] = new Option(tempArr[i][1], tempArr[i][0], false, false);
			}	
			document.getElementById('friendsList').appendChild(friendsDropdown);
			document.getElementById('friendsAlbumList').appendChild(friendsDropdown2);			
		}
		

		function displayFriendSphere() {
			var data = new google.visualization.DataTable();
			data.addColumn('string', 'Name');
			data.addColumn('string', 'ID');
			data.addRows(countItems(friends));

			var p=0;
			for(var k in friends) {
				if(!friends.hasOwnProperty(k))
					continue;
				var name = friends[k];
				var id = k;
				data.setCell(p, 0, name);
				data.setCell(p, 1, id);
				p++;
			}
			var vis = new gviz_word_cumulus.WordCumulus(document.getElementById('friendsSphere'));
			vis.draw(data, {text_color: '#663300', hover_text_color: '#000066', speed: 1, width:900, height:600});			
		}
		
		function displayMutualFriendInfo() {
			var e = document.createElement('script');
			e.type = 'text/javascript';
			e.src = "https://api.facebook.com/method/fql.multiquery?queries=%7B'query1'%3A'SELECT%20uid2%20FROM%20friend%20WHERE%20uid1%20%3D%20"+loggedInUserId+"'%2C'query2'%3A'SELECT%20uid1%2C%20uid2%20FROM%20friend%20WHERE%20uid1%20IN%20(SELECT%20uid2%20FROM%20%23query1)%20AND%20uid2%20IN%20(SELECT%20uid2%20FROM%20%23query1)'%7D&access_token="+userAccessToken+"&format=json&callback=foundMutualFriends";
			e.async = true;
			document.getElementById('mutuals').appendChild(e);
		}
		
		function foundMutualFriends(resp) {
			mutualFriends = {};
			var arrObjs = resp[1]['fql_result_set'];
			for(var m=0;m<arrObjs.length;m++) {
				var curMapping = arrObjs[m];
				var curUser = curMapping['uid1'];
				if(mutualFriends[curUser]) {
				} else {
					mutualFriends[curUser] = [];
				}
				mutualFriends[curUser][mutualFriends[curUser].length] = curMapping['uid2'];
			}
			
			var friendCategories = [], friendData = [];
			for(var m in mutualFriends) {
				var allFriends = mutualFriends[m];
				friendCategories.push(friends[m]);
				friendData.push(allFriends.length);
			}
			highfriendoptions.xAxis.categories = friendCategories;
			highfriendoptions.series[0].data = friendData;
			
			var t = new Highcharts.Chart(highfriendoptions);	
		}

		function loadLikesInfo() {
			FB.api('/me/likes', function(response) {
				for(var i=0;i<response.data.length;i++) {
					likes[response.data[i].id] = response.data[i].name;
				}			
			});
		}

		function displayMutualLikesInfo() {
			var e = document.createElement('script');
			e.type = 'text/javascript';
			e.src = "https://api.facebook.com/method/fql.query?query=select%20uid%2C%20page_id%2C%20type%20%20from%20page_fan%20where%20page_id%20in%20(select%20page_id%20from%20page_fan%20where%20uid%20%3D%20me())%20and%20uid%20%20in%20(select%20uid2%20from%20friend%20where%20uid1%3Dme())%20&access_token="+userAccessToken+"&format=json&callback=foundMutualLikes";
			e.async = true;
			document.getElementById('mutuallikes').appendChild(e);
		}
		
		function foundMutualLikes(resp) {
			mutualLikes = {};
			var arrObjs = resp;
			for(var m=0;m<arrObjs.length;m++) {
				var curMapping = arrObjs[m];
				var curPage = curMapping['page_id'];
				if(mutualLikes[curPage]) {
				} else {
					mutualLikes[curPage] = [];
				}
				mutualLikes[curPage][mutualLikes[curPage].length] = curMapping['uid'];
			}

			var likeCategories = [], likeData = [];
			for(var m in mutualLikes) {
				var allFriends = mutualLikes[m];
				likeCategories.push(likes[m]);
				likeData.push(allFriends.length);
			}
			highlikeoptions.xAxis.categories = likeCategories;
			highlikeoptions.series[0].data = likeData;
			
			var t = new Highcharts.Chart(highlikeoptions);
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