var destinationType;
var $file = '',
	$files = new Array();
var uploadSuccess = 0;
var structureView_id = ''; //构件物id
var structureDetail_id = ''; //构件物现场情况列表单条数据id
var USERID = localStorage.getItem("userId"); //用户id
var UserName = localStorage.getItem("userName"); //用户名称
var workPoint = ''; //工点位
var ipconfig = window.location.href.split('/')[0] + '//' + window.location.href.split('/')[2];
document.addEventListener("deviceready", onDeviceReady, false);

var yanz={
      软基处理:'icon-ruanji',
      路基开挖:'icon-lujikaiwa',
      路基填方:'icon-lujitianfang',
      排水工程:'icon-paishui',
      防护工程:'icon-fanghu',
      通涵工程:'icon-handong',
      桥梁工程:'icon-bridge',
      隧道工程:'icon-tunnel',
      房建工程:'icon-fangzi'
};
var yanColor={
      软基处理:'#56c8a6',
      路基开挖:'#ef7698',
      路基填方:'#4874bd',
      排水工程:'#08d0d7',
      防护工程:'#68ce24',
      通涵工程:'#edbe00',
      桥梁工程:'#c87ae5',
      隧道工程:'#279024',
      房建工程:'#8c52bd'
};
var reg=function(i) {
    return yanz[i];
};
var regColor=function(i) {
    return yanColor[i];
};

/*
 * DETAIL_ID	现场记录ID
 * BOOKER	          记录人员ID
 * BOOKERDATE	记录时间
 * REMARK	          现场情况
 * BUSID	          构件物ID
 * TRUE_NAME	记录人员名称
 * */

function onDeviceReady() {
	//Cordove加载完成后会触发
	destinationType = navigator.camera.DestinationType;
}

var myApp = new Framework7({
	modalButtonOk:'确定',
	modalButtonCancel:'取消',
	init: false
});

// If we need to use custom DOM library, let's save it to $$ variable:
var $$ = Dom7;

// Add view
var mainView = myApp.addView('.view-main', {
	// Because we want to use dynamic navbar, we need to enable it for this view:
	dynamicNavbar: true
});

myApp.onPageInit('index',function (page) {
	/* //手机测试时开放此段代码
	if($('#phone_script').length == 0){
		var u = navigator.userAgent, app = navigator.appVersion;   
		var isAndroid = u.indexOf('Android') > -1 || u.indexOf('Linux') > -1; //android终端或者uc浏览器   
		var isiOS = !!u.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/); //ios终端   
		if(isAndroid){
			document.write('<script id="phone_script" type="text\/javascript" src="android\/cordova.js"><\/script>'); 
			document.write('<script type="text\/javascript" src="android\/cordova_plugins.js"><\/script>'); 
		}else{
			document.write('<script id="phone_script" type="text\/javascript" src="ios\/cordova.js"><\/script>'); 
			document.write('<script type="text\/javascript" src="ios\/cordova_plugins.js"><\/script>'); 
		}
	}*/
	
	pushHistory('index.html');

	//获取切换项目
	var projectlist = JSON.parse(localStorage.getItem("projectlist"));
	var html_proj = '';
	for(var i=0;i<projectlist.length;i++){
		html_proj += '<li><a id="'+projectlist[i].id+'" href="#" class="list-button item-link" onclick="setProject(this);">'+projectlist[i].projectName+'</a></li>';
	}
	$('#projectlist').html(html_proj);

  	$$('.page-content').scroll(function(){
  		if($(this).scrollTop() <= 0 ){
  			$('.custom-top-toolbar-small').stop(true,true).animate({
  				'opacity': 0
  			}, 800, function(){
  				$('.custom-top-toolbar-small').hide();
  			});
  		}else{
  			$('.custom-top-toolbar-small').show();
  			$('.custom-top-toolbar-small').animate({
  				'opacity': 1
  			}, 800);
  		}
  	});
  	
  	//构建扫描
  	$$('.scaner').click(function(){
  		scanCode();
  	});

  	$$('.open-popover').on('click', function () {
	    var clickedLink = this;
	    myApp.popover('.popover-links', clickedLink);
	}); 

	$$('.custom-functionalArea td a').click(function(){
		var _url = $(this).data('url');
		if(_url != '' && _url != null && _url != undefined){
			window.location.href = _url;
		}
	});
});

