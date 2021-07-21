# ScratchCLI
Compile Scratch programs through terminal

# Installation
+ Clone this repo
+ Go to folder and run `npm install .`

# Usage
+ `node scratch.js <sb3 file>` (Type `-h` for help)
+ To use the execution file globally, run `npm install . -g`. After that, you can use `scratch <sb3 file>`

# Testing
+ `node test.js` to run all tests (Type `-h` for help).
+ If you don't want to run all tests, do `node test.js -p [project1] [project2] ...`

# Adding to DMOJ Judge Server
+ Follow the installation above.
+ Inside judge configuration (yml file), add two links:
  - scratch: link to scratch executable (eg, /usr/bin/scratch)
  - scat_home: link to this folder

