define([],function(){
	return function(interactManager,editBtn,runBtn){
		// external dependencies youVote object, qnEditObj, paginator, history, stdStreamObj
		runBtn.onclick=function(){
			// prepare to run...  
			// get existing params, check, halt and feedback if error. 
			var newQnSpec=interactManager.getQnSpec();
			// todo: possibly more thorough check if mod exists,
			// and validity of parameters with mod
			try{
				var modParams=JSON.parse(newQnSpec.paramString);
				// RUN! 
				interactManager.execRun(newQnSpec.qnStem,newQnSpec.modName,modParams);
				interactManager.pushPageState(newQnSpec.qnStem,newQnSpec.modName,modParams);
				interactManager.printClear();
			}catch(e){
				interactManager.printErrMsg("[parsing Params] "+e);
			}
		}
		editBtn.onclick=function(){
			var currQnSpec=interactManager.getCurrSpec();
			interactManager.printClear();
			if(currQnSpec.modName!=null){
				interactManager.printJsonStr(currQnSpec);
			}
			interactManager.execEdit(currQnSpec.qnStem,currQnSpec.modName,currQnSpec.modParams);
		}
	}
})