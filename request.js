var request = require('request');
var PlexAPI = require('plex-api');
var       _ = require('underscore');

var plexOptions = {
    hostname: '192.168.2.199',
    port: '32400',
    username: 'nick.lenko@gmail.com',
    password: 'Vancouver',
    token: 'qYLn1ZgmuhCJcpYBbp3R'
  };

var ISY_Options = {
    urlBase: 'http://192.168.2.37',
    username: 'admin',
    password: 'admin',
    varId: '1',
    varType: '2',
    GET_URI: function() {
      return this.urlBase + '/rest/vars/get/' + this.varType;
    },
    SET_URI: function() {
      return this.urlBase + '/rest/vars/set/' + this.varType + '/' + this.varId + '/';
    },
    auth: function() {
      return "Basic " + new Buffer(this.username + ":" + this.password).toString("base64");
    }
  };

var client = new PlexAPI(plexOptions); 

var currentState = 0;

var getISYVariables = function() {
  request({
    url : ISY_Options.GET_URI(),
    headers : {
        "Authorization" : ISY_Options.auth()
    }
  },
  function (error, response, body) {
  });
};

var setISYVariable = function( value ) {
  request({
    url : ISY_Options.SET_URI() + value,
    headers : {
      "Authorization" : ISY_Options.auth()
    }
  },
  function (error, response, body) {
  });
};

var getStateId = function( state ){
  switch( state ){
    case 'playing':
      return 1;
      break;
    case 'paused':
      return 2;
      break;
    default:
      return 0;
      break;
  }
}

var checkState = function( state ){
  if (state !== currentState){
    updateState( state );
  }
}

var updateState = function( state ){
  console.log( '>>> Updating State: ', state );
  currentState = state;
  setISYVariable( state );
}

var pinger = function() {
  setInterval( function() {
    client.query("/status/sessions").then(function (result) {
      var sessions = result._children;
      if( sessions.length === 0 ){
        checkState( 0 );
      } else {
        _.each( sessions, function( session ) {
          var children = session._children;
          var player = _.findWhere(children, {
            _elementType: 'Player',
            title: 'Apple TV'
          });
          if ( player ){
            checkState(getStateId(player.state));
          } else if ( !player ){
            checkState( 0 );
          }
        } );
      }
    }, function (err) {
      throw new Error("Could not connect to server");
    });
  }, 1500);
};

pinger();