let isSwiperActive = true;

function initSwiperLogic() {
    const track = document.querySelector('.carousel__track');
    if (!track) return null;

    const prevBtn = document.querySelector('.carousel__btn--prev');
    const nextBtn = document.querySelector('.carousel__btn--next');
    const progressFill = document.querySelector('.carousel__progress-fill');

    const swiper = new Swiper(track, {
        slidesPerView: 'auto',
        spaceBetween: 30,
        speed: 600,
        grabCursor: true,
        watchSlidesProgress: true,
        on: {
            afterInit(swiper) {
                updateUI(swiper);
                updateProgress(swiper);
            },
            progress(swiper) {
                if (!isSwiperActive) return;
                updateProgress(swiper);
            },
            slideChange(swiper) {
                if (!isSwiperActive) return;
                updateUI(swiper);
            },
            resize(swiper) {
                if (!isSwiperActive) return;
                updateUI(swiper);
                updateProgress(swiper);
            }
        }
    });

    function updateProgress(swiper) {
        if (!progressFill) return;
        progressFill.style.width = `${swiper.progress * 100}%`;
    }

    function updateUI(swiper) {
        if (!prevBtn || !nextBtn) return;

        prevBtn.classList.toggle('active', !swiper.isBeginning);
        nextBtn.classList.toggle('active', !swiper.isEnd);

        prevBtn.setAttribute('aria-disabled', swiper.isBeginning);
        nextBtn.setAttribute('aria-disabled', swiper.isEnd);
    }

    prevBtn?.addEventListener('click', () => {
        if (!isSwiperActive) return;
        swiper.slidePrev();
    });

    nextBtn?.addEventListener('click', () => {
        if (!isSwiperActive) return;
        swiper.slideNext();
    });

    return swiper;
}

class ModalDialog {
    constructor(modalId) {
        this.modal = document.getElementById(modalId);
        this.form = this.modal.querySelector('#contactForm');
        this.init();
    }

    init() {
        const openButtons = document.querySelectorAll('.hero__link');
        if (openButtons.length) {
            openButtons.forEach(button => {
                button.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.open();
                });
            });
        }

        const closeButton = this.modal.querySelector('[data-close-modal]');
        if (closeButton) {
            closeButton.addEventListener('click', () => this.close());
        }

        this.modal.addEventListener('click', (e) => {
            if (e.target === this.modal) {
                this.close();
            }
        });

        if (this.form) {
            this.form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleFormSubmit();
            });
        }
    }

    open() {
        this.modal.classList.add('open');
        this.modal.classList.remove('closing'); // на случай, если был закрыт недавно
        this.modal.showModal();

        const firstInput = this.modal.querySelector('input');
        if (firstInput) {
            setTimeout(() => firstInput.focus(), 100);
        }
    }

    close() {
        // добавляем класс closing для анимации
        this.modal.classList.add('closing');

        // ждём окончания анимации (300мс) и только потом закрываем
        setTimeout(() => {
            this.modal.classList.remove('open', 'closing');
            if (typeof this.modal.close === 'function') {
                this.modal.close(); // закрываем диалог
            }
        }, 300); // должно совпадать с длительностью анимации в CSS
    }

    handleFormSubmit() {
        const formData = new FormData(this.form);
        const data = Object.fromEntries(formData);

        if (!data.name || !data.telegram || !data.privacy) {
            alert('Пожалуйста, заполните все обязательные поля');
            return;
        }

        console.log('Данные формы:', data);
        alert('Спасибо! Мы свяжемся с вами в Telegram в ближайшее время.');
        this.close();
        this.form.reset();
    }
}


