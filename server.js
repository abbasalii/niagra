PORT = 8080;

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
NEW_BILL = 'new_bill';
NEW_BILL_SUCCESS = 'new_bill_success';
BILL_SEARCH = 'bill_search';
BILL_RESPONSE = 'bill_response';
BILL_DETAILS = 'bill_details';
BILL_DETAIL_RESPONSE = 'bill_detail_response';
BILL_INFO = 'bill_info';


ACC_REQ_TYPE_TRANS = 1;
ACC_REQ_TYPE_BILL = 2;
ITEM_REQ_TYPE_BILL = 3;


var handler = function(req, res){

	var request = url.parse(req.url, true);
	var action = request.pathname;

	if(action.indexOf(".js")>-1) {
		// if(reqModDate==last) {
		// 	res.writeHead(304, {'Content-Type': 'application/javascript', 'Last-Modified': last, 'Cache-Control':'max-age=86400'});
		// 	return res.end();
		// }

		fs.readFile(__dirname + '/js' + action,
			function (err, data) {
				if (err) {
					res.writeHead(500);
					return res.end('Error loading ' + action);
				}
				res.writeHead(200, {'Content-Type': 'application/javascript'});//, 'Last-Modified': last, 'Cache-Control':'max-age=86400'});
				res.end(data);
			}
		);
	}
	else if(action.indexOf(".css")>-1){  	
  	// if(reqModDate==last){
  	// 	res.writeHead(304, {'Content-Type': 'text/css', 'Last-Modified': last, 'Cache-Control':'max-age=86400'});
  	// 	return res.end();
  	// }

		fs.readFile(__dirname + '/css' + action,
			function (err, data) {
				if (err) {
					res.writeHead(500);
					return res.end('Error loading '+action);
				}
				res.writeHead(200, {'Content-Type': 'text/css'});//, 'Last-Modified': last, 'Cache-Control':'max-age=86400'});
				res.end(data);
			}
		);
	}
	else {
		// if(reqModDate==last) {
		// 	res.writeHead(304, {'Content-Type': 'text/html', 'Last-Modified': last, 'Cache-Control':'max-age=86400'});
		// 	return res.end();
		// }
		if(action=='/')
			action = '/home.html';
		fs.readFile(__dirname + '/html' + action,
			function (err, data) {
				if (err) {
					res.writeHead(500);
					return res.end('Error loading ' + action);
				}
				res.writeHead(200, {'Content-Type': 'text/html'});//, 'Last-Modified': last, 'Cache-Control':'max-age=86400'});
				res.end(data);
			}
		);
	}
}

var getStock = function(socket){

	pool.getConnection(function(err,connection){
		if (err) {
			connection.release();
			socket.emit(DATABASE_ERROR);
			console.log("Failed to connect to the database");
			return;
		}  

		connection.query('SELECT * from ITEM', function(err, rows, fields) {
			connection.release();
			if (err){
				socket.emit(QUERY_ERROR);
				console.log("Failed to connect to the database");
				return;
			}
			else{
				socket.emit(STOCK_RESPONSE,JSON.stringify(rows));
				return;
			}
		});

		connection.on('error', function(err) {
			console.log("Error occurred while performing database operation");
			return;     
        });
	});
}

var getCategories = function(socket){

	pool.getConnection(function(err,connection){
		if (err) {
			connection.release();
			socket.emit(DATABASE_ERROR);
			console.log("Failed to connect to the database");
			return;
		}  

		connection.query('SELECT * from CATEGORY', function(err, rows, fields) {
			connection.release();
			if (err){
				socket.emit(QUERY_ERROR);
				console.log("Failed to connect to the database");
				return;
			}
			else{
				socket.emit(CAT_RESPONSE,JSON.stringify(rows));
				return;
			}
		});

		connection.on('error', function(err) {
			console.log("Error occurred while performing database operation");
			return;     
        });
	});
}

