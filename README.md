# TheEmpire

## Initial Setup
1. Install [Node.js](https://nodejs.org/dist/v6.9.4/node-v6.9.4-x64.msi) `v6.9.4`

2. Clone the repo
  ``` sh
    $ git clone https://github.com/ZakMiller/TheEmpire.git
  ```

3. Install dependencies
  ``` sh
    $ npm install
    $ npm install -g gulp
  ```

4. Get Visual Studio Code Extensions ESLint and beautify.


5. Add these to the VSCode settings.json file:
``` json
{
    "editor.tabSize": 2,
    "editor.renderWhitespace": "all",
    "editor.formatOnSave": true,
    "eslint.enable": true,
    "eslint.run": "onSave",
    "eslint.autoFixOnSave": true
}
```

## Running tasks
**note:** if any of these don't work, make sure you have gulp installed globally:
``` sh
  $ npm install -g gulp
```
### Build scripts, start server, and automatically build and restart on changes:
``` sh
  $ gulp
```
Basically, this will
- restart the server whenever either `server.js` or any of the backend JavaScript files are saved, and
- build the front end scripts whenever they are saved

**note:** Make sure to refresh your browser page in order to see frontend changes.

Our build flow is
- `public/scripts/*.js --> Babel (ES6 -> ES5) --> Browserify (bundles scripts) --> public/bundle.js`

### Build scripts:
``` sh
  $ gulp build
```

## Debugging Errors
If you run into any errors when trying to start the application, consult the following checklist:

1. make sure you're up to date with the current master
  ``` sh
    $ git pull origin master
  ```

2. make sure you have all the dependencies
  ``` sh
    $ npm install
  ```
