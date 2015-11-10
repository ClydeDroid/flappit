var flapper = angular.module('flapperNews', ['ui.router', 'templates']);

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
            controller: 'PostsCtrl'
        });
    $urlRouterProvider.otherwise('home');
}]);

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
        getPost: function (id) { return posts[id]; },
        create: function(post) {
            return $http.post('/posts.json', post).success(function (data) {
                posts.push(data);
            });
        },
        upvotePost: function(post) {
            var pid = posts.indexOf(post);
            return $http.put('/posts/' + post.id + '/upvote.json').success(function (data) {
                posts[pid].upvotes += 1;
            });
        },
        commentAdd: function (id, comment) {
            posts[id].comments.push(comment);
            return posts[id];
        },
        upvoteComment: function (pid, cid) {
            posts[pid].comments[cid].upvotes += 1;
            return posts[pid];
        }
    };
}]);

// Controllers
flapper.controller('MainCtrl', ['$scope', 'postFactory', function ($scope, postFactory) {
    $scope.posts = postFactory.getPosts();
    $scope.addPost = function () {
        if (!$scope.title || $scope.title === '') { return; }
        $scope.posts = postFactory.create({
            title: $scope.title,
            link: $scope.link
        });
        $scope.title = '';
        $scope.link = '';
    };
    $scope.incrementUpvotes = function (post) {
        var pid = $scope.posts.indexOf(post);
        $scope.posts[pid] = postFactory.upvotePost(post);
    };
}]);

flapper.controller('PostsCtrl', ['$scope', '$stateParams', 'postFactory', function ($scope, $stateParams, postFactory) {
    $scope.post = postFactory.getPost($stateParams.id);
    $scope.addComment = function () {
        if ($scope.body === '') { return; }
        $scope.post = postFactory.commentAdd($stateParams.id, {
            body: $scope.body,
            author: 'user',
            upvotes: 0
        });
        $scope.body = '';
    };
    $scope.incrementUpvotes = function (comment) {
        cid = $scope.post.comments.indexOf(comment);
        $scope.post = postFactory.upvoteComment($stateParams.id, cid);
    };
}]);