var insertStock = function(data,socket){
	pool.getConnection(function(err,connection){
		if (err) {
			connection.release();
			socket.emit(DATABASE_ERROR);
			console.log("Failed to connect to the database");
			return;
		}  

		if(data.CATEGORY_ID<0){
			connection.query('INSERT INTO CATEGORY (NAME) VALUES (?)',
				[data.CATEGORY_NAME],
			 function(err, rows,fields) {
				if (err){
					console.log("Failed to create new category");
					connection.release();
				}
				else{
					console.log("New category created with name: "+data.CATEGORY_NAME);
					connection.query('INSERT INTO ITEM (NAME,CATEGORY_ID,PRICE,STOCK,USER_ID) VALUES (?, ?, ?, ?, ?)',
					[data.NAME,rows.insertId,data.PRICE,data.STOCK,'DEFAULT'],
					function(err,rows,fields){
						if(err){
							console.log("Failed to insert new item");
						}
						else{
							console.log("New item successfully inserted");
							getStock(io.sockets);
							getCategories(io.sockets);
							socket.emit(INSERT_SUCCESS);
						}
						connection.release();
					});
				}
			});
		}
		else{
			console.log("category already exists");
			connection.query('INSERT INTO ITEM (NAME,CATEGORY_ID,PRICE,STOCK,USER_ID) VALUES (?, ?, ?, ?, ?)',
			[data.NAME,data.CATEGORY_ID,data.PRICE,data.STOCK,'DEFAULT'],
			function(err,rows,fields){
				if(err){
					console.log("Failed to insert new item");
				}
				else{
					console.log("New item successfully inserted");
					getStock(io.sockets);
					socket.emit(INSERT_SUCCESS);
				}
				connection.release();
			});
		}

		connection.on('error', function(err) {
			console.log("Error occurred while performing database operation");
			return;     
        });
	});
}

var updateStock = function(data,socket){
	pool.getConnection(function(err,connection){
		if (err) {
			connection.release();
			socket.emit(DATABASE_ERROR);
			console.log("Failed to connect to the database");
			return;
		}  

		if(data.CATEGORY_ID<0){
			connection.query('INSERT INTO CATEGORY (NAME) VALUES (?)',
				[data.CATEGORY_NAME],
			 function(err, rows,fields) {
				if (err){
					console.log("Failed to create new category");
					connection.release();
				}
				else{
					console.log("New category created with name: "+data.CATEGORY_NAME);
					connection.query('UPDATE ITEM SET NAME=?, CATEGORY_ID=?, PRICE=?, STOCK=? WHERE ID=?',
					[data.NAME,rows.insertId,data.PRICE,data.STOCK,data.ID],
					function(err,rows,fields){
						if(err){
							console.log("Failed to update item");
						}
						else{
							console.log("Item successfully updated");
							getStock(io.sockets);
							getCategories(io.sockets);
							socket.emit(UPDATE_SUCCESS);
						}
						connection.release();
					});
				}
				return;
			});
		}
		else{
			console.log('category already exists');
			connection.query('UPDATE ITEM SET NAME=?, CATEGORY_ID=?, PRICE=?, STOCK=? WHERE ID=?',
					[data.NAME,data.CATEGORY_ID,data.PRICE,data.STOCK,data.ID],
					function(err,rows,fields){
						if(err){
							console.log("Failed to update item");
						}
						else{
							console.log("Item successfully updated");
							socket.emit(UPDATE_SUCCESS);
							getStock(io.sockets);
						}
						connection.release();
					});
			
		}

		connection.on('error', function(err) {
			console.log("Error occurred while performing database operation");
			return;     
        });
	});
}

