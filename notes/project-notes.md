# Gulp Project

The goal of this [tutorial](https://semaphoreci.com/community/tutorials/getting-started-with-gulp-js) is to introduce Gulp and see it in action. We will make a quick project to demonstrate how tasks work, and how to create an integrated workflow.

## What I will learn

You will learn:

- How to set up an automated workflow.
- How to compile SASS into CSS.
- Convert templates into static HTML.
- Run tests on the code.
- Watch for changes in your files and act on it.
- Automatically reload the page in the browser after changes.
- Set up [Continuous Integration (CI)](https://semaphoreci.com/continuous-integration) for your JavaScript project.

By the end of the tutorial, you will be able to apply Gulp to your own project, customize it and be more efficient.

## Overview

1.  Install Node.js and Gulp.
2.  Create an Express project.
3.  Install NPM modules.
4.  Create gulpfile.js.
5.  Load plugins and create tasks.
6.  Run tasks from the command line.

## Prerequisites

We will use [Sass](https://sass-lang.com/) and [EJS](https://ejs.co/) templates, but having deep knowledge of them isn’t required.

## Environment Setup

Create a starter application using [express-generator](https://expressjs.com/en/starter/generator.html):

```
    $ npx express-generator -v ejs --git gulp-project
    $ cd gulp-project
    $ npm install
```

Create github repository make initial push

```
    $ git init
    $ git remote add origin YOUR_REPO_URL
    $ git add -A
    $ git commit -m "initial commit"
    $ git push origin main
```

The goal is to create an automated workflow so we want to make tasks that:

- Compile CSS files from other sources such as Sass.
- Generate HTML for static pages.
- Test the application code.
- Analyze the code with a linter.
- Start and automatically reload the application on changes.

Note that Express has the capability of plugging into templating engines by itself, but Gulp gives us more flexibility and can do a lot more thanks to the hundreds of plugins available.

## Anatomy of a Gulp Task

All Gulp configuration goes in a file called gulpfile.js located at the root of the project. The pattern for writing tasks is that you first load a plugin you’re about to use and then define a task that is based on that plugin.

1.  First, we load the Gulp functions we’ll need using require

    ```
        const { src, dest } = require("gulp");
    ```

    1.2 src: reads files and directories and creates a stream of data for further processing. Src function supports globbing and filters to better select files.

    1.3 dest: takes a directory and writes the contents of the incoming stream as files. Dest by default overwrites existing files.

2.  Now we can write our first task. A basic form of a task looks like this

    ```
        function mytask(callback) {
            // task body
            callback();
        }

        exports.mytask = mytask;
    ```

    Functions in Gulp are regular JavaScript functions that take a callback function. We’ll write the code that does the work inside the function. To mark its completion (either success or failure), we use the callback.

    2.1 To mark successful completion call callback() without arguments

    ```
        callback()
    ```

    2.2 On error, call the callback with an Error instance

    ```
        callback(new Error('Something bad has happened'));
    ```

3.  Exported functions are directly callable from the command line:

    ```
        $ gulp mytask
    ```

    3.1 You may have seen other tutorials showing the older syntax

    ```
        gulp.task('name', function() {
            //implementation of the task
        });
    ```

    It's recommended we use the new syntax now

## Installing Gulp

```
    npm install -g gulp-cli
    npm install --save-dev gulp
```

## Simple gulp task

We will create a simple task to get familiar with basic methods. To copy files, we only need to use the src and dest functions

```
    function copy(cb) {
        src('routes/*.js')
            .pipe(dest('copies'));
        cb();
    }

    exports.copy = copy;
```

This is how it works:

- src: reads JavaScript files from routes/ and passes its contents into the pipeline,
- pipe: will take output of the previous command as pipe it as an input for the next,
- dest: writes the output of previous commands to the copies/ directory.

To run the task open the terminal, navigate to the root of the project and run gulp command and task name as a parameter, like this:

```
    $ gulp copy
```

You can also pass arrays, or use globs with src and dest:

- folder/\*.html – will match all the HTML files in folder.
- root/\*_/_.html – will match all the HTML files in all the folders from root to its children.
- ['**/*.js', '!node_modules/'] – will find recursively \*.js files except those in the node_modules directory.

## Sass function

We'll create a function to compile our sass styles into CSS and store them in the public/stylesheets directory.

```
    npm install sass --save-dev
    npm install gulp-sass --save-dev
```

```
const sass = require("gulp-sass");

function generateCSS(cb) {
  src("./sass/**/*.scss").pipe(sass().on("error", sass.logError)).pipe(dest("public/stylesheets"));
  cb();
}

exports.css = generateCSS;
```

To run the task:

```
    $ gulp css
```

## EJS Templates

To process Ejs templates we have to use the gulp-ejs and gulp-rename plugin

```
    npm install gulp-ejs --save-dev
    npm install gulp-rename --save-dev
```

```
    const ejs = require("gulp-ejs");
    const rename = require("gulp-rename");


    function generateHTML(cb) {
        src("./views/index.ejs")
            .pipe(ejs({
                title: "Hello Semaphore!",
            }))
            .pipe(rename({
                extname: ".html"
            }))
            .pipe(dest("public"));
        cb();
    }

    exports.html = generateHTML;
```

Here's how it works:

- Read \*.ejs files from views/.
- Pipe them into gulp-ejs replacing variables for the values we supply to get pure HTML.
- Pipe the files into gulp-rename to change the file extension.
- Pipe everything into the public/ directory.

To generate the HTML from Ejs templates

```
    $ gulp html
```

## Linting the Code

Another interesting Gulp plugin is gulp-eslint; it runs static code analysis and reports the errors.

```
    npm install gulp-eslint --save-dev
```

And write the lint task; gulp-eslint provides a failAfterError() function to force Gulp to stop and exit with error.

```
    const eslint = require("gulp-eslint");

    function runLinter(cb) {
        return src(['**/*.js', '!node_modules/**'])
            .pipe(eslint())
            .pipe(eslint.format())
            .pipe(eslint.failAfterError())
            .on('end', function() {
                cb();
            });
    }

    exports.lint = runLinter;
```

Notice that Gulp streams emit events that we can capture with the .on keyword.

We have to supply a configuration to Eslint or it’ll fail. Create a file called .eslintrc.json in your project root:

```
    {
        "parserOptions": {
            "ecmaVersion": 6,
            "sourceType": "module",
            "ecmaFeatures": {
                "jsx": true
            }
        },
        "rules": {
            "semi": "error"
        }
    }
```

To run the task:

```
    $gulp lint
```

## Testing the code

Let us go a little bit further with testing by installing the gulp-mocha plugin

```
    $ npm install --save-dev gulp-mocha gulp-data mocha supertest
```

Mocha is a popular test framework that runs on Node and on browsers. We can run our tests as part of the Gulp pipeline.

Learn more about testing here: [Getting Started with Node.js and Mocha](https://semaphoreci.com/community/tutorials/getting-started-with-node-js-and-mocha)

Time to write some tests. We’ll use the \*.test.js pattern to identify test files; create a file called app.test.js to test the Express application:

```
    const app = require('./app');
    const request = require('supertest');

    describe('test', function() {

        let server = null;

        beforeEach(function(done) {
            server = app.listen(0, function(err) {
                if(err) { return done(err); }
                done();
            });
        });

        afterEach(function() {
            server.close();
        });

        it('Status code should be 200', function(done) {
            request(app)
                .get('/')
                .expect(200, done);
        });

        it('Test /users response', function(done) {
            request(app)
                .get('/users')
                .expect(200)
                .expect('respond with a resource', done);
        });

    });
```

To finalize, we only need to write the Gulp task:

```
    const mocha = require("gulp-mocha");

    function runTests(cb) {
        return src(['**/*.test.js'])
            .pipe(mocha())
            .on('error', function() {
                cb(new Error('Test failed'));
            })
            .on('end', function() {
                cb();
            });
    }
    exports.test = runTests;
```

## Watching for changes

Our next goal is to automatically do all the processing tasks when a change happens in the code. We accomplish this with watch method; it comes as a standard part of the Gulp so there is no need for loading a new module. We have, however, to import the keyword in gulpfile.js:

```
    const { src, dest, watch, parallel } = require("gulp");
```

Note that I have also imported the parallel function, I’ll come back to it in a bit.

watch takes as arguments:

Files to be watched.
Callback to be triggered after the change.
So we can define a task like this:

```
    function watchFiles(cb) {
        watch('views/**.ejs', generateHTML);
        watch('sass/**.scss', generateCSS);
        watch([ '**/*.js', '!node_modules/**'], parallel(runLinter, runTests));
    }

    exports.watch = watchFiles;
```

- Templates: every time a file in views/ with ejs extension is changed, generateHTML is called.
- Sass: the same thing happens with scss files in the sass/ directory.
- Tests: triggers every time a JavaScript file outside node_modules/ is modified. We’re using the parallel() function we imported at the beginning to start both functions concurrently. Gulp also provides a series() function to call functions one after the other.

The watch task will continue running until stopped:

```
    $ gulp watch
```

Now try making a change to the sass/style.scss and saving it; Gulp will automatically compile it into CSS.

## Creating Server for Live Reload

Our final task is to set up live reload on the browser. After that, we can integrate all the tasks into an efficient workflow.

First, install the [Browsersync](https://www.browsersync.io/) module:

```
    $ npm install --save-dev browser-sync
```

And add the following task to gulpfile.js:

```
    const sync = require("browser-sync").create();

    function browserSync(cb) {
        sync.init({
            server: {
                baseDir: "./public"
            }
        });

        watch('views/**.ejs', generateHTML);
        watch('sass/**.scss', generateCSS);
        watch("./public/**.html").on('change', sync.reload);
    }

    exports.sync = browserSync;
```

The task starts a local server for the static files located on public/ and installs watchers for Sass and templates as we did earlier.

To complete the setup, change the generateCSS function so it notifies Browsersync about changes in CSS:

```
    function generateCSS(cb) {
        src('./sass/**/*.scss')
            .pipe(sass().on('error', sass.logError))
            .pipe(dest('public/stylesheets'))
            **.pipe(sync.stream());**
        cb();
    }
```

BrowserSync will open a browser window when run.

```
    $ gulp sync
```

## Default Task

To complete the Gulp setup we should define a default task.

First, import the series function from gulp:

```
    const { src, dest, watch, parallel, **series** } = require("gulp");
```

Then export a default object. We can combine series and parallel to build a complete pipeline:

```
    exports.default = series(runLinter,parallel(generateCSS,generateHTML),runTests);
```

Running gulp by itself will execute the default task:

```
    $ gulp
```

We can also get a list of available tasks with --tasks:

```
    $ gulp --tasks
```

## Final Words

Gulp can be used to automatize a great number of menial tasks that are common during development. You should be able to use the final gulpfile.js as a basis for your project, with some slight modification, and you can find a plug-in for your particular need.

What makes Gulp different from Grunt for example, is the approach of piping of input and output which may result in faster execution depending on your code, and preference of code over convention, which can make configuration files easier to read and understand.

You can visit these links to learn more about Gulp:

- [Browse through the available Gulp plugins](http://gulpjs.com/plugins/).
- [Consult Gulp API](https://gulpjs.com/docs/en/api/concepts).
- [Learn more about Node.js streams](https://github.com/substack/stream-handbook).

More JavaScript tutorials:

- [Getting Started with Node.js and Mocha](https://semaphoreci.com/community/tutorials/getting-started-with-node-js-and-mocha)
- [Dockerizing a Node.js Web Application](https://semaphoreci.com/community/tutorials/dockerizing-a-node-js-web-application)
- [How To Build and Deploy a Node.js Application To DigitalOcean Kubernetes Using CI/CD](https://semaphoreci.com/blog/nodejs-digitalocean-kubernetes)
