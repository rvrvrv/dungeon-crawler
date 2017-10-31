'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

// Initial room params
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
        grid = placeCells(grid, room); // Place room in grid
        grid = placeCells(grid, { x: room.doorX, y: room.doorY }, 'door'); // Place door
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
  var potions = Array(5).fill({ type: 'potion' });
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

  // Replace door cells with floor cells
  for (var i = 0; i < gameMap.length; i++) {
    for (var j = 0; j < gameMap[0].length; j++) {
      if (gameMap[i][j].type === 'door') gameMap[i][j].type = 'floor';
    }
  }

  // Return newly created map, along with position of player
  return { entities: gameMap, playerPosition: playerPosition };
};

// Redux store
var dungeon = createDungeon();
var firstStore = {
  entities: createEntities(dungeon)
};

// Dungeon
var Dungeon = function Dungeon(props) {
  var _props$entities = props.entities;
  var entities = _props$entities.entities;
  var playerPosition = _props$entities.playerPosition;
  var playerX = playerPosition[0];
  var playerY = playerPosition[1];

  var cells = entities.map(function (e, eIdx) {
    return React.createElement(
      'div',
      { className: 'row', key: Date.now() + eIdx },
      e.map(function (cell, i) {
        return React.createElement(
          'div',
          {
            className: cell.type ? 'cell ' + cell.type : 'cell',
            style: { opacity: cell.opacity },
            key: 'cell-' + i
          },
          cell.id
        );
      })
    );
  });
  return React.createElement(
    'div',
    { className: 'app' },
    React.createElement(
      'div',
      { className: 'flex-container' },
      cells
    )
  );
};

ReactDOM.render(React.createElement(Dungeon, { entities: firstStore.entities }), document.getElementById('container'));
