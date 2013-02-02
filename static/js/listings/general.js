$(document).ready(function(){
	
	$(".grow").hide();
	$(".grow").slideDown("slow");
	
	$(".fade-in").hide();
	$(".fade-in-slow").fadeIn(2000);
	$(".fade-in-med").fadeIn(1500);
	$(".fade-in-fast").fadeIn(1000);
	
	
	$(".more").hide();
	$(".showmore").click(function(){
			$(".more").slideToggle("slow");
			$(".showmore .choices").toggle();
	});
	
	
	// gallery - lightbox plugin
	$(function() {
		$('a.enlarge').lightBox();
	});
});
