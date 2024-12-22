'use strict';

class Slider {
    constructor(container, autoplay = false, slidesToShow = 1, showDots = true, showNumbers = true) {
        this.container = container;
        this.items = [...container.querySelectorAll('.slider__item')];
        this.buttonsContainer = container.querySelector('.slider__controls')
        this.prevButton = container.querySelector('.slider__button--prev');
        this.nextButton = container.querySelector('.slider__button--next');
        this.dotsContainer = container.querySelector('.slider__pagination-dots');
        this.numbersContainer = container.querySelector('.slider__pagination-numbers');
        this.currentIndex = 0;
        this.autoplay = autoplay;
        this.autoplayInterval = null;
        this.gap = 20;
        this.slidesToShowInitial = !slidesToShow ? 0 : (window.innerWidth >= 1250 ? slidesToShow : 1);
        this.showDots = showDots;
        this.showNumbers = showNumbers;
        this.init();
    }

    init() {
        this.slider = this.container.querySelector('.slider');
        this.handleResize();
        window.addEventListener('resize', () => this.handleResize());
        this.addListeners();
        if (this.autoplay) {
            this.startAutoplay();
        }
    }


    handleResize() {
        this.slidesToShow = window.innerWidth >= 1250 ? this.slidesToShowInitial : 1;
        this.itemWidth = this.container.offsetWidth / this.slidesToShow;
        if (this.slidesToShowInitial || window.innerWidth < 1250) {
            this.items.forEach(item => {
                item.style.width = `${this.itemWidth}px`;
            });
        } else {
            this.items.forEach(item => {
                item.style.width = '';
            });
            this.slider.style.transform = '';
        }
        this.updateSlider();
        this.updateButtons();
    }

    updateSlider() {
        const translateX = -this.currentIndex * (this.itemWidth + this.gap);
        this.slider.style.transform = `translateX(${translateX}px)`;
        this.updatePagination();
    }

    updatePagination() {
        if (this.showDots) {
            this.dotsContainer.innerHTML = '';
            this.items.forEach((item, index) => {
                const dot = document.createElement('span');
                dot.classList.add('slider__pagination-dot');
                dot.dataset.slideIndex = index;
                if (index === this.currentIndex) {
                    dot.classList.add('active');
                }
                this.dotsContainer.appendChild(dot);
            });
        }
        if (this.showNumbers) {
            this.numbersContainer.textContent = `${this.currentIndex + 1}/${this.items.length}`;
        }
    }

    updateButtons() {
        this.prevButton.disabled = !this.autoplay && this.currentIndex === 0;
        this.nextButton.disabled = !this.autoplay && this.currentIndex === this.items.length - 1;
    }

    addListeners() {
        this.prevButton.addEventListener('click', () => this.prevSlide());
        this.nextButton.addEventListener('click', () => this.nextSlide());
        if (this.showDots) {
            this.dotsContainer.addEventListener('click', (event) => this.handleDotClick(event));
        }

        if (this.autoplay) {
            this.buttonsContainer.addEventListener('mouseleave', () => this.startAutoplay());
            this.buttonsContainer.addEventListener('mouseenter', () => this.stopAutoplay());
        }
    }

    prevSlide() {
        this.currentIndex = (this.currentIndex - 1 + this.items.length) % this.items.length;
        this.updateSlider();
        this.updateButtons();
    }

    nextSlide() {
        this.currentIndex = (this.currentIndex + 1) % this.items.length;
        this.updateSlider();
        this.updateButtons();
    }

    handleDotClick(event) {
        if (event.target.classList.contains('slider__pagination-dot')) {
            this.currentIndex = parseInt(event.target.dataset.slideIndex, 10);
            this.updateSlider();
            this.updateButtons();
        }
    }

    startAutoplay() {
        if (!this.autoplayInterval) {
            this.autoplayInterval = setInterval(() => this.nextSlide(), 4000);
        }
    }

    stopAutoplay() {
        clearInterval(this.autoplayInterval);
        this.autoplayInterval = null;
    }
}

const sliderContainers = document.querySelectorAll('.slider-container');
sliderContainers.forEach(container => {
    const slidesToShow = parseInt(container.dataset.slidesToShow, 10);
    const showDots = container.dataset.showDots !== 'false';
    const showNumbers = container.dataset.showNumbers !== 'false';
    new Slider(container, container.dataset.sliderType === 'auto', slidesToShow, showDots, showNumbers);
});


class SmoothScroll {
    constructor() {
        this.links = document.querySelectorAll('a[href^="#"]');
        this.init();
    }

    init() {
        this.addListeners();
    }

    addListeners() {
        this.links.forEach(link => {
            link.addEventListener('click', (event) => this.handleClick(event));
        });
    }

    handleClick(event) {
        event.preventDefault();
        const link = event.target.closest('a');
        const href = link.getAttribute('href');

        if (href.length > 2) {
            const targetElement = document.querySelector(href);
            targetElement.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    }
}

new SmoothScroll();