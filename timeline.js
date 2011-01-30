var timeline;
var eventSource;
function createTimeline() {
	eventSource = new Timeline.DefaultEventSource();
	var tl_el = document.getElementById("timeline_div");

	var theme = Timeline.ClassicTheme.create();
	theme.event.bubble.width = 300;
	theme.event.bubble.height = 200;
	theme.event.track.height = 15;
	theme.event.tape.height = 8;
	theme.timeline_start = new Date(Date.UTC(2005, 10, 1));
	theme.timeline_stop  = new Date(Date.UTC(2012, 0, 1));

	//var d = Timeline.DateTime.parseGregorianDateTime("2010-02-15");
	var bandInfos = [
		Timeline.createBandInfo({
			width:          '80%',
			intervalUnit:   Timeline.DateTime.DAY,
			intervalPixels: 500,
			eventSource:    eventSource,
			theme:          theme,
			//date:			d,
			eventPainter:   Timeline.CompactEventPainter,
			eventPainterParams: {
				iconWidth:      25,
				iconHeight:     25,
				iconLabelGap:   5,
				labelRightMargin: 5,
				stackConcurrentPreciseInstantEvents: true
			},
			layout:         'original'  // original, overview, detailed
		}),
		/*
		Timeline.createBandInfo({
			width:          '15%', // set to a minimum, autoWidth will then adjust
			intervalUnit:   Timeline.DateTime.DAY,
			intervalPixels: 100,
			eventSource:    eventSource,
			theme:          theme,
			layout:         'overview'  // original, overview, detailed
		}),
		*/
		Timeline.createBandInfo({
			width:          '10%', // set to a minimum, autoWidth will then adjust
			intervalUnit:   Timeline.DateTime.MONTH,
			intervalPixels:	200,
			eventSource:    eventSource,
			theme:          theme,
			layout:         'overview'  // original, overview, detailed
		}),
		Timeline.createBandInfo({
			width:          '10%', // set to a minimum, autoWidth will then adjust
			intervalUnit:   Timeline.DateTime.YEAR,
			intervalPixels:	300,
			eventSource:    eventSource,
			theme:          theme,
			layout:         'overview'  // original, overview, detailed
		})
	];

	bandInfos[1].syncWith = 0;
	bandInfos[1].highlight = true;
	bandInfos[2].syncWith = 0;
	bandInfos[2].highlight = true;
	
	/*
	bandInfos[3].syncWith = 0;
	bandInfos[3].highlight = true;
	bandInfos[3].decorators = [
		new Timeline.SpanHighlightDecorator({
			startDate:  "2000-01-01T00:00:00+0000",
			endDate:    "2025-01-01T00:00:00+0000",
			color:      '#ffffff',
			opacity:    30
		})
	];
	*/

	timeline = Timeline.create(tl_el, bandInfos, Timeline.HORIZONTAL);
	var url = '.'; 
	eventSource.loadJSON(timeline_data, url); 
	timeline.layout(); 
}

var resizeTimerID = null;
function onResize() {
	if (resizeTimerID == null) {
		resizeTimerID = window.setTimeout(function() {
			resizeTimerID = null;
			timeline.layout();
		}, 500);
	}
}

function updateTimeline(objs) {
	if(!timeline)
		createTimeline();
	var newData = timeline_data;
	newData.events = [];
	for(var t=0;t<objs.length;t++) {
		var postid = objs[t]["postid"];
		var friendid = objs[t]["friendid"];
		var user = objs[t]["user"];
		var title = objs[t]["title"];
		var message = objs[t]["message"];
		var createdtime = objs[t]["createdtime"];
		
		var thisDate = createdtime.getDateFromfacebookFormat().getTime();
		//var thisDate = Date.parse(createdtime);
		
		var minTime = timeline.timeline_start.getTime();
		var maxTime = timeline.timeline_stop.getTime();		
		if(thisDate<minTime) {
			var tempDate = new Date(thisDate);
			tempDate.setTime(tempDate.getTime()+(1000*60*60*24));
			timeline.timeline_start = tempDate;
		}
		if(thisDate>maxTime) {
			var tempDate = new Date(thisDate);
			tempDate.setTime(tempDate.getTime()+(1000*60*60*24));
			timeline.timeline_stop = tempDate;
		}
		var len = newData.events.length;
		newData.events[len] = {};
		newData.events[len]['start'] = createdtime;
		//newData.events[len]['title'] = title;
		newData.events[len]['description'] = message;
		newData.events[len]['textColor'] = '#112aba';
		if(postid!='')
			newData.events[len]['link'] = 'http://www.facebook.com/'+user+'/posts/'+postid;
		newData.events[len]['image'] = 'http://graph.facebook.com/'+friendid+'/picture';
		newData.events[len]['icon'] = 'http://graph.facebook.com/'+friendid+'/picture';
	}	
	var url = '.';
	eventSource.loadJSON(newData, url);
	//No need to call layout() again. Just refresh the eventSource
	//timeline.layout();
}

function clearTimeline() {
	if(eventSource) {
		eventSource.clear();
		timeline.layout(); 
	}
}

var timeline_data = {  // save as a global variable
	'dateTimeFormat': 'iso8601',
	'events' : [
	]
}

Timeline.DefaultEventSource.Event.prototype.fillInfoBubble = function(A, E, M) {
	var K = A.ownerDocument;
	var J = 'View post on Facebook';//this.getText();		
	var H = this.getLink();
	var B = this.getImage();
	if (B != null) {
		var D = K.createElement("img");
		D.src = B;
		E.event.bubble.imageStyler(D);
		A.appendChild(D);
	}
	var L = K.createElement("div");
	var C = K.createTextNode(J);
	if (H != null) {
		var I = K.createElement("a");
		I.href = H;
		I.setAttribute('target', 'new');
		I.appendChild(C);
		L.appendChild(I);
	} else {
		L.appendChild(C);
	}
	E.event.bubble.titleStyler(L);
	A.appendChild(L);
	var N = K.createElement("div");
	this.fillDescription(N);
	E.event.bubble.bodyStyler(N);
	A.appendChild(N);
	A.appendChild(K.createElement("br"));
	var G = K.createElement("div");
	this.fillTime(G, M);
	E.event.bubble.timeStyler(G);
	A.appendChild(G);
	//var F = K.createElement("div");
	//this.fillWikiInfo(F);
	//E.event.bubble.wikiStyler(F);
	//A.appendChild(F);
}