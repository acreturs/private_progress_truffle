require("dotenv").config();
const { Configuration, OpenAIApi } = require("openai");
const fs = require("fs");

const express = require("express");
const app = express();

async function createConfiguration() {
  const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
  });
  console.log("Configuration erstellt");
  return configuration;
}

async function convertReadMe() {
  fs.readFile("test.md", "utf8", function (err, data) {
    if (err) {
      console.error(err);
      return;
    }

    const fileContents = data.toString();
    console.log(fileContents);
    return fileContents;
  });
}

/*
Requests the Answer from Chatgtp but to use await to avoid using variables without declaring them first we use an async function createConfiguration()
*/
async function openAIRequest() {
  //createConfiguration();

  const res = await createConfiguration();
  const openai = new OpenAIApi(res);
  const readme = await convertReadMe(); //here something wrong with the await 
  const question =
    "The following Text describes a programming Project that is currently in development. Sum up the important information about this project described in the text. Specifically," +
    "I would like to know how this text describes the goals and objectives of the project, what problems or issues the project is trying to address," +
    "and how the project is going to tackle them. Additionally, could you provide some general information about the Project. Please aim to write a response that is between 200 to 250 words. README: " +
    readme;
  console.log(question);
  for (var i = 0; i < 1; i++) {
    const completion = openai.createCompletion({
      model: "text-davinci-002",
      prompt: question,
      max_tokens: 250,
      n: 1,
    });
    //console.log("hier am ende");
    const com = await completion; //hier noch mit Infos rumspelen
    // console.log("hier am mitte");
    console.log(com.data.choices[0].text);
  }
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
