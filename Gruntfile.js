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
                'dist/squishy-pants.js',
                'src/*.js',
                'test/*.js'
            ]
        },
        nodeunit: {
            all: [
                'test/*.js'
            ]
        }
    });

    grunt.loadNpmTasks('grunt-rigger');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-nodeunit');

    grunt.registerTask('default', ['rig', 'jshint', 'nodeunit']);
};