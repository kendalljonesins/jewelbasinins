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
