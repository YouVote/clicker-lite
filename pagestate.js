define([],function(interactManager){
	// uses external location and history functions.
	return function(){
		this.getState=function(){
			var url = new URL(location.href);
			var qnSpecUriJson = url.searchParams.get("spec");
			var getQnStem, getModName, getModParams;
			// try to extract uridecode, json parse, qnStem, modName, modParams, fill in where successful.
			if(qnSpecUriJson!=null){
				try{
					var jsonString=decodeURIComponent(qnSpecUriJson);
					try{
						var qnSpec=JSON.parse(jsonString);
						if("qnStem" in qnSpec)
							getQnStem=qnSpec["qnStem"];
						if("modName" in qnSpec)
							getModName=qnSpec["modName"];
						if("modParams" in qnSpec)
							getModParams=qnSpec["modParams"];
					}catch(e){
						// stdStreamObj.pushErrorMsg("[parsing JSON] "+e);
						interactManager.printErrMsg("[parsing JSON] "+e);
					}
				}catch(e){
					// stdStreamObj.pushErrorMsg("[decoding URI] "+e);
					interactManager.printErrMsg("[decoding URI] "+e);
				}
			}
			// getQnSpec
			return {"qnStem":getQnStem, "modName":getModName, "modParams":getModParams};
		}
		this.putState=function(putQnStem,putModName,putModParams){
			var putQnSpec={"qnStem":putQnStem,"modName":putModName,"modParams":putModParams};
			history.pushState({},"","index.html?spec="+encodeURIComponent(JSON.stringify(putQnSpec)));
		}
	}
})