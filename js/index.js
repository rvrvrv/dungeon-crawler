'use strict';var _extends=Object.assign||function(a){for(var c,b=1;b<arguments.length;b++)for(var d in c=arguments[b],c)Object.prototype.hasOwnProperty.call(c,d)&&(a[d]=c[d]);return a},_createClass=function(){function a(b,c){for(var f,d=0;d<c.length;d++)f=c[d],f.enumerable=f.enumerable||!1,f.configurable=!0,'value'in f&&(f.writable=!0),Object.defineProperty(b,f.key,f)}return function(b,c,d){return c&&a(b.prototype,c),d&&a(b,d),b}}(),_slicedToArray=function(){function a(b,c){var d=[],f=!0,g=!1,h=void 0;try{for(var m,l=b[Symbol.iterator]();!(f=(m=l.next()).done)&&(d.push(m.value),!(c&&d.length===c));f=!0);}catch(n){g=!0,h=n}finally{try{!f&&l['return']&&l['return']()}finally{if(g)throw h}}return d}return function(b,c){if(Array.isArray(b))return b;if(Symbol.iterator in Object(b))return a(b,c);throw new TypeError('Invalid attempt to destructure non-iterable instance')}}();function _defineProperty(a,b,c){return b in a?Object.defineProperty(a,b,{value:c,enumerable:!0,configurable:!0,writable:!0}):a[b]=c,a}function _classCallCheck(a,b){if(!(a instanceof b))throw new TypeError('Cannot call a class as a function')}function _possibleConstructorReturn(a,b){if(!a)throw new ReferenceError('this hasn\'t been initialised - super() hasn\'t been called');return b&&('object'==typeof b||'function'==typeof b)?b:a}function _inherits(a,b){if('function'!=typeof b&&null!==b)throw new TypeError('Super expression must either be null or a function, not '+typeof b);a.prototype=Object.create(b&&b.prototype,{constructor:{value:a,enumerable:!1,writable:!0,configurable:!0}}),b&&(Object.setPrototypeOf?Object.setPrototypeOf(a,b):a.__proto__=b)}function _toConsumableArray(a){if(Array.isArray(a)){for(var b=0,c=Array(a.length);b<a.length;b++)c[b]=a[b];return c}return Array.from(a)}var BATCH_ACTIONS='BATCH_ACTIONS',ADD_XP='ADD_XP',CHANGE_ENTITY='CHANGE_ENTITY',CHANGE_HEALTH='CHANGE_HEALTH',CHANGE_PLAYER_POSITION='CHANGE_PLAYER_POSITION',CHANGE_WEAPON='CHANGE_WEAPON',CREATE_LVL='CREATE_LVL',NEW_MSG='NEW_MSG',RESTART='RESTART',SET_DUNGEON_LVL='SET_DUNGEON_LVL',TOGGLE_FOG_MODE='TOGGLE_FOG_MODE';function batchActions(a){return{type:BATCH_ACTIONS,payload:a}}function enableBatching(a){return function b(c,d){switch(d.type){case BATCH_ACTIONS:return d.payload.reduce(b,c);default:return a(c,d);}}}function randomInt(_ref){var _ref2=_slicedToArray(_ref,2),a=_ref2[0],b=_ref2[1];return Math.floor(Math.random()*(b-a+1))+a}function randomRoom(a){return{height:randomInt(a),width:randomInt(a)}}function clamp(a,_ref3){var _ref4=_slicedToArray(_ref3,2),b=_ref4[0],c=_ref4[1];return Math.min(Math.max(b,a),c)}function capitalize(a){return a.charAt(0).toUpperCase()+a.slice(1)}function throttle(a,b){function c(){return d?(f=arguments,void(g=this)):void(d=!0,a.apply(this,arguments),setTimeout(function(){d=!1,f&&(c.apply(g,f),f=g=null)},b))}var d=!1,f,g;return c}var gridWidth=60,gridHeight=40,maxRooms=15,roomSizeRange=[5,15],createDungeon=function(){for(var a=function(m,_ref5){var n=_ref5.x,o=_ref5.y,_ref5$width=_ref5.width,p=_ref5$width===void 0?1:_ref5$width,_ref5$height=_ref5.height,q=_ref5$height===void 0?1:_ref5$height;if(1>n||1>o||n+p>m[0].length-1||o+q>m.length-1)return!1;for(var s=o-1;s<o+q;s++)for(var t=n-1;t<n+p;t++)if('floor'===m[s][t].type)return!1;return!0},b=function(m,_ref6){for(var n=_ref6.x,o=_ref6.y,_ref6$width=_ref6.width,p=_ref6$width===void 0?1:_ref6$width,_ref6$height=_ref6.height,q=_ref6$height===void 0?1:_ref6$height,s=2<arguments.length&&arguments[2]!==void 0?arguments[2]:'floor',t=o;t<o+q;t++)for(var u=n;u<n+p;u++)m[t][u]={type:s};return m},d=[],f=0;f<gridHeight;f++){d.push([]);for(var g=0;g<gridWidth;g++)d[f].push({type:0,opacity:randomInt([40,90])/100})}var h=randomRoom(roomSizeRange);h.x=randomInt([1,gridWidth-roomSizeRange[1]-maxRooms]),h.y=randomInt([1,gridHeight-roomSizeRange[1]-maxRooms]),d=b(d,h);var l=function(m,n){var o=2<arguments.length&&void 0!==arguments[2]?arguments[2]:1;return o+n.length>maxRooms||!n.length?m:(m=c(m,n.pop()),n.push.apply(n,_toConsumableArray(m.placedRooms)),o+=m.placedRooms.length,l(m.grid,n,o))};return l(d,[h])},createEntities=function(a){var b=1<arguments.length&&arguments[1]!==void 0?arguments[1]:1,c=[];4===b&&c.push({health:350,lvl:5,type:'boss'});for(var d=[],f=0;7>f;f++)d.push({health:30*b+40,lvl:randomInt([Math.max(1,b-1),b+1]),type:'enemy'});var g=[];4>b&&g.push({type:'exit'});for(var l=[],m=0;5>m;m++)l.push({type:'potion'});for(var s,n=[{name:'Pistol',damage:13},{name:'Rifle',damage:17},{name:'Revolver',damage:26},{name:'Machine Gun',damage:34},{name:'Shotgun',damage:38},{name:'Rail Gun',damage:42},{name:'Cannon',damage:46},{name:'Monster Blaster',damage:50}],o=n.filter(function(w){return w.damage<10*b+10&&w.damage>10*b-10}),p=[],q=0;4>q;q++)s=Object.assign({},o[randomInt([1,o.length])-1]),s.type='weapon',p.push(s);var t=[];[c,d,g,h,l,p].forEach(function(w){for(;w.length;){var z=randomInt([1,gridWidth])-1,A=randomInt([1,gridHeight])-1;'floor'===a[A][z].type&&('player'===w[0].type&&(t=[z,A]),a[A][z]=w.pop())}});for(var u=0;u<a.length;u++)for(var v=0;v<a[0].length;v++)'door'===a[u][v].type&&(a[u][v].type='floor'),'floor'===a[u][v].type&&(a[u][v].opacity=randomInt([86,90])/100);return{entities:a,playerPosition:t}},addXP=function(a){return{type:ADD_XP,payload:a}},changeEntity=function(a,b){return{type:CHANGE_ENTITY,payload:{entity:a,coords:b}}},changeHealth=function(a){return{type:CHANGE_HEALTH,payload:a}},changePlayerPosition=function(a){return{type:CHANGE_PLAYER_POSITION,payload:a}},changeWeapon=function(a){return{type:CHANGE_WEAPON,payload:a}},_createLvl=function(a){return{type:CREATE_LVL,payload:createEntities(createDungeon(),a)}},newMsg=function(a){return{type:NEW_MSG,payload:a}},restart=function(){return{type:RESTART}},_setDungeonLvl=function(a){return{type:SET_DUNGEON_LVL,payload:a}},_toggleFogMode=function(){return{type:TOGGLE_FOG_MODE}},openingMessages=function(a){return function(b){b(newMsg((a?'Welcome back to':'Enter')+' the dungeon!')),a?setTimeout(function(){return b(newMsg('Better luck this time...'))},2e3):setTimeout(function(){return b(newMsg('Explore, battle, and survive!'))},2e3)}},_restartGame=function(){return function(a){a(newMsg('Restarting...')),setTimeout(function(){return a(batchActions([restart(),_createLvl(1),_setDungeonLvl(1)]))},500)}},_playerInput=function(a){return function(b,c){var _getState=c(),d=_getState.grid,f=_getState.player,_vector=_slicedToArray(a,2),g=_vector[0],h=_vector[1],_grid$playerPosition$=d.playerPosition.slice(0),_grid$playerPosition$2=_slicedToArray(_grid$playerPosition$,2),l=_grid$playerPosition$2[0],m=_grid$playerPosition$2[1],n=[l+g,m+h],o=d.entities[m][l],p=d.entities[m+h][l+g],q=[];switch(p.type&&'enemy'!==p.type&&'boss'!==p.type&&q.push(changeEntity({type:'floor',opacity:randomInt([86,90])/100},[l,m]),changeEntity(o,n),changePlayerPosition(n)),p.type){case'boss':case'enemy':{var s=Math.floor(f.xp/30),t=Math.floor(f.weapon.damage*(randomInt([10,13])/10)*s);if(p.health-=t,0<p.health){var u=Math.floor(randomInt([4,7])*p.lvl);if(q.push(changeEntity(p,n),changeHealth(f.health-u),newMsg(capitalize(p.type)+' attacked!'),newMsg('Damage inflicted: '+t+'. Damage incurred: '+u+'.'),newMsg('The '+p.type+' survived with '+p.health+' health remaining.')),0>=f.health-u){0!==f.health&&(q.push(changeHealth(0),_setDungeonLvl('death'),newMsg('Oh no! You\'re dead. Time to try again...')),setTimeout(function(){return b(batchActions([restart(),_createLvl(1),_setDungeonLvl(1),newMsg('Welcome back to the dungeon!')]))},4e3));break}}0>=p.health&&(q.push(addXP(10),changeEntity({type:'floor',opacity:randomInt([86,90])/100},[l,m]),changeEntity(o,n),changePlayerPosition(n),newMsg('You dealt '+t+' damage and won the battle! Way to go!')),'boss'===p.type?(setTimeout(function(){return b(_setDungeonLvl('victory'))},250),setTimeout(function(){return b(newMsg('Better yet, you beat the boss!'))},1e3),setTimeout(function(){return b(newMsg('...In other words, you won the game!'))},2e3),setTimeout(function(){return b(_restartGame())},7e3),setTimeout(function(){return b(newMsg('Try to win all over again!'))},8e3)):(setTimeout(function(){return b(newMsg('You are 10 XP stronger.'))},2e3),0==(f.xp+10)%30&&setTimeout(function(){return b(newMsg('You leveled up! Now, you can deal more damage.'))},2e3)));break}case'potion':if(100===f.health)b(newMsg('The potion was ineffective, as you\'re already in perfect health!'));else{var v=Math.min(25,100-f.health),w=25>v?'You drank the potion, and it completely restored your health!':'You drank the potion and gained 25 health. Onward!';q.push(changeHealth(f.health+v),newMsg(w))}break;case'weapon':f.weapon.name===p.name?b(newMsg('You already have the '+p.name+'.')):f.weapon.damage>p.damage?(b(newMsg('You found the '+p.name+'.')),setTimeout(function(){return b(newMsg('But, it\'s weaker than the '+f.weapon.name+', so you don\'t take it.'))},1e3)):(q.push(changeWeapon(p),newMsg('You found the '+p.name+'.')),setTimeout(function(){return b(newMsg('It inflicts '+(p.damage-f.weapon.damage)+' more damage than the '+f.weapon.name+'. Excellent!'))},1e3));break;case'exit':{var z=d.dungeonLvl+1;q.push(newMsg('Exit reached! Moving to Level '+z+'...'),b(_setDungeonLvl('transit-'+z))),setTimeout(function(){return b(batchActions([_setDungeonLvl(z),_createLvl(z),newMsg('Welcome to Level '+z+'. Good luck!')]))},2500);break}default:}b(batchActions(q))}},Cell=function(_ref8){var a=_ref8.cell,b=_ref8.distance,c=_ref8.foggy,d=_ref8.zone,f=a.opacity||1;if(c)if(15<b)f=0;else if(!(4<b))f=Math.min(f,1);else if(f=Math.min(f,100/Math.pow(2,b)),7<b&&12>b){var g=(randomInt([1,10])-randomInt([1,10]))/100;f-=g}return React.createElement('div',{className:a.type?a.type+' cell':'bg bg-'+d+' cell','data-coords':a.coords,style:{opacity:f}})},cDungeon=function(a){function b(){_classCallCheck(this,b);var c=_possibleConstructorReturn(this,(b.__proto__||Object.getPrototypeOf(b)).call(this));return c.handleClick=function(d){if(d.target.classList.contains('cell')&&'number'==typeof c.props.grid.dungeonLvl){var f=d.target.dataset.coords.split(',').map(function(l){return+l}),g=c.props.grid.playerPosition,h=[clamp(f[0]-g[0],[-1,1]),clamp(f[1]-g[1],[-1,1])];Math.abs(h[0])!==Math.abs(h[1])&&c.props.playerInput(h)}},c.handleKeyPress=function(d){if('number'==typeof c.props.grid.dungeonLvl)switch(d.keyCode){case 38:case 87:c.props.playerInput([0,-1]);break;case 40:case 83:c.props.playerInput([0,1]);break;case 37:case 65:c.props.playerInput([-1,0]);break;case 39:case 68:c.props.playerInput([1,0]);break;default:}},c.handleResize=function(d){var f=d.target.innerWidth/c.vpWidthRatio,g=Math.max(c.vpHeightMin,d.target.innerHeight/c.vpHeightRatio);c.setState({vpWidth:f,vpHeight:g})},c.preventZoom=function(d){var f=d.timeStamp,g=d.currentTarget.dataset.lastTouch||f,h=f-g,l=d.touches.length;d.currentTarget.dataset.lastTouch=f,!h||300<h||1<l||(d.preventDefault(),d.target.click())},c.state={vpWidth:0,vpHeight:0},c.vpHeightMin=10,c.vpHeightRatio=36,c.vpWidthRatio=21,c}return _inherits(b,a),_createClass(b,[{key:'componentWillMount',value:function componentWillMount(){var c=window.innerWidth/this.vpWidthRatio,d=Math.max(this.vpHeightMin,window.innerHeight/this.vpHeightRatio);this.setState({vpWidth:c,vpHeight:d}),this.props.createLvl(),this.props.setDungeonLvl(1)}},{key:'componentDidMount',value:function componentDidMount(){this.props.triggerOpeningMessages(),window.addEventListener('keydown',throttle(this.handleKeyPress,80)),window.addEventListener('resize',this.handleResize),document.getElementsByClassName('dungeon')[0].addEventListener('mousedown',throttle(this.handleClick,80)),document.getElementsByClassName('dungeon')[0].addEventListener('touchend',this.preventZoom)}},{key:'componentWillUnmount',value:function componentWillUnmount(){window.removeEventListener('keydown',throttle(this.handleKeyPress,80)),window.removeEventListener('resize',this.handleResize,500),document.getElementsByClassName('dungeon')[0].removeEventListener('mousedown',throttle(this.handleClick,80)),document.getElementsByClassName('dungeon')[0].removeEventListener('touchend',this.preventZoom)}},{key:'render',value:function render(){var s=this,g=this.state.vpWidth-this.state.vpWidth%2,h=this.state.vpHeight-this.state.vpHeight%2,c=this.props.grid.entities,_props$grid$playerPos=_slicedToArray(this.props.grid.playerPosition,2),d=_props$grid$playerPos[0],f=_props$grid$playerPos[1],l=clamp(f-h/2,[0,c.length-h]),m=Math.max(d+g/2,g),n=Math.max(f+h/2,h),o=clamp(d-g/2,[0,c[0].length-g]),p=c.map(function(t,u){return t.map(function(v,w){return v.distance=Math.abs(f-u)+Math.abs(d-w),v.coords=[w,u],v})}),q=p.filter(function(t,u){return u>=l&&u<n}).map(function(t,u){return React.createElement('div',{key:'row-'+u,className:'row','data-row':u},t.filter(function(v,w){return w>=o&&w<m}).map(function(v,w){return React.createElement(Cell,{key:'cell-'+w,cell:v,distance:v.distance,zone:s.props.grid.dungeonLvl,foggy:s.props.fogMode})}))});return React.createElement('div',{className:'dungeon'},q)}}]),b}(React.Component),mapStateToDungeonProps=function(_ref9){var a=_ref9.ui,b=_ref9.grid,c=_ref9.player;return{fogMode:a.fogMode,grid:b,player:c}},mapDispatchToDungeonProps=function(a){return{playerInput:function playerInput(b){return a(_playerInput(b))},createLvl:function createLvl(){return a(_createLvl())},setDungeonLvl:function setDungeonLvl(b){return a(_setDungeonLvl(b))},triggerOpeningMessages:function triggerOpeningMessages(){return a(openingMessages())}}},Dungeon=ReactRedux.connect(mapStateToDungeonProps,mapDispatchToDungeonProps)(cDungeon),Header=function(_ref10){var a=_ref10.lvl;return React.createElement('div',{className:'bg-header bg-header-'+a},React.createElement('h1',null,'Dungeon Crawler'))},cMessageCenter=function(_ref11){var a=_ref11.messages;return React.createElement('div',{className:'messages'},React.createElement('ul',null,a.slice(-4).reverse().map(function(b,c){return React.createElement('li',{key:'msg-'+c+'-'+b,className:'msg-'+c},b)})))},mapStateToMessageCenterProps=function(_ref12){var a=_ref12.ui;return{messages:a.messages}},MessageCenter=ReactRedux.connect(mapStateToMessageCenterProps)(cMessageCenter),cSettings=function(a){function b(){var p,h,l,m;_classCallCheck(this,b);for(var n=arguments.length,g=Array(n),o=0;o<n;o++)g[o]=arguments[o];return m=(h=(l=_possibleConstructorReturn(this,(p=b.__proto__||Object.getPrototypeOf(b)).call.apply(p,[this].concat(g))),l),l.handleKeyPress=function(q){switch(q.keyCode){case 70:l.props.toggleFogMode();break;case 82:l.manualRestart();break;default:}},l.manualRestart=function(){l.props.restartGame(),setTimeout(function(){return l.props.triggerOpeningMessages()},500)},h),_possibleConstructorReturn(l,m)}return _inherits(b,a),_createClass(b,[{key:'componentDidMount',value:function componentDidMount(){window.addEventListener('keydown',throttle(this.handleKeyPress,80))}},{key:'componentWillUnmount',value:function componentWillUnmount(){window.removeEventListener('keydown',throttle(this.handleKeyPress,80))}},{key:'render',value:function render(){var _props=this.props,g=_props.fogMode,h=_props.toggleFogMode;return React.createElement('div',{className:'settings'},React.createElement('div',{className:'settings-item',onClick:h,role:'presentation'},React.createElement('input',{id:'toggleFogMode',type:'checkbox',checked:g}),React.createElement('label',{className:'settings-label',htmlFor:'toggle'},'Fog Mode')),React.createElement('div',{className:'settings-item',onClick:this.manualRestart,role:'presentation'},React.createElement('span',{className:'settings-label',role:'button'},'Restart Game')))}}]),b}(React.Component),mapStateToSettingsProps=function(_ref14){var a=_ref14.ui;return{fogMode:a.fogMode}},mapDispatchToSettingsProps=function(a){return{toggleFogMode:function toggleFogMode(){return a(_toggleFogMode())},restartGame:function restartGame(){return a(_restartGame())},triggerOpeningMessages:function triggerOpeningMessages(){return a(openingMessages(restart))}}},Settings=ReactRedux.connect(mapStateToSettingsProps,mapDispatchToSettingsProps)(cSettings),Stat=function(_ref15){var a=_ref15.icon,b=_ref15.title,c=_ref15.value,d=_ref15.health,f=_ref15.xpLeft;return React.createElement('div',{className:'stats-item'},a&&React.createElement('div',{className:'icon cell '+a}),'weapon'===a?React.createElement('div',null,React.createElement('span',null,b+':'),React.createElement('br',null),React.createElement('span',null,''+c)):React.createElement('span',null,b+': '+c),d&&React.createElement('div',null,React.createElement('span',null,'Health: '+d),React.createElement('br',null),React.createElement('span',null,'XP to Lvl Up: '+f)))},Stats=function(_ref16){var a=_ref16.grid,b=_ref16.player;return React.createElement('div',{className:'stats'},React.createElement(Stat,{icon:'player',title:'Player Lvl',value:Math.floor(b.xp/30),health:b.health,xpLeft:30-b.xp%30}),React.createElement(Stat,{icon:'weapon',title:'Weapon',value:b.weapon.name+' ['+b.weapon.damage+']'}),React.createElement(Stat,{icon:'bg bg-'+a.dungeonLvl,title:'Dungeon Lvl',value:a.dungeonLvl.toString().slice(-1).match(/[1-4]/)?a.dungeonLvl.toString().slice(-1):'\u221E'}))},cApp=function(a){return React.createElement('div',null,React.createElement(Header,{lvl:a.grid.dungeonLvl}),React.createElement('div',{id:'app'},React.createElement(Stats,{player:a.player,grid:a.grid}),React.createElement(Dungeon,null),React.createElement(Settings,null),React.createElement(MessageCenter,null)))},mapStateToAppProps=function(_ref17){var a=_ref17.grid,b=_ref17.player;return{grid:a,player:b}},App=ReactRedux.connect(mapStateToAppProps)(cApp),gridInitialState={entities:[[]],dungeonLvl:0,playerPosition:[]},playerInitialState={health:100,xp:30,weapon:{name:'Pistol',damage:13}},messages=[],uiInitialState={fogMode:!0,messages:messages},grid=function(){var c=0<arguments.length&&arguments[0]!==void 0?arguments[0]:gridInitialState,_ref18=arguments[1],a=_ref18.type,b=_ref18.payload;switch(a){case CHANGE_ENTITY:{var _payload$coords=_slicedToArray(b.coords,2),d=_payload$coords[0],f=_payload$coords[1],g=React.addons.update(c.entities,_defineProperty({},f,_defineProperty({},d,{$set:b.entity})));return _extends({},c,{entities:g})}case CHANGE_PLAYER_POSITION:return _extends({},c,{playerPosition:b});case CREATE_LVL:return _extends({},c,{playerPosition:b.playerPosition,entities:b.entities});case SET_DUNGEON_LVL:return _extends({},c,{dungeonLvl:b});default:return c;}},player=function(){var c=0<arguments.length&&arguments[0]!==void 0?arguments[0]:playerInitialState,_ref19=arguments[1],a=_ref19.type,b=_ref19.payload;return a===ADD_XP?_extends({},c,{xp:c.xp+b}):a===CHANGE_HEALTH?_extends({},c,{health:b}):a===CHANGE_WEAPON?_extends({},c,{weapon:b}):a===RESTART?playerInitialState:c},ui=function(){var c=0<arguments.length&&arguments[0]!==void 0?arguments[0]:uiInitialState,_ref20=arguments[1],a=_ref20.type,b=_ref20.payload;return a===NEW_MSG?_extends({},c,{messages:[].concat(_toConsumableArray(c.messages),[b])}):a===TOGGLE_FOG_MODE?_extends({},c,{fogMode:!c.fogMode}):a===RESTART?uiInitialState:c},reducers=Redux.combineReducers({grid:grid,player:player,ui:ui}),createStoreWithMiddleware=Redux.applyMiddleware(ReduxThunk.default)(Redux.createStore);ReactDOM.render(React.createElement(ReactRedux.Provider,{store:createStoreWithMiddleware(enableBatching(reducers))},React.createElement(App,null)),document.getElementById('root'));
