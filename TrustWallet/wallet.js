function getParameterByName(name) {
    var url = window.location.href;
    var name = name.replace(/[\[\]]/g, "\\$&");
    var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, " "));
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

    var buttons = '';
    if (!is_executed && !is_canceled) {
        buttons += '<button type="button" class="btn btn-default" id="btn_finalize_transaction">Finalize Transaction</button>';
        buttons += '<button type="button" class="btn btn-default" id="btn_cancel_transaction">Cancel Transaction</button>';
    }

    var list_items = '<div class="list-group-item"> <h4 class="list-group-item-heading">Destination</h4> <p class="list-group-item-text">' + destination + '</p></div>';
    list_items += '<div class="list-group-item"> <h4 class="list-group-item-heading">Value</h4> <p class="list-group-item-text">' + value + '</p></div>';
    list_items += '<div class="list-group-item"> <h4 class="list-group-item-heading">Data</h4> <p class="list-group-item-text">' + data + '</p></div>';
    list_items += '<div class="list-group-item"> <h4 class="list-group-item-heading">Initiator</h4> <p class="list-group-item-text">' + initiator + '</p></div>';
    list_items += '<div class="list-group-item"> <h4 class="list-group-item-heading">Time Initiated</h4> <p class="list-group-item-text">' + time_initiated + '</p></div>';
    list_items += '<div class="list-group-item"> <h4 class="list-group-item-heading">Time Finalized</h4> <p class="list-group-item-text">' + time_finalized + '</p></div>';
    list_items += '<div class="list-group-item"> <h4 class="list-group-item-heading">Is Executed</h4> <p class="list-group-item-text">' + is_executed + '</p></div>';
    list_items += '<div class="list-group-item"> <h4 class="list-group-item-heading">Is Canceled</h4> <p class="list-group-item-text">' + is_canceled + '</p></div>';

    var panel_type = "primary";
    if (is_executed) {
        panel_type = "success";
    } else if (is_canceled) {
        panel_type = "danger";
    }

    return '<div class="panel panel-' + panel_type + '"> <div class="panel-heading">' + title + '</div> <div class="panel-body"> <div class="list-group">' + list_items + '</div>' + buttons + '</div> </div>';
}

var constructUserObject = function(address, userContent) {
    var obj = {
        address: address,
        waiting_time: userContent[0],
        is_active: userContent[1],
        is_removed: userContent[2],
        time_added: userContent[3],
        user_parent: userContent[4],
        time_added_another_user: userContent[5]
    };
    return obj;
}

var constructUserHtml = function(obj) {

    var buttons = '<button type="button" class="btn btn-default remove-user" address="' + obj.address + '">Remove</button>';

    list_items = '<div class="list-group-item"> <h4 class="list-group-item-heading">Waiting Time</h4> <p class="list-group-item-text">' + obj.waiting_time + '</p></div>';
    list_items += '<div class="list-group-item"> <h4 class="list-group-item-heading">Is Active</h4> <p class="list-group-item-text">' + obj.is_active + '</p></div>';
    list_items += '<div class="list-group-item"> <h4 class="list-group-item-heading">Is Removed</h4> <p class="list-group-item-text">' + obj.is_removed + '</p></div>';
    list_items += '<div class="list-group-item"> <h4 class="list-group-item-heading">Time Added</h4> <p class="list-group-item-text">' + obj.time_added + '</p></div>';
    list_items += '<div class="list-group-item"> <h4 class="list-group-item-heading">User Parent</h4> <p class="list-group-item-text">' + obj.user_parent + '</p></div>';
    //alert("added: " + obj.time_added);
    //alert("waiting_time: " + obj.waiting_time);
    //alert("now: " + Date.now() / 1000);
    //alert("Time Until: " + time_until);
    var time_until = Math.round(Math.max(0, obj.time_added - (Date.now() / 1000) + obj.waiting_time));
    list_items += '<div class="list-group-item"> <h4 class="list-group-item-heading">Time Until Can Add User</h4> <p class="list-group-item-text">' + time_until + '</p></div>';

    var panel_type = "primary";
    if (obj.is_removed) {
        var panel_type = "danger";
    }

    return '<div class="panel panel-' + panel_type + '"> <div class="panel-heading">User: ' + obj.address + '</div> <div class="panel-body"> <div class="list-group">' + list_items + '</div>' + buttons + '</div> </div>';
}

var startApp = function(web3) {

    var wallet_address = getParameterByName("wallet_address");
    var wallet = getTrustWallet(web3, wallet_address);


    var refreshTransactions = function(index, newest) {
        if (index >= 0) {
            wallet.transactions(index, function(error, result) {
                $("#panel_transactions").append(constructTransaction("Tx: " + index, result));
                refreshTransactions(index - 1, false);
            });
        }
    }

    var compare_users = function(a, b) {
        return a.waiting_time - b.waiting_time;
    }

    var refreshUsers = function(index, users) {
        wallet.userAddresses(index, function(error, user_address) {
            if (user_address == "0x") {
                users.sort(compare_users);
                for (var i=0; i < users.length; i++) {
                    $("#panel_users").append(constructUserHtml(users[i]));
                }
            } else {
                wallet.users(user_address, function(error, result) {
                    users.push(constructUserObject(user_address, result));
                    refreshUsers(index + 1, users);
                });
            }

        });
    }

    var refresh = function(wallet) {
        $("#panel_transactions").empty();
        $("#panel_users").empty();
        $("#out_user_address").text("User Address: " + web3.eth.accounts[0]);
        $("#out_wallet_address").text("Wallet Address: " + wallet_address);
        wallet.balance(function(error, result) {
            $("#out_balance").text("Balance: " + result);
        });

        wallet.transactionCount(function(error, result) {
            $("#out_transaction_count").text("Transaction Count: " + result);
            refreshTransactions(result - 1, true);
        });
        refreshUsers(0, []);
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

   	$("#btn_add_user").click(function() {
        var user_address = $("#inp_new_user_address").val();
        var waiting_time = $("#inp_new_user_waiting_time").val();
        wallet.addUser(user_address, waiting_time, {from: web3.eth.accounts[0]}, function(error, result) {
            alert("add user transaction sent");
            alert(result);
        });
    });

    $('body').on('click', 'button.btn', function() {
        if ($(this).attr('id') == 'btn_finalize_transaction') {
            wallet.finalizeTransaction({from: web3.eth.accounts[0]}, function(error, result) {
                alert("finalize transaction sent");
                alert(result);
            });
        } else if ($(this).attr('id') == 'btn_cancel_transaction') {
            wallet.cancelTransaction({from: web3.eth.accounts[0]}, function(error, result) {
                alert("cancel transaction sent");
                alert(result);
            });
        }
    });

    $('body').on('click', 'button.remove-user', function() {
        var user_address = $(this).attr('address');
        alert(user_address);
        wallet.removeUser(user_address, {from: web3.eth.accounts[0]}, function(error, result) {
            alert(error);
            alert(result);
        });
    });

    $("#btn_refresh").click(function() {
        refresh(wallet);
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
