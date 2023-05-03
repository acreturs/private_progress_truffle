require("dotenv").config();
const { Configuration, OpenAIApi } = require("openai");
const fs = require("fs");

const express = require("express");
const { resolve } = require("path");
const { rejects } = require("assert");
const app = express();
const axios = require("axios");
const cheerio = require("cheerio");
const showdown = require("showdown");
const readline = require("readline").createInterface({
  input: process.stdin,
  output: process.stdout,
});

/*
Erstellt konfiguration, allerdings auch nicht Notwendig dem Turbo
*/
async function createConfiguration() {
  const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
  });
  return configuration;
}

/*
liest eine lokale readme datei aus. Nicht Nötig, wenn wir es als String kriegen
*/
async function convertReadMe() {
  const promise = new Promise((klappt, error) => {
    fs.readFile("max.txt", "utf8", function (err, data) {
      if (err) {
        console.error(err);
        return;
      }

      const readme = data.toString();
      klappt(readme);
    });
  });

  return promise;
}

/*
Requests answer from ChatGTP using the Turbo model
*/
async function openAIRequestTurbo(readME) {
  const readme = await convertReadMe(); //here something wrong with the await
  const question =
    "The following text describes a prorgamming project that is current in development. Explain to me what the project is trying to archieve without telling me" +
    "how they are doing so. Please use arround 50 words and don´t get to technical" +
    readME;
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + process.env.OPENAI_API_KEY,
    },
    method: "POST",
    body: JSON.stringify({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content:
            "You are a Computer Science Teacher to his students without tehcnical knowledge",
        },
        {
          role: "user",
          content: question,
        },
      ],
    }),
  });

  const data = await response.json();
  const content = data.choices[0].message.content;
  console.log(content);
}

/* This function is not needed as long as we use turbo
async function openAIRequest() {
  const res = await createConfiguration();
  const openai = new OpenAIApi(res);
  const readme = await convertReadMe(); 
  const question =
    "The following text describes a prorgamming project that is current in development. Explain to me what the project is trying to archieve without telling me" +
    "how they are doing so" +
    readme;

  const completion = openai.createCompletion({
    model: "text-davinci-003",
    prompt: question,
    max_tokens: 250,
    n: 1,
  });
  const com = await completion; //hier noch mit Infos rumspelen
  console.log("Antwort generiert:");
  console.log(com.data.choices[0].text);
}
*/

/*
The get request via express.js towards localhost/requestURL. This routing is 
currently just used for organizational purposes.
*/
//app.use("/requestURL", openAIRequestTurbo);

app.use("/requestDay", callDay);
app.use("/requestWeek", callWeek);
app.use("/requestMonth", callMonth);

function callDay() {
  main(0);
}

function callWeek() {
  main(1);
}

function callMonth() {
  main(2);
}

/*
import the HTML file to send to the client 
*/
app.use("/", function (req, res) {
  res.sendFile(__dirname + "/index.html");
});

/*
Localhost is currently running on port 3000
*/
app.listen(3000, () => {
  console.log("Läuft auf 3k");
});

async function getUserInput() {
  return new Promise((resolve) => {
    readline.question(
      "From which timeframe do you want to get your data (0: daily; 1: weekly; 2: monthly): ",
      (input) => {
        resolve(input);
      }
    );
  });
}
/** Fetches the repo owner and name for each repo on the GitHub trending page
 * @param userInput 0: daily; 1: weekly; 2: monthly
 * @returns an array that stores alternatingly the owner and the name of each repo
 */
async function fetchRepos(userInput) {
  if (userInput == 0) {
    console.log("trending from today:");
  }
  if (userInput == 1) {
    console.log("trending from this Week:");
  }
  if (userInput == 2) {
    console.log("trending from this Month:");
  }
  try {
    const timeModes = ["?since=daily", "?since=weekly", "?since=monthly"];
    const response = await axios.get(
      "https://github.com/trending" + timeModes[userInput]
    );
    const $ = cheerio.load(response.data);
    const repos = [];
    $("h2 a").each((i, el) => {
      const repoName = $(el).text().trim();
      repos.push(repoName);
    });
    var trendingSplit = [];
    // trim the repos to be correctly formatted
    repos.forEach((repo) => {
      let trimmedName = repo.replace(/\n\s+/g, "");
      trimmedName = trimmedName.replace(/\//g, "");
      const stringSplit = trimmedName.split(" ");
      trendingSplit.push(stringSplit[0]);
      trendingSplit.push(stringSplit[1]);
    });
    return trendingSplit;
  } catch (error) {
    console.error("hier passt alles");
  }
}
/**  This function imports the ReadMe.md file for a repository (if it can be located)
 * @param owner - owner of the repo
 * @param name - name of the repo
 * @returns a string containing the text of the repo
 *           returns null if the repo can't be located
 */
async function getReadme(owner, name) {
  const readmePaths = [
    `https://raw.githubusercontent.com/${owner}/${name}/release/readme.md`,
    `https://raw.githubusercontent.com/${owner}/${name}/dev/README.rst`,
    `https://raw.githubusercontent.com/${owner}/${name}/main/README.md`,
    `https://raw.githubusercontent.com/${owner}/${name}/master/README.md`,
  ];
  for (i = 0; i < readmePaths.length; i++) {
    try {
      const response = await axios.get(readmePaths[i]);
      const content = response.data;
      const converter = new showdown.Converter();
      // Use the converter object to convert Markdown to HTML to String:
      const html = converter.makeHtml(content);
      const html2 = html.toString();
      const text = html2.replace(/<[^>]*>/g, "");
      const text2 = text.replace(/\n\s+/g, "");
      const text3 = text2.replace(/\//g, "");
      return text3;
    } catch (error) {}
  }
  log.console("Couldn't locate the read me file");
  return null;
}
/** Gets the repo's information via GitHub's GraphQL API
 * @param query GraphQL query for the repo (including owner and name)
 * @param authToken personal authorization token
 * @returns the json data for the requested repo as by the graphql query
 */
async function getRepoInfo(query, authToken) {
  try {
    const response = await axios.post(
      "https://api.github.com/graphql",
      {
        query: query,
      },
      {
        headers: {
          Authorization: authToken,
        },
      }
    );
    const output = response.data.data.repository;
    return output;
  } catch (error) {
    console.log("klappt nicht");
    return null;
  }
}

async function main(number) {
  // Choose whether to scrape daily, weekly or monthly information
  // const userInput = await getUserInput();
  //readline.close();
  const trendingSplit = await fetchRepos(number);
  // your personal GitHub authToken
  const authToken = `Bearer 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`;
  // for (let i = 0; i < trendingSplit.length / 2; i++) {
  for (let i = 0; i < 1; i++) {
    const owner = trendingSplit[2 * i];
    const name = trendingSplit[2 * i + 1];
    const query = `query {
      repository(owner: "${owner}", name: "${name}") {
        name
        description
        url
        createdAt
        stargazers {
          totalCount
        }
        forks {
          totalCount
        }
        primaryLanguage {
          name
        }
      }
    }`;

    const output = await getRepoInfo(query, authToken);
    console.log(output);
    // check if the repo has more than a 1k stars
    // const stars = output.stargazers.totalCount;
    //if (stars < 1000) {
    // console.log("Wouldn't provide this entity to the frontend");
    //}
    const readme = await getReadme(owner, name);
    if (readme != null) {
      //console.log(readme);
      openAIRequestTurbo(readme);
    }
  }
  console.log("wurde returned");
  return "test string zum returnen ";
}
