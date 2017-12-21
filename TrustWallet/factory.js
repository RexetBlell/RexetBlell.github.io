var getTrustWalletFactory = function(web3) {

    var contractABI = [
	{
		"constant": false,
		"inputs": [],
		"name": "createWallet",
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
			},
			{
				"name": "",
				"type": "uint256"
			}
		],
		"name": "wallets",
		"outputs": [
			{
				"name": "",
				"type": "address"
			}
		],
		"payable": false,
		"stateMutability": "view",
		"type": "function"
	}];

    var address = "0x909b83bCaA261e5e025A8fA9E893366A8e9c1e99";
    var abstract_contract = web3.eth.contract(contractABI);
    var specific_contract = abstract_contract.at(address);

    return specific_contract;
}

var startApp = function(web3) {

    trustWalletFactory = getTrustWalletFactory(web3);
    /*
    trustWalletFactory.num_wallets(function(error, result) {
        alert(result);
    });
    */

    $("#btn_create_wallet").click(function() {
        trustWalletFactory.createWallet(function(error, result) {
            alert(web3.eth.getTransactionReceipt(result, function(error, result) {
                alert(error);
                alert(result);
            }));
        });
    });

    $("#btn_get_wallet").click(function() {
        trustWalletFactory.wallets(web3.eth.accounts[0], 0, function(error, result) {
            alert(result);
        });
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

    /*
    function startApp(web3) {
        alert("nice, app started");
    }
    */

    getWeb3(startApp);

});
