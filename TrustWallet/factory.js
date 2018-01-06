var constructWallet = function(wallet_address) {
    var button = '<a href="wallet.html?wallet_address=' + wallet_address + '" type="button" class="btn btn-default btn-block btn-lg">' + wallet_address + '</a>';
    return button;
}

var addWallet = function(index, trustWalletFactory, address_list, fn) {

    trustWalletFactory.wallets(web3.eth.accounts[0], index, function(error, wallet_address) {
        if (wallet_address != "0x") {
            address_list.push(wallet_address);
            addWallet(index + 1, trustWalletFactory, address_list, fn)
        } else {
            fn(null, address_list);
        }
    });
}

var startApp = function(web3) {
    var trustWalletFactory = getTrustWalletFactory(web3);

    $("#btn_find_wallet").click(function() {
        window.location.href = "wallet.html?wallet_address=" + $("#inp_wallet_address").val();
    });

    $("#btn_create_wallet").click(function() {
        trustWalletFactory.createWallet(function(error, result) {
            if (error) {
                alert(error);
            } else {
                console.log(result);
            }
        });
    });

    var address_list = null;

    var refresh = function() {
        var target_text = "Wallets created by " + web3.eth.accounts[0];
        if ($("#panel_wallets_title").text() != target_text) {
            $("#panel_wallets_title").text(target_text);
        }
        addWallet(0, trustWalletFactory, [], function(error, result) {
            if (address_list == null || result.length != address_list.length) {
                address_list = result;
                $("#panel_wallets").empty();
                if (address_list.length == 0) {
                    $("#panel_wallets").append("<h4>No wallets were created by this address</h4><p>Start by creating a new wallet, or finding a link to an existing one.</p>");
                } else {
                    for (var i = 0; i < address_list.length; i++) {
                        $("#panel_wallets").append(constructWallet(address_list[i]));
                    }
                }
            }
        });
    }

    refresh();
    setInterval(refresh, 1000);
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
