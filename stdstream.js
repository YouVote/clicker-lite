define([], function(){
	return function(jsonRepDom,stdErrDom){
		jsonRepDom.onclick=function(){
			jsonRepDom.select();
			document.execCommand('copy');
		}
		this.clear=function(){
			jsonRepDom.style.display="none";
			stdErrDom.style.display="none";
		}
		this.putJson=function(s){
			jsonRepDom.value=JSON.stringify(s);
			jsonRepDom.style.display="block";
		}
		this.pushErrorMsg=function(errMsg){
			stdErrDom.value=errMsg;
			stdErrDom.style.display="block";
		}
	}
})