//构建管理
myApp.onPageInit('home',function (page) {
	$('.navbar').removeClass('hide');
	pushHistory('home.html');
	$.ajax({
		type:"POST",
		url: "/smartbiz/m?slb=structure/pageselect",
		data:{"USERID":USERID},
		dataType:'json',
		success: function(data){
			var Data = data.children;
			for(var i=0;i<Data.length;i++) {
		        var n=reg(Data[i].DENAME);
		        var color = regColor(Data[i].DENAME);
		        var html='<li class="item-content" id="'+ Data[i].ID +'" onclick="skipDetail(this)">'+
		            	'<div class="item-media"><div class="tuoy" style="background:'+ color +'"><i class="'+n+'"></i></div></div>'+
		                '<div class="item-inner">'+
		                '<div class="item-title-row">'+
		                '<div class="item-title">'+Data[i].DENAME+'-'+ Data[i].PILENAME +'</div>'+
		                '<div class="item-subtitle">'+Data[i].STRUCTURE_NAME+'('+ Data[i].STRUCTURE_NUM +')</div>'+
		                '</div></div></li>';
		        $$('.pull-to-refresh-content .list-block ul').append(html);
		        n='',color = '';
		    }
			var ptrContent = $$('.pull-to-refresh-content');
			ptrContent.on('refresh', function (e) {
			    setTimeout(function () {
			        myApp.pullToRefreshDone();
			    }, 1500);
			});
			var loading = false;
			var lastIndex = $$('.list-block>ul>li').length;
			var maxItems =Data.length+1;
			var itemsPerLoad = lastIndex > 15 ? 15 : lastIndex;
			$$('.infinite-scroll').on('infinite', function () {
				$('.infinite-scroll-preloader').removeClass('hide');
			    if (loading) return;
			    loading = true;
			    setTimeout(function () {
			        loading = false;
			        if (lastIndex >= maxItems) {
			            myApp.detachInfiniteScroll($$('.infinite-scroll'));
			            $$('.infinite-scroll-preloader').remove();
			            return;
			        }
			        var inhtml= '';
			        for (var i = lastIndex-1; i<maxItems-1 && i < lastIndex + itemsPerLoad-1; i++) {
			            var n=reg(Data[i].DENAME);
			            var color = regColor(Data[i].DENAME);
			            inhtml='<li class="item-content" id="'+ Data[i].ID +'" onclick="skipDetail(this)">'+
			            		'<div class="item-media"><div class="tuoy" style="background:'+ color +'"><i class="'+n+'"></i></div></div>'+
		            			'<div class="item-inner">'+
		            			'<div class="item-title-row">'+
		            			'<div class="item-title">'+Data[i].DENAME+'-'+ Data[i].PILENAME +'</div>'+
		            			'<div class="item-subtitle">'+Data[i].STRUCTURE_NAME+'('+ Data[i].STRUCTURE_NUM +')</div>'+
		            			'</div></div></li>';
			            $$('.list-block ul').append(inhtml);
			            n='';
			        }
			        lastIndex = $$('.list-block>ul>li').length;
			    }, 1000);
			});
		}
	});
});

//构建管理搜索
myApp.onPageInit('Search',function (page) {
	pushHistory('home.html');
	var arr = [];
	var structureName =  "",
		page = $("#page").val(),
		limit = $("#limit").val(),
		start = $("#start").val(),
		Length = 1;
	
	//获取搜索历史并去重
	if(localStorage.getItem("searchStratory") != null){
		arr.unshift(localStorage.getItem("searchStratory").split(","));
	}
	if(arr.length!=0){
		var Arr = arr[0],Html = '';
		for(var i=0;i<Arr.length;i++){
			for(var j=0;j<Arr.length;j++){
				if(Arr[i]==Arr[j+i+1]){Arr.splice(j+i+1,1);}
			}
		}
		structureName = Arr[0];
		$("#STRUCTURE_NAME").attr("placeholder",Arr[0]);
		for(var i=0;i<Arr.length;i++){
			Html += '<li>'+Arr[i]+'</li>';
		}
		$("#search-box ul").append(Html);
	}
	
	//搜索框搜索事件
	$("#STRUCTURE_NAME").change(function(){
		structureName = $("#STRUCTURE_NAME").val();
		Search();
	});
	//点击搜索历史
	$("#search-box li").click(function(){
		structureName = $(this).html();
		$("#STRUCTURE_NAME").val(structureName);
		Search();
	});
	//点击查看更多
	$(document).on("click","#viewMore",function(){
		var structureName = $("#STRUCTURE_NAME").val(),
			prompName= $(this).html();
		Length = "";
		Search();
	});
	$("#searchForm")[0].onsubmit = function() {
		Search();
	    return false;
	};
	function Search(){
		if(structureName != ""){
			arr.unshift(structureName);
			localStorage.setItem('searchStratory',arr);
			$.ajax({
				type : "POST",
				url : "/smartbiz/m?slb=structure/pageselect",
				data : {"USERID":USERID,"STRUCTURE_NAME":structureName,"page":page,"limit":limit,"start":start},
				dataType : "json",
				success : function(data){
					var Data = data.children;
					$(".ul p").show();
					$$('#searchList .ul ul').html("");
					if(Data.length<=Length&&Data.length != 0||Length==""){
						Length = Data.length;
						lifeHtml();
						$$('#searchList .ul ul').append('<li class="lastprompt">已显示全部信息<li>');
					}else if(Data.length == 0){
						$$('#searchList .ul ul').append('<li class="lastprompt">暂无相关信息<li>');
					}else{
						lifeHtml();
						$$('#searchList .ul ul').append('<li class="lastprompt" id="viewMore">点击查看更多<li>');
					}
					
					function lifeHtml(){
						for(var i=0;i<Length;i++) {
					        var n=reg(Data[i].DENAME);
					        var color = regColor(Data[i].DENAME);
					        var html='<li class="item-content" id="'+ Data[i].ID +'" onclick="skipDetail(this)">'+
					            	'<div class="item-media"><div class="tuoy" style="background:'+ color +'"><i class="'+n+'"></i></div></div>'+
					                '<div class="item-inner">'+
					                '<div class="item-title-row">'+
					                '<div class="item-title">'+Data[i].DENAME+'-'+ Data[i].PILENAME +'</div>'+
					                '<div class="item-subtitle">'+Data[i].STRUCTURE_NAME+'('+ Data[i].STRUCTURE_NUM +')</div>'+
					                '</div></div></li>';
					        $$('#searchList .ul ul').append(html);
					        n='',color = '';
					    }
					}
				}
			});
		}else{
			$$('#searchList .ul ul').html("");
		}
	}
});

