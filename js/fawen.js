var myApp = new Framework7({
	modalButtonOk:'确定',
	init: false
});
var $$ = Dom7;
var mainView = myApp.addView('.view-main', {
	dynamicNavbar: true
});
var shouwenId,taskId,shouwenType = 0,procInsId,variables = '';//收文id，任务id，状态
var code;//下一步人员可选择人数
var pageNum = [1,1,1];
var loading = false,listEnd = [false,false,false];
var icons = ['icon-daiban','icon-zaiban','icon-zhongshen'];
//发文列表
myApp.onPageInit('shouwen',function (page) {
	removeRepeatPage('shouwen');
	getShouwen(shouwenType,'',1);
	myApp.showTab('#tab'+shouwenType);
	$$(".tab0").on("click",function(){
		shouwenType = 0;
		getShouwen('0',$$("#listSearch input").val(),1);
	});
    $$(".tab1").on("click",function(){
		shouwenType = 1;
		getShouwen('1',$$("#listSearch input").val(),1);
	});
	$$(".tab2").on("click",function(){
		shouwenType = 2;
		getShouwen('2',$$("#listSearch input").val(),1);
	});
	//列表无限滚动加载
	$$('.infinite-scroll').on('infinite', function () {
		if (loading || listEnd[shouwenType]) return;
		loading = true;
		getShouwen(shouwenType,$$("#listSearch input").val(),pageNum[shouwenType]*1+1);
	});
	$$("#listSearch input").change(function(){
		getShouwen(shouwenType,$$("#listSearch input").val(),1);
	});

	//返回首页
	$('#back').click(function(){
		window.location.href = '../index.html';
	});
});
//发文详情
myApp.onPageInit('shouwen-content',function (page) {
	pushHistory('content.html');//页面跳转
	var _page = $(".shouwen-content .page-content");
	var isZhuihui = true;
	if(shouwenType==0){
		_page.addClass("has-btn");
	}else if(shouwenType==1){
		//检查是否可以追回
		$.ajax({
			type: "post",
			url: _url+"workflow/callBackCheck",
			data: {"accessToken":accessToken,"procInsId":procInsId},
			dataType: 'jsonp',
			async:false,
	        jsonp: "callback",
	        jsonpCallback:"callbackd"+new Date().getTime(),
			success: function (data) {
				if(data.data.flag==false){
					_page.removeClass("has-btn");
					isZhuihui = false;
				}else{
					_page.addClass("has-btn");
				}
			}
		});
	}else if(shouwenType==2){
		_page.removeClass("has-btn");
	}
	//获取发文详情
	$.ajax({
		type: "post",
		url: _url+"oa/docmentSend/get?id="+shouwenId,
		data: {"accessToken":accessToken},
		dataType: 'jsonp',
        jsonp: "callback",
        jsonpCallback:"callbacka"+new Date().getTime(),
		success: function (data) {
			var json = data.data;
//			var _acceptType = ['正式文件','信函式文件','部门便函','会议纪要','电子邮件','传真','其他'];//来文种类
//			if(json.acceptType>5){
//				json.acceptType = 6;
//			}
//			var _docAcceptTime = getDate(json.docAcceptTime);
			var _sendType=['通知','通报','报告','请示','批复','意见','函','会议记录','决定','签呈'];
			var _secLevel=['','普通','秘密','机密','绝密'];
			var _priority=['','一般','平级','加急','特急'];
			var message = {"deptName":json.deptName,"docSendTotal":json.docSendTotal,"drafter":json.drafter,"title":json.title,"docSendNum":json.docSendNum,"sendtype":_sendType[json.sendtype],"priority":_priority[json.priority],"secLevel":_secLevel[json.secLevel],"shouwenType":shouwenType,"isZhuihui":isZhuihui,"iclass":"#"+icons[shouwenType]};
			new Vue({
				el: '#fawenContent',
				data: message
			}); 
		},
		error:function(json){
		}
	});
	//获取附件信息
	$.ajax({
		type: "post",
		url: _url+"common/attachfiles/getAttachFiles?affilationId="+shouwenId,
		data: {"accessToken":accessToken},
		dataType: 'jsonp',
        jsonp: "callback",
        jsonpCallback:"callbackb"+new Date().getTime(),
		success: function (data) {
			var json = data.data;
			var lists = [];
			var detClass;
			var _num = 0;
			if(json.length>0){
				_num = json.length;
				for(var i=0;i<json.length;i++){
					var _fileSize = '';
					if(json[i].fileSize){
						_fileSize = json[i].fileSize.FILE_SIZE > 1000000 ? parseInt(json[i].fileSize/100000) + 'MB' : parseInt(json[i].fileSize/1000) + 'KB';
					}
					var arr = json[i].fileName.lastIndexOf(".");
					var _fileType = json[i].fileName.substring(arr+1).toLowerCase();
	    			if(_fileType == 'png'){
	    				_fileIcon = 'icon-png';
	    			}else if(_fileType == 'jpg' || _fileType == 'jpeg' || _fileType == 'bmp' || _fileType == 'gif'){
						_fileIcon = 'icon-jpg';
	    			}else if(_fileType == 'doc' || _fileType == 'docx'){
	    				_fileIcon = 'icon-word1';
	    			}else if(_fileType == 'ppt' || _fileType == 'pptx'){
	    				_fileIcon = 'icon-ppt';
	    			}else if(_fileType == 'xls' || _fileType == 'xlsx'){
	    				_fileIcon = 'icon-excel';
	    			}else if(_fileType == 'zip' || _fileType == 'rar'){
	    				_fileIcon = 'icon-zip';
	    			}else if(_fileType == 'pdf'){
	    				_fileIcon = 'icon-pdf1';
	    			}else{
	    				_fileIcon = 'icon-qita';
	    			}
					lists.push({"id":json[i].id,"title":json[i].fileName,"size":_fileSize,"icon":"#"+_fileIcon});
				}
				detClass = 'content-det';
			}else{
				detClass = 'content-det no-title';
			}
			new Vue({
				el: '#fileList',
				data: {
					lists:lists,
					num:_num,
					detClass:detClass
				},
				methods: {  
					downLoad: function (id) {
						
					}  
				}
			}); 
		},
		error:function(json){
		}
	});
	getRecord('record');//获取记录列表
});
//办理
var tacheVue;
var personVue;
myApp.onPageInit('banli',function (page) {
	//获取流程环节
	tacheVue = new Vue({
		el: '#tache',
		data: {
			lists:{}
		},
		methods:{
			checked:function(vb){
				$.each(vb, function(i){
					variables = i+":"+vb[i];
				});
			}
		}
	});
	getTache(true);
	getUsed('banliUsed','banliCon');

	//流程发送人员选择
	personVue = new Vue({
        el:'#add-name',
        data:{
            listName:[]
        },
        methods:{
            Remove: function (index) {
                this.listName.splice(index,1);
                sessionStorage.setItem('arrName',JSON.stringify(this.listName));
            }
        }
    });
});
//人员列表
myApp.onPageInit('person',function (page) {
	var tacheValue = $("input[name='tache']:checked").val();
	var json;
	//获取所有可选人员信息
	$.ajax({
		type: "post",
		url: _url+"workflow/getParticipant",
		data: {"accessToken":accessToken,"taskId":taskId,"taskDefKey":tacheValue},
		dataType: 'jsonp',
        jsonp: "callback",
        jsonpCallback:"callback"+new Date().getTime(),
		success: function (data) {
			json = data.data.persons;
			new Vue({
				el:'#list-name',
				data:{
					listName:json
				},
		        methods:{
		            select: function (event) {

		            }
		        }
			
			});
			//可选择多人
			if(code){
				$('.list-block').css('height',$('body').height()-218+'px');
				var Input = $("[data-page='person']>.page-content input");		
				selectAll(Input);
			}else{//只选择一人
				$('.select-b').css('display','none');
				$('.list-block').css('height',$('body').height()-159+'px');
				$('.list-block li').on('click','input',function(){
					var n=$('.list-block li>input').index($(this));
					if(this.checked){
						$(".list-block li>input").prop('checked',false);
						this.checked=true;
					}
				})
			}
			//匹配选中联系人
			var arrName='';
			if(sessionStorage.getItem('arrName')!=null) {
				arrName = JSON.parse(sessionStorage.getItem('arrName'));
			}
			if(arrName!='') {
				for(var i=0;i<json.length;i++){
					for(var j=0;j<arrName.length;j++){
						if(arrName[j].userId==json[i].userId){
							$('.list-block input')[i].checked=true;
						}
					}
				}
				selectState();
			}
		},
		error:function(json){
		}
	});
	//选择人数变化和状态变化
	$("[data-page='person'] .page-content").on('click','input',function(){
		selectState();
	});
	//传递选中的联系人数组
	$('.footer>button').click(function(){
		var getName=$('.list-block input:checked'),arrName=[];
		for(var i=0;i<getName.length;i++){
			var getList=json.filter(function (item) {return item.userId == getName.parent().eq(i).find('.item-title-row').find('[hidden=hidden]').text();});
			arrName.push(getList[0]);
		}
		sessionStorage.setItem('arrName',JSON.stringify(arrName));
		mainView.router.back();
		personVue.listName = arrName;
	});
});
//驳回
myApp.onPageInit('bohui',function (page) {
	//getUsed('bohuiUsed','bohuiCon');
});
//追回
myApp.onPageInit('zhuihui',function (page) {
	//getUsed('zhuihuiUsed','zhuihuiCon');
});
//驳回记录查看
myApp.onPageInit('record',function(page){
	myApp.closeModal();
	pushHistory('record.html');//页面跳转
	$.ajax({
		type: "post",
		url: _url+"workflow/getRejectflow",
		data: {"accessToken":accessToken,"procInsId":procInsId},
		dataType: 'jsonp',
        jsonp: "callback",
        jsonpCallback:"callback"+new Date().getTime(),
		success: function (data) {
			if(data.data.length>0){
				new Vue({
					el: '#bohuiRecord',
					data: {
						lists:data.data,
						recordList:[]
					},
					beforeMount(){
						for(var i=0;i<this.lists.length;i++){
							this.lists[i].onoff=false;
							this.lists[i].addClass="";
						}
					},
					methods:{
						getMoreInfo:function(index){
							var _this = this;
							var procInsIda=_this.lists[index].processInstanceId;
							$.ajax({
								type: "post",
								url: _url+"workflow/getCommandLocalflow",
								data: {"accessToken":accessToken,"procInsId":procInsIda},
								dataType: 'jsonp',
						        jsonp: "callback",
						        jsonpCallback:"callback"+new Date().getTime(),
								success: function (data) {
									_this.recordList = data.data;
								},
								error:function(json){
								}
							});
							this.lists[index].onoff=!this.lists[index].onoff;
							this.lists[index].addClass=this.lists[index].addClass==""?this.lists[index].addClass='turn':this.lists[index].addClass="";
							console.info(this.lists[index].addClass)
						},
						proposer:function(n){
							return proposer(n);
						},
						gtime:function(n){
							return gtime(n)
						},
						switchText:function(text){
							var json = {'done':'已办','delete':'驳回','back':'退回','takeBack':'撤办','recall':'追回','turn':'转办','undo':'待办'}; 
							return json[text];
						}
					}
				});
			}else{
				var _html = `<div class="no-info"><div class="no-info-icon"><svg class="icon" aria-hidden="true" ><use xlink:href="#icon-sousuowujieguo"></use></svg></div>暂无驳回记录</div>`;
				$("#bohuiRecord").html(_html);
			}
		},
		error:function(json){
		}
	});
	
});


