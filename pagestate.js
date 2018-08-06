define([],function(interactManager){
	// uses external location and history functions.
	return function(){
		this.getState=function(){
			var url = new URL(location.href);
			var qnSpecUriJson = url.searchParams.get("spec");
			var getQnStem="", getModName="null", getModParams="\"\"";
			// try to extract uridecode, json parse, qnStem, modName, modParams, fill in where successful.
			if(qnSpecUriJson!=null){
				try{
					var jsonString=decodeURIComponent(qnSpecUriJson);
					try{
						var getQnSpec=JSON.parse(jsonString);
						if("qnStem" in getQnSpec)
							getQnStem=getQnSpec["qnStem"];
						if("modName" in getQnSpec)
							getModName=getQnSpec["modName"];
						if("modParams" in getQnSpec)
							getModParams=getQnSpec["modParams"];
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