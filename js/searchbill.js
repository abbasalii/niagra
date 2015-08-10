
ACC_REQ_TYPE_BILL = 2;



Biller = new function(){

	var records = null;
	var cities = null;
	var accounts = null;
	var b_id = 0;
	var info = null;
	var itemList = null;

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

		b_id = _id;
		info = null;
		Socket.getBillDetails(_id);
	}

	this.setBillInfo = function(data){

		info = data[0];
	}

	this.setBillDetails = function(data){

		if(data.length==0){
			console.log("No record found");
			return;
		}

		itemList = data;

		if(info == null){
			setTimeout(this.setBillDetails,100,data);
			return;
		}

		var text = "<div id='billDetailHeader'>";
		text += "<div>Title: " + info.TITLE + "</div>";
		var bdate = new Date(info.B_DATE);
		text += "<div>Date: " + bdate.toDateString() + "</div>";
		text += "<div>Time: " + Format.formatTime(bdate) + "</div>";
		text += "<div>Gross Total: " + Format.formatCurrency(info.AMOUNT_DUE) + "</div>";
		text += "<div>Discount: " + info.DISCOUNT + "</div>";
		text += "<div>Net Total: " + Format.formatCurrency(info.AMOUNT_DUE-info.DISCOUNT) + "</div>";
		text += "<div>Amount Paid: " + Format.formatCurrency(info.AMOUNT_PAID) + "</div>";
		text += "</div>";

		text += "<table id='billDetailsTable'>";
		text += "<tr>";
		text += "<th>NO</th>";
		text += "<th>NAME</th>";
		text += "<th>COST</th>";
		text += "<th>QUANTITY</th>";
		text += "<th>PAYABLE</th>";
		text += "<th>AMOUNT</th>";
		text += "<th>RETURN</th>";
		text += "</tr>";

		for(var i=0; i<data.length; i++){
			text += "<tr>";
			text += "<td>" + (i+1) + "</td>";
			text += "<td>" + data[i].NAME + "</td>";
			text += "<td>" + data[i].COST + "</td>";
			text += "<td> <input class='bill-detail-qty' type='number' value='" + data[i].QUANTITY + "' readonly/></td>";
			text += "<td>" + (parseInt(data[i].COST)*parseInt(data[i].QUANTITY)) + "</td>";
			text += "<td class='bill-detail-return-amount'></td>";
			text += "<td> <input class='bill-detail-return-box' type='checkbox'/> </td>";
			text += "</tr>";
		}
		text += "</table>";
		text += "<div id='itemReturnTotalDiv'>Total: <span id='itemReturnTotalSpan'>0</span></div>";
		text += "<div id='itemReturnDetailDiv'><label>Details<input type='text' placeholder='Return on Bill'/></label></div>";
		text += "<input id='returnItemBtn' type='button' value='Return'/>";
		$("#billDetailDiv").html(text);

		$("#billDetailsTable input.bill-detail-return-box").each(function(){

			$(this).click(function(){
				var n = $(this).closest('tr').index()-1;
				if($(this).prop('checked')){
					$("#billDetailsTable input.bill-detail-qty").eq(n).prop('readonly',false);
					Biller.calculateAmount(n);
					$("#billDetailsTable input.bill-detail-qty").eq(n).change(function(){
						Biller.calculateAmount(n);
					});
				}
				else{
					$("#billDetailsTable input.bill-detail-qty").eq(n).val(itemList[n].QUANTITY);
					$("#billDetailsTable input.bill-detail-qty").eq(n).prop('readonly',true);
					$("#billDetailsTable .bill-detail-return-amount").eq(n).html("");
					$("#billDetailsTable input.bill-detail-qty").eq(n).unbind("change");
					Biller.calculateTotal();
				}
			});
		});

		Biller.hideExtraColumns();

		$("#returnItemBtn").click(function(){

			console.log("Return items button clicked");

			Biller.showExtraColumns();
			$(this).unbind("click");
			$(this).val("Proceed");
			$(this).click(function(){
				console.log("Proceed button clicked");
				if(Biller.validateData()){
					Biller.returnItems();
				}
			});
		});
	}

	this.showExtraColumns = function(){
		for(var i=6; i<8; i++)
			$('#billDetailsTable td:nth-child('+i+'),th:nth-child('+i+')').show();
		$("#itemReturnTotalDiv").show();
		$("#itemReturnDetailDiv").show();
		$("#itemReturnDetailDiv input").eq(0).val("Return on Bill No. "+ b_id);
	}

	this.hideExtraColumns = function(){
		for(var i=6; i<8; i++)
			$('#billDetailsTable td:nth-child('+i+'),th:nth-child('+i+')').hide();
		$("#itemReturnTotalDiv").hide();
		$("#itemReturnDetailDiv").hide();
	}

	this.calculateAmount = function(n){

		var qty = parseInt($("#billDetailsTable input.bill-detail-qty").eq(n).val());
		if(qty<1){
			$("#billDetailsTable input.bill-detail-qty").eq(n).val(1);
			qty=1;
		}
		if(qty>itemList[n].QUANTITY){
			$("#billDetailsTable input.bill-detail-qty").eq(n).val(itemList[n].QUANTITY);
			qty=itemList[n].QUANTITY;
		}
		if(!isNaN(qty))
			$("#billDetailsTable .bill-detail-return-amount").eq(n).html(qty*itemList[n].COST);

		Biller.calculateTotal();
	}

	this.calculateTotal = function(){

		var total = 0;
		$("#billDetailsTable input:checked").each(function(){

			var ind = $(this).closest('tr').index()-1;
			var q = parseInt($("#billDetailsTable input.bill-detail-qty").eq(ind).val());
			var p = q*itemList[ind].COST;
			total += p;
		});
		$("#itemReturnTotalSpan").html(total);
	}

	this.validateData = function(){

		console.log("Validating data");
		var l = $("#billDetailsTable input:checked").length;
		if(l==0){
			console.log("No item selected");
			return false;
		}
		return true;
	}

	this.returnItems = function(){

		console.log("Creating list of items to be returned");

		var data = {};
		data['BILL_ID'] = b_id;
		data['AMOUNT'] = parseInt($("#itemReturnTotalSpan").html());
		var l_id = [];
		$("#billDetailsTable input:checked").each(function(){
			var n = $(this).closest('tr').index()-1;
			var qty = $("#billDetailsTable input.bill-detail-qty").eq(n).val();
			l_id.push({SALE_ID:itemList[n].ID,QUANTITY:qty});
		});
		data['SALES'] = l_id;

		Socket.createReturn(data);
	}

	this.proceedToTransaction = function(){

		console.log("Proceeding to transaction");
		var acc_id = -1;
		for(var i=0; i<accounts.length; i++)
			if(accounts[i].TITLE==info.TITLE){
				acc_id = accounts[i].ID;
				break;
			}

		var d = 0;
		var c = parseInt($("#itemReturnTotalSpan").html());
		var t = $("#itemReturnDetailDiv input").eq(0).val();
		location.href = "/trans.html?a="+acc_id+"&d="+d+"&c="+c+"&b="+(-1)+"&t="+t;
	}
}



$(function() {

	Biller.init();

	$("#billCitySelect").change(function(){
		Biller.searchAccounts($(this).val());
	});

	$("#viewBillBtn").click(function(){
		var id = parseInt($("#billNumInput").val());
		if(isNaN(id) || id<=0){
			console.log("Invalid bill number");
			return;
		}
		Biller.getBillDetails(id);
	});

	$("#searchBillBtn").click(function(){
		Biller.searchBillRecords();
	});
});