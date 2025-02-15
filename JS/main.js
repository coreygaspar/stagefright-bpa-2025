/*   Mobile Nav Code                   */

const menuOpenBtn = document.getElementById('menubtn');
const menuCloseBtn = document.getElementById('closebtn');
const menu = document.querySelector('.mobile-menu');


let ani = true;

document.addEventListener('DOMContentLoaded', function() {
    
} );

function openMenu() {
    menu.style.animation ='slideIn 500ms ease-in-out forwards';
    menu.style.display = 'flex';
    console.log('click');
}

function closeMenu(ani) {
    console.log(ani);
    if(ani){
        menu.style.animation = 'slideOut 500ms ease-in-out forwards';
        setTimeout(() => {
            menu.style.display = 'none';
        }, 500);
        
    } else {
        menu.style.display = 'none';
    }
    
}

if (menuOpenBtn) {
    menuOpenBtn.addEventListener('click', openMenu);
}
else if (menuCloseBtn) {
    menuCloseBtn.addEventListener('click', closeMenu);
}
const drops = document.getElementsByClassName('m-drop');
const arrows = document.getElementsByClassName('dropArrow');

function openDrop(menuIndex) {
    if (drops[menuIndex].style.display === 'flex') {
        drops[menuIndex].style.display = 'none';
        arrows[menuIndex].style.animation = 'spinDown 300ms forwards ease-in-out';
    } else {
        drops[menuIndex].style.display = 'flex';
        arrows[menuIndex].style.animation = 'spinUp 300ms forwards ease-in-out';
    }
}


/* ------------ Scroll to top button ------------ */
window.addEventListener('scroll', () => {
    const scrollTop = window.scrollY; 

    if (scrollTop >= 150){
        revealScrollToTopButton();
    }
    else if (scrollTop < 150){
        hideScrollToTopButton();
    }
});

function revealScrollToTopButton(){
    const scrollToTopButton = document.getElementById("backtotop");
    scrollToTopButton.style.opacity = "1";
}

function hideScrollToTopButton() {
    const scrollToTopButton = document.getElementById("backtotop");
    scrollToTopButton.style.opacity = "0";
}

function scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
}
const scrollButton = document.getElementById("scrollbutton");
const historySection = document.getElementById("history");
const gallerySection = document.getElementById("gallery");

function scrollDownToHistory() {
    historySection.scrollIntoView({behavior: "smooth"});
}

function scrollDownToGallery(){
    gallerySection.scrollIntoView({behavior: "smooth"});
}

/* Tour timer function */

let dateList = [
    new Date("March 12, 2025 10:00:00"),
    new Date("March 14, 2025 10:00:00"),
    new Date("March 15, 2025 10:00:00"),
    new Date("March 17, 2025 10:00:00"),
    new Date("March 19, 2025 10:00:00"),
    new Date("March 23, 2025 10:00:00"),
    new Date("March 26, 2025 10:00:00"),
    new Date("March 28, 2025 10:00:00"),
    new Date("April 1, 2025 10:00:00"),
    new Date("April 3, 2025 10:00:00"),
    new Date("April 5, 2025 10:00:00"),
    new Date("April 7, 2025 10:00:00"),
    new Date("April 10, 2025 10:00:00"),
]

let targetDate = dateList[0];
let currentTime = Date.now();
if (currentTime > targetDate.getTime()){
    for (let i = 0; i < dateList.length; i++) {
        if (currentTime <= dateList[i].getTime()) {
          targetDate = dateList[i];
          break;
        }
      }
      if (currentTime > dateList[dateList.length - 1].getTime()) {
        targetDate = dateList[0]; // Reset to the first date if all have passed
      }
}


function updateCountdown() {
    const now = new Date().getTime();
    const timeLeft = targetDate - now;

    const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
    const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);

    document.getElementById("countdown").innerHTML = 
        `${days}d ${hours}h ${minutes}m ${seconds}s`;
}

// Update countdown every second
setInterval(updateCountdown, 1000);

// Initial call so remove 1 second delay
updateCountdown();