var sendAccounts = function(socket,type){

	var query = 'ID, TITLE, CITY_ID, CELL, BALANCE';
	if(type==ACC_REQ_TYPE_TRANS || type==ACC_REQ_TYPE_BILL)
		query = 'ID, TITLE, CITY_ID';

	pool.getConnection(function(err,connection){
		if (err) {
			connection.release();
			socket.emit(DATABASE_ERROR);
			console.log("Failed to connect to the database");
			return;
		}  

		connection.query('SELECT '+query+' from ACCOUNT', function(err, rows, fields) {
			connection.release();
			if (err){
				socket.emit(QUERY_ERROR);
				console.log("Failed to connect to the database");
				return;
			}
			else{
				console.log("Sending accounts information");
				socket.emit(ACCOUNT_RESPONSE,JSON.stringify(rows));
				return;
			}
		});

		connection.on('error', function(err) {
			console.log("Error occurred while performing database operation");
			return;     
        });
	});
}

var sendAccountDetail = function(socket,id){

	pool.getConnection(function(err,connection){
		if (err) {
			connection.release();
			socket.emit(DATABASE_ERROR);
			console.log("Failed to connect to the database");
			return;
		}  

		connection.query('SELECT * from ACCOUNT WHERE ID=?',[id], function(err, rows, fields) {
			connection.release();
			if (err){
				socket.emit(QUERY_ERROR);
				console.log("Failed to connect to the database");
				return;
			}
			else{
				console.log("Sending detail of an account");
				socket.emit(ACCOUNT_DETAIL_RESPONSE,JSON.stringify(rows));
				return;
			}
		});

		connection.on('error', function(err) {
			console.log("Error occurred while performing database operation");
			return;     
        });
	});
}

var sendCityList = function(socket){

	pool.getConnection(function(err,connection){
		if (err) {
			connection.release();
			socket.emit(DATABASE_ERROR);
			console.log("Failed to connect to the database");
			return;
		}  

		connection.query('SELECT * from CITY', function(err, rows, fields) {
			connection.release();
			if (err){
				socket.emit(QUERY_ERROR);
				console.log("Failed to connect to the database");
				return;
			}
			else{
				console.log("Sending city list");
				socket.emit(CITY_RESPONSE,JSON.stringify(rows));
				return;
			}
		});

		connection.on('error', function(err) {
			console.log("Error occurred while performing database operation");
			return;     
        });
	});
}

var updateAccount = function(data,socket){

	pool.getConnection(function(err,connection){
		if (err) {
			connection.release();
			socket.emit(DATABASE_ERROR);
			console.log("Failed to connect to the database");
			return;
		}  

		if(data.CITY_ID<0){
			connection.query('INSERT INTO CITY (NAME) VALUES (?)',
				[data.CITY_NAME],
			 function(err, rows,fields) {
				if (err){
					console.log("Failed to create new city");
					connection.release();
				}
				else{
					console.log("New city created with name: "+data.CITY_NAME);
					connection.query('UPDATE ACCOUNT SET TITLE=?, CITY_ID=?, PTCL=?, CELL=?, EXTRAS=? WHERE ID=?',
					[data.TITLE,rows.insertId,data.PTCL,data.CELL,data.EXTRAS,data.ID],
					function(err,rows,fields){
						if(err){
							console.log("Failed to update account");
						}
						else{
							console.log("Account successfully updated");
							sendCityList(socket);
							sendAccounts(socket);
							socket.emit(ACCOUNT_UPDATE_SUCCESS);
							sendAccountDetail(socket,data.ID);
						}
						connection.release();
					});
				}
				return;
			});
		}
		else{
			console.log('city name already exists');
			connection.query('UPDATE ACCOUNT SET TITLE=?, CITY_ID=?, PTCL=?, CELL=?, EXTRAS=? WHERE ID=?',
					[data.TITLE,data.CITY_ID,data.PTCL,data.CELL,data.EXTRAS,data.ID],
					function(err,rows,fields){
						if(err){
							console.log("Failed to update account");
						}
						else{
							console.log("Account successfully updated");
							sendAccounts(socket);
							socket.emit(ACCOUNT_UPDATE_SUCCESS);
							sendAccountDetail(socket,data.ID);
						}
						connection.release();
					});
			
		}

		connection.on('error', function(err) {
			console.log("Error occurred while performing database operation");
			return;     
        });
	});
}

