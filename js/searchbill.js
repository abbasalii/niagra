
ACC_REQ_TYPE_BILL = 2;



Biller = new function(){

	var records = null;
	var cities = null;
	var accounts = null;

	this.init = function(){

		console.log("Initializing bill record...");
		this.getCities();
		this.getAccounts();
	}

	this.getCities = function(){
		Socket.requestCityList();
	}

	this.getAccounts = function(){
		Socket.requestAccounts(ACC_REQ_TYPE_BILL);
	}

	this.setCities = function(data){

		cities = data.sort(function(a,b){
			if(a.NAME>b.NAME)
				return 1;
			else
				return -1;
		});

		var text = "<option value='-1'>All</option>";
		// $("#cityList").html("");
		for(var i=0; i<cities.length; i++){
			text += "<option value='"+cities[i].ID+"''>"+cities[i].NAME+"</option>";
			// $("#cityList").append("<option value='"+cities[i].NAME+"'/>");
		}
		$("#billCitySelect").html(text);
	}

	this.setAccounts = function(data){

		accounts = data.sort(function(a,b){
			if(a.TITLE>b.TITLE)
				return 1;
			else
				return -1;
		});

		$("#accList").html("");
		// $("#newTransAcc").html("<option value='-2' disabled>Select Account</option>");
		// $("#newTransAcc").append("<option value='-1'>NEW</option>");
		for(var i=0; i<accounts.length; i++){
			$("#accList").append("<option value='"+accounts[i].TITLE+"'/>");
			// $("#newTransAcc").append("<option value='"+accounts[i].ID+"'>"+accounts[i].TITLE+"</option>");
		}
		// $("#newTransAcc").val(-2);
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

	this.searchBillRecords = function(){

		var cid = parseInt($("#billCitySelect").val());
		var acc = $("#searchBillBar").val().trim().toUpperCase();
		var bdate = $("#beginBillDate").val();
		if(bdate.length==0){
			console.log("begin date not specified");
			bdate = new Date("1970-01-01");
		}
		else{
			bdate = new Date(bdate);
		}
		bdate = Format.toSqlDate(bdate) + " 00-00-00";

		var edate = $("#endBillDate").val();
		if(edate.length==0){
			console.log("end date not specified");
			edate = new Date();
		}
		else{
			edate = new Date(edate);
		}
		edate = Format.toSqlDate(edate) + " 23-59-59";

		var min = parseInt($("#minBillAmount").val());
		if(isNaN(min)){
			min = 0;
			console.log("Minimum amount not specified. Default is "+min);
		}
		var max = parseInt($("#maxBillAmount").val());
		if(isNaN(max)){
			max = 9999999;
			console.log("Maximum amount not specified. Default is "+max);
		}

		var billRequest = {
			TITLE: acc,
			CITY_ID: cid,
			B_DATE: bdate,
			E_DATE: edate,
			MIN: min,
			MAX: max
		};

		Socket.searchBillRecords(billRequest);
	}

	this.setRecords = function(data){

		records = data;

		var text = "<table id='billRecordsTable'>";
		text += "<tr>";
		text += "<th>NO</th>";
		text += "<th>DATE</th>";
		text += "<th>TIME</th>";
		text += "<th>TITLE</th>";
		text += "<th>AMOUNT</th>";
		text += "<th>VIEW</th>";
		text += "</tr>";

		for(var i=0; i<data.length; i++){
			text += "<tr>";
			text += "<td>" + (i+1) + "</td>";
			var bdate = new Date(data[i].B_DATE);
			text += "<td>" + bdate.toDateString() + "</td>";
			text += "<td>" + Format.formatTime(bdate) + "</td>";
			for(var j=0; j<accounts.length; j++)
				if(data[i].ACCOUNT_ID==accounts[j].ID) {
					text += "<td>" + accounts[j].TITLE + "</td>";
					break;
				}

			text += "<td>" + new Number(data[i].AMOUNT_DUE).toLocaleString("hi-IN") + "</td>";
			text += "<td><input class='bill-detail-btn' type='button' value='Details'/></td>";
			text += "</tr>";
		}
		text += "</table>";
		$("#billRecordsDiv").html(text);

		$(".bill-detail-btn").each(function(){
			$(this).click(function(){
				var ind = $(this).closest('tr').index()-1;
				var id = records[ind].ID;
				Biller.getBillDetails(id);
			});
		});
	}

	this.getBillDetails = function(_id){

		Socket.getBillDetails(_id);
	}

	this.setBillDetails = function(data){

		var text = "<table id='billDetailsTable'>";
		text += "<tr>";
		text += "<th>NO</th>";
		text += "<th>NAME</th>";
		text += "<th>COST</th>";
		text += "<th>QUANTITY</th>";
		text += "<th>AMOUNT</th>";
		text += "</tr>";

		for(var i=0; i<data.length; i++){
			text += "<tr>";
			text += "<td>" + (i+1) + "</td>";
			text += "<td>" + data[i].NAME + "</td>";
			text += "<td>" + data[i].COST + "</td>";
			text += "<td>" + data[i].QUANTITY + "</td>";
			text += "<td>" + (parseInt(data[i].COST)*parseInt(data[i].QUANTITY)) + "</td>";
			text += "</tr>";
		}
		text += "</table>";
		$("#billDetailDiv").html(text);
	}
}



$(function() {

	Biller.init();

	$("#billCitySelect").change(function(){
		Biller.searchAccounts($(this).val());
	});

	$("#searchBillBtn").click(function(){
		Biller.searchBillRecords();
	});
});