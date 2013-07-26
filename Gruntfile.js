module.exports = function (grunt) {
    grunt.initConfig({
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
        }
    });

    grunt.loadNpmTasks('grunt-rigger');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-nodeunit');
    grunt.loadNpmTasks('grunt-contrib-uglify');

    grunt.registerTask('default', ['rig', 'jshint', 'nodeunit', 'uglify']);
};