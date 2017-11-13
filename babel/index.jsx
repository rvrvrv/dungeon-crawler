// Tutorial Credit: https://medium.com/@victorcatalintorac/react-redux-dungeon-crawler-7b52e67806bd
// REDUX SETUP
// Action Types
const BATCH_ACTIONS = 'BATCH_ACTIONS';
const ADD_XP = 'ADD_XP';
const CHANGE_ENTITY = 'CHANGE_ENTITY';
const CHANGE_HEALTH = 'CHANGE_HEALTH';
const CHANGE_PLAYER_POSITION = 'CHANGE_PLAYER_POSITION';
const CHANGE_WEAPON = 'CHANGE_WEAPON';
const CREATE_LVL = 'CREATE_LVL';
const NEW_MSG = 'NEW_MSG';
const RESTART = 'RESTART';
const SET_DUNGEON_LVL = 'SET_DUNGEON_LVL';
const TOGGLE_FOG_MODE = 'TOGGLE_FOG_MODE';

// Redux Batching
function batchActions(actions) {
  return { type: BATCH_ACTIONS, payload: actions };
}

function enableBatching(reduce) {
  return function batchingReducer(state, action) {
    switch (action.type) {
      case BATCH_ACTIONS:
        return action.payload.reduce(batchingReducer, state);
      default:
        return reduce(state, action);
    }
  };
}

// HELPER FUNCTIONS
// Generate random integer within range
function randomInt([min, max]) {
  return Math.floor(Math.random() * ((max - min) + 1)) + min;
}

// Generate room object within size range
function randomRoom(range) {
  return { height: randomInt(range), width: randomInt(range) };
}

// Clamp number within range
function clamp(num, [min, max]) {
  return Math.min(Math.max(min, num), max);
}

// Capitalize first letter of word
function capitalize(word) {
  return word.charAt(0).toUpperCase() + word.slice(1);
}

// Throttle (Source: https://gist.github.com/beaucharman/e46b8e4d03ef30480d7f4db5a78498ca)
function throttle(callback, delay) {
  let isThrottled = false,
    args,
    context;
  function wrapper() {
    if (isThrottled) {
      args = arguments;
      context = this;
      return;
    }
    isThrottled = true;
    callback.apply(this, arguments);
    setTimeout(() => {
      isThrottled = false;
      if (args) {
        wrapper.apply(context, args);
        args = context = null;
      }
    }, delay);
  }
  return wrapper;
}

