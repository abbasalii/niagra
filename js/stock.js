
Stock = new function(){

	var stock = null;
	var categories = null;
	var result = null;
	var state;

	this.init = function(){
		Socket.pullStock();
		Socket.pullCategory();
	}

	this.displayStock = function(data){

		if(categories==null){
			setTimeout(this.displayStock,133,data);
			return;
		}
		result = data;
		var text = "<table id='stock-table' class='table-default'>";
		text += "<tr>";
		text += "<th>No.</th>";
		text += "<th>NAME</th>";
		text += "<th>CATEGORY</th>";
		text += "<th>PRICE</th>";
		text += "<th>STOCK</th>";
		text += "<th>UPDATE</th>";
		text += "</tr>";

		for(var i=0; i<data.length; i++){
			text += "<tr>";
			text += "<td class='serial-number-column'>" + (i+1) + "</td>";
			text += "<td><input class='input-borderless' type='text' value='" + data[i].NAME + "' readonly/></td>";
			for(var j=0; j<categories.length; j++)
				if(data[i].CATEGORY_ID==categories[j].ID) {
					text += "<td><input class='input-borderless' id='editStockCat' type='text' value='"
					 + categories[j].NAME + "' list='categories' readonly/></td>";
					break;
				}
			text += "<td><input class='input-num-borderless' type='number' min='0' value='" + data[i].PRICE + "' readonly/></td>";
			text += "<td><input class='input-num-borderless' type='number' min='0' value='" + data[i].STOCK + "' readonly/></td>";
			text += "<td class='edit-btn-align'><input class='edit-stock-btn' type='button' value='Edit'/></td>";
			text += "</tr>";
		}
		text += "</table>";

		$("#stockDataDiv").html(text);

		$(".edit-stock-btn").each(function(){
			$(this).click(function(){
				$(this).unbind("click");
				console.log('Edit button clicked');
				$(this).val('Save');
				$(this).closest('tr').find('input').each(function(){
					$(this).prop("readonly", false);
					$(this).addClass("edit-stock-border");
				});
				$(this).click(function(){
					console.log('Save button clicked');
					var ind = $(this).closest('tr').index() - 1;
					var values = [];
					$(this).closest('tr').find('input').each(function(){
						values.push($(this).val());
					});
					var okay = true;
					var name = values[0].trim().toUpperCase();
					if(name.length==0){
						console.log("A valid item name is required");
						okay = false;
					}
					var cat = values[1].trim().toUpperCase();
					var cid=-1;
					if(cat.length==0){
						console.log("A valid category is required");
						okay = false;
					}
					else{
						for(var i=0; i<categories.length; i++)
							if(categories[i].NAME==cat){
								console.log('Category already exists');
								cid = categories[i].ID;
								break;
							}
					}
					var price = parseInt(values[2]);
					if(isNaN(price))
						price = null;
					var qty = parseInt(values[3]);
					if(isNaN(qty) || qty<0){
						console.log("Stock should be a valid non-negative number");
						okay = false;
					}
					if(okay){
						$(this).unbind("bind");
						var item = {	ID:result[ind].ID,
										NAME:name,
										CATEGORY_ID:cid,
										CATEGORY_NAME:cat,
										PRICE:price,
										STOCK:qty 		};
						Socket.updateStock(item);
						$(this).closest('tr').find('input').each(function(){
							$(this).prop("readonly", true);
						});
					}
				});
			});
		});
	}

	this.displayAllStock = function(){
		this.displayStock(stock);
	}

	this.displaySearchStock = function(){
		var item = $("#searchStockBar").val().trim().toUpperCase();
		var cat = $("#stockCategorySelect").val();
		var list = [];
		var out = [];
		if(cat>-1){
			for(var i=0; i<stock.length; i++)
				if(stock[i].CATEGORY_ID==cat)
					list.push(stock[i]);
		}
		else
			list = stock;
		
		if(item.length>0){
			for(var i=0; i<list.length; i++)
				if(list[i].NAME.indexOf(item)>-1)
					out.push(list[i]);
		}
		else
			out = list;
		this.displayStock(out);
	}

	this.insertStock = function(data){
		temp = JSON.parse(data);
		stock = temp.sort(function(a,b){
			if(a.NAME>b.NAME)
				return 1;
			else
				return -1;
		});
		this.displayStock(stock);
	}

	this.insertCategories = function(data){
		temp = JSON.parse(data);
		categories = temp.sort(function(a,b){
			if(a.NAME>b.NAME)
				return 1;
			else
				return -1;
		});
		$("#stockCategorySelect").html("<option value='-1'>All</option>");
		$("#categories").html("");
		for(var i=0; i<categories.length; i++){
			$("#stockCategorySelect").append("<option value='"+categories[i].ID+"''>"+categories[i].NAME+"</option>");
			$("#categories").append("<option value='"+categories[i].NAME+"'/>");
		}
	}

	this.createStock = function(){
		console.log("create new stock button clicked");
		var item = $("#newStockName").val().trim().toUpperCase();
		var cat = $("#newStockCategory").val().trim().toUpperCase();
		var newCat = true;
		var cid = -1;
		var price = $("#newStockPrice").val();
		var qty = $("#newStockQty").val();
		if(item.length==0){
			console.log("A valid item name is required");
			return;
		}
		for(var i=0; i<stock.length; i++){
			if(stock[i].NAME==item){
				console.log("Item with this name already exists");
				return;
			}
		}
		if(cat.length==0){
			console.log("Choose a category or create one");
			return;
		}
		for(var i=0; i<categories.length; i++){
			if(categories[i].NAME==cat){
				console.log("Category already exists. No need to create one");
				cid = categories[i].ID;
				newCat = false;
				break;
			}
		}
		if(!price)
			price = null;

		if(!qty){
			console.log("Specify quantity");
			return;
		}

		if(newCat){
			console.log("Create a new category with name: "+cat);
		}

		var data = {	NAME:item,
						CATEGORY_ID:cid,
						CATEGORY_NAME:cat,
						PRICE:price,
						STOCK:qty 		};
		Socket.insertStock(data);
	}
}

$(function() {
	Stock.init();
	$("#searchStockBtn").click(function(){
		console.log("Search for stock button clicked");
		Stock.displaySearchStock();
	});
	$("#createStockBtn").click(function(){
		Stock.createStock();
	});

	$("#showNewStockBtn").click(function(){
		$("#new-stock-wrapper").show("slow");
	});

	$("#new-stock-dissmiss-btn").click(function(){
		$("#new-stock-wrapper").hide("slow");
	});
});