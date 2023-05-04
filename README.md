# Project Title

A brief description of what this project does and who it's for

Clone the project using git clone https://github.com/acreturs/private_progress_truffle.git

this creates a new folder in your current directory

Move into this directory using cd private_progress_truffle in the terminal or open the folder using vs code

when you open your vs code terminal your current directory should end with ~./private_progress_truffle

Now you need to donwload everything important

1. type into the terminal npm install
2. run node --version and check that your current version is 18.something
   otherwise update it
3. Go into your github profile -> settings -> developer settings -> generate a new access key.
4. Paste this key into the app.js file into the main method: const authToken = 'Bearer your_key'
5. now create a new file in your folder .env
   6 go into the .env file and paste this code into it: OPENAI_API_KEY="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"
6. Please don´t share the key.
7. Now you can just type node app.js into the terminal and open the localhost:3000 on your device :)