myApp.onPageInit('structureView',function (page) {
	pushHistory('structureView.html');
	$('.navbar').removeClass('hide');
	//查看页基础信息
	$.ajax({
		url: '/smartbiz/m?slb=structure/baseselect',
		type: 'POST',
		data: 'ID=' + structureView_id,
		dataType: 'json',
		success: function(json) {
			json.rows[0].DENAME = json.rows[0].DENAME == null ? '' : json.rows[0].DENAME;
			json.rows[0].PILENAME = json.rows[0].PILENAME == null ? '' : json.rows[0].PILENAME;
			json.rows[0].STRUCTURE_NUM = json.rows[0].STRUCTURE_NUM == null ? '' : json.rows[0].STRUCTURE_NUM;
			json.rows[0].WORKPOINT = json.rows[0].WORKPOINT == null ? '' : json.rows[0].WORKPOINT;
			workPoint = json.rows[0].WORKPOINT;
			$('.custom-ticket-info li:eq(0) span').text(json.rows[0].DENAME);
			$('.custom-ticket-info li:eq(1) span').text(json.rows[0].PILENAME);
			$('.custom-ticket-info li:eq(2) span').text(json.rows[0].STRUCTURE_NUM);
			$('.custom-ticket-info li:eq(3) span').text(json.rows[0].WORKPOINT);
			switch(json.rows[0].DENAME){
			case '软基处理':
				$('.custom-ticket-icon label').css('background-color', '#56c8a6');
				$('.custom-ticket-icon i').removeClass().addClass('icon-ruanji');
				break;
			case '路基开挖':
				$('.custom-ticket-icon label').css('background-color', '#ef7698');
				$('.custom-ticket-icon i').removeClass().addClass('icon-lujikaiwa');
				break;
			case '路基填方':
				$('.custom-ticket-icon label').css('background-color', '#4874bd');
				$('.custom-ticket-icon i').removeClass().addClass('icon-lujitianfang');
				break;
			case '排水工程':
				$('.custom-ticket-icon label').css('background-color', '#08d0d7');
				$('.custom-ticket-icon i').removeClass().addClass('icon-paishui');
				break;
			case '防护工程':
				$('.custom-ticket-icon label').css('background-color', '#68ce24');
				$('.custom-ticket-icon i').removeClass().addClass('icon-fanghu');
				break;
			case '通涵工程':
				$('.custom-ticket-icon label').css('background-color', '#edbe00');
				$('.custom-ticket-icon i').removeClass().addClass('icon-handong');
				break;
			case '桥梁工程':
				$('.custom-ticket-icon label').css('background-color', '#c87ae5');
				$('.custom-ticket-icon i').removeClass().addClass('icon-bridge');
				break;
			case '隧道工程':
				$('.custom-ticket-icon label').css('background-color', '#279024');
				$('.custom-ticket-icon i').removeClass().addClass('icon-tunnel');
				break;
			case '房建工程':
				$('.custom-ticket-icon label').css('background-color', '#8c52bd');
				$('.custom-ticket-icon i').removeClass().addClass('icon-fangzi');
				break;
			}
		},
		complete: function(){
			addFiles(0, 'technical');
		}
	});
	
	$('.custom-tab').click(function(){
		var $this = $(this);
		var _index = $this.index();
		$this.addClass('active').siblings('.custom-tab').removeClass('active');
		if(_index == 0){
			$('#technical').show();
			$('#quality, #field').hide();
			$('.custom-tabs .custom-tabs-line').css('left', 'calc((33% - 11px) / 2)');
			addFiles(0, 'technical');
		}else if(_index == 1){
			$('#quality').show();
			$('#technical, #field').hide();
			$('.custom-tabs .custom-tabs-line').css('left', 'calc((33% - 11px) / 2 + 33%)');
			addFiles(1, 'quality');
		}else{
			$('#field').show();
			$('#technical, #quality').hide();
			$('.custom-tabs .custom-tabs-line').css('left', 'calc((33% - 11px) / 2 + 66%)');
			addCurrFiles(structureView_id);
		}
	});
	        
});

