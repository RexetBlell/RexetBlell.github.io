var constructWallet = function(wallet_address) {
    var button = '<a href="/wallet.html?wallet_address=' + wallet_address + '" type="button" class="btn btn-default btn-block btn-lg">' + wallet_address + '</a>';
    return button;
}

var addWallet = function(index, trustWalletFactory) {

    trustWalletFactory.wallets(web3.eth.accounts[0], index, function(error, wallet_address) {
        if (wallet_address != "0x") {
            $("#panel_wallets").append(constructWallet(wallet_address));
            addWallet(index + 1, trustWalletFactory)
        } else if (index == 0) {
            $("#panel_wallets").append("<h4>No wallets were created by this address</h4>");
        }
    });

}

var startApp = function(web3) {

    var trustWalletFactory = getTrustWalletFactory(web3);

    $("#btn_create_wallet").click(function() {
        trustWalletFactory.createWallet(function(error, result) {
            web3.eth.getTransactionReceipt(result, function(error, result) {
                alert(result);
            });
        });
    });

    var refresh = function() {
        $("#panel_wallets").empty();
        $("#panel_wallets_title").text("Wallets created by " + web3.eth.accounts[0]);
        addWallet(0, trustWalletFactory);
    }

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
