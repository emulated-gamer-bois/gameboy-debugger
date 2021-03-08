const fs = require("fs");

const got = fs.readFileSync("got.txt").toString().split("\n");
const expected = fs.readFileSync("expected.txt").toString().split("\n");
var fail = false;

for (var i = 0; i < got.length - 1; i++) {
  if (got[i] == "#") continue;
  if (got[i] !== expected[i]) {
    console.log("Failed at line: ", i);
    console.log("Expected: \n", expected[i - 1], "\n", expected[i]);
    console.log("\n\nGot: \n", got[i - 1], "\n", got[i]);
    fail = true;
    break;
  }
}

if (!fail) {
  console.log("Success");
}
