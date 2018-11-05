const request = require('request');
const billboard = require('billboard-top-100').getChart;
const Lyricist = require('lyricist/node6');
const accessToken = 'Wv5GEVqpDZqz-OoPmWMcM6IQ2E4meivxx5HL-05as2cVsD1nRz0rQbEIPuXiQeCr'
const lyricist = new Lyricist(accessToken);
const Sentiment = require('sentiment');
const sentiment = new Sentiment();
const fs = require('fs');

var stream = fs.createWriteStream("./file.txt");

function lookupScore(title, callback) {
  return new Promise(function(resolve, reject) {
    request(`http://api.genius.com/search?q=${title.replace(" ","%20")}`, {'auth': {'bearer': accessToken}},
      function(error, response, body) {
        console.log('error:', error);
        console.log('statusCode:', response && response.statusCode);
        if (JSON.parse(body).response.hits[0]) {
          const id = JSON.parse(body).response.hits[0].result.id;
          lyricist.song(id, { fetchLyrics: true }).then(song => {
            score = sentiment.analyze(song.lyrics).score
            data = `${title},${score}\n`
            console.log(data)
            stream.write(data)
            resolve(score)
          });
        }
        else resolve(-1)
      })
  })
}

billboard('hot-100', function(err, songs) {
  if (err) console.log(err);
  songs.map(d => {
    lookupScore(d.title).then(function(score) {
      console.log(d.title,score)
    })
  })
})