myApp.init();

/**
*获取收文信息
*tyle 1 待办  2在办  3终审
*/
function getShouwen(type,keywords,pageNo){
	var infoUrl;
	pageNum[type] = pageNo;
	var pageLength = 20;
	if(type==0){
		infoUrl = _url+"workflow/getActivitiList?procDefKey=fwgl&pageNo="+pageNo+"&pageSize="+pageLength;
	}else if(type==1){
		infoUrl = _url+"workflow/getUnfinishActivitiList?procDefKey=fwgl&pageNo="+pageNo+"&pageSize="+pageLength;
	}else if(type==2){
		infoUrl = _url+"workflow/getFinishedActivitiList?procDefKey=fwgl&pageNo="+pageNo+"&pageSize="+pageLength;
	}
	if(pageNo==1){
		$("#tab"+type+" ul").empty();
	}
	$.ajax({
		type: "post",
		url: infoUrl,
		data: {"keywords":keywords,"accessToken":accessToken},
		dataType: 'jsonp',
        jsonp: "callback",
        jsonpCallback:"callback"+new Date().getTime(),
		success: function (data) {
			loading = false;
			var json = data.data;
			if(json.length<pageLength){
				listEnd[type] = true;
				$$('.infinite-scroll-preloader').hide();
			}
			var _html = '';
			if(json.length>0){
				for(var i=0;i<json.length;i++){
					var _id = json[i].businessId;
					_html+=`<li><a href="content.html" onclick="detailInfo('${json[i].businessId}','${json[i].taskId}','${json[i].procInsId}')" class="item-link">${json[i].vars.map.title}</a></li>`;
				}
			}else{
				_html+=`<div class="no-info"><div class="no-info-icon"><svg class="icon" aria-hidden="true" ><use xlink:href="#icon-sousuowujieguo"></use></svg></div>暂无数据</div>`;
			}
			$("#tab"+type+" ul").append(_html);
		},
		error:function(json){
			var _html = `<div class="no-info"><div class="no-info-icon"><svg class="icon" aria-hidden="true" ><use xlink:href="#icon-sousuowujieguo"></use></svg></div>暂无数据</div>`;
			$("#tab"+type+" ul").append(_html);
			$$('.infinite-scroll-preloader').hide();
		}
	});
}
function detailInfo(id,tid,pid) {
	shouwenId = id;
	taskId = tid;
	procInsId = pid;
}
//追回
function zhuihui(){
	var _zhuihuiCon = $$("#zhuihuiCon").val();
	var _con = _zhuihuiCon.replace(/ |\n|\r\n/g,"");
	if(_con==""){
		tips("请输入办理意见");
	}else{
		var _pram = {"taskId":taskId,"procInsId":procInsId,"comment":_zhuihuiCon,"accessToken":accessToken};
		$.ajax({
			type: "post",
			url: _url+"workflow/optCallBack",
			data: _pram,
			dataType: 'jsonp',
	        jsonp: "callback",
	        jsonpCallback:"callback"+new Date().getTime(),
			success: function (data) {
				if(data.data.flag){
					tips("已追回",function(){
						mainView.router.back({"url":"list.html","force":true});
					});
				}else{
					tips(data.data.msg,function(){
						mainView.router.back();
					});
				}
			},
			error:function(json){
				tips("追回失败",function(){
					mainView.router.back();
				});
			}
		});
	}
}
//驳回
function bohui(){
	var _bohuiCon = $$("#bohuiCon").val();
	var _con = _bohuiCon.replace(/ |\n|\r\n/g,"");
	if(_con==""){
		tips("请输入办理意见");
	}else{
		var _pram = {"taskId":taskId,"procInsId":procInsId,"comment":_bohuiCon,"accessToken":accessToken};
		$.ajax({
			type: "post",
			url: _url+"workflow/optReject",
			data: _pram,
			dataType: 'jsonp',
	        jsonp: "callback",
	        jsonpCallback:"callback"+new Date().getTime(),
			success: function (data) {
				if(data.data.result){
					tips("已驳回",function(){
						mainView.router.back({"url":"list.html","force":true});
					});
				}else{
					tips(data.data.msg,function(){
						mainView.router.back();
					});
				}
			},
			error:function(json){
				tips("驳回失败",function(){
					mainView.router.back();
				});
			}
		});
	}
}
//获取常用办理意见
function getUsed(id,conBoxId){
	$.ajax({
		type: "post",
		url: _url+"commonPhrase/getPhrases?pageNum=1&pageSize=6",
		dataType: 'jsonp',
        jsonp: "callback",
        jsonpCallback:"callback"+new Date().getTime(),
		success: function (data) {
			if(data.data.flag){
				new Vue({
					el: '#'+id,
					data:{
						messages:data.data.data
					},
					methods: {  
					    checkUsed: function (message) {
					    	$$("#"+conBoxId).val(message);
					    	myApp.closeModal();
						}  
					}
				});
			}
		},
		error:function(json){
		}
	});
}
//办理
function banli(){
	var _banliCon = $$("#banliCon").val();
	var _con = _banliCon.replace(/ |\n|\r\n/g,"");
	var _personNum = 0,_person = '',_persons = '';
	if(sessionStorage.getItem('arrName')){
		_person = JSON.parse(sessionStorage.getItem('arrName'));
		_personNum = _person.length;
	}
	var tacheValue = $("input[name='tache']:checked").val();
	var isNext = $("input[name='process']:checked").val();
	var _urlb = '',_pram;
	if(_con==""){
		tips("请输入办理意见");
	}else if(_personNum<=0 && isNext){
		tips("请选择流程发送人员");
	}else{
		for(var i=0;i<_personNum;i++){
			_persons += _person[i].loginName + ",";
		}
		_persons = _persons.slice(0,_persons.length-1);
		if(isNext=='false'){
			_pram = {"taskId":taskId,"businessId":shouwenId,"comment":_banliCon,"accessToken":accessToken,"isNext":isNext};
			myApp.showIndicator();
		}else{
			_pram = {"taskId":taskId,"businessId":shouwenId,"comment":_banliCon,"accessToken":accessToken,"isNext":isNext,"JFW_NEXTPARTICIPANT":_persons,"frm.branchArgs":variables};
			myApp.showIndicator();
		}
		$.ajax({
			type: "post",
			url: _url+'oa/docmentSend/optCommitProcess',
			data: _pram,
			dataType: 'jsonp',
	        jsonp: "callback",
	        jsonpCallback:"callback"+new Date().getTime(),
			success: function (data) {
				 myApp.hideIndicator();
				//提交常用意见
				$.ajax({
					type: "post",
					url: _url+"commonPhrase/save",
					data: {"phrase":_banliCon},
					dataType: 'jsonp',
			        jsonp: "callback",
			        jsonpCallback:"callback"+new Date().getTime(),
					success: function (data) {
						
					}
				});
				if(data.data.flag){
					tips("已办理",function(){
						mainView.router.back({"url":"list.html","force":true});
					});
				}else{
					tips(data.data.msg,function(){
						mainView.router.back();
					});
				}
			},
			error:function(json){
				tips("办理失败",function(){
					mainView.router.back();
				});
			}
		});
	}
}
//获取流程环节
function getTache(isNext){
	if(isNext){
		$("#sendPerson").show();
	}else{
		$("#sendPerson").hide();
	}
	$.ajax({
		type: "post",
		url: _url+"workflow/getNextActivity",
		data: {"isNext":isNext,"taskId":taskId,"accessToken":accessToken},
		dataType: 'jsonp',
        jsonp: "callback",
        jsonpCallback:"callback"+new Date().getTime(),
		success: function (data) {
			tacheVue.lists = data.data;
			code = data.data.ismulti;
			if(data.data[0].startNode){
				$(".page-banli .opr-btn").slideUp();
				$(".page-banli .page-content").addClass("has-btn");
			}else{
				$(".page-banli .opr-btn").slideDown();
				$(".page-banli .page-content").removeClass("has-btn");
			}
		},
		error:function(json){
			
		}
	});
}
//获取记录
function getRecord(contentId){
	$.ajax({
		type: "post",
		url: _url+"workflow/getHistoicFlow",
		data: {"accessToken":accessToken,"procInsId":procInsId},
		dataType: 'jsonp',
        jsonp: "callback",
        jsonpCallback:"callback"+new Date().getTime(),
		success: function (data) {
			var json = data.data;
			var max = json.length-1;
			new Vue({
				el:'#'+contentId,
				data:{
					listRecord:json,
					max:max
				},
				methods:{
					proposer:function(n){
						return proposer(n);
					},
					gtime:function(n){
						return gtime(n)
					},
					wait:function(n){
						var e=new Date().getTime()-n;
						return wait(e)
					},
					switchText:function(text){
						var json = {'done':'已办','delete':'驳回','back':'退回','takeBack':'撤办','recall':'追回','turn':'转办','undo':'待办'}; 
						return json[text];
					}
				}
			});
		},
		error:function(json){
		}
	});
}