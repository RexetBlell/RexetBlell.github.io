var date_format = "MMMM DD YYYY, HH:mm:ss";

function getParameterByName(name) {
    var url = window.location.href;
    var name = name.replace(/[\[\]]/g, "\\$&");
    var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, " "));
}

var constructTransaction = function(tx_id, transactionContent) {
    var destination = transactionContent[0];
    var value = transactionContent[1];
    var data = transactionContent[2];
    var initiator = transactionContent[3];
    var time_initiated = moment.unix(transactionContent[4]).format(date_format);
    var time_finalized = moment.unix(transactionContent[5]).format(date_format);
    var finalized_by = transactionContent[6];
    var is_executed = transactionContent[7];
    var is_canceled = transactionContent[8];

    var title;
    var tx_status;
    var panel_status;

    var buttons = '';

    if (is_executed) {
        title = 'Transaction #' + tx_id + ' (Executed)';
        tx_status = "Executed";
        panel_status = "success";
    } else if (is_canceled) {
        title = 'Transaction #' + tx_id + ' (Canceled)';
        tx_status = "Canceled";
        panel_status = "danger";
    } else {
        title = 'Transaction #' + tx_id + ' (Pending)';
        tx_status = "Pending";
        panel_status = "primary";
    }

    var list_items = '<div class="list-group-item"> <h4 class="list-group-item-heading">Destination</h4> <p class="list-group-item-text">' + destination + '</p></div>';
    list_items += '<div class="list-group-item"> <h4 class="list-group-item-heading">Value</h4> <p class="list-group-item-text">' + value + '</p></div>';
    list_items += '<div class="list-group-item"> <h4 class="list-group-item-heading">Data</h4> <p class="list-group-item-text">' + data + '</p></div>';
    list_items += '<div class="list-group-item"> <h4 class="list-group-item-heading">Initiator</h4> <p class="list-group-item-text">' + initiator + '</p></div>';
    list_items += '<div class="list-group-item"> <h4 class="list-group-item-heading">Date Initiated</h4> <p class="list-group-item-text">' + time_initiated + '</p></div>';
    if (is_executed || is_canceled) {
        list_items += '<div class="list-group-item"> <h4 class="list-group-item-heading">Date ' + tx_status + '</h4> <p class="list-group-item-text">' + time_finalized + '</p></div>';
        list_items += '<div class="list-group-item"> <h4 class="list-group-item-heading">' + tx_status + ' By</h4> <p class="list-group-item-text">' + finalized_by + '</p></div>';
    } else {
        buttons += '<button type="button" class="btn btn-default" id="btn_finalize_transaction">Finalize Transaction</button>';
        buttons += '<button type="button" class="btn btn-default" id="btn_cancel_transaction">Cancel Transaction</button>';
    }

    return '<div class="panel panel-' + panel_status + '"> <div class="panel-heading">' + title + '</div> <div class="panel-body"> <div class="list-group">' + list_items + '</div>' + buttons + '</div> </div>';

}

var constructUserObject = function(address, userContent) {
    var obj = {
        address: address,
        waiting_time: userContent[0],
        added_by: userContent[1],
        time_added: userContent[2],
        removed_by: userContent[3],
        time_removed: userContent[4],
        time_added_another_user: userContent[5]
    };
    return obj;
}

var constructUserHtml = function(obj, state) {
    var buttons = '<button type="button" class="btn btn-default remove-user" address="' + obj.address + '">Remove</button>';
    if (state == "cur_user") {
        buttons = '<button type="button" class="btn btn-default remove-user" address="' + obj.address + '">Remove Self</button>';
    }
    var waiting_time_str;
    if (obj.waiting_time < 60) {
        waiting_time_str = obj.waiting_time + " seconds";
    } else {
        waiting_time_str = 'Around ' + moment.duration(obj.waiting_time.toNumber(), "seconds").humanize() + ' (' + obj.waiting_time + ' seconds)';
    }
    var list_items = '<div class="list-group-item"> <h4 class="list-group-item-heading">Waiting Time</h4> <p class="list-group-item-text">' + waiting_time_str + '</p></div>';
    list_items += '<div class="list-group-item"> <h4 class="list-group-item-heading">Added By</h4> <p class="list-group-item-text">' + obj.added_by + '</p></div>';
    list_items += '<div class="list-group-item"> <h4 class="list-group-item-heading">Time Added</h4> <p class="list-group-item-text">' + moment.unix(obj.time_added.toNumber()).format(date_format) + '</p></div>';
    list_items += '<div class="list-group-item"> <h4 class="list-group-item-heading">Removed By</h4> <p class="list-group-item-text">' + obj.removed_by + '</p></div>';
    list_items += '<div class="list-group-item"> <h4 class="list-group-item-heading">Time Removed</h4> <p class="list-group-item-text">' + moment.unix(obj.time_removed.toNumber()).format(date_format) + '</p></div>';
    var time_until = Math.round(Math.max(0, obj.time_added - (Date.now() / 1000) + obj.waiting_time));
    list_items += '<div class="list-group-item"> <h4 class="list-group-item-heading">Time Until Can Add User</h4> <p class="list-group-item-text">' + time_until + '</p></div>';

    var panel_type = "primary";
    if (obj.is_removed) {
        panel_type = "danger";
    } else if (state == "weaker") {
        panel_type = "info";
    }

    if (state == "cur_user") {
        return '<div class="list-group">' + list_items + '</div>' + buttons;
    }
    return '<div class="panel panel-' + panel_type + '"> <div class="panel-heading">User: ' + obj.address + '</div> <div class="panel-body"> <div class="list-group">' + list_items + '</div>' + buttons + '</div> </div>';
}

var startApp = function(web3) {

    var wallet_address = getParameterByName("wallet_address");
    var wallet = getTrustWallet(web3, wallet_address);


    var refreshTransactions = function(index, newest) {
        if (index >= 0) {
            wallet.transactions(index, function(error, result) {
                $("#panel_transactions").append(constructTransaction(index, result));
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
                var cur_user = null;
                for (var i = 0; i < users.length; i++) {
                    // find the current user
                    if (users[i].address == web3.eth.accounts[0]) cur_user = users[i];
                }
                $("#panel_current_user_heading").text("Current User Address: " + web3.eth.accounts[0]);
                if (cur_user == null) {
                    $("#panel_current_user").append("<h4>User Not Found</h4>");
                    for (var i = 0; i < users.length; i++) {
                        $("#panel_users").append(constructUserHtml(users[i], "stronger"));
                    }
                } else {
                    for (var i = 0; i < users.length; i++) {
                        if (users[i].address == cur_user.address) {
                            $("#panel_current_user").append(constructUserHtml(users[i], "cur_user"));
                        } else if (users[i].is_removed) {
                            $("#panel_removed_users").append(constructUserHtml(users[i]));
                        } else if (users[i].waiting_time < cur_user.waiting_time) {
                            $("#panel_users").append(constructUserHtml(users[i], "stronger"));
                        } else {
                            $("#panel_users").append(constructUserHtml(users[i], "weaker"));
                        }
                    }
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
            alert(result);
        });
    });

   	$("#btn_add_user").click(function() {
        var user_address = $("#inp_new_user_address").val();
        var waiting_time = $("#inp_new_user_waiting_time").val(); // TODO: make specifying this easier
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