myApp.onPageInit('structureAdd',function (page) {
	$('.navbar').removeClass('hide');
	structureDetail_id = '';
	$('#addPhoto').click(function(){
		imagepicker();
	});
	
	$('#save').click(function(){
		myApp.showPreloader();
		var _time = getCurrTime();
		structureDetail_id = uuid(32);
		var _json = {
			"BOOKER": USERID,
			"BOOKERDATE": _time,
			"REMARK": $('#remark').val(),
			"BUSID": structureView_id,
			"TRUE_NAME": UserName,
			"DETAIL_ID": structureDetail_id
		};
		$.ajax({
			type : 'post',  
		    url : '/smartbiz/m?slb=structure/datainsert',
		    data: _json,
		    //dataType: 'json',
		    success: function (str) { 
		    	var $list = $('#uploadFile input[type=hidden]');
		    	var data = new Array();
		    	for(var i=0;i<$list.length;i++){
		    		data.push($list.eq(i).val());
		    	}
		    	$.ajax({
					type : 'post',  
				    url : '/a/ygjs/fileUploader/uploadImg',
				    data: {
				    	list: data,
				    	appId: structureDetail_id,
				    	userId: USERID,
				    	menuId: 'de651d7a31f74c0981a18a8e3c1788da',
				    	type: 3
				    },
				    traditional: true,
				    dataType: 'json',
				    success: function (str) { 
				    	myApp.hidePreloader();
				    	if(str){
				    		myApp.alert('保存成功',"提示");
				    		mainView.router.back();
				    		addCurrFiles(structureView_id);
				    	}
				    },
				    error: function(e){
				    	myApp.hidePreloader();
				    	myApp.alert('保存失败',"提示");
				    	mainView.router.back();
				    }
				});
		    },
		    error: function(e){
		    	myApp.hidePreloader();
		    	myApp.alert('保存失败',"提示");
		    	mainView.router.back();
		    }
		});
	});
});

myApp.onPageInit('structureEdit',function (page) {
	$('.navbar').removeClass('hide');
	$.ajax({  
	    type : 'post',  
	    url : '/smartbiz/m?slb=structure/datainfo',
	    data: {'ID': structureDetail_id},
	    dataType: 'json',
	    success : function (str) { 
	    	$('#topic').text(str.rows[0].TRUE_NAME + '上传的现场资料');
	    	if(str.rows[0].REMARK != '' && str.rows[0].REMARK != null && str.rows[0].REMARK != 'undefined'){
	    		$('.custom-structure-detail textarea').val(str.rows[0].REMARK);
	    	}
	    	if(workPoint != '' && workPoint != null && workPoint != 'undefined'){
	    		$('.custom-structure-detail .location').html('<i class="icon-zuobiao"></i> ' + workPoint);
	    	}
	    	if(str.rows[0].BOOKERDATE != '' && str.rows[0].BOOKERDATE != null && str.rows[0].BOOKERDATE != 'undefined'){
	    		$('.custom-structure-detail .time').text(str.rows[0].BOOKERDATE);
	    	}
	    	//隐藏域数据
	    	$('input[name = BOOKERDATE_old]').val(str.rows[0].BOOKERDATE);
	    	$('input[name = REMARK_old]').val(str.rows[0].REMARK);
	    	//显示附件
	    	$.ajax({  
	    	    type : 'post',  
	    	    url : '/a/ygjs/ancCommonController/lookFilesImgApp/'+structureDetail_id,
	    	    data: "",
	    	    dataType: 'json',
	    	    success : function (str) { 
	    	    	var pics = str.data;
	    	    	var html = '';
	    	    	for(var i = 0; i < pics.length; i++) {
	    				/*html += '<div class="custom-photo"><img id="' + pics[i].ID + '" alt="" src="/file' + pics[i].URL + pics[i].FILE_NAME + '" onclick="showPic(this);"><div class="custom-photo-delete" onclick="delPic(this);"><i class="icon-guano"></i></div></div>';*/
	    	    		html += '<div class="custom-photo"><img id="' + pics[i].id + '" alt="" src="' + pics[i].url + '" onclick="showPic(this);" dbclick="largePic(this);"><div class="custom-photo-delete" onclick="delPic(this);"><i class="icon-guano"></i></div></div>';
	    			}
	    			$('#addPhoto').before(html);
	    	    }
	    	});
	    }
	});
	
	$('#addPhoto').click(function(){
		imagepicker();
	});
	
	$('.custom-delete').click(function(){
		myApp.confirm('确定要删除这条记录吗？', '提示', function() {
			myApp.showPreloader();
			$.ajax({
				type : 'post',  
			    url : '/smartbiz/m?slb=structure/datadelete',
			    data: {"ID": structureDetail_id},
			    success: function (str) { 
			    	myApp.hidePreloader();
			    	myApp.alert('删除成功',"提示");
			    	mainView.router.back();
			    	addCurrFiles(structureView_id);
			    },
			    error: function(e){
			    	myApp.hidePreloader();
			    	myApp.alert('删除失败',"提示");
			    }
			});
		}, function() {

		})
	});
	
	$('#save').click(function(){
		myApp.showPreloader();
		var _time = getCurrTime();
		var _json = {
			"BOOKER": USERID,
			"BOOKERDATE": _time,
			"REMARK": $('#remark').val(),
			"BUSID": structureView_id,
			"TRUE_NAME": UserName,
			"DETAIL_ID": structureDetail_id,
			"#BOOKER": USERID,
			"#BOOKERDATE": $('input[name = BOOKERDATE_old]').val(),
			"#REMARK": $('input[name = REMARK_old]').val(),
			"#BUSID": structureView_id,
			"#TRUE_NAME": UserName,
			"#DETAIL_ID": structureDetail_id
		};
		$.ajax({
			type : 'post',  
		    url : '/smartbiz/m?slb=structure/dataupdate',
		    data: _json,
		    //dataType: 'json',
		    success: function (str) { 
		    	var $list = $('#uploadFile input[type=hidden]');
		    	var data = new Array();
		    	for(var i=0;i<$list.length;i++){
		    		data.push($list.eq(i).val());
		    	}
		    	$.ajax({
					type : 'post',  
				    url : '/a/ygjs/fileUploader/uploadImg',
				    data: {
				    	list: data,
				    	appId: structureDetail_id,
				    	userId: USERID,
				    	menuId: 'de651d7a31f74c0981a18a8e3c1788da',
				    	type: 3
				    },
				    traditional: true,
				    dataType: 'json',
				    success: function (str) { 
				    	myApp.hidePreloader();
				    	if(str){
				    		myApp.alert('保存成功',"提示");
				    		mainView.router.back();
				    		addCurrFiles(structureView_id);
				    	}
				    },
				    error: function(e){
				    	myApp.hidePreloader();
				    	myApp.alert('保存失败',"提示");
				    	mainView.router.back();
				    }
				});
		    },
		    error: function(e){
		    	myApp.hidePreloader();
		    	myApp.alert('保存失败',"提示");
		    	mainView.router.back();
		    }
		});
	});
});

