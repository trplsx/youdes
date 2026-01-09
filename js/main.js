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
        }, 300);
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

    // Кэшируем все DOM элементы один раз
    const elements = {
        logoBtn: document.querySelector('.logo'),
        gallery: document.querySelector('.gallery'),
        backBtn: document.querySelector('.carousel__back-btn'),
        hero: document.querySelector('.hero'),
        track: document.querySelector('.carousel__track'),
        tabButtons: document.querySelectorAll('[data-tab]'),
        heroWrapper: document.querySelector('.hero__wrapper'),
        heroWrapperModal: document.querySelector('.hero__wrapper-modal'),
        heroInfo: document.querySelector('.hero__info'),
        heroInfoModal: document.querySelector('.hero__info-modal'),
        carouselTrack: document.querySelector('.carousel__track'),
        carouselTrackModal: document.querySelector('.carousel__track-modal'),
        progressFill: document.querySelector('.carousel__progress-fill'),
        prevBtn: document.querySelector('.carousel__btn--prev'),
        nextBtn: document.querySelector('.carousel__btn--next'),
        captions: document.querySelectorAll('.carousel__caption')
    };

    // Сохраняем оригинальные элементы один раз при загрузке
    let originalGroups = [];
    let originalSlides = [];

    // Флаг для отслеживания, открыты ли проекты
    let isProjectOpen = false;

    const saveOriginalElements = () => {
        if (elements.track) {
            originalGroups = Array.from(elements.track.querySelectorAll('.carousel__group'));
            originalSlides = Array.from(elements.track.querySelectorAll('.swiper-slide[data-index]'));
        }
    };

    const restoreOriginalSlides = () => {
        const wrapper = elements.track?.querySelector('.swiper-wrapper');
        if (wrapper && originalSlides.length > 0) {
            wrapper.innerHTML = '';
            originalSlides.forEach(slide => {
                const slideClone = slide.cloneNode(true);
                wrapper.appendChild(slideClone);
            });

            // После восстановления слайдов нужно повторно навесить обработчики на captions
            setupCaptionsListeners();
        }
    };

    // Функция для навешивания обработчиков на captions
    const setupCaptionsListeners = () => {
        // Удаляем старые обработчики (если есть)
        const existingCaptions = document.querySelectorAll('.carousel__caption');
        existingCaptions.forEach(caption => {
            const newCaption = caption.cloneNode(true); // Клонируем без обработчиков
            caption.parentNode.replaceChild(newCaption, caption);
        });

        // Навешиваем новые обработчики
        const freshCaptions = document.querySelectorAll('.carousel__caption');
        freshCaptions.forEach(caption => {
            caption.addEventListener('click', handleCaptionClick);
        });

        // Обновляем кэшированные элементы
        elements.captions = freshCaptions;
    };

    // Обработчик клика по caption
    const handleCaptionClick = () => {
        // Устанавливаем флаг, что проект открыт
        isProjectOpen = true;

        // Обновляем оригинальные элементы перед открытием проекта
        saveOriginalElements();

        // 1️⃣ Убираем hero__info и hero__footer
        elements.hero?.classList.add('hero--hidden');
        elements.gallery?.classList.add('gallery--hidden');

        // 2️⃣ Показываем кнопку "Вернуться назад"
        elements.backBtn?.classList.add('active');

        // 3️⃣ Подготавливаем слайдер выбранного проекта
        const wrapper = elements.track?.querySelector('.swiper-wrapper');
        if (wrapper) {
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
            // Добавляем специальный класс для отображения при открытом проекте
            elements.track?.classList.add('project-open');
            elements.track?.classList.add('active');
            recreateSwiper();
        }
    };

    // Инициализируем оригинальные элементы и навешиваем обработчики
    saveOriginalElements();
    setupCaptionsListeners();

    // Вспомогательные функции
    const updateNavigationButtons = (swiper) => {
        if (!swiper || swiper.destroyed || !elements.prevBtn || !elements.nextBtn) return;

        const atStart = swiper.isBeginning;
        const atEnd = swiper.isEnd;

        elements.prevBtn.classList.toggle('active', !atStart);
        elements.nextBtn.classList.toggle('active', !atEnd);
    };

    const recreateSwiper = (restoreOriginal = false) => {
        if (window.swiper && !window.swiper.destroyed) {
            window.swiper.destroy(true, true);
        }

        if (restoreOriginal) {
            restoreOriginalSlides();
        }

        window.swiper = initSwiperLogic();

        // После создания нового swiper обновляем кнопки навигации
        if (window.swiper && !window.swiper.destroyed) {
            updateNavigationButtons(window.swiper);
        }
    };

    const resetCommonState = (restoreSlides = true) => {
        elements.gallery?.classList.remove('gallery--hidden');
        elements.backBtn?.classList.remove('active');
        elements.hero?.classList.remove('hero--hidden');

        if (restoreSlides) {
            restoreOriginalSlides();
        }
    };

    // Функция активации вкладки инфографики
    const activateInfographicTab = () => {
        // Сбрасываем флаг проекта
        isProjectOpen = false;

        elements.track?.classList.remove('project-open');

        // Скрываем все элементы вкладок
        const tabElements = [
            elements.heroInfo, elements.heroInfoModal,
            elements.heroWrapper, elements.heroWrapperModal,
            elements.carouselTrack, elements.carouselTrackModal
        ];

        tabElements.forEach(el => el?.classList.remove('active'));

        // Находим кнопку инфографики и делаем ее активной
        const infographicButton = Array.from(elements.tabButtons).find(btn => btn.dataset.tab === 'infographic');

        // Снимаем active со всех кнопок
        elements.tabButtons.forEach(btn => {
            btn.classList.remove('active');
            btn.classList.add('gallery__nav-btn--secondary');
        });

        // Делаем инфографику активной
        if (infographicButton) {
            infographicButton.classList.add('active');
            infographicButton.classList.remove('gallery__nav-btn--secondary');
        }

        // Сбрасываем общее состояние и восстанавливаем оригинальные слайды
        resetCommonState(true);

        isSwiperActive = true;

        elements.heroInfo?.classList.add('active');
        elements.heroWrapper?.classList.add('active');
        elements.carouselTrack?.classList.add('active');

        // Пересоздаём swiper с восстановлением слайдов
        recreateSwiper(true);
    };

    // Обработчик переключения вкладок
    elements.tabButtons?.forEach(button => {
        button.addEventListener('click', () => {
            const tabName = button.dataset.tab;

            // Скрываем все элементы вкладок
            const tabElements = [
                elements.heroInfo, elements.heroInfoModal,
                elements.heroWrapper, elements.heroWrapperModal,
                elements.carouselTrack, elements.carouselTrackModal
            ];

            tabElements.forEach(el => el?.classList.remove('active'));

            // Обновляем кнопки вкладок
            elements.tabButtons.forEach(btn => {
                btn.classList.remove('active');
                btn.classList.add('gallery__nav-btn--secondary');
            });

            button.classList.add('active');
            button.classList.remove('gallery__nav-btn--secondary');

            // Убираем кнопку "Назад" при любом переключении вкладок
            setTimeout(() => {
                elements.backBtn?.classList.remove('active');
            }, 300)


            if (tabName === 'infographic') {
                // Сбрасываем флаг проекта
                isProjectOpen = false;

                elements.track?.classList.remove('project-open');

                // Сбрасываем общее состояние и восстанавливаем оригинальные слайды
                resetCommonState(true);

                isSwiperActive = true;

                elements.heroInfo?.classList.add('active');
                elements.heroWrapper?.classList.add('active');
                elements.carouselTrack?.classList.add('active');

                // Пересоздаём swiper с восстановлением слайдов
                recreateSwiper(true);

            } else if (tabName === '3d') {
                // Если проект был открыт, сначала анимация, потом сброс состояния
                if (isProjectOpen) {
                    // Добавляем класс для анимации fade-out
                    elements.carouselTrack?.classList.add('fade-out');

                    // Ждем завершения анимации (300мс)
                    setTimeout(() => {
                        // Убираем класс active после анимации
                        elements.carouselTrack?.classList.remove('active');
                        // Убираем класс fade-out
                        setTimeout(() => {
                            elements.carouselTrack?.classList.remove('fade-out');
                        }, 10);

                        // После завершения анимации opacity
                        isSwiperActive = false;

                        elements.heroInfoModal?.classList.add('active');
                        elements.heroWrapperModal?.classList.add('active');
                        elements.carouselTrackModal?.classList.add('active');

                        // Сбрасываем флаг проекта
                        isProjectOpen = false;

                        if (elements.progressFill) {
                            elements.progressFill.style.width = '100%';
                        }

                        // Только теперь убираем gallery--hidden
                        elements.gallery?.classList.remove('gallery--hidden');
                        elements.hero?.classList.remove('hero--hidden');
                    }, 300); // Длительность анимации
                } else {
                    // Если проект не был открыт, переключаемся сразу
                    resetCommonState(true); // Сбрасываем состояние сразу

                    isSwiperActive = false;

                    elements.heroInfoModal?.classList.add('active');
                    elements.heroWrapperModal?.classList.add('active');
                    elements.carouselTrackModal?.classList.add('active');

                    if (elements.progressFill) {
                        elements.progressFill.style.width = '100%';
                    }
                }

                // Прогресс на 100%


                // Отключаем кнопки навигации
                elements.prevBtn?.classList.remove('active');
                elements.nextBtn?.classList.remove('active');
            }
        });
    });

    // Обработчик для логотипа (выполняет функцию инфографики без класса active на лого)
    elements.logoBtn?.addEventListener('click', () => {
        activateInfographicTab();
    });

    // Обработчик кнопки "Вернуться назад"
    elements.backBtn?.addEventListener('click', () => {
        // Сбрасываем флаг проекта
        isProjectOpen = false;

        // 1️⃣ Возвращаем hero
        elements.hero?.classList.remove('hero--hidden');
        elements.gallery?.classList.remove('gallery--hidden');

        // 2️⃣ Скрываем кнопку "Вернуться назад"
        elements.backBtn?.classList.remove('active');

        // 3️⃣ Убираем класс project-open
        elements.track?.classList.remove('project-open');

        // 4️⃣ Восстанавливаем исходные слайды с обработчиками
        restoreOriginalSlides();
    });
});
