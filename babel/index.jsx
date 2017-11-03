// INITIAL SETUP
// Dungeon params
const gridHeight = 40;
const gridWidth = 60;
const maxRooms = 15;
const roomSizeRange = [5, 15];

// HELPER FUNCTIONS
// Generate random integer within range
function randomInt([min, max]) {
  return Math.floor(Math.random() * ((max - min) + 1)) + min;
}

// Generate room object within size range
function randomRoom(range) {
  return { height: randomInt(range), width: randomInt(range) };
}

// DUNGEON CREATION
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
const ADD_WEAPON = 'ADD_WEAPON';
const ADD_XP = 'ADD_XP';
const CHANGE_ENTITY = 'CHANGE_ENTITY';
const CHANGE_HEALTH = 'CHANGE_HEALTH';
const CHANGE_PLAYER_POSITION = 'CHANGE_PLAYER_POSITION';
const CREATE_LVL = 'CREATE_LVL';
const NEW_MSG = 'NEW_MSG';
const RESTART = 'RESTART';
const SET_DUNGEON_LVL = 'SET_DUNGEON_LVL';
const TOGGLE_FOG_MODE = 'TOGGLE_FOG_MODE';

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

// Action Creators
const batchActions = actions => ({
  type: BATCH_ACTIONS,
  payload: actions
});

const addWeapon = payload => ({
  type: ADD_WEAPON,
  payload
});

const addXP = payload => ({
  type: ADD_XP,
  payload
});

const changeEntity = (entity, coords) => ({
  type: CHANGE_ENTITY,
  payload: { entity, coords }
});

const changeHealth = payload => ({
  type: CHANGE_HEALTH,
  payload
});

const changePlayerPosition = payload => ({
  type: CHANGE_PLAYER_POSITION,
  payload
});

const createLvl = lvl => ({
  type: CREATE_LVL,
  payload: createEntities(createDungeon(), lvl)
});

const newMsg = payload => ({
  type: NEW_MSG,
  payload
});

const restart = () => ({
  type: RESTART
});

const setDungeonLvl = payload => ({
  type: SET_DUNGEON_LVL,
  payload
});

const toggleFogMode = () => ({
  type: TOGGLE_FOG_MODE
});

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

// Create initial store and set game to Level 1
const store = Redux.createStore(enableBatching(createBoard));
store.dispatch(createLvl(1));
store.dispatch(setDungeonLvl(1));


