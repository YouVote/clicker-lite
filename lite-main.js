require.config({ urlArgs: "v=" +  (new Date()).getTime() });

require.config({
	packages:[
		{"name":"webKernel","location":"../yvWebKernel"},
		{"name":"authKernel","location":"../yvAuthKernel"},
		{"name":"ctype","location":config.baseProdUrl+"ctype/"},
		{"name":"async","location":config.baseProdUrl+"async/"},
		{"name":"modindex","location":config.baseProdUrl+"mods/"} // needed by authKernel
	],
	paths:{
		"socket-router":"https://youvote.github.io/socket-router/main", // needed by webKernel
		"jquery":"https://cdnjs.cloudflare.com/ajax/libs/jquery/3.2.1/jquery.min",
		"bootstrap":"https://cdnjs.cloudflare.com/ajax/libs/twitter-bootstrap/3.3.7/js/bootstrap.min",
		"d3js":"https://cdnjs.cloudflare.com/ajax/libs/d3/4.2.0/d3.min",
		"vue":"https://cdnjs.cloudflare.com/ajax/libs/vue/2.3.3/vue",
		"studentview":"studentview",
	},
});
var $;

require(['jquery'],function(){
	require(['bootstrap'])
	$('head').append('<link rel="stylesheet" type="text/css" href="https://cdnjs.cloudflare.com/ajax/libs/twitter-bootstrap/3.3.7/css/bootstrap.min.css">');
	$('head').append('<link rel="stylesheet" type="text/css" href="lite.css">');
})

