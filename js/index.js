'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

// INITIAL SETUP
// Dungeon params
var gridHeight = 40;
var gridWidth = 60;
var maxRooms = 15;
var roomSizeRange = [5, 15];

// HELPER FUNCTIONS
// Generate random integer within range
function randomInt(_ref) {
  var _ref2 = _slicedToArray(_ref, 2),
      min = _ref2[0],
      max = _ref2[1];

  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Generate room object within size range
function randomRoom(range) {
  return { height: randomInt(range), width: randomInt(range) };
}

// Clamp number within range
function clamp(num, _ref3) {
  var _ref4 = _slicedToArray(_ref3, 2),
      min = _ref4[0],
      max = _ref4[1];

  return Math.min(Math.max(min, num), max);
}

// DUNGEON CREATION
// Generate the entire dungeon
var createDungeon = function createDungeon() {
  // Ensure room is within free space in grid
  var validRoomPlacement = function validRoomPlacement(grid, _ref5) {
    var x = _ref5.x,
        y = _ref5.y,
        _ref5$width = _ref5.width,
        width = _ref5$width === undefined ? 1 : _ref5$width,
        _ref5$height = _ref5.height,
        height = _ref5$height === undefined ? 1 : _ref5$height;

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
  var placeCells = function placeCells(grid, _ref6) {
    var x = _ref6.x,
        y = _ref6.y,
        _ref6$width = _ref6.width,
        width = _ref6$width === undefined ? 1 : _ref6$width,
        _ref6$height = _ref6.height,
        height = _ref6$height === undefined ? 1 : _ref6$height;
    var type = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 'floor';

    // Iterate over entire grid
    for (var i = y; i < y + height; i++) {
      for (var j = x; j < x + width; j++) {
        grid[i][j] = { type: type }; // Place cell
      }
    }
    // Return grid filled with cells
    return grid;
  };

  // Generate rooms in random positions
  var createRooms = function createRooms(grid, _ref7) {
    var x = _ref7.x,
        y = _ref7.y,
        width = _ref7.width,
        height = _ref7.height;
    var range = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : roomSizeRange;

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
  var newGrid = [];
  for (var i = 0; i < gridHeight; i++) {
    newGrid.push([]);
    for (var j = 0; j < gridWidth; j++) {
      newGrid[i].push({ type: 0, opacity: randomInt([40, 90]) / 100 });
    }
  }
  // Then, generate and place the first room
  var firstRoom = randomRoom(roomSizeRange);
  firstRoom.x = randomInt([1, gridWidth - roomSizeRange[1] - maxRooms]);
  firstRoom.y = randomInt([1, gridHeight - roomSizeRange[1] - maxRooms]);
  newGrid = placeCells(newGrid, firstRoom);
  // Finally, use firstRoom as seed to fill grid
  var growMap = function growMap(grid, seedRooms) {
    var counter = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 1;

    // Check to end recursion
    if (counter + seedRooms.length > maxRooms || !seedRooms.length) return grid;
    // Otherwise, create new room
    grid = createRooms(grid, seedRooms.pop());
    seedRooms.push.apply(seedRooms, _toConsumableArray(grid.placedRooms));
    counter += grid.placedRooms.length; // Update counter
    return growMap(grid.grid, seedRooms, counter); // Run recursively
  };
  // When createDungeon is called, run recursive growMap function
  return growMap(newGrid, [firstRoom]);
};

// Create all entities (characters, items, etc.)
var createEntities = function createEntities(gameMap) {
  var lvl = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 1;

  // Prepare to store player's initial position
  var playerPosition = [];
  // Bosses appear after Level 4
  var bosses = [];
  if (lvl === 4) bosses.push({ health: 400, lvl: 5, type: 'boss' });
  // Enemies attributes are based on level
  var enemies = [];
  for (var i = 0; i < 7; i++) {
    enemies.push({ health: lvl * 30 + 40, lvl: randomInt([Math.max(1, lvl - 1), lvl + 1]), type: 'enemy' });
  }
  // New exits appear before Level 4
  var exits = [];
  if (lvl < 4) exits.push({ type: 'exit' });
  // Create player
  var players = [{ type: 'player' }];
  // Create 5 potions
  var potions = [];
  for (var _i = 0; _i < 5; _i++) {
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
  for (var _i2 = 0; _i2 < 3; _i2++) {
    var weapon = Object.assign({}, availableWeapons[randomInt([1, availableWeapons.length]) - 1]);
    weapon.type = 'weapon';
    weapons.push(weapon);
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
  for (var _i3 = 0; _i3 < gameMap.length; _i3++) {
    for (var j = 0; j < gameMap[0].length; j++) {
      // Choose random floor opacity
      if (gameMap[_i3][j].type === 'floor') gameMap[_i3][j].opacity = randomInt([86, 90]) / 100;
      // Change door cell to floor cell
      if (gameMap[_i3][j].type === 'door') gameMap[_i3][j].type = 'floor';
    }
  }

  // Return newly created map, along with position of player
  return { entities: gameMap, playerPosition: playerPosition };
};

// REDUX
var BATCH_ACTIONS = 'BATCH_ACTIONS';
var ADD_WEAPON = 'ADD_WEAPON';
var ADD_XP = 'ADD_XP';
var CHANGE_ENTITY = 'CHANGE_ENTITY';
var CHANGE_HEALTH = 'CHANGE_HEALTH';
var CHANGE_PLAYER_POSITION = 'CHANGE_PLAYER_POSITION';
var CREATE_LVL = 'CREATE_LVL';
var NEW_MSG = 'NEW_MSG';
var RESTART = 'RESTART';
var SET_DUNGEON_LVL = 'SET_DUNGEON_LVL';
var TOGGLE_FOG_MODE = 'TOGGLE_FOG_MODE';

// Action Creators
var batchActions = function batchActions(actions) {
  return {
    type: BATCH_ACTIONS,
    payload: actions
  };
};

var addWeapon = function addWeapon(payload) {
  return {
    type: ADD_WEAPON,
    payload: payload
  };
};

var addXP = function addXP(payload) {
  return {
    type: ADD_XP,
    payload: payload
  };
};

var changeEntity = function changeEntity(entity, coords) {
  return {
    type: CHANGE_ENTITY,
    payload: { entity: entity, coords: coords }
  };
};

var changeHealth = function changeHealth(payload) {
  return {
    type: CHANGE_HEALTH,
    payload: payload
  };
};

var changePlayerPosition = function changePlayerPosition(payload) {
  return {
    type: CHANGE_PLAYER_POSITION,
    payload: payload
  };
};

var _createLvl = function _createLvl(lvl) {
  return {
    type: CREATE_LVL,
    payload: createEntities(createDungeon(), lvl)
  };
};

var newMsg = function newMsg(payload) {
  return {
    type: NEW_MSG,
    payload: payload
  };
};

var restart = function restart() {
  return {
    type: RESTART
  };
};

var _setDungeonLvl = function _setDungeonLvl(payload) {
  return {
    type: SET_DUNGEON_LVL,
    payload: payload
  };
};

var _toggleFogMode = function _toggleFogMode() {
  return {
    type: TOGGLE_FOG_MODE
  };
};

// Function to dispatch multiple actions efficiently
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

// Respond to player input
var _playerInput = function _playerInput(_ref8) {
  var _ref9 = _slicedToArray(_ref8, 2),
      vectorX = _ref9[0],
      vectorY = _ref9[1];

  return function (dispatch, getState) {
    var _getState = getState(),
        grid = _getState.grid,
        player = _getState.player;

    var _grid$playerPosition$ = grid.playerPosition.slice(0),
        _grid$playerPosition$2 = _slicedToArray(_grid$playerPosition$, 2),
        x = _grid$playerPosition$2[0],
        y = _grid$playerPosition$2[1]; // .slice(0)? Current position


    var newPosition = [x + vectorX, y + vectorY]; // Next position
    var newPlayer = grid.entities[y][x]; // Player on map
    var destination = grid.entities[y + vectorY][x + vectorX]; // What's in next position
    var actions = []; // Prepare to store actions for batching and dispatching
    // Allow player to move onto floor, potion, weapon, and exit spaces
    if (destination.type && destination.type !== 'enemy' && destination.type !== 'boss') {
      // Store entity and player-position changes
      actions.push(changeEntity({ type: 'floor' }, [x, y]), changeEntity(newPlayer, newPosition), changePlayerPosition(newPosition));
    }
    // Respond based on destination
    switch (destination.type) {
      case 'boss':
      case 'enemy':
        {
          var playerLvl = Math.floor(player.xp / 100);
          // Player attacks enemy
          var enemyDamage = Math.floor(player.weapon.damage * (randomInt([10, 13]) / 10) * playerLvl);
          destination.health -= enemyDamage;
          // If enemy is alive, it attacks player
          if (destination.health > 0) {
            var playerDamage = Math.floor(randomInt([4, 7]) * destination.lvl);
            // Store changes for batching and dispatching
            actions.push(changeEntity(destination, newPosition), changeHealth(player.health - playerDamage), newMsg('You attacked the ' + destination.type + ' and caused ' + enemyDamage + ' damage. The ' + destination.type + ' struck back for ' + playerDamage + ' of your health. The ' + destination.type + ' survived and has ' + destination.health + ' health remaining.'));
            // If player is dead, end and restart the game
            if (player.health - playerDamage <= 0) {
              dispatch(changeHealth(0));
              setTimeout(function () {
                return dispatch(_setDungeonLvl('death'));
              }, 250);
              setTimeout(function () {
                return dispatch(newMsg('Oh no! You\'re dead. Try again, if you dare.'));
              }, 1000);
              setTimeout(function () {
                return dispatch(batchActions([restart(), _createLvl(1), _setDungeonLvl(1)]));
              }, 6000);
              return;
            }
          }
          // If player wins the fight, respond accordingly
          if (destination.health <= 0) {
            // First, increase XP and move into the new position
            actions.push(addXP(10), changeEntity({ type: 'floor' }, [x, y]), changeEntity(newPlayer, newPosition), changePlayerPosition(newPosition), newMsg('You dealt ' + enemyDamage + ' damage and won the battle! Way to go!'));
            // If player defeats a boss, end and restart the game
            if (destination.type === 'boss') {
              setTimeout(function () {
                return dispatch(_setDungeonLvl('victory'));
              }, 250);
              setTimeout(function () {
                return dispatch(newMsg('Better yet, you beat the boss!'));
              }, 1000);
              setTimeout(function () {
                return dispatch(newMsg('...In other words, you won the game!'));
              }, 2000);
              setTimeout(function () {
                return dispatch(batchActions([restart(), _createLvl(1), _setDungeonLvl(1)]));
              }, 7000);
            } else {
              // If player defeats a regular enemy, continue the game
              setTimeout(function () {
                return dispatch(newMsg('You are 10 XP stronger.'));
              }, 2000);
              if ((player.xp + 10) % 100 === 0) {
                setTimeout(function () {
                  return dispatch(newMsg('You leveled up!'));
                }, 5000);
              }
            }
          }
          break;
        }
      // next cases
      default:
        break;
    }
    // Dispatch all of the actions in response to player input
    dispatch(batchActions(actions));
  };
};

// Opening messages at beginning of each game
var openingMessages = function openingMessages() {
  return function (dispatch) {
    dispatch(newMsg('Enter the dungeon!'));
    setTimeout(function () {
      return dispatch(newMsg('Explore, battle, and survive!'));
    }, 2000);
  };
};

// Restart the game
var _restartGame = function _restartGame() {
  return function (dispatch) {
    dispatch(newMsg('Restarting the game...'));
    setTimeout(function () {
      return dispatch(batchActions([restart(), _createLvl(1), _setDungeonLvl(1)]));
    }, 1000);
  };
};

// REACT COMPONENTS
var Cell = function Cell(_ref10) {
  var cell = _ref10.cell,
      distance = _ref10.distance,
      visible = _ref10.visible,
      zone = _ref10.zone;

  if (visible) {
    // Make faraway cells less visible
    cell.opacity = distance > 16 ? 0 : distance > 8 ? 250 / Math.pow(2, distance) : distance > 7 ? 0.7 : distance > 6 ? 0.9 : 1;
  }
  return React.createElement('div', {
    className: cell.type ? 'cell ' + cell.type : 'cell back-' + zone,
    style: { opacity: cell.opacity }
  });
};

var Header = function Header(_ref11) {
  var _ref11$lvl = _ref11.lvl,
      lvl = _ref11$lvl === undefined ? 1 : _ref11$lvl;
  return React.createElement(
    'div',
    { className: 'header-bg' },
    React.createElement(
      'h1',
      { className: 'header-' + lvl },
      'DC'
    )
  );
};

var Score = function Score(_ref12) {
  var iconClass = _ref12.iconClass,
      title = _ref12.title,
      value = _ref12.value;
  return React.createElement(
    'div',
    { className: 'score-item' },
    React.createElement('div', { className: 'icon cell ' + iconClass }),
    React.createElement(
      'span',
      { className: 'score-label' },
      title + ': ' + value
    )
  );
};

// COMPONENT: DUNGEON

var Dungeon = function (_React$Component) {
  _inherits(Dungeon, _React$Component);

  function Dungeon() {
    _classCallCheck(this, Dungeon);

    var _this = _possibleConstructorReturn(this, (Dungeon.__proto__ || Object.getPrototypeOf(Dungeon)).call(this));

    _this.handleKeyPress = function (e) {
      // Only respond during active game
      if (typeof _this.props.grid.dungeonLvl === 'number') {
        switch (e.keyCode) {
          // Up or W
          case 38:
          case 87:
            _this.props.playerInput([0, -1]);
            break;
          // Down or S
          case 40:
          case 83:
            _this.props.playerInput([0, 1]);
            break;
          // Left or A
          case 37:
          case 65:
            _this.props.playerInput([-1, 0]);
            break;
          // Right or D
          case 39:
          case 68:
            _this.props.playerInput([1, 0]);
            break;
          default:
        }
      }
    };

    _this.handleResize = function (e) {
      // Set initial viewport size
      _this.setState({
        vpWidth: e.target.innerWidth / _this.vpWidthRatio,
        vpHeight: Math.max(_this.vpHeightMin, e.target.innerHeight / _this.vpHeightRadio - _this.vpHeightOffset)
      });
    };

    _this.state = {
      vpWidth: 0,
      vpHeight: 0
    };

    _this.vpHeightOffset = 5;
    _this.vpHeightMin = 22;
    _this.vpHeightRatio = 21;
    _this.vpWidthRatio = 30;
    return _this;
  }

  _createClass(Dungeon, [{
    key: 'componentWillMount',
    value: function componentWillMount() {
      // Set initial viewport size
      this.setState({
        vpWidth: window.innerWidth / this.vpWidthRatio,
        vpHeight: Math.max(this.vpHeightMin, window.innerHeight / this.vpHeightRadio - this.vpHeightOffset)
      });
      // Set initial level
      this.props.createLvl();
      this.props.setDungeonLvl(1);
    }
  }, {
    key: 'componentDidMount',
    value: function componentDidMount() {
      window.addEventListener('keydown', this.handleKeyPress);
      window.addEventListener('resize', this.handleResize);
      this.props.triggerOpeningMessages();
    }
  }, {
    key: 'componentWillUnmount',
    value: function componentWillUnmount() {
      window.removeEventListener('keydown', this.handleKeyPress);
      window.removeEventListener('resize', this.handleResize);
    }

    // Handle user input


    // Handle window resizing

  }, {
    key: 'render',
    value: function render() {
      var _this2 = this;

      // Maintain even viewport width and height
      var vpWidth = this.state.vpWidth - this.state.vpWidth % 2;
      var vpHeight = this.state.vpHeight - this.state.vpHeight % 2;
      // Store props
      var entities = this.props.grid.entities;

      var _props$grid$playerPos = _slicedToArray(this.props.grid.playerPosition, 2),
          playerX = _props$grid$playerPos[0],
          playerY = _props$grid$playerPos[1];

      // Store viewport limits (to only display cells within viewport)


      var vpLimits = {
        top: clamp(playerY - vpHeight / 2, [0, entities.length - vpHeight]),
        right: Math.max(playerX + vpWidth / 2, vpWidth),
        bottom: Math.max(playerY + vpHeight / 2, vpHeight),
        left: clamp(playerX - vpWidth / 2, [0, entities[0].length - vpWidth])
      };

      // Create new array of entities with distance property (for fog mode)
      var newEntities = entities.map(function (row, i) {
        return row.map(function (cell, j) {
          // Calculate distance of cell from player
          cell.distance = Math.abs(playerY - i) + Math.abs(playerX - j);
          return cell;
        });
      });

      // Create all cells within viewport
      var cells = newEntities.filter(function (row, i) {
        return i >= vpLimits.top && i < vpLimits.bottom;
      }).map(function (row, i) {
        return React.createElement(
          'div',
          { key: 'row-' + i, className: 'row' },
          row.filter(function (r, j) {
            return i >= vpLimits.left && i < vpLimits.right;
          }).map(function (cell, k) {
            return React.createElement(Cell, {
              key: 'cell-' + k,
              cell: cell,
              distance: cell.distance,
              zone: _this2.props.grid.dungeonLvl,
              visible: _this2.props.fogMode
            });
          })
        );
      });
      return React.createElement(
        'div',
        { className: 'dungeon' },
        cells
      );
    }
  }]);

  return Dungeon;
}(React.Component);

var mapStateToDungeonProps = function mapStateToDungeonProps(_ref13) {
  var ui = _ref13.ui,
      grid = _ref13.grid,
      player = _ref13.player;
  return {
    fogMode: ui.fogMode,
    grid: grid,
    player: player
  };
};

var mapDispatchToDungeonProps = function mapDispatchToDungeonProps(dispatch) {
  return {
    playerInput: function playerInput(vector) {
      return dispatch(_playerInput(vector));
    },
    createLvl: function createLvl() {
      return dispatch(_createLvl());
    },
    setDungeonLvl: function setDungeonLvl(lvl) {
      return dispatch(_setDungeonLvl(lvl));
    },
    triggerOpeningMessages: function triggerOpeningMessages() {
      return dispatch(openingMessages());
    }
  };
};

var cDungeon = ReactRedux.connect(mapStateToDungeonProps, mapDispatchToDungeonProps)(Dungeon);

// TO-DO: Implement Tips

// COMPONENT: MESSAGE CENTER
var MessageCenter = function MessageCenter(_ref14) {
  var messages = _ref14.messages;
  return React.createElement(
    'div',
    { className: 'panel messages' },
    React.createElement(
      'ul',
      null,
      messages.slice(-3).map(function (msg, i) {
        return React.createElement(
          'li',
          { key: 'msg-' + i + '-' + msg },
          msg
        );
      })
    )
  );
};

var mapStateToMessageCenterProps = function mapStateToMessageCenterProps(_ref15) {
  var ui = _ref15.ui;
  return {
    messages: ui.messages
  };
};

var cMessageCenter = ReactRedux.connect(mapStateToMessageCenterProps)(MessageCenter);

// COMPONENT: SETTINGS

var Settings = function (_React$Component2) {
  _inherits(Settings, _React$Component2);

  function Settings() {
    var _ref16;

    var _temp, _this3, _ret;

    _classCallCheck(this, Settings);

    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    return _ret = (_temp = (_this3 = _possibleConstructorReturn(this, (_ref16 = Settings.__proto__ || Object.getPrototypeOf(Settings)).call.apply(_ref16, [this].concat(args))), _this3), _this3.handleKeyPress = function (e) {
      switch (e.keyCode) {
        // F for Fog Mode
        case 70:
          _this3.props.toggleFogMode();
          break;
        // R for Restart
        case 82:
          _this3.props.restartGame();
          break;
        default:
      }
    }, _temp), _possibleConstructorReturn(_this3, _ret);
  }

  _createClass(Settings, [{
    key: 'componentDidMount',
    value: function componentDidMount() {
      window.addEventListener('keydown', this.handleKeyPress);
    }
  }, {
    key: 'componentWillUnmount',
    value: function componentWillUnmount() {
      window.removeEventListener('keydown', this.handleKeyPress);
    }
  }, {
    key: 'render',
    value: function render() {
      var _props = this.props,
          fogMode = _props.fogMode,
          toggleFogMode = _props.toggleFogMode,
          restartGame = _props.restartGame;

      return React.createElement(
        'div',
        { className: 'panel' },
        React.createElement(
          'div',
          { className: 'score-item' },
          React.createElement('input', {
            onChange: toggleFogMode,
            id: 'toggleFogMode',
            type: 'checkbox',
            checked: fogMode
          }),
          React.createElement(
            'label',
            { htmlFor: 'toggle' },
            'Fog Mode'
          )
        ),
        React.createElement(
          'div',
          { className: 'score-item' },
          React.createElement('div', { onClick: restartGame, className: 'restart-btn' }),
          React.createElement(
            'span',
            { onClick: restartGame, className: 'setting-label' },
            'Restart'
          )
        )
      );
    }
  }]);

  return Settings;
}(React.Component);

var mapStateToSettingsProps = function mapStateToSettingsProps(_ref17) {
  var ui = _ref17.ui;
  return {
    fogMode: ui.fogMode
  };
};

var mapDispatchToSettingsProps = function mapDispatchToSettingsProps(dispatch) {
  return {
    toggleFogMode: function toggleFogMode() {
      return dispatch(_toggleFogMode());
    },
    restartGame: function restartGame() {
      return dispatch(_restartGame());
    }
  };
};

var cSettings = ReactRedux.connect(mapStateToSettingsProps, mapDispatchToSettingsProps)(Settings);

// TO-DO: Implement Scoreboard

var App = function App(props) {
  return React.createElement(
    'div',
    null,
    React.createElement(Header, null),
    React.createElement(
      'div',
      { id: 'app' },
      React.createElement(Dungeon, null),
      React.createElement(
        'div',
        { className: 'sidebar' },
        React.createElement(Settings, null),
        React.createElement(MessageCenter, null)
      )
    )
  );
};

var mapStateToAppProps = function mapStateToAppProps(_ref18) {
  var grid = _ref18.grid,
      player = _ref18.player;
  return { grid: grid, player: player };
};
var cApp = ReactRedux.connect(mapStateToAppProps)(App);

var dungeonInitialState = {
  entities: [[]],
  dungeonLvl: 0,
  playerPosition: []
};

var playerInitialState = {
  health: 100,
  xp: 100,
  weapon: {
    name: 'Pistol',
    damage: 13
  }
};

var messages = [];

var uiInitialState = {
  fogMode: true,
  messages: messages
};

// REDUCERS

var dungeonReducer = function dungeonReducer() {
  var state = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : dungeonInitialState;
  var _ref19 = arguments[1];
  var type = _ref19.type,
      payload = _ref19.payload;

  switch (type) {
    case CHANGE_ENTITY:
      {
        var _payload$coords = _slicedToArray(payload.coords, 2),
            x = _payload$coords[0],
            y = _payload$coords[1];

        var entities = React.addons.update(state.entities, _defineProperty({}, y, _defineProperty({}, x, { $set: payload.entity })));
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
};

var playerReducer = function playerReducer() {
  var state = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : playerInitialState;
  var _ref20 = arguments[1];
  var type = _ref20.type,
      payload = _ref20.payload;

  switch (type) {
    case ADD_WEAPON:
      return _extends({}, state, { weapon: payload });
    case ADD_XP:
      return _extends({}, state, { xp: state.xp + payload });
    case CHANGE_HEALTH:
      return _extends({}, state, { health: payload });
    case RESTART:
      return playerInitialState;
    default:
      return state;
  }
};

var uiReducer = function uiReducer() {
  var state = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : uiInitialState;
  var _ref21 = arguments[1];
  var type = _ref21.type,
      payload = _ref21.payload;

  switch (type) {
    case NEW_MSG:
      return _extends({}, state, { messages: [].concat(_toConsumableArray(state.messages), [payload]) });
    case TOGGLE_FOG_MODE:
      return _extends({}, state, { fogMode: !state.fogMode });
    case RESTART:
      return uiInitialState;
    default:
      return state;
  }
};

var reducers = Redux.combineReducers({ dungeonReducer: dungeonReducer, playerReducer: playerReducer, uiReducer: uiReducer });
var createStoreWithMiddleware = Redux.applyMiddleware(ReduxThunk.default)(Redux.createStore);
var _ReactRedux = ReactRedux,
    Provider = _ReactRedux.Provider;


ReactDOM.render(React.createElement(
  Provider,
  { store: createStoreWithMiddleware(enableBatching(reducers)) },
  React.createElement(App, null)
), document.getElementById('root'));