myApp.onPageInit('structureDetail',function (page) {
	pushHistory('structureDetail.html');
	$('.navbar').removeClass('hide');
	$.ajax({  
	    type : 'post',  
	    url : '/smartbiz/m?slb=structure/datainfo',
	    data: {'ID': structureDetail_id},
	    dataType: 'json',
	    success : function (str) { 
	    	$('#topic').text(str.rows[0].TRUE_NAME + '上传的现场资料');
	    	if(str.rows[0].REMARK != '' && str.rows[0].REMARK != null && str.rows[0].REMARK != 'undefined'){
	    		$('.custom-structure-detail #remark').text(str.rows[0].REMARK);
	    	}
	    	if(str.rows[0].WORKPOINT != '' &&str.rows[0].WORKPOINT != null && str.rows[0].WORKPOINT != 'undefined'){
	    		$('.custom-structure-detail .location').html('<i class="icon-zuobiao"></i> ' + str.rows[0].WORKPOINT);
	    	}
	    	if(str.rows[0].BOOKERDATE != '' &&str.rows[0].BOOKERDATE != null && str.rows[0].BOOKERDATE != 'undefined'){
	    		$('.custom-structure-detail .time').text('提交时间： ' + str.rows[0].BOOKERDATE);
	    	}
	    	//显示附件
	    	$.ajax({  
	    	    type : 'post',  
	    	    url : '/smartbiz/m?slb=structure/util/filelist',
	    	    data: {'ID': structureDetail_id},
	    	    dataType: 'json',
	    	    success : function (str) { 
	    	    	var pics = str.children;
	    	    	var html = '';
	    	    	for(var i = 0; i < pics.length; i++) {
	    				html += '<div class="custom-photo"><img id="' + pics[i].ID + '" alt="" src="/file' + pics[i].URL + pics[i].FILE_NAME + '" onclick="showPic(this);" dbclick="largePic(this);"></div>';
	    			}
	    			$('.custom-structure-detail .custom-photos').html(html);
	    	    }
	    	});
	    }
	});
});

myApp.onPageInit('notice',function (page) {
	pushHistory('notice.html');
	$('.navbar').removeClass('hide');
	var mySwiper = myApp.swiper('.swiper-container', {
        pagination:'.swiper-pagination',
        autoplay: 3000
    });
});


myApp.init();

//项目切换
function setProject(obj){
	var $this = $(obj);
	var _id = $this.attr('id');
	$('.modal-overlay').click();
}

//选择照片
function imagepicker() {
	var num = $('.custom-photos img').length;
	ImagePicker.getPictures(function(result) {
		var pics = '',
			html = '';
		for(var i=0;i<result.length;i++){
			html += '<div class="custom-photo"><img alt="" src="data:image/jpg;base64,' + result[i].src.toString() + '" onclick="showPic(this);" dbclick="largePic(this);"><div class="custom-photo-delete" onclick="delPic(this);"><i class="icon-guano"></i></div></div>';
			$('#uploadFile').append('<input type="hidden" name="list['+i+']" value="' + result[i].src.toString() + '">');
			$files.push(result[i].src.toString());
		}
		$('#addPhoto').before(html);
		$file = result;
	}, function(err) {
		myApp.alert(err, '提示');
	}, {
		maximumImagesCount: 9 - num,
		width: 720,
		height: 960,
		quality: 100
	});
}

