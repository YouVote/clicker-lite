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

	var interactManager={
		connect:function(){
			// used socketInfoObj, studentViewObj, youVote
			socketInfoObj.connecting();
			youVote=new webKernel("#qnStem","#qnOpts","#respDiv","#respGhost","head");
			youVote.setKernelParam("onConnectPass",interactManager.connectPass);
			youVote.setKernelParam("onConnectFail",interactManager.connectFail);
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

		getCurrSpec:function(){
			return {
				qnStem:currQnStem,
				modName:currModName,
				modParams:currModParams
			}
		},

		printClear:function(){
			stdStreamObj.clear();
		},
		printJsonStr:function(str){
			stdStreamObj.putJson(str);
		},
		printErrMsg:function(err){
			stdStreamObj.pushErrorMsg(err);
		},

		pushPageState(newQnStem,newModName,newModParams){
			pageStateObj.putState(newQnStem,newModName,newModParams);
		},

		// called in liteCtrlObj
		getQnSpec:function(){
			return {
				qnStem:qnEditObj.getQnStem(),
				modName:qnEditObj.getModName(),
				paramString:qnEditObj.getModParams()
			};
		},
		// pushEditErrMsg:function(errMsg){
		// 	stdStreamObj.pushErrorMsg(errMsg);
		// },
		execRun:function(newQnStem,newModName,newModParams){
			// used youVote, paginator, history, stdStreamObj
			currQnStem=newQnStem; currModName=newModName; currModParams=newModParams;
			// // store page state.
			// pageStateObj.putState(currQnStem,currModName,currModParams)
			// execute 
			youVote.execQn(currQnStem,currModName,currModParams,{});
			paginator.setDom("page-run");
			// interactManager.printClear();
		},
		execEdit:function(qnStem,modName,modParams){
			// stdStreamObj.putJson();
			// if(currModName!=null){
			// 	stdStreamObj.putJson({"qnStem":currQnStem,"modName":currModName,"modParams":currModParams});
			// }

			qnEditObj.putQnStem(qnStem)
			qnEditObj.putModName(modName);
			qnEditObj.putModParams(JSON.stringify(modParams));

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
	// // initializing state.
	// qnEditObj.putQnStem(currQnSpec.qnStem)
	// qnEditObj.putModName(currQnSpec.modName);
	// qnEditObj.putModParams(JSON.stringify(currQnSpec.modParams));
	if(currQnSpec.modName!="null"){
		interactManager.execEdit(currQnSpec.qnStem,currQnSpec.modName,currQnSpec.modParams);
	}
	interactManager.connect();
})
