
ACC_REQ_TYPE_BILL = 2;
ITEM_REQ_TYPE_BILL = 3;

TRANS_DET_MIN_LEN = 5;
TRANS_DET_MAX_LEN = 100;

Purchaser = new function(){

	var accounts = null;
	var items = null;
	var tree = {};
	var purchase = [];

	this.init = function(){

		console.log("Initializing Purchaser...");
		this.setOnChangeListener();
		
		this.getAccounts();
		this.getAllItems();
	}

	this.getAccounts = function(){
		Socket.requestAccounts(ACC_REQ_TYPE_BILL);
	}

	this.getAllItems = function(){
		Socket.requestAllItems(ITEM_REQ_TYPE_BILL);
	}

	this.setItemList = function(data){

		items = data.sort(function(a,b){
			if(a.NAME>b.NAME)
				return 1;
			else
				return -1;
		});

		$("#itemList").html("");
		for(var i=0; i<items.length; i++){
			$("#itemList").append("<option>"+items[i].NAME+"</option>");
			tree[items[i].NAME] = i;
		}
	}

	this.setAccounts = function(data){

		accounts = data.sort(function(a,b){
			if(a.TITLE>b.TITLE)
				return 1;
			else
				return -1;
		});

		$("#newPurAccSel").html("<option value='-2' disabled>Select Account</option>");
		$("#newPurAccSel").append("<option value='-1'>New Account</option>");
		for(var i=0; i<accounts.length; i++){
			$("#newPurAccSel").append("<option value='"+accounts[i].ID+"'>"+accounts[i].TITLE+"</option>");
		}
		$("#newPurAccSel").val(-2);
	}

	this.insertNewRow = function(){

		var ind = $("#purItemTab").find('tr').length;
		$("#purItemTab").find('input.remove-item').eq(ind-2).prop("disabled",false);
		this.removeOnChangeListener();

		var text = '<tr>';
		text += '<td class="item-index">'+ind+'</td>';
		text += '<td><input class="item-name" type="text" list="itemList"/></td>';
		text += '<td><input class="item-price" type="number" min="0"/></td>';
		text += '<td><input class="item-quantity" type="number" min="0"/></td>';
		text += '<td class="item-amount"></td>';
		text += '<td><input class="remove-item" type="button" value="Remove" disabled/></td>';
		text += '</tr>';

		$("#purItemTab").append(text);
		this.setOnChangeListener();
	}

	this.setOnChangeListener = function(){

		var ind = $("#purItemTab").find('tr').length-2;
		$("#purItemTab").find('input.item-name').eq(ind).focus(function(){
			console.log('name changed');
			Purchaser.insertNewRow();
		});
		$("#purItemTab").find('input.item-price').eq(ind).focus(function(){
			console.log('price changed');
			Purchaser.insertNewRow();
		});
		$("#purItemTab").find('input.item-quantity').eq(ind).focus(function(){
			console.log('quantity changed');
			Purchaser.insertNewRow();
		});
	}

	this.removeOnChangeListener = function(){

		var ind = $("#purItemTab").find('tr').length-2;
		$("#purItemTab").find('input.item-name').eq(ind).unbind("focus");
		$("#purItemTab").find('input.item-price').eq(ind).unbind("focus");
		$("#purItemTab").find('input.item-quantity').eq(ind).unbind("focus");

		$("#purItemTab").find('input.item-price').eq(ind).change(function(){

			var j = $(this).closest('tr').index()-1;
			Purchaser.calculateAmount(j);
		});
		
		$("#purItemTab").find('input.item-quantity').eq(ind).change(function(){

			var j = $(this).closest('tr').index()-1;
			Purchaser.calculateAmount(j);
		});

		$("#purItemTab").find('input.remove-item').eq(ind).click(function(){

			$(this).closest('tr').remove();
			Purchaser.reindexColumn();
		});
	}

	this.reindexColumn = function(){

		var i=1;
		$('#purItemTab td.item-index').each(function(){
			$(this).html(i++);
		});
		this.calculateTotal();
	}

	this.calculateAmount = function(ind){

		var price = parseInt($("#purItemTab").find('input.item-price').eq(ind).val());
		var qty = parseInt($("#purItemTab input.item-quantity").eq(ind).val());
		if(price<=0){
			price = 1;
			$("#purItemTab").find('input.item-price').eq(ind).val(price);
		}
		if(qty<=0){
			qty = 1;
			$("#purItemTab input.item-quantity").eq(ind).val(qty);
		}

		if(!isNaN(price) && !isNaN(qty)){
			var am = price*qty;
			$("#purItemTab td.item-amount").eq(ind).html(Format.formatCurrency(am));
		}
		else
			$("#purItemTab td.item-amount").eq(ind).html("");

		this.calculateTotal();
	}

	this.calculateTotal = function(){

		var tm = 0;
		
		var l = $("#purItemTab td.item-amount").length;
		for(var i=0; i<l; i++){
			var price = parseInt($("#purItemTab").find('input.item-price').eq(i).val());
			var qty = parseInt($("#purItemTab input.item-quantity").eq(i).val());
			var am = price*qty;
			if(!isNaN(am))
				tm += am;
		}
		// $("#purItemTab td.item-amount").each(function(){

		// 	var am = parseInt($(this).html());
		// 	if(!isNaN(am))
		// 		tm += am;
		// });
		$("#newPayableInput").val(tm);
	}

	this.finishPurchase = function(){

		console.log("Finish Purchase button clicked");
		var acc_id = parseInt($("#newPurAccSel").val());
		if(isNaN(acc_id) || acc_id<0){
			console.log("Select a valid account");
			return;
		}

		var amount = parseInt($("#newPayableInput").val());
		if(isNaN(amount) || amount<0){
			console.log("Payable should be greater than zero");
			return;
		}

		var pay_det = $("#purchaseDetailsInput").val();
		var l = pay_det.length;
		if(l<TRANS_DET_MIN_LEN || l>TRANS_DET_MAX_LEN){
			console.log("Specify payment detail");
			return;
		}

		if(Purchaser.validateTableData()){

			console.log("All okay (y)");
			var data = {
				ACCOUNT_ID: 	acc_id,
				AMOUNT: 		amount,
				PURCHASE: 		purchase
			};

			Socket.createPurchase(data);
		}
	}

	this.validateTableData = function(){

		console.log("Validating table data...");
		var l = $("#purItemTab tr").length-2;
		var isValid = l>0?true:false;
		purchase = [];
		$("#purItemTab tr:gt(0):lt("+l+")").each(function(){

			var s_it = {};
			var it = $(this).find("input.item-name").eq(0).val();
			if(tree[it]==undefined){
				$(this).find("input.item-name").eq(0).focus();
				isValid = false;
				return isValid;
			}
			else{
				s_it['ITEM_ID'] = items[tree[it]].ID;
			}

			var price = parseInt($(this).find("input.item-price").eq(0).val());
			if(isNaN(price) || price<=0){
				$(this).find("input.item-price").eq(0).focus();
				isValid = false;
				return isValid;
			}
			else{
				s_it['COST'] = price;
			}

			var qty = parseInt($(this).find("input.item-quantity").eq(0).val());
			if(isNaN(qty) || qty<=0){
				$(this).find("input.item-quantity").eq(0).focus();
				isValid = false;
				return isValid;
			}
			else{
				s_it['QUANTITY'] = qty;
			}

			purchase.push(s_it);
		});

		return isValid;
	}

	this.proceedToTransaction = function(id){

		console.log("Invoice # "+id);
		var acc_id = $("#newPurAccSel").val();
		var d = -1;
		var c = $("#newPayableInput").val();
		var t = $("#purchaseDetailsInput").val();
		location.href = "/trans.html?a="+acc_id+"&d="+d+"&c="+c+"&b="+id+"&t="+t;
	}
}




$(function() {

	Purchaser.init();

	$("#newPurFinBtn").click(Purchaser.finishPurchase);
});







