module.exports.server=function(serv)
{
  serv.broadcast = (message, {whitelist=serv.players,blacklist=[],system=false}={}) => {
    if (whitelist.type == 'player') whitelist = [whitelist];

    if (typeof message == 'string') message = serv.parseClassic(message);

    whitelist.filter(w => blacklist.indexOf(w) == 0).forEach(player => {
      if (!system) player.chat(message);
      else player.system(message);
    });
  }

  serv.color = {
    'black': '&0',
    'dark_blue': '&1',
    'dark_green': '&2',
    'dark_cyan': '&3',
    'dark_red': '&4',
    'purple': '&5',
    'dark_purple': '&5',
    'gold': '&6',
    'gray': '&7',
    'grey': '&7',
    'dark_gray': '&8',
    'dark_grey': '&8',
    'blue': '&9',
    'green': '&a',
    'aqua': '&b',
    'cyan': '&b',
    'red': '&c',
    'pink': '&d',
    'light_purple': '&d',
    'yellow': '&e',
    'white': '&f',
    'random': '&k',
    'obfuscated': '&k',
    'bold': '&l',
    'strikethrough': '&m',
    'underlined': '&n',
    'underline': '&n',
    'italic': '&o',
    'italics': '&o',
    'reset': '&r'
  };

  serv.parseClassic = (message) => {
    var messageList = [];
    var text = '';
    var nextChanged = false;
    var color = 'white';
    var bold = false;
    var italic = false;
    var underlined = false;
    var strikethrough = false;
    var random = false;
    var colors = ['0','1','2','3','4','5','6','7','8','9','a','b','c','d','e','f', 'k','l','m','n','o','r','&']
    var convertColor = ['black', 'dark_blue','dark_green','dark_cyan','dark_red','dark_purple','gold',
                        'gray', 'dark_gray', 'blue', 'green', 'aqua', 'red', 'light_purple', 'yellow', 'white',
                        'random', 'bold', 'strikethrough', 'underlined', 'italic', 'reset', '&'];

    function createJSON() {
      if (!text.trim()) return;
      messageList.push({
        text: text,
        color: color,
        bold: bold,
        italic: italic,
        underlined: underlined,
        strikethrough: strikethrough,
        obfuscated: random
      });
      text = '';
    }

    while (message != '') {
      var currChar = message[0];
      if (nextChanged) {
        var newColor = convertColor[colors.indexOf(currChar)];
        if (newColor) {
          if (newColor == 'bold') bold = true;
          else if (newColor == 'strikethrough') strikethrough = true;
          else if (newColor == 'underlined') underlined = true;
          else if (newColor == 'italic') italic = true;
          else if (newColor == 'random') random = true;
          else if (newColor == '&') text += '&';
          else if (newColor == 'reset') {
            strikethrough = false;
            bold = false;
            underlined = false;
            random = false;
            italic = false;
            color = 'white';
          } else color = newColor;
        }
        nextChanged = false;
      } else if (currChar == '&') {
        if (nextChanged) {
          text += '&';
          nextChanged = false;
        } else {
          nextChanged = true;
          createJSON();
        }
      } else {
        text += currChar;
      }

      message = message.slice(1, message.length);
    }
    createJSON();

    return {
      text: '',
      extra: messageList
    }
  }
};

module.exports.player=function(player,serv)
{
  player._client.on('chat', ({message} = {}) => {
    if(message[0]=="/") {
      player.behavior('command', {command: message.slice(1)}, ({command}) => player.handleCommand(command));
    }
    else {
      player.behavior('chat', {
        message: message,
        broadcastMessage: '<' + player.username + '>' + ' ' + message
      }, ({broadcastMessage}) => {
        serv.broadcast(broadcastMessage);
      });
    }
  });

  player.chat = message => {
    if (typeof message == 'string') message = serv.parseClassic(message);
    player._client.write('chat', { message: JSON.stringify(message), position: 0 });
  };

  player.system = message => {
    if (typeof message == 'string') message = serv.parseClassic(message);
    player._client.write('chat', { message: JSON.stringify(message), position: 2 });
  };
};