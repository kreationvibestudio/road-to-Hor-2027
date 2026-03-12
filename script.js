(function () {
  'use strict';

  var navToggle = document.querySelector('.nav-toggle');
  var nav = document.querySelector('#nav-menu');

  if (navToggle && nav) {
    navToggle.addEventListener('click', function () {
      var isOpen = nav.classList.toggle('is-open');
      navToggle.setAttribute('aria-expanded', isOpen);
    });

    document.addEventListener('click', function (e) {
      if (nav.classList.contains('is-open') && !nav.contains(e.target) && !navToggle.contains(e.target)) {
        nav.classList.remove('is-open');
        navToggle.setAttribute('aria-expanded', 'false');
      }
    });
  }

  // Smooth scroll for anchor links (optional enhancement; CSS scroll-behavior already set)
  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    var id = anchor.getAttribute('href');
    if (id === '#') return;
    anchor.addEventListener('click', function (e) {
      var target = document.querySelector(id);
      if (target) {
        target.focus({ preventScroll: true });
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        if (nav && nav.classList.contains('is-open')) {
          nav.classList.remove('is-open');
          if (navToggle) navToggle.setAttribute('aria-expanded', 'false');
        }
      }
    });
  });

  // Manifesto: toggle English / Esan
  var manifestoLangBtn = document.getElementById('manifesto-lang-btn');
  var manifestoEn = document.getElementById('manifesto-en');
  var manifestoEsan = document.getElementById('manifesto-esan');
  if (manifestoLangBtn && manifestoEn && manifestoEsan) {
    manifestoLangBtn.addEventListener('click', function () {
      var showEsan = manifestoEsan.classList.contains('manifesto-lang--hidden');
      if (showEsan) {
        manifestoEn.classList.add('manifesto-lang--hidden');
        manifestoEn.setAttribute('aria-hidden', 'true');
        manifestoEsan.classList.remove('manifesto-lang--hidden');
        manifestoEsan.setAttribute('aria-hidden', 'false');
        manifestoLangBtn.textContent = 'View in English';
        manifestoLangBtn.setAttribute('aria-label', 'View manifesto in English');
        manifestoLangBtn.setAttribute('aria-pressed', 'true');
      } else {
        manifestoEsan.classList.add('manifesto-lang--hidden');
        manifestoEsan.setAttribute('aria-hidden', 'true');
        manifestoEn.classList.remove('manifesto-lang--hidden');
        manifestoEn.setAttribute('aria-hidden', 'false');
        manifestoLangBtn.textContent = 'View in Esan';
        manifestoLangBtn.setAttribute('aria-label', 'View manifesto in Esan');
        manifestoLangBtn.setAttribute('aria-pressed', 'false');
      }
    });
  }

  // Supabase: save constituency project requests
  var SUPABASE_URL = 'https://pwvqehmsjlapzaszckmw.supabase.co';
  var SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB3dnFlaG1zamxhcHphc3pja213Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMyNDYwMjEsImV4cCI6MjA4ODgyMjAyMX0.BAE9f-zXB0PORYCzdy4Nvfqf1fvl-YPsEFsOAfIb-SA';
  var REQUESTS_ENDPOINT = SUPABASE_URL + '/rest/v1/requests';

  var requestForm = document.querySelector('.request-form');

  if (requestForm) {
    var requestSubmitButton = requestForm.querySelector('button[type="submit"]');
    var requestMessage = requestForm.querySelector('.form-message');

    var setFormMessage = function (type, text) {
      if (!requestMessage) return;
      requestMessage.textContent = text;
      requestMessage.classList.remove('form-message--success', 'form-message--error');
      if (type === 'success') {
        requestMessage.classList.add('form-message--success');
      } else if (type === 'error') {
        requestMessage.classList.add('form-message--error');
      }
    };

    requestForm.addEventListener('submit', function (e) {
      e.preventDefault();

      // Use built-in browser validation
      if (typeof requestForm.reportValidity === 'function' && !requestForm.reportValidity()) {
        return;
      }

      var nameInput = document.getElementById('request-name');
      var communityInput = document.getElementById('request-community');
      var categorySelect = document.getElementById('request-category');
      var urgencySelect = document.getElementById('request-urgency');
      var detailsInput = document.getElementById('request-details');
      var phoneInput = document.getElementById('request-phone');
      var emailInput = document.getElementById('request-email');

      var payload = {
        name: nameInput ? nameInput.value.trim() : '',
        community: communityInput ? communityInput.value.trim() : '',
        category: categorySelect ? categorySelect.value : '',
        urgency: urgencySelect ? urgencySelect.value : '',
        details: detailsInput ? detailsInput.value.trim() : '',
        phone: phoneInput ? phoneInput.value.trim() : '',
        email: emailInput ? emailInput.value.trim() : '',
        status: 'received'
      };

      if (requestSubmitButton) {
        requestSubmitButton.disabled = true;
        requestSubmitButton.textContent = 'Sending...';
      }
      setFormMessage('info', '');

      fetch(REQUESTS_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          apikey: SUPABASE_ANON_KEY,
          Authorization: 'Bearer ' + SUPABASE_ANON_KEY,
          Prefer: 'return=minimal'
        },
        body: JSON.stringify(payload)
      }).then(function (response) {
        if (!response.ok) {
          throw new Error('Request failed with status ' + response.status);
        }
        requestForm.reset();
        setFormMessage('success', 'Thank you. Your request has been received.');
      }).catch(function () {
        setFormMessage('error', 'Sorry, something went wrong while sending your request. Please try again later or use the phone/email in the contact section.');
      }).finally(function () {
        if (requestSubmitButton) {
          requestSubmitButton.disabled = false;
          requestSubmitButton.textContent = 'Send request';
        }
      });
    });
  }

  // Funds & transparency: load projects that have started and are shown on site
  var fundsTbody = document.getElementById('funds-tbody');
  if (fundsTbody) {
    var apiOrigin = typeof window.location !== 'undefined' && window.location.origin ? window.location.origin : '';
    fetch(apiOrigin + '/api/public-projects')
      .then(function (r) { return r.ok ? r.json() : Promise.reject(); })
      .then(function (data) {
        var projects = (data && data.projects) || [];
        if (!projects.length) return;
        fundsTbody.innerHTML = '';
        projects.forEach(function (p) {
          var year = p.allocation_year != null ? String(p.allocation_year) : '—';
          var raw = (p.title || '—');
          var title = raw.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
          var amount = '—';
          if (p.allocation_amount != null) {
            var curr = p.allocation_currency || 'NGN';
            amount = curr + ' ' + Number(p.allocation_amount).toLocaleString();
          }
          var status = (p.status || '').replace(/_/g, ' ');
          status = status ? status.charAt(0).toUpperCase() + status.slice(1) : '—';
          var tr = document.createElement('tr');
          tr.innerHTML = '<td>' + year + '</td><td>' + title + '</td><td>' + amount + '</td><td>' + status + '</td>';
          fundsTbody.appendChild(tr);
        });
      })
      .catch(function () {});
  }
})();