//删除照片
function delPic(obj) {
	var picId = $(obj).prev().attr('id');
	if(picId == null || picId == undefined || picId ==''){
		var _index = $(obj).parent().index();
		$(obj).parent().remove();
		$('input[name^=list]').eq(_index).remove();
		$files.splice(_index, 1);
	}else{
		myApp.confirm('这张照片已上传，确定要删除吗？', '提示', function() {
			var _index = $(obj).parent().index();
			$(obj).parent().remove();
			$.ajax({
				type : 'post',  
			    url : '/smartbiz/m?slb=structure/util/filedelete',
			    data: {"ID": picId},
			    //dataType: 'json',
			    success: function (str) { 
			    	myApp.alert('删除成功',"提示");
			    },
			    error: function(e){
			    	myApp.alert('删除失败',"提示");
			    }
			});
		}, function() {

		});
	}
}

//扫描
function scanCode() {
	cordova.plugins.barcodeScanner.scan(
		function(result) {
			structureView_id = result.text;
			mainView.router.load({
				url:'structure/view.html',
			    context:{
			        ID : result.text
			    }
			});
			/*myApp.alert("扫码信息：\n" +
				"Result: " + result.text + "\n" +
				"Format: " + result.format + "\n" +
				"Cancelled: " + result.cancelled, '提示');*/
		},
		function(error) {
			myApp.alert("扫码失败： " + error, '提示');
		}, {
			prompt: "请将二维码放入扫描框中", // Android
			orientation: "portrait", // Android only (portrait|landscape), default unset so it rotates with the device
		}
	);
}

function onBackKeyDown() {
	// 获取当前view  
	var currentView = myApp.getCurrentView();
	if(currentView.history.length > 1) {
		currentView.router.back({}); //非首页返回上一级  
	} else {
		navigator.app.exitApp(); //首页点返回键退出应用  
	}
}

//点击获取当前信息ID并传入详情页
function skipDetail(e){
	var id = $(e).attr("id");
	structureView_id = id;
	mainView.router.load({
	    url:'structure/view.html',
	    context:{
	        ID : id
	    }
	});
}

//加载附件列表
function addFiles(type, id){
	$.ajax({  
	    type : 'post',  
	    url : '/smartbiz/m?slb=structure/util/filelist',
	    data: {'ID': structureView_id,'TYPE': type},
	    dataType: 'json',
	    success : function (str) { 
	    	var json = str.children, _month = [], _data = [];
	    	for(var i = 0 ;i<json.length;i++){
	    		var yymm = json[i].MONTH.substring(0,7);
	    		if(!_month.contains(yymm)){
	    			_month.push(yymm);
	    		}
	    	}
	    	for(var i = 0 ;i<_month.length;i++){
	    		var _child = [];
	    		for(var n = 0 ;n<json.length;n++){
	    			if(json[n].MONTH.substring(0,7) ==  _month[i]){
	    				_child.push(json[n]);
	    			}
	    		}
	    		var _obj = new Object();
	    		_obj.name = _month[i];
	    		_obj.child = _child;
	    		_data.push(_obj);	
	    	}
	    	var _html = '';
	    	for(var i=0;i<_data.length;i++){
	    		var _t = _data[i].name.split('-');
	    		_html += '<li class="item-divider">'+_t[0]+'年'+_t[1]+'月</li>';
	    		for(var j=0;j<_data[i].child.length;j++){
	    			var _p = _data[i].child[j].FILE_NAME.indexOf('-') + 1; 
	    			var _flieName = _data[i].child[j].FILE_NAME.substring(_p);
	    			var _fileType = _flieName.split('.')[1].toLowerCase();
	    			var _fileIcon = '', _fileIcon_i = '';
	    			var _fileSize = _data[i].child[j].FILE_SIZE > 1000000 ? parseInt(_data[i].child[j].FILE_SIZE/100000) + 'MB' : parseInt(_data[i].child[j].FILE_SIZE/1000) + 'KB';
	    			if(_fileType == 'png' || _fileType == 'jpg' || _fileType == 'jpeg' || _fileType == 'bmp' || _fileType == 'gif'){
	    				_fileIcon = 'png';
	    				_fileIcon_i = '<i class="icon-tupian"></i>';
	    			}else if(_fileType == 'doc' || _fileType == 'docx'){
	    				_fileIcon = 'word';
	    				_fileIcon_i = '<i class="icon-word"></i>';
	    			}else if(_fileType == 'xls' || _fileType == 'xlsx'){
	    				_fileIcon = 'excel';
	    				_fileIcon_i = '<i class="icon-EXCEL"></i>';
	    			}else if(_fileType == 'pdf'){
	    				_fileIcon = 'pdf';
	    				_fileIcon_i = '<i class="icon-pdf"></i>';
	    			}else{
	    				_fileIcon = 'unknow';
	    				_fileIcon_i = '<i class="icon-question-9"></i>';
	    			}
	    			_html += '<li class="item-content" id="'+_data[i].child[j].ID+'" onclick="fileDownload(&quot;'+_data[i].child[j].ID+'&quot;,&quot;'+_flieName+'&quot;);"><div class="item-media '
	    					+_fileIcon+'">'+_fileIcon_i+'</div>'
							+'<div class="item-inner"><div class="item-title"><p>'
							+_flieName+'</p><p class="custom-time">'
							+_data[i].child[j].UPLOAD_DATE + '  ' + _fileSize 
							+'</p></div><div class="download item-after"></div></div></li>'
	    		}
	    	}
	    	$('#'+ id +' ul').html(_html);
	    }
	});
}

