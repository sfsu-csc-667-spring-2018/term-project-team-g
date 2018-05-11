$(function () {

  // $('#play-card').hide();
  roomId = parseInt($('#room-id').val());
  userId = parseInt($('#user-id').val());

  //=================== SOCKET CONNECTIONS ====================
  var socket = io.connect('/gameroom', {query: `id=${roomId}`});
  
  // Room Created signal
  socket.emit('joined room', {room_id: roomId, user_id: userId});

  // Start Game
  $('#start-button').on('click', function() {
    socket.emit('start game', {room_id: roomId, user_id: userId});
    // socket.emit('get hand', {user_id: userId, room_id: roomId});
    // $('#play-card').show();          
    // $('#start-button').hide();
  });

  socket.on('game started', function() {
    $('#start-button').hide();
  });

  // Play a card
  $('#my-hand').on('dblclick', function(event) {
    let card = event.target.id.split('_');
    selectedCard = {
      symbol: card[1],
      color: card[0]
    }
    socket.emit('play card', {user_id: userId, room_id: roomId, card: selectedCard});
    // console.log(event.target.id);
    // $(`#${event.target.id}`).remove();
    // console.log(selectedCard);
    // socket.emit('play card', {room_id: roomId, user_id: userId, card: selectedCard})
  });

  $('#draw-card').on('click', function() {
    socket.emit('draw card', {user_id: userId, room_id: roomId});
  });

  $('#pass-turn').on('click', function() {
    socket.emit('pass turn', {room_id: roomId});
  });

  socket.on('change turn', function(data) {
    $('#turn-indicator').html(`<h4 style="color:red"><strong>PLAYER ${data.username}'s TURN</strong></h4>`);
  });

  socket.on('card drawn', function(data) {
    let position = parseInt($('#my-hand img').last().css('left'));
    console.log(position);    
    $('#my-hand').append(`
      <img style="position: absolute; left: ${position+60}px" id="${data.card.color}_${data.card.symbol}" src="/images/${data.card.color}_${data.card.symbol}.png">
    `);
  });

  socket.on('add cards', function(data) {
    if(data.user_id ==  userId) {
      console.log("HANDololu: "+JSON.stringify(data.cards));
      data.cards.forEach((card) => {
        let position = parseInt($('#my-hand img').last().css('left'));
        $('#my-hand').append(`
          <img style="position: absolute; left: ${position+60}px" id="${card.color}_${card.symbol}" src="/images/${card.color}_${card.symbol}.png">
        `);
      });
    }
  });


  socket.on('hand', function(data) {
    if(data.user_id == userId) {
      let spaces = 0;
      $('#my-hand').html(`<h5 style="color: red">Player ${data.turn_number}</h5>`);
      data.hand.hand.forEach((card) => {
        $('#my-hand').append(`
          <img style="position: absolute; left: ${spaces}px" id="${card.color}_${card.symbol}" src="/images/${card.color}_${card.symbol}.png">
        `);
        spaces += 60;
      });
    } else {
      if(data.turn_number != undefined) {
        if($('#opponent-1').html() == "") {
          $(`#opponent-1`).html(`
            <img src="/images/card_back_alt.png">
            <p>Player ${data.username}: ${data.hand.hand.length} cards</p>
          `)  
        } else if($('#opponent-2').html() == "") {
          $(`#opponent-2`).html(`
            <img src="/images/card_back_alt.png">
            <p>Player ${data.username}: ${data.hand.hand.length} cards</p>
          `)
        } else {
          $(`#opponent-3`).html(`
            <img src="/images/card_back_alt.png">
            <p>Player ${data.username}: ${data.hand.hand.length} cards</p>
          `)
        }
      }
    }
  });

  // // Next Turn
  // socket.on('active turn', function(data) {
  //   if(data.user_id == userId) {
  //     $('#turn-indicator').show();
  //   } else {
  //     $('#turn-indicator').hide();        
  //   }
  // });

  // Update current card
  socket.on('new current card', function(data) {
    console.log("New Current card: " + data);
    $('#deck-container').html(`
      <img id="draw-deck" src="/images/card_back_alt.png">
      <img id="play-deck" src="/images/${data.current_card.color}_${data.current_card.symbol}.png">
    `)
  });

  socket.on('remove card', function(data) {
    if(data.user_id == userId) {
      $(`#${data.card.color}_${data.card.symbol}`).remove();
    }
  })

  socket.on('error', function(data) {
    if(data.user_id == userId) {
      console.log(data);
      let error_message;
      if(data.error == 'invalid') {
        error_message = "Sorry, that's an invalid card to play"
      } else if(data.error == 'outofturn') {
        error_message = "Sorry, you cannot play this card on other's turn"
      }
      console.log(error_message);
      $('#error').html(`
        <div class="alert alert-danger show fade center">
          ${error_message}
          <button type="button" class="close" data-dismiss="alert" aria-label="Close">
            <span aria-hidden="true">&times;</span>
          </button>
        </div>
      `);
    }
  });

  // Change Color
  socket.on('change color', function(data) {
    if(data.user_id == userId) {
      $('#my-hand').on('click', function(event) {
        let newColor = event.target.id.split('_')[0];
        console.log(newColor);
        socket.emit('new color', {color: newColor, room_id: roomId});
        $('#my-hand').off('click');
      });
    }  
  });

  socket.on('hello', function() {
    console.log("Awesome stuff");
  })
  //============================================================
  

});