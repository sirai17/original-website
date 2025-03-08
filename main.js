


document.addEventListener("DOMContentLoaded", function () {
    window.addEventListener("scroll", function () {
        let scrollTop = document.documentElement.scrollTop;
        let header = document.getElementById("header");

        if (scrollTop > 120) {
            header.style.height = "90px";
            header.style.background = "rgba(245, 245, 245,0.8)";
            // header.style.background = "rgba(255, 255, 255, 0.8)";
        } else {
            header.style.height = "120px";
            header.style.background = "rgba(255, 255, 255, 1)";
        }
    });
});
  

// overlay-script.js
document.addEventListener('DOMContentLoaded', () => {
    const hamburger = document.querySelector('.hamburger-overlay');
    const nav = document.querySelector('.nav-overlay');
    
    hamburger.addEventListener('click', () => {
      hamburger.classList.toggle('active');
      nav.classList.toggle('active');
      
      const isOpen = hamburger.classList.contains('active');
      hamburger.setAttribute('aria-expanded', isOpen);
      nav.setAttribute('aria-hidden', !isOpen);
      
      // メニューオープン時に背景スクロールを防止
      document.body.style.overflow = isOpen ? 'hidden' : '';
    });
    
    // ESCキーでメニューを閉じる
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && nav.classList.contains('active')) {
        hamburger.classList.remove('active');
        nav.classList.remove('active');
        hamburger.setAttribute('aria-expanded', false);
        nav.setAttribute('aria-hidden', true);
        document.body.style.overflow = '';
      }
    });
  });


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

// document.addEventListener("DOMContentLoaded", function () {
//     const target = document.querySelector(".home-what-content");
  
//     function handleScroll() {
//       const rect = target.getBoundingClientRect();
//       const windowHeight = window.innerHeight;
  
//       if (rect.top < windowHeight * 0.8) { // 80% 画面内に入ったら発火
//         target.classList.add("home-what-content-in");
//       }
//     }
  
//     window.addEventListener("scroll", handleScroll);
//     handleScroll(); // ページ読み込み時にも実行
//   });

document.addEventListener("DOMContentLoaded", function () {
    const fadeElement = document.querySelector(".home-what-content");

    function handleScroll() {
        const rect = fadeElement.getBoundingClientRect();
        const windowHeight = window.innerHeight;

        if (rect.top < windowHeight * 0.8) { // 80% 画面に入ったら発火
            fadeElement.classList.add("active");
        }
    }

    window.addEventListener("scroll", handleScroll);
    handleScroll(); // 初回チェック（ロード時）
});
