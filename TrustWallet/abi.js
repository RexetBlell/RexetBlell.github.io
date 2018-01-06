var getTrustWalletFactory = function(web3, fn) {

    var contractABI = [{
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
    },
    {
        "constant": false,
        "inputs": [],
        "name": "createWallet",
        "outputs": [],
        "payable": false,
        "stateMutability": "nonpayable",
        "type": "function"
    }];


    var ropsten_address = "0x3287b89f553f903da1a0ec67e5eb184b5f4bc53b";
    var abstract_contract = web3.eth.contract(contractABI);

    web3.eth.getCode(ropsten_address, function(error, result) {
        if (!error && result.length == 8704) {
            var specific_contract = abstract_contract.at(ropsten_address);
            fn(null, specific_contract);
        } else {
            fn("No TrustWallet Factory contract found at this address: " + ropsten_address, null);
        }
    });
}

var getTrustWallet = function(web3, address, fn) {

    var contractABI = [{
        "constant": false,
        "inputs": [],
        "name": "executeTransaction",
        "outputs": [],
        "payable": false,
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
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
                "name": "initiated_by",
                "type": "address"
            },
            {
                "name": "time_initiated",
                "type": "uint256"
            },
            {
                "name": "finalized_by",
                "type": "address"
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
                "name": "execution_successful",
                "type": "bool"
            }
        ],
        "payable": false,
        "stateMutability": "view",
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
                "name": "added_by",
                "type": "address"
            },
            {
                "name": "time_added",
                "type": "uint256"
            },
            {
                "name": "removed_by",
                "type": "address"
            },
            {
                "name": "time_removed",
                "type": "uint256"
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
    if (address.length != 42) {
        fn("Address Invalid: " + address, null);
    } else {
        web3.eth.getCode(address, function(error, result) {
            if (!error && result.length == 6968) {
                var specific_contract = abstract_contract.at(address);
                fn(null, specific_contract);
            } else {
                fn("No TrustWallet contract found at this address: " + address, null);
            }
        });
    }
}
