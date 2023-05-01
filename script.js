const fs = require("fs");

fs.readFile("test.md", "utf8", function (err, data) {
  if (err) {
    console.error(err);
    return;
  }
  console.log("klappt");
  const fileContents = data.toString();
  console.log(fileContents);
});
