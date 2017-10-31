// Initial room params
const gridHeight = 30;
const gridWidth = 40;
const maxRooms = 15;
const roomSizeRange = [4, 14];

// Generate random integer within range
function randomInt([min, max]) {
  return Math.floor(Math.random() * ((max - min) + 1)) + min;
}

// Generate room object within size range
function randomRoom(range) {
  return { height: randomInt(range), width: randomInt(range) };
}

// Generate the entire dungeon
const createDungeon = () => {
  // Ensure room is within free space in grid
  const validRoomPlacement = (grid, { x, y, width = 1, height = 1 }) => {
    // Check grid borders
    if (
      x < 1 ||
      y < 1 ||
      x + width > grid[0].length - 1 ||
      y + height > grid.length - 1
    ) { return false; }
    // Check adjacent rooms
    for (let i = y - 1; i < y + height; i++) {
      for (let j = x - 1; j < x + width; j++) {
        if (grid[i][j].type === 'floor') return false;
      }
    }
    // If no conflicts, return true
    return true;
  };

    // Place cells in the grid
  const placeCells = (
    grid,
    { x, y, width = 1, height = 1, id },
    type = 'floor'
  ) => {
    // Iterate over entire grid
    for (let i = y; i < y + height; i++) {
      for (let j = x; j < x + width; j++) {
        grid[i][j] = { type, id }; // Place cell
      }
    }
    // Return grid filled with cells
    return grid;
  };

  // Generate rooms in random positions
  const createRooms = (
    grid,
    { x, y, width, height },
    range = roomSizeRange
  ) => {
    // Room values for each side of seed room
    const roomValues = [];
    // North (top) side
    const north = randomRoom(range);
    north.x = randomInt([x, x + (width - 1)]);
    north.y = y - north.height - 1;
    north.doorX = randomInt([north.x, Math.min(north.x + north.width, x + width) - 1]);
    north.doorY = y - 1;
    // East (right) side
    const east = randomRoom(range);
    east.x = x + width + 1;
    east.y = randomInt([y, height + (y - 1)]);
    east.doorX = east.x - 1;
    east.doorY = randomInt([east.y, Math.min(east.y + east.height, y + height) - 1]);
    // South (bottom) side
    const south = randomRoom(range);
    south.x = randomInt([x, x + (width - 1)]);
    south.y = y + height + 1;
    south.doorX = randomInt([south.x, Math.min(south.x + south.width, x + width) - 1]);
    south.doorY = y + height;
    // West (left) side
    const west = randomRoom(range);
    west.x = x - west.width - 1;
    west.y = randomInt([y, height + (y - 1)]);
    west.doorX = x - 1;
    west.doorY = randomInt([west.y, Math.min(west.y + west.height, y + height) - 1]);
    // Place all four room sides into roomValues array
    roomValues.push(north, east, south, west);
    // Attempt to place all rooms in grid
    const placedRooms = [];
    roomValues.forEach((room) => {
      // If room placement is valid, add it to the grid
      if (validRoomPlacement(grid, room)) {
        grid = placeCells(grid, room); // Place room in grid
        grid = placeCells(grid, { x: room.doorX, y: room.doorY }, 'door'); // Place door
        placedRooms.push(room); // Update placedRooms for next seed
      }
    });
    return { grid, placedRooms };
  };

  // BUILD THE MAP
  // First, generate grid of empty cells with random opacity
  let grid = [];
  for (let i = 0; i < gridHeight; i++) {
    grid.push([]);
    for (let j = 0; j < gridWidth; j++) {
      grid[i].push({ type: 0, opacity: randomInt([40, 90]) / 100 });
    }
  }
  // Then, generate and place the first room
  const firstRoom = randomRoom(roomSizeRange);
  firstRoom.x = randomInt([1, gridWidth - roomSizeRange[1] - maxRooms]);
  firstRoom.y = randomInt([1, gridHeight - roomSizeRange[1] - maxRooms]);
  grid = placeCells(grid, firstRoom);
  // Finally, use firstRoom as seed to fill grid
  const growMap = (grid, seedRooms, counter = 1) => {
    // Check to end recursion
    if (counter + seedRooms.length > maxRooms || !seedRooms.length) return grid;
    // Otherwise, create new room
    grid = createRooms(grid, seedRooms.pop());
    seedRooms.push(...grid.placedRooms);
    counter += grid.placedRooms.length; // Update counter
    return growMap(grid.grid, seedRooms, counter); // Run recursively
  };
  // When createDungeon is called, run recursive growMap function
  return growMap(grid, [firstRoom]);
};

