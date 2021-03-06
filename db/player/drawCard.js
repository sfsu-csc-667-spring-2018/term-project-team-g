const database = require('../index');

const GET_HAND_QUERY = `SELECT hand from player 
  WHERE user_id = $1 and room_id = $2`;

const GET_DECK_QUERY = `SELECT deck from gameroom
  WHERE id = $1`;

const UPDATE_HAND_QUERY = `UPDATE player
  SET hand = $1
  WHERE user_id = $2 and room_id = $3`;

const UPDATE_DECK_QUERY = `UPDATE gameroom
  SET deck = $1
  WHERE id = $2`;

const drawCard = (user_id, room_id, num) => {
  return database
    .one(GET_DECK_QUERY, room_id)
    .then((data) => {
      const deck = data.deck.deck;
      return deck;
    }).then((deck)=>{
      const drawnCards = [];
      for(let i = 1; i<=num; i++) {
        drawnCards.push(deck.shift());
      }
      database.query(UPDATE_DECK_QUERY, [{deck}, room_id]);
      return drawnCards;
    }).then((drawnCards)=> {
      return database
        .one(GET_HAND_QUERY, [user_id, room_id])
        .then((data) => {
          // console.log(data);
          let hand = data.hand.hand;
          hand = hand.concat(drawnCards);
          return database
            .query(UPDATE_HAND_QUERY, [{hand}, user_id, room_id])
            .then(() => {
              console.log(num+" cards drawn");
              return drawnCards; });
        }).catch(error => {console.log("In drawCard.js: "+error.stack)});
    });
};

module.exports = drawCard;