// require(["webKernel","qneditor","stdstream","studentview"],
require(["webKernel","authKernel","stdstream","studentview","litectrl","socketinfo"],
function(webKernel,authKernel,stdStreamEngine,studentViewEngine,liteCtrlEngine,socketInfoEngine){
	// the entire state of the question
	var qnStem=""; var modName="null"; var modParams="\"\"";

	var interactManager={
		connect:function(){
			// used socketInfoObj, studentViewObj, youVote
			socketInfoObj.connecting();
			youVote=new webKernel("#qnStem","#qnOpts","#respDiv","#respGhost","head");
			// youVote.setKernelParam("onConnectPass",socketInfoObj.success);
			// youVote.setKernelParam("onConnectFail",socketInfoObj.fail);
			youVote.setKernelParam("onConnectPass",interactManager.connectPass);
			youVote.setKernelParam("onConnectFail",interactManager.connectPass);
			youVote.setKernelParam("viewAddStudent",studentViewObj.addStudent);
			youVote.setKernelParam("viewMarkReconnected",studentViewObj.markReconnected);
			youVote.setKernelParam("viewMarkDisconnected",studentViewObj.markDisconnected);
			youVote.setKernelParam("viewMarkAnswered",studentViewObj.markAnswered);
			youVote.setKernelParam("viewRestorePrevAnswered",studentViewObj.resetAnswered);
			youVote.setKernelParam("yvProdBaseAddr",config.baseProdUrl);
			youVote.connect();
		},
		connectPass:function(lessonId){
			socketInfoObj.success(lessonId);
		},
		connectFail:function(err){
			socketInfoObj.fail(err);
		},
		// called in liteCtrlObj
		getQnSpec:function(){
			return {
				qnStem:qnEditObj.getQnStem(),
				modName:qnEditObj.getModName(),
				paramString:qnEditObj.getModParams()
			};
		},
		pushEditErrMsg:function(errMsg){
			stdStreamObj.pushErrorMsg(errMsg);
		},
		execRun:function(qnStem,modName,modParams){
			// used youVote, paginator, history, stdStreamObj
			var qnSpec={"qnStem":qnStem,"modName":modName,"modParams":modParams};
			history.pushState({},"", "index.html?spec="+encodeURIComponent(JSON.stringify(qnSpec)));
			youVote.execQn(qnStem,modName,modParams,{});
			paginator.setDom("page-run");
			stdStreamObj.reset();
		},
		execEdit:function(){
			stdStreamObj.putJson();
			if(modName!=null){
				var qnSpec={"qnStem":qnStem,"modName":modName,"modParams":modParams};
				stdStreamObj.putJson(qnSpec);
			}
			paginator.setDom("page-edit");
		}
	}

	var studentViewObj=new studentViewEngine(
		document.getElementById("student-box")
	);
	var qnEditObj=new authKernel(
		document.getElementById("editQnStem"),
		document.getElementById("editModName"),
		document.getElementById("editModMenu"),
		document.getElementById("editModParams")
	);
	var stdStreamObj=new stdStreamEngine(
		document.getElementById("editJsonRep"),
		document.getElementById("editStdErr")
	);

	var url = new URL(location.href);
	var qnSpecUriJson = url.searchParams.get("spec");
	// try to extract uridecode, json parse, qnStem, modName, modParams, fill in where successful.
	if(qnSpecUriJson!=null){
		try{
			var jsonString=decodeURIComponent(qnSpecUriJson);
			try{
				var qnSpec=JSON.parse(jsonString);
				if("qnStem" in qnSpec)
					qnStem=qnSpec["qnStem"];
				if("modName" in qnSpec)
					modName=qnSpec["modName"];
				if("modParams" in qnSpec)
					modParams=qnSpec["modParams"];

				// push into qnEditObj
				qnEditObj.putQnStem(qnStem)
				qnEditObj.putModName(modName);
				qnEditObj.putModParams(JSON.stringify(modParams));
				// perhaps automatically run here. 
				stdStreamObj.putJson(qnSpec);
			}catch(e){
				stdStreamObj.pushErrorMsg("[parsing JSON] "+e);
			}
		}catch(e){
			stdStreamObj.pushErrorMsg("[decoding URI] "+e);
		}
	}

	// var liteCtrlObj=new (function(interactManager,editBtn,runBtn){
	// 	// external dependencies youVote object, qnEditObj, paginator, history, stdStreamObj
	// 	runBtn.onclick=function(){
	// 		// prepare to run...  
	// 		// get existing params, check, halt and feedback if error. 
	// 		// qnStem=qnEditObj.getQnStem();
	// 		// modName=qnEditObj.getModName();
	// 		// paramString=qnEditObj.getModParams();
	// 		var newQnSpec=interactManager.getQnSpec();
	// 		// todo: possibly more thorough check if mod exists,
	// 		// and validity of parameters with mod
	// 		try{
	// 			var modParams=JSON.parse(newQnSpec.paramString);
	// 			// RUN! 
	// 			// var qnSpec={"qnStem":qnStem,"modName":modName,"modParams":params};
	// 			// history.pushState({},"", "index.html?spec="+encodeURIComponent(JSON.stringify(qnSpec)));
	// 			// youVote.execQn(qnStem,modName,params,{});
	// 			// paginator.setDom("page-run");
	// 			// stdStreamObj.reset();
	// 			interactManager.execRun(qnStem,modName,modParams);
	// 		}catch(e){
	// 			// stdStreamObj.pushErrorMsg("[parsing Params] "+e);
	// 			interactManager.pushEditErrMsg("[parsing Params] "+e);
	// 		}
	// 	}
	// 	editBtn.onclick=function(){
	// 		// stdStreamObj.putJson();
	// 		// if(modName!=null){
	// 		// 	var qnSpec={"qnStem":qnStem,"modName":modName,"modParams":modParams};
	// 		// 	stdStreamObj.putJson(qnSpec);
	// 		// }
	// 		// paginator.setDom("page-edit");
	// 		interactManager.execEdit();
	// 	}
	// })(
	// 	interactManager,
	// 	document.getElementById("editBtn"),
	// 	document.getElementById("runBtn")
	// );
	var liteCtrlObj=new liteCtrlEngine(
		interactManager,
		document.getElementById("editBtn"),
		document.getElementById("runBtn")
	);
	// var socketInfoObj=new (function(interactManager,infoDom){
	// 	// external dependencies: connect() function 
	// 	this.success=function(lessonId){
	// 		infoDom.innerHTML=lessonId;
	// 		infoDom.classList.add("lesson-id");
	// 		infoDom.classList.remove("connect-msg");
	// 		infoDom.onclick=function(){};
	// 	}
	// 	this.fail=function(err){
	// 		console.log("failed")
	// 		infoDom.innerHTML="Connection Failed: <br/> Click to try again.";
	// 		infoDom.onclick=function(){
	// 			// connect();
	// 			interactManager.connect();
	// 		};
	// 	}
	// 	this.connecting=function(){
	// 		infoDom.innerHTML="Connecting... ";
	// 		infoDom.classList.remove("lesson-id");
	// 		infoDom.classList.add("connect-msg");
	// 	}
	// })(interactManager,document.getElementById("socket-info"));

	var socketInfoObj=new socketInfoEngine(interactManager,document.getElementById("socket-info"));

	// function connect(){
	// 	// external dependencies socketInfoObj, youvote
	// 	socketInfoObj.connecting();
	// 	youVote=new webKernel("#qnStem","#qnOpts","#respDiv","#respGhost","head");
	// 	youVote.setKernelParam("onConnectPass",socketInfoObj.success);
	// 	youVote.setKernelParam("onConnectFail",socketInfoObj.fail);
	// 	youVote.setKernelParam("viewAddStudent",studentViewObj.addStudent);
	// 	youVote.setKernelParam("viewMarkReconnected",studentViewObj.markReconnected);
	// 	youVote.setKernelParam("viewMarkDisconnected",studentViewObj.markDisconnected);
	// 	youVote.setKernelParam("viewMarkAnswered",studentViewObj.markAnswered);
	// 	youVote.setKernelParam("viewRestorePrevAnswered",studentViewObj.resetAnswered);
	// 	youVote.setKernelParam("yvProdBaseAddr",config.baseProdUrl);
	// 	youVote.connect();
	// }
	interactManager.connect();
})
