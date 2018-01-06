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

var constructTransactionObject = function(tx_id, transactionContent) {
    var result = {
        destination: transactionContent[0],
        value: transactionContent[1].toNumber(),
        data: transactionContent[2],
        initiated_by: transactionContent[3],
        time_initiated: transactionContent[4].toNumber(),
        finalized_by: transactionContent[5],
        time_finalized: transactionContent[6].toNumber(),
        is_executed: transactionContent[7],
        execution_successful: transactionContent[8],
        tx_id: tx_id
    }
    return result;
}

var constructTransaction = function(tx, initiator) {
    var title;
    var tx_status;
    var panel_status;

    var buttons = '';

    if (tx.time_finalized == 0) {
        title = 'Transaction #' + tx.tx_id + ' (Pending)';
        tx_status = "Pending";
        panel_status = "primary";
    } else if (tx.is_executed) {
        title = 'Transaction #' + tx.tx_id + ' (Executed)';
        tx_status = "Executed";
        panel_status = "success";
    } else {
        title = 'Transaction #' + tx.tx_id + ' (Canceled)';
        tx_status = "Canceled";
        panel_status = "danger";
    }

    var list_items = '<div class="list-group-item"> <h4 class="list-group-item-heading">Destination</h4> <p class="list-group-item-text">' + tx.destination + '</p></div>';
    list_items += '<div class="list-group-item"> <h4 class="list-group-item-heading">Value</h4> <p class="list-group-item-text">' + web3.fromWei(tx.value, "ether") + ' ETH</p></div>';
    list_items += '<div class="list-group-item"> <h4 class="list-group-item-heading">Data</h4> <p class="list-group-item-text">' + tx.data + '</p></div>';
    list_items += '<div class="list-group-item"> <h4 class="list-group-item-heading">Initiated By</h4> <p class="list-group-item-text">' + tx.initiated_by + '</p></div>';
    list_items += '<div class="list-group-item"> <h4 class="list-group-item-heading">Date Initiated</h4> <p class="list-group-item-text">' + moment.unix(tx.time_initiated).format(date_format) + '</p></div>';
    if (tx.time_finalized != 0) {
        list_items += '<div class="list-group-item"> <h4 class="list-group-item-heading">Date ' + tx_status + '</h4> <p class="list-group-item-text">' + moment.unix(tx.time_finalized).format(date_format) + '</p></div>';
        list_items += '<div class="list-group-item"> <h4 class="list-group-item-heading">' + tx_status + ' By</h4> <p class="list-group-item-text">' + tx.finalized_by + '</p></div>';
        if (tx.is_executed) {
            var panel_color = "list-group-item-danger";
            if (tx.execution_successful) panel_color = "list-group-item-success";
            list_items += '<div class="list-group-item ' + panel_color + '"> <h4 class="list-group-item-heading">Execution Successful</h4> <p class="list-group-item-text">' + tx.execution_successful + '</p></div>';
        }
    } else {
        var time_until = Math.round(Math.max(0, tx.time_initiated - (Date.now() / 1000) + initiator.waiting_time));
        if (time_until == 0) {
            list_items += '<div class="list-group-item list-group-item-success"> <p class="list-group-item-text">Can be executed now</p></div>';
        } else {
            list_items += '<div class="list-group-item list-group-item-danger"> <p class="list-group-item-text"> Can be executed in around ' + moment.duration(time_until, "seconds").humanize() + ' (' + time_until + ' seconds)</p></div>';
        }
        buttons += '<div class="btn-group">';
        buttons += '<button type="button" class="btn btn-default" id="btn_finalize_transaction">Finalize Transaction</button>';
        buttons += '<button type="button" class="btn btn-default" id="btn_cancel_transaction">Cancel Transaction</button>';
        buttons += '</div>';
    }

    return '<div class="panel panel-' + panel_status + '"> <div class="panel-heading">' + title + '</div> <div class="panel-body"> <div class="list-group">' + list_items + '</div>' + buttons + '</div> </div>';

}