//获取现场资料
function addCurrFiles(structureView_id){
	$.ajax({ 
	    type : 'post',  
	    url : '/smartbiz/m?slb=structure/dataselect',
	    data: {'ID': structureView_id},
	    dataType: 'json',
	    success : function (str) { 
	    	var json = str.children, _month = [], _data = [];
	    	for(var i = 0 ;i<json.length;i++){
	    		var yymm = json[i].BOOKERDATE.substring(0,7);
	    		if(!_month.contains(yymm)){
	    			_month.push(yymm);
	    		}
	    	}
	    	for(var i = 0 ;i<_month.length;i++){
	    		var _child = [];
	    		for(var n = 0 ;n<json.length;n++){
	    			if(json[n].BOOKERDATE.substring(0,7) ==  _month[i]){
	    				_child.push(json[n]);
	    			}
	    		}
	    		var _obj = new Object();
	    		_obj.name = _month[i];
	    		_obj.child = _child;
	    		_data.push(_obj);	
	    	}
	    	var _html = '';
	    	for(var i=0;i<_data.length;i++){
	    		var _t = _data[i].name.split('-');
	    		_html += '<li class="item-divider">'+_t[0]+'年'+_t[1]+'月</li>';
	    		for(var j=0;j<_data[i].child.length;j++){
	    			var _userId = _data[i].child[j].BOOKER;
	    			var _userName = _data[i].child[j].TRUE_NAME;
	    			var _userNameShort = _userName == '崇水管理员' ? '崇水' : _userName.substring(_userName.length - 2, 2);
	    			var _FNUM = _data[i].child[j].FNUM == null ? 0 : _data[i].child[j].FNUM;
	    			_html += '<li onclick="linkTo(&quot;'+_data[i].child[j].DETAIL_ID+'&quot;, &quot;'+_data[i].child[j].BOOKER+'&quot;)">'
	    					+'<a href="#" class="item-link item-content"><div class="item-media">'
						    +_userNameShort+'</div><div class="item-inner"><div class="item-title"><p>'
						    +_userName+'上传的现场资料</p><p class="custom-time">'
						    +_data[i].child[j].BOOKERDATE
						    +'</p></div><div class="item-after"><i class="icon-tupian2"></i> '
						    +_FNUM+'</div></div></a></li>';
	    		}
	    	}
	    	$('#field ul').html(_html);
	    }
	});
}

//现场资料列表跳转
function linkTo(detailID, bookerID){
	structureDetail_id = detailID;
	if(bookerID == USERID){
		mainView.router.load({
		    url:'structure/edit.html'
		});
	}else{
		mainView.router.load({
		    url:'structure/detail.html'
		});
	}
}

function fileDownload(_id, _fname){
  window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function (fs) {
    myApp.showPreloader();
    var url = ipconfig + '/a/ygjs/fileUploader/downFile?id=' + _id;
    var _downloadName = _id + '.' + _fname.split('.')[1];
    fs.root.getFile(_downloadName, { create: true, exclusive: false },
    function (fileEntry) {
        download(_downloadName, fileEntry, url);
    }, onErrorCreateFile);
  }, onErrorLoadFs);
}
 
//下载文件
function download(_fname, fileEntry, uri) {
  var fileTransfer = new FileTransfer();
  var fileURL = fileEntry.toURL();
  /*fileTransfer.onprogress = function (e) {  
    console.info(e);  
    if (e.lengthComputable) {  
      console.log('当前进度：' + e.loaded / e.total);  
    }  
  }*/
  fileTransfer.download(
    uri,
    fileURL,
    function (entry) {
    	myApp.hidePreloader();
    	var _fileType = _fname.split('.')[1].toLowerCase();
      	if(_fileType == 'png' || _fileType == 'jpg' || _fileType == 'jpeg' || _fileType == 'bmp' || _fileType == 'gif'){
      		
      	}else if(_fileType == 'doc' || _fileType == 'docx' || _fileType == 'xls' || _fileType == 'xlsx' || _fileType == 'pdf'){
      		cordova.plugins.fileOpener2.showOpenWithDialog(
  		        entry.toURL(),
  		        'application/kswps', 
  		        { 
  		          error : function(e) { 
  		            console.log('Error status: ' + e.status + ' - Error message: ' + e.message);
  		          },
  		          success : function () {
  		            console.log('file opened successfully');        
  		          }
  		        }
  		     );
      	}else{
			myApp.alert('文件无法打开', '提示');
		}
    },
    function (error) {
    	myApp.hidePreloader();
    	myApp.alert("下载失败", "提示");
    },
    null, // or, pass false
    {
      //headers: {
      //    "Authorization": "Basic dGVzdHVzZXJuYW1lOnRlc3RwYXNzd29yZA=="
      //}
    }
  );
}
 
