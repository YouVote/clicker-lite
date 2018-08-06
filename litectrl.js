define([],function(){
	return function(interactManager,editBtn,runBtn){
		runBtn.onclick=function(){
			// prepare to run...  
			// get existing params, check, halt and feedback if error. 
			var newQnSpec=interactManager.getEditQnSpec();
			// todo: possibly more thorough check if mod exists,
			// and validity of parameters with mod
			try{
				var modParams=JSON.parse(newQnSpec.paramString);
				// RUN! 
				interactManager.execRun(newQnSpec.qnStem,newQnSpec.modName,modParams);
				interactManager.pushUrlState(newQnSpec.qnStem,newQnSpec.modName,modParams);
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