var constructUserObject = function(address, userContent) {
    var obj = {
        address: address,
        waiting_time: userContent[0].toNumber(),
        added_by: userContent[1],
        time_added: userContent[2].toNumber(),
        removed_by: userContent[3],
        time_removed: userContent[4].toNumber(),
        time_added_another_user: userContent[5].toNumber()
    };
    return obj;
}

var constructUserHtml = function(obj, state) {
    var buttons = '';
    if (obj.time_removed == 0) {
        if (state == "cur_user") {
            buttons = '<button type="button" class="btn btn-default remove-user" address="' + obj.address + '">Remove Self</button>';
        } else {
            buttons = '<button type="button" class="btn btn-default remove-user" address="' + obj.address + '">Remove</button>';
        }
    }

    var waiting_time_str;
    if (obj.waiting_time < 60) {
        waiting_time_str = obj.waiting_time + " seconds";
    } else {
        waiting_time_str = 'Around ' + moment.duration(obj.waiting_time, "seconds").humanize() + ' (' + obj.waiting_time + ' seconds)';
    }
    var list_items = '';
    if (state == "cur_user") {
        if (obj.time_removed == 0) {
            list_items += '<div class="list-group-item list-group-item-success"> <h4 class="list-group-item-heading">Status</h4> <p class="list-group-item-text">Active</p></div>';
        } else {
            list_items += '<div class="list-group-item list-group-item-danger"> <h4 class="list-group-item-heading">Status</h4> <p class="list-group-item-text">Removed</p></div>';
        }
    }
    list_items += '<div class="list-group-item"> <h4 class="list-group-item-heading">Waiting Time</h4> <p class="list-group-item-text">' + waiting_time_str + '</p></div>';
    if (obj.added_by == "0x0000000000000000000000000000000000000000") {
        list_items += '<div class="list-group-item"> <h4 class="list-group-item-heading">Added By</h4> <p class="list-group-item-text">Nobody (original wallet creator) </p></div>';
    } else {
        list_items += '<div class="list-group-item"> <h4 class="list-group-item-heading">Added By</h4> <p class="list-group-item-text">' + obj.added_by + '</p></div>';
    }
    list_items += '<div class="list-group-item"> <h4 class="list-group-item-heading">Date Added</h4> <p class="list-group-item-text">' + moment.unix(obj.time_added).format(date_format) + '</p></div>';
    if (obj.time_removed == 0) {
        var time_until = Math.round(Math.max(0, obj.time_added - (Date.now() / 1000) + obj.waiting_time));
        if (time_until == 0) {
            list_items += '<div class="list-group-item list-group-item-success"> <p class="list-group-item-text">Can add another user now</p></div>';
        } else {
            list_items += '<div class="list-group-item list-group-item-danger"> <p class="list-group-item-text">Can add another user in around ' + moment.duration(time_until, "seconds").humanize() + ' (' + time_until + ' seconds)</p></div>';
        }
    } else {
        list_items += '<div class="list-group-item"> <h4 class="list-group-item-heading">Removed By</h4> <p class="list-group-item-text">' + obj.removed_by + '</p></div>';
        list_items += '<div class="list-group-item"> <h4 class="list-group-item-heading">Date Removed</h4> <p class="list-group-item-text">' + moment.unix(obj.time_removed).format(date_format) + '</p></div>';
    }

    var panel_type = "primary";
        if (obj.time_removed > 0) {
            panel_type = "danger";
    } else if (state == "weaker") {
        panel_type = "info";
    }

    if (state == "cur_user") {
        return '<div class="list-group">' + list_items + '</div>' + buttons;
    }
    return '<div class="panel panel-' + panel_type + '"> <div class="panel-heading">User: ' + obj.address + '</div> <div class="panel-body"> <div class="list-group">' + list_items + '</div>' + buttons + '</div> </div>';
}

