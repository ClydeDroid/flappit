var app = angular.module('flapperNews', ['ui.router', 'templates']);

// Config
app.config(['$stateProvider', '$urlRouterProvider', function ($stateProvider, $urlRouterProvider) {
    $stateProvider
        .state('home', {
            url: '/home',
            templateUrl: 'home/_home.html',
            controller: 'MainCtrl'
        })
        .state('posts', {
            url: '/posts/{id}',
            templateUrl: 'posts/_posts.html',
            controller: 'PostsCtrl'
        });
    $urlRouterProvider.otherwise('home');
}]);

// Factories
app.factory('postFactory', [function () {
    var posts = [
        {title: 'Google', upvotes: 55, link: 'http://www.google.com', comments: []},
        {title: 'Bing', upvotes: 16, link: 'http://www.bing.com', comments: []},
        {title: 'Reddit', upvotes: 15, link: 'http://www.reddit.com', comments: []},
        {title: 'CNN', upvotes: 9, link: 'http://www.cnn.com', comments: []},
        {title: 'Imgur', upvotes: 4, link: 'http://www.imgur.com', comments: []}
    ];
    return {
        getPosts: function () { return posts; },
        getPost: function (id) { return posts[id]; },
        postAdd: function (newPost) {
            posts.push(newPost);
            return posts;
        },
        commentAdd: function (id, comment) {
            posts[id].comments.push(comment);
            return posts[id];
        },
        upvotePost: function (id) {
            posts[id].upvotes += 1;
            return posts[id];
        },
        upvoteComment: function (pid, cid) {
            posts[pid].comments[cid].upvotes += 1;
            return posts[pid];
        }
    };
}]);

// Controllers
app.controller('MainCtrl', ['$scope', 'postFactory', function ($scope, postFactory) {
    $scope.posts = postFactory.getPosts();
    $scope.addPost = function () {
        if (!$scope.title || $scope.title === '') { return; }
        $scope.posts = postFactory.postAdd({
            title: $scope.title,
            link: $scope.link,
            upvotes: 0,
            comments: [
                { author: 'Joe', body: 'Cool post!', upvotes: 0 },
                { author: 'Bob', body: 'Great idea but everything is wrong!', upvotes: 0 }
            ]
        });
        $scope.title = '';
        $scope.link = '';
    };
    $scope.incrementUpvotes = function (post) {
        var id = $scope.posts.indexOf(post);
        $scope.posts[id] = postFactory.upvotePost(id);
    };
}]);

app.controller('PostsCtrl', ['$scope', '$stateParams', 'postFactory', function ($scope, $stateParams, postFactory) {
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
