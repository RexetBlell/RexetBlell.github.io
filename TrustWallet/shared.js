var date_format = "MMMM DD YYYY, HH:mm:ss";

var show_message = function(title, message_html) {
    $('#modal_title').text(title);
    $('#modal_body').html(message_html);
    $('#info_modal').modal('show');
}

var show_transaction_created = function(tx_hash) {
    var link = "";
    if (window.netId == 1) {
        link = '<a href="https://etherscan.io/tx/' + tx_hash + '">' + tx_hash + '</a>';
    } else if (window.netId == 3) {
        link = '<a href="https://ropsten.etherscan.io/tx/' + tx_hash + '">' + tx_hash + '</a>';
    }
    show_message("Transaction Sent",
      "<p>This might take a few minutes depending on the network conditions and the gas price you set. Transaction: " + link + "</p>");
}

var constructUserObject = function(address, userContent) {
    var obj = {
        address: address,
        delay: userContent[0].toNumber(),
        added_by: userContent[1],
        time_added: userContent[2].toNumber(),
        removed_by: userContent[3],
        time_removed: userContent[4].toNumber(),
        time_added_another_user: userContent[5].toNumber()
    };
    return obj;
}

$("#btn_instructions").click(function() {
    var title = "How to use the wallet";
    var message = "<p>This wallet protects you from losing your keys and from hackers. It also allows your family to claim your funds if you become incapacitated.</p>";
    message += "<p>The wallet should have several users, just like a multisig. The key idea is when a user initiates a transaction, she has to wait for some period of time before actually executing the transaction. The delay between initiating the transaction and executing it is unique to each user.</p>";
    message += "<p>Here’s how to use it practically. Add a key of your friend with a delay of 1 year. Add a key of some family member with a delay of 6 months. Add your hot wallet key (such as Metamask or Parity) with a delay of 2 months. Add your hardware wallet key (such as Ledger Nano S) with a delay of 2 weeks. Add your most secure key, such as a paper wallet and set the delay to 0. The idea is that the lower the security of the key, the higher the delay should be.</p>"
    message += "<p>If one of the keys gets hacked (or becomes malicious, in case of family or friend), you can always cancel their transactions (and remove that user), using a key with with a lower delay (which means it has more privileges). You would need to keep an eye on you wallet from time to time to make sure there are no unexpected pending transactions in it.</p>"
    message += "<p>If you forget some of your keys, you can still access your funds using your other keys. Even if you lose all of your keys, your friends/family can help recover your funds after a few months of waiting. If you become incapacitated, your family/friends can still access your funds.</p>"
    show_message(title, message);
});

$("#btn_find_wallet").click(function() {
    var target_address = $("#inp_wallet_address").val();
    if (target_address.length == 42) {
        window.location.href = "wallet.html?wallet_address=" + $("#inp_wallet_address").val();
    } else {
        alert("Please enter a valid address");
    }
});
