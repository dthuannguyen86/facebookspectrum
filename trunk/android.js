
	var polltime = 30;
	var lastpolltime = 0;
	var searchtimer;
	var MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
	var searchStr;
	var individualtimers = [];

	$(function() {
		$("#searchStr").keyup(function(event){
			var searchStr = document.getElementById('searchStr').value;
			if(event.keyCode == 13 && searchStr!=''){
				searchFacebook();
			}
		});
		$("#searchStr").focus(function(event){
			Android.showKeyboard();
		});
		$("#searchStr").blur(function(event){
			Android.hideKeyboard();
		});
		
		window.setTimeout("searchFacebook();",1000);
	});

	function searchFacebook() {		
		searchStr = document.getElementById('searchStr').value;
		if(searchStr=='') {
			searchStr = Android.getKeyword();		
			if(searchStr=='') {
				Android.message('Enter a keyword and watch all the related posts on Facebook in real-time..');
				return;
			}
			document.getElementById('searchStr').value = searchStr;
		}

		Android.setKeyword(searchStr);
		Android.message('Loading.. Please wait..');
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
		Android.hideMessage();
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

		if(msgHtml.length>100)
			msgHtml = msgHtml.substring(0, 100)+'..';

		var pattern=new RegExp(searchStr, "gi");			
		msgHtml = msgHtml.replace(pattern, '<span style="background-color:#FFFBF0;font-weight:bold">'+searchStr+'</span>');

		var html = '<table border="0" cellpadding="0" cellspacing="5"><tr valign="top"><td width="50" align="left" valign="top">'+imgHtml+'</td><td><a href="https://m.facebook.com/story.php?story_fbid='+obj.id.substring(obj.id.indexOf('_')+1)+'&id='+obj.from.id+'"><b>'+obj.from.name+'</b></a> &nbsp;:&nbsp;'+msgHtml+((obj.type=="video")?' <span style="color:#4D2600">[Video]</span>':'')+'<br>';
		if(obj.icon) {
			html += '<img src="'+obj.icon+'">&nbsp;';
		}
		html += '<span style="color:#999999">'+locatime.getFormattedDateTime()+'</span></td></tr></table>';
		$("<div>").addClass('item').addClass('border').css('opacity', '1').html(html).insertBefore("#searchResults .item:first").hide().fadeIn(1500);
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