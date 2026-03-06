<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta http-equiv="X-UA-Compatible" content="IE=edge">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="description" content="A bespoke and minimal design piece that introduces a unique way to display the time.">

<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">


<!-- favicons -->
<link rel="icon" type="image/png" href="icons/favicon-96x96.png" sizes="96x96" />
<link rel="icon" type="image/svg+xml" href="icons/favicon.svg" />
<link rel="shortcut icon" href="icons/favicon.ico" />
<link rel="apple-touch-icon" sizes="180x180" href="icons/apple-touch-icon.png" />
<link rel="manifest" href="icons/site.webmanifest" />

<!-- for social -->
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:site" content="@thelinearclock">
<meta name="twitter:creator" content="@thelinearclock">
<meta name="twitter:title" content="The Linear Clock">
<meta name="twitter:description" content="A bespoke and minimal design piece that introduces a unique way to display the time.">
<meta name="twitter:image" content="http://www.thelinearclock.co.uk/images/the-linear-clock.png">
<meta property="og:type" content="website" />
<meta property="og:url" content="http://thelinearclock.co.uk" />
<meta property="og:title" content="The Linear Clock" />
<meta property="og:description" content="A bespoke and minimal design piece that introduces a unique way to display the time." />
<meta property="og:image" content="http://www.thelinearclock.co.uk/images/the-linear-clock.png" />
<meta property="og:image:width" content="1024" />
<meta property="og:image:height" content="512" />

<title>The Linear Clock</title>

<link href="css/demo-clock.css" rel="stylesheet">

<!-- fonts -->
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Work+Sans:wght@100..900&display=swap" rel="stylesheet">


  <!-- Google Analytics (Replace G-XXXXXXX with your Measurement ID) -->
  <script async src="https://www.googletagmanager.com/gtag/js?id=G-0FD1QXLLMS"></script>
  <script>
    window.dataLayer = window.dataLayer || [];
    function gtag(){ dataLayer.push(arguments); }
    gtag('js', new Date());
    gtag('config', 'G-0FD1QXLLMS'); // Replace with your GA4 Measurement ID
  </script>
	
	<script>
	  (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
	  (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
	  m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
	  })(window,document,'script','https://www.google-analytics.com/analytics.js','ga');

	  ga('create', 'UA-546243-5', 'auto');
	  ga('send', 'pageview');

	</script>
  
	
	
</head>
<body>

		     
		   
  <!-- Main clock container -->
  <div class="clock-container layout-linear">
    <!-- Hours row -->
    <div class="hours">
      <div class="hour-dot" data-hour="1">
        <div class="hour">1</div>
        <div class="dot" data-index="1"></div>
      </div>
      <div class="hour-dot" data-hour="2">
        <div class="hour">2</div>
        <div class="dot" data-index="2"></div>
      </div>
      <div class="hour-dot" data-hour="3">
        <div class="hour">3</div>
        <div class="dot" data-index="3"></div>
      </div>
      <div class="hour-dot" data-hour="4">
        <div class="hour">4</div>
        <div class="dot" data-index="4"></div>
      </div>
      <div class="hour-dot" data-hour="5">
        <div class="hour">5</div>
        <div class="dot" data-index="5"></div>
      </div>
      <div class="hour-dot" data-hour="6">
        <div class="hour">6</div>
        <div class="dot" data-index="6"></div>
      </div>
      <div class="hour-dot" data-hour="7">
        <div class="hour">7</div>
        <div class="dot" data-index="7"></div>
      </div>
      <div class="hour-dot" data-hour="8">
        <div class="hour">8</div>
        <div class="dot" data-index="8"></div>
      </div>
      <div class="hour-dot" data-hour="9">
        <div class="hour">9</div>
        <div class="dot" data-index="9"></div>
      </div>
      <div class="hour-dot" data-hour="10">
        <div class="hour">10</div>
        <div class="dot" data-index="10"></div>
      </div>
      <div class="hour-dot" data-hour="11">
        <div class="hour">11</div>
        <div class="dot" data-index="11"></div>
      </div>
      <!-- Hour 12 with hidden dot for alignment -->
      <div class="hour-dot" data-hour="12">
        <div class="hour">12</div>
        <div class="dot hidden-dot" data-index="12"></div>
      </div>
    </div>

    <!-- AM/PM indicators below the dots, centered -->
    <div class="am-pm-center">
      <div class="am-pm am">AM</div>
      <div class="am-pm pm">PM</div>
    </div>
  </div>

 
  </div> <!-- end of .clock-container -->
  
  
  <!-- SETTINGS OVERLAY -->
  <div id="settings-overlay" class="settings-overlay">
    <div id="settings-dialog" class="settings-dialog">
      <h2>Display Settings</h2>
	  <div class="setting-group" data-setting="theme">
	    <div class="group-label">Theme</div>
	    <div class="tabs">
	      <label class="tab">
	        <input type="radio" name="theme" value="light"/>
	        <span>Light</span>
	      </label>
	      <label class="tab">
	        <input type="radio" name="theme" value="dark"/>
	        <span>Dark</span>
	      </label>
	    </div>
	  </div>

	  <div class="setting-group" data-setting="layout">
	    <div class="group-label">Layout</div>
	    <div class="tabs">
	      <label class="tab">
	        <input type="radio" name="layout" value="linear"/>
	        <span>Linear</span>
	      </label>
	      <label class="tab">
	        <input type="radio" name="layout" value="stack"/>
	        <span>Stack</span>
	      </label>
	    </div>
	  </div>

	  <div class="setting-group" data-setting="format">
	    <div class="group-label">Numbers</div>
	    <div class="tabs">
	      <label class="tab">
	        <input type="radio" name="format" value="standard"/>
	        <span>1, 2, 3</span>
	      </label>
	      <label class="tab">
	        <input type="radio" name="format" value="kanji"/>
	        <span>一, 二, 三</span>
	      </label>
	      <label class="tab">
	        <input type="radio" name="format" value="roman"/>
	        <span>I, II, III</span>
	      </label>
	    </div>
	  </div>
      
      <button id="close-settings">Done</button>
	  
	  <p class="caption"><a href="https://thelinearclock.co.uk/" title="View the Linear Clock Website">Go to website →</a></p>
    </div>
  </div>
  
  
  
  
  
   <script src="js/demo-clock.js"></script>
</body>
</html>


