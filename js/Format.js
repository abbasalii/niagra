

Format = new function(){

	this.formatTime = function(date){
		return ("0"+date.getHours()).slice(-2) + ":" + ("0"+date.getMinutes()).slice(-2);
	}

	this.convertToTwoDigits = function(str){

		if(str.length==1)
			return "0" + str;
		return str;
	}

	this.getSqlDate = function(){

		var date = new Date();
		return this.toSqlDate(date);
	}

	this.getSqlTime = function(){

		var date = new Date();
		return this.toSqlTime(date);
	}

	this.getSqlDateTime = function(){

		var date = new Date();
		return this.toSqlDateTime(date);
	}


	this.toSqlDate = function(date){

		var year, month, day;
        year = String(date.getFullYear());
        month = this.convertToTwoDigits(String(date.getMonth() + 1));
        day = this.convertToTwoDigits(String(date.getDate()));
        return year + "-" + month + "-" + day;
	}

	this.toSqlTime = function(date){

		var hour,minute,second;
        hour = this.convertToTwoDigits(String(date.getHours()));
        minute = this.convertToTwoDigits(String(date.getMinutes()));
        second = this.convertToTwoDigits(String(date.getSeconds()));
        return hour + "-" + minute + "-" + second;
	}

	this.toSqlDateTime = function(date){

		return this.toSqlDate(date) + " " + this.toSqlTime(date);
	}

	this.formatTime = function(date){
		return ("0"+date.getHours()).slice(-2) + ":" + ("0"+date.getMinutes()).slice(-2);
	}

	this.formatCurrency = function(n){
		return new Number(n).toLocaleString("hi-IN");
	}

	this.formatMobile = function(num){
		return num.substr(0,4) + " " + num.substr(4,7);
	}
}