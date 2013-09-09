module.exports = function (grunt) {
    var config = {
            pkg: grunt.file.readJSON('package.json'),
            rig: {
                compile: {
                    options: {
                        banner: '/* Compiled : <%= grunt.template.today("yyyy-mm-dd HH:MM") %> */\n'
                    },
                    files: {
                        'lib/squishy-pants.js': [
                            'lib/rigger/rigger.js'
                        ]
                    }
                }
            },
            jshint: {
                all: [
                    'Gruntfile.js',
                    'lib/squishy-pants.js',
                    'src/*.js',
                    'test/*.js'
                ]
            },
            nodeunit: {
                all: [
                    'test/*.js'
                ]
            },
            uglify: {
                all: {
                    options: {
                        beautify: false
                    },
                    files: {
                        'squishy-pants.js': ['lib/squishy-pants.js']
                    }
                }
            },
            parallel: {
                tests: {
                    tasks: []
                }
            },
            par: {
                all: {
                    dest: 'test',
                    numOfParallel: 2
                }
            }
        };

    grunt.initConfig(config);

    grunt.loadNpmTasks('grunt-rigger');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-nodeunit');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-parallel');

    grunt.registerMultiTask('par', 'Run parallel unit tests with nodeunit.', function() {
        var fs = require('fs'),
            path = require('path'),
            options = this.data,
            files = fs.readdirSync(options.dest),
            optionalNumOfParallel = grunt.option('numOfParallel');

        if (optionalNumOfParallel) {
             options.numOfParallel = parseInt(optionalNumOfParallel, 10);
        }

        // We should make a `par` task which does this and then calls parallel.
        files.forEach(function(filename, index){
            if (path.extname(filename) === '.js') {
                var i = (index % parseInt(options.numOfParallel, 10)),
                    accessor = 'Parallel - ' + i;

                if (!config.parallel[accessor]) {
                    config.parallel[accessor] = {
                        tasks: []
                    };
                }
                config.parallel[accessor].tasks.push({
                    cmd: 'nodeunit',
                    args: ['test/' + filename]
                });
            }
        });

        grunt.initConfig(config);
        grunt.task.run(['rig', 'jshint', 'parallel']);
    });

    grunt.registerTask('default', ['rig', 'jshint', 'nodeunit', 'uglify']);
};