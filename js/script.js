document.addEventListener('DOMContentLoaded', () => {
  // 1. Mobile Menu Toggle
  const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
  const navigationMenu = document.getElementById('navigation-menu');
  const navLinks = document.querySelectorAll('#navigation-menu a');

  if (mobileMenuToggle && navigationMenu) {
    mobileMenuToggle.addEventListener('click', () => {
      navigationMenu.classList.toggle('show');
      mobileMenuToggle.classList.toggle('open');
    });

    // Close mobile menu when a link is clicked
    navLinks.forEach(link => {
      link.addEventListener('click', () => {
        navigationMenu.classList.remove('show');
        mobileMenuToggle.classList.remove('open');
      });
    });
  }



  // 3. Scroll Reveal Animations
  const revealElements = document.querySelectorAll('.reveal');
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('active');
        // Unobserve once revealed to keep it clean, or keep observing for repeat animations
        revealObserver.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.15,
    rootMargin: '0px 0px -50px 0px'
  });

  revealElements.forEach(el => revealObserver.observe(el));

  // Active Nav Link on Scroll
  const sections = document.querySelectorAll('section[id]');
  const navObserverOptions = {
    threshold: 0.3,
    rootMargin: '-76px 0px 0px 0px' // adjust for header height
  };

  const navObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute('id');
        navLinks.forEach(link => {
          if (link.getAttribute('href') === `#${id}`) {
            link.classList.add('active');
          } else {
            link.classList.remove('active');
          }
        });
      }
    });
  }, navObserverOptions);

  sections.forEach(section => navObserver.observe(section));


  // 5. Contact Form Submission Validation & Feedback
  const contactForm = document.getElementById('contact-inquiry-form');
  const feedbackBox = document.getElementById('form-feedback-box');
  const submitBtn = document.getElementById('form-btn-submit');

  if (contactForm && feedbackBox && submitBtn) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      
      const nameInput = document.getElementById('form-input-name');
      const emailInput = document.getElementById('form-input-email');
      const serviceSelect = document.getElementById('form-input-service');
      const messageInput = document.getElementById('form-input-message');
      
      // Reset feedback status
      feedbackBox.className = 'form-feedback';
      feedbackBox.textContent = '';

      // Check values
      const name = nameInput.value.trim();
      const email = emailInput.value.trim();
      const service = serviceSelect.value;
      const message = messageInput.value.trim();

      if (!name || !email || !service || !message) {
        feedbackBox.classList.add('error');
        feedbackBox.textContent = 'Please fill out all required fields.';
        return;
      }

      // Check email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        feedbackBox.classList.add('error');
        feedbackBox.textContent = 'Please enter a valid email address.';
        return;
      }

      // Save button original text and set sending state
      const originalBtnHTML = submitBtn.innerHTML;
      submitBtn.disabled = true;
      submitBtn.style.opacity = '0.7';
      submitBtn.style.cursor = 'not-allowed';
      submitBtn.innerHTML = 'Sending...';

      // Submit Form Data
      const formData = new FormData(contactForm);
      const serviceId = formData.get('service_id');
      const templateId = formData.get('template_id');
      const publicKey = formData.get('public_key');

      // Local sandbox check: If client hasn't added their keys, simulate local success
      if (serviceId === 'YOUR_SERVICE_ID' || templateId === 'YOUR_TEMPLATE_ID' || publicKey === 'YOUR_PUBLIC_KEY') {
        setTimeout(() => {
          showSuccessFeedback(name, email);
        }, 1200);
        return;
      }

      // Real network transmission to EmailJS API
      fetch('https://api.emailjs.com/api/v1.0/email/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          service_id: serviceId,
          template_id: templateId,
          user_id: publicKey,
          template_params: {
            name: name,
            email: email,
            service: service,
            message: message
          }
        })
      })
      .then(async (response) => {
        if (response.status === 200) {
          showSuccessFeedback(name, email);
        } else {
          const errorText = await response.text();
          console.error(errorText);
          showErrorFeedback('Submission failed. Please confirm your EmailJS template settings.');
        }
      })
      .catch((error) => {
        console.error(error);
        showErrorFeedback('A connectivity error occurred. Please check your network and try again.');
      });

      function showSuccessFeedback(clientName, clientEmail) {
        feedbackBox.classList.add('success');
        feedbackBox.textContent = `Thank you, ${clientName}! Your inquiry has been sent successfully. A SRI SAI GURU SYSTEMS representative will contact you via email (${clientEmail}) in under 2 hours.`;
        
        // Reset form input values
        contactForm.reset();
        
        // Force floating labels to reset position
        const inputs = contactForm.querySelectorAll('.form-input');
        inputs.forEach(input => {
          input.dispatchEvent(new Event('input'));
        });

        resetSubmitBtn();
        startFeedbackTimer();
      }

      function showErrorFeedback(msg) {
        feedbackBox.classList.add('error');
        feedbackBox.textContent = msg;
        resetSubmitBtn();
      }

      function resetSubmitBtn() {
        submitBtn.disabled = false;
        submitBtn.style.opacity = '';
        submitBtn.style.cursor = '';
        submitBtn.innerHTML = originalBtnHTML;
      }

      function startFeedbackTimer() {
        setTimeout(() => {
          feedbackBox.style.display = 'none';
          setTimeout(() => {
            feedbackBox.className = 'form-feedback';
            feedbackBox.textContent = '';
            feedbackBox.style.display = '';
          }, 300);
        }, 8000);
      }
    });
  }
});
