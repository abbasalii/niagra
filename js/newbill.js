
ACC_REQ_TYPE_BILL = 2;
ITEM_REQ_TYPE_BILL = 3;

NewBill = new function(){

	var accounts = null;
	var items = null;

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
			for(var i=0; i<items.length && it.length>0; i++){
				if(items[i].NAME==it){
					$("#billItemTab input.item-price").eq(ind).val(items[i].PRICE);
					$("#billItemTab input.item-quantity").eq(ind).val(1);
					$("#billItemTab td.item-amount").eq(ind).html(items[i].PRICE);
					break;
				}
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
	}
}




$(function() {

	NewBill.init();

	$("#newBillFinBtn").click(NewBill.finishBill);
});