UNINITIALIZED = 0;
CONNECTED = 1;
DISCONNECTED = 2;

//codes for communication
STOCK_REQUEST = 'request_stock';
STOCK_RESPONSE = 'stock_response';
CAT_REQUEST = 'category_request';
CAT_RESPONSE = 'category_response';
DATABASE_ERROR = 'database_error';
QUERY_ERROR = 'query_error';
INSERT_STOCK = 'insert_stock';
UPDATE_STOCK = 'update_stock';
INSERT_SUCCESS = 'insert_success';
UPDATE_SUCCESS = 'update_success';
ACCOUNT_REQUEST = 'account_request';
CITY_REQUEST = 'city_request';
UPDATE_ACCOUNT = 'update_account';
ACCOUNT_RESPONSE = 'account_response';
CITY_RESPONSE = 'city_response';
ACCOUNT_DETAIL = 'account_detail';
ACCOUNT_DETAIL_RESPONSE = 'account_detail_reponse';
ACCOUNT_UPDATE_SUCCESS = 'account_update_success';
CREATE_ACCOUNT = 'create_account';
CREATE_ACCOUNT_SUCCESS = 'create_account_success';
SEARCH_TRANSACTIONS = 'search_transactions';
TRANSACTION_RESPONSE = 'transactions_reponse';
NEW_TRANSACTION = 'new_transaction';
TRANSACTION_COMPLETE = 'transaction_complete';
GET_ITEM_LIST = 'get_item_list';
ITEM_LIST_RESPONSE = 'item_list_response';


Socket = new function(){

	var socket;
	var state = UNINITIALIZED;

	this.init = function(){
		socket = io.connect("localhost:8080");

		socket.on('connect',function(){
			console.log("You have been successfully connected");
			state = CONNECTED;
		});

		socket.on('disconnect',function(){
			console.log("You have been disconnected from the server.");
			state = DISCONNECTED;
		});

		socket.on('reconnect',function(){
			console.log("You have been successfully reconnected");
			state = CONNECTED;
		});

		socket.on(STOCK_RESPONSE,function(data){
			console.log("stock received");
			Stock.insertStock(data);
		});

		socket.on(DATABASE_ERROR,function(){
			console.log("Error connecting to database");
		});

		socket.on(QUERY_ERROR,function(){
			console.log("Error executing the database query");
		});

		socket.on(CAT_RESPONSE,function(data){
			console.log("categories received");
			Stock.insertCategories(data);
		});

		socket.on(INSERT_SUCCESS,function(){
			console.log("Insert successful");
		});

		socket.on(UPDATE_SUCCESS,function(){
			console.log("Update successful");
		});

		socket.on(ACCOUNT_RESPONSE,function(data){
			console.log("Accounts information received");
			if(typeof(Ledger)=='object')
				Ledger.setLedgers(JSON.parse(data));
			else if(typeof(Trans)=='object')
				Trans.setAccounts(JSON.parse(data));
			else if(typeof(NewBill)=='object')
				NewBill.setAccounts(JSON.parse(data));
		});

		socket.on(ACCOUNT_DETAIL_RESPONSE,function(data){
			console.log("Received account details");
			Ledger.setDetails(JSON.parse(data));
		});

		socket.on(CITY_RESPONSE,function(data){
			console.log("List of cities received");
			if(typeof(Ledger)=='object')
				Ledger.setCities(JSON.parse(data));
			else if(typeof(Trans)=='object')
				Trans.setCities(JSON.parse(data));
		});

		socket.on(ACCOUNT_UPDATE_SUCCESS,function(){
			console.log("Account successfully updated");
		});

		socket.on(CREATE_ACCOUNT_SUCCESS,function(){
			console.log("Account successfully created");
		});

		socket.on(TRANSACTION_RESPONSE,function(data){
			console.log("Received transaction query response");
			Trans.setTransactions(JSON.parse(data));
		});

		socket.on(TRANSACTION_COMPLETE,function(){
			console.log("Transaction successfully completed");
		});

		socket.on(ITEM_LIST_RESPONSE,function(data){
			console.log("Received list of items");
			NewBill.setItemList(JSON.parse(data));
		});
	}

	this.getState = function(){
		return state;
	}

	this.pullStock = function(){
		console.log("Requesting stock");
		socket.emit(STOCK_REQUEST);
	}

	this.pullCategory = function(){
		console.log("Requesting categories");
		socket.emit(CAT_REQUEST);
	}

	this.insertStock = function(data){
		console.log("Sending new stock info to server");
		socket.emit(INSERT_STOCK,JSON.stringify(data));
	}

	this.updateStock = function(data){
		console.log("Sending request to update stock");
		socket.emit(UPDATE_STOCK,JSON.stringify(data));
	}

	this.requestAccounts = function(_type){
		console.log("Requesting accounts information");
		socket.emit(ACCOUNT_REQUEST,{type:_type});
	}

	this.requestAccountDetail = function(_id){
		console.log("Requesting details of an account id: "+_id);
		socket.emit(ACCOUNT_DETAIL,{id:_id});
	}

	this.requestCityList = function(){
		console.log("Requesting list of cities");
		socket.emit(CITY_REQUEST);
	}

	this.updateAccount = function(data){
		console.log("Sending request to update account");
		socket.emit(UPDATE_ACCOUNT,JSON.stringify(data));
	}

	this.createAccount = function(data){
		console.log("Sending request to create account");
		socket.emit(CREATE_ACCOUNT,JSON.stringify(data));
	}

	this.searchTransactions = function(data){
		console.log("Sending parameters to search for transactions");
		socket.emit(SEARCH_TRANSACTIONS,data);
	}

	this.makeTransaction = function(data){
		console.log("Making a new transaction");
		socket.emit(NEW_TRANSACTION,data);
	}

	this.requestAllItems = function(_type){
		console.log("Requesting list of items");
		socket.emit(GET_ITEM_LIST,{type:_type});
	}
}

$(function() {
	Socket.init();
});