var createAccount = function(data,socket){

	pool.getConnection(function(err,connection){
		if (err) {
			connection.release();
			socket.emit(DATABASE_ERROR);
			console.log("Failed to connect to the database");
			return;
		}  

		if(data.CITY_ID<0){
			connection.query('INSERT INTO CITY (NAME) VALUES (?)',
				[data.CITY_NAME],
			 function(err, rows,fields) {
				if (err){
					console.log("Failed to create new city");
					connection.release();
				}
				else{
					console.log("New city created with name: "+data.CITY_NAME);
					connection.query('INSERT INTO ACCOUNT (TITLE,CITY_ID,PTCL,CELL,EXTRAS,BALANCE,CREATED) VALUES (?,?,?,?,?,?,?)',
					[data.TITLE,rows.insertId,data.PTCL,data.CELL,data.EXTRAS,data.BALANCE,data.CREATED],
					function(err,rows,fields){
						if(err){
							console.log("Failed to create new account");
						}
						else{
							console.log("New account successfully created");
							socket.emit(CREATE_ACCOUNT_SUCCESS);
							sendCityList(socket);
							sendAccounts(socket);
						}
						connection.release();
					});
				}
			});
		}
		else{
			console.log("city name already exists");
			connection.query('INSERT INTO ACCOUNT (TITLE,CITY_ID,PTCL,CELL,EXTRAS,BALANCE,CREATED) VALUES (?,?,?,?,?,?,?)',
			[data.TITLE,data.CITY_ID,data.PTCL,data.CELL,data.EXTRAS,data.BALANCE,data.CREATED],
			function(err,rows,fields){
				if(err){
					console.log("Failed to create new account");
				}
				else{
					console.log("New account successfully created");
					socket.emit(CREATE_ACCOUNT_SUCCESS);
					sendAccounts(socket);
				}
				connection.release();
			});
		}

		connection.on('error', function(err) {
			console.log("Error occurred while performing database operation");
			return;     
        });
	});
}

var searchTransactions = function(data,socket){

	var query = 'SELECT * from TRANSACTION WHERE T_DATE>=? AND T_DATE<=? AND ABS(AMOUNT)>=? AND ABS(AMOUNT)<=?';
	var values = [data.B_DATE,data.E_DATE,data.MIN,data.MAX];
	if(data.CITY_ID>-1){

		if(data.TITLE.length>0)
		{
			console.log("Both city and title");
			query += ' AND ACCOUNT_ID IN ('+
						'SELECT ID FROM ACCOUNT WHERE CITY_ID=? AND TITLE LIKE "%'+data.TITLE+'%"'
				+')';
			values.push(data.CITY_ID);
			// values.push(data.TITLE);
		}
		else{
			console.log("city only");
			query += ' AND ACCOUNT_ID IN ('+
						'SELECT ID FROM ACCOUNT WHERE CITY_ID=?'
				+')';
			values.push(data.CITY_ID);
		}
	}
	else if(data.TITLE.length>0){

		console.log("title only");
		query += ' AND ACCOUNT_ID IN ('+
					'SELECT ID FROM ACCOUNT WHERE TITLE LIKE "%'+data.TITLE+'%"'
			+')';
		// values.push(data.TITLE);
	}

	pool.getConnection(function(err,connection){
		if (err) {
			connection.release();
			socket.emit(DATABASE_ERROR);
			console.log("Failed to connect to the database");
			return;
		}  

		connection.query(query, values, function(err, rows, fields) {
			connection.release();
			if (err){
				socket.emit(QUERY_ERROR);
				console.log("Failed to connect to the database");
				return;
			}
			else{
				console.log("Sending list of transactions");
				socket.emit(TRANSACTION_RESPONSE,JSON.stringify(rows));
				return;
			}
		});

		connection.on('error', function(err) {
			console.log("Error occurred while performing database operation");
			return;     
        });
	});
}

