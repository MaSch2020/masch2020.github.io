const CONTACT = {
  whatsapp: "595XXXXXXXXX",
  email: "contacto@tudominio.com"
};

const header = document.getElementById("siteHeader");
const navToggle = document.getElementById("navToggle");
const primaryMenu = document.getElementById("primaryMenu");
const backToTop = document.getElementById("backToTop");
const navLinks = Array.from(document.querySelectorAll(".nav-links a"));
const contactForm = document.getElementById("contactForm");
const sendWhatsApp = document.getElementById("sendWhatsApp");
const sendEmail = document.getElementById("sendEmail");
const formStatus = document.getElementById("formStatus");

function setHeaderState() {
  const isScrolled = window.scrollY > 12;
  header.classList.toggle("is-scrolled", isScrolled);
  backToTop.classList.toggle("is-visible", window.scrollY > 520);
}

function closeMobileMenu() {
  navToggle.classList.remove("is-open");
  primaryMenu.classList.remove("is-open");
  navToggle.setAttribute("aria-expanded", "false");
  navToggle.setAttribute("aria-label", "Abrir menú");
}

navToggle.addEventListener("click", () => {
  const isOpen = primaryMenu.classList.toggle("is-open");
  navToggle.classList.toggle("is-open", isOpen);
  navToggle.setAttribute("aria-expanded", String(isOpen));
  navToggle.setAttribute("aria-label", isOpen ? "Cerrar menú" : "Abrir menú");
});

document.addEventListener("click", (event) => {
  const clickedInsideMenu = primaryMenu.contains(event.target);
  const clickedToggle = navToggle.contains(event.target);

  if (!clickedInsideMenu && !clickedToggle) {
    closeMobileMenu();
  }
});

navLinks.forEach((link) => {
  link.addEventListener("click", () => {
    closeMobileMenu();
  });
});

backToTop.addEventListener("click", () => {
  window.scrollTo({ top: 0, behavior: "smooth" });
});

window.addEventListener("scroll", setHeaderState, { passive: true });
setHeaderState();

const observedSections = navLinks
  .map((link) => document.querySelector(link.getAttribute("href")))
  .filter(Boolean);

if ("IntersectionObserver" in window) {
  const sectionObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;

        navLinks.forEach((link) => {
          link.classList.toggle("is-active", link.getAttribute("href") === `#${entry.target.id}`);
        });
      });
    },
    {
      rootMargin: "-35% 0px -55% 0px",
      threshold: 0
    }
  );

  observedSections.forEach((section) => sectionObserver.observe(section));
}

function getFormValues() {
  const formData = new FormData(contactForm);

  return {
    name: String(formData.get("name") || "").trim(),
    company: String(formData.get("company") || "").trim(),
    city: String(formData.get("city") || "").trim(),
    service: String(formData.get("service") || "").trim(),
    message: String(formData.get("message") || "").trim()
  };
}

function setFieldError(fieldName, message) {
  const field = contactForm.elements[fieldName];
  const error = contactForm.querySelector(`[data-error-for="${fieldName}"]`);

  if (!field || !error) return;

  field.classList.toggle("is-invalid", Boolean(message));
  field.setAttribute("aria-invalid", message ? "true" : "false");
  error.textContent = message;
}

function validateForm() {
  const values = getFormValues();
  const errors = {
    name: values.name ? "" : "Indicá tu nombre para poder responderte.",
    city: values.city ? "" : "Indicá la ciudad donde está la infraestructura.",
    service: values.service ? "" : "Seleccioná el servicio de interés.",
    message: values.message ? "" : "Contame brevemente qué necesitás mejorar."
  };

  Object.entries(errors).forEach(([field, message]) => setFieldError(field, message));

  const firstInvalidField = Object.keys(errors).find((field) => errors[field]);
  if (firstInvalidField) {
    contactForm.elements[firstInvalidField].focus();
    formStatus.textContent = "Revisá los campos marcados antes de enviar.";
    return null;
  }

  formStatus.textContent = "";
  return values;
}

function buildMessage(values) {
  const companyLine = values.company ? `Empresa u organización: ${values.company}` : "Empresa u organización: No indicada";

  return [
    "Hola Mateo, quiero solicitar un diagnóstico técnico.",
    "",
    `Nombre: ${values.name}`,
    companyLine,
    `Ciudad: ${values.city}`,
    `Servicio de interés: ${values.service}`,
    "",
    "Mensaje:",
    values.message
  ].join("\n");
}

function openWhatsApp() {
  const values = validateForm();
  if (!values) return;

  const text = encodeURIComponent(buildMessage(values));
  const url = `https://wa.me/${CONTACT.whatsapp}?text=${text}`;
  formStatus.textContent = "Abriendo WhatsApp con el mensaje preparado.";
  window.open(url, "_blank", "noopener,noreferrer");
}

function openEmail() {
  const values = validateForm();
  if (!values) return;

  const subject = encodeURIComponent(`Solicitud de diagnóstico técnico - ${values.service}`);
  const body = encodeURIComponent(buildMessage(values));
  const url = `mailto:${CONTACT.email}?subject=${subject}&body=${body}`;
  formStatus.textContent = "Abriendo tu cliente de correo con el mensaje preparado.";
  window.location.href = url;
}

sendWhatsApp.addEventListener("click", openWhatsApp);
sendEmail.addEventListener("click", openEmail);

["name", "city", "service", "message"].forEach((fieldName) => {
  const field = contactForm.elements[fieldName];
  field.addEventListener("input", () => setFieldError(fieldName, ""));
  field.addEventListener("change", () => setFieldError(fieldName, ""));
});
