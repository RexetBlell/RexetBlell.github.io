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
    } else {
        var time_until = Math.round(Math.max(0, tx.time_initiated - (Date.now() / 1000) + initiator.delay));
        if (time_until == 0) {
            list_items += '<div class="list-group-item list-group-item-success"> <p class="list-group-item-text">Can be executed now</p></div>';
        } else {
            var when_execute_str = "Can be executed " + moment.unix(tx.time_initiated + initiator.delay).format(date_format) + " (In around " + moment.duration(time_until, "seconds").humanize() + ")";
            list_items += '<div class="list-group-item list-group-item-danger"> <p class="list-group-item-text">' + when_execute_str + '</p></div>';
        }
        buttons += '<div class="btn-group">';
        buttons += '<button type="button" class="btn btn-default" id="btn_finalize_transaction">Execute Transaction</button>';
        buttons += '<button type="button" class="btn btn-default" id="btn_cancel_transaction">Cancel Transaction</button>';
        buttons += '</div>';
    }

    return '<div class="panel panel-' + panel_status + '"> <div class="panel-heading">' + title + '</div> <div class="panel-body"> <div class="list-group">' + list_items + '</div>' + buttons + '</div> </div>';

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

    var delay_str;
    if (obj.delay < 60) {
        delay_str = obj.delay + " seconds";
    } else {
        delay_str = 'Around ' + moment.duration(obj.delay, "seconds").humanize();
    }
    var list_items = '';
    if (state == "cur_user") {
        if (obj.time_removed == 0) {
            list_items += '<div class="list-group-item list-group-item-success"> <h4 class="list-group-item-heading">Status</h4> <p class="list-group-item-text">Active</p></div>';
        } else {
            list_items += '<div class="list-group-item list-group-item-danger"> <h4 class="list-group-item-heading">Status</h4> <p class="list-group-item-text">Removed</p></div>';
        }
    }
    list_items += '<div class="list-group-item"> <h4 class="list-group-item-heading">Delay</h4> <p class="list-group-item-text">' + delay_str + '</p></div>';
    if (obj.added_by == "0x0000000000000000000000000000000000000000") {
        list_items += '<div class="list-group-item"> <h4 class="list-group-item-heading">Added By</h4> <p class="list-group-item-text">Nobody (original wallet creator) </p></div>';
    } else {
        list_items += '<div class="list-group-item"> <h4 class="list-group-item-heading">Added By</h4> <p class="list-group-item-text">' + obj.added_by + '</p></div>';
    }
    list_items += '<div class="list-group-item"> <h4 class="list-group-item-heading">Date Added</h4> <p class="list-group-item-text">' + moment.unix(obj.time_added).format(date_format) + '</p></div>';
    if (obj.time_removed == 0) {
        var time_until = Math.round(Math.max(0, obj.time_added - (Date.now() / 1000) + obj.delay));
        if (time_until == 0) {
            list_items += '<div class="list-group-item list-group-item-success"> <p class="list-group-item-text">Can add another user now</p></div>';
        } else {
            list_items += '<div class="list-group-item list-group-item-danger"> <p class="list-group-item-text">Can add another user in around ' + moment.duration(time_until, "seconds").humanize() + '</p></div>';
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

    $("#btn_etherscan").click(function() {
        if (window.netId == 1) {
            window.location.href = "https://etherscan.io/address/" + wallet_address;
        } else if (window.netId == 3) {
            window.location.href = "https://ropsten.etherscan.io/address/" + wallet_address;
        } else {
            alert("You must be on Main Net or Ropsten.");
        }
    });

    var isSame = function(old_array, new_array) {
        if (old_array == null || new_array == null) return false;
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
        $("#out_transaction_count").text("Transaction Count: " + transactions.length);
        if (transactions.length == 0) {
            $("#panel_transactions").append("<p>No Transactions</p>");
        }
        var all_transactions = ''
        for (var i = transactions.length - 1; i >= 0; i--) {
            all_transactions += constructTransaction(transactions[i], transactionInitiators[i]);
        }
        if ($("#panel_transactions").html() != all_transactions) {
            $("#panel_transactions").html(all_transactions);
        }
    }

    var compare_users = function(a, b) {
        return a.delay - b.delay;
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

        var panel_users_new_content = "";
        var panel_removed_users_new_content = "";
        var panel_current_user_new_content = "";

        var cur_user = null;
        for (var i = 0; i < users.length; i++) {
            if (users[i].address == web3.eth.accounts[0]) cur_user = users[i];
        }
        var target_heading = "<h4>Current User Address: " + web3.eth.accounts[0] + "</h4>";
        if ($("#panel_current_user_heading").html() != target_heading) $("#panel_current_user_heading").html(target_heading);
        if (cur_user == null) {
            panel_current_user_new_content += "<h4>User Not Found</h4><p>Looks like you are not an active user of this wallet and can only view. You cannot perform any actions.</p>";
            for (var i = 0; i < users.length; i++) {
                if (users[i].time_removed > 0) {
                    panel_removed_users_new_content += constructUserHtml(users[i]);
                } else {
                    panel_users_new_content += constructUserHtml(users[i], "stronger");
                }
            }
        } else {
            for (var i = 0; i < users.length; i++) {
                if (users[i].address == cur_user.address) {
                    panel_current_user_new_content += constructUserHtml(users[i], "cur_user");
                } else if (users[i].time_removed > 0) {
                    panel_removed_users_new_content += constructUserHtml(users[i]);
                } else if (users[i].delay < cur_user.delay) {
                    panel_users_new_content += constructUserHtml(users[i], "stronger");
                } else {
                    panel_users_new_content += constructUserHtml(users[i], "weaker");
                }
            }
        }

        if ($("#panel_users").html() != panel_users_new_content) $("#panel_users").html(panel_users_new_content);
        if ($("#panel_removed_users").html() != panel_removed_users_new_content) $("#panel_removed_users").html(panel_removed_users_new_content);
        if ($("#panel_current_user").html() != panel_current_user_new_content) $("#panel_current_user").html(panel_current_user_new_content);
    }

    var refresh = function() {

        web3.version.getNetwork(function(error, netId) {
            if (error) {
                alert(error);
            } else {
                window.netId = netId;
            }
        });

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
                        show_transaction_created(result);
                        $("#inp_destination").val('');
                        $("#inp_value").val('');
                        $("#inp_data").val('');
                    }
                });
            }
        });
    });

   	$("#btn_add_user").click(function() {
        var user_address = $("#inp_new_user_address").val();
        if (user_address.length != 42) {
            alert("Enter a valid Ethereum address.");
            return;
        }
        var mult = 1;
        if ($("#inp_delay_units" ).val() == "minutes") {
            mult = 60;
        } else if ($("#inp_delay_units" ).val() == "hours") {
            mult = 3600;
        } else if ($("#inp_delay_units" ).val() == "days") {
            mult = 3600 * 24;
        } else if ($("#inp_delay_units" ).val() == "weeks") {
            mult = 3600 * 24 * 7;
        } else if ($("#inp_delay_units" ).val() == "months") {
            mult = 3600 * 24 * 30;
        } else if ($("#inp_delay_units" ).val() == "years") {
            mult = 3600 * 24 * 365;
        }
        var delay = $("#inp_new_user_delay").val() * mult;
        wallet.addUser.estimateGas(user_address, delay, {from: web3.eth.accounts[0]}, function(error, result) {
            if (error || result > 3000000) {
                alert("Error.\n-You must be an active user of this wallet\n-Your delay time must have passed since you added another user or since you were added to this wallet\n-The user you are trying to add must not already exist\n-The user you are trying to add must not have been removed\n-The delay time of the user you are trying to add must be higher than or equal to your delay time");
            } else {
                wallet.addUser(user_address, delay, {from: web3.eth.accounts[0]}, function(error, result) {
                    if (error) {
                        alert("Error: " + error);
                    } else {
                        show_transaction_created(result);
                        $("#inp_new_user_delay").val("");
                        $("#inp_new_user_address").val("");
                    }
                });
            }
        });
    });

    $('body').on('click', 'button.btn', function() {
        if ($(this).attr('id') == 'btn_finalize_transaction') {
            wallet.executeTransaction.estimateGas({from: web3.eth.accounts[0]}, function(error, result) {
                if (error || result > 3000000) {
                    alert("Error.\n-You must be an active user of this wallet\n-The delay time of the user who initiated the transaction must have passed before it can be finalized");
                } else {
                    wallet.executeTransaction({from: web3.eth.accounts[0]}, function(error, result) {
                        if (error) {
                            alert("Error: " + error);
                        } else {
                            show_transaction_created(result);
                        }
                    });
                }
            });
        } else if ($(this).attr('id') == 'btn_cancel_transaction') {
            wallet.cancelTransaction.estimateGas({from: web3.eth.accounts[0]}, function(error, result) {
                if (error || result > 3000000) {
                    alert("Error.\n-You must be an active user of this wallet\n-Your delay time must be lower than or equal to the delay time of the transaction initiator");
                } else {
                    wallet.cancelTransaction({from: web3.eth.accounts[0]}, function(error, result) {
                        if (error) {
                            alert("Error: " + error);
                        } else {
                            show_transaction_created(result);
                        }
                    });
                }
            });
        }
    });

    $('body').on('click', 'button.remove-user', function() {
        var user_address = $(this).attr('address');
        wallet.removeUser.estimateGas(user_address, {from: web3.eth.accounts[0]}, function(error, result) {
            if (error || result > 3000000) {
                alert("Error.\n-You must be an active user of this wallet\n-The user you are trying to remove must have a higher delay time time than you");
            } else {
                wallet.removeUser(user_address, {from: web3.eth.accounts[0]}, function(error, result) {
                    if (error) {
                        alert("Error: " + error);
                    } else {
                        show_transaction_created(result);
                    }
                });
            }
        });
    });

    $("#btn_deposit").click(function() {
        try {
            var value = web3.toWei($("#inp_deposit_amount").val(), 'ether');
            if (value == 0) {
                alert("Enter a deposit amount greater than zero");
                return;
            }
            web3.eth.sendTransaction({to: wallet.address, value: value}, function(error, result) {
                if (error) {
                    alert("Error: " + error);
                } else {
                    $("#inp_deposit_amount").val("");
                    show_transaction_created(result);
                }
            });
        } catch (err) {
            alert("You entered an invalid deposit amount.\n" + err);
        }
    });

    refresh();
}

var startApp = function(web3) {

    $("#btn_find_wallet").click(function() {
        window.location.href = "wallet.html?wallet_address=" + $("#inp_wallet_address").val();
    });

    web3.version.getNetwork(function(error, netId) {
        if (error) {
            alert(error);
        } else {
            window.netId = netId;
            var wallet_address = getParameterByName("wallet_address");
            var wallet = getTrustWallet(web3, wallet_address, function(error, result) {
                if (error) {
                    alert(error);
                } else {
                    continueLoading(web3, wallet_address, result);
                }
            });
        }
    });
}

$(function() {

    $('[data-toggle="tooltip"]').tooltip();

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
