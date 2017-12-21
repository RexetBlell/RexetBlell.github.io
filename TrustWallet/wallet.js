var getTrustWallet = function(web3, address) {

    var contractABI = [{
		"constant": false,
		"inputs": [
			{
				"name": "_destination",
				"type": "address"
			},
			{
				"name": "_value",
				"type": "uint256"
			},
			{
				"name": "_data",
				"type": "bytes"
			}
		],
		"name": "initiateTransaction",
		"outputs": [],
		"payable": false,
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"constant": true,
		"inputs": [
			{
				"name": "",
				"type": "uint256"
			}
		],
		"name": "userAddresses",
		"outputs": [
			{
				"name": "",
				"type": "address"
			}
		],
		"payable": false,
		"stateMutability": "view",
		"type": "function"
	},
	{
		"constant": false,
		"inputs": [],
		"name": "cancelTransaction",
		"outputs": [],
		"payable": false,
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"constant": false,
		"inputs": [
			{
				"name": "userAddr",
				"type": "address"
			}
		],
		"name": "removeUser",
		"outputs": [],
		"payable": false,
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"constant": true,
		"inputs": [
			{
				"name": "",
				"type": "uint256"
			}
		],
		"name": "transactions",
		"outputs": [
			{
				"name": "destination",
				"type": "address"
			},
			{
				"name": "value",
				"type": "uint256"
			},
			{
				"name": "data",
				"type": "bytes"
			},
			{
				"name": "initiator",
				"type": "address"
			},
			{
				"name": "time_initiated",
				"type": "uint256"
			},
			{
				"name": "time_finalized",
				"type": "uint256"
			},
			{
				"name": "is_executed",
				"type": "bool"
			},
			{
				"name": "is_canceled",
				"type": "bool"
			}
		],
		"payable": false,
		"stateMutability": "view",
		"type": "function"
	},
	{
		"constant": false,
		"inputs": [],
		"name": "finalizeTransaction",
		"outputs": [],
		"payable": false,
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"constant": true,
		"inputs": [
			{
				"name": "",
				"type": "address"
			}
		],
		"name": "users",
		"outputs": [
			{
				"name": "waiting_time",
				"type": "uint256"
			},
			{
				"name": "is_active",
				"type": "bool"
			},
			{
				"name": "is_removed",
				"type": "bool"
			},
			{
				"name": "time_added",
				"type": "uint256"
			},
			{
				"name": "parent",
				"type": "address"
			},
			{
				"name": "time_added_another_user",
				"type": "uint256"
			}
		],
		"payable": false,
		"stateMutability": "view",
		"type": "function"
	},
	{
		"constant": true,
		"inputs": [],
		"name": "balance",
		"outputs": [
			{
				"name": "",
				"type": "uint256"
			}
		],
		"payable": false,
		"stateMutability": "view",
		"type": "function"
	},
	{
		"constant": true,
		"inputs": [],
		"name": "transactionCount",
		"outputs": [
			{
				"name": "",
				"type": "uint256"
			}
		],
		"payable": false,
		"stateMutability": "view",
		"type": "function"
	},
	{
		"constant": false,
		"inputs": [
			{
				"name": "new_user",
				"type": "address"
			},
			{
				"name": "new_user_time",
				"type": "uint256"
			}
		],
		"name": "addUser",
		"outputs": [],
		"payable": false,
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"constant": true,
		"inputs": [],
		"name": "isTransactionPending",
		"outputs": [
			{
				"name": "",
				"type": "bool"
			}
		],
		"payable": false,
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"name": "first_user",
				"type": "address"
			}
		],
		"payable": false,
		"stateMutability": "nonpayable",
		"type": "constructor"
	},
	{
		"payable": true,
		"stateMutability": "payable",
		"type": "fallback"
	}];

    var abstract_contract = web3.eth.contract(contractABI);
    var specific_contract = abstract_contract.at(address);

    return specific_contract;
}

