document.addEventListener("DOMContentLoaded", function () {
    const hamburger = document.querySelector(".header__hamburger");
    const nav = document.querySelector(".header__nav");

    hamburger.addEventListener("click", function () {
        nav.classList.toggle("header__nav--open");
        hamburger.classList.toggle("open");
    });

    document.querySelectorAll(".header__nav-list a").forEach(link => {
        link.addEventListener("click", function () {
            nav.classList.remove("header__nav--open");
            hamburger.classList.remove("open");
        });
    });
});