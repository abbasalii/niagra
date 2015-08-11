ACC_REQ_TYPE_TRANS = 1;

TRANS_DET_MIN_LEN = 5;
TRANS_DET_MAX_LEN = 100;


Trans = new function(){

	var accounts = null;
	var cities = null;
	var transs = null;
	var udate = new Date();
	var auto = {};

	this.init = function(){
		console.log("Initializing transactions...");
		this.getCities();
		this.getAccounts();
		// this.setAccounts([{ID:1,TITLE:'CA SPORTS',CITY_ID:3},{ID:2,TITLE:'NEW SPORTS',CITY_ID:2},
		// 	{ID:3,TITLE:'SAKI',CITY_ID:1},{ID:4,TITLE:'TWO SPORTS',CITY_ID:4}]);
	}

	this.getCities = function(){
		Socket.requestCityList();
	}

	this.getAccounts = function(){
		Socket.requestAccounts(ACC_REQ_TYPE_TRANS);
	}

	this.setCities = function(data){

		cities = data.sort(function(a,b){
			if(a.NAME>b.NAME)
				return 1;
			else
				return -1;
		});

		var text = "<option value='-1'>All</option>";
		$("#cityList").html("");
		for(var i=0; i<cities.length; i++){
			text += "<option value='"+cities[i].ID+"''>"+cities[i].NAME+"</option>";
			$("#cityList").append("<option value='"+cities[i].NAME+"'/>");
		}
		$("#transCitySelect").html(text);
	}

	// this.searchCities = function(acc){

	// 	var text = "";
	// 	if(acc.length==0){
	// 		text += "<option value='-1'>All</option>";
	// 		for(var i=0; i<cities.length; i++)
	// 			text += "<option value='"+cities[i].ID+"''>"+cities[i].NAME+"</option>";
	// 	}
	// 	else{
	// 		var temp = [];
	// 		for(var i=0; i<accounts.length; i++){
	// 			if(accounts[i].TITLE.indexOf(acc)>-1 && temp.indexOf(accounts[i].CITY_ID)<0)
	// 				temp.push(accounts[i].CITY_ID);
	// 		}
	// 		for(var i=0; i<temp.length; i++)
	// 			for(var j=0; j<cities.length; j++)
	// 				if(cities[j].ID==temp[i]){
	// 					text += "<option value='"+cities[j].ID+"''>"+cities[j].NAME+"</option>";
	// 					break;
	// 				}
	// 	}
	// 	$("#transCitySelect").html(text);
	// }

	this.setAccounts = function(data){

		accounts = data.sort(function(a,b){
			if(a.TITLE>b.TITLE)
				return 1;
			else
				return -1;
		});

		$("#accList").html("");
		$("#newTransAcc").html("<option value='-2' disabled>Select Account</option>");
		$("#newTransAcc").append("<option value='-1'>NEW</option>");
		for(var i=0; i<accounts.length; i++){
			$("#accList").append("<option value='"+accounts[i].TITLE+"'/>");
			$("#newTransAcc").append("<option value='"+accounts[i].ID+"'>"+accounts[i].TITLE+"</option>");
		}
		$("#newTransAcc").val(-2);
	}

	this.searchAccounts = function(cid){

		$("#accList").html("");
		if(cid<0){
			for(var i=0; i<accounts.length; i++)
				$("#accList").append("<option value='"+accounts[i].TITLE+"'/>");
		}
		else{
			for(var i=0; i<accounts.length; i++)
				if(accounts[i].CITY_ID==cid)
					$("#accList").append("<option value='"+accounts[i].TITLE+"'/>");
		}
	}

	this.searchTransactions = function(){

		var cid = parseInt($("#transCitySelect").val());
		var acc = $("#searchTransBar").val().trim().toUpperCase();
		var bdate = $("#beginTransDate").val();
		if(bdate.length==0){
			console.log("begin date not specified");
			bdate = new Date("1970-01-01");
		}
		else{
			bdate = new Date(bdate);
		}
		bdate = this.toSqlDate(bdate) + " 00-00-00";

		var edate = $("#endTransDate").val();
		if(edate.length==0){
			console.log("end date not specified");
			edate = new Date();
		}
		else{
			edate = new Date(edate);
		}
		edate = this.toSqlDate(edate) + " 23-59-59";

		var min = parseInt($("#minTransAmount").val());
		if(isNaN(min)){
			min = 0;
			console.log("Minimum amount not specified. Default is "+min);
		}
		var max = parseInt($("#maxTransAmount").val());
		if(isNaN(max)){
			max = 9999999;
			console.log("Maximum amount not specified. Default is "+max);
		}

		var transRequest = {
			TITLE: acc,
			CITY_ID: cid,
			B_DATE: bdate,
			E_DATE: edate,
			MIN: min,
			MAX: max
		};

		Socket.searchTransactions(transRequest);
	}

	this.setTransactions = function(data){
		transs = data;

		var text = "<table id='transDataTab'>";
		text += "<tr>";
		text += "<th>No.</th>";
		text += "<th>DATE</th>";
		text += "<th>TIME</th>";
		text += "<th>TITLE</th>";
		text += "<th>AMOUNT</th>";
		text += "<th>DESCRIPTION</th>";
		text += "</tr>";

		for(var i=0; i<transs.length; i++){

			text += "<tr>";
			text += "<td>" + (i+1) + "</td>";
			var tdate = new Date(transs[i].T_DATE);
			text += "<td>" + tdate.toDateString(); + "</td>";
			text += "<td>" + this.formatTime(tdate) + "</td>";
			for(var j=0; j<accounts.length; j++)
				if(accounts[j].ID==transs[i].ACCOUNT_ID){
					text += "<td>" + accounts[j].TITLE + "</td>";
					break;
				}
			text += "<td>" + transs[i].AMOUNT + "</td>";
			text += "<td>" + transs[i].DESCRIPTION + "</td>";
			text += "</tr>";
		}

		$("#transDataDiv").html(text);
	}

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

	this.searchAccountID = function(_id){

		if(accounts==null){
			setTimeout(this.searchAccountID,100,_id);
			return;
		}

		for(var i=0; i<accounts.length; i++){
			if(accounts[i].ID==_id){
				$("#transCitySelect").val(accounts[i].CITY_ID);
				$("#searchTransBar").val(accounts[i].TITLE);
				Trans.searchTransactions();
			}
		}
	}

	this.createNewTransaction = function(){
		
		var acc_id = parseInt($("#newTransAcc").val());

		if(isNaN(acc_id) || acc_id<0){
			console.log("Invalid account name");
			return;
		}

		var t_type = $("#newTransType").val();

		var t_date = $("#newTransDate").val();
		if(t_date.length==0){// || (new Date(t_date)>new Date())){
			console.log("Invalid transaction date");
			return;
		}
		t_date = this.toSqlDate(new Date(t_date)) +" "+ this.toSqlTime(udate);

		var amount = parseInt($("#newTransAmount").val());
		if(isNaN(amount) || amount<=0){
			console.log("Invalid transaction amount");
			return;
		}

		var detail = $("#newTransDetail").val().trim();
		if(detail.length<TRANS_DET_MIN_LEN || detail.length>TRANS_DET_MAX_LEN){
			console.log("Valid detail length is 5-100 characters");
			return;
		}

		var other = parseInt($("#newTransAmount2").val());
		var bill = $("#newTransDetail2").val().trim();
		if(t_type=='both'){
			if(isNaN(other) || other<=0){
				console.log("Invalid Credit amount");
				return;
			}

			// bill = detail;
			// if(auto['BILL']!=undefined){
			// 	detail = "Bill No. " + auto['BILL'];
			// }
		}
		else
			other = 0;

		if(t_type=='credit')
			amount = -amount;

		

		transObj = {
			ACCOUNT_ID: acc_id,
			T_DATE: t_date,
			AMOUNT: amount,
			OTHER: other,
			BILL: bill,
			DESCRIPTION: detail
		};

		Socket.makeTransaction(transObj);
	}

	this.displayFields = function(){

		console.log("Transaction type changed");
		var t_type = $("#newTransType").val();
		if(t_type=='both'){
			$("#newTransAmount").attr("placeholder","Debit");
			$("#newTransAmount2").show();
			$("#newTransDetail2").show();
		}
		else{
			$("#newTransAmount2").hide();
			$("#newTransDetail2").hide();
			if(t_type=='credit'){
				$("#newTransAmount").attr("placeholder","Credit");
			}
			else{
				$("#newTransAmount").attr("placeholder","Debit");
			}
		}
	}

	this.setAuto = function(_auto){
		auto = _auto;
	}

	this.autoFill = function(){

		if(accounts==null){
			setTimeout(Trans.autoFill,100);
			return
		}

		$("#newTransAcc").val(auto['ACCOUNT_ID']);
		if(auto['DEBIT']>0){
			$("#newTransAmount").val(auto['DEBIT']);
			if(auto['CREDIT']>0){
				$("#newTransType").val('both');
				$("#newTransAmount2").val(auto['CREDIT']);
				Trans.displayFields();
			}
			$("#newTransDetail").val("Bill No. " + auto['BILL']);
			$("#newTransDetail2").val(auto['DETAIL']);
		}
		else if(auto['DEBIT']==-1){
			$("#newTransAmount").val(auto['CREDIT']);
			$("#newTransType").val('credit');
			Trans.displayFields();
			$("#newTransDetail").val("Invoice No. " + auto['BILL'] + " - " + auto['DETAIL']);
		}
		else if(auto['DEBIT']==-2){
			$("#newTransAmount").val(auto['CREDIT']);
			$("#newTransType").val('debit');
			Trans.displayFields();
			$("#newTransDetail").val(auto['DETAIL']);
		}
		else{
			$("#newTransAmount").val(auto['CREDIT']);
			$("#newTransType").val('credit');
			Trans.displayFields();
			$("#newTransDetail").val(auto['DETAIL']);
		}
	}
}


