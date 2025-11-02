// set year
document.getElementById("year").textContent = new Date().getFullYear();

// simple handler
function handleForm(e) {
  e.preventDefault();
  // check for consent checkbox inside this form
  const consent = e.target.querySelector('input[name="consent"]');
  if (consent && !consent.checked) {
    alert("Please check the consent box so I can contact you.");
    return;
  }

  alert("Thank you. I will follow up shortly.");
  e.target.reset();
}

const quoteForm = document.getElementById("quote-form");
const contactForm = document.getElementById("contact-form");

if (quoteForm) quoteForm.addEventListener("submit", handleForm);
if (contactForm) contactForm.addEventListener("submit", handleForm);

// Auto-wire all quote forms on the site
document.addEventListener("DOMContentLoaded", function () {
  // ✅ Your real FormSubmit email
  const FORM_EMAIL = "kendalljonesins@outlook.com";
  const THANK_YOU_URL = "https://www.jewelbasinins.com/thankyou.html";

  // select every form that should be wired
  const forms = document.querySelectorAll("form.quote-form");

  forms.forEach((form) => {
    // set action + method
    form.action = `https://formsubmit.co/${encodeURIComponent(FORM_EMAIL)}`;
    form.method = "POST";

    // ensure hidden _next exists
    if (!form.querySelector('input[name="_next"]')) {
      const nextInput = document.createElement("input");
      nextInput.type = "hidden";
      nextInput.name = "_next";
      nextInput.value = THANK_YOU_URL;
      form.appendChild(nextInput);
    }

    // turn off captcha (optional)
    if (!form.querySelector('input[name="_captcha"]')) {
      const captchaInput = document.createElement("input");
      captchaInput.type = "hidden";
      captchaInput.name = "_captcha";
      captchaInput.value = "false";
      form.appendChild(captchaInput);
    }
  });
});
