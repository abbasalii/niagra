
ACC_REQ_TYPE_BILL = 2;
ITEM_REQ_TYPE_BILL = 3;

TRANS_DET_MIN_LEN = 5;
TRANS_DET_MAX_LEN = 100;

NewBill = new function(){

	var accounts = null;
	var items = null;
	var tree = {};
	var sale = [];

	this.init = function(){

		console.log("Initializing NewBill...");
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

		$("#newBillAccSel").html("<option value='-2' disabled>Select Account</option>");
		$("#newBillAccSel").append("<option value='-1'>New Account</option>");
		for(var i=0; i<accounts.length; i++){
			$("#newBillAccSel").append("<option value='"+accounts[i].ID+"'>"+accounts[i].TITLE+"</option>");
		}
		$("#newBillAccSel").val(-2);
	}

	this.insertNewRow = function(){

		var ind = $("#billItemTab").find('tr').length;
		$("#billItemTab").find('input.remove-item').eq(ind-2).prop("disabled",false);
		this.removeOnChangeListener();

		var text = '<tr>';
		text += '<td class="item-index">'+ind+'</td>';
		text += '<td><input class="item-name" type="text" list="itemList"/></td>';
		text += '<td><input class="item-price" type="number" min="0"/></td>';
		text += '<td><input class="item-quantity" type="number" min="0"/></td>';
		text += '<td class="item-amount"></td>';
		text += '<td><input class="remove-item" type="button" value="Remove" disabled/></td>';
		text += '</tr>';

		$("#billItemTab").append(text);
		this.setOnChangeListener();
	}

	this.setOnChangeListener = function(){

		var ind = $("#billItemTab").find('tr').length-2;
		$("#billItemTab").find('input.item-name').eq(ind).focus(function(){
			console.log('name changed');
			NewBill.insertNewRow();
		});
		$("#billItemTab").find('input.item-price').eq(ind).focus(function(){
			console.log('price changed');
			NewBill.insertNewRow();
		});
		$("#billItemTab").find('input.item-quantity').eq(ind).focus(function(){
			console.log('quantity changed');
			NewBill.insertNewRow();
		});
	}

	this.removeOnChangeListener = function(){

		var ind = $("#billItemTab").find('tr').length-2;
		$("#billItemTab").find('input.item-name').eq(ind).unbind("focus");
		$("#billItemTab").find('input.item-name').eq(ind).change(function(){

			$("#billItemTab td.item-amount").eq(ind).html("");
			var it = $("#billItemTab input.item-name").eq(ind).val().trim().toUpperCase();
			$("#billItemTab input.item-name").eq(ind).val(it);
			if(tree[it]!=undefined){
				$("#billItemTab input.item-price").eq(ind).val(items[tree[it]].PRICE);
				// $("#billItemTab input.item-quantity").eq(ind).val(1);
				// $("#billItemTab td.item-amount").eq(ind).html(items[tree[it]].PRICE);
			}
			NewBill.calculateTotal();
		});

		$("#billItemTab").find('input.item-price').eq(ind).unbind("focus");
		$("#billItemTab").find('input.item-price').eq(ind).change(function(){

			var j = $(this).closest('tr').index()-1;
			NewBill.calculateAmount(j);
		});
		$("#billItemTab").find('input.item-quantity').eq(ind).unbind("focus");
		$("#billItemTab").find('input.item-quantity').eq(ind).change(function(){

			var j = $(this).closest('tr').index()-1;
			NewBill.calculateAmount(j);
		});
		$("#billItemTab").find('input.remove-item').eq(ind).click(function(){

			$(this).closest('tr').remove();
			NewBill.reindexColumn();
		});
	}

	this.reindexColumn = function(){

		var i=1;
		$('#billItemTab td.item-index').each(function(){
			$(this).html(i++);
		});
		this.calculateTotal();
	}

	this.calculateAmount = function(ind){
		// console.log('calculateAmount');
		var price = parseInt($("#billItemTab").find('input.item-price').eq(ind).val());
		var qty = parseInt($("#billItemTab input.item-quantity").eq(ind).val());

		if(!isNaN(price) && !isNaN(qty) && price>0 && qty>0)
			$("#billItemTab td.item-amount").eq(ind).html(price*qty);
		else
			$("#billItemTab td.item-amount").eq(ind).html("");

		this.calculateTotal();
	}

	this.calculateTotal = function(){

		var tm = 0;
		$("#billItemTab td.item-amount").each(function(){

			var am = parseInt($(this).html());
			if(!isNaN(am))
				tm += am;
		});
		$("#amountDueInput").val(tm);
	}

	this.finishBill = function(){

		console.log("Finish Bill button clicked");
		var acc_id = parseInt($("#newBillAccSel").val());
		if(isNaN(acc_id) || acc_id<0){
			console.log("Select a valid account");
			return;
		}

		var am_due = parseInt($("#amountDueInput").val());
		if(isNaN(am_due) || am_due<=0){
			console.log("Due Amount should be greater than zero");
			return;
		}

		var discount = parseInt($("#dicountInput").val());
		if(isNaN(discount)){
			console.log("Disount is set to zero");
			discount = 0;
		}

		var am_paid = parseInt($("#amountPaidInput").val());
		if(isNaN(am_paid) || am_paid<0){
			console.log("Amount Paid should be greater than or equal to zero");
			return;
		}

		var pay_det = $("#paymentDetailsInput").val();
		var l = pay_det.length;
		if(am_paid>0 && (l<TRANS_DET_MIN_LEN || l>TRANS_DET_MAX_LEN)){
			console.log("Specify payment detail");
			return;
		}

		if(NewBill.validateTableData()){

			console.log("All okay (y)");
			var data = {
				ACCOUNT_ID: 	acc_id,
				AMOUNT_DUE: 	am_due,
				DISCOUNT: 		discount,
				AMOUNT_PAID: 	am_paid,
				SALES: 			sale
			};

			Socket.createNewBill(data);
		}
	}

	this.validateTableData = function(){

		console.log("Validating table data...");
		var l = $("#billItemTab tr").length-2;
		var isValid = l>0?true:false;
		sale = [];
		$("#billItemTab tr:gt(0):lt("+l+")").each(function(){

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

			sale.push(s_it);
		});

		return isValid;
	}

	this.proceedToTransaction = function(id){

		console.log("Bill # "+id);
		var acc_id = $("#newBillAccSel").val();
		var am_due = parseInt($("#amountDueInput").val());
		var discount = parseInt($("#dicountInput").val());
		if(isNaN(discount))
			discount = 0;
		var d = am_due - discount;
		var c = parseInt($("#amountPaidInput").val());
		var t = $("#paymentDetailsInput").val();
		location.href = "/trans.html?a="+acc_id+"&d="+d+"&c="+c+"&b="+id+"&t="+t;
	}
}




$(function() {

	NewBill.init();

	$("#newBillFinBtn").click(NewBill.finishBill);
});







