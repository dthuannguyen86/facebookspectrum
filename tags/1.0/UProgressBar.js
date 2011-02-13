function UProgressBar(params) {
	this.elid = params.elid;
	this.id = "upb"+Math.ceil(Math.random()*100000000);
	this.created = false;
	if(params.min) {
		this.minValue = params.min;
	} else {
		this.minValue = 0;
	}
	if(params.max) {
		this.maxValue = params.max;
	} else {
		this.maxValue = 0;
	}
	if(params.value) {
		this.value = params.value;
	} else {
		this.value = 0;
	}	
}

UProgressBar.prototype.setValue = function(newVal) {
	log('setting value to '+newVal+' MaxValue is '+this.maxValue);
	this.value = newVal;	
	this.paint();
	if(this.value==this.maxValue) {
		this.hide();
	}
}

UProgressBar.prototype.paint = function(){
	log('painting');
	if(!this.created) {
		var barEle = document.createElement('div');
		barEle.setAttribute('class', 'progressbar');
		barEle.setAttribute('id', this.id+'progressbar');

		var progressEle = document.createElement('div');
		progressEle.setAttribute('class', 'progress');
		progressEle.setAttribute('id', this.id+'progress');
		barEle.appendChild(progressEle);

		document.getElementById(this.elid).appendChild(barEle);	
		this.created = true;
	}	
	var newWidth = [(100*this.value)/(this.maxValue-this.minValue)]*2;
	document.getElementById(this.id+'progress').style.width=newWidth+'px';
	log('new width = '+newWidth+'px');
}

UProgressBar.prototype.getMinValue = function() {
	return this.minVale;
}

UProgressBar.prototype.getMaxValue = function() {
	return this.maxValue;
}

UProgressBar.prototype.setMaxValue = function(maxval) {
	this.maxValue = maxval;
}

UProgressBar.prototype.getCurrentValue = function() {
	return this.value;
}

UProgressBar.prototype.hide = function() {
	log('hiding');
	document.getElementById(this.id+'progressbar').style.display = 'none';
	document.getElementById(this.id+'progress').style.width = '0px';
}

UProgressBar.prototype.initialize = function() {
	document.getElementById(this.id+'progressbar').style.display = '';
	document.getElementById(this.id+'progress').style.width = '0px';
	this.value = this.minValue;
}
   	