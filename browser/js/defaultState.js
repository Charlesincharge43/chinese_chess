var PIECE_GENERAL = 0;
var PIECE_GUARD = 1;
var PIECE_CAVALIER = 2;
var PIECE_ELEPHANT = 3;
var PIECE_CHARIOT = 4;
var PIECE_CANNON = 5;
var PIECE_SOLDIER = 6
var IN_PLAY = true;

// couple questions... why did the chess tutorial save it this way (json wise?)
// and 2, how do you even export this thing... i tried exporting initialState and got a weird can't parse error

const initialState =
{
    "black":
    {
      "CH1": {
          "piece": PIECE_CHARIOT,
          "x": 0,
          "y": 0,
          "status": IN_PLAY
      },

      "CAV1": {
          "piece": PIECE_CAVALIER,
          "x": 1,
          "y": 0,
          "status": IN_PLAY
      },
      "ELE1": {
          "piece": PIECE_ELEPHANT,
          "x": 2,
          "y": 0,
          "status": IN_PLAY
      },
      "GU1": {
          "piece": PIECE_GUARD,
          "x": 3,
          "y": 0,
          "status": IN_PLAY
      },
      "GEN": {
          "piece": PIECE_GENERAL,
          "x": 4,
          "y": 0,
          "status": IN_PLAY
      },
      "GU2": {
          "piece": PIECE_GUARD,
          "x": 5,
          "y": 0,
          "status": IN_PLAY
      },
      "ELE2": {
          "piece": PIECE_ELEPHANT,
          "x": 6,
          "y": 0,
          "status": IN_PLAY
      },
      "CAV2": {
          "piece": PIECE_CAVALIER,
          "x": 7,
          "y": 0,
          "status": IN_PLAY
      },
      "CH2": {
          "piece": PIECE_CHARIOT,
          "x": 8,
          "y": 0,
          "status": IN_PLAY
      },
      "CAN1": {
          "piece": PIECE_CANNON,
          "x": 1,
          "y": 2,
          "status": IN_PLAY
      },
      "CAN2": {
          "piece": PIECE_CANNON,
          "x": 7,
          "y": 2,
          "status": IN_PLAY
      },
      "SOL1": {
          "piece": PIECE_SOLDIER,
          "x": 0,
          "y": 3,
          "status": IN_PLAY
      },
      "SOL2": {
          "piece": PIECE_SOLDIER,
          "x": 2,
          "y": 3,
          "status": IN_PLAY
      },
      "SOL3": {
          "piece": PIECE_SOLDIER,
          "x": 4,
          "y": 3,
          "status": IN_PLAY
      },
      "SOL4": {
          "piece": PIECE_SOLDIER,
          "x": 6,
          "y": 3,
          "status": IN_PLAY
      },
      "SOL5": {
          "piece": PIECE_SOLDIER,
          "x": 8,
          "y": 3,
          "status": IN_PLAY
      }
    },

    "red":
    {
      "CH1": {
          "piece": PIECE_CHARIOT,
          "x": 0,
          "y": 9,
          "status": IN_PLAY
      },
      "CAV1": {
          "piece": PIECE_CAVALIER,
          "x": 1,
          "y": 9,
          "status": IN_PLAY
      },
      "ELE1": {
          "piece": PIECE_ELEPHANT,
          "x": 2,
          "y": 9,
          "status": IN_PLAY
      },
      "GU1": {
          "piece": PIECE_GUARD,
          "x": 3,
          "y": 9,
          "status": IN_PLAY
      },
      "GEN": {
          "piece": PIECE_GENERAL,
          "x": 4,
          "y": 9,
          "status": IN_PLAY
      },
      "GU2": {
          "piece": PIECE_GUARD,
          "x": 5,
          "y": 9,
          "status": IN_PLAY
      },
      "ELE2": {
          "piece": PIECE_ELEPHANT,
          "x": 6,
          "y": 9,
          "status": IN_PLAY
      },
      "CAV2": {
          "piece": PIECE_CAVALIER,
          "x": 7,
          "y": 9,
          "status": IN_PLAY
      },
      "CH2": {
          "piece": PIECE_CHARIOT,
          "x": 8,
          "y": 9,
          "status": IN_PLAY
      },
      "CAN1": {
          "piece": PIECE_CANNON,
          "x": 1,
          "y": 7,
          "status": IN_PLAY
      },
      "CAN2": {
          "piece": PIECE_CANNON,
          "x": 7,
          "y": 7,
          "status": IN_PLAY
      },
      "SOL1": {
          "piece": PIECE_SOLDIER,
          "x": 0,
          "y": 6,
          "status": IN_PLAY
      },
      "SOL2": {
          "piece": PIECE_SOLDIER,
          "x": 2,
          "y": 6,
          "status": IN_PLAY
      },
      "SOL3": {
          "piece": PIECE_SOLDIER,
          "x": 4,
          "y": 6,
          "status": IN_PLAY
      },
      "SOL4": {
          "piece": PIECE_SOLDIER,
          "x": 6,
          "y": 6,
          "status": IN_PLAY
      },
      "SOL5": {
          "piece": PIECE_SOLDIER,
          "x": 8,
          "y": 6,
          "status": IN_PLAY
      }
    }
};

