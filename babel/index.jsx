// Initial dungeon params
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
    type = 'floor') => {
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
        // Place entire room in grid
        grid = placeCells(grid, room);
        // Place door to connect rooms
        grid = placeCells(grid, { x: room.doorX, y: room.doorY }, 'door');
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
  const potions = [];
  for (let i = 0; i < 5; i++) {
    potions.push({ type: 'potion' });
  }
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

  // Update floors and doors
  for (let i = 0; i < gameMap.length; i++) {
    for (let j = 0; j < gameMap[0].length; j++) {
      // Choose random floor opacity
      if (gameMap[i][j].type === 'floor') gameMap[i][j].opacity = randomInt([86, 90]) / 100;
      // Change door cell to floor cell
      if (gameMap[i][j].type === 'door') gameMap[i][j].type = 'floor';
    }
  }

  // Return newly created map, along with position of player
  return { entities: gameMap, playerPosition };
};

// REDUX
const BATCH_ACTIONS = 'BATCH_ACTIONS';
const CHANGE_ENTITY = 'CHANGE_ENTITY';
const CHANGE_PLAYER_POSITION = 'CHANGE_PLAYER_POSITION';
const CREATE_LVL = 'CREATE_LVL';
const SET_DUNGEON_LVL = 'SET_DUNGEON_LVL';

const initialState = {
  entities: [[]],
  dungeonLvl: 0,
  playerPosition: []
};

// Reducer
function createBoard(state = initialState, { type, payload }) {
  switch (type) {
    case CHANGE_ENTITY: {
      // Create a new entity
      const [x, y] = payload.coords;
      const entities = React.addons.update(state.entities, {
        [y]: { [x]: { $set: payload.entity } }
      });
      return { ...state, entities };
    }
    case CHANGE_PLAYER_POSITION: {
      return { ...state, playerPosition: payload };
    }
    case CREATE_LVL: {
      return {
        ...state,
        playerPosition: payload.playerPosition,
        entities: payload.entities
      };
    }
    case SET_DUNGEON_LVL: {
      return { ...state, dungeonLvl: payload };
    }
    default:
      return state;
  }
}

// Actions
const changeEntity = (entity, coords) => ({
  type: CHANGE_ENTITY,
  payload: { entity, coords }
});

const changePlayerPosition = payload => ({
  type: CHANGE_PLAYER_POSITION,
  payload
});

const createLvl = lvl => ({
  type: CREATE_LVL,
  payload: createEntities(createDungeon(), lvl)
});

const setDungeonLvl = payload => ({
  type: SET_DUNGEON_LVL,
  payload
});

const batchActions = actions => ({
  type: BATCH_ACTIONS,
  payload: actions
});

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
const store = Redux.createStore(enableBatching(createBoard));
store.dispatch(createLvl(1));
store.dispatch(setDungeonLvl(1));

class App extends React.Component {
  // Respond to player input
  static playerInput = (vector) => {
    const state = store.getState();
    const [x, y] = state.playerPosition;
    const [vectorX, vectorY] = vector;
    const newPosition = [x + vectorX, y + vectorY];
    const newPlayer = state.entities[y][x];
    const destination = state.entities[y + vectorY][x + vectorX];
    // Allow player to move onto floor, potion, weapon, and exit spaces
    if (destination.type && destination.type !== 'enemy' && destination.type !== 'boss') {
      // Perform entity and player-position changes via batchActions
      store.dispatch(batchActions([
        changeEntity({ type: 'floor' }, [x, y]),
        changeEntity(newPlayer, newPosition),
        changePlayerPosition(newPosition)]));
    }
  };

  // Capture user input
  static keydown = (e) => {
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
  };

  componentDidMount() {
    // Listen for keypress
    window.addEventListener('keydown', App.keydown);
    // Re-render after each store update
    this.unsubscribe = store.subscribe(() => this.forceUpdate());
  }

  componentWillUnmount() {
    // Upon unmount, remove event listener and unsubscribe
    window.removeEventListener('keydown', App.keydown);
    this.unsubscribe();
  }

  render() {
    const { entities, playerPosition } = store.getState();
    return (
      <div className="app">
        <Dungeon
          entities={entities}
          playerPosition={playerPosition}
        />
      </div>
    );
  }
}

// Dungeon
const Dungeon = (props) => {
  const { entities, playerPosition } = props;
  const [x, y] = playerPosition;
  // Fog mode
  entities.map((row, i) => row.map((cell, j) => {
    // Calculate distance of cell from player
    const dist = Math.abs(y - i) + Math.abs(x - j);
    // Make faraway cells less visible
    cell.opacity =
          (dist > 16) ? 0
            : (dist > 8) ? (250 / Math.pow(2, dist))
              : (dist > 7) ? 0.7
                : (dist > 6) ? 0.9
                  : 1;
    return cell;
  }));

  const cells = entities.map((entity, eIdx) => (
    <div className="row" key={`row-${eIdx}`}>
      {entity.map((cell, cIdx) => (
        <div
          className={
            cell.type
              ? `cell ${cell.type}`
              : 'cell'
          }
          style={{ opacity: cell.opacity }}
          key={`cell-${cIdx}`}
        >
          {cell.id}
        </div>
      ))}
    </div>
  ));
  return <div className="flex-container">{cells}</div>;
};

ReactDOM.render(
  <App />,
  document.getElementById('container')
);
