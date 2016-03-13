;
(function (angular) {
  'use strict';

  var commonPageTpl = '<div class="ng-pagination"><ul ng-if="pageCount>1 || showIfOnePage"><li ng-click="pageChange(1)" ng-if="showFirstLastText">{{firstText}}</li>' +
      '<li ng-click="pageChange(currentPage-1>0?currentPage-1:1)">{{prevText}}</li>' +
      '<li ng-repeat="pagenum in firstPagenums track by pagenum" ng-click="pageChange(pagenum)" ng-class="{active:currentPage===pagenum}">{{pagenum}}</li>' +
      '<li ng-if="firstEllipses">...</li>' +
      '<li ng-repeat="pagenum in secondPagenums track by pagenum" ng-click="pageChange(pagenum)" ng-class="{active:currentPage===pagenum}">{{pagenum}}</li>' +
      '<li ng-if="secondEllipses">...</li>' +
      '<li ng-click="pageChange(currentPage+1<=pageCount?currentPage+1:pageCount)">{{nextText}}</li>' +
      '<li ng-click="pageChange(pageCount)" ng-if="showFirstLastText">{{lastText}}</li></ul>' +
      '<lable ng-if="showGoto">{{gotoText}}<select><option ng-repeat="pn in pagenum track by $index" value="{{pn}}">第{{pn}}页</option></select></label></div>';
  var linkPageTpl = '<div class="ng-pagination"><ul ng-if="pageCount>1 || showIfOnePage"><li ng-if="showFirstLastText"><a href="pageQuery(1)">{{firstText}}</a></li>' +
      '<li><a href="pageQuery(currentPage-1>0?currentPage-1:1)">{{prevText}}</a></li>' +
      '<li ng-repeat="pagenum in firstPagenums track by pagenum" ng-class="{active:currentPage===pagenum}"><a href="pageQuery(pagenum)">{{pagenum}}</a></li>' +
      '<li ng-if="firstEllipses">...</li>' +
      '<li ng-repeat="pagenum in secondPagenums track by pagenum" ng-class="{active:currentPage===pagenum}"><a href="pageQuery(pagenum)">{{pagenum}}</a></li>' +
      '<li ng-if="secondEllipses">...</li>' +
      '<li><a href="pageQuery(currentPage+1<=pageCount?currentPage+1:pageCount)">{{nextText}}</a></li>' +
      '<li ng-if="showFirstLastText"><a href="pageQuery(pageCount)">{{lastText}}</a></li></ul>' +
      '<lable ng-if="showGoto">{{gotoText}}<select><option ng-repeat="pn in pagenum track by $index" value="{{pn}}">第{{pn}}页</option></select></label></div>';

  function GetQueryString(name)
  {
    var reg = new RegExp("(^|&)"+ name +"=([^&]*)(&|$)");
    var r = window.location.search.substr(1).match(reg);
    if(r!=null)return  unescape(r[2]); return null;
  }

  var pagerModule = angular.module("ng-mypagination", []);

  pagerModule.constant('ngPaginationConfig', {
    visiblePageCount: 7,
    firstText: '首页',
    lastText: '末页',
    prevText: '前一页',
    nextText: '后一页',
    showIfOnePage: true,
    showFirstLastText: false,
    showToTalPageCount:true,
    gotoText: '跳转到',
    showGoto: true,
    pageKey:'p',
  });


  pagerModule.directive("pager", ['ngPaginationConfig', function (ngPaginationConfig) {
      return {
        link: function (scope, element, attrs) {
          var visiblePageCount = angular.isDefined(attrs.visiblePageCount) ? attrs.visiblePageCount : ngPaginationConfig.visiblePageCount;
          scope.firstText = angular.isDefined(attrs.firstText) ? attrs.firstText : ngPaginationConfig.firstText;
          scope.lastText = angular.isDefined(attrs.lastText) ? attrs.lastText : ngPaginationConfig.lastText;
          scope.prevText = angular.isDefined(attrs.prevText) ? attrs.prevText : ngPaginationConfig.prevText;
          scope.nextText = angular.isDefined(attrs.nextText) ? attrs.nextText : ngPaginationConfig.nextText;
          scope.showFirstLastText = angular.isDefined(attrs.showFirstLastText) ? attrs.showFirstLastText : ngPaginationConfig.showFirstLastText;
          scope.showIfOnePage = angular.isDefined(attrs.showIfOnePage) ? attrs.showIfOnePage : ngPaginationConfig.showIfOnePage;
          scope.gotoText = angular.isDefined(attrs.gotoText) ? attrs.gotoText : ngPaginationConfig.gotoText;
          scope.showGoto = angular.isDefined(attrs.showGoto) ? attrs.showGoto : ngPaginationConfig.showGoto;
          scope.currentPage = 1;
          scope.firstEllipses = false;
          scope.secondEllipses = false;
          scope.pagenums = [];

          scope.pageChange = function (page) {
            if (page >= 1 && page <= scope.pageCount) {
              scope.currentPage = page;
            } else {
              scope.currentPage = 1;
            }
            console.log('pageChange...')
          }

          scope.keyupHanlder = function (e) {
          	console.log("keyupHanlder...");
            var value = e.target.value;
            var parsedValue = parseInt(value, 10);
            if (!Number.isNaN(parsedValue)) {
              if (parsedValue >= 1 && parsedValue <= scope.pageCount) {

              } else if (parsedValue < 1) {
                e.target.value = 1;
              } else {
                e.target.value = scope.pageCount;
              }
              if (e.keyCode === 13) {
                // pressed enter
                scope.currentPage = parsedValue;
              }
            } else {
              if (e.preventDefault) {
                e.preventDefault();
              } else {
                return false;
              }
            }
          }

          function build() {
            scope.firstPagenums = [1];
            scope.secondPagenums = [];

            if (scope.pageCount === 0) {
              return;
            }

            if (scope.currentPage > scope.pageCount) {
              scope.currentPage = 1;
            }
            if (scope.pageCount >= 2){
              scope.firstPagenums = [1,2];
            }

            if(scope.pageCount <= 7){
              for(var i = 3 ; i <= scope.pageCount ; i++){
                scope.secondPagenums.push(i);
              }
            }

            if(scope.pageCount > 7){
                if(scope.currentPage <= 4){
                  scope.secondPagenums = [3,4,5,6,7];
                }else if(scope.currentPage == scope.pageCount-1 ||scope.currentPage == scope.pageCount){
                  for(var i = scope.pageCount - 4 ; i <= scope.pageCount ; i++){
                    scope.secondPagenums.push(i);
                  }
                }else{
                  for(var i = scope.currentPage - 2 ; i <= scope.currentPage + 2 ; i++){
                    scope.secondPagenums.push(i);
                  }
                }
            }

            if(scope.currentPage >= 6){
               scope.firstEllipses = true;
            }else{
               scope.firstEllipses = false;
            }

            if (scope.pageCount <= 7 || scope.currentPage >= scope.pageCount - 2){
               scope.secondEllipses = false;
            }else{
               scope.secondEllipses = true;
            }
          }

          scope.$watch('currentPage', function (a, b) {
            console.log('currentPage发生改变了：a:'+a+",b:"+b)
            if (a !== b) {
              build();
              scope.onPageChange();
            }
          });

          scope.$watch('pageCount', function (a, b) {
            if (!!a) {
              build();
            }

            for (var i = 1; i <= scope.pageCount; i++) {
              scope.pagenums.push(i);
            };
          });
        },

        replace: true,
        restrict: "E",
        scope: {
          pageCount: '=',
          currentPage: '=',
          onPageChange: '&'
        },

        template:'<div class="ng-pagination"><ul ng-if="pageCount>1 || showIfOnePage"><li ng-click="pageChange(1)" ng-if="showFirstLastText">{{firstText}}</li>' +
        '<li ng-click="pageChange(currentPage-1>0?currentPage-1:1)">{{prevText}}</li>' +
        '<li ng-repeat="pagenum in firstPagenums track by pagenum" ng-click="pageChange(pagenum)" ng-class="{active:currentPage===pagenum}">{{pagenum}}</li>' +
        '<li ng-if="firstEllipses">...</li>' +
        '<li ng-repeat="pagenum in secondPagenums track by pagenum" ng-click="pageChange(pagenum)" ng-class="{active:currentPage===pagenum}">{{pagenum}}</li>' +
        '<li ng-if="secondEllipses">...</li>' +
        '<li ng-click="pageChange(currentPage+1<=pageCount?currentPage+1:pageCount)">{{nextText}}</li>' +
        '<li ng-click="pageChange(pageCount)" ng-if="showFirstLastText">{{lastText}}</li></ul>' +
        '<lable ng-if="showGoto">{{gotoText}}<select><option ng-repeat="pn in pagenums track by $index" value="{{pn}}">第{{pn}}页</option></select></label>' +
        '<strong ng-if="showToTalPageCount">共{{pageCount}}页</strong></div>',
      }
    }]);

    pagerModule.directive('pagerlink',['ngPaginationConfig', function (ngPaginationConfig){
        return {
          link: function (scope, element, attrs){
            var visiblePageCount = angular.isDefined(attrs.visiblePageCount) ? attrs.visiblePageCount : ngPaginationConfig.visiblePageCount;
            scope.firstText = angular.isDefined(attrs.firstText) ? attrs.firstText : ngPaginationConfig.firstText;
            scope.lastText = angular.isDefined(attrs.lastText) ? attrs.lastText : ngPaginationConfig.lastText;
            scope.prevText = angular.isDefined(attrs.prevText) ? attrs.prevText : ngPaginationConfig.prevText;
            scope.nextText = angular.isDefined(attrs.nextText) ? attrs.nextText : ngPaginationConfig.nextText;
            scope.showFirstLastText = angular.isDefined(attrs.showFirstLastText) ? attrs.showFirstLastText : ngPaginationConfig.showFirstLastText;
            scope.showIfOnePage = angular.isDefined(attrs.showIfOnePage) ? attrs.showIfOnePage : ngPaginationConfig.showIfOnePage;
            scope.gotoText = angular.isDefined(attrs.gotoText) ? attrs.gotoText : ngPaginationConfig.gotoText;
            scope.showGoto = angular.isDefined(attrs.showGoto) ? attrs.showGoto : ngPaginationConfig.showGoto;
            scope.pageCount = angular.isDefined(attrs.pageCount) ? attrs.pageCount : ngPaginationConfig.pageCount;
            scope.firstEllipses = false;
            scope.secondEllipses = false;
            scope.pagenums = [];
            scope.pageKey = angular.isDefined(attrs.pageKey) ? attrs.pageKey : ngPaginationConfig.pageKey;

            //scope.init = function () {
              var page = GetQueryString(scope.pageKey) ? parseInt(GetQueryString(scope.pageKey)) : 1;
              scope.page = Math.max(1,page);
              console.log("当前的页码是"+scope.page);
              build();
            //}

            scope.pageQuery = function (page) {  //链接类型的分页生成的分页query串  ?q=1
              if (page >= 1 && page <= scope.pageCount) {
                return "?"+scope.pageKey+"="+page;
              } else {
                return "?"+scope.pageKey+"=1";
              }
            }

            function build() {
              scope.firstPagenums = [1];
              scope.secondPagenums = [];

              if (scope.pageCount === 0) {
                return;
              }

              if (scope.page > scope.pageCount) {
                scope.page = 1;
              }
              if (scope.pageCount >= 2){
                scope.firstPagenums = [1,2];
              }

              if(scope.pageCount <= 7){
                for(var i = 3 ; i <= scope.pageCount ; i++){
                  scope.secondPagenums.push(i);
                }
              }

              if(scope.pageCount > 7){
                if(scope.page <= 4){
                  scope.secondPagenums = [3,4,5,6,7];
                }else if(scope.page == scope.pageCount-1 ||scope.page == scope.pageCount){
                  for(var i = scope.pageCount - 4 ; i <= scope.pageCount ; i++){
                    scope.secondPagenums.push(i);
                  }
                }else{
                  for(var i = scope.page - 2 ; i <= scope.page + 2 ; i++){
                    scope.secondPagenums.push(i);
                  }
                }
              }

              if(scope.page >= 6){
                scope.firstEllipses = true;
              }else{
                scope.firstEllipses = false;
              }

              if (scope.pageCount <= 7 || scope.page >= scope.pageCount - 2){
                scope.secondEllipses = false;
              }else{
                scope.secondEllipses = true;
              }
            }

            for (var i = 1; i <= scope.pageCount; i++) {
              scope.pagenums.push(i);
            };
            console.log("pagerLink....");
          },

          replace: true,
          restrict: "E",
          template:'<div class="ng-pagination" ng-if="pageCount>0"><ul ng-if="pageCount>1 || showIfOnePage"><li ng-if="showFirstLastText"><a href="?{{pageKey}}=1">{{firstText}}</a></li>' +
          '<li><a href="?{{pageKey}}={{page-1>0?page-1:1}}" ng-disabled="{{page==1}}">{{prevText}}</a></li>' +
          '<li ng-repeat="pagenum in firstPagenums track by pagenum" ng-class="{active:page===pagenum}"><a href="?{{pageKey}}={{pagenum}}">{{pagenum}}</a></li>' +
          '<li ng-if="firstEllipses">...</li>' +
          '<li ng-repeat="pagenum in secondPagenums track by pagenum" ng-class="{active:page===pagenum}"><a href="?{{pageKey}}={{pagenum}}">{{pagenum}}</a></li>' +
          '<li ng-if="secondEllipses">...</li>' +
          '<li><a href="?{{pageKey}}={{page+1<=pageCount?page+1:pageCount}}"  ng-disabled="{{page==pageCount}}">{{nextText}}</a></li>' +
          '<li ng-if="showFirstLastText"><a href="?{{pageKey}}={{pageCount}}">{{lastText}}</a></li></ul>' +
          '<lable ng-if="showGoto">{{gotoText}}<select><option ng-repeat="pn in pagenums track by $index" value="{{pn}}">第{{pn}}页</option></select></label>' +
          '<strong ng-if="showToTalPageCount">共{{pageCount}}页</strong></div>',
        };
    }]);
})(angular);
