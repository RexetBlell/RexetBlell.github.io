pragma solidity ^0.4.18;
contract TrustWallet {
    
    struct User {
        // How many seconds the user has to wait between initiating the
        // transaction and finalizing the transaction. This cannot be
        // changed.
        uint waiting_time;
        // If this account is currently active.
        bool is_active;
        // If this user was removed. This flag is here to make it impossible
        // to re-add a user after the user was removed.
        bool is_removed;
        // When this user was added.
        uint time_added;
        // Who created this user.
        address parent;
        // When this user added another user. (This is to prevent a user from
        // adding many users too quickly).
        uint time_added_another_user;
    }
    
    struct Transaction {
        address destination;
        uint value;
        bytes data;
        
        // Who initiated the transaction.
        address initiator;
        // When this transaction was initiated.
        uint time_initiated;
        // When this transaction was executed or canceled.
        uint time_finalized;
        // User that finalized this transaction
        address finalized_by;
        
        // True if this trasaction was executed.
        bool is_executed;
        // True if this trasaction was canceled.
        bool is_canceled;
    }
    
    mapping (uint => Transaction) public transactions;
    mapping (address => User) public users;
    address[] public userAddresses;
    uint public transactionCount;
    
    modifier onlyActiveUsersAllowed() {
        require(users[msg.sender].is_active);
        require(!users[msg.sender].is_removed);
        _; 
    }
    
    modifier transactionMustBePending() {
        require(isTransactionPending());
        _;
    }
    
    modifier transactionMustNotBePending() {
        require(!isTransactionPending());
        _;
    }
    
    // Returns true if there is a transaction pending. 
    function isTransactionPending() public constant returns (bool) {
        if (transactionCount == 0) return false;
        return transactions[transactionCount - 1].time_initiated > 0 &&
            !transactions[transactionCount - 1].is_executed &&
            !transactions[transactionCount - 1].is_canceled;
    }
    
    // Returns the balance of this contract.
    function balance() public constant returns (uint) {
        return address(this).balance;
    }
    
    // Constructor. Creates the first user.
    function TrustWallet(address first_user) public {
        users[first_user] = User({
            waiting_time: 0,
            is_active: true,
            is_removed: false,
            time_added: now,
            parent: 0x0,
            time_added_another_user: now
        });
        userAddresses.push(first_user);
    }
    
    function () public payable {}
    
    // Initiates a transaction. There must not be any pending transaction.
    function initiateTransaction(address _destination, uint _value, bytes _data)
        public
        onlyActiveUsersAllowed()
        transactionMustNotBePending()
    {
        transactions[transactionCount] = Transaction({
            destination: _destination,
            value: _value,
            data: _data,
            initiator: msg.sender,
            time_initiated: now,
            time_finalized: 0,
            finalized_by: 0x0,
            is_executed: false,
            is_canceled: false
        });
        transactionCount += 1;
    }
    
    // Executes the transaction. The waiting_time of the the transaction
    // initiator must have passed in order to call this function. Any active
    // user is able to call this function.
    function finalizeTransaction()
        public
        onlyActiveUsersAllowed()
        transactionMustBePending()
    {
        Transaction transaction = transactions[transactionCount - 1];
        require(now > transaction.time_initiated + users[transaction.initiator].waiting_time);
        transaction.is_executed = true;
        transaction.time_finalized = now;
        transaction.finalized_by = msg.sender;
        transaction.destination.call.value(transaction.value)(transaction.data);
    }
    
    // Cancels the transaction. The waiting_time of the user who is trying
    // to cancel must be lower or equal to the waiting_time of the
    // transaction initiator.
    function cancelTransaction()
        public
        onlyActiveUsersAllowed()
        transactionMustBePending()
    {
        // Users with a higher priority can do this
        Transaction transaction = transactions[transactionCount - 1];
        // Either the sender is a higher priority user
        require(users[msg.sender].waiting_time <= 
            users[transaction.initiator].waiting_time);
        transaction.is_canceled = true;
        transaction.time_finalized = now;
        transaction.finalized_by = msg.sender;
    }
    
    // Adds a user to the wallet. The waiting time of the new user must
    // be greater or equal to the waiting_time of the sender. A user that
    // already exists or was removed cannot be added. To prevent spam,
    // a user must wait waiting_time before adding another user.
    function addUser(address new_user, uint new_user_time)
        public
        onlyActiveUsersAllowed()
    {
        require(!users[new_user].is_removed);
        require(!users[new_user].is_active);
        
        User storage sender = users[msg.sender];
        require(now > sender.waiting_time + sender.time_added_another_user);
        require(new_user_time >= sender.waiting_time);
        
        sender.time_added_another_user = now;
        users[new_user] = User({
            waiting_time: new_user_time,
            is_active: true,
            is_removed: false,
            time_added: now,
            parent: msg.sender,
            // The new user will have to wait one waiting_time before being 
            // able to add a new user.
            time_added_another_user: now
        });
        userAddresses.push(new_user);
    }
    
    // Removes a user. The sender must have a lower or equal waiting_time
    // as the user that she is trying to remove.
    function removeUser(address userAddr)
        public
        onlyActiveUsersAllowed()
    {
        require(!users[userAddr].is_removed);
        require(users[userAddr].is_active);
        
        User storage sender = users[msg.sender];
        require(sender.waiting_time <= users[userAddr].waiting_time);

        users[userAddr].is_removed = true;
        users[userAddr].is_active = false;
    }
}

contract TrustWalletFactory {
    mapping (address => TrustWallet[]) public wallets;
    
    function createWallet() public {
        wallets[msg.sender].push(new TrustWallet(msg.sender));
    }
}