//文件创建失败回调
function  onErrorCreateFile(error){
	myApp.hidePreloader();
	myApp.alert("文件创建失败", "提示");
  console.log("文件创建失败！", "提示")
}

//FileSystem加载失败回调
function  onErrorLoadFs(error){
	myApp.hidePreloader();
	myApp.alert("文件系统加载失败", "提示");
  console.log("文件系统加载失败！", "提示")
}

//文件读取失败回调
function  onErrorReadFile(error){
	myApp.hidePreloader();
	myApp.alert("文件读取失败", "提示");
  console.log("文件读取失败！", "提示")
}

//文件上传
function uploadHandle(url, uuid, len) {
	var fileURL = url;
	var win = function(r) {
		uploadSuccess++;
		if(uploadSuccess == $files.length) {
			myApp.alert('上传成功！', '提示');
			
			mainView.router.back();
		}
		console.log("Code = " + r.responseCode);
		console.log("Response = " + r.response);
		console.log("Sent = " + r.bytesSent);
	}
	var fail = function(error) {
			console.log('上传失败', '提示');
			console.log("An error has occurred: Code = " + error.code);
			console.log("upload error source " + error.source);
			console.log("upload error target " + error.target);
		}
		//参数
	var options = new FileUploadOptions();
	options.fileKey = 'file';
	options.fileName = fileURL.substr(fileURL.lastIndexOf('/') + 1);
	options.mimeType = "image/jpeg";
	var params = {
		mainId: uuid
	};
	options.params = params;
	//执行上传
	var ft = new FileTransfer();
	//绑定显示上传进度
	ft.onprogress = function(e) {
		if(e.lengthComputable) {
			console.log('当前进度：' + e.loaded / e.total);
		}
	}
	ft.upload(fileURL, encodeURI('/smartbiz/m?slb=structure/datainsert?ID=' + uuid), win, fail);
}

//显示图片
function loadImage(_fname){
	window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function (fs) {
		console.log('打开的文件系统: ' + fs.name );
		fs.root.getFile(_fname, { create: true, exclusive: false },
	 	function (fileEntry) {
	    	readBinaryFile(fileEntry);
		}, onErrorCreateFile);
	}, onErrorLoadFs);
}

//读取图片文件
function readBinaryFile(fileEntry) {
	fileEntry.file(function (file) {
	    var reader = new FileReader();

	    reader.onloadend = function() {
	        //加载成功显示图片
	        var blob = new Blob([new Uint8Array(this.result)], { type: "image/png" });
	        displayImage(blob);
	    };

	    reader.readAsArrayBuffer(file);

	}, onErrorReadFile);
}

//显示图片
function displayImage(blob) {
	alert(window.URL.createObjectURL(blob))
	return window.URL.createObjectURL(blob);
	//var elem = document.getElementById('imageFile');
	//elem.src = window.URL.createObjectURL(blob);
}

//图片预览查看
function showPic(obj) {
	var $this = $(obj);
	var _src = $this.attr('src');
	if($('.custom-cover').length > 0){
		$('.custom-cover').remove();
	}
	$('body').append('<div class="custom-cover" onclick="closePic();"><img src="'+_src+'" alt=""></div>');
	var _height = $('.custom-cover img').height();
	$('.custom-cover img').css('margin-top', 0 - _height/2 + 'px')
}

//图片预览放大
function largePic(obj) {
	$(obj).css('width','150%')
}

//图片预览关闭
function closePic(){
	$('.custom-cover').remove();
}

//返回当前时间
function getCurrTime(){
	var date = new Date();
	var y = date.getFullYear();
	var m = parseInt(date.getMonth()) + 1;
	m = m > 9 ? m : '0' + m;
	var d = date.getDate() > 9 ? date.getDate() : '0' + date.getDate();
	var hh = date.getHours() > 9 ? date.getHours() : '0' + date.getHours();
	var mm = date.getMinutes() > 9 ? date.getMinutes() : '0' + date.getMinutes();
	var ss = date.getSeconds() > 9 ? date.getSeconds() : '0' + date.getSeconds();
	return y + '-' + m + '-' + d + ' ' + hh + ':' + mm + ':' + ss;
}

//返回文件格式时间
function getFileTime(){
	var date = new Date();
	var y = date.getFullYear();
	var m = parseInt(date.getMonth()) + 1;
	m = m > 9 ? m : '0' + m;
	var d = date.getDate() > 9 ? date.getDate() : '0' + date.getDate();
	var hh = date.getHours() > 9 ? date.getHours() : '0' + date.getHours();
	var mm = date.getMinutes() > 9 ? date.getMinutes() : '0' + date.getMinutes();
	var ss = date.getSeconds() > 9 ? date.getSeconds() : '0' + date.getSeconds();
	var rr = parseInt(Math.random()*1000);
	return y + m + d + hh + mm + ss + rr;
}