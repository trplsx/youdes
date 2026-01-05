class Carousel {
    constructor(element) {
        this.carousel = element;
        this.track = this.carousel.querySelector('.carousel__track');
        this.slides = Array.from(this.track.querySelectorAll('.carousel__slide'));
        this.prevBtn = this.carousel.querySelector('.carousel__btn--prev');
        this.nextBtn = this.carousel.querySelector('.carousel__btn--next');
        this.progressFill = this.carousel.querySelector('.carousel__progress-fill');

        this.currentIndex = 0;
        this.slideWidth = this.slides[0].offsetWidth;
        this.gap = 30;
        this.totalWidth = this.slideWidth + this.gap;

        this.isDragging = false;
        this.startPos = 0;
        this.currentTranslate = 0;
        this.prevTranslate = 0;
        this.animationID = null;

        this.init();
    }

    init() {
        this.updateCarousel();
        this.addEventListeners();
        this.updateSlideDimensions();
        this.updateArrows();
    }

    updateSlideDimensions() {
        this.slideWidth = this.slides[0].offsetWidth;
        this.totalWidth = this.slideWidth + this.gap;
        this.updateCarousel();
    }

    updateProgressBar() {
        const progress = (this.currentIndex / (this.slides.length - 1)) * 100;
        this.progressFill.style.width = `${progress}%`;
        this.progressFill.parentElement.setAttribute('aria-valuenow', progress);
    }

    updateArrows() {
        if (this.currentIndex === 0) {
            this.prevBtn.classList.remove('active');
            this.nextBtn.classList.add('active');
        } else if (this.currentIndex === this.slides.length - 1) {
            this.prevBtn.classList.add('active');
            this.nextBtn.classList.remove('active');
        } else {
            this.prevBtn.classList.add('active');
            this.nextBtn.classList.add('active');
        }

        this.prevBtn.setAttribute('aria-disabled', this.currentIndex === 0);
        this.nextBtn.setAttribute('aria-disabled', this.currentIndex === this.slides.length - 1);
    }

    updateCarousel() {
        const translateX = -this.currentIndex * this.totalWidth;
        this.track.style.transform = `translateX(${translateX}px)`;
        this.updateProgressBar();
        this.updateArrows();
    }

    goToSlide(index) {
        if (index < 0) index = this.slides.length - 1;
        if (index >= this.slides.length) index = 0;

        this.currentIndex = index;
        this.updateCarousel();
    }

    nextSlide() {
        if (this.currentIndex < this.slides.length - 1) {
            this.goToSlide(this.currentIndex + 1);
        }
    }

    prevSlide() {
        if (this.currentIndex > 0) {
            this.goToSlide(this.currentIndex - 1);
        }
    }

    getPositionX(event) {
        return event.type.includes('mouse') ? event.pageX : event.touches[0].clientX;
    }

    startDrag(event) {
        event.preventDefault();
        this.isDragging = true;
        this.startPos = this.getPositionX(event);
        this.track.classList.add('dragging');
        this.track.style.transition = 'none';

        this.animationID = requestAnimationFrame(this.animation.bind(this));

        document.addEventListener('mousemove', this.dragMove.bind(this));
        document.addEventListener('mouseup', this.endDrag.bind(this));
        document.addEventListener('touchmove', this.dragMove.bind(this), { passive: false });
        document.addEventListener('touchend', this.endDrag.bind(this));
    }

    dragMove(event) {
        if (!this.isDragging) return;

        event.preventDefault();
        const currentPosition = this.getPositionX(event);
        const diff = currentPosition - this.startPos;
        this.currentTranslate = this.prevTranslate + diff;
    }

    animation() {
        if (this.isDragging) {
            this.setTrackPosition();
            this.updateProgressDuringDrag();
            requestAnimationFrame(this.animation.bind(this));
        }
    }

    setTrackPosition() {
        const translateX = -this.currentIndex * this.totalWidth + this.currentTranslate;
        this.track.style.transform = `translateX(${translateX}px)`;
    }

    updateProgressDuringDrag() {
        const dragProgress = (-this.currentTranslate / (this.slides.length * this.totalWidth)) * 100;
        const totalProgress = (this.currentIndex / (this.slides.length - 1)) * 100 + (dragProgress / (this.slides.length - 1));

        const clampedProgress = Math.max(0, Math.min(100, totalProgress));
        this.progressFill.style.width = `${clampedProgress}%`;

        this.updateArrowsDuringDrag();
    }

    updateArrowsDuringDrag() {
        const tempIndex = this.currentIndex - Math.round(this.currentTranslate / this.totalWidth);

        if (tempIndex <= 0) {
            this.prevBtn.classList.remove('active');
            this.nextBtn.classList.add('active');
        } else if (tempIndex >= this.slides.length - 1) {
            this.prevBtn.classList.add('active');
            this.nextBtn.classList.remove('active');
        } else {
            this.prevBtn.classList.add('active');
            this.nextBtn.classList.add('active');
        }
    }

    endDrag() {
        if (!this.isDragging) return;

        this.isDragging = false;
        this.track.classList.remove('dragging');
        this.track.style.transition = 'transform 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)';

        document.removeEventListener('mousemove', this.dragMove.bind(this));
        document.removeEventListener('mouseup', this.endDrag.bind(this));
        document.removeEventListener('touchmove', this.dragMove.bind(this));
        document.removeEventListener('touchend', this.endDrag.bind(this));

        cancelAnimationFrame(this.animationID);

        const movedBy = this.currentTranslate;
        const threshold = this.slideWidth / 4;

        if (movedBy < -threshold && this.currentIndex < this.slides.length - 1) {
            this.currentIndex += 1;
        } else if (movedBy > threshold && this.currentIndex > 0) {
            this.currentIndex -= 1;
        }

        this.currentTranslate = 0;
        this.prevTranslate = 0;
        this.updateCarousel();
    }

    addEventListeners() {
        this.prevBtn.addEventListener('click', () => this.prevSlide());
        this.nextBtn.addEventListener('click', () => this.nextSlide());

        this.track.addEventListener('mousedown', (e) => this.startDrag(e));
        this.track.addEventListener('touchstart', (e) => this.startDrag(e), { passive: false });

        this.track.addEventListener('contextmenu', (e) => {
            if (this.isDragging) e.preventDefault();
        });

        let resizeTimeout;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                this.updateSlideDimensions();
            }, 250);
        });

        document.addEventListener('keydown', (e) => {
            const isCarouselFocused = this.carousel.contains(document.activeElement) ||
                document.activeElement === document.body;

            if (isCarouselFocused && !this.isDragging) {
                if (e.key === 'ArrowLeft') {
                    e.preventDefault();
                    this.prevSlide();
                }
                if (e.key === 'ArrowRight') {
                    e.preventDefault();
                    this.nextSlide();
                }
            }
        });
    }

    startAutoSlide(interval = 5000) {
        this.autoSlideInterval = setInterval(() => {
            if (!this.isDragging) {
                this.nextSlide();
            }
        }, interval);
    }

    stopAutoSlide() {
        if (this.autoSlideInterval) {
            clearInterval(this.autoSlideInterval);
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const carouselElement = document.querySelector('.carousel');
    if (carouselElement) {
        window.carousel = new Carousel(carouselElement);
        carousel.startAutoSlide();
    }

    const tabButtons = document.querySelectorAll('[data-tab]');
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            tabButtons.forEach(btn => {
                btn.classList.remove('active');
                if (!btn.classList.contains('active')) {
                    btn.classList.add('gallery__nav-btn--secondary');
                }
            });

            button.classList.add('active');
            button.classList.remove('gallery__nav-btn--secondary');

            const tabName = button.getAttribute('data-tab');
            console.log(`Активный таб: ${tabName}`);
        });
    });


});

