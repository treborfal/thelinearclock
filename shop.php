<?php $page_title = "Shop - The Linear Clock";
$page_description = "Presenting a unique aesthetic for a common household product.";
include("includes/header.php"); ?>
          
          <!-- content -->

          <div class="container-fluid light padding-50 margin-top-50">
            <div class="container">
              <div class="row">
                <div class="col-md-8 col-md-offset-2">

        <h1>Shop</h1>
		<p>Thinking about getting one? The Linear Clock is still only a concept, but your interest helps decide whether to launch it for real. Sign up to show your support!</p>
		
	    <form id="email-form">
	      <input type="email" name="email" class="email" placeholder="Enter your email" required />
	      <button type="submit" id="notify-button">I love it!</button>
	      <p id="response-message"></p>
	    </form>

	    <p class="terms">
	      By signing up, you agree to receive updates about the Linear Clock. You can unsubscribe at any time.
	      Read our <a href="privacy.html" target="_blank">Privacy Policy</a>.
	    </p>

          </div>
        <div class="clearfix"></div>
      </div>
    </div>
  </div>
  
  <!-- image gallery x3 -->
  <div class="container-fluid">
  	<div class="row">
  		<div class="col-md-4 no-padding overflow-hidden fadeIn wow" data-wow-delay="0s"> <img class="grow" src="images/linear-5.png" alt="The Linear Clock 5"> </div>
  		<div class="col-md-4 no-padding overflow-hidden fadeIn wow" data-wow-delay="0.1s"> <img class="grow" src="images/linear-1.png" alt="The Linear Clock 1"> </div>
  		<div class="col-md-4 no-padding overflow-hidden fadeIn wow" data-wow-delay="0.2s"> <img class="grow" src="images/linear-3.png" alt="The Linear Clock 3"> </div>
  	</div>
  </div>
  <!-- / image gallery -->
  
  <!-- /content --> 
  <script>
    document.addEventListener("DOMContentLoaded", function () {
      const button = document.getElementById("notify-button");
      const form = document.getElementById("email-form");

      if (!button || !form) return;

      const endpoint = "https://script.google.com/macros/s/AKfycbzO7lmY6q5DmwJaqhFCr-ak-dhD5DWuRjHFpOuMkEJgFZ9eypoWvBpCxE9a6znBtf5hfw/exec"; // Replace with your deployed script URL
      function getSecretToken() {
        return atob("e3b2f7c38d1441e6a5d0b1efb2c21958"); // Replace with your token
      }

      button.addEventListener("click", function () {
        if (typeof gtag === "function") {
          gtag('event', 'notify_click', {
            'event_category': 'Signup',
            'event_label': 'Early Access Form'
          });
        }
      });

      form.addEventListener("submit", async (e) => {
        e.preventDefault();

        const email = form.email.value;
        const token = getSecretToken();

        const formData = new FormData();
        formData.append("email", email);
        formData.append("token", token);

        try {
          const res = await fetch(endpoint, { method: "POST", body: formData });
          const text = await res.text();

          if (text === "Success" && typeof gtag === "function") {
            gtag('event', 'notify_submit', {
              'event_category': 'Signup',
              'event_label': 'Early Access Form'
            });
          }

          document.getElementById("response-message").innerText =
            text === "Success"
              ? "Thanks! Your support means a lot!."
              : text === "Invalid email"
              ? "Please enter a valid email address."
              : text === "Unauthorized"
              ? "Submission blocked. Please try again later."
              : "Oops! Something went wrong.";
        } catch (err) {
          document.getElementById("response-message").innerText = "Error connecting to server.";
        }

        form.reset();
      });
    });
  </script>
	
	
  
 
  <?php include("includes/footer.php"); ?>
