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
require(["webKernel","authKernel","stdstream","studentview"],
function(webKernel,authKernel,stdStreamEngine,studentViewEngine){
	// the entire state of the question
	var qnStem=""; var modName="null"; var modParams="\"\"";
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

				// push into modEditor
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

	var liteCtrlObj=new (function(editBtn,runBtn){
		runBtn.onclick=function(){
			qnStem=qnEditObj.getQnStem();
			modName=qnEditObj.getModName();
			paramString=qnEditObj.getModParams();
			try{
				params=JSON.parse(paramString);
				// todo: possibly check with mods if parameters make sense. 
				// RUN! 
				var qnSpec={"qnStem":qnStem,"modName":modName,"modParams":params};
				history.pushState({},"", "index.html?spec="+encodeURIComponent(JSON.stringify(qnSpec)));
				youVote.execQn(qnStem,modName,params,{});
				paginator.setDom("page-run");
				stdStreamObj.reset();
			}catch(e){
				stdStreamObj.pushErrorMsg("[parsing Params] "+e);
			}
		}
		editBtn.onclick=function(){
			stdStreamObj.putJson();
			if(modName!=null){
				var qnSpec={"qnStem":qnStem,"modName":modName,"modParams":params};
				stdStreamObj.putJson(qnSpec);
			}
			paginator.setDom("page-edit");
			// fill jsonRepDom stream if previously defined. 
		}
	})(
		document.getElementById("editBtn"),
		document.getElementById("runBtn")
	);

	var socketInfoObj=new (function(infoDom){
		this.success=function(lessonId){
			infoDom.innerHTML=lessonId;
			infoDom.classList.add("lesson-id");
			infoDom.classList.remove("connect-msg");
			infoDom.onclick=function(){};
		}
		this.fail=function(err){
			console.log("failed")
			infoDom.innerHTML="Connection Failed: <br/> Click to try again.";
			infoDom.onclick=function(){
				connect();
			};
		}
		this.connecting=function(){
			infoDom.innerHTML="Connecting... ";
			infoDom.classList.remove("lesson-id");
			infoDom.classList.add("connect-msg");
		}
	})(document.getElementById("socket-info"));

	function connect(){
		socketInfoObj.connecting();
		youVote=new webKernel("#qnStem","#qnOpts","#respDiv","#respGhost","head");
		youVote.setKernelParam("onConnectPass",socketInfoObj.success);
		youVote.setKernelParam("onConnectFail",socketInfoObj.fail);
		youVote.setKernelParam("viewAddStudent",studentViewObj.addStudent);
		youVote.setKernelParam("viewMarkReconnected",studentViewObj.markReconnected);
		youVote.setKernelParam("viewMarkDisconnected",studentViewObj.markDisconnected);
		youVote.setKernelParam("viewMarkAnswered",studentViewObj.markAnswered);
		youVote.setKernelParam("viewRestorePrevAnswered",studentViewObj.resetAnswered);
		youVote.setKernelParam("yvProdBaseAddr",config.baseProdUrl);
		youVote.connect();
	}
	connect();
})
