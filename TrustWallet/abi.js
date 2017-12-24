var getTrustWalletFactory = function(web3) {

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

    var ropsten_address = "0x6d719c5df03aC5fcb73BB764EA60aD8f1886c644";
    var abstract_contract = web3.eth.contract(contractABI);
    var specific_contract = abstract_contract.at(ropsten_address);

    return specific_contract;
}

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
                "name": "finalized_by",
                "type": "address"
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
