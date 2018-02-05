//var _url = 'http://192.168.8.100:18295/app/';
//var _url = 'http://192.168.10.156:8080/Kingee/app/';
//var _url = 'http://192.168.10.124:8085/Kingee/app/';
var _url = 'http://192.168.10.27:8017/Kingee/app/';
var accessToken = '7ff5247b8d884a37a9c255a78ddd9366';
//提示语
function tips(content,callback) {
    var html = '';
    html += '<div id="tips" class="tips tipin">' + content + '</div>';
    html += '<div id="tipsBg" class="tipsBg fadein"></div>';
    $("body").append(html);
    setTimeout(function () {
        $("#tips").removeClass("tipin").addClass("tipout");
        $("#tipsBg").removeClass("fadein").addClass("fadeOut");
        setTimeout(function () { 
        	$("#tips,#tipsBg").remove(); 
            if(callback){
            	var _callback = eval(callback);
            	_callback.apply();
            }
        }, 500);
    }, 1000);//3s后消失
}
//获取当前时间
/*function getTime(time) {
	var now= new Date(time),
	year = now.getFullYear(),
	month = now.getMonth()+1,
	date = now.getDate(),
	h=now.getHours(),
	m=now.getMinutes(),
	s=now.getSeconds(),
	ms=now.getMilliseconds();
	return (year+"-"+month+"-"+date+" "+h+":"+m+":"+s);
}*/
//获取当前时间
function getTime(time){
    var date = new Date(time);
    var y = date.getFullYear();
    var m = parseInt(date.getMonth()) + 1;
    m = m > 9 ? m : '0' + m;
    var d = date.getDate() > 9 ? date.getDate() : '0' + date.getDate();
    var hh = date.getHours() > 9 ? date.getHours() : '0' + date.getHours();
    var mm = date.getMinutes() > 9 ? date.getMinutes() : '0' + date.getMinutes();
    var ss = date.getSeconds() > 9 ? date.getSeconds() : '0' + date.getSeconds();
    return y + '-' + m + '-' + d + ' ' + hh + ':' + mm + ':' + ss;
}
function getDate(time) {
	var now= new Date(time),
	year = now.getFullYear(),
	month = now.getMonth()+1,
	date = now.getDate()
	return (year+"-"+month+"-"+date);
}
//页面跳转时执行pushHistory
function pushHistory(url) {
    var state = {
            title: "title",
            url: url
        };
    window.history.pushState(state, "title", "");
}

if (typeof window.addEventListener != "undefined") {
    window.addEventListener("popstate", function (e) {
        mainView.router.back();//执行framework7回退
    }, false);
} else {
    window.attachEvent("popstate", function (e) {
        mainView.router.back();//执行framework7回退
    });
}
//删除重复page
function removeRepeatPage(page){
    var _oldPage,_listNo = 0;;
    $(".pages .page").each(function(){
        if($(this).data("page")==page){
            _listNo++;
            if(_listNo==1){
                _oldPage = $(this);
            }else if(_listNo>1){
               _oldPage.remove();
            }
        }
    });
}
//获取字段在数组中的下标
function getArrayIndex(array,t){
    for(var i=0;i<array.length;i++){
        if(array[i]==t){
            return i;
        }
    }
}
function proposer(n){
    if(n=='admin') return '我';
    else return n;
}
function gtime(a){
    var n=getTime(a);
    return n.slice(5,-3);
}
function wait(n){
    var $n=n+'';
    if(n<60000) return '';
    else if(n<3600000) return '已等待'+parseInt($n.slice(0,-3)/60)+'分钟';
    else if(n<86400000) return $n.slice(0,-3)%3600!=0? '已等待'+parseInt($n.slice(0,-3)/3600)+'小时'+parseInt($n.slice(0,-3)%3600/60)+'分钟':'已等待'+parseInt($n.slice(0,-3)/3600)+'小时';
    else return $n.slice(0,-3)%86400!=0?'已等待'+parseInt($n.slice(0,-3)/86400)+'天'+parseInt($n.slice(0,-3)%86400/3600)+'小时':'已等待'+parseInt($n.slice(0,-3)/86400)+'天';
}
//选中状态和选中人数
function selectState(){
	$("input:checked").parent().find('.yuan').css({backgroundColor: "#40A9FF", border: "2px solid #40A9FF"});
	$('input:not(:checked)').parent().find('.yuan').css({backgroundColor: "#ffffff", border: "2px solid #888888"});
	$('.footer>p>span').text($('.list-block input:checked').length);
}
//固定头像文字长度
function fixedName(a){
	if(a.length<=2)return a;
	else return a.slice(-2);
}

//全选
function selectAll(Input){
	var isCheckAll = function (){
		for (var i = 1, n = 0; i < Input.length; i++){
			Input[i].checked && n++;
		}
		Input[0].checked = n == Input.length - 1;
	};
	Input[0].onclick = function (){
		for (var i = 1; i < Input.length; i++){
			Input[i].checked = this.checked;
		}
		isCheckAll();
	};
	for (var i = 1; i < Input.length; i++){
		Input[i].onclick = function (){
			isCheckAll();
		}
	}
}
