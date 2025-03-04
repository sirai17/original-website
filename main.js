const hamburger = document.querySelector(".hamburger");
const nav = document.querySelector(".nav");

// hamburger.addEventListener("click", () => {
//   hamburger.classList.toggle("open");
//   nav.classList.toggle("open");
// });

//リュハットン西東京とは
document.addEventListener("DOMContentLoaded", function () {
  const scrollElements = document.querySelectorAll(".js-scroll-opa-in");
  const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
          if (entry.isIntersecting) {
              entry.target.classList.add("active");
          }
      });
  }, { threshold: 0.1 });

  scrollElements.forEach(el => observer.observe(el));
});

//comma達
document.addEventListener("DOMContentLoaded", function () {
  const scrollElements = document.querySelectorAll(".about-us_container");

  const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
          if (entry.isIntersecting) {
              entry.target.classList.add("active");
          }
      });
  }, { threshold: 0.1 });

  scrollElements.forEach(el => observer.observe(el));
});

//text
document.addEventListener("DOMContentLoaded", function () {
  const scrollElements = document.querySelectorAll(".p-about-us");

  const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
          if (entry.isIntersecting) {
              entry.target.classList.add("active");
          }
      });
  }, { threshold: 0.1 });

  scrollElements.forEach(el => observer.observe(el));
});

//mini写真
document.addEventListener("DOMContentLoaded", function () {
  const scrollElements = document.querySelectorAll(".img");

  const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
          if (entry.isIntersecting) {
              entry.target.classList.add("active");
          }
      });
  }, { threshold: 0.1 });

  scrollElements.forEach(el => observer.observe(el));
});

//newsロゴ
document.addEventListener("DOMContentLoaded", function () {
  const scrollElements = document.querySelectorAll(".news-logo");

  const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
          if (entry.isIntersecting) {
              entry.target.classList.add("active");
          }
      });
  }, { threshold: 0.1 });

  scrollElements.forEach(el => observer.observe(el));
});
//news中身
document.addEventListener("DOMContentLoaded", function () {
  const scrollElements = document.querySelectorAll(".article");

  const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
          if (entry.isIntersecting) {
              entry.target.classList.add("active");
          }
      });
  }, { threshold: 0.1 });

  scrollElements.forEach(el => observer.observe(el));
});
document.addEventListener("DOMContentLoaded", function () {
  const scrollElements = document.querySelectorAll(".article02");

  const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
          if (entry.isIntersecting) {
              entry.target.classList.add("active");
          }
      });
  }, { threshold: 0.1 });

  scrollElements.forEach(el => observer.observe(el));
});

document.addEventListener("DOMContentLoaded", function () {
  const scrollElements = document.querySelectorAll(".event-list"); 

  const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
          if (entry.isIntersecting) {
              entry.target.classList.add("active");
          }
      });
  }, { threshold: 0.1 });

  scrollElements.forEach(el => observer.observe(el));
});



