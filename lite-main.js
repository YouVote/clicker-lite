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

require(["webKernel","authKernel","stdstream","studentview","litectrl","socketinfo","pagestate"],
function(webKernel,authKernel,stdStreamEngine,studentViewEngine,liteCtrlEngine,socketInfoEngine,pageStateEngine){
	// the entire state of the question
	var currQnStem=""; var currModName="null"; var currModParams="\"\"";
	var studentViewObj, qnEditObj, stdStreamObj, liteCtrlObj, socketInfoObj, pageStateObj;

	// var pageStateObj=new (function(){
	// 	this.getState=function(){
	// 		var url = new URL(location.href);
	// 		var qnSpecUriJson = url.searchParams.get("spec");
	// 		var getQnStem, getModName, getModParams;
	// 		// try to extract uridecode, json parse, qnStem, modName, modParams, fill in where successful.
	// 		if(qnSpecUriJson!=null){
	// 			try{
	// 				var jsonString=decodeURIComponent(qnSpecUriJson);
	// 				try{
	// 					var qnSpec=JSON.parse(jsonString);
	// 					if("qnStem" in qnSpec)
	// 						getQnStem=qnSpec["qnStem"];
	// 					if("modName" in qnSpec)
	// 						getModName=qnSpec["modName"];
	// 					if("modParams" in qnSpec)
	// 						getModParams=qnSpec["modParams"];
	// 				}catch(e){
	// 					stdStreamObj.pushErrorMsg("[parsing JSON] "+e);
	// 				}
	// 			}catch(e){
	// 				stdStreamObj.pushErrorMsg("[decoding URI] "+e);
	// 			}
	// 		}
	// 		// getQnSpec
	// 		return {"qnStem":getQnStem, "modName":getModName, "modParams":getModParams};
	// 	}
	// 	this.putState=function(putQnStem,putModName,putModParams){
	// 		var putQnSpec={"qnStem":putQnStem,"modName":putModName,"modParams":putModParams};
	// 		history.pushState({},"","index.html?spec="+encodeURIComponent(JSON.stringify(putQnSpec)));
	// 	}
	// })();

	var interactManager={
		connect:function(){
			// used socketInfoObj, studentViewObj, youVote
			socketInfoObj.connecting();
			youVote=new webKernel("#qnStem","#qnOpts","#respDiv","#respGhost","head");
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

		printJsonStr:function(str){

		},
		printErrMsg:function(err){
			stdStreamObj.pushErrorMsg(err);
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
		execRun:function(newQnStem,newModName,newModParams){
			// used youVote, paginator, history, stdStreamObj
			currQnStem=newQnStem; currModName=newModName; currModParams=newModParams;
			// store page state.
			pageStateObj.putState({"qnStem":currQnStem,"modName":currModName,"modParams":currModParams})
			// execute 
			youVote.execQn(currQnStem,currModName,currModParams,{});
			paginator.setDom("page-run");
			stdStreamObj.reset();
		},
		execEdit:function(){
			stdStreamObj.putJson();
			if(currModName!=null){
				stdStreamObj.putJson({"qnStem":currQnStem,"modName":currModName,"modParams":currModParams});
			}
			paginator.setDom("page-edit");
		}
	}
	studentViewObj=new studentViewEngine(
		document.getElementById("student-box")
	);
	qnEditObj=new authKernel(
		document.getElementById("editQnStem"),
		document.getElementById("editModName"),
		document.getElementById("editModMenu"),
		document.getElementById("editModParams")
	);
	stdStreamObj=new stdStreamEngine(
		document.getElementById("editJsonRep"),
		document.getElementById("editStdErr")
	);
	liteCtrlObj=new liteCtrlEngine(
		interactManager,
		document.getElementById("editBtn"),
		document.getElementById("runBtn")
	);
	socketInfoObj=new socketInfoEngine(
		interactManager,
		document.getElementById("socket-info")
	);

	pageStateObj=new pageStateEngine(
		interactManager
	);

	var currQnSpec=pageStateObj.getState();

	qnEditObj.putQnStem(currQnSpec.qnStem)
	qnEditObj.putModName(currQnSpec.modName);
	qnEditObj.putModParams(JSON.stringify(currQnSpec.modParams));

	interactManager.connect();
})