var constructTransaction = function(title, transactionContent) {
    var destination = transactionContent[0];
    var value = transactionContent[1];
    var data = transactionContent[2];
    var initiator = transactionContent[3];
    var time_initiated = transactionContent[4];
    var time_finalized = transactionContent[5];
    var is_executed = transactionContent[6];
    var is_canceled = transactionContent[7];

    buttons = "";

    list_items = "";
    list_items += '<div class="list-group-item"> <h4 class="list-group-item-heading">Destination</h4> <p class="list-group-item-text">' + destination + '</p></div>';
    list_items += '<div class="list-group-item"> <h4 class="list-group-item-heading">Value</h4> <p class="list-group-item-text">' + value + '</p></div>';
    list_items += '<div class="list-group-item"> <h4 class="list-group-item-heading">Data</h4> <p class="list-group-item-text">' + data + '</p></div>';
    list_items += '<div class="list-group-item"> <h4 class="list-group-item-heading">Initiator</h4> <p class="list-group-item-text">' + initiator + '</p></div>';
    list_items += '<div class="list-group-item"> <h4 class="list-group-item-heading">Time Initiated</h4> <p class="list-group-item-text">' + time_initiated + '</p></div>';
    list_items += '<div class="list-group-item"> <h4 class="list-group-item-heading">Time Finalized</h4> <p class="list-group-item-text">' + time_finalized + '</p></div>';
    list_items += '<div class="list-group-item"> <h4 class="list-group-item-heading">Is Executed</h4> <p class="list-group-item-text">' + is_executed + '</p></div>';
    list_items += '<div class="list-group-item"> <h4 class="list-group-item-heading">Is Canceled</h4> <p class="list-group-item-text">' + is_canceled + '</p></div>';
    return '<div class="panel panel-default"> <div class="panel-heading">' + title + '</div> <div class="panel-body"> <div class="list-group">' + list_items + '</div>' + buttons + '</div> </div>';
}

var constructUser = function(title, userContent) {
    var waiting_time = userContent[0];
    var is_active = userContent[1];
    var is_removed = userContent[2];
    var time_added = userContent[3];
    var user_parent = userContent[4];
    var time_added_another_user = userContent[5];

    list_items = "";
    list_items += '<div class="list-group-item"> <h4 class="list-group-item-heading">Waiting Time</h4> <p class="list-group-item-text">' + waiting_time + '</p></div>';
    list_items += '<div class="list-group-item"> <h4 class="list-group-item-heading">Is Active</h4> <p class="list-group-item-text">' + is_active + '</p></div>';
    list_items += '<div class="list-group-item"> <h4 class="list-group-item-heading">Is Removed</h4> <p class="list-group-item-text">' + is_removed + '</p></div>';
    list_items += '<div class="list-group-item"> <h4 class="list-group-item-heading">Time Added</h4> <p class="list-group-item-text">' + time_added + '</p></div>';
    list_items += '<div class="list-group-item"> <h4 class="list-group-item-heading">User Parent</h4> <p class="list-group-item-text">' + user_parent + '</p></div>';
    list_items += '<div class="list-group-item"> <h4 class="list-group-item-heading">Time added another user</h4> <p class="list-group-item-text">' + time_added_another_user + '</p></div>';
    return '<div class="panel panel-default"> <div class="panel-heading">' + title + '</div> <div class="panel-body"> <div class="list-group">' + list_items + '</div> </div> </div>';
}

var refreshTransactions = function(index, newest) {
    if (index >= 0) {
        wallet.transactions(index, function(error, result) {
            $("#panel_transactions").append(constructTransaction("Tx: " + index, result));
            refreshTransactions(index - 1, false);
        });
    }
}

var refreshUsers = function(index) {
    if (index < 2) {
        wallet.userAddresses(index, function(error, user_address) {
            if (user_address != "0x") {
                wallet.users(user_address, function(error, result) {
                    $("#panel_users").append(constructUser("User: " + user_address, result));
                    refreshUsers(index + 1);
                });
            }
        });
    }
}

var startApp = function(web3) {

    wallet_address = "0x63084d49868085e059df77c06f94d64fc47e3473"; // change this
    wallet = getTrustWallet(web3, wallet_address);

    var refresh = function(wallet) {

        wallet.transactionCount(function(error, result) {
            refreshTransactions(result - 1, true);
        });
        refreshUsers(0);
    }

   	$("#btn_initiate_transaction").click(function() {
        var dest = $("#inp_destination").val();
        var val = $("#inp_value").val();
        var data = $("#inp_data").val();
        wallet.initiateTransaction(dest, val, data, {from: web3.eth.accounts[0]}, function(error, result) {
            alert("create transaction sent");
            alert(result);
        });
    });

    $("#btn_finalize_transaction").click(function() {
        wallet.finalizeTransaction({from: web3.eth.accounts[0]}, function(error, result) {
            alert("finalize transaction sent");
            alert(result);
        });
    });

    $("#btn_cancel_transaction").click(function() {
        wallet.cancelTransaction({from: web3.eth.accounts[0]}, function(error, result) {
            alert("cancel transaction sent");
            alert(result);
        });
    });

    refresh(wallet);
}

$(function() {

    function getWeb3(callback) {
        if (typeof window.web3 === 'undefined') {
            // no web3, use fallback
            alert("Please install MetaMask");
        } else {
            // window.web3 == web3 most of the time. Don't override the provided,
            // web3, just wrap it in your Web3.
            var myWeb3 = new Web3(window.web3.currentProvider);
            myWeb3.eth.defaultAccount = window.web3.eth.defaultAccount;
            callback(myWeb3);
        }
    }

    /*
    function startApp(web3) {
        alert("nice, app started");
    }
    */

    getWeb3(startApp);

});
