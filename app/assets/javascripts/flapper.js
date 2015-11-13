var flapper = angular.module('flapperNews', ['ui.router', 'templates', 'Devise']);

// Config
flapper.config(['$stateProvider', '$urlRouterProvider', function ($stateProvider, $urlRouterProvider) {
    $stateProvider
        .state('home', {
            url: '/home',
            templateUrl: '_home.html',
            controller: 'MainCtrl',
            resolve: {
                postPromise: ['postFactory', function (postFactory) {
                    return postFactory.getAll();
                }]
            }
        })
        .state('posts', {
            url: '/posts/{id}',
            templateUrl: '_posts.html',
            controller: 'PostsCtrl',
            resolve: {
                post: ['$stateParams', 'postFactory', function ($stateParams, postFactory) {
                    return postFactory.getPost($stateParams.id);
                }]
            }
        })
        .state('login', {
            url: '/login',
            templateUrl: '_login.html',
            controller: 'AuthCtrl',
            onEnter: ['$state', 'Auth', function ($state, Auth) {
                Auth.currentUser().then(function () {
                    $state.go('home');
                })
            }]
        })
        .state('register', {
            url: '/register',
            templateUrl: '_register.html',
            controller: 'AuthCtrl',
            onEnter: ['$state', 'Auth', function ($state, Auth) {
                Auth.currentUser().then(function () {
                    $state.go('home');
                })
            }]
        });
    $urlRouterProvider.otherwise('home');
}]);

// Filters
flapper.filter('capitalize', function() {
    return function(input) {
        return (!!input) ? input.charAt(0).toUpperCase() + input.substr(1).toLowerCase() : '';
    }
});

// Factories
flapper.factory('postFactory', ['$http', function ($http) {
    var posts = [];
    return {
        getAll: function () {
            return $http.get('/posts.json').success(function(data){
                angular.copy(data, posts);
            });
        },
        getPosts: function () { return posts; },
        getPost: function (id) {
            return $http.get('/posts/' + id + '.json').then(function(res){
                return res.data;
            });
        },
        create: function(post) {
            return $http.post('/posts.json', post).success(function (data) {
                posts.push(data);
            });
        },
        upvotePost: function(post) {
            var pid = posts.indexOf(post);
            return $http.put('/posts/' + post.id + '/upvote.json').success(function (data) {
                post.upvotes += 1;
            });
        },
        addComment: function (id, comment) {
            return $http.post('/posts/' + id + '/comments.json', comment);
        },
        upvoteComment: function(post, comment) {
            return $http.put('/posts/' + post.id + '/comments/'+ comment.id + '/upvote.json').success(function(data) {
                comment.upvotes += 1;
            });
        }
    };
}]);

// Controllers
flapper.controller('MainCtrl', ['$scope', 'postFactory', function ($scope, postFactory) {
    $scope.posts = postFactory.getPosts();
    $scope.addPost = function () {
        if (!$scope.title || $scope.title === '') { return; }
        postFactory.create({
            title: $scope.title,
            link: $scope.link,
            upvotes: 0
        });
        $scope.title = '';
        $scope.link = '';
    };
    $scope.incrementUpvotes = function (post) {
        postFactory.upvotePost(post);
    };
}]);

flapper.controller('PostsCtrl', ['$scope', 'postFactory', 'post', function ($scope, postFactory, post) {
    $scope.post = post;
    $scope.addComment = function () {
        if ($scope.body === '') { return; }
        postFactory.addComment(post.id, {
            body: $scope.body,
            author: 'user',
            upvotes: 0
        }).success(function(comment) {
            $scope.post.comments.push(comment);
        });
        $scope.body = '';
    };
    $scope.incrementUpvotes = function (comment) {
        postFactory.upvoteComment(post, comment);
    };
}]);

flapper.controller('NavCtrl', ['$scope', 'Auth', function ($scope, Auth) {
    $scope.signedIn = Auth.isAuthenticated;
    $scope.logout = Auth.logout;
    Auth.currentUser().then(function (user){
        $scope.user = user;
    });
    $scope.$on('devise:new-registration', function (e, user) {
        $scope.user = user;
    });
    $scope.$on('devise:login', function (e, user) {
        $scope.user = user;
    });
    $scope.$on('devise:logout', function (e, user) {
        $scope.user = {};
    });
}]);

flapper.controller('AuthCtrl', ['$scope', '$state', 'Auth', function ($scope, $state, Auth) {
    $scope.login = function() {
        Auth.login($scope.user).then(function(){
            $state.go('home');
        }, function(error) {
            $scope.error = 'Invalid email address or password.';
        });
    };
    $scope.register = function() {
        Auth.register($scope.user).then(function(){
            $state.go('home');
        }, function(error) {
            $scope.errors = error.data.errors;
        });
    };
}]);