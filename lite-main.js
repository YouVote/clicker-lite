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
	var currQnSpec=new (function(){
		var qnSpec={qnStem:"", modName:"null", modParams:"\"\""};
		this.set=function(name,value){
			if(name in qnSpec){
				qnSpec[name]=value;
			}else{
				console.warn(name+" is not a qnSpec key.");
			}
		}
		this.get=function(name){
			if(name in qnSpec){
				return qnSpec[name];
			}else{
				console.warn(name+" is not a qnSpec key.");
			}	
		}
	})();
	// var currQnStem=""; var currModName="null"; var currModParams="\"\"";
	var youVote, studentViewObj, qnEditObj, stdStreamObj, liteCtrlObj, socketInfoObj, pageStateObj;

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
				qnStem: 	currQnSpec.get("qnStem"),
				modName: 	currQnSpec.get("modName"),
				modParams: 	currQnSpec.get("modParams")
			}
		},
		putCurrSpec:function(newQnStem,newModName,newModParams){
			// currQnStem=newQnStem; 
			// currModName=newModName; 
			// currModParams=newModParams;
			currQnSpec.set("qnStem",newQnStem);
			currQnSpec.set("modName",newModName);
			currQnSpec.set("modParams",newModParams);
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
		getEditQnSpec:function(){
			return {
				qnStem:qnEditObj.getQnStem(),
				modName:qnEditObj.getModName(),
				paramString:qnEditObj.getModParams() // a little asymmetry here
			};
		},
		putEditQnSpec:function(editQnStem,editModName,editModParams){
			qnEditObj.putQnStem(editQnStem)
			qnEditObj.putModName(editModName);
			qnEditObj.putModParams(JSON.stringify(editModParams)); // a little asymmetry here
		},
		execRun:function(runQnStem,runModName,runModParams){
			interactManager.putCurrSpec(runQnStem,runModName,runModParams);
			youVote.execQn(runQnStem,runModName,runModParams,{});
			paginator.setDom("page-run");
		},
		execEdit:function(qnStem,modName,modParams){
			interactManager.putEditQnSpec(qnStem,modName,modParams);
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

	// initialize
	interactManager.connect();
	var urlQnSpec=pageStateObj.getState();
	if(urlQnSpec.modName!="null"){
		interactManager.execRun(urlQnSpec.qnStem,urlQnSpec.modName,urlQnSpec.modParams);
	}
})
