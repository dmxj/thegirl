;
(function (angular) {
  'use strict';
  angular.module("ng-mypagination", [])
    .constant('ngPaginationConfig', {      
      visiblePageCount: 7,
      firstText: '首页',
      lastText: '末页',
      prevText: '前一页',
      nextText: '后一页',
      showIfOnePage: true,
      showFirstLastText: false,
      gotoText: '跳转到',
      showGoto: true
    }).directive("pager", ['ngPaginationConfig', function (ngPaginationConfig) {
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
          scope.timeInit = new Date();

          scope.pageChange = function (page) {
            //if(new Date().getTime() - scope.timeInit.getTime() < 500){
            //  return false;
            //}
            //scope.timeInit = new Date();
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
        '<lable ng-if="showGoto">{{gotoText}}<select ng-select="keyupHanlder($event)"><option ng-repeat="pn in pagenums track by $index" value="{{pn}}">第{{pn}}页</option></select></label></div>'
      }
    }]);
})(angular);