var continueLoading = function(web3, wallet_address, wallet) {

    var old_users = [];
    var old_cur_user = "";
    var old_transactions = [];

    var isSame = function(old_array, new_array) {
        if (old_array.length != new_array.length) return false;
        for (var i = 0; i < new_array.length; i++) {
            if (JSON.stringify(old_array[i]) !== JSON.stringify(new_array[i])) return false;
        }
        return true;
    }

    var refreshTransactions = function(index, transactions, transactionInitiators, fn) {
        wallet.transactions(index, function(error, result) {
            if (result == null) {
                fn(null, transactions, transactionInitiators);
            } else {
                tx = constructTransactionObject(index, result);
                transactions.push(tx);
                wallet.users(tx.initiated_by, function(error, user_info) {
                    transactionInitiators.push(constructUserObject(tx.initiated_by, user_info));
                    refreshTransactions(index + 1, transactions, transactionInitiators, fn);
                });
            }
        });
    }

    var displayTransactions = function(error, transactions, transactionInitiators) {
        if (isSame(old_transactions, transactions)) return;
        $("#panel_transactions").empty();
        $("#out_transaction_count").text("Transaction Count: " + transactions.length);
        old_transactions = transactions;
        for (var i = transactions.length - 1; i >= 0; i--) {
            $("#panel_transactions").append(constructTransaction(transactions[i], transactionInitiators[i]));
        }
    }

    var compare_users = function(a, b) {
        return a.waiting_time - b.waiting_time;
    }

    var refreshUsers = function(index, users, fn) {
        wallet.userAddresses(index, function(error, user_address) {
            if (user_address == "0x") {
                fn(null, users);
            } else {
                wallet.users(user_address, function(error, result) {
                    users.push(constructUserObject(user_address, result));
                    refreshUsers(index + 1, users, fn);
                });
            }

        });
    }

    var displayUsers = function(error, users) {
        users.sort(compare_users);
        if (isSame(old_users, users) && old_cur_user == web3.eth.accounts[0]) return;
        old_users = users;
        old_cur_user = web3.eth.accounts[0];
        $("#panel_users").empty();
        $("#panel_removed_users").empty();
        $("#panel_current_user").empty();
        var cur_user = null;
        for (var i = 0; i < users.length; i++) {
            // find the current user
            if (users[i].address == web3.eth.accounts[0]) cur_user = users[i];
        }
        $("#panel_current_user_heading").html("<h4>Current User Address: " + web3.eth.accounts[0] + "</h4>");
        if (cur_user == null) {
            $("#panel_current_user").append("<h4>User Not Found</h4><p>Looks like you are not an active user of this wallet and can only view. You cannot perform any actions.</p>");
            for (var i = 0; i < users.length; i++) {
                if (users[i].time_removed > 0) {
                    $("#panel_removed_users").append(constructUserHtml(users[i]));
                } else {
                    $("#panel_users").append(constructUserHtml(users[i], "stronger"));
                }
            }
        } else {
            for (var i = 0; i < users.length; i++) {
                if (users[i].address == cur_user.address) {
                    $("#panel_current_user").append(constructUserHtml(users[i], "cur_user"));
                } else if (users[i].time_removed > 0) {
                    $("#panel_removed_users").append(constructUserHtml(users[i]));
                } else if (users[i].waiting_time < cur_user.waiting_time) {
                    $("#panel_users").append(constructUserHtml(users[i], "stronger"));
                } else {
                    $("#panel_users").append(constructUserHtml(users[i], "weaker"));
                }
            }
        }
    }

    var refresh = function() {
        var target_text = "Wallet Address: " + wallet_address;
        if ($("#out_wallet_address").text() != target_text) $("#out_wallet_address").text(target_text);
        wallet.balance(function(error, result) {
            var target_text = "Balance: " + web3.fromWei(result, 'ether') + " ETH";
            if ($("#out_balance").text() != target_text) $("#out_balance").text(target_text);
        });

        refreshTransactions(0, [], [], displayTransactions);
        refreshUsers(0, [], displayUsers);
    }

    setInterval(refresh, 1000);

   	$("#btn_initiate_transaction").click(function() {
        var dest = $("#inp_destination").val();
        var val = web3.toWei($("#inp_value").val(), 'ether');
        var data = $("#inp_data").val();
        wallet.initiateTransaction.estimateGas(dest, val, data, {from: web3.eth.accounts[0]}, function(error, result) {
            if (error || result > 3000000) {
                alert("Error.\n-You must be an active user of this wallet\n-There must be no pending transactions");
            } else {
                wallet.initiateTransaction(dest, val, data, {from: web3.eth.accounts[0]}, function(error, result) {
                    if (error) {
                        alert("Error: " + error);
                    } else {
                        console.log(result);
                    }
                });
            }
        });
    });

   	$("#btn_add_user").click(function() {
        var user_address = $("#inp_new_user_address").val();
        var waiting_time = $("#inp_new_user_waiting_time").val(); // TODO: make specifying this easier
        wallet.addUser.estimateGas(user_address, waiting_time, {from: web3.eth.accounts[0]}, function(error, result) {
            if (error || result > 3000000) {
                alert("Error.\n-You must be an active user of this wallet\n-The user you are trying to add must not already exist\n-The user you are trying to add must not have been removed\n-The waiting time of the user you are trying to add must be higher than or equal to your waiting time");
            } else {
                wallet.addUser(user_address, waiting_time, {from: web3.eth.accounts[0]}, function(error, result) {
                    if (error) {
                        alert("Error: " + error);
                    } else {
                        console.log(result);
                    }
                });
            }
        });
    });

    $('body').on('click', 'button.btn', function() {
        if ($(this).attr('id') == 'btn_finalize_transaction') {
            wallet.executeTransaction.estimateGas({from: web3.eth.accounts[0]}, function(error, result) {
                if (error || result > 3000000) {
                    alert("Error.\n-You must be an active user of this wallet\n-The waiting time of the user who initiated the transaction must have passed before it can be finalized");
                } else {
                    wallet.executeTransaction({from: web3.eth.accounts[0]}, function(error, result) {
                        if (error) {
                            alert("Error: " + error);
                        } else {
                            console.log(result);
                        }
                    });
                }
            });
        } else if ($(this).attr('id') == 'btn_cancel_transaction') {
            wallet.cancelTransaction.estimateGas({from: web3.eth.accounts[0]}, function(error, result) {
                wallet.cancelTransaction({from: web3.eth.accounts[0]}, function(error, result) {
                    if (error || result > 3000000) {
                        alert("Error.\n-You must be an active user of this wallet\n-Your waiting time must be lower than or equal to the waiting time of the transaction initiator");
                    } else {
                        if (error) {
                            alert("Error: " + error);
                        } else {
                            console.log(result);
                        }
                    }
                });
            });
        }
    });

    $('body').on('click', 'button.remove-user', function() {
        var user_address = $(this).attr('address');
        wallet.removeUser.estimateGas(user_address, {from: web3.eth.accounts[0]}, function(error, result) {
            if (error || result > 3000000) {
                alert("Error.\n-You must be an active user of this wallet\n-The user you are trying to remove must have a higher waiting time time than you");
            } else {
                wallet.removeUser(user_address, {from: web3.eth.accounts[0]}, function(error, result) {
                    if (error) {
                        alert("Error: " + error);
                    } else {
                        console.log(result);
                    }
                });
            }
        });
    });

    $("#btn_deposit").click(function() {
        var value = $("#inp_deposit_amount").val();
        web3.eth.sendTransaction({to: wallet.address, value: web3.toWei(value, 'ether')}, function(error, result) {
            if (error) {
                alert("Error: " + error);
            } else {
                console.log(result);
            }
        });
    });

    refresh();
}

var startApp = function(web3) {

    var wallet_address = getParameterByName("wallet_address");
    var wallet = getTrustWallet(web3, wallet_address, function(error, result) {
        if (error) {
            alert(error);
        } else {
            continueLoading(web3, wallet_address, result);
        }
    });
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

    getWeb3(startApp);

});
