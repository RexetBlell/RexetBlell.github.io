var date_format = "MMMM DD YYYY, HH:mm:ss";

var show_message = function(title, message) {
    $('#modal_title').text(title);
    $('#modal_body').html("<p>" + message + "</p>");
    $('#info_modal').modal('show');
}

var show_transaction_created = function(tx_hash) {
  show_message("Transaction Sent",
      "This might take a few minutes depending on the network conditions and the gas price you set. Transaction hash: " + tx_hash);
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
