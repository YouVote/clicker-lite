define([],function(){
	return function(interactManager,editBtn,runBtn){
		// external dependencies youVote object, qnEditObj, paginator, history, stdStreamObj
		runBtn.onclick=function(){
			// prepare to run...  
			// get existing params, check, halt and feedback if error. 
			// qnStem=qnEditObj.getQnStem();
			// modName=qnEditObj.getModName();
			// paramString=qnEditObj.getModParams();
			var newQnSpec=interactManager.getQnSpec();
			// todo: possibly more thorough check if mod exists,
			// and validity of parameters with mod
			try{
				var modParams=JSON.parse(newQnSpec.paramString);
				// RUN! 
				// var qnSpec={"qnStem":qnStem,"modName":modName,"modParams":params};
				// history.pushState({},"", "index.html?spec="+encodeURIComponent(JSON.stringify(qnSpec)));
				// youVote.execQn(qnStem,modName,params,{});
				// paginator.setDom("page-run");
				// stdStreamObj.reset();
				interactManager.execRun(qnStem,modName,modParams);
			}catch(e){
				// stdStreamObj.pushErrorMsg("[parsing Params] "+e);
				interactManager.pushEditErrMsg("[parsing Params] "+e);
			}
		}
		editBtn.onclick=function(){
			// stdStreamObj.putJson();
			// if(modName!=null){
			// 	var qnSpec={"qnStem":qnStem,"modName":modName,"modParams":modParams};
			// 	stdStreamObj.putJson(qnSpec);
			// }
			// paginator.setDom("page-edit");
			interactManager.execEdit();
		}
	}
})