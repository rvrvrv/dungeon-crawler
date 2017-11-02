'use strict';

var _class, _temp;

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

// Initial dungeon params
var gridHeight = 30;
var gridWidth = 40;
var maxRooms = 15;
var roomSizeRange = [4, 14];

// Generate random integer within range
function randomInt(_ref) {
  var min = _ref[0];
  var max = _ref[1];

  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Generate room object within size range
function randomRoom(range) {
  return { height: randomInt(range), width: randomInt(range) };
}

// Generate the entire dungeon
var createDungeon = function createDungeon() {
  // Ensure room is within free space in grid
  var validRoomPlacement = function validRoomPlacement(grid, _ref2) {
    var x = _ref2.x;
    var y = _ref2.y;
    var _ref2$width = _ref2.width;
    var width = _ref2$width === undefined ? 1 : _ref2$width;
    var _ref2$height = _ref2.height;
    var height = _ref2$height === undefined ? 1 : _ref2$height;

    // Check grid borders
    if (x < 1 || y < 1 || x + width > grid[0].length - 1 || y + height > grid.length - 1) {
      return false;
    }
    // Check adjacent rooms
    for (var i = y - 1; i < y + height; i++) {
      for (var j = x - 1; j < x + width; j++) {
        if (grid[i][j].type === 'floor') return false;
      }
    }
    // If no conflicts, return true
    return true;
  };

  // Place cells in the grid
  var placeCells = function placeCells(grid, _ref3) {
    var x = _ref3.x;
    var y = _ref3.y;
    var _ref3$width = _ref3.width;
    var width = _ref3$width === undefined ? 1 : _ref3$width;
    var _ref3$height = _ref3.height;
    var height = _ref3$height === undefined ? 1 : _ref3$height;
    var id = _ref3.id;
    var type = arguments.length <= 2 || arguments[2] === undefined ? 'floor' : arguments[2];

    // Iterate over entire grid
    for (var i = y; i < y + height; i++) {
      for (var j = x; j < x + width; j++) {
        grid[i][j] = { type: type, id: id }; // Place cell
      }
    }
    // Return grid filled with cells
    return grid;
  };

  // Generate rooms in random positions
  var createRooms = function createRooms(grid, _ref4) {
    var x = _ref4.x;
    var y = _ref4.y;
    var width = _ref4.width;
    var height = _ref4.height;
    var range = arguments.length <= 2 || arguments[2] === undefined ? roomSizeRange : arguments[2];

    // Room values for each side of seed room
    var roomValues = [];
    // North (top) side
    var north = randomRoom(range);
    north.x = randomInt([x, x + (width - 1)]);
    north.y = y - north.height - 1;
    north.doorX = randomInt([north.x, Math.min(north.x + north.width, x + width) - 1]);
    north.doorY = y - 1;
    // East (right) side
    var east = randomRoom(range);
    east.x = x + width + 1;
    east.y = randomInt([y, height + (y - 1)]);
    east.doorX = east.x - 1;
    east.doorY = randomInt([east.y, Math.min(east.y + east.height, y + height) - 1]);
    // South (bottom) side
    var south = randomRoom(range);
    south.x = randomInt([x, x + (width - 1)]);
    south.y = y + height + 1;
    south.doorX = randomInt([south.x, Math.min(south.x + south.width, x + width) - 1]);
    south.doorY = y + height;
    // West (left) side
    var west = randomRoom(range);
    west.x = x - west.width - 1;
    west.y = randomInt([y, height + (y - 1)]);
    west.doorX = x - 1;
    west.doorY = randomInt([west.y, Math.min(west.y + west.height, y + height) - 1]);
    // Place all four room sides into roomValues array
    roomValues.push(north, east, south, west);
    // Attempt to place all rooms in grid
    var placedRooms = [];
    roomValues.forEach(function (room) {
      // If room placement is valid, add it to the grid
      if (validRoomPlacement(grid, room)) {
        // Place entire room in grid
        grid = placeCells(grid, room);
        // Place door to connect rooms
        grid = placeCells(grid, { x: room.doorX, y: room.doorY }, 'door');
        placedRooms.push(room); // Update placedRooms for next seed
      }
    });
    return { grid: grid, placedRooms: placedRooms };
  };

  // BUILD THE MAP
  // First, generate grid of empty cells with random opacity
  var grid = [];
  for (var i = 0; i < gridHeight; i++) {
    grid.push([]);
    for (var j = 0; j < gridWidth; j++) {
      grid[i].push({ type: 0, opacity: randomInt([40, 90]) / 100 });
    }
  }
  // Then, generate and place the first room
  var firstRoom = randomRoom(roomSizeRange);
  firstRoom.x = randomInt([1, gridWidth - roomSizeRange[1] - maxRooms]);
  firstRoom.y = randomInt([1, gridHeight - roomSizeRange[1] - maxRooms]);
  grid = placeCells(grid, firstRoom);
  // Finally, use firstRoom as seed to fill grid
  var growMap = function growMap(grid, seedRooms) {
    var counter = arguments.length <= 2 || arguments[2] === undefined ? 1 : arguments[2];

    // Check to end recursion
    if (counter + seedRooms.length > maxRooms || !seedRooms.length) return grid;
    // Otherwise, create new room
    grid = createRooms(grid, seedRooms.pop());
    seedRooms.push.apply(seedRooms, grid.placedRooms);
    counter += grid.placedRooms.length; // Update counter
    return growMap(grid.grid, seedRooms, counter); // Run recursively
  };
  // When createDungeon is called, run recursive growMap function
  return growMap(grid, [firstRoom]);
};

// Create all entities (characters, items, etc.)
var createEntities = function createEntities(gameMap) {
  var lvl = arguments.length <= 1 || arguments[1] === undefined ? 1 : arguments[1];

  // Prepare to store player's initial position
  var playerPosition = [];
  // Bosses appear after Level 4
  var bosses = [];
  if (lvl === 4) bosses.push({ health: 400, level: 5, type: 'boss' });
  // Enemies attributes are based on level
  var enemies = [];
  for (var i = 0; i < 7; i++) {
    enemies.push({ health: lvl * 30 + 40, level: randomInt([Math.max(1, lvl - 1), lvl + 1]), type: 'enemy' });
  }
  // New exits appear before Level 4
  var exits = [];
  if (lvl < 4) exits.push({ type: 'exit' });
  // Create player
  var players = [{ type: 'player' }];
  // Create 5 potions
  var potions = [];
  for (var i = 0; i < 5; i++) {
    potions.push({ type: 'potion' });
  }
  // Define weapon types
  var weaponTypes = [{ name: 'Pistol', damage: 13 }, { name: 'Rifle', damage: 17 }, { name: '2x Pistol', damage: 26 }, { name: '2x Rifle', damage: 34 }, { name: 'Shotgun', damage: 38 }, { name: 'Rail Gun', damage: 42 }, { name: 'Cannon', damage: 46 }, { name: 'Monster Blaster', damage: 50 }];
  // Limit list of available weapons to current level
  var availableWeapons = weaponTypes.filter(function (weapon) {
    return weapon.damage < lvl * 10 + 10 && weapon.damage > lvl * 10 - 10;
  });
  var weapons = [];
  // Randomly generate 3 available weapons
  for (var i = 0; i < 3; i++) {
    weapons.push(_extends({}, availableWeapons[randomInt([1, availableWeapons.length]) - 1], { type: 'weapon' }));
  }

  // Place entities on open floor cells
  [bosses, enemies, exits, players, potions, weapons].forEach(function (entities) {
    // Iterate over each entity
    while (entities.length) {
      // Get random x,y coordinates
      var x = randomInt([1, gridWidth]) - 1;
      var y = randomInt([1, gridHeight]) - 1;
      // If random coordinates represent a floor cell, continue
      if (gameMap[y][x].type === 'floor') {
        // If applicable, store player's position
        if (entities[0].type === 'player') playerPosition = [x, y];
        // Place entity on cell
        gameMap[y][x] = entities.pop();
      }
    }
  });

  // Update floors and doors
  for (var i = 0; i < gameMap.length; i++) {
    for (var j = 0; j < gameMap[0].length; j++) {
      // Choose random floor opacity
      if (gameMap[i][j].type === 'floor') gameMap[i][j].opacity = randomInt([86, 90]) / 100;
      // Change door cell to floor cell
      if (gameMap[i][j].type === 'door') gameMap[i][j].type = 'floor';
    }
  }

  // Return newly created map, along with position of player
  return { entities: gameMap, playerPosition: playerPosition };
};

// REDUX
var BATCH_ACTIONS = 'BATCH_ACTIONS';
var CHANGE_ENTITY = 'CHANGE_ENTITY';
var CHANGE_PLAYER_POSITION = 'CHANGE_PLAYER_POSITION';
var CREATE_LVL = 'CREATE_LVL';
var SET_DUNGEON_LVL = 'SET_DUNGEON_LVL';

var initialState = {
  entities: [[]],
  dungeonLvl: 0,
  playerPosition: []
};

// Reducer
function createBoard() {
  var state = arguments.length <= 0 || arguments[0] === undefined ? initialState : arguments[0];
  var _ref5 = arguments[1];
  var type = _ref5.type;
  var payload = _ref5.payload;

  switch (type) {
    case CHANGE_ENTITY:
      {
        var _y, _React$addons$update;

        // Create a new entity
        var _payload$coords = payload.coords;
        var x = _payload$coords[0];
        var y = _payload$coords[1];

        var entities = React.addons.update(state.entities, (_React$addons$update = {}, _React$addons$update[y] = (_y = {}, _y[x] = { $set: payload.entity }, _y), _React$addons$update));
        return _extends({}, state, { entities: entities });
      }
    case CHANGE_PLAYER_POSITION:
      {
        return _extends({}, state, { playerPosition: payload });
      }
    case CREATE_LVL:
      {
        return _extends({}, state, {
          playerPosition: payload.playerPosition,
          entities: payload.entities
        });
      }
    case SET_DUNGEON_LVL:
      {
        return _extends({}, state, { dungeonLvl: payload });
      }
    default:
      return state;
  }
}

// Actions
var changeEntity = function changeEntity(entity, coords) {
  return {
    type: CHANGE_ENTITY,
    payload: { entity: entity, coords: coords }
  };
};

var changePlayerPosition = function changePlayerPosition(payload) {
  return {
    type: CHANGE_PLAYER_POSITION,
    payload: payload
  };
};

var createLvl = function createLvl(lvl) {
  return {
    type: CREATE_LVL,
    payload: createEntities(createDungeon(), lvl)
  };
};

var setDungeonLvl = function setDungeonLvl(payload) {
  return {
    type: SET_DUNGEON_LVL,
    payload: payload
  };
};

var batchActions = function batchActions(actions) {
  return {
    type: BATCH_ACTIONS,
    payload: actions
  };
};

// Function dispatch multiple actions efficiently
function enableBatching(reducer) {
  return function batchingReducer(state, action) {
    switch (action.type) {
      case BATCH_ACTIONS:
        return action.payload.reduce(reducer, state);
      default:
        return reducer(state, action);
    }
  };
}
// Create initial store and set game to Level 1
var store = Redux.createStore(enableBatching(createBoard));
store.dispatch(createLvl(1));
store.dispatch(setDungeonLvl(1));

var App = (_temp = _class = function (_React$Component) {
  _inherits(App, _React$Component);

  function App() {
    _classCallCheck(this, App);

    return _possibleConstructorReturn(this, _React$Component.apply(this, arguments));
  }

  // Respond to player input

  App.prototype.componentDidMount = function componentDidMount() {
    var _this2 = this;

    // Listen for keypress
    window.addEventListener('keydown', App.keydown);
    // Re-render after each store update
    this.unsubscribe = store.subscribe(function () {
      return _this2.forceUpdate();
    });
  };

  // Capture user input

  App.prototype.componentWillUnmount = function componentWillUnmount() {
    // Upon unmount, remove event listener and unsubscribe
    window.removeEventListener('keydown', App.keydown);
    this.unsubscribe();
  };

  App.prototype.render = function render() {
    var _store$getState = store.getState();

    var entities = _store$getState.entities;
    var playerPosition = _store$getState.playerPosition;

    return React.createElement(
      'div',
      { className: 'app' },
      React.createElement(Dungeon, {
        entities: entities,
        playerPosition: playerPosition
      })
    );
  };

  return App;
}(React.Component), _class.playerInput = function (vector) {
  var state = store.getState();
  var _state$playerPosition = state.playerPosition;
  var x = _state$playerPosition[0];
  var y = _state$playerPosition[1];
  var vectorX = vector[0];
  var vectorY = vector[1];

  var newPosition = [x + vectorX, y + vectorY];
  var newPlayer = state.entities[y][x];
  var destination = state.entities[y + vectorY][x + vectorX];
  // Allow player to move onto floor, potion, weapon, and exit spaces
  if (destination.type && destination.type !== 'enemy' && destination.type !== 'boss') {
    // Perform entity and player-position changes via batchActions
    store.dispatch(batchActions([changeEntity({ type: 'floor' }, [x, y]), changeEntity(newPlayer, newPosition), changePlayerPosition(newPosition)]));
  }
}, _class.keydown = function (e) {
  switch (e.keyCode) {
    // Up or W
    case 38:
    case 87:
      App.playerInput([0, -1]);
      break;
    // Down or S
    case 40:
    case 83:
      App.playerInput([0, 1]);
      break;
    // Left or A
    case 37:
    case 65:
      App.playerInput([-1, 0]);
      break;
    // Right or D
    case 39:
    case 68:
      App.playerInput([1, 0]);
      break;
    default:
  }
}, _temp);

// Dungeon

var Dungeon = function Dungeon(props) {
  var entities = props.entities;
  var playerPosition = props.playerPosition;
  var x = playerPosition[0];
  var y = playerPosition[1];
  // Fog mode

  entities.map(function (row, i) {
    return row.map(function (cell, j) {
      // Calculate distance of cell from player
      var dist = Math.abs(y - i) + Math.abs(x - j);
      // Make faraway cells less visible
      cell.opacity = dist > 16 ? 0 : dist > 8 ? 250 / Math.pow(2, dist) : dist > 7 ? 0.7 : dist > 6 ? 0.9 : 1;
      return cell;
    });
  });

  var cells = entities.map(function (entity, eIdx) {
    return React.createElement(
      'div',
      { className: 'row', key: 'row-' + eIdx },
      entity.map(function (cell, cIdx) {
        return React.createElement(
          'div',
          {
            className: cell.type ? 'cell ' + cell.type : 'cell',
            style: { opacity: cell.opacity },
            key: 'cell-' + cIdx
          },
          cell.id
        );
      })
    );
  });
  return React.createElement(
    'div',
    { className: 'flex-container' },
    cells
  );
};

ReactDOM.render(React.createElement(App, null), document.getElementById('container'));
