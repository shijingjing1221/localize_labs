'use strict';

module.exports = function(grunt) {

  // Load grunt tasks automatically, when needed
  require('jit-grunt')(grunt, {
    express: 'grunt-express-server',
    useminPrepare: 'grunt-usemin',
    ngtemplates: 'grunt-angular-templates',
    protractor: 'grunt-protractor-runner',
    injector: 'grunt-asset-injector',
    preprocess: 'grunt-preprocess'
  });

  // Time how long tasks take. Can help when optimizing build times
  require('time-grunt')(grunt);

  // Define the configuration for all the tasks
  grunt.initConfig({

    // Project settings
    pkg: grunt.file.readJSON('package.json'),
    yeoman: {
      // configurable paths
      client: require('./bower.json').appPath || 'client',
      dist: 'dist'
    },
    express: {
      options: {
        port: process.env.PORT || 9000
      },
      dev: {
        options: {
          script: 'server/app_dev.js',
          debug: true
        }
      },
      prod: {
        options: {
          script: 'dist/server/app_dev.js'
        }
      }
    },
    open: {
      server: {
        url: 'http://localhost:9000/labs/<%= pkg.name %>/'
      }
    },
    watch: {
      injectJS: {
        files: [
          '<%= yeoman.client %>/{app,components}/**/*.js',
          '!<%= yeoman.client %>/{app,components}/**/*.spec.js',
          '!<%= yeoman.client %>/{app,components}/**/*.mock.js',
          '!<%= yeoman.client %>/app/app.js'
        ],
        tasks: ['injector:scripts']
      },
      injectCss: {
        files: [
          '<%= yeoman.client %>/{app,components}/**/*.css'
        ],
        tasks: ['injector:css']
      },
      jsTest: {
        files: [
          '<%= yeoman.client %>/{app,components}/**/*.spec.js',
          '<%= yeoman.client %>/{app,components}/**/*.mock.js'
        ],
        tasks: ['newer:jshint:all', 'karma']
      },
      injectSass: {
        files: [
          '<%= yeoman.client %>/{app,components}/**/*.{scss,sass}'
        ],
        tasks: ['injector:sass']
      },
      sass: {
        files: [
          '<%= yeoman.client %>/{app,components}/**/*.{scss,sass}'
        ],
        tasks: ['sass', 'autoprefixer']
      },
      jade: {
        files: [
          '<%= yeoman.client %>/{app,components}/*',
          '<%= yeoman.client %>/{app,components}/**/*.jade'
        ],
        tasks: ['jade']
      },
      gruntfile: {
        files: ['Gruntfile_dev.js']
      },
      livereload: {
        files: [
          '{.tmp,<%= yeoman.client %>}/{app,components}/**/*.css',
          '{.tmp,<%= yeoman.client %>}/{app,components}/**/*.html',
          '{.tmp,<%= yeoman.client %>}/{app,components}/**/*.js',
          '!{.tmp,<%= yeoman.client %>}{app,components}/**/*.spec.js',
          '!{.tmp,<%= yeoman.client %>}/{app,components}/**/*.mock.js',
          '<%= yeoman.client %>/assets/images/{,*//*}*.{png,jpg,jpeg,gif,webp,svg}',
          '<%= yeoman.client %>/assets/languages/*.json'
        ],
        options: {
          livereload: true
        }
      },
      express: {
        files: [
          'server/**/*.{js,json}'
        ],
        tasks: ['express:dev', 'wait'],
        options: {
          livereload: true,
          nospawn: true //Without this option specified express won't be reloaded
        }
      }
    },

    // Make sure code styles are up to par and there are no obvious mistakes
    jshint: {
      options: {
        jshintrc: '<%= yeoman.client %>/.jshintrc',
        reporter: require('jshint-stylish')
      },
      server: {
        options: {
          jshintrc: 'server/.jshintrc'
        },
        src: ['server/{,*/}*.js']
      },
      all: [
        '<%= yeoman.client %>/{app,components}/**/*.js',
        '!<%= yeoman.client %>/{app,components}/**/*.spec.js',
        '!<%= yeoman.client %>/{app,components}/**/*.mock.js'
      ],
      test: {
        src: [
          '<%= yeoman.client %>/{app,components}/**/*.spec.js',
          '<%= yeoman.client %>/{app,components}/**/*.mock.js'
        ]
      }
    },

    // Empties folders to start fresh
    clean: {
      dist: {
        files: [{
          dot: true,
          src: [
            '.tmp',
            '<%= yeoman.dist %>/*',
            '!<%= yeoman.dist %>/.git*',
            '!<%= yeoman.dist %>/.openshift',
            '!<%= yeoman.dist %>/Procfile'
          ]
        }]
      },
      server: '.tmp'
    },

    // Add vendor prefixed styles
    autoprefixer: {
      options: {
        browsers: ['last 1 version']
      },
      dist: {
        files: [{
          expand: true,
          cwd: '.tmp/',
          src: '{,*/}*.css',
          dest: '.tmp/'
        }]
      }
    },

    // Debugging with node inspector
    'node-inspector': {
      custom: {
        options: {
          'web-host': 'localhost'
        }
      }
    },

    // Use nodemon to run server in debug mode with an initial breakpoint
    nodemon: {
      debug: {
        script: 'server/app_dev.js',
        options: {
          nodeArgs: ['--debug-brk'],
          env: {
            PORT: process.env.PORT || 9000
          },
          callback: function(nodemon) {
            nodemon.on('log', function(event) {
              console.log(event.colour);
            });

            // opens browser on initial server start
            nodemon.on('config:update', function() {
              setTimeout(function() {
                require('open')('http://localhost:8080/debug?port=5858');
              }, 500);
            });
          }
        }
      }
    },

    // Automatically inject Bower components into the app
    wiredep: {
      target: {
        src: '<%= yeoman.client %>/index_dev.html',
        ignorePath: '<%= yeoman.client %>/',
        exclude: ['/json3/', '/jquery/', '/bootstrap/', '/es5-shim/', /font-awesome.css/],
        fileTypes: {
          html: {
            replace: {
              js: function(filePath) {
                return '/*<script src="' + filePath + '"/>*/\n        window.deps.push("' + filePath.replace(/\.js$/, '') + '");';
              },
              css: '<link rel="stylesheet" href="{{filePath}}" />'
            }
          }
        }
      }
    },
    preprocess: {
      options: {
        inline: true,
        context: {
          DEBUG: false
        }
      },
      html: {
        src: [
          '<%= yeoman.dist %>/public/index_dev.html'
        ]
      }
    },

    // Reads HTML for usemin blocks to enable smart builds that automatically
    // concat, minify and revision files. Creates configurations in memory so
    // additional tasks can operate on them
    useminPrepare: {
      html: ['<%= yeoman.client %>/index_dev.html'],
      options: {
        dest: '<%= yeoman.dist %>/public'
      }
    },

    // Performs rewrites based on rev and the useminPrepare configuration
    usemin: {
      html: ['<%= yeoman.dist %>/public/{,*/}*.html'],
      css: ['<%= yeoman.dist %>/public/{,*/}*.css'],
      js: ['<%= yeoman.dist %>/public/{,*/}*.js'],
      options: {
        assetsDirs: [
          '<%= yeoman.dist %>/public',
          '<%= yeoman.dist %>/public/app/*.loader.js',
          '<%= yeoman.dist %>/public/assets/images',
          '<%= yeoman.dist %>/public/assets/languages'
        ],
        // This is so we update image references in our ng-templates
        patterns: {
          js: [
            [/(app\/.*?\.js)/gm, 'Update the JS to reference our revved JS'],
            [/(assets\/images\/.*?\.(?:gif|jpeg|jpg|png|webp|svg))/gm, 'Update the JS to reference our revved images']
          ]
        }
      }
    },

    // Allow the use of non-minsafe AngularJS files. Automatically makes it
    // minsafe compatible so Uglify does not destroy the ng references
    ngAnnotate: {
      dist: {
        files: [{
          expand: true,
          cwd: '.tmp/concat',
          src: '*/**.js',
          dest: '.tmp/concat'
        }]
      }
    },

    // Package all the html partials into a single javascript payload
    ngtemplates: {
      options: {
        // This should be the name of your apps angular module
        module: '<%= pkg.name %>App',
        usemin: 'app/app.js'
      },
      main: {
        cwd: '<%= yeoman.client %>',
        src: ['{app,components}/**/*.html'],
        dest: '.tmp/templates.js'
      },
      tmp: {
        cwd: '.tmp',
        src: ['{app,components}/**/*.html'],
        dest: '.tmp/tmp-templates.js'
      }
    },

    // Copies remaining files to places other tasks can use
    copy: {
      dist: {
        files: [{
          expand: true,
          dot: true,
          cwd: '<%= yeoman.client %>',
          dest: '<%= yeoman.dist %>/public',
          src: [
            '*.{ico,png,txt}',
            '.htaccess',
            'bower_components/**/*',
            'assets/images/{,*/}*.{png,jpg,jpeg,gif,webp}',
            'assets/fonts/**/*',
            'index_dev.html',
            'assets/languages/*.json'
          ]
        }, {
          expand: true,
          cwd: '.tmp/images',
          dest: '<%= yeoman.dist %>/public/assets/images',
          src: ['generated/*']
        }, {
          expand: true,
          dest: '<%= yeoman.dist %>',
          src: [
            'package.json',
            'server/**/*'
          ]
        }]
      },
      openshift: {
        options: {
          mode: true
        },
        files: [{
          expand: true,
          dest: '<%= yeoman.dist %>',
          src: [
            '.openshift/**/*'
          ]
        }]
      },
      styles: {
        expand: true,
        cwd: '<%= yeoman.client %>',
        dest: '.tmp/',
        src: ['{app,components}/**/*.css']
      }
    },

    // Run some tasks in parallel to speed up the build process
    concurrent: {
      server: [
        'jade',
        'sass',
      ],
      test: [
        'jade',
        'sass',
      ],
      debug: {
        tasks: [
          'nodemon',
          'node-inspector'
        ],
        options: {
          logConcurrentOutput: true
        }
      },
      dist: [
        'jade',
        'sass'
      ]
    },

    // Test settings
    karma: {
      unit: {
        configFile: 'karma.conf.js',
        singleRun: true
      }
    },

    protractor: {
      options: {
        configFile: 'protractor.conf.js'
      },
      chrome: {
        options: {
          args: {
            browser: 'chrome'
          }
        }
      }
    },

    env: {
      test: {
        NODE_ENV: 'test'
      },
      prod: {
        NODE_ENV: 'production'
      }
    },

    // Compiles Jade to html
    jade: {
      compile: {
        options: {
          pretty: true,
          data: {
            debug: false
          }
        },
        files: [{
          expand: true,
          cwd: '<%= yeoman.client %>',
          src: [
            '{app,components}/**/*.jade'
          ],
          dest: '.tmp',
          ext: '.html'
        }]
      }
    },

    // Compiles Sass to CSS
    sass: {
      server: {
        options: {
          loadPath: [
            '<%= yeoman.client %>/bower_components',
            '<%= yeoman.client %>/app',
            '<%= yeoman.client %>/components'
          ],
          compass: false
        },
        files: {
          '.tmp/app/app.css': '<%= yeoman.client %>/app/app.scss'
        }
      }
    },

    injector: {
      options: {

      },
      // Inject application script files into index_dev.html (doesn't include bower)
      scripts: {
        options: {
          transform: function(filePath) {
            filePath = filePath.replace('/client/', '').replace('/.tmp/', '');
            return '/*<script src="' + filePath + '"/>*/\n        window.deps.push("' + filePath.replace('.js', '') + '");';
          },
          starttag: '<!-- injector:js -->',
          endtag: '<!-- endinjector -->'
        },
        files: {
          '<%= yeoman.client %>/index_dev.html': [
            ['{.tmp,<%= yeoman.client %>}/{app,components}/**/*.js',
              '!{.tmp,<%= yeoman.client %>}/app/app.js',
              '!{.tmp,<%= yeoman.client %>}/{app,components}/**/*.spec.js',
              '!{.tmp,<%= yeoman.client %>}/{app,components}/**/*.mock.js'
            ]
          ]
        }
      },

      // Inject component scss into app.scss
      sass: {
        options: {
          transform: function(filePath) {
            filePath = filePath.replace('/client/app/', '');
            filePath = filePath.replace('/client/components/', '');
            return '@import \'' + filePath + '\';';
          },
          starttag: '// injector',
          endtag: '// endinjector'
        },
        files: {
          '<%= yeoman.client %>/app/app.scss': [
            '<%= yeoman.client %>/{app,components}/**/*.{scss,sass}',
            '!<%= yeoman.client %>/app/app.{scss,sass}'
          ]
        }
      },

      // Inject component css into index_dev.html
      css: {
        options: {
          transform: function(filePath) {
            filePath = filePath.replace('/client/', '');
            filePath = filePath.replace('/.tmp/', '');
            return '<link rel="stylesheet" href="' + filePath + '">';
          },
          starttag: '<!-- injector:css -->',
          endtag: '<!-- endinjector -->'
        },
        files: {
          '<%= yeoman.client %>/index_dev.html': [
            '<%= yeoman.client %>/{app,components}/**/*.css'
          ]
        }
      }
    },

    rev: {
      dist: {
        files: {
          src: [
            '<%= yeoman.dist %>/public/app/app.js',
            '<%= yeoman.dist %>/public/app/vendor.js',
            '<%= yeoman.dist %>/public/{,*/}*.css'
          ]
        }
      },
      loader_dev: {
        files: {
          src: [
            '<%= yeoman.dist %>/public/app/loader_dev.js'
          ]
        }
      }
    },

  });

  // Used for delaying livereload until after server has restarted
  grunt.registerTask('wait', function() {
    grunt.log.ok('Waiting for server reload...');

    var done = this.async();

    setTimeout(function() {
      grunt.log.writeln('Done waiting!');
      done();
    }, 1500);
  });

  grunt.registerTask('express-keepalive', 'Keep grunt running', function() {
    this.async();
  });

  grunt.registerTask('serve', function(target) {
    if (target === 'dist') {
      return grunt.task.run(['build', 'env:prod', 'express:prod', 'wait', 'open', 'express-keepalive']);
    }

    if (target === 'debug') {
      return grunt.task.run([
        'clean:server',
        'injector:sass',
        'concurrent:server',
        'injector',
        'wiredep',
        'autoprefixer',
        'concurrent:debug'
      ]);
    }

    grunt.task.run([
      'clean:server',
      'injector:sass',
      'concurrent:server',
      'injector',
      'wiredep',
      'autoprefixer',
      'express:dev',
      'wait',
      'open',
      'watch'
    ]);
  });

  grunt.registerTask('server', function() {
    grunt.log.warn('The `server` task has been deprecated. Use `grunt serve` to start a server.');
    grunt.task.run(['serve']);
  });

  grunt.registerTask('test', function(target) {
    if (target === 'server') {
      return grunt.task.run([
        'env:test'
      ]);
    } else if (target === 'client') {
      return grunt.task.run([
        'clean:server',
        'injector:sass',
        'concurrent:test',
        'injector',
        'autoprefixer',
        'karma'
      ]);
    } else if (target === 'e2e') {
      return grunt.task.run([
        'clean:server',
        'env:test',
        'injector:sass',
        'concurrent:test',
        'injector',
        'wiredep',
        'autoprefixer',
        'express:dev',
        'protractor'
      ]);
    } else grunt.task.run([
      'test:server',
      'test:client'
    ]);
  });

  grunt.registerTask('build', [
    'clean:dist',
    'injector:sass',
    'concurrent:dist',
    'injector',
    'wiredep',
    'useminPrepare',
    'autoprefixer',
    'ngtemplates',
    'concat',
    'ngAnnotate',
    'copy:dist',
    'copy:openshift',
    'cssmin',
    'uglify',
    'rev:dist',
    'preprocess:html',
    'usemin',
    'rev:loader_dev',
    'usemin:html'
  ]);

  grunt.registerTask('default', [
    'newer:jshint',
    'test',
    'build'
  ]);
};