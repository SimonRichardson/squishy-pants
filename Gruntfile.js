module.exports = function (grunt) {
    var fs = require('fs'),
        path = require('path'),
        files = fs.readdirSync('test'),
        config = {
            pkg: grunt.file.readJSON('package.json'),
            rig: {
                compile: {
                    options: {
                        banner: '/* Compiled : <%= grunt.template.today("yyyy-mm-dd HH:MM") %> */\n'
                    },
                    files: {
                        'bin/squishy-pants.js': [
                            'lib/rigger/rigger.js'
                        ]
                    }
                }
            },
            jshint: {
                all: [
                    'Gruntfile.js',
                    'bin/squishy-pants.js',
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
                        beautify: false,
                        sourceMap: 'bin/squishy-pants.min.map.js'
                    },
                    files: {
                        'bin/squishy-pants.min.js': ['bin/squishy-pants.js']
                    }
                }
            },
            parallel: {
                tests: {
                    tasks: []
                }
            }
        };

    // We should make a `par` task which does this and then calls parallel.
    files.forEach(function(filename){
        if (path.extname(filename) === '.js') {
            config.parallel.tests.tasks.push({
                cmd: 'nodeunit',
                args: ['test/' + filename]
            });
        }
    });

    grunt.initConfig(config);

    grunt.loadNpmTasks('grunt-rigger');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-nodeunit');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-parallel');

    grunt.registerTask('default', ['rig', 'jshint', 'nodeunit', 'uglify']);
    grunt.registerTask('tests', ['rig', 'jshint', 'parallel', 'uglify']);
};