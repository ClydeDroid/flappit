flapper = angular.module('flapperNews', ['ui.router', 'templates', 'Devise'])

# Config
flapper.config ['$stateProvider', '$urlRouterProvider', ($stateProvider, $urlRouterProvider) ->
  $stateProvider
  .state('home',
    url: '/home'
    templateUrl: '_home.html'
    controller: 'MainCtrl'
    resolve: postsPromise: [
      'postFactory'
      (postFactory) ->
        postFactory.loadPosts()
    ]
    onEnter: [
      'Auth'
      (Auth) ->
        Auth.currentUser()
        return
    ]).state('posts',
    url: '/posts/{id}'
    templateUrl: '_posts.html'
    controller: 'PostsCtrl'
    resolve: postPromise: [
      '$stateParams'
      'postFactory'
      ($stateParams, postFactory) ->
        postFactory.loadPost $stateParams.id
    ]
    onEnter: [
      'Auth'
      (Auth) ->
        Auth.currentUser()
        return
    ]).state('login',
    url: '/login'
    templateUrl: '_login.html'
    controller: 'AuthCtrl'
    onEnter: [
      '$state'
      'Auth'
      ($state, Auth) ->
        Auth.currentUser().then ->
          $state.go 'home'
          return
        return
    ]).state 'register',
    url: '/register'
    templateUrl: '_register.html'
    controller: 'AuthCtrl'
    onEnter: [
      '$state'
      'Auth'
      ($state, Auth) ->
        Auth.currentUser().then ->
          $state.go 'home'
          return
        return
    ]
  $urlRouterProvider.otherwise 'home'
  return
]
# Filters
flapper.filter 'capitalize', ->
  (input) ->
    if ! !input then input.charAt(0).toUpperCase() + input.substr(1).toLowerCase() else ''
# Factories
flapper.factory 'postFactory', ['$http', ($http) ->
  posts = []
  post = {}
  {
  loadPosts: ->
    $http.get('/posts.json').success (data) ->
      angular.copy data, posts
      return
  getPosts: ->
    posts
  loadPost: (id) ->
    $http.get('/posts/' + id + '.json').success (data) ->
      angular.copy data, post
      return
  getPost: ->
    post
  addPost: (post) ->
    $http.post('/posts.json', post).success (data) ->
      posts.push data
      return
  upvotePost: (post) ->
    $http.post('/posts/' + post.id + '/upvote.json').success (data) ->
      posts[posts.indexOf(post)] = data
      return
  downvotePost: (post) ->
    $http.post('/posts/' + post.id + '/downvote.json').success (data) ->
      posts[posts.indexOf(post)] = data
      return
  addComment: (id, comment) ->
    $http.post '/posts/' + id + '/comments.json', comment
  upvoteComment: (comment) ->
    $http.post('/posts/' + post.id + '/comments/' + comment.id + '/upvote.json').success (data) ->
      post.comments[post.comments.indexOf(comment)] = data
      return
  downvoteComment: (comment) ->
    $http.post('/posts/' + post.id + '/comments/' + comment.id + '/downvote.json').success (data) ->
      post.comments[post.comments.indexOf(comment)] = data
      return

  }
]
# Controllers
flapper.controller 'MainCtrl', ['$scope', 'postFactory', 'Auth', ($scope, postFactory, Auth) ->
  $scope.loggedIn = Auth.isAuthenticated
  $scope.user = Auth._currentUser

  $scope.upvoted = (post) ->
    post.upvoters.indexOf($scope.user.id.toString()) > -1

  $scope.downvoted = (post) ->
    post.downvoters.indexOf($scope.user.id.toString()) > -1

  $scope.posts = postFactory.getPosts()

  $scope.addPost = ->
    if !$scope.title or $scope.title == ''
      return
    postFactory.addPost
      title: $scope.title
      link: $scope.link
      upvotes: 0
    $scope.title = ''
    $scope.link = ''
    return

  $scope.addUpvote = (post) ->
    postFactory.upvotePost post
    return

  $scope.addDownvote = (post) ->
    postFactory.downvotePost post
    return

  return
]
flapper.controller 'PostsCtrl', ['$scope', 'postFactory', 'Auth', ($scope, postFactory, Auth) ->
  $scope.loggedIn = Auth.isAuthenticated
  $scope.user = Auth._currentUser

  $scope.upvoted = (comment) ->
    comment.upvoters.indexOf($scope.user.id.toString()) > -1

  $scope.downvoted = (comment) ->
    comment.downvoters.indexOf($scope.user.id.toString()) > -1

  $scope.post = postFactory.getPost()

  $scope.addComment = ->
    if $scope.body == ''
      return
    postFactory.addComment($scope.post.id,
      body: $scope.body
      author: 'user'
      upvotes: 0).success (comment) ->
    $scope.post.comments.push comment
    return
    $scope.body = ''
    return

  $scope.addUpvote = (comment) ->
    postFactory.upvoteComment comment
    return

  $scope.addDownvote = (comment) ->
    postFactory.downvoteComment comment
    return

  return
]
flapper.controller 'NavCtrl', ['$scope', 'Auth', ($scope, Auth) ->
  $scope.signedIn = Auth.isAuthenticated
  $scope.logout = Auth.logout
  Auth.currentUser().then (user) ->
    $scope.user = user
    return
  $scope.$on 'devise:new-registration', (e, user) ->
    $scope.user = user
    return
  $scope.$on 'devise:login', (e, user) ->
    $scope.user = user
    return
  $scope.$on 'devise:logout', (e, user) ->
    $scope.user = {}
    return
  return
]
flapper.controller 'AuthCtrl', ['$scope', '$state', 'Auth', ($scope, $state, Auth) ->

  $scope.login = ->
    Auth.login($scope.user).then (->
      $state.go 'home'
      return
    ), (error) ->
      $scope.error = 'Invalid email address or password.'
      return
    return

  $scope.register = ->
    Auth.register($scope.user).then (->
      $state.go 'home'
      return
    ), (error) ->
      $scope.errors = error.data.errors
      return
    return

  return
]