// Create all entities (characters, items, etc.)
const createEntities = (gameMap, lvl = 1) => {
  // Prepare to store player's initial position
  let playerPosition = [];
  // Bosses appear after Level 4
  const bosses = [];
  if (lvl === 4) bosses.push({ health: 400, level: 5, type: 'boss' });
  // Enemies attributes are based on level
  const enemies = [];
  for (let i = 0; i < 7; i++) {
    enemies.push({ health: (lvl * 30) + 40, level: randomInt([Math.max(1, lvl - 1), lvl + 1]), type: 'enemy' });
  }
  // New exits appear before Level 4
  const exits = [];
  if (lvl < 4) exits.push({ type: 'exit' });
  // Create player
  const players = [{ type: 'player' }];
  // Create 5 potions
  const potions = Array(5).fill({ type: 'potion' });
  // Define weapon types
  const weaponTypes = [
    { name: 'Pistol', damage: 13 },
    { name: 'Rifle', damage: 17 },
    { name: '2x Pistol', damage: 26 },
    { name: '2x Rifle', damage: 34 },
    { name: 'Shotgun', damage: 38 },
    { name: 'Rail Gun', damage: 42 },
    { name: 'Cannon', damage: 46 },
    { name: 'Monster Blaster', damage: 50 }
  ];
  // Limit list of available weapons to current level
  const availableWeapons = weaponTypes.filter(weapon => ((weapon.damage < ((lvl * 10) + 10))
                                        && (weapon.damage > ((lvl * 10) - 10))));
  const weapons = [];
  // Randomly generate 3 available weapons
  for (let i = 0; i < 3; i++) {
    weapons.push({ ...availableWeapons[randomInt([1, availableWeapons.length]) - 1], type: 'weapon' });
  }

  // Place entities on open floor cells
  [bosses, enemies, exits, players, potions, weapons].forEach((entities) => {
    // Iterate over each entity
    while (entities.length) {
      // Get random x,y coordinates
      const x = randomInt([1, gridWidth]) - 1;
      const y = randomInt([1, gridHeight]) - 1;
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
  for (let i = 0; i < gameMap.length; i++) {
    for (let j = 0; j < gameMap[0].length; j++) {
      if (gameMap[i][j].type === 'door') gameMap[i][j].type = 'floor';
    }
  }

  // Return newly created map, along with position of player
  return { entities: gameMap, playerPosition };
};

// Redux store
const dungeon = createDungeon();
const firstStore = {
  entities: createEntities(dungeon)
};

// Dungeon
const Dungeon = (props) => {
  const { entities, playerPosition } = props.entities;
  const [playerX, playerY] = playerPosition;

  const cells = entities.map((e, eIdx) => (
    <div className="row" key={Date.now() + eIdx}>
      {e.map((cell, i) => (
        <div
          className={
            cell.type
              ? `cell ${cell.type}`
              : 'cell'
          }
          style={{ opacity: cell.opacity }}
          key={`cell-${i}`}
        >
          {cell.id}
        </div>
      ))}
    </div>
  ));
  return (
    <div className="app">
      <div className="flex-container">{cells}</div>
    </div>
  );
};

ReactDOM.render(
  <Dungeon entities={firstStore.entities} />,
  document.getElementById('container')
);
