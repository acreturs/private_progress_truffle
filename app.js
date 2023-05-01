require('dotenv').config();
const { Configuration, OpenAIApi } = require("openai");

const express = require('express');
const app = express();

// Define the function to be called when the button is clicked
async function  myServerFunction() {
    console.log("hintere Methode erreicht")
    // console.log(process.env.OPENAI_API_KEY)
    const configuration = new Configuration({
         apiKey:process.env.OPENAI_API_KEY, //process.env.OPENAI_API_KEY,
       });
    console.log("erstellt")
    return configuration;
}


async function warten(){
    myServerFunction()
    console.log("warten erreicht")
    const res = await myServerFunction()
    const openai = new OpenAIApi(res);
    console.log("was soll das");
    const completion = openai.createCompletion({
     model: "text-davinci-002",
     prompt: "Explain Harry Potter to me like I am 5 in 150 words",
     max_tokens:200,
     n:1
   });


   const com = await completion
   //console.log((await completion).data)

console.log(com.data.choices[0].text);
   
   
   console.log(com.data)
}

// Add a route to the server to handle the HTTP request from the button click
app.get('/myserverfunction', warten);
app.get('/',function(req,res){
    res.sendFile(__dirname + '/index.html');
})




// Start the server
app.listen(3000, () => {
  console.log('Server listening on port 3000');
});