// Dungeon Params
const gridWidth = 60;
const gridHeight = 40;
const maxRooms = 15;
const roomSizeRange = [5, 15];

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
    { x, y, width = 1, height = 1 },
    type = 'floor') => {
    // Iterate over entire grid
    for (let i = y; i < y + height; i++) {
      for (let j = x; j < x + width; j++) {
        grid[i][j] = { type }; // Place cell
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
  let newGrid = [];
  for (let i = 0; i < gridHeight; i++) {
    newGrid.push([]);
    for (let j = 0; j < gridWidth; j++) {
      newGrid[i].push({ type: 0, opacity: randomInt([40, 90]) / 100 });
    }
  }
  // Then, generate and place the first room
  const firstRoom = randomRoom(roomSizeRange);
  firstRoom.x = randomInt([1, gridWidth - roomSizeRange[1] - maxRooms]);
  firstRoom.y = randomInt([1, gridHeight - roomSizeRange[1] - maxRooms]);
  newGrid = placeCells(newGrid, firstRoom);
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
  return growMap(newGrid, [firstRoom]);
};

// Create all entities (characters, items, etc.)
const createEntities = (gameMap, lvl = 1) => {
  // Bosses appear at Level 4
  const bosses = [];
  if (lvl === 4) bosses.push({ health: 350, lvl: 5, type: 'boss' });
  // Enemies attributes are based on level
  const enemies = [];
  for (let i = 0; i < 7; i++) {
    enemies.push({ health: (lvl * 30) + 40, lvl: randomInt([Math.max(1, lvl - 1), lvl + 1]), type: 'enemy' });
  }
  // New exits appear in Levels 1, 2, and 3
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
    { name: 'Revolver', damage: 26 },
    { name: 'Machine Gun', damage: 34 },
    { name: 'Shotgun', damage: 38 },
    { name: 'Rail Gun', damage: 42 },
    { name: 'Cannon', damage: 46 },
    { name: 'Monster Blaster', damage: 50 }
  ];
  // Limit list of available weapons to current level
  const availableWeapons =
        weaponTypes.filter(weapon => (
          (weapon.damage < ((lvl * 10) + 10))
          && (weapon.damage > ((lvl * 10) - 10))));
  const weapons = [];
  // Randomly generate 4 available weapons
  for (let i = 0; i < 4; i++) {
    const weapon = Object.assign({}, availableWeapons[randomInt([1, availableWeapons.length]) - 1]);
    weapon.type = 'weapon';
    weapons.push(weapon);
  }

  // Place entities on open floor cells
  // First, prepare to store player's initial position
  let playerPosition = [];
  // Then, iterate over all entities
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

  // Replace doors (cells that connect rooms) with floors
  for (let i = 0; i < gameMap.length; i++) {
    for (let j = 0; j < gameMap[0].length; j++) {
      // Change door cell to floor cell
      if (gameMap[i][j].type === 'door') gameMap[i][j].type = 'floor';
      // Set random floor opacity
      if (gameMap[i][j].type === 'floor') gameMap[i][j].opacity = randomInt([86, 90]) / 100;
    }
  }
  // Return newly created map, along with position of player
  return { entities: gameMap, playerPosition };
};


// ADDITIONAL REDUX SETUP
// Action Creators
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

const changeWeapon = payload => ({
  type: CHANGE_WEAPON,
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

// Opening messages at beginning of each game
const openingMessages = restarted => (dispatch) => {
  dispatch(newMsg(`${restarted ? 'Welcome back to' : 'Enter'} the dungeon!`));
  // If player restarted the game, display different message
  if (restarted) setTimeout(() => dispatch(newMsg('Better luck this time...')), 2000);
  else setTimeout(() => dispatch(newMsg('Explore, battle, and survive!')), 2000);
};

// Restart the game
const restartGame = () => (dispatch) => {
  dispatch(newMsg('Restarting...'));
  setTimeout(() => dispatch(batchActions([restart(), createLvl(1), setDungeonLvl(1)])), 500);
};

// Respond to player input
const playerInput = vector => (dispatch, getState) => {
  const { grid, player } = getState();
  const [vectorX, vectorY] = vector; // Direction modifier
  const [x, y] = grid.playerPosition.slice(0); // Current position
  const newPosition = [x + vectorX, y + vectorY]; // Next position
  const newPlayer = grid.entities[y][x]; // Player on map
  const destination = grid.entities[y + vectorY][x + vectorX]; // What's in next position
  const actions = []; // Prepare to store actions for batching and dispatching
  // Allow player to move onto floor, potion, weapon, and exit spaces
  if (destination.type && destination.type !== 'enemy' && destination.type !== 'boss') {
    // Store entity and player-position changes
    actions.push(
      changeEntity({ type: 'floor', opacity: randomInt([86, 90]) / 100 }, [x, y]),
      changeEntity(newPlayer, newPosition),
      changePlayerPosition(newPosition));
  }
  // Respond based on destination
  switch (destination.type) {
    // Cases: Boss and Enemy
    case 'boss':
    case 'enemy': {
      const playerLvl = Math.floor(player.xp / 30);
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
          newMsg(`${capitalize(destination.type)} attacked!`),
          newMsg(`Damage inflicted: ${enemyDamage}. Damage incurred: ${playerDamage}.`),
          newMsg(`The ${destination.type} survived with ${destination.health} health remaining.`));
        // If player is dead, end and restart the game
        if (player.health - playerDamage <= 0) {
          // Prevent double-calling due to quick input
          if (player.health !== 0) {
            // Update health and end game
            actions.push(changeHealth(0),
              setDungeonLvl('death'),
              newMsg('Oh no! You\'re dead. Time to try again...'));
            // Delay automatic restart
            setTimeout(() => dispatch(batchActions([restart(), createLvl(1), setDungeonLvl(1), newMsg('Welcome back to the dungeon!')])),
              4000);
          }
          break;
        }
      }
      // If player wins the fight, respond accordingly
      if (destination.health <= 0) {
        // First, increase XP and move into the new position
        actions.push(
          addXP(10),
          changeEntity({ type: 'floor', opacity: randomInt([86, 90]) / 100 }, [x, y]),
          changeEntity(newPlayer, newPosition),
          changePlayerPosition(newPosition),
          newMsg(`You dealt ${enemyDamage} damage and won the battle! Way to go!`));
        // If player defeats a boss, end the game
        if (destination.type === 'boss') {
          setTimeout(() => dispatch(setDungeonLvl('victory')),
            250);
          setTimeout(() => dispatch(newMsg('Better yet, you beat the boss!')),
            1000);
          setTimeout(() => dispatch(newMsg('...In other words, you won the game!')),
            2000);
          setTimeout(() => dispatch(restartGame()), 7000);
          setTimeout(() => dispatch(newMsg('Try to win all over again!')), 8000);
        } else {
          // If player defeats a regular enemy, continue the game
          setTimeout(() => dispatch(newMsg('You are 10 XP stronger.')),
            2000);
          if ((player.xp + 10) % 30 === 0) {
            setTimeout(() => dispatch(newMsg('You leveled up! Now, you can deal more damage.')),
              2000);
          }
        }
      }
      break;
    }
    case 'potion':
      // Limit health to 100
      if (player.health === 100) dispatch(newMsg('The potion was ineffective, as you\'re already in perfect health!'));
      else {
        const healthGained = Math.min(25, 100 - player.health);
        const msg = (healthGained < 25)
          ? 'You drank the potion, and it completely restored your health!'
          : 'You drank the potion and gained 25 health. Onward!';
        actions.push(changeHealth(player.health + healthGained), newMsg(msg));
      }
      break;
    case 'weapon':
      // Respond based on weapon type and damage
      if (player.weapon.name === destination.name) dispatch(newMsg(`You already have the ${destination.name}.`));
      else if (player.weapon.damage > destination.damage) {
        dispatch(newMsg(`You found the ${destination.name}.`));
        setTimeout(() => dispatch(newMsg(`But, it's weaker than the ${player.weapon.name}, so you don't take it.`)), 1000);
      } else {
        actions.push(changeWeapon(destination), newMsg(`You found the ${destination.name}.`));
        setTimeout(() => dispatch(newMsg(`It inflicts ${destination.damage - player.weapon.damage} more damage than the ${player.weapon.name}. Excellent!`)), 1000);
      }
      break;
    case 'exit': {
      // Set next level and notify the player
      const nextLvl = grid.dungeonLvl + 1;
      actions.push(newMsg(`Exit reached! Moving to Level ${nextLvl}...`),
        dispatch(setDungeonLvl(`transit-${nextLvl}`)));
      // Create new level after brief delay (for transition)
      setTimeout(() => dispatch(batchActions([setDungeonLvl(nextLvl), createLvl(nextLvl), newMsg(`Welcome to Level ${nextLvl}. Good luck!`)])), 2500);
      break;
    }
    default:
      break;
  }
  // Dispatch all of the actions in response to player input
  dispatch(batchActions(actions));
};

// REACT COMPONENTS
const Cell = ({ cell, distance, foggy, zone }) => {
  let opacityVal = cell.opacity || 1;
  if (foggy) {
    if (distance > 15) opacityVal = 0;
    // Fade increasingly distant cells
    else if (distance > 4) {
      opacityVal = Math.min(opacityVal, (100 / (2 ** distance)));
      // Randomize more foggy cells
      if (distance > 7 && distance < 12) {
        const random = (randomInt([1, 10]) - randomInt([1, 10])) / 100;
        opacityVal -= random;
      }
    } else opacityVal = Math.min(opacityVal, 1);
  }
  return (
    <div
      className={cell.type ? `${cell.type} cell` : `bg bg-${zone} cell`}
      data-coords={cell.coords}
      style={{ opacity: opacityVal }}
    />
  );
};


// COMPONENT: DUNGEON
class cDungeon extends React.Component {
  constructor() {
    super();
    this.state = {
      vpWidth: 0,
      vpHeight: 0
    };
    // Viewport params
    this.vpHeightMin = 10;
    this.vpHeightRatio = 36;
    this.vpWidthRatio = 21;
  }

  componentWillMount() {
    // Set initial viewport size
    const vpWidth = window.innerWidth / this.vpWidthRatio;
    const vpHeight = Math.max(
      this.vpHeightMin,
      (window.innerHeight / this.vpHeightRatio)
    );
    this.setState({ vpWidth, vpHeight });
    // Set initial level
    this.props.createLvl();
    this.props.setDungeonLvl(1);
  }

  componentDidMount() {
    this.props.triggerOpeningMessages();
    window.addEventListener('keydown', throttle(this.handleKeyPress, 80));
    window.addEventListener('resize', this.handleResize);
    document.getElementsByClassName('dungeon')[0].addEventListener('mousedown', throttle(this.handleClick, 80));
    document.getElementsByClassName('dungeon')[0].addEventListener('touchend', this.preventZoom);
  }

  componentWillUnmount() {
    window.removeEventListener('keydown', throttle(this.handleKeyPress, 80));
    window.removeEventListener('resize', this.handleResize, 500);
    document.getElementsByClassName('dungeon')[0].removeEventListener('mousedown', throttle(this.handleClick, 80));
    document.getElementsByClassName('dungeon')[0].removeEventListener('touchend', this.preventZoom);
  }

  // Handle mouse/touch input (click to move)
  handleClick = (e) => {
    // Only respond to cell clicks during active game
    if (e.target.classList.contains('cell') && typeof this.props.grid.dungeonLvl === 'number') {
      // Store position of clicked and player cells
      const clicked = e.target.dataset.coords.split(',').map(coord => +coord);
      const player = this.props.grid.playerPosition;
      // Determine intended move from different between clicked and player
      const move = [clamp(clicked[0] - player[0], [-1, 1]), clamp(clicked[1] - player[1], [-1, 1])];
      // Attempt valid moves only (no diagonals)
      if (Math.abs(move[0]) !== Math.abs(move[1])) this.props.playerInput(move);
    }
  };

  // Handle keyboard input (arrows or WASD to move)
  handleKeyPress = (e) => {
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
      }
    }
  };

  // Handle window resizing
  handleResize = (e) => {
    const vpWidth = (e.target.innerWidth / this.vpWidthRatio);
    const vpHeight = Math.max(this.vpHeightMin, e.target.innerHeight / this.vpHeightRatio);
    // Set viewport size
    this.setState({ vpWidth, vpHeight });
  };

  // Prevent double-tap zoom on touch-screen devices
  // Source: https://stackoverflow.com/questions/10614481/disable-double-tap-zoom-option-in-browser-on-touch-devices
  preventZoom = (e) => {
    const t2 = e.timeStamp;
    const t1 = e.currentTarget.dataset.lastTouch || t2;
    const dt = t2 - t1;
    const fingers = e.touches.length;
    e.currentTarget.dataset.lastTouch = t2;
    if (!dt || dt > 500 || fingers > 1) return; // Not double-tap
    e.preventDefault();
    e.target.click();
  };

  render() {
    // Maintain even numbers for viewport width and height
    const vpWidth = this.state.vpWidth - (this.state.vpWidth % 2);
    const vpHeight = this.state.vpHeight - (this.state.vpHeight % 2);
    // Store props
    const { entities } = this.props.grid;
    const [playerX, playerY] = this.props.grid.playerPosition;
    // Set viewport limits (to only display cells within viewport)
    const top = clamp(playerY - (vpHeight / 2), [0, entities.length - vpHeight]);
    const right = Math.max(playerX + (vpWidth / 2), vpWidth);
    const bottom = Math.max(playerY + (vpHeight / 2), vpHeight);
    const left = clamp(playerX - (vpWidth / 2), [0, entities[0].length - vpWidth]);
    // Create new array of entities with distance property (for Fog mode)
    const newEntities = entities.map((row, i) => row.map((cell, j) => {
      // Calculate distance of cell from player
      cell.distance = Math.abs(playerY - i) + Math.abs(playerX - j);
      // Store coordinates of cell
      cell.coords = [j, i];
      return cell;
    }));

    // Create all cells within viewport
    const cells = newEntities
      .filter((row, i) => i >= top && i < bottom)
      .map((row, i) => (
        <div key={`row-${i}`} className="row" data-row={i}>
          {
            row
              .filter((r, j) => j >= left && j < right)
              .map((cell, k) => (
                <Cell
                  key={`cell-${k}`}
                  cell={cell}
                  distance={cell.distance}
                  zone={this.props.grid.dungeonLvl}
                  foggy={this.props.fogMode}
                />
              ))
          }
        </div>
      ));
    return (<div className="dungeon">{cells}</div>);
  }
}