// const initialState =
// {
//     black:
//     {
//       CH1: {
//           piece: PIECE_CHARIOT,
//           x: 0,
//           y: 0,
//           status: IN_PLAY
//       },
//
//       CAV1: {
//           piece: PIECE_CAVALIER,
//           x: 1,
//           y: 0,
//           status: IN_PLAY
//       },
//       ELE1: {
//           piece: PIECE_ELEPHANT,
//           x: 2,
//           y: 0,
//           status: IN_PLAY
//       },
//       GU1: {
//           piece: PIECE_GUARD,
//           x: 3,
//           y: 0,
//           status: IN_PLAY
//       },
//       GEN: {
//           piece: PIECE_GENERAL,
//           x: 4,
//           y: 0,
//           status: IN_PLAY
//       },
//       GU2: {
//           piece: PIECE_GUARD,
//           x: 5,
//           y: 0,
//           status: IN_PLAY
//       },
//       ELE2: {
//           piece: PIECE_ELEPHANT,
//           x: 6,
//           y: 0,
//           status: IN_PLAY
//       },
//       CAV2: {
//           piece: PIECE_CAVALIER,
//           x: 7,
//           y: 0,
//           status: IN_PLAY
//       },
//       CH2: {
//           piece: PIECE_CHARIOT,
//           x: 8,
//           y: 0,
//           status: IN_PLAY
//       },
//       CAN1: {
//           piece: PIECE_CANNON,
//           x: 1,
//           y: 2,
//           status: IN_PLAY
//       },
//       CAN2: {
//           piece: PIECE_CANNON,
//           x: 7,
//           y: 2,
//           status: IN_PLAY
//       },
//       SOL1: {
//           piece: PIECE_SOLDIER,
//           x: 0,
//           y: 3,
//           status: IN_PLAY
//       },
//       SOL2: {
//           piece: PIECE_SOLDIER,
//           x: 2,
//           y: 3,
//           status: IN_PLAY
//       },
//       SOL3: {
//           piece: PIECE_SOLDIER,
//           x: 4,
//           y: 3,
//           status: IN_PLAY
//       },
//       SOL4: {
//           piece: PIECE_SOLDIER,
//           x: 6,
//           y: 3,
//           status: IN_PLAY
//       },
//       SOL5: {
//           piece: PIECE_SOLDIER,
//           x: 8,
//           y: 3,
//           status: IN_PLAY
//       }
//     },
//
//     red:
//     {
//       CH1: {
//           piece: PIECE_CHARIOT,
//           x: 0,
//           y: 9,
//           status: IN_PLAY
//       },
//       CAV1: {
//           piece: PIECE_CAVALIER,
//           x: 1,
//           y: 9,
//           status: IN_PLAY
//       },
//       ELE1: {
//           piece: PIECE_ELEPHANT,
//           x: 2,
//           y: 9,
//           status: IN_PLAY
//       },
//       GU1: {
//           piece: PIECE_GUARD,
//           x: 3,
//           y: 9,
//           status: IN_PLAY
//       },
//       GEN: {
//           piece: PIECE_GENERAL,
//           x: 4,
//           y: 9,
//           status: IN_PLAY
//       },
//       GU2: {
//           piece: PIECE_GUARD,
//           x: 5,
//           y: 9,
//           status: IN_PLAY
//       },
//       ELE2: {
//           piece: PIECE_ELEPHANT,
//           x: 6,
//           y: 9,
//           status: IN_PLAY
//       },
//       CAV2: {
//           piece: PIECE_CAVALIER,
//           x: 7,
//           y: 9,
//           status: IN_PLAY
//       },
//       CH2: {
//           piece: PIECE_CHARIOT,
//           x: 8,
//           y: 9,
//           status: IN_PLAY
//       },
//       CAN1: {
//           piece: PIECE_CANNON,
//           x: 1,
//           y: 7,
//           status: IN_PLAY
//       },
//       CAN2: {
//           piece: PIECE_CANNON,
//           x: 7,
//           y: 7,
//           status: IN_PLAY
//       },
//       SOL1: {
//           piece: PIECE_SOLDIER,
//           x: 0,
//           y: 6,
//           status: IN_PLAY
//       },
//       SOL2: {
//           piece: PIECE_SOLDIER,
//           x: 2,
//           y: 6,
//           status: IN_PLAY
//       },
//       SOL3: {
//           piece: PIECE_SOLDIER,
//           x: 4,
//           y: 6,
//           status: IN_PLAY
//       },
//       SOL4: {
//           piece: PIECE_SOLDIER,
//           x: 6,
//           y: 6,
//           status: IN_PLAY
//       },
//       SOL5: {
//           piece: PIECE_SOLDIER,
//           x: 8,
//           y: 6,
//           status: IN_PLAY
//       }
//     }
// };

export default initialState;
//why couldn't export initialState work?