// Модальное окно с использованием dialog
class ModalDialog {
    constructor(modalId) {
        this.modal = document.getElementById(modalId);
        this.form = this.modal.querySelector('#contactForm');
        this.init();
    }

    init() {
        // Открытие модального окна по кнопке
        const openButton = document.querySelector('.hero__link');
        if (openButton) {
            openButton.addEventListener('click', (e) => {
                e.preventDefault();
                this.open();
            });
        }

        // Закрытие по кнопке закрытия
        const closeButton = this.modal.querySelector('[data-close-modal]');
        if (closeButton) {
            closeButton.addEventListener('click', () => this.close());
        }

        // Закрытие по клику на backdrop (только для dialog)
        this.modal.addEventListener('click', (e) => {
            if (e.target === this.modal) {
                this.close();
            }
        });

        // Обработка формы
        if (this.form) {
            this.form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleFormSubmit();
            });
        }

        // Закрытие по ESC обрабатывается автоматически dialog
    }

    open() {
        this.modal.showModal();
        // Фокус на первое поле
        const firstInput = this.modal.querySelector('input');
        if (firstInput) {
            setTimeout(() => firstInput.focus(), 100);
        }
    }

    close() {
        this.modal.close();
    }

    handleFormSubmit() {
        const formData = new FormData(this.form);
        const data = Object.fromEntries(formData);

        // Валидация
        if (!data.name || !data.telegram || !data.privacy) {
            alert('Пожалуйста, заполните все обязательные поля');
            return;
        }

        // Здесь можно отправить данные на сервер
        console.log('Данные формы:', data);

        // Показать сообщение об успехе
        alert('Спасибо! Мы свяжемся с вами в Telegram в ближайшее время.');

        // Закрыть модальное окно
        this.close();

        // Очистить форму
        this.form.reset();
    }
}

// Инициализация всего
document.addEventListener('DOMContentLoaded', () => {
    // Инициализация карусели
    const carouselElement = document.querySelector('.carousel');
    if (carouselElement) {
        window.carousel = new Carousel(carouselElement);
    }

    // Инициализация модального окна
    const modalElement = document.getElementById('contactModal');
    if (modalElement) {
        window.contactModal = new ModalDialog('contactModal');
    }

    // Обработка переключения табов
    const tabButtons = document.querySelectorAll('[data-tab]');
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            tabButtons.forEach(btn => {
                btn.classList.remove('active');
                if (!btn.classList.contains('active')) {
                    btn.classList.add('header__nav-btn--secondary');
                }
            });

            button.classList.add('active');
            button.classList.remove('header__nav-btn--secondary');

            const tabName = button.getAttribute('data-tab');
            console.log(`Активный таб: ${tabName}`);
        });
    });
});