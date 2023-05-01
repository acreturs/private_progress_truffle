require("dotenv").config();
const { Configuration, OpenAIApi } = require("openai");

const express = require("express");
const app = express();

async function createConfiguration() {
  const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
  });
  console.log("Configuration erstellt");
  return configuration;
}

/*
Requests the Answer from Chatgtp but to use await to avoid using variables without declaring them first we use an async function createConfiguration()
*/
async function openAIRequest() {
  createConfiguration();
  const res = await createConfiguration();
  const openai = new OpenAIApi(res);
  const completion = openai.createCompletion({
    model: "text-davinci-002",
    prompt: "Explain Harry Potter to me like I am 5 in 150 words",
    max_tokens: 200,
    n: 1,
  });

  const com = await completion; //hier noch mit Infos rumspelen
  console.log(com.data.choices[0].text);
}

/*
The get request via express.js towards localhost/requestURL. This routing is 
currently just used for organizational purposes.
*/
app.get("/requestURL", openAIRequest);

/*
import the HTML file to send to the client 
*/
app.get("/", function (req, res) {
  res.sendFile(__dirname + "/index.html");
});

/*
Localhost is currently running on port 3000
*/
app.listen(3000, () => {
  console.log("Läuft auf 3k");
});