var makeTransaction = function(data,socket){

	pool.getConnection(function(err,connection){
		if (err) {
			connection.release();
			socket.emit(DATABASE_ERROR);
			console.log("Failed to connect to the database");
			return;
		}  

		connection.query('SELECT BALANCE FROM ACCOUNT WHERE ID=?',
			[data.ACCOUNT_ID],
		 function(err, rows,fields) {
			if (err){
				console.log("Failed to retrieve balance");
				connection.release();
			}
			else{
				// console.log("Balance: "+rows[0].BALANCE);
				var balance = parseInt(rows[0].BALANCE) + (data.AMOUNT) - data.OTHER;
				connection.query('UPDATE ACCOUNT SET BALANCE=? WHERE ID=?',
				[balance,data.ACCOUNT_ID],
				function(err,rows,fields){
					if(err){
						console.log("Failed to update the balance");
						connection.release();
					}
					else{
						console.log("Balance successfully updated");
						var query = 'INSERT INTO TRANSACTION (T_DATE,AMOUNT,DESCRIPTION,ACCOUNT_ID) VALUES (?,?,?,?)';
						var values = [data.T_DATE,data.AMOUNT,data.DESCRIPTION,data.ACCOUNT_ID];
						if(data.OTHER>0){
							query += ',(?,?,?,?)';
							values.push(data.T_DATE);
							values.push(-data.OTHER);
							values.push(data.BILL);
							values.push(data.ACCOUNT_ID);
						}
						connection.query(query,
						values,
						function(err,rows,fields){
							if(err){
								console.log("Failed to insert a new transaction");
							}
							else{
								console.log("New transaction successfully completed");
								socket.emit(TRANSACTION_COMPLETE);
							}
							connection.release();
						});
					}
				});
			}
			return;
		});

		connection.on('error', function(err) {
			console.log("Error occurred while performing database operation");
			return;     
        });
	});
}

var sendItemList = function(socket,type){

	var query = '*';
	if(type==ITEM_REQ_TYPE_BILL)
		query = 'ID, NAME, PRICE';

	pool.getConnection(function(err,connection){
		if (err) {
			connection.release();
			socket.emit(DATABASE_ERROR);
			console.log("Failed to connect to the database");
			return;
		}  

		connection.query('SELECT '+query+' from ITEM', function(err, rows, fields) {
			connection.release();
			if (err){
				socket.emit(QUERY_ERROR);
				console.log("Failed to connect to the database");
				return;
			}
			else{
				console.log("Sending list of items");
				socket.emit(ITEM_LIST_RESPONSE,JSON.stringify(rows));
				return;
			}
		});

		connection.on('error', function(err) {
			console.log("Error occurred while performing database operation");
			return;     
        });
	});
}

