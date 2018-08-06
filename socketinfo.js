define([],function(){
	return function(interactManager,infoDom){
		// external dependencies: connect() function 
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
				// connect();
				console.log("trying to connect again")
				interactManager.connect();
			};
		}
		this.connecting=function(){
			infoDom.innerHTML="Connecting... ";
			infoDom.classList.remove("lesson-id");
			infoDom.classList.add("connect-msg");
		}
	}
});