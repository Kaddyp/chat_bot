# Getting Started with Create Node App

### `npm init`

## Available Scripts

In the project directory, you can run:

### `node .`

Runs the app in the development mode.\
Open [http://localhost:4000](http://localhost:4000) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

# let’s start for production phase to deploy this application.

In this, we have two-phase these are -

## Webpack setup
## Dockerfile

// install webpack global
### `npm install -g webpack`
//install webpack and webpack-cli in the project
### `npm install webpack webpack-cli --save-dev`
// add below to scripts section in package.json
### `"build": "webpack"`

Now create a new file which the name webpack.config.js where we mention about starting file, output file, and target. All these are important.

when we run the below command it converts the whole project into a single file.

### `npm run build`

after the build is complete, let’s add the below npm script to the scripts section in the package.json and run the command

"prod": "node dist/final.js",
### `npm run prod`  //run this in the terminal