var createNewBill = function(data,socket){

	console.log(data.ACCOUNT_ID);
	console.log(data.AMOUNT_DUE);
	console.log(data.DISCOUNT);
	console.log(data.AMOUNT_PAID);
	var sales = data.SALES;
	for(var i=0; i<sales.length; i++)
		console.log(sales[i].ITEM_ID + "\t" + sales[i].COST + "\t" + sales[i].QUANTITY);

	pool.getConnection(function(err,connection){
		if (err) {
			connection.release();
			socket.emit(DATABASE_ERROR);
			console.log("Failed to connect to the database");
			return;
		}  

		connection.query('INSERT INTO BILL (B_DATE,ACCOUNT_ID,AMOUNT_DUE,DISCOUNT,AMOUNT_PAID) VALUES (NOW(),?,?,?,?)',
		[data.ACCOUNT_ID,data.AMOUNT_DUE,data.DISCOUNT,data.AMOUNT_PAID],
		function(err,rows,fields){
			if(err){
				console.log("Failed to create new bill");
				connection.release();
			}
			else{
				var b_id = rows.insertId;
				console.log("New bill successfully created with ID: "+rows.insertId);

				var query = 'INSERT INTO SALE (ITEM_ID,COST,QUANTITY,BILL_ID) VALUES (?,?,?,?)';
				var values = [sales[0].ITEM_ID,sales[0].COST,sales[0].QUANTITY,rows.insertId];
				for(var i=1; i<sales.length; i++){
					query += ',(?,?,?,?)';
					values.push(sales[i].ITEM_ID);
					values.push(sales[i].COST);
					values.push(sales[i].QUANTITY);
					values.push(rows.insertId);
				}
				connection.query(query, values,
				function(err,rows,fields){
					if(err){
						console.log("Failed to insert sales");
					}
					else{
						console.log("Sales successfully inserted");
						socket.emit(NEW_BILL_SUCCESS,{id:b_id});
					}
					connection.release();
				});
			}
		});

		connection.on('error', function(err) {
			console.log("Error occurred while performing database operation");
			return;     
        });
	});
}

var searchBillRecords = function(data,socket){

	var query = 'SELECT * from BILL WHERE B_DATE>=? AND B_DATE<=? AND AMOUNT_DUE>=? AND AMOUNT_DUE<=?';
	var values = [data.B_DATE,data.E_DATE,data.MIN,data.MAX];
	if(data.CITY_ID>-1){

		if(data.TITLE.length>0)
		{
			console.log("Both city and title");
			query += ' AND ACCOUNT_ID IN ('+
						'SELECT ID FROM ACCOUNT WHERE CITY_ID=? AND TITLE LIKE "%'+data.TITLE+'%"'
				+')';
			values.push(data.CITY_ID);
			// values.push(data.TITLE);
		}
		else{
			console.log("city only");
			query += ' AND ACCOUNT_ID IN ('+
						'SELECT ID FROM ACCOUNT WHERE CITY_ID=?'
				+')';
			values.push(data.CITY_ID);
		}
	}
	else if(data.TITLE.length>0){

		console.log("title only");
		query += ' AND ACCOUNT_ID IN ('+
					'SELECT ID FROM ACCOUNT WHERE TITLE LIKE "%'+data.TITLE+'%"'
			+')';
		// values.push(data.TITLE);
	}

	pool.getConnection(function(err,connection){
		if (err) {
			connection.release();
			socket.emit(DATABASE_ERROR);
			console.log("Failed to connect to the database");
			return;
		}  

		connection.query(query, values, function(err, rows, fields) {
			connection.release();
			if (err){
				socket.emit(QUERY_ERROR);
				console.log("Failed to fetch bill records");
				return;
			}
			else{
				console.log("Sending bill records");
				socket.emit(BILL_RESPONSE,JSON.stringify(rows));
				return;
			}
		});

		connection.on('error', function(err) {
			console.log("Error occurred while performing database operation");
			return;     
        });
	});
}

var getBillInfo = function(id,socket){

	pool.getConnection(function(err,connection){
		if (err) {
			connection.release();
			socket.emit(DATABASE_ERROR);
			console.log("Failed to connect to the database");
			return;
		}  

		var query = 'SELECT ACCOUNT.TITLE, BILL.B_DATE, BILL.AMOUNT_DUE, BILL.DISCOUNT, BILL.AMOUNT_PAID from BILL'
					+ ' INNER JOIN ACCOUNT'
					+ ' ON BILL.ACCOUNT_ID=ACCOUNT.ID'
					+ ' WHERE BILL.ID=?';
		connection.query(query,[id], function(err, rows, fields) {
			connection.release();
			if (err){
				socket.emit(QUERY_ERROR);
				console.log("Failed to fetch bill info");
				return;
			}
			else{
				console.log("Sending bill info");
				socket.emit(BILL_INFO,JSON.stringify(rows));
				return;
			}
		});

		connection.on('error', function(err) {
			console.log("Error occurred while performing database operation");
			return;     
        });
	});
}

