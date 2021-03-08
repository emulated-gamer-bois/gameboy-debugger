const fs = require("fs");
const { argv } = require("process");

const startAt = Number(argv[2]);

const got = fs.readFileSync("got.txt").toString().split("\n");
const expected = fs.readFileSync("expected.txt").toString().split("\n");
var fail = false;

for (var i = 0; i < got.length - 1; i++) {
  if (got[i] == "#") continue;
  if (got[i] !== expected[i + startAt]) {
    console.log("Failed at line: ", i + startAt);
    console.log(
      "Expected: \n",
      expected[i + startAt - 1],
      "\n",
      expected[i + startAt]
    );
    console.log("\n\nGot: \n", got[i - 1], "\n", got[i]);
    fail = true;
    break;
  }
}

if (!fail) {
  console.log("Success");
}