const mapStateToDungeonProps = ({ ui, grid, player }) => ({
  fogMode: ui.fogMode,
  grid,
  player
});

const mapDispatchToDungeonProps = dispatch => ({
  playerInput: vector => dispatch(playerInput(vector)),
  createLvl: () => dispatch(createLvl()),
  setDungeonLvl: lvl => dispatch(setDungeonLvl(lvl)),
  triggerOpeningMessages: () => dispatch(openingMessages())
});

const Dungeon = ReactRedux.connect(mapStateToDungeonProps, mapDispatchToDungeonProps)(cDungeon);

// COMPONENT: HEADER
const Header = ({ lvl }) => (
  <div className={`bg-header bg-header-${lvl}`}>
    <h1>Dungeon Crawler</h1>
  </div>
);

// COMPONENT: MESSAGE CENTER
const cMessageCenter = ({ messages }) => (
  <div className="messages">
    <ul>
      {
        messages.slice(-4).reverse().map((msg, i) => <li key={`msg-${i}-${msg}`} className={`msg-${i}`}>{msg}</li>)
      }
    </ul>
  </div>
);

const mapStateToMessageCenterProps = ({ ui }) => ({ messages: ui.messages });

const MessageCenter = ReactRedux.connect(mapStateToMessageCenterProps)(cMessageCenter);

