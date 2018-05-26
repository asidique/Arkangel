var express = require('express');
var bodyParser = require('body-parser');
var app = express();
const $ = require("jquery");

const record = require('node-record-lpcm16');

// Imports the Google Cloud client library
const speech = require('@google-cloud/speech');

var firebase = require('firebase');

var config = {
  apiKey: "AIzaSyDXGdgxjWA4ze1NfgF3hPUBbCciceBfxSw",
  authDomain: "project-red-9c089.firebaseapp.com",
  databaseURL: "https://project-red-9c089.firebaseio.com",
  projectId: "project-red-9c089",
  storageBucket: "",
  messagingSenderId: "664289493194"
};

firebase.initializeApp(config);

firebase.auth().signInWithEmailAndPassword("sidiqueafg@gmail.com", "projectred").catch(function(error) {
  // Handle Errors here.
  var errorCode = error.code;
  var errorMessage = error.message;
  // ...
});

module.exports = function(app){

  app.get('/startspeech', function(req, res){
    // Creates a client
    const client = new speech.SpeechClient();

    /**
     * TODO(developer): Uncomment the following lines before running the sample.
     */
    const encoding = 'LINEAR16';
    const sampleRateHertz = 16000;
    const languageCode = 'en-US';

    const request = {
      singleUtterance: true,
      config: {
        encoding: encoding,
        sampleRateHertz: sampleRateHertz,
        languageCode: languageCode,
      },
      interimResults: false, // If you want interim results, set this to true
    };



    // Create a recognize stream
    const recognizeStream = client
      .streamingRecognize(request)
      .on('error', console.error)
      .on('data', function(data){
        process.stdout.write(
          data.results[0] && data.results[0].alternatives[0]
            ? `Transcription: ${data.results[0].alternatives[0].transcript}\n`
            : `\n\nReached transcription time limit, press Ctrl+C\n`
        );
        require("jsdom").env("", function(err, window) {

          if (err) {
              console.error(err);
              return;
          }
          var $ = require("jquery")(window);
          $.getJSON("http://api.ipify.org/?format=json", function(e) {
            var ip = e.ip.toString().replace(/\./g, "");

              var datetime = new Date(Date.now()).toLocaleString();
            firebase.database().ref('Logins/' + ip + "/Logs/" + datetime).set({
              Message: data.results[0].alternatives[0].transcript
            });
          });
        });
      }
      );





    // Start recording and send the microphone input to the Speech API
    record
      .start({
        sampleRateHertz: sampleRateHertz,
        threshold: 0.1,
        // Other options, see https://www.npmjs.com/package/node-record-lpcm16#options
        verbose: false,
        recordProgram: 'rec', // Try also "arecord" or "sox"
        silence: '1.0',
      })
      .on('error', console.error)
      .pipe(recognizeStream);

    console.log('Listening, press Ctrl+C to stop.');

  });
}