// Respond to player input, utilizing Redux Thunk
const playerInput = ([vectorX, vectorY]) => (dispatch, getState) => {
  const { grid, player } = getState();
  const [x, y] = grid.playerPosition; // .slice(0)? Current position
  const newPosition = [x + vectorX, y + vectorY]; // Next position
  const newPlayer = grid.entities[y][x]; // Player on map
  const destination = grid.entities[y + vectorY][x + vectorX]; // What's in next position
  const actions = []; // Prepare to store actions for batching and dispatching
  // Allow player to move onto floor, potion, weapon, and exit spaces
  if (destination.type
          && destination.type !== 'enemy'
          && destination.type !== 'boss') {
    // Store entity and player-position changes
    actions.push(
      changeEntity({ type: 'floor' }, [x, y]),
      changeEntity(newPlayer, newPosition),
      changePlayerPosition(newPosition));
  }
  // Respond based on destination
  switch (destination.type) {
    case 'boss':
    case 'enemy': {
      const playerLvl = Math.floor(player.xp / 100);
      // Player attacks enemy
      const enemyDamage = Math.floor(player.weapon.damage * (randomInt([10, 13]) / 10) * playerLvl);
      destination.health -= enemyDamage;
      // If enemy is alive, it attacks player
      if (destination.health > 0) {
        const playerDamage = Math.floor(randomInt([4, 7]) * destination.lvl);
        // Store changes for batching and dispatching
        actions.push(
          changeEntity(destination, newPosition),
          changeHealth(player.health - playerDamage),
          newMessage(`You attacked the ${destination.type} and caused ${enemyDamage} damage. The ${destination.type} struck back for ${playerDamage} of your health. The ${destination.type} survived and has ${destination.health} health remaining.`));
        // If player is dead, end and restart the game
        if (player.health - playerDamage <= 0) {
          dispatch(changeHealth(0));
          setTimeout(() => dispatch(setDungeonLvl('death')), 250);
          setTimeout(() => dispatch(newMessage('Oh no! You\'re dead. Try again, if you dare.')), 1000);
          setTimeout(() => dispatch(batchActions([restart(), createLvl(1), setDungeonLvl(1)])), 6000);
          return;
        }
      }
      // If player wins the fight, respond accordingly
      if (destination.health <= 0) {
        // First, increase XP and move into the new position
        actions.push(
          addXP(10),
          changeEntity({ type: 'floor' }, [x, y]),
          changeEntity(newPlayer, newPosition),
          changePlayerPosition(newPosition),
          newMessage(`You dealt ${enemyDamage} damage and won the battle! Way to go!`));
        // If player defeats a boss, end and restart the game
        if (destination.type === 'boss') {
          setTimeout(() => dispatch(setDungeonLvl('victory')), 250);
          setTimeout(() => dispatch(newMessage('Better yet, you beat the boss!')), 1000);
          setTimeout(() => dispatch(newMessage('...In other words, you won the game!')), 2000);
          setTimeout(() => dispatch(batchActions([restart(), createLvl(1), setDungeonLvl(1)])), 7000);
        }
        // If player defeats a regular enemy, continue the game
        else {
          setTimeout(() => dispatch(newMessage('You are 10 XP stronger.')), 2000);
          if ((player.xp + 10) % 100 === 0) { setTimeout(() => dispatch(newMessage('You leveled up!')), 5000); }
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

// Opening messages at beginning of each game
const openingMessages = () => ((dispatch) => {
  dispatch(newMessage('Enter the dungeon!'));
  setTimeout(() => dispatch(newMessage('Explore, battle, and survive!')), 2000);
});

// Restart the game
const restartGame = () => ((dispatch) => {
  dispatch(newMessage('Restarting the game...'));
  setTimeout(() => dispatch(batchActions([restart(), createLvl(1), setDungeonLvl(1)])), 1000);
});

// REACT COMPONENTS
const Cell = ({ cell, distance, visible, zone }) => {
  if (visible) {
    // Make faraway cells less visible
      cell.opacity =
            (distance > 16) ? 0
              : (distance > 8) ? (250 / Math.pow(2, distance))
                : (distance > 7) ? 0.7
                  : (distance > 6) ? 0.9
                    : 1;
  }
  return (
    <div
      className={
        cell.type
          ? `cell ${cell.type}`
          : `cell back-${zone}`
          }
          style={{ opacity: cell.opacity }}
      />
  );
};

const Header = ({lvl}) => (
  <div className='header-bg'>
    <h1 className={`header-${lvl}`}>DC</h1>
  </div>
);

const Score = ({ iconClass, title, value }) => (
  <div className="score-item">
    <div className={`icon cell ${iconClass}`} />
    <span className="score-label">{`${title}: ${value}`}</span>
  </div>
);


class Game extends React.Component {
  constructor() {
    super();
    this.state = {
      vpWidth: 0,
      vpHeight: 0
    };

    this.vpHeightOffset = 5;
    this.vpHeightMin = 22;
    this.vpHeightRatio = 21;
    this.vpWidthRatio = 30;
  }

  componentWillMount() {
    // Set initial viewport size
    this.setState({
      vpWidth: window.innerWidth / this.vpWidthRatio,
      vpHeight: Math.max(this.vpHeightMin, (window.innerHeight / this.vpHeightRadio) - this.vpHeightOffset)
    });
    // Set initial level
    this.props.createLvl();
    this.props.setDungeonLvl(1);
  }

  componentDidMount() {
    window.addEventListener('keydown', this.handleKeyPress);
    window.addEventListener('resize', this.handleResize);
    this.props.triggerOpeningMessages();
  }

  componentWillUnmount() {
    window.removeEventListener('keydown', this.handleKeyPress);
    window.removeEventListener('resize', this.handleResize);
  }

   // Handle user input
  const handleKeyPress = (e) => {
    // Only respond during active game
    if (typeof this.props.grid.dungeonLvl === 'number') {
      switch (e.keyCode) {
        // Up or W
        case 38:
        case 87:
          this.props.playerInput([0, -1]);
          break;
          // Down or S
        case 40:
        case 83:
          this.props.playerInput([0, 1]);
          break;
          // Left or A
        case 37:
        case 65:
          this.props.playerInput([-1, 0]);
          break;
          // Right or D
        case 39:
        case 68:
          this.props.playerInput([1, 0]);
          break;
        default:
          return;
      }
    }
  };

  // Handle window resizing
  const handleResize = (e) => {
    // Set initial viewport size
    this.setState({
      vpWidth: e.target.innerWidth / this.vpWidthRatio,
      vpHeight: Math.max(this.vpHeightMin, (e.target.innerHeight / this.vpHeightRadio) - this.vpHeightOffset)
    });
  };

  render() {
    // Maintain even viewport width and height
    const vpWidth = this.state.vpWidth - (this.state.vpWidth % 2);
    const vpHeight = this.state.vpHeight - (this.state.vpHeight % 2);
    // Store props
    const { entities } = this.props.grid;
    const [ playerX, playerY ] = this.props.grid.playerPosition;

    // TO-DO: Clamp cells within viewport

    // Create new array of entities with distance property (for fog mode)
    const newEntities = entities.map((row, i) => row.map((cell, j) => {
      // Calculate distance of cell from player
      cell.distance = Math.abs(playerY - i) + Math.abs(playerX - j);
      return cell;
    }));

    // Create all cells within viewport
    const cells = newEntities
      .filter((row, i) => i >= top && i < bottom)
      .map((row, i) => (
        <div key={`row-${i}`} className='row'>
          {
            row
              .filter((row, i) => i >= left && i < right)
              .map((cell, j) => (
                <Cell
                  key={`cell-${j}`}
                  cell={cell}
                  distance={cell.distance}
                  zone={this.props.grid.dungeonLvl}
                  visible={this.props.fogMode}
                  />
            ));
          }
          </div>
      ));

    return <div className="grid-wrapper">{cells}</div>;
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
