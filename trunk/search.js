
		var polltime = 30;
		var lastpolltime = 0;
		var searchtimer;
		var searchStr;
		var individualtimers = [];
		
		$(function() {
			
			/*
			$("#searchStr").focus(function() {
				this.removeClass('lightText');
				if(this.value=='Enter your query')
					this.value = '';
			});

			$("#searchStr").blur(function() {
				if(this.value=='') {
					this.value = 'Enter your query';
					this.addClass('lightText');
				}
			});
			*/
			
			$("#searchStr").keyup(function(event){
				var searchStr = document.getElementById('searchStr').value;
				if(event.keyCode == 13 && searchStr!=''){
					searchFacebook();
				}
			});
		});

		function searchFacebook() {
			searchStr = document.getElementById('searchStr').value;
			if(searchStr=='')
				return;
		
			if(searchtimer)
				window.clearTimeout(searchtimer);
			for(var i=0;i<individualtimers.length;i++) {
				if(individualtimers[i])
					window.clearTimeout(individualtimers[i]);
			}
			lastpolltime = 0;
			$("#searchResults .item").removeClass('border').html('');
			continueSearching();
		}
		
		function continueSearching() {			
			var opts = {};
			opts['limit'] = 10;
			//opts['since'] = lastpolltime;
			var url = '/search?q='+searchStr+'&type=post';
			FB.api(url, opts, function(response) {
				if(response.error) {
					return;
				}				
				displaySearchResults(response.data);
			});
			searchtimer = window.setTimeout("continueSearching();", 35000);
		}

		function displaySearchResults(data) {
			var count = data.length;
			var delay = polltime/count;
			for(var i=0;i<count;i++) {
				individualtimers[i] = window.setTimeout(function(a) {
					return function() {
						var obj = data[count-a-1];
						addNewElement(obj);
					}
				}(i), delay*1000*i);
			}	
		}

		function addNewElement(obj) {
			var createdtime = obj.created_time;
			createdtime = createdtime.getDateFromfacebookFormat().getTime();
			
			if(lastpolltime>=createdtime) 
				return;
				
			if(lastpolltime<createdtime) {
				lastpolltime = createdtime;
			} 
			
			var locatime = new Date(createdtime);
			$("#searchResults .item:last").remove();
			var imgHtml = '<img src="http://graph.facebook.com/'+obj.from.id+'/picture">';
			var msgHtml = '';
			if(obj.message)
				msgHtml += obj.message;
			if(obj.name)
				msgHtml += '&nbsp;&nbsp;'+obj.name;
			if(obj.description)
				msgHtml += '&nbsp;&nbsp;'+obj.description;
			
			var pattern=new RegExp(searchStr, "gi");			
			msgHtml = msgHtml.replace(pattern, '<span style="background-color:#FFFBF0;font-weight:bold">'+searchStr+'</span>');
			
			var html = '<table border="0" cellpadding="5" cellspacing="2"><tr><td width="60" align="center">'+imgHtml+'</td><td><a target="_blank" href="http://www.facebook.com/'+obj.from.id+'/posts/'+obj.id.substring(obj.id.indexOf('_')+1)+'"><b>'+obj.from.name+'</b></a> &nbsp;:&nbsp;'+msgHtml+((obj.type=="video")?' <span style="color:#4D2600">[Video]</span>':'')+'<br><br>';
			if(obj.icon) {
				html += '<img src="'+obj.icon+'">&nbsp;';
			}
			html += '<span style="color:#999999">'+locatime+'</span></td></tr></table>';
			$("<div>").addClass('item').addClass('border').css('opacity', '1').html(html).insertBefore("#searchResults .item:first").hide().slideDown(500);
		}

		/*
		var startSearch = function() {
			document.getElementById('searchResults').innerHTML = '';
			var searchStr = document.getElementById('searchStr').value;
			var total = countItems(friends);
			var current = 0;
			while(current<total) {
				searchMyFeed(searchStr, current, current+10);
				current += 10;
			}			
		}

		var searchMyFeed = function(searchStr, untilTime) {
			var friendsList = constructPartialCsv(friends);
			var opts = {};
			opts['limit'] = 25;
			if(untilTime)	
				opts['until'] = untilTime;

			var url = '/feed?ids='+friendsList+'&fields=id,message,from';
			FB.api(url, opts, function(response) {
				if(response.error) {
					return;
				}
				var untilTime = 0;
				for(var k in response) {
					if(!response.hasOwnProperty(k))
						continue;
					var data = response[k].data;
					
					//if(response[k].paging && response[k].paging.next) {
					//	var curUntilTime = response[k].paging.next;
					//	curUntilTime = curUntilTime.substring(curUntilTime.indexOf('until=')+6);
					//	if(curUntilTime.indexOf('&')!=-1)
					//		curUntilTime = curUntilTime.substring(0,curUntilTime.indexOf('&'));
					//	curUntilTime = parseInt(curUntilTime,10)-1;
					//	if(untilTime<curUntilTime)
					//		untilTime = curUntilTime;
					//}
					
					if(data && data.length) {
						for(var p in data) {
							if(!data.hasOwnProperty(p))
								continue;
							var message = data[p].message;
							if(message && message.toLowerCase().indexOf(searchStr.toLowerCase())>=0) {
								var out = [''];
								var fromUser = 'User';
								if(data[p].from && data[p].from.name)
									fromUser = data[p].from.id;
								out.push('<div style="margin-top:10px;height:90px;border:1px solid #AAAAAA"><img src="https://graph.facebook.com/', fromUser, '/picture?access_token=', userAccessToken, '" align="left">&nbsp;<b>', friends[fromUser],'</b><br>&nbsp;', message, '</div>');
								document.getElementById('searchResults').innerHTML += out.join('');
							}
						}
					}
				}
				//if(untilTime && untilTime!='') {
				//	searchMyFeed(searchStr, untilTime);
				//}
			});
		}
		*/