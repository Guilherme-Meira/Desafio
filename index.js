const fs = require('fs');
const request = require('request');
const path = require('path');
const crypto = require('crypto');

request('https://api.codenation.dev/v1/challenge/dev-ps/generate-data?token=ce0cb2f53cecdd9d4704673e2509dca8c3ac4259',
  function (error, response, body) {
    console.log('error:', error); // Print the error if one occurred
    console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
    console.log('body:', body); // Print the JSON.

    // Create file JSON
    saveJson(body);

    // Create a object from JSON
    obj = JSON.parse(body);

    // Decipher the text ciphered
    const textDeciphered = decodeCesar(obj.cifrado, obj.numero_casas);
    console.log('Texto decifrado', textDeciphered);

    // Saves the deciphered text to obj
    obj.decifrado = textDeciphered;

    // Sha1
    obj.resumo_criptografico = createSha1Hash(obj.decifrado);
    console.log('resumo criptografico', obj.resumo_criptografico);

    // Update JSON
    saveJson(obj);

    // Send created file
    sendFile(obj.token);
  });


// Send the file to the api
function sendFile(token) {
  const options = {
    method: 'POST',
    url: `https://api.codenation.dev/v1/challenge/dev-ps/submit-solution?token=${token}`,
    port: 443,
    headers: {
      'Content-Type': 'multipart/form-data'
    },
    formData: {
      'answer': readJson()
    }
  };

  request(options, (error, res, body) => {
    if (error) {
      console.error(error)
      return;
    }
    console.log(`statusCode: ${res.statusCode}`);
    console.log('Resposta do teste', body);
  });
}

// Cesar Cipher
function decodeCesar(text, units) {
  return text.replace(/[a-zA-Z0-9]/gi, function (a) {
    let code = a.charCodeAt();
    code = code == 97 ? 123 : code;

    return String.fromCharCode(code - units);
  });
}

// Sha1 Cipher
function createSha1Hash(text) {
  return crypto.createHash('sha1').update(text).digest('hex');
}

// Save json in ./temp
function saveJson(obj) {
  let json = JSON.stringify(obj);
  fs.writeFileSync(path.join(__dirname, 'temp/answers.json'), json);
}

// Create a stream to read json
function readJson(obj) {
  return fs.createReadStream(path.join(__dirname, 'temp/answers.json'));
}