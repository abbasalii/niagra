TITLE_MIN_LEN = 5;
TITLE_MAX_LEN = 30;
CITY_MIN_LEN = 3;
CITY_MAX_LEN = 30;
PTCL_MIN_LEN = 10;
PTCL_MAX_LEN = 15;
CELL_MIN_LEN = 11;
CELL_MAX_LEN = 15;

TITLE_INDEX = 0;
CNAME_INDEX = 1;
PTCL_INDEX = 2;
CELL_INDEX = 3;
EXTRAS_INDEX = 4;

Ledger = new function(){

	var ledgers = null;
	var cities = null;
	var result = null;
	var details = null;

	this.init = function(){
		console.log("Initializing Ledger...");
		Socket.requestAccounts();
		Socket.requestCityList();
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
		$("#ledgerCitySelect").html(text);
	}

	this.setLedgers = function(data){

		ledgers = data.sort(function(a,b){
			if(a.TITLE>b.TITLE)
				return 1;
			else
				return -1;
		});
		this.displayLedger(ledgers);
	}

	this.setDetails = function(data){
		details = data[0];
		this.displayAccountDetail();
	}

	this.displaySearchLedger = function(){

		var led = $("#searchLedgerBar").val().trim().toUpperCase();
		var city = $("#ledgerCitySelect").val();
		var list = [];
		var out = [];
		var tmp = [];
		if(city>-1){
			for(var i=0; i<ledgers.length; i++)
				if(ledgers[i].CITY_ID==city)
					list.push(ledgers[i]);
		}
		else
			list = ledgers;
		
		if(led.length>0){
			for(var i=0; i<list.length; i++)
				if(list[i].TITLE.indexOf(led)>-1)
					out.push(list[i]);
		}
		else
			out = list;

		var _t =$("#ledgerAccountTypeSelect").val();
		if(_t!= "b"){
			console.log("not both");
			console.log(_t);
			for(var i=0; i<out.length; i++){

				if((_t=="c" && out[i].BALANCE<=0) || (_t=="d" && out[i].BALANCE>=0))
					tmp.push(out[i]);
				}
		}
		else
			tmp = out;
		this.displayLedger(tmp);
	}

	this.displayLedger = function(data){
		if(cities==null){
			setTimeout(this.displayLedger,33,data);
			return;
		}
		result = data;
		var text = "<table id='ledgerTable' >";
		text += "<tr>";
		text += "<th>No.</th>";
		text += "<th>TITLE</th>";
		text += "<th>CITY</th>";
		text += "<th>CELL</th>";
		text += "<th>BALANCE</th>";
		text += "<th>DETAIL</th>";
		text += "</tr>";

		for(var i=0; i<data.length; i++){
			text += "<tr>";
			text += "<td>" + (i+1) + "</td>";
			text += "<td class='ledger-title-field'><a href='/trans.html?id="+data[i].ID+"' title='Click to View Transactions'>" + data[i].TITLE + "</a></td>";
			for(var j=0; j<cities.length; j++)
				if(data[i].CITY_ID==cities[j].ID) {
					text += "<td class='ledger-city-field'>" + cities[j].NAME + "</td>";
					break;
				}
			text += "<td class='ledger-cell-field'>" + Format.formatMobile(data[i].CELL) + "</td>";
			if(data[i].BALANCE<0)
				text += "<td class='edit-balance-field balance-negative-field'>" + Format.formatCurrency(data[i].BALANCE) + "</td>";
			else
				text += "<td class='edit-balance-field balance-positive-field'>" + Format.formatCurrency(data[i].BALANCE) + "</td>";
			text += "<td><input class='detail-ledger-btn' type='button' value='View Details'/></td>";
			text += "</tr>";
		}
		text += "</table>";
		$("#ledgerDataDiv").html(text);

		$(".detail-ledger-btn").each(function(){
			$(this).click(function(){
				console.log('View Details button clicked');
				var ind = $(this).closest('tr').index() - 1;
				Socket.requestAccountDetail(result[ind].ID);
			});
		});
	}

	this.displayAccountDetail = function(){
		text = "<form>";
		text += "<div><label>TITLE<input type='text' value='" + details.TITLE + "' readonly/></label></div>";
		for(var i=0; i<cities.length; i++)
			if(cities[i].ID==details.CITY_ID){
				text += "<div><label>CITY<input type='text' value='" + cities[i].NAME
					+ "' list='cityList' readonly/></label></div>";
				break;
			}
		text += "<div><label>PTCL<input type='text' value='"+details.PTCL+"' readonly/></label></div>";
		text += "<div><label>MOBILE<input type='text' value='"+details.CELL+"' readonly/></label></div>";
		text += "<div><label>EXTRAS<input type='text' value='"+details.EXTRAS+"' readonly/></label></div>";
		text += "<div><input id='ledger-edit-btn' type='button' value='Edit'/>"
					+"<input id='ledger-dismiss-btn' type='button' value='Dismiss'/></div>";
		text += "</form>";
		$("#ledgerDetailDiv").html(text);

		$("#ledger-edit-btn").click(function(){
			console.log("Edit button clicked");
			$(this).unbind("click");
			$(this).val("Save");
			$("#ledgerDetailDiv").find('input').each(function(){
				$(this).prop("readonly",false);
			});
			$(this).click(function(){
				console.log("Save button clicked");
				var values = [];
				$("#ledgerDetailDiv").find('input').each(function(){
					values.push($(this).val());
					if(values.length!=EXTRAS_INDEX+1)
						values[values.length-1] = values[values.length-1].trim().toUpperCase();
				});
				var okay = Ledger.validateData(values);
				var cid = Ledger.findCity(values[CNAME_INDEX]);
				
				if(okay){
					console.log("All okay (y)");
					$(this).unbind("click");
					$(this).val('Edit');
					var item = {	ID:details.ID,
									TITLE:values[TITLE_INDEX],
									CITY_ID:cid,
									CITY_NAME:values[CNAME_INDEX],
									PTCL:values[PTCL_INDEX],
									CELL:values[CELL_INDEX],
									EXTRAS:values[EXTRAS_INDEX] 	};

					Socket.updateAccount(item);
					$("#ledgerDetailDiv").find('input').each(function(){
						$(this).prop("readonly", true);
					});
				}
			});
			
		});

		$("#ledger-dismiss-btn").click(function(){
			console.log("Dismiss button clicked");
			$("#ledgerDetailDiv").html("");
		});
	}

	this.validateData = function(data){

		var title = data[TITLE_INDEX];
		if(title.length<TITLE_MIN_LEN || title.length>TITLE_MAX_LEN){
			console.log("Length of title is not valid");
			return false;
		}
		var city = data[CNAME_INDEX];
		if(city.length<CITY_MIN_LEN || city.length>CITY_MAX_LEN){
			console.log("Length of city name is not valid");
			return false;
		}
		var ptcl = data[PTCL_INDEX];
		if(ptcl.length!=0 && (ptcl.length<PTCL_MIN_LEN || ptcl.length>PTCL_MAX_LEN)){
			console.log("Invalid ptcl number");
			return false;
		}
		var cell = data[CELL_INDEX];
		if(cell.length<CELL_MIN_LEN || cell.length>CELL_MAX_LEN){
			console.log("Invalid cell number");
			return false;
		}
		return true;
	}

	this.findCity = function(city){
		for(var i=0; i<cities.length; i++){
			if(cities[i].NAME==city){
				console.log('City name already exists');
				return cities[i].ID;
			}
		}
		console.log("City name does not exists");
		return -1;
	}

	this.createAccount = function(){

		var values = [];
		values.push($("#newAccTitle").val().trim().toUpperCase());
		values.push($("#newAccCity").val().trim().toUpperCase());
		values.push($("#newAccPtcl").val().trim());
		values.push($("#newAccCell").val().trim());
		var extras = $("#newAccExt").val();
		var balance = parseInt($("#newAccBal").val());
		var okay = this.validateData(values);
		var created = $("#newAccDate").val();

		if(okay){
			var cid = this.findCity(values[CNAME_INDEX]);
			if(isNaN(balance)){
				console.log("Invalid value of balance");
				return;
			}

			var item = {
				TITLE:values[TITLE_INDEX],
				CITY_ID:cid,
				CITY_NAME:values[CNAME_INDEX],
				PTCL:values[PTCL_INDEX],
				CELL:values[CELL_INDEX],
				EXTRAS:extras,
				BALANCE:balance,
				CREATED:created 	};

			Socket.createAccount(item);
			$("#newAccDiv").find('input:lt(7)').each(function(){
				$(this).val("");
			});
			// console.log(item);
		}
	}
}

$(function() {

	Ledger.init();

	$("#searchLedgerBtn").click(function(){
		console.log("Search for ledger button clicked");
		Ledger.displaySearchLedger();
	});

	$("#showNewAccountBtn").click(function(){
		console.log("Show New Account Div");
		$("#new-account-wrapper").show("slow");
	});

	$("#cross-btn").click(function(){
		console.log("Cross btn clicked");
		$("#new-account-wrapper").hide("slow");
	});

	$("#newAccBtn").click(function(){
		console.log("New account button clicked");
		Ledger.createAccount();
	});
});