// COMPONENT: SETTINGS
class cSettings extends React.Component {
  componentDidMount() {
    window.addEventListener('keydown', throttle(this.handleKeyPress, 80));
  }

  componentWillUnmount() {
    window.removeEventListener('keydown', throttle(this.handleKeyPress, 80));
  }

  handleKeyPress = (e) => {
    switch (e.keyCode) {
      // F for Fog Mode
      case 70:
        this.props.toggleFogMode();
        break;
      // R for Restart
      case 82:
        this.manualRestart();
        break;
      default:
    }
  };

  manualRestart = () => {
    this.props.restartGame();
    setTimeout(() => this.props.triggerOpeningMessages(), 500);
  };

  render() {
    const { fogMode, toggleFogMode } = this.props;
    return (
      <div className="settings">
        <div className="settings-item" onClick={toggleFogMode}>
          <input
            id="toggleFogMode"
            type="checkbox"
            checked={fogMode}
          />
          <label className="settings-label" htmlFor="toggle">Fog Mode</label>
        </div>
        <div className="settings-item" onClick={this.manualRestart}>
          <span className="settings-label">Restart Game</span>
        </div>
      </div>
    );
  }
}

const mapStateToSettingsProps = ({ ui }) => ({
  fogMode: ui.fogMode
});

