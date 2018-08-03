// based off clicker-dev/widget/sandbox-host.js
// Todo: refactor the two into a yvAuthKernel. 
define(["modindex"],function(modIdx){
	return function (qnStemDom,modNameDom,modMenuDom,modParamsDom){
		var modBaseAddr=config.baseProdUrl+"mods/";
		var modObj=new modIdx();
		var modChoices=modObj.availableMods;
		var modChoice="null"; // defaults to null
		
		// load mod index and put mods into dropdown menu
		for (var i in modChoices){
			var opt=document.createElement("li");
			opt.innerHTML="<a href='#'>"+modChoices[i]+"</a>";
			$(opt).data('modName',modChoices[i]);
			opt.onclick=function(){
				modChoice=$(this).data('modName');
				modNameDom.innerHTML=modChoice;
				require([modBaseAddr+modChoice+".js"],function(mod){
					// mods may not have implemented author method
					if(typeof(mod)=="object"){
						if(typeof(mod.author)=="function"){
							var modObj = new mod.author();
							// may need to handle possibility that author defined, but coreTemplate is not. 
							modParamsDom.value=modObj.coreTemplate;
						}else{
							modParamsDom.value="";
							console.warn(modChoice+" did not implement the author method.\nYou are on your own about what parameters to use.");
						}
					}else{
						modParamsDom.value="";
						console.warn(modChoice+" is not a properly defined object");
					}
				})
			}
			modMenuDom.appendChild(opt);
		}
		this.putQnStem=function(qnStem){
			qnStemDom.value=qnStem;
		}
		this.putModName=function(newModName){
			// todo: put error handling if modname is not in modChoices,
			// or <modBaseAddr+modChoice+.js> file not found. 
			modChoice=newModName;
			modNameDom.innerHTML=newModName;
		}
		this.putModParams=function(newModParams){
			modParamsDom.value=newModParams;
		}
		this.getQnStem=function(){
			return qnStemDom.value;
		}
		this.getModName=function(){
			return modChoice;
		}
		this.getModParams=function(){
			return modParamsDom.value;
		}
	}
})