"use strict";var _typeof="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(a){return typeof a}:function(a){return a&&"function"==typeof Symbol&&a.constructor===Symbol&&a!==Symbol.prototype?"symbol":typeof a},_extends=Object.assign||function(a){for(var c,b=1;b<arguments.length;b++)for(var d in c=arguments[b],c)Object.prototype.hasOwnProperty.call(c,d)&&(a[d]=c[d]);return a};function _classCallCheck(a,b){if(!(a instanceof b))throw new TypeError("Cannot call a class as a function")}function _possibleConstructorReturn(a,b){if(!a)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return b&&("object"===("undefined"==typeof b?"undefined":_typeof(b))||"function"==typeof b)?b:a}function _inherits(a,b){if("function"!=typeof b&&null!==b)throw new TypeError("Super expression must either be null or a function, not "+("undefined"==typeof b?"undefined":_typeof(b)));a.prototype=Object.create(b&&b.prototype,{constructor:{value:a,enumerable:!1,writable:!0,configurable:!0}}),b&&(Object.setPrototypeOf?Object.setPrototypeOf(a,b):a.__proto__=b)}var BATCH_ACTIONS="BATCH_ACTIONS",ADD_XP="ADD_XP",CHANGE_ENTITY="CHANGE_ENTITY",CHANGE_HEALTH="CHANGE_HEALTH",CHANGE_PLAYER_POSITION="CHANGE_PLAYER_POSITION",CHANGE_WEAPON="CHANGE_WEAPON",CREATE_LVL="CREATE_LVL",NEW_MSG="NEW_MSG",RESTART="RESTART",SET_DUNGEON_LVL="SET_DUNGEON_LVL",TOGGLE_FOG_MODE="TOGGLE_FOG_MODE";function batchActions(a){return{type:BATCH_ACTIONS,payload:a}}function enableBatching(a){return function b(c,d){switch(d.type){case BATCH_ACTIONS:return d.payload.reduce(b,c);default:return a(c,d);}}}function randomInt(a){var b=a[0],c=a[1];return Math.floor(Math.random()*(c-b+1))+b}function randomRoom(a){return{height:randomInt(a),width:randomInt(a)}}function clamp(a,b){var c=b[0],d=b[1];return Math.min(Math.max(c,a),d)}function capitalize(a){return a.charAt(0).toUpperCase()+a.slice(1)}function throttle(a,b){function c(){return d?(f=arguments,void(g=this)):void(d=!0,a.apply(this,arguments),setTimeout(function(){d=!1,f&&(c.apply(g,f),f=g=null)},b))}var d=!1,f,g;return c}var gridWidth=60,gridHeight=40,maxRooms=15,roomSizeRange=[5,15],createDungeon=function(){for(var b=function(o,p){var q=p.x,s=p.y,t=p.width,u=t===void 0?1:t,v=p.height,w=v===void 0?1:v;if(1>q||1>s||q+u>o[0].length-1||s+w>o.length-1)return!1;for(var z=s-1;z<s+w;z++)for(var A=q-1;A<q+u;A++)if("floor"===o[z][A].type)return!1;return!0},c=function(o,p){for(var q=p.x,s=p.y,t=p.width,u=t===void 0?1:t,v=p.height,w=v===void 0?1:v,z=2>=arguments.length||arguments[2]===void 0?"floor":arguments[2],A=s;A<s+w;A++)for(var B=q;B<q+u;B++)o[A][B]={type:z};return o},d=function(o,p){var q=p.x,s=p.y,t=p.width,u=p.height,v=2>=arguments.length||void 0===arguments[2]?roomSizeRange:arguments[2],w=[],z=randomRoom(v);z.x=randomInt([q,q+(t-1)]),z.y=s-z.height-1,z.doorX=randomInt([z.x,Math.min(z.x+z.width,q+t)-1]),z.doorY=s-1;var A=randomRoom(v);A.x=q+t+1,A.y=randomInt([s,u+(s-1)]),A.doorX=A.x-1,A.doorY=randomInt([A.y,Math.min(A.y+A.height,s+u)-1]);var B=randomRoom(v);B.x=randomInt([q,q+(t-1)]),B.y=s+u+1,B.doorX=randomInt([B.x,Math.min(B.x+B.width,q+t)-1]),B.doorY=s+u;var C=randomRoom(v);C.x=q-C.width-1,C.y=randomInt([s,u+(s-1)]),C.doorX=q-1,C.doorY=randomInt([C.y,Math.min(C.y+C.height,s+u)-1]),w.push(z,A,B,C);var D=[];return w.forEach(function(E){b(o,E)&&(o=c(o,E),o=c(o,{x:E.doorX,y:E.doorY},"door"),D.push(E))}),{grid:o,placedRooms:D}},f=[],g=0;g<gridHeight;g++){f.push([]);for(var h=0;h<gridWidth;h++)f[g].push({type:0,opacity:randomInt([40,90])/100})}var l=randomRoom(roomSizeRange);l.x=randomInt([1,gridWidth-roomSizeRange[1]-maxRooms]),l.y=randomInt([1,gridHeight-roomSizeRange[1]-maxRooms]),f=c(f,l);return function n(o,p){var q=2>=arguments.length||void 0===arguments[2]?1:arguments[2];return q+p.length>maxRooms||!p.length?o:(o=d(o,p.pop()),p.push.apply(p,o.placedRooms),q+=o.placedRooms.length,n(o.grid,p,q))}(f,[l])},createEntities=function(b){var c=1>=arguments.length||arguments[1]===void 0?1:arguments[1],d=[];4===c&&d.push({health:350,lvl:5,type:"boss"});for(var f=[],g=0;7>g;g++)f.push({health:30*c+40,lvl:randomInt([Math.max(1,c-1),c+1]),type:"enemy"});var h=[];4>c&&h.push({type:"exit"});for(var l=[{type:"player"}],m=[],g=0;5>g;g++)m.push({type:"potion"});for(var q,n=[{name:"Pistol",damage:13},{name:"Rifle",damage:17},{name:"Revolver",damage:26},{name:"Machine Gun",damage:34},{name:"Shotgun",damage:38},{name:"Rail Gun",damage:42},{name:"Cannon",damage:46},{name:"Monster Blaster",damage:50}],o=n.filter(function(u){return u.damage<10*c+10&&u.damage>10*c-10}),p=[],g=0;4>g;g++)q=Object.assign({},o[randomInt([1,o.length])-1]),q.type="weapon",p.push(q);var s=[];[d,f,h,l,m,p].forEach(function(u){for(;u.length;){var v=randomInt([1,gridWidth])-1,w=randomInt([1,gridHeight])-1;"floor"===b[w][v].type&&("player"===u[0].type&&(s=[v,w]),b[w][v]=u.pop())}});for(var g=0;g<b.length;g++)for(var t=0;t<b[0].length;t++)"door"===b[g][t].type&&(b[g][t].type="floor"),"floor"===b[g][t].type&&(b[g][t].opacity=randomInt([86,90])/100);return{entities:b,playerPosition:s}},addXP=function(b){return{type:ADD_XP,payload:b}},changeEntity=function(b,c){return{type:CHANGE_ENTITY,payload:{entity:b,coords:c}}},changeHealth=function(b){return{type:CHANGE_HEALTH,payload:b}},changePlayerPosition=function(b){return{type:CHANGE_PLAYER_POSITION,payload:b}},changeWeapon=function(b){return{type:CHANGE_WEAPON,payload:b}},_createLvl=function(b){return{type:CREATE_LVL,payload:createEntities(createDungeon(),b)}},newMsg=function(b){return{type:NEW_MSG,payload:b}},restart=function(){return{type:RESTART}},_setDungeonLvl=function(b){return{type:SET_DUNGEON_LVL,payload:b}},_toggleFogMode=function(){return{type:TOGGLE_FOG_MODE}},openingMessages=function(b){return function(c){c(newMsg((b?"Welcome back to":"Enter")+" the dungeon!")),b?setTimeout(function(){return c(newMsg("Better luck this time..."))},2e3):setTimeout(function(){return c(newMsg("Explore, battle, and survive!"))},2e3)}},_restartGame=function(){return function(b){b(newMsg("Restarting...")),setTimeout(function(){return b(batchActions([restart(),_createLvl(1),_setDungeonLvl(1)]))},500)}},_playerInput=function(b){return function(c,d){var f=d(),g=f.grid,h=f.player,l=b[0],m=b[1],n=g.playerPosition.slice(0),o=n[0],p=n[1],q=[o+l,p+m],s=g.entities[p][o],t=g.entities[p+m][o+l],u=[];switch(t.type&&"enemy"!==t.type&&"boss"!==t.type&&u.push(changeEntity({type:"floor",opacity:randomInt([86,90])/100},[o,p]),changeEntity(s,q),changePlayerPosition(q)),t.type){case"boss":case"enemy":{var v=Math.floor(h.xp/30),w=Math.floor(h.weapon.damage*(randomInt([10,13])/10)*v);if(t.health-=w,0<t.health){var z=Math.floor(randomInt([4,7])*t.lvl);if(u.push(changeEntity(t,q),changeHealth(h.health-z),newMsg(capitalize(t.type)+" attacked!"),newMsg("Damage inflicted: "+w+". Damage incurred: "+z+"."),newMsg("The "+t.type+" survived with "+t.health+" health remaining.")),0>=h.health-z){0!==h.health&&(u.push(changeHealth(0),_setDungeonLvl("death"),newMsg("Oh no! You're dead. Time to try again...")),setTimeout(function(){return c(batchActions([restart(),_createLvl(1),_setDungeonLvl(1),newMsg("Welcome back to the dungeon!")]))},4e3));break}}0>=t.health&&(u.push(addXP(10),changeEntity({type:"floor",opacity:randomInt([86,90])/100},[o,p]),changeEntity(s,q),changePlayerPosition(q),newMsg("You dealt "+w+" damage and won the battle! Way to go!")),"boss"===t.type?(setTimeout(function(){return c(_setDungeonLvl("victory"))},250),setTimeout(function(){return c(newMsg("Better yet, you beat the boss!"))},1e3),setTimeout(function(){return c(newMsg("...In other words, you won the game!"))},2e3),setTimeout(function(){return c(_restartGame())},7e3),setTimeout(function(){return c(newMsg("Try to win all over again!"))},8e3)):(setTimeout(function(){return c(newMsg("You are 10 XP stronger."))},2e3),0==(h.xp+10)%30&&setTimeout(function(){return c(newMsg("You leveled up! Now, you can deal more damage."))},2e3)));break}case"potion":if(100===h.health)c(newMsg("The potion was ineffective, as you're already in perfect health!"));else{var A=Math.min(25,100-h.health),B=25>A?"You drank the potion, and it completely restored your health!":"You drank the potion and gained 25 health. Onward!";u.push(changeHealth(h.health+A),newMsg(B))}break;case"weapon":h.weapon.name===t.name?c(newMsg("You already have the "+t.name+".")):h.weapon.damage>t.damage?(c(newMsg("You found the "+t.name+".")),setTimeout(function(){return c(newMsg("But, it's weaker than the "+h.weapon.name+", so you don't take it."))},1e3)):(u.push(changeWeapon(t),newMsg("You found the "+t.name+".")),setTimeout(function(){return c(newMsg("It inflicts "+(t.damage-h.weapon.damage)+" more damage than the "+h.weapon.name+". Excellent!"))},1e3));break;case"exit":{var C=function(){var D=g.dungeonLvl+1;return u.push(newMsg("Exit reached! Moving to Level "+D+"..."),c(_setDungeonLvl("transit-"+D))),setTimeout(function(){return c(batchActions([_setDungeonLvl(D),_createLvl(D),newMsg("Welcome to Level "+D+". Good luck!")]))},2500),"break"}();if("break"===C)break}default:}c(batchActions(u))}},Cell=function(b){var c=b.cell,d=b.distance,f=b.foggy,g=b.zone,h=c.opacity||1;if(f)if(15<d)h=0;else if(!(4<d))h=Math.min(h,1);else if(h=Math.min(h,100/Math.pow(2,d)),7<d&&12>d){var l=(randomInt([1,10])-randomInt([1,10]))/100;h-=l}return React.createElement("div",{className:c.type?c.type+" cell":"bg bg-"+g+" cell","data-coords":c.coords,style:{opacity:h}})},cDungeon=function(a){function b(){_classCallCheck(this,b);var c=_possibleConstructorReturn(this,a.call(this));return c.handleClick=function(d){if(d.target.classList.contains("cell")&&"number"==typeof c.props.grid.dungeonLvl){var f=d.target.dataset.coords.split(",").map(function(l){return+l}),g=c.props.grid.playerPosition,h=[clamp(f[0]-g[0],[-1,1]),clamp(f[1]-g[1],[-1,1])];Math.abs(h[0])!==Math.abs(h[1])&&c.props.playerInput(h)}},c.handleKeyPress=function(d){if("number"==typeof c.props.grid.dungeonLvl)switch(d.keyCode){case 38:case 87:c.props.playerInput([0,-1]);break;case 40:case 83:c.props.playerInput([0,1]);break;case 37:case 65:c.props.playerInput([-1,0]);break;case 39:case 68:c.props.playerInput([1,0]);break;default:}},c.handleResize=function(d){var f=d.target.innerWidth/c.vpWidthRatio,g=Math.max(c.vpHeightMin,d.target.innerHeight/c.vpHeightRatio);c.setState({vpWidth:f,vpHeight:g})},c.preventZoom=function(d){var f=d.timeStamp,g=d.currentTarget.dataset.lastTouch||f,h=f-g,l=d.touches.length;d.currentTarget.dataset.lastTouch=f,!h||300<h||1<l||(d.preventDefault(),d.target.click())},c.state={vpWidth:0,vpHeight:0},c.vpHeightMin=10,c.vpHeightRatio=36,c.vpWidthRatio=21,c}return _inherits(b,a),b.prototype.componentWillMount=function(){var d=window.innerWidth/this.vpWidthRatio,f=Math.max(this.vpHeightMin,window.innerHeight/this.vpHeightRatio);this.setState({vpWidth:d,vpHeight:f}),this.props.createLvl(),this.props.setDungeonLvl(1)},b.prototype.componentDidMount=function(){this.props.triggerOpeningMessages(),window.addEventListener("keydown",throttle(this.handleKeyPress,80)),window.addEventListener("resize",this.handleResize),document.getElementsByClassName("dungeon")[0].addEventListener("mousedown",throttle(this.handleClick,80)),document.getElementsByClassName("dungeon")[0].addEventListener("touchend",this.preventZoom)},b.prototype.componentWillUnmount=function(){window.removeEventListener("keydown",throttle(this.handleKeyPress,80)),window.removeEventListener("resize",this.handleResize,500),document.getElementsByClassName("dungeon")[0].removeEventListener("mousedown",throttle(this.handleClick,80)),document.getElementsByClassName("dungeon")[0].removeEventListener("touchend",this.preventZoom)},b.prototype.render=function(){var d=this,f=this.state.vpWidth-this.state.vpWidth%2,g=this.state.vpHeight-this.state.vpHeight%2,h=this.props.grid.entities,l=this.props.grid.playerPosition,m=l[0],n=l[1],o=clamp(n-g/2,[0,h.length-g]),p=Math.max(m+f/2,f),q=Math.max(n+g/2,g),s=clamp(m-f/2,[0,h[0].length-f]),t=h.map(function(v,w){return v.map(function(z,A){return z.distance=Math.abs(n-w)+Math.abs(m-A),z.coords=[A,w],z})}),u=t.filter(function(v,w){return w>=o&&w<q}).map(function(v,w){return React.createElement("div",{key:"row-"+w,className:"row","data-row":w},v.filter(function(z,A){return A>=s&&A<p}).map(function(z,A){return React.createElement(Cell,{key:"cell-"+A,cell:z,distance:z.distance,zone:d.props.grid.dungeonLvl,foggy:d.props.fogMode})}))});return React.createElement("div",{className:"dungeon"},u)},b}(React.Component),mapStateToDungeonProps=function(b){var c=b.ui,d=b.grid,f=b.player;return{fogMode:c.fogMode,grid:d,player:f}},mapDispatchToDungeonProps=function(b){return{playerInput:function(d){return b(_playerInput(d))},createLvl:function(){return b(_createLvl())},setDungeonLvl:function(d){return b(_setDungeonLvl(d))},triggerOpeningMessages:function(){return b(openingMessages())}}},Dungeon=ReactRedux.connect(mapStateToDungeonProps,mapDispatchToDungeonProps)(cDungeon),Header=function(b){var c=b.lvl;return React.createElement("div",{className:"bg-header bg-header-"+c},React.createElement("h1",null,"Dungeon Crawler"))},cMessageCenter=function(b){var c=b.messages;return React.createElement("div",{className:"messages"},React.createElement("ul",null,c.slice(-4).reverse().map(function(d,f){return React.createElement("li",{key:"msg-"+f+"-"+d,className:"msg-"+f},d)})))},mapStateToMessageCenterProps=function(b){var c=b.ui;return{messages:c.messages}},MessageCenter=ReactRedux.connect(mapStateToMessageCenterProps)(cMessageCenter),cSettings=function(a){function b(){var c,d,f;_classCallCheck(this,b);for(var g=arguments.length,h=Array(g),l=0;l<g;l++)h[l]=arguments[l];return f=(c=(d=_possibleConstructorReturn(this,a.call.apply(a,[this].concat(h))),d),d.handleKeyPress=function(m){switch(m.keyCode){case 70:d.props.toggleFogMode();break;case 82:d.manualRestart();break;default:}},d.manualRestart=function(){d.props.restartGame(),setTimeout(function(){return d.props.triggerOpeningMessages()},500)},c),_possibleConstructorReturn(d,f)}return _inherits(b,a),b.prototype.componentDidMount=function(){window.addEventListener("keydown",throttle(this.handleKeyPress,80))},b.prototype.componentWillUnmount=function(){window.removeEventListener("keydown",throttle(this.handleKeyPress,80))},b.prototype.render=function(){var d=this.props,f=d.fogMode,g=d.toggleFogMode;return React.createElement("div",{className:"settings"},React.createElement("div",{className:"settings-item",onClick:g,role:"presentation"},React.createElement("input",{id:"toggleFogMode",type:"checkbox",checked:f}),React.createElement("label",{className:"settings-label",htmlFor:"toggle"},"Fog Mode")),React.createElement("div",{className:"settings-item",onClick:this.manualRestart,role:"presentation"},React.createElement("span",{className:"settings-label",role:"button"},"Restart Game")))},b}(React.Component),mapStateToSettingsProps=function(b){var c=b.ui;return{fogMode:c.fogMode}},mapDispatchToSettingsProps=function(b){return{toggleFogMode:function(){return b(_toggleFogMode())},restartGame:function(){return b(_restartGame())},triggerOpeningMessages:function(){return b(openingMessages(restart))}}},Settings=ReactRedux.connect(mapStateToSettingsProps,mapDispatchToSettingsProps)(cSettings),Stat=function(b){var c=b.icon,d=b.title,f=b.value,g=b.health,h=b.xpLeft;return React.createElement("div",{className:"stats-item"},c&&React.createElement("div",{className:"icon cell "+c}),"weapon"===c?React.createElement("div",null,React.createElement("span",null,d+":"),React.createElement("br",null),React.createElement("span",null,""+f)):React.createElement("span",null,d+": "+f),g&&React.createElement("div",null,React.createElement("span",null,"Health: "+g),React.createElement("br",null),React.createElement("span",null,"XP to Lvl Up: "+h)))},Stats=function(b){var c=b.grid,d=b.player;return React.createElement("div",{className:"stats"},React.createElement(Stat,{icon:"player",title:"Player Lvl",value:Math.floor(d.xp/30),health:d.health,xpLeft:30-d.xp%30}),React.createElement(Stat,{icon:"weapon",title:"Weapon",value:d.weapon.name+" ["+d.weapon.damage+"]"}),React.createElement(Stat,{icon:"bg bg-"+c.dungeonLvl,title:"Dungeon Lvl",value:c.dungeonLvl.toString().slice(-1).match(/[1-4]/)?c.dungeonLvl.toString().slice(-1):"\u221E"}))},cApp=function(b){return React.createElement("div",null,React.createElement(Header,{lvl:b.grid.dungeonLvl}),React.createElement("div",{id:"app"},React.createElement(Stats,{player:b.player,grid:b.grid}),React.createElement(Dungeon,null),React.createElement(Settings,null),React.createElement(MessageCenter,null)))},mapStateToAppProps=function(b){var c=b.grid,d=b.player;return{grid:c,player:d}},App=ReactRedux.connect(mapStateToAppProps)(cApp),gridInitialState={entities:[[]],dungeonLvl:0,playerPosition:[]},playerInitialState={health:100,xp:30,weapon:{name:"Pistol",damage:13}},messages=[],uiInitialState={fogMode:!0,messages:messages},grid=function(){var b=0>=arguments.length||arguments[0]===void 0?gridInitialState:arguments[0],c=arguments[1],d=c.type,f=c.payload;switch(d){case CHANGE_ENTITY:{var g,h,l=f.coords,m=l[0],n=l[1],o=React.addons.update(b.entities,(h={},h[n]=(g={},g[m]={$set:f.entity},g),h));return _extends({},b,{entities:o})}case CHANGE_PLAYER_POSITION:return _extends({},b,{playerPosition:f});case CREATE_LVL:return _extends({},b,{playerPosition:f.playerPosition,entities:f.entities});case SET_DUNGEON_LVL:return _extends({},b,{dungeonLvl:f});default:return b;}},player=function(){var b=0>=arguments.length||arguments[0]===void 0?playerInitialState:arguments[0],c=arguments[1],d=c.type,f=c.payload;return d===ADD_XP?_extends({},b,{xp:b.xp+f}):d===CHANGE_HEALTH?_extends({},b,{health:f}):d===CHANGE_WEAPON?_extends({},b,{weapon:f}):d===RESTART?playerInitialState:b},ui=function(){var b=0>=arguments.length||arguments[0]===void 0?uiInitialState:arguments[0],c=arguments[1],d=c.type,f=c.payload;return d===NEW_MSG?_extends({},b,{messages:[].concat(b.messages,[f])}):d===TOGGLE_FOG_MODE?_extends({},b,{fogMode:!b.fogMode}):d===RESTART?uiInitialState:b},reducers=Redux.combineReducers({grid:grid,player:player,ui:ui}),createStoreWithMiddleware=Redux.applyMiddleware(ReduxThunk.default)(Redux.createStore);ReactDOM.render(React.createElement(ReactRedux.Provider,{store:createStoreWithMiddleware(enableBatching(reducers))},React.createElement(App,null)),document.getElementById("root"));
