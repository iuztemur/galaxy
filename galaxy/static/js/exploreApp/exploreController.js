/*
 * exploreController.js
 * 
 * (c) 2012-2015, Ansible, Inc.
 *
 */

 'use strict';

 (function(angular) {

    var mod = angular.module('exploreController', []);

    mod.controller('ExploreCtrl', [
        '$scope',
        '$timeout',
        'roleFactory',
        'userFactory',
        'tagFactory',
        _controller
    ]);

    function _controller($scope, $timeout, roleFactory, userFactory, tagFactory) {

        $scope.page_title = 'Explore';
        $scope.results_per_page = 10;

        $scope.loading = {
            tags: 1,
            topRoles: 1,
            newRoles: 1,
            topUsers: 1,
            topReviewers: 1,
            newUsers: 1
        };

        $scope.toggle_item = function (item, sort_col) {
            if (item.sort_col != sort_col) {
                item.sort_col = sort_col;
                item.data_function();
            }
        };

        $timeout(function() {
            // give the partial templates a chance to load before we do this...
            _restoreState()
            _getTags();
            _getTopRoles();
            _getNewRoles();
            _getTopContributors()
            _getTopReviewers();
            _getNewUsers();
        }, 100);

        return;


        function _restoreState() {
            var data_names = ["tags","top_roles","new_roles","top_users","top_reviewers","new_users"];
            data_names.forEach(function (entry) {
                var default_sort_col = '';
                var more_link = '';
                var data_function = null;
                if (entry === 'tags') {
                    default_sort_col = '-num_roles';
                    more_link = '/list#/roles/';
                    data_function = _getTags;
                }
                else if (entry === 'top_roles') {
                    default_sort_col = '-average_score,-num_ratings';
                    more_link = '/list#/roles?page=1&per_page=10&order=-average_score,name';
                    //more_link = '/list#/roles/sort/sort-by-community-score';
                    data_function = _getTopRoles;
                }
                else if (entry === 'new_roles') {
                    default_sort_col = '-created,owner__username,name';
                    more_link = '/list#/roles?page=1&per_page=10&order=-created';
                    data_function = _getNewRoles;
                }
                else if (entry === 'top_users') {
                    default_sort_col = '-num_roles,username';
                    //more_link = '/list#/users/sort/sort-by-community-score';
                    more_link = '/list#/users?page=1&per_page=10&sort_order=num_roles,username&reverse';
                    data_function = _getTopContributors;
                }
                else if (entry === 'top_reviewers') {
                    default_sort_col = '-num_ratings,username';
                    //more_link = '/list#/users';
                    more_link = '/list#/users?page=1&per_page=10&sort_order=num_ratings,username&reverse';
                    data_function = _getTopReviewers;
                }
                else if (entry === 'new_users') {
                    default_sort_col = '-date_joined,username';
                    //more_link = '/list#/users/sort/sort-by-joined-on-date';
                    more_link = '/list#/users?page=1&per_page=10&sort_order=date_joined,username&reverse';
                    data_function = _getNewUsers;
                }

                $scope[entry] = {
                    'page': 1,
                    'data': [],
                    'reverse': false,
                    'sort_col': default_sort_col,
                    'more_link' : more_link,
                    'data_function': data_function
                };
            });
        }

        function _getTags() {
            return tagFactory.get({ order: '-roles' }).$promise.then(function(data) {
                $scope.tags.data = data.results.slice(0, $scope.results_per_page);
                $scope.loading.tags = 0;
            });
        }

        function _getTopRoles() {
            return roleFactory.getRolesTop(
                $scope.top_roles.page,
                $scope.results_per_page,
                $scope.top_roles.sort_col,
                $scope.top_roles.reverse
            ).then(function (data) {
                $scope.top_roles.data = data.data['results'];
                $scope.loading.topRoles = 0;
            });
        }

        function _getNewRoles() {
            return roleFactory.getRolesTop(
                $scope.new_roles.page,
                $scope.results_per_page,
                $scope.new_roles.sort_col,
                $scope.new_roles.reverse
            ).then(function (data) {
                $scope.new_roles.data = data.data['results'];
                $scope.loading.newRoles = 0;
            });
        }

        function _getTopContributors() {
            return userFactory.getRoleContributors(
                $scope.top_users.page,
                $scope.results_per_page,
                $scope.top_users.sort_col,
                $scope.top_users.reverse
            ).then(function (data) {
                $scope.top_users.data = data.data['results'];
                $scope.loading.topUsers = 0;
            });
        }

        function _getTopReviewers() {
            return userFactory.getRatingContributors(
                $scope.top_reviewers.page,
                $scope.results_per_page,
                $scope.top_reviewers.sort_col,
                $scope.top_reviewers.reverse
            ).then(function (data) {
                $scope.top_reviewers.data = data.data['results'];
                $scope.loading.topReviewers = 0;
            });
        }

        function _getNewUsers() {
            return userFactory.getUsers(
                $scope.new_users.page,
                $scope.results_per_page,
                $scope.new_users.sort_col,
                $scope.new_users.reverse
            ).then(function (data) {
                $scope.new_users.data = data.data['results'];
                $scope.loading.newUsers = 0;
            });
        }
    }

})(angular);