$(function() {

	Trans.init();

	function GetURLParameter(sParam)
	{
	    var sPageURL = decodeURI(window.location.search.substring(1));
	    var sURLVariables = sPageURL.split('&');
	    for (var i = 0; i < sURLVariables.length; i++)
	    {
	        var sParameterName = sURLVariables[i].split('=');
	        if (sParameterName[0] == sParam)
	        {
	            return sParameterName[1];
	        }
	    }
	}

	// $("#searchTransBar").change(function(){
	// 	Trans.searchCities($(this).val().trim().toUpperCase());
	// });

	$("#transCitySelect").change(function(){
		Trans.searchAccounts($(this).val());
	});

	$("#searchTransBtn").click(function(){
		Trans.searchTransactions();
	});

	$("#newTransAcc").change(function(){

		udate = new Date();
		$("#newTransDate").val(Trans.getSqlDate());
		if($(this).val()==-1)
			alert("New account");
	});

	$("#newTransDate").val(Trans.getSqlDate());
	$("#newTransDate").prop("max", Trans.getSqlDate());

	$("#newTransBtn").click(function(){
		console.log("New transaction button clicked");
		Trans.createNewTransaction();
	});

	$("#newTransType").change(Trans.displayFields);

	var acc_id = GetURLParameter('id');
	if(acc_id!=undefined){
		Trans.searchAccountID(acc_id);
	}

	var a = GetURLParameter('a');
	if(a!=undefined){
		var d = GetURLParameter('d');
		var c = GetURLParameter('c');
		var b = GetURLParameter('b');
		var t = GetURLParameter('t');

		var auto = {};
		auto['ACCOUNT_ID'] = a;
		auto['DEBIT'] = parseInt(d);
		auto['CREDIT'] = parseInt(c);
		auto['BILL'] = b;
		auto['DETAIL'] = t;
		Trans.setAuto(auto);

		console.log("Account ID: "+a);
		console.log("Debit: "+d);
		console.log("Credit: "+c);
		console.log("Bill: "+b);
		console.log("Detail: "+t);

		Trans.autoFill();
	}
});