define([],function(){
	require(['jquery'],function(){
		$('head').append('<link rel="stylesheet" type="text/css" href="studentview.css">');
	})
	return function studentViewEngine(studentListDiv){
		var studentIcons={};
		
		function studentIconClass(){
			var sDiv=document.createElement('div');
			$(sDiv).addClass("studentIcon");
			$(sDiv).addClass("unanswered");
			return sDiv;
		}
		// called by yvWebKernel
		this.addStudent=function(uuid){
			var studentIcon=new studentIconClass();
			studentListDiv.appendChild(studentIcon);
			studentIcons[uuid]=studentIcon;
		}
		this.markDisconnected=function(uuid){
			$(studentIcons[uuid]).addClass("disconnected");
		}
		this.markReconnected=function(uuid){
			$(studentIcons[uuid]).removeClass("disconnected");
		}
		this.markAnswered=function(uuid){
			$(studentIcons[uuid]).removeClass("unanswered");
		}
		this.resetAnswered=function(currResp){
			for(var uuid in studentIcons){
				$(studentIcons[uuid]).addClass("unanswered");
			}
			for(var studentUuid in currResp){
				$(studentIcons[uuid]).removeClass("unanswered");
			}
		}
	}

})