var axios = require('axios');

var id = '26a9fb6a926836bc77b7';
var secret = 'db08c23916375e6782dee0e189ed026628d53d39';
var params = '?client_id=' + id + '&client_secret=' + secret;


function getProfile (username) {
  return axios.get('https://api.github.com/users/' + username + params)
    .then(function (user) {
      return user.data;
    });
}

function getRepo (username) {
  return axios.get('https://api.github.com/users/' + username + '/repos' + params + '&per_page=100')
}

function getStarCount (repos) {
  return repos.data.reduce(function(count, repo) {
    return count + repo.stargazers_count;
  }, 0);
}

function calculateScore (profile, repos) {
  var followers = profile.followers;
  var totalStars = getStarCount(repos);

  return (followers*3) + totalStars;
}

function handleError (error) {
  console.warn(error);
  return null;
}

function getUserData (player) {
  // .all() takes in array of promises, once all promises resolved => then execute function
  return axios.all([
    getProfile(player),
    getRepo(player)
  ]).then(function (data) {
    var profile = data[0];  //data[0] returned from first promises
    var repos = data[1];

    return {
      profile: profile,
      score: calculateScore(profile, repos)
    }
  })
}

function sortPlayers (players) {
  return players.sort(function (a, b) {
    return b.score - a.score;
  })
}

/* 
Example

api.battle(['tyler', 'erik'])
  .then(function (players) {
    console.log(players[0]);
    console.log(players[1]);
  })

*/


module.exports = {
  battle: function (players) {
    return axios.all(players.map(getUserData))  //return array of promises, each is getUserData(player), return array of userData
      .then(sortPlayers)  //sort over userData
      .catch(handleError);
  },
  fetchPopularRepos: function (language) {
    var encodedURI = window.encodeURI('https://api.github.com/search/repositories?q=stars:>1+language:' + language + '&sort=stars&order=desc&type=Repositories');

    return axios.get(encodedURI)
      .then(function (response) {
        return response.data.items;
      })
  }
}