const mapDispatchToSettingsProps = dispatch => ({
  toggleFogMode: () => dispatch(toggleFogMode()),
  restartGame: () => dispatch(restartGame()),
  triggerOpeningMessages: () => dispatch(openingMessages(restart))
});

const Settings = ReactRedux.connect(mapStateToSettingsProps, mapDispatchToSettingsProps)(cSettings);

// COMPONENT: STAT
const Stat = ({ icon, title, value, health, xpLeft }) => (
  <div className={'stats-item'}>
    { icon && <div className={`icon cell ${icon}`} /> }
    { (icon === 'weapon')
      ? <div><span>{`${title}:`}</span><br /><span>{`${value}`}</span></div>
      : <span>{`${title}: ${value}`}</span>
    }
    {health &&
      <div>
        <span>{`Health: ${health}`}</span>
        <br />
        <span>{`XP to Lvl Up: ${xpLeft}`}</span>
      </div>}
  </div>
);

// COMPONENT: STATS
const Stats = ({ grid, player }) => (
  <div className="stats">
    <Stat
      icon="player"
      title="Player Lvl"
      value={Math.floor(player.xp / 30)}
      health={player.health}
      xpLeft={30 - (player.xp % 30)}
    />
    <Stat
      icon="weapon"
      title="Weapon"
      value={`${player.weapon.name} [${player.weapon.damage}]`}
    />
    <Stat
      icon={`bg bg-${grid.dungeonLvl}`}
      title="Dungeon Lvl"
      value={grid.dungeonLvl.toString().slice(-1).match(/[1-4]/) ? grid.dungeonLvl.toString().slice(-1) : '∞'}
    />
  </div>
);

// COMPONENT: APP
const cApp = props => (
  <div>
    <Header lvl={props.grid.dungeonLvl} />
    <div id="app">
      <Stats player={props.player} grid={props.grid} />
      <Dungeon />
      <Settings />
      <MessageCenter />
    </div>
  </div>
);

const mapStateToAppProps = ({ grid, player }) => ({ grid, player });
const App = ReactRedux.connect(mapStateToAppProps)(cApp);

// REDUCERS

// First, set initial states
const gridInitialState = {
  entities: [[]],
  dungeonLvl: 0,
  playerPosition: []
};
const playerInitialState = {
  health: 100,
  xp: 30,
  weapon: {
    name: 'Pistol',
    damage: 13
  }
};
const messages = [];
const uiInitialState = {
  fogMode: true,
  messages
};

// Then, define reducers
const grid = (state = gridInitialState, { type, payload }) => {
  switch (type) {
    case CHANGE_ENTITY: {
      const [x, y] = payload.coords;
      const entities = React.addons.update(state.entities, {
        [y]: { [x]: { $set: payload.entity } }
      });
      return { ...state, entities };
    }
    case CHANGE_PLAYER_POSITION:
      return { ...state, playerPosition: payload };
    case CREATE_LVL:
      return {
        ...state,
        playerPosition: payload.playerPosition,
        entities: payload.entities
      };
    case SET_DUNGEON_LVL:
      return { ...state, dungeonLvl: payload };
    default:
      return state;
  }
};
const player = (state = playerInitialState, { type, payload }) => {
  switch (type) {
    case ADD_XP:
      return { ...state, xp: state.xp + payload };
    case CHANGE_HEALTH:
      return { ...state, health: payload };
    case CHANGE_WEAPON:
      return { ...state, weapon: payload };
    case RESTART:
      return playerInitialState;
    default:
      return state;
  }
};
const ui = (state = uiInitialState, { type, payload }) => {
  switch (type) {
    case NEW_MSG:
      return { ...state, messages: [...state.messages, payload] };
    case TOGGLE_FOG_MODE:
      return { ...state, fogMode: !state.fogMode };
    case RESTART:
      return uiInitialState;
    default:
      return state;
  }
};

// Combine the reducers
const reducers = Redux.combineReducers({ grid, player, ui });
// Utilize thunk to create store
const createStoreWithMiddleware = Redux.applyMiddleware(ReduxThunk.default)(Redux.createStore);

// Render entire app to the DOM
ReactDOM.render(
  <ReactRedux.Provider store={createStoreWithMiddleware(enableBatching(reducers))}>
    <App />
  </ReactRedux.Provider>
  , document.getElementById('root'));