var getBillDetails = function(id,socket){

	getBillInfo(id,socket);

	pool.getConnection(function(err,connection){
		if (err) {
			connection.release();
			socket.emit(DATABASE_ERROR);
			console.log("Failed to connect to the database");
			return;
		}  

		var query = 'SELECT ITEM.NAME, SALE.COST, SALE.QUANTITY from SALE'
					+ ' INNER JOIN ITEM'
					+ ' ON SALE.ITEM_ID=ITEM.ID'
					+ ' WHERE SALE.BILL_ID=?';
		connection.query(query,[id], function(err, rows, fields) {
			connection.release();
			if (err){
				socket.emit(QUERY_ERROR);
				console.log("Failed to fetch bill details");
				return;
			}
			else{
				console.log("Sending bill details");
				socket.emit(BILL_DETAIL_RESPONSE,JSON.stringify(rows));
				return;
			}
		});

		connection.on('error', function(err) {
			console.log("Error occurred while performing database operation");
			return;     
        });
	});
}

var mysql 	= require('mysql');
var http 	= require('http').createServer(handler);
var fs 		= require('fs');
var url 	= require('url');
var io      = require('socket.io').listen(http);
var pool 	=    mysql.createPool({
    connectionLimit : 100, //important
    host     : 'localhost',
    user     : 'root',
    password : 'lionking',
    database : 'niagra_sports',
    debug    :  false
});

http.listen(PORT);

io.sockets.on('connection', function (socket) {

	socket.on(STOCK_REQUEST,function(){
		console.log('Client has requested for stock information');
		getStock(socket);
	});

	socket.on(CAT_REQUEST,function(){
		console.log('Client has requested for categories');
		getCategories(socket);
	});

	socket.on(INSERT_STOCK,function(data){
		console.log('Client has sent stock info to store in database');
		insertStock(JSON.parse(data),socket);
	});

	socket.on(UPDATE_STOCK,function(data){
		console.log('Client has sent stock info to update');
		updateStock(JSON.parse(data),socket);
	});

	socket.on(ACCOUNT_REQUEST,function(data){
		console.log('Client has requested accounts information');
		sendAccounts(socket,data.type);
	});

	socket.on(CITY_REQUEST,function(){
		console.log('Client has requested city list');
		sendCityList(socket);
	});

	socket.on(ACCOUNT_DETAIL,function(data){
		console.log('Client has requested details of account id: '+data.id);
		sendAccountDetail(socket,data.id);
	});

	socket.on(UPDATE_ACCOUNT,function(data){
		console.log('Client has sent account information to update');
		updateAccount(JSON.parse(data),socket);
	});

	socket.on(CREATE_ACCOUNT,function(data){
		console.log('Client has requested to create new account');
		createAccount(JSON.parse(data),socket);
	});

	socket.on(SEARCH_TRANSACTIONS,function(data){
		console.log('Client has sent a transaction search query');
		searchTransactions(data,socket);
	});

	socket.on(NEW_TRANSACTION,function(data){
		console.log('Client has requested a new transaction');
		makeTransaction(data,socket);
	});

	socket.on(GET_ITEM_LIST,function(data){
		console.log('Client has requested for list of items');
		sendItemList(socket,data.type);
	});

	socket.on(NEW_BILL,function(data){
		console.log('Client has sent new bill details');
		createNewBill(JSON.parse(data),socket);
	});

	socket.on(BILL_SEARCH,function(data){
		console.log('Client has sent bill search query');
		searchBillRecords(data,socket);
	});

	socket.on(BILL_DETAILS,function(data){
		console.log('Client has requested bill details for bill # '+data.id);
		getBillDetails(data.id,socket);
	});
});







