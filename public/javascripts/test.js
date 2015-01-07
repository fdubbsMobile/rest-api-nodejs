
var initalInterval = 1000;
function Task () {
	this.selected = false;
	this.timeInterval = initalInterval;
	this.lastLine = 0;
	this.count = 0;
	this.timer = 0;
};

Task.prototype.doFetch = function (key, callback) {
	var self = this;
	//alert(JSON.stringify(self));


	function fetch() {
		var interval = self.selected ? 500 : 100;
		//alert("fetch : "+interval);
		var time = self.timeInterval - interval;
		if (time > 0) {
			self.timeInterval = time;
		} else {
			self.timeInterval = initalInterval;
			self.count++;
			//ajax.post(url, callback, true);
			//this.lastLine = newLine;
			callback(key, "interval : " + interval + ", count : " + self.count);
		}
		//self.timer = setTimeout(function (){fetch();}, 1000);
	};
	self.timer = setInterval(function (){fetch();}, 500);
};

Task.prototype.stop = function () {
	//alert("stop");
	var self = this;
	clearInterval(self.timer);
	//clearTimeout(self.timer);
};

Task.prototype.unSelect = function () {
	self = this;
	self.selected = false;
};

Task.prototype.select = function () {
	self = this;
	self.selected = true;
};

Task.prototype.isSelected = function () {
	self = this;
	return self.selected;
};