// Инициализация при загрузке
document.addEventListener('DOMContentLoaded', () => {
    window.swiper = initSwiperLogic();

    const modalElement = document.getElementById('contactModal');
    if (modalElement) {
        window.contactModal = new ModalDialog('contactModal');
    }

    const tabButtons = document.querySelectorAll('[data-tab]');
    const heroInfo = document.querySelector('.hero__info');
    const heroInfoModal = document.querySelector('.hero__info-modal');
    const carouselTrack = document.querySelector('.carousel__track');
    const carouselTrackModal = document.querySelector('.carousel__track-modal');
    const prevBtn = document.querySelector('.carousel__btn--prev');
    const nextBtn = document.querySelector('.carousel__btn--next');
    const progressFill = document.querySelector('.carousel__progress-fill');

    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const tabName = button.dataset.tab;

            // скрываем всё
            heroInfo?.classList.remove('active');
            heroInfoModal?.classList.remove('active');
            carouselTrack?.classList.remove('active');
            carouselTrackModal?.classList.remove('active');

            tabButtons.forEach(btn => {
                btn.classList.remove('active');
                btn.classList.add('gallery__nav-btn--secondary');
            });

            button.classList.add('active');
            button.classList.remove('gallery__nav-btn--secondary');

            if (tabName === 'infographic') {
                isSwiperActive = true;

                heroInfo?.classList.add('active');
                carouselTrack?.classList.add('active');

                if (window.swiper && !window.swiper.destroyed) {
                    window.swiper.update();

                    // ❗ ВОЗВРАЩАЕМ СОСТОЯНИЕ КНОПОК ВРУЧНУЮ
                    const prevBtn = document.querySelector('.carousel__btn--prev');
                    const nextBtn = document.querySelector('.carousel__btn--next');

                    const atStart = window.swiper.isBeginning;
                    const atEnd = window.swiper.isEnd;

                    prevBtn?.classList.toggle('active', !atStart);
                    nextBtn?.classList.toggle('active', !atEnd);
                }
            }

            if (tabName === '3d') {
                isSwiperActive = false;

                heroInfoModal?.classList.add('active');
                carouselTrackModal?.classList.add('active');

                // прогресс на 100%
                const progressFill = document.querySelector('.carousel__progress-fill');
                if (progressFill) progressFill.style.width = '100%';

                // ❗ визуально отключаем кнопки
                const prevBtn = document.querySelector('.carousel__btn--prev');
                const nextBtn = document.querySelector('.carousel__btn--next');

                prevBtn?.classList.remove('active');
                nextBtn?.classList.remove('active');
            }
        });
    });
});

document.addEventListener('DOMContentLoaded', () => {
    const hero = document.querySelector('.hero');
    const gallery = document.querySelector('.gallery');
    const track = document.querySelector('.carousel__track');
    const backBtn = document.querySelector('.carousel__back-btn');
    const originalGroups = Array.from(track.querySelectorAll('.carousel__group'));
    const originalSlides = Array.from(track.querySelectorAll('.swiper-slide[data-index]'));

    // Слушаем клик по caption
    document.querySelectorAll('.carousel__caption').forEach(caption => {
        caption.addEventListener('click', () => {
            // 1️⃣ Убираем hero__info и hero__footer
            hero.classList.add('hero--hidden');
            gallery.classList.add('gallery--hidden');

            // 2️⃣ Показываем кнопку "Вернуться назад"
            backBtn.classList.add('active');

            // 3️⃣ Подготавливаем слайдер выбранного проекта
            const wrapper = track.querySelector('.swiper-wrapper');
            wrapper.innerHTML = ''; // очищаем track

            for (let i = 0; i < 6; i++) {
                // клонируем только .carousel__group и оборачиваем в новый slide
                const groupClone = originalGroups[i % originalGroups.length].cloneNode(true);
                const slide = document.createElement('div');
                slide.className = 'swiper-slide';
                slide.appendChild(groupClone);
                wrapper.appendChild(slide);
            }

            // 4️⃣ Активируем track и пересоздаём swiper
            track.classList.add('active');
            if (window.swiper && !window.swiper.destroyed) {
                window.swiper.destroy(true, true);
            }
            window.swiper = initSwiperLogic();
        });
    });

    // Кнопка "Вернуться назад"
    backBtn.addEventListener('click', () => {
        // 1️⃣ Возвращаем hero
        hero.classList.remove('hero--hidden');
        gallery.classList.remove('gallery--hidden');

        // 2️⃣ Скрываем кнопку "Вернуться назад"
        backBtn.classList.remove('active');

        // 3️⃣ Восстанавливаем исходные слайды
        const wrapper = track.querySelector('.swiper-wrapper');
        wrapper.innerHTML = '';
        originalSlides.forEach(slide => wrapper.appendChild(slide));

        // 4️⃣ Пересоздаём swiper
        if (window.swiper && !window.swiper.destroyed) {
            window.swiper.destroy(true, true);
        }
        window.swiper = initSwiperLogic();
    });
});
