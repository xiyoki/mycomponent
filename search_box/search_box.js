
    (function(){
      /*
      getDOM功能：返回特定id值元素对应的对象
      */
      var getDOM = function(id) {
        return document.getElementById(id);
      }

      /*
      addEvent(id,event,fn)功能：为特定元素绑定事件处理函数
      与el.onevent绑定事件处理函数最大的不同是，后者只能绑定一个事件处理函数
      */
      var addEvent = function(el,event,fn) {
        if(el.addEventListener) {
          el.addEventListener(event,fn,false);
        }
        else if(el.attachEvent) { //兼容IE6-7-8 
          el.attachEvent("on" + event,fn);
        }
      }
      /*
      ajaxGet功能：同服务器端进行异步的数据交换
      备注：该方法不兼容IE6及以下版本
      */
      var ajaxGet = function(url,callback) {
        var request = new XMLHttpRequest();
        request.onreadystatechange = function() {
          if(request.readyState == 4 && request.status == 200) {
            callback(JSON.parse(request.responseText));
          }
        }
        request.open("get",url,true);
        request.send(null);
      }

      /*getTarget功能：取得事件目标引用*/
      var getTarget = function(event) {
        return event.target || event.srcElement; //兼容IE 7、8
      }

      /*preventDefault功能：阻止事件的默认行为*/
      var preventDefault = function(event) {
        if(event.preventDefault) {
          return event.preventDefault();
        } else {
          return event.returnValue = false; //兼容IE 7、8
        }
      }
      /*
      为js动态生成的网页元素添加事件时，通常需要使用事件代理来实现。
      1. delegateEvent函数：为整个页面(document)的某一事件指定一个事件处理程序。
      事件类型由参数event传递进来。
      2. 当事件被触发时，在事件目标的作用域中调用预先传递进来的函数。不过有个前提，
      只能在特定事件目标的作用域中调用预先传递进来的函数。即事件目标的标签名要与
      预先传递进来的标签名相同。
      delegateEvent方法特点：不使用DOM0级方法添加事件处理程序。
      */
      var delegateEvent = function(targetName,event,fn) {
        addEvent(document,event,function(e) {
          var target = getTarget(e);
          if(target.nodeName == targetName.toUpperCase()) {
            fn.call(target);
          }  
        });
      }
      window.onload = function() {
        var searchBtn = getDOM("search_button");
        var searchBox = getDOM("search_box");
        var searchInput = getDOM("search_input");
        var suggest = getDOM("search_suggest");
        addEvent(searchInput,"keyup",function(){
          var searchText = searchInput.value;
          if(searchText) {
            ajaxGet("http://api.bing.com/qsonhs.aspx?q=" + searchText,function(d){
              var d = d.AS.Results[0].Suggests;
              var html = "";
              for(var i = 0, len = d.length; i < len; i++){
                html += "<li class = 'suggest_list'>" + d[i].Txt +"</li>";
              }
              suggest.innerHTML = html; 
            });
            suggest.style.display = "block"; 
          }
          else { //当输入框中的内容为空时
            suggest.style.display = "none";
          }
        });
        /*点击提示框中的项目，将输入框内容替换为提示项内容，并且定位到提示项所在页面*/
        delegateEvent("li","click",function() {
          var keyword = this.innerHTML;
          searchInput.value = keyword;
          location.href = "http://cn.bing.com/search?q=" + keyword; 
        });
        /*单击非输入框区域隐藏下拉提示框*/
        addEvent(document,"click",function(e) {
          var target = getTarget(e);
          var sugSty = suggest.style; //注意 复制引用类型值和复制基本类型值的区别
          if(target.id !="search_input") {
            sugSty.display = "none";
          } else if(sugSty.display == "none" && searchInput.value != "") {
            sugSty.display = "block";
          }
        });

        /*按钮提交功能未实现... ...*/
      }
    })();