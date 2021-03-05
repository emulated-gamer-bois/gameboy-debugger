package main

import (
	"fmt"
	"io/ioutil"
	"strings"
)

func main() {
	got, err := ioutil.ReadFile("got.txt")
	if err != nil {
		panic(err)
	}

	expected, err := ioutil.ReadFile("expected.txt")
	if err != nil {
		panic(err)
	}

	got_lines := strings.Split(string(got), "\n")
	expected_lines := strings.Split(string(expected), "\n")
	failed := false

	for i := 0; i < len(got_lines)-1; i++ {
		if got_lines[i] == "#" {
			continue
		}
		if expected_lines[i] != got_lines[i] {
			fmt.Printf("Failed at line: %d\n", i)
			fmt.Println("Expected:")
			if i != 0 {
				fmt.Println(expected_lines[i-1])
				fmt.Println(expected_lines[i])
				fmt.Println("\nGot:")
				fmt.Println(got_lines[i-1])
				fmt.Println(got_lines[i])
			} else {
				fmt.Println(expected_lines[i])
				fmt.Println("\nGot:")
				fmt.Println(got_lines[i])
			}
			failed = true
			break
		}
	}
	if !failed {
		fmt.Println